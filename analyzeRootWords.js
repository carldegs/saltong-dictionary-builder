import {
  GROUPED_DICTIONARY_FILE,
  HEX_ANALYSIS_DATA,
  HEX_BLACKLIST_JSON,
  HEX_ROUND_LIST,
  ROOT_WORDS_FILE,
} from './constants.js';
import { writeFile, readFile, isPangram } from './utils.js';

const getRootWordAnalysis = async () => {
  const startTime = Date.now();
  const groupedDict = await readFile(GROUPED_DICTIONARY_FILE, true);
  const rootWords = await readFile(ROOT_WORDS_FILE, true);
  const blacklist = await readFile(HEX_BLACKLIST_JSON, true);

  let dict = [];
  Object.values(groupedDict).forEach((words) => {
    dict = [...dict, ...words];
  });

  dict = dict.filter((word) => !blacklist.includes(word));

  let results = [];
  rootWords.forEach((rootWord, index) => {
    // Get all words that can be created using the root letters
    const constructedWords = dict.filter((word) =>
      Array.from(word).every((letter) => rootWord.indexOf(letter) >= 0)
    );

    let numWords = {};
    let numPangrams = {};

    rootWord.split('').forEach((rLetter) => {
      numWords = {
        ...numWords,
        [rLetter]: 0,
      };
      numPangrams = {
        ...numPangrams,
        [rLetter]: 0,
      };
    });

    constructedWords.forEach((cWord) => {
      const isPangramWord = isPangram(cWord);
      cWord.split('').forEach((cLetter) => {
        if (rootWord.includes(cLetter)) {
          numWords = {
            ...numWords,
            [cLetter]: numWords[cLetter] + 1,
          };

          if (isPangramWord) {
            numPangrams = {
              ...numPangrams,
              [cLetter]: numPangrams[cLetter] + 1,
            };
          }
        }
      });
    });

    const sortedWords = Object.entries(numWords).sort(
      ([letterA, numA], [letterB, numB]) => numA - numB
    );

    results = [
      ...results,
      {
        rootWord,
        numWords,
        numPangrams,
        totalNumWords: constructedWords.length,
        minNumWords: sortedWords[0][1],
        maxNumWords: sortedWords[sortedWords.length - 1][1],
        index,
      },
    ];
  });

  results = results.filter(
    ({ minNumWords, maxNumWords }) => minNumWords <= 70 && maxNumWords >= 30
  );

  const sortedResults = results.sort(
    ({ minNumWords: nA }, { minNumWords: nB }) => nA - nB
  );

  console.log(`${results.length} valid rootWords`);

  await writeFile(sortedResults, HEX_ANALYSIS_DATA);

  await writeFile(
    sortedResults.map(({ rootWord }) => rootWord),
    ROOT_WORDS_FILE
  );

  const endTime = Date.now();
  console.log(`${((endTime - startTime) / 1000).toFixed(3)}s`);
};

getRootWordAnalysis();
