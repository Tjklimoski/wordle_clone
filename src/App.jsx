import { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDeleteLeft } from "@fortawesome/free-solid-svg-icons";
import { STATUS, defaultKeyboard, anwserWords, dictionary} from './util/data';

const ANSWER = anwserWords[Math.floor(Math.random() * anwserWords.length)].toLowerCase();
const WORD_LENGTH = 5;
const ROWS = 6;

console.log("answer: ", ANSWER);

function App() {
  const [board, setBoard] = useState(
    Array(WORD_LENGTH * ROWS).fill({ value: null, status: STATUS.default })
  );
  const [keyboard, setKeyboard] = useState(defaultKeyboard);
  const [alerts, setAlerts] = useState([]);
  //change to useMemo?:
  const activeTiles = board.filter(tile => tile.status === STATUS.active);

  const addLetter = useCallback(
    (letter) => {
      //only tiles that are in the process of being guessed will have an 'active' status. once guess is submitted they will turn to wrong, wrong-position or correct
      if (activeTiles.length >= WORD_LENGTH) {
        return;
      }

      setBoard((currentBoard) => {
        const nextEmptyPosition = currentBoard.findIndex(
          (tile) => tile.status === STATUS.default
        );
        return currentBoard.map((tile, index) => {
          if (index !== nextEmptyPosition) return tile;
          return { value: letter, status: STATUS.active };
        });
      });
    },
    [activeTiles]
  );

  const deleteLetter = useCallback(() => {
    const tileToDeleteIndex = activeTiles.length - 1;
    if (tileToDeleteIndex < 0) return;
    setBoard((currentBoard) => {
      return currentBoard.map((tile, index) => {
        // if value used in multiple tiles get the one in the same index position
        if (
          tile.value === activeTiles[tileToDeleteIndex].value &&
          index % WORD_LENGTH === tileToDeleteIndex &&
          tile.status === STATUS.active
        )
          return { value: null, status: STATUS.default };
        return tile;
      });
    });
  }, [activeTiles]);

  const submitWord = useCallback(() => {
    if (activeTiles.length !== WORD_LENGTH) {
      return;
      //animate shake
      //show alert
    }

    const submittedWord = activeTiles.reduce((word, tile) => {
      return (word += tile.value);
    }, "");

    //check if word is in dictionary
    if (!dictionary.includes(submittedWord)) {
      alert("not valid word!");
      //animate shake
      //show alert
      return;
    }

    //define validateTiles func:
    const validateTiles = () => {
      //let letterCheck = ANSWER;
      return board.map((tile, i, a) => {

        if (tile.status !== STATUS.active) return tile;
        let status;
        const regExp = new RegExp(tile.value, 'gi');
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
              const lettersInSubmittedWord = [...submittedWord.matchAll(regExp)];
              if (lettersInSubmittedWord.length === 1) status = STATUS.wrongPosition;
              //get smallest index position out of word that matches the letter.
              const indexToColor = lettersInSubmittedWord.reduce((index, letter) => {
                if (index >= letter.index) return letter.index;
                return index;
              }, WORD_LENGTH);
              if (i % WORD_LENGTH === indexToColor) status = STATUS.wrongPosition;
            }
          }
        } else {
          status = STATUS.wrongPosition;
          matchingLetters.forEach(letter => {
            if (letter.index === i % WORD_LENGTH) status = STATUS.correct;
          })
        }
        return {...tile, status};
      })
    }

    //returns all tiles currently on board
    const newBoard = validateTiles();
    setBoard(newBoard);
    setKeyboard((currentKeyboard) => {
      //create array only containing the highlest level key status for each letter on the board (to prevent a letter with both wrong-position and correct being displayed as wrong-position on the keyboard)
      const keyStatuses = newBoard.reduce((array, tile) => {
        if (!array) return [tile];
        //don't add the tile if it's status is default
        if (tile.status === STATUS.default) return [...array];
        if (!array.some((t) => t.value === tile.value)) return [...array, tile];
        return array.map((t) => {
          if (t.value === tile.value) {
            if (tile.status === STATUS.correct) return tile;
            if (
              tile.status === STATUS.wrongPosition &&
              t.status !== STATUS.correct
            )
              return tile;
          }
          return t;
        });
      }, []);

      return currentKeyboard.map((key) => {
        return keyStatuses.find((k) => k.value === key.value) || key;
      });
    });
    //animate letter flip reveal

    //check if word is the answer
    if (submittedWord === ANSWER) {
      //alert showed before tiles turned color:
      alert("you Win!");
      //show alert
      //animate shake
      return;
    }

    return;
  }, [activeTiles, board]);

  const handleInput = useCallback(
    (input) => {
      input = input.toLowerCase();
      if (input === "delete" || input === "backspace") return deleteLetter();
      if (input === "enter") return submitWord();
      if (/^[a-z]$/.test(input)) return addLetter(input);
      return;
    },
    [addLetter, deleteLetter, submitWord]
  );

  // To allow animations to finish before allowing users to interact again
  function stopInteraction(e) {
    e.stopPropagation();
  }

  function stopUserInteraction() {
    document.addEventListener("click", stopInteraction, { capture: true });
    document.addEventListener("keydown", stopInteraction, { capture: true });
  }

  function restoreUserInteraction() {
    document.removeEventListener("click", stopInteraction, { capture: true });
    document.removeEventListener("keydown", stopInteraction, { capture: true });
  }

  // setup keydown event listener
  useEffect(() => {
    const handler = (e) => {
      handleInput(e.key);
    };

    document.addEventListener("keydown", handler);

    return () => {
      document.removeEventListener("keydown", handler);
    };
  }, [handleInput]);

  return (
    <div className="wrapper">
      <header>
        <h1>NOTWORDLE</h1>
      </header>
      <div className="board">
        {board.map(({ value, status }, index) => (
          <div key={index} data-tile-status={status} className="tile">
            {value}
          </div>
        ))}
      </div>

      <div className="keyboard">
        {keyboard.map(({ value, status }) => (
          <button
            key={value}
            className="key"
            data-value={value}
            data-key-status={status}
            onClick={(e) => handleInput(e.currentTarget.dataset.value)}
          >
            {value.toLowerCase() === "delete" ? (
              <FontAwesomeIcon icon={faDeleteLeft} />
            ) : (
              value
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default App
