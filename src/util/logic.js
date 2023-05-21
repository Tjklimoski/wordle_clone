import { STATUS, ANSWER, WORD_LENGTH} from "./data";

export function validateTiles(currentBoard, currentWord) {
  return currentBoard.map((tile, index) => {
    if (tile.status !== STATUS.active) return tile;

    let status = STATUS.wrong;
    const currentIndex = index % WORD_LENGTH;
    const regExp = new RegExp(tile.value, "gi");
    const matchingLettersInAnswer = [...ANSWER.matchAll(regExp)];
    const matchingLettersInGuess = [...currentWord.matchAll(regExp)];
    let offset = matchingLettersInGuess.length - matchingLettersInAnswer.length;

    
    if (!matchingLettersInAnswer.length) status = STATUS.wrong;


    if (matchingLettersInAnswer.length === 1 ) {
      if (matchingLettersInAnswer[0].index === currentIndex) {
        status = STATUS.correct;
      } else {
        status = STATUS.wrongPosition;
      }
    }


    //this is the magic lol:
    if (
      matchingLettersInAnswer.length >= 1 && 
      offset >= 1
    ) {
      matchingLettersInGuess.forEach((letter) => {
        if (letter.index === currentIndex) status = STATUS.wrongPosition;
      });
      matchingLettersInAnswer.forEach((letter) => {
        if (letter.index === currentIndex) status = STATUS.correct;
      });

      if (status === STATUS.wrongPosition) {
        //compare the two lists and pull a number of tiles equal to the offset that are not correct

        const offsetTiles = matchingLettersInGuess.filter((letter) => {
          return !matchingLettersInAnswer.some(l => {
            return l.index === letter.index
          })
        }).slice(offset * -1)

        //if the current index is one of these offset tiles, set to wrong.
        offsetTiles.forEach((offsetLetter) => {
          if (offsetLetter.index === currentIndex) status = STATUS.wrong;
        });
      }
    }


    if (
      matchingLettersInAnswer.length > 1 && 
      matchingLettersInAnswer.length >= matchingLettersInGuess.length
    ) {
      status = STATUS.wrongPosition
      matchingLettersInAnswer.forEach(letter => {
        if (letter.index === currentIndex) status = STATUS.correct;
      })
    }

    return { ...tile, status };
  });
}
