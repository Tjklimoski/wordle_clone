import { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDeleteLeft } from "@fortawesome/free-solid-svg-icons";
import { STATUS, defaultKeyboard, anwserWords, dictionary} from './util/data';

const answer = anwserWords[Math.floor(Math.random() * anwserWords.length)]
console.log("answer: ", answer);

function App() {
  const [board, setBoard] = useState(Array(30).fill({ value: null, status: STATUS.default }));
  const [keyboard, setKeyboard] = useState(defaultKeyboard);

  const handleInput = useCallback((input) => {
    input = input.toLowerCase();
    if (input === 'delete' || input === 'backspace') return deleteLetter();
    if (input === 'enter') return submitWord();
    if (/^[a-z]$/.test(input)) return addLetter(input);
    return;
  }, [])

  function getActiveTiles() {
    return board.filter(tile => tile.status === STATUS.active)
  }

  function addLetter(letter) {

    //only tiles that are in the process of being guessed will have an 'active' status. once guess is submitted the will turn to wrong, wrong-position or correct

    setBoard(currentBoard => {
      const nextEmptyPosition = currentBoard.findIndex(tile => tile.status === STATUS.default);
      return currentBoard.map( (tile, index) => {
        if (index !== nextEmptyPosition) return tile;
        return {value: letter, status: STATUS.active}
      })
    })
  }

  function deleteLetter() {
    return;
  }

  function submitWord() {
    return;
  }

  function stopInteraction(e) {
    e.stopPropagation();
  }

  //To allow animations to finish before allowing users to interact again
  function stopUserInteraction() {
    document.addEventListener("click", stopInteraction, { capture: true });
    document.addEventListener('keydown', stopInteraction, { capture: true });
  }

  function restoreUserInteraction() {
    document.removeEventListener("click", stopInteraction, { capture: true });
    document.removeEventListener("keydown", stopInteraction, { capture: true });
  }

  useEffect(() => {
    const handler = (e) => {
      handleInput(e.key);
    }

    document.addEventListener("keydown", handler);

    return () => {
      document.removeEventListener("keydown", handler);
    }
  }, [handleInput])

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
