import { GROUPED_DICTIONARY_FILE, RAW_DICTIONARY_FILE } from './constants.js';
import { readFile, writeFile } from './utils.js';

const parseDictionary = async () => {
  const file = await readFile(RAW_DICTIONARY_FILE);
  const words = file.toString().replace(/\r/g, '').split('\n');

  let groupedWords = Array.from(new Array(20)).map(() => []);
  words.forEach((word) => {
    groupedWords = Object.assign([], groupedWords, {
      [word.length]: [...groupedWords[word.length], word],
    });
  });

  const length = groupedWords.map((words) => words.length);
  console.log(length);
  let total = 0;
  length.forEach((i) => (total = total + i));
  console.log(total);

  await writeFile(
    Object.fromEntries(
      [4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19].map((i) => [
        i,
        groupedWords[i],
      ])
    ),
    GROUPED_DICTIONARY_FILE
  );
};

parseDictionary();
