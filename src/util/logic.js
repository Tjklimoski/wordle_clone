import { STATUS, ANSWER, WORD_LENGTH} from "./data";

export function validateTiles(currentBoard, currentWord) {
  return currentBoard.map((tile, i, a) => {
    if (tile.status !== STATUS.active) return tile;
    let status;
    const regExp = new RegExp(tile.value, "gi");
    const matchingLetters = [...ANSWER.matchAll(regExp)];
    if (matchingLetters.length <= 1) {
      status = STATUS.wrong;
      if (matchingLetters.length) {
        const letterIndex = matchingLetters[0].index;
        if (letterIndex === i % WORD_LENGTH) status = STATUS.correct;
        //to stop the first yellow showing letter if the 2nd placement of the same letter is in the correct place and the anwser word only contains that letter once:
        //ex. answer: 'smote', user submits: 'tests'. the first t should have status wrong, the 2nd t should have status correct.
        const indexOffset = letterIndex - (i % WORD_LENGTH);
        if (
          letterIndex !== i % WORD_LENGTH &&
          a[i + indexOffset]?.value !== tile.value
        ) {
          const lettersInSubmittedWord = [...currentWord.matchAll(regExp)];
          if (lettersInSubmittedWord.length === 1)
            status = STATUS.wrongPosition;
          //get smallest index position out of word that matches the letter.
          const indexToColor = lettersInSubmittedWord.reduce(
            (index, letter) => {
              if (index >= letter.index) return letter.index;
              return index;
            },
            WORD_LENGTH
          );
          if (i % WORD_LENGTH === indexToColor) status = STATUS.wrongPosition;
        }
      }
    } else {
      status = STATUS.wrongPosition;
      matchingLetters.forEach((letter) => {
        if (letter.index === i % WORD_LENGTH) status = STATUS.correct;
      });
    }
    return { ...tile, status };
  });
}
