import { promises as fs } from 'fs';
import prompt from 'prompt';

const DICT_FILE = 'grouped_dict.json';
const OUT_FILE = 'selected_words.json';

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

const exists = async (path) => {
  try {
    await fs.access(path);
    return true;
  } catch (err) {
    return false;
  }
}

const getWords = async () => {
  prompt.start();

  const file = await fs.readFile(DICT_FILE);
  const groupedDict = JSON.parse(file.toString());

  const { wordLength, numWords, numOptions, startDate, startGameId } =
    await prompt.get({
      properties: {
        wordLength: {
          message: 'Word Length',
          required: true,
          default: 5,
          type: 'number',
        },
        numWords: {
          message: 'Number of words',
          required: true,
          default: 10,
          type: 'number',
        },
        numOptions: {
          message: 'Number of options per word',
          required: true,
          default: 5,
          type: 'number',
        },
        startDate: {
          default: new Date().toISOString().split('T')[0],
          type: 'string',
          required: true,
        },
        startGameId: {
          required: true,
          type: 'number',
        },
      },
    });

  const dict = groupedDict[wordLength];
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

  const hasOutFile = await exists(OUT_FILE);
  
  if (hasOutFile) {
    await fs.unlink(OUT_FILE);
  }

  await fs.writeFile(OUT_FILE, JSON.stringify(result));
  return JSON.stringify(result);
};

const words = await getWords();
console.log(words);
