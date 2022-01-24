import {
  GROUPED_DICTIONARY_FILE,
  ROOT_WORDS_FILE,
} from './constants.js';
import { writeFile, readFile } from './utils.js';

const getRootWords = async () => {
  const groupedDict = await readFile(GROUPED_DICTIONARY_FILE, true);
  let source = [];
  Object.entries(groupedDict).forEach(([length, words]) => {
    if (length >= 7) {
      source = [...source, ...words];
    }
  });

  let rootWords = [];

  source.forEach((word) => {
    if (Array.from(new Set(word)).length === 7) {
      rootWords = [...rootWords, word];
    }
  });

  console.log(`Found ${rootWords.length} Root words`);

  console.log(rootWords.indexOf('balwarte'));

  await writeFile(rootWords, ROOT_WORDS_FILE);

  return JSON.stringify(rootWords);
};

getRootWords();
