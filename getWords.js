import { addDays, format } from 'date-fns';
import prompt from 'prompt';
import { GROUPED_DICTIONARY_FILE, SELECTED_WORDS_LIST } from './constants.js';
import { writeFile, readFile } from './utils.js';

function randomInteger(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function chunkArrayInGroups(arr, size) {
  let myArray = [];
  for (var i = 0; i < arr.length; i += size) {
    myArray = [...myArray, arr.slice(i, i + size)];
  }
  return myArray;
}

const generateRandomIntegers = (min, max, num) => {
  let arr = [];
  let iter = 0;
  while (arr.length < num && iter < num * 100) {
    arr = Array.from(new Set([...arr, randomInteger(min, max)]));
    iter++;
  }

  return arr;
};

const getWords = async () => {
  prompt.start();

  const groupedDict = await readFile(GROUPED_DICTIONARY_FILE, true);
  const initList = await readFile(SELECTED_WORDS_LIST, true);

  let usedWords = [];
  let lastDate = '';
  let lastId = -1;

  const initListArr = Object.entries(initList);
  initListArr.forEach(([date, { word, gameId }], i) => {
    usedWords = [...usedWords, word];
    if (i === initListArr.length - 1) {
      lastDate = date;
      lastId = gameId;
    }
  });

  const { wordLength, numWords, numOptions, startDate, startGameId } =
    await prompt.get({
      properties: {
        wordLength: {
          message: 'Word Length',
          required: true,
          default: usedWords?.length ? usedWords[0].length : 5,
          type: 'number',
        },
        numWords: {
          message: 'Number of words',
          required: true,
          default: 7,
          type: 'number',
        },
        numOptions: {
          message: 'Number of options per word',
          required: true,
          default: 10,
          type: 'number',
        },
        startDate: {
          default: lastDate
            ? format(addDays(new Date(lastDate), 1), 'yyyy-MM-dd')
            : format(new Date(), 'yyyy-MM-dd'),
          type: 'string',
          required: true,
        },
        startGameId: {
          required: true,
          type: 'number',
          default: lastId ? lastId + 1 : 1,
        },
      },
    });

  const dict = groupedDict[wordLength].filter(
    (word) => usedWords.indexOf(word) < 0
  );
  const words = generateRandomIntegers(
    0,
    dict.length,
    numWords * numOptions
  ).map((i) => dict[i]);
  const groupedWords = chunkArrayInGroups(words, numOptions);

  console.log('\n--- SELECT WORDS ---\n');
  let selectedWords = [];

  for (let i = 0; i < groupedWords.length; i += 1) {
    const wordList = groupedWords[i];
    console.log(wordList.map((word, j) => `[${j + 1}] ${word}`).join('\t'));
    const { result } = await prompt.get({
      properties: {
        result: {
          required: true,
          type: 'number',
          minimum: 1,
          maximum: wordList.length,
        },
      },
    });
    selectedWords = [...selectedWords, wordList[result - 1]];
  }

  let result = {};

  selectedWords.forEach((word, i) => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    const dateStr = date.toISOString().split('T')[0];
    const gameId = startGameId + i;
    result = {
      ...result,
      [dateStr]: {
        word,
        gameId,
        date: new Date(dateStr).toISOString(),
      },
    };
  });

  result = {
    ...initList,
    ...result,
  };

  await writeFile(result, SELECTED_WORDS_LIST);

  return JSON.stringify(result);
};

await getWords();
