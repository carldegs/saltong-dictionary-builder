import { writeFile } from './utils.js';
import puppeteer from 'puppeteer';
import { RAW_DICTIONARY_FILE } from './constants.js';

const scrapeData = async () => {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--disable-setuid-sandbox'],
    ignoreHTTPSErrors: true,
  });
  const [page] = await browser.pages();

  const letters = 'abcdefghijklmnopqrstuvwxyz'.split('');

  let wordList = [];

  for (let i = 0; i < letters.length; i++) {
    let j = 1;

    console.log(`Scraping letter ${letters[i]}`);

    while (j < 1000) {
      const url = `https://tagalog.pinoydictionary.com/list/${letters[i]}/${
        j === 1 ? '' : `${j}/`
      }`;

      console.log(letters[i], j, url);
      await page.goto(url, {
        waitUntil: 'domcontentloaded',
      });

      const words = await page.$$eval('h2 a', (links) =>
        links.map((el) => el.innerHTML)
      );

      if (!words.length) {
        break;
      }

      wordList = [...wordList, ...words];
      j++;
    }
  }

  wordList = wordList.filter(
    (word) => new RegExp('^[A-Za-z]+$').test(word) && word.length >= 4
  );

  console.log(`Found ${wordList.length} words`);

  await writeFile(wordList, RAW_DICTIONARY_FILE);
  await browser.close();
};

scrapeData();
