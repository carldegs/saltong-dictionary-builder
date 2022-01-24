import { readFile } from 'fs';
import prompt from 'prompt';

const getHexWordList = async () => {
  prompt.start();

  const { rootWord } = await prompt.get({
    properties: {
      rootWord
    }
  });
  
  const rootWordIndex = 

};
