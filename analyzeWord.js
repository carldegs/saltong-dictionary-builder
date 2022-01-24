import { nextTuesday, nextFriday, closestTo, min, max, format } from 'date-fns';
import {
  GROUPED_DICTIONARY_FILE,
  HEX_BLACKLIST_JSON,
  HEX_ROUND_LIST,
  ROOT_WORDS_FILE,
} from './constants.js';
import prompt from 'prompt';
import {
  getNextHexRound,
  getWordScore,
  isPangram,
  readFile,
  writeFile,
} from './utils.js';

const analyzeWord = async () => {
  prompt.start();
  const rootWord = process.argv.slice(2)[0];
  const centerLetter = process.argv.slice(2)[1];
  const startTime = Date.now();
  const groupedDict = await readFile(GROUPED_DICTIONARY_FILE, true);
  const rootWords = await readFile(ROOT_WORDS_FILE, true);
  const blacklist = await readFile(HEX_BLACKLIST_JSON, true);
  const hexRound = await readFile(HEX_ROUND_LIST, true);
  const rootWordId = rootWords.indexOf(rootWord);
  console.log(rootWord, centerLetter, rootWordId);

  let dict = [];
  Object.values(groupedDict).forEach((words) => {
    dict = [...dict, ...words];
  });

  dict = dict.filter((word) => !blacklist.includes(word));

  const constructedWords = dict
    .filter(
      (word) =>
        word.includes(centerLetter) &&
        Array.from(word).every((letter) => rootWord.indexOf(letter) >= 0)
    )
    .map((word, i) => [
      i,
      word,
      Array.from(new Set(word)).sort().join(''),
      getWordScore(word),
      isPangram(word) ? 'P' : '',
    ])
    .sort((a, b) => a[1] - b[1]);

  console.log(
    constructedWords
      .map((c) => `[${c[0]}]\t${c[1]}\t${c[2]}\t${c[3]}\t${c[4]}`)
      .join('\n')
  );

  const { addWord } = await prompt.get({
    properties: {
      addWord: {
        type: 'boolean',
        default: true,
      },
    },
  });

  if (!addWord) {
    return;
  }

  const { blacklist: blacklistIdxStr } = await prompt.get({
    properties: {
      blacklist: {
        type: 'string',
        default: '-1',
      },
    },
  });

  const blackListIdx = blacklistIdxStr.split(',').map((s) => Number(s));
  if (blackListIdx > -1) {
    const newBlacklistWords = blackListIdx.map((i) => constructedWords[i][1]);

    console.log('blacklisted words', newBlacklistWords);

    const finalBlacklistWords = Array.from(
      new Set([...blacklist, ...newBlacklistWords])
    ).sort();

    await writeFile(finalBlacklistWords, HEX_BLACKLIST_JSON);
  }

  const prevHexRoundDate = format(
    max(Object.keys(hexRound).map((date) => new Date(date))),
    'yyyy-MM-dd'
  );
  const prevHexRound = hexRound[prevHexRoundDate];

  const nextHexRoundDate = getNextHexRound(prevHexRoundDate);
  const newHexRound = {
    rootWordId,
    centerLetter,
    date: new Date(nextHexRoundDate).toISOString(),
    gameId: prevHexRound.gameId + 1,
  };

  await writeFile(
    {
      ...hexRound,
      [format(new Date(nextHexRoundDate), 'yyyy-MM-dd')]: newHexRound,
    },
    HEX_ROUND_LIST
  );

  const endTime = Date.now();
  console.log(`${((endTime - startTime) / 1000).toFixed(3)}s`);
};

analyzeWord();
