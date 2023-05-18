import { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDeleteLeft } from "@fortawesome/free-solid-svg-icons";
import { STATUS, defaultKeyboard, anwserWords, dictionary} from './util/data';

const answer = anwserWords[Math.floor(Math.random() * anwserWords.length)]
console.log("answer: ", answer);

function App() {
  const [board, setBoard] = useState(
    Array(30).fill({ value: null, status: STATUS.default })
  );
  const [keyboard, setKeyboard] = useState(defaultKeyboard);
  //change to useMemo?:
  const activeTiles = board.filter(tile => tile.status === STATUS.active);

  const addLetter = useCallback(
    (letter) => {
      //only tiles that are in the process of being guessed will have an 'active' status. once guess is submitted they will turn to wrong, wrong-position or correct
      if (activeTiles.length >= 5) {
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
          index % 5 === tileToDeleteIndex &&
          tile.status === STATUS.active
        )
          return { value: null, status: STATUS.default };
        return tile;
      });
    });
  }, [activeTiles]);

  const submitWord = useCallback(() => {
    if (activeTiles.length < 5) {
      return;
    }

    const submittedWord = activeTiles.reduce((word, tile) => {
      return (word += tile.value);
    }, "");

    //check if word is in dictionary
    if (!dictionary.includes(submittedWord)) {
      alert("not valid word!");
      return;
    }
    
    //check if word is the answer
    if (submittedWord === answer) {
      alert('you Win!');
    } else {
      const newBoard = validateTiles();
      setBoard(newBoard);
      setKeyboard(currentKeyboard => {
        //create array only containing the highlesdt level key status (to prevent a letter with both wrong-position and correct being displayed as wrong-position on the keyboard)
        const keyStatuses = newBoard.reduce((array, tile) => {
          if (!array) return [tile];
          if (tile.status === STATUS.default) return [...array];
          if (!array.some(t => t.value === tile.value)) return [...array, tile];
          return array.map(t => {
            if (t.value === tile.value) {
              if (tile.status === STATUS.correct) return tile;
              if (tile.status === STATUS.wrongPosition && t.status !== STATUS.correct) return tile;
            }
            return t;
          })
        }, []);

        return currentKeyboard.map(key => {
          return keyStatuses.find((k) => k.value === key.value) || key;
        })
      })
      //animate board
    }

    return;
  }, [activeTiles]);

  function validateTiles() {
    let letterCheck = answer;
    return board.map((tile, index) => {
      if (tile.status !== STATUS.active) return tile;

      let status = STATUS.wrong;
      if (letterCheck.includes(tile.value)) {
        status = STATUS.wrongPosition;
        //remove the letter from the answer word to prevent a user's double letter applying wrongPosition to the 2nd letter when the letter is only in the answer once.
        //EX: answer is 'parry', user submits 'apple'. only the first 'p' should turn yellow.
        //EX: answer is 'parry', user submits 'paper'. only the first 'p' should turn green, the 2nd 'p' should have status of wrong.
        letterCheck = letterCheck.replace(tile.value, "");
      }
      if (answer[index] === tile.value) status = STATUS.correct;
      return { ...tile, status };
    })
  }

  const handleInput = useCallback((input) => {
    input = input.toLowerCase();
    if (input === "delete" || input === "backspace") return deleteLetter();
    if (input === "enter") return submitWord();
    if (/^[a-z]$/.test(input)) return addLetter(input);
    return;
  }, [addLetter, deleteLetter]);

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
