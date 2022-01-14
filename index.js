import { promises as fs } from 'fs';

const DICT_FILE = 'tagalog_dict.txt';
const OUT_FILE = 'grouped_dict.json';

const parseDictionary = async () => {
  const file = await fs.readFile(DICT_FILE);
  const words = file.toString().replace(/\r/g, '').split('\n');

  let groupedWords = Array.from(new Array(20)).map(() => []);
  words.forEach((word) => {
    groupedWords = Object.assign([], groupedWords, {
      [word.length]: [...groupedWords[word.length], word],
    });
  });

  // TODO: save to DB instead
  await fs.writeFile(
    OUT_FILE,
    JSON.stringify({
      4: groupedWords[4],
      5: groupedWords[5],
      7: groupedWords[7],
    })
  );
};

parseDictionary();
