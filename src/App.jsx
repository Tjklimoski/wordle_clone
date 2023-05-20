import { useState, useEffect, useCallback, useRef } from 'react';
import Keyboard from './components/Keyboard';
import Tile from './components/Tile';
import AlertContainer from "./components/AlertContainer";
import useStopProp from './hooks/useStopProp';
import useAlert from './hooks/useAlert';
import { STATUS, ANIMATION, ALERT, defaultKeyboard, ANSWER, dictionary, WORD_LENGTH, ROWS} from './util/data';
import { validateTiles } from './util/logic';

console.log("answer: ", ANSWER);

function App() {
  const [board, setBoard] = useState(
    Array(WORD_LENGTH * ROWS).fill({
      value: null,
      status: STATUS.default,
      animation: ANIMATION.none,
    })
  );
  const [keyboard, setKeyboard] = useState(defaultKeyboard);
  const [result, setResult] = useState({
    win: false,
    lose: false,
    playAnimation: false,
  });
  const [alerts, sendAlert] = useAlert();
  // To allow animations to finish before allowing users to interact again
  const [stopUserInteraction, restoreUserInteraction] = useStopProp([
    "click",
    "keydown",
  ]);
  const debounce = useRef(null);
  const currentWord = board
    .filter((tile) => tile.status === STATUS.active)
    .reduce((word, tile) => {
      return (word += tile.value);
    }, "");

  console.log("board top level: ", board);

  const addAnimation = useCallback(
    (animation) => {
      stopUserInteraction();
      setBoard((currentBoard) => {
        return currentBoard.map((tile) => {
          if (tile.status === STATUS.active || tile.win === true)
            return { ...tile, animation };
          return tile;
        });
      });
      //restoreUserInteration is handled in onAnimationEnd listener on tile element
    }, [stopUserInteraction]);

  const addLetter = useCallback(
    (letter) => {
      //only tiles in the process of being guessed will have an 'active' status.
      if (currentWord.length >= WORD_LENGTH) {
        return;
      }

      setBoard((currentBoard) => {
        const nextEmptyPosition = currentBoard.findIndex(
          (tile) => tile.status === STATUS.default
        );
        return currentBoard.map((tile, index) => {
          if (index !== nextEmptyPosition) return tile;
          return { ...tile, value: letter, status: STATUS.active };
        });
      });
    },
    [currentWord]
  );

  const deleteLetter = useCallback(() => {
    const tileToDeleteIndex = currentWord.length - 1;
    if (tileToDeleteIndex < 0) return;
    setBoard((currentBoard) => {
      return currentBoard.map((tile, index) => {
        // if value used in multiple tiles get the one in the same index position
        if (
          tile.status === STATUS.active &&
          index % WORD_LENGTH === tileToDeleteIndex
        )
          return {
            value: null,
            status: STATUS.default,
            animation: ANIMATION.none,
          };
        return tile;
      });
    });
  }, [currentWord]);

  const submitWord = useCallback(() => {
    // check if all tiles in row are filled
    if (currentWord.length !== WORD_LENGTH) {
      sendAlert(ALERT.short);
      // prevent animation if there are no tiles to animate
      if (currentWord.length !== 0) addAnimation(ANIMATION.shake);
      return;
    }

    //check if word is in dictionary
    if (!dictionary.includes(currentWord)) {
      sendAlert(ALERT.invalid);
      addAnimation(ANIMATION.shake);
      return;
    }

    //check if submitted word is the answer - set win on each tile.
    if (currentWord === ANSWER) {
      setResult((currentResult) => ({
        ...currentResult,
        win: true,
        playAnimation: true,
      }));
      setBoard((currentBoard) => {
        return currentBoard.map((tile) => {
          if (tile.status === STATUS.active) return { ...tile, win: true };
          return tile;
        });
      });
    }

    addAnimation(ANIMATION.reveal);
    setBoard((currentBoard) => {
      const newBoard = validateTiles(currentBoard, currentWord);
      setKeyboard((currentKeyboard) => {
        //create array only containing the highlest level key status for each letter on the board (to prevent a letter with both wrong-position and correct being displayed as wrong-position on the keyboard)
        const keyStatuses = newBoard.reduce((array, tile) => {
          if (!array) return [tile];
          //don't add the tile if it's status is default
          if (tile.status === STATUS.default) return [...array];
          if (!array.some((t) => t.value === tile.value))
            return [...array, tile];
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
      return newBoard;
    });

    return;
  }, [currentWord, sendAlert, addAnimation]);

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

  // check if lose
  useEffect(() => {
    if (
      !board.some(
        (tile) =>
          tile.status === STATUS.default || tile.status === STATUS.active
      ) &&
      !result.win &&
      !result.lose
    ) {
      setResult((currentResult) => ({ ...currentResult, lose: true }));
      sendAlert(ALERT.lose, null);
      stopUserInteraction();
    }
  }, [board, result, sendAlert, stopUserInteraction]);

  return (
    <div className="wrapper">
      <header>
        <h1>NOTWORDLE</h1>
      </header>
      <AlertContainer alerts={alerts} />
      <div
        className="board"
        onAnimationEnd={() => {
          const delay = 150;
          clearTimeout(debounce.current);
          debounce.current = setTimeout(() => {
            setBoard((currentBoard) => {
              return currentBoard.map((tile) => {
                if (tile.animation !== ANIMATION.none)
                  return { ...tile, animation: ANIMATION.none };
                return tile;
              });
            });
            if (!result.win && !result.lose) restoreUserInteraction();
            //needs to be in onAnimationEnd to prevent overwriting reveal animation
            if (result.win && result.playAnimation) {
              addAnimation(ANIMATION.dance);
              sendAlert(ALERT.win, null);
              setResult((currentResult) => ({
                ...currentResult,
                playAnimation: false,
              }));
            }
          }, delay);
        }}
      >
        {board.map((tile, index) => (
          <Tile key={index} {...tile} />
        ))}
      </div>

      <Keyboard keyboard={keyboard} handleInput={handleInput}/>
    </div>
  );
}

export default App

//create custom hook for useAnimation, useDebounce, and useWordle - returns the board, keyboard, and handleInput?

//move onAnimationEnd to document event listner? Should these event listeners be moved out of react completly and handled in a JS file??
