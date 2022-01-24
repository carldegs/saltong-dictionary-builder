import { format, min, nextTuesday, nextFriday, addDays } from 'date-fns';
import { promises as fs } from 'fs';

export const exists = async (path) => {
  try {
    await fs.access(path);
    return true;
  } catch (err) {
    return false;
  }
};
export const readFile = async (fileName, parse = false) => {
  let data = (await fs.readFile(fileName)).toString();

  if (parse) {
    data = JSON.parse(data);

    if (typeof data === 'string') {
      data = JSON.parse(data);
    }
  }

  return data;
};

export const writeFile = async (data, fileName) => {
  const hasOutFile = await exists(fileName);

  if (hasOutFile) {
    await fs.unlink(fileName);
  }

  await fs.writeFile(fileName, JSON.stringify(data));
};

export const isPangram = (word) => Array.from(new Set(word)).length === 7;

export const getWordScore = (word) =>
  (word.length === 4 ? 1 : word.length) + (isPangram(word) ? 7 : 0);

export const getNextHexRound = (date) => {
  const nextDay = addDays(new Date(date), 1);
  console.log(date, nextDay);
  return format(min([nextTuesday(nextDay), nextFriday(nextDay)]), 'yyyy-MM-dd');
};
