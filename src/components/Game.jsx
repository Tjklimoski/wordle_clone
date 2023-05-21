import Keyboard from "./Keyboard";
import Board from "./Board";
import AlertContainer from "./AlertContainer";
import useWordle from "../hooks/useWordle";

export default function Game() {
  const [
    board,
    setBoard,
    keyboard,
    handleInput,
    alerts,
    result,
    setResult,
    animationEnd,
  ] = useWordle();

  return (
    <>
      <AlertContainer alerts={alerts} />
      <Board
        board={board}
        setBoard={setBoard}
        result={result}
        setResult={setResult}
        animationEnd={animationEnd}
      />
      <Keyboard keyboard={keyboard} handleInput={handleInput} />
    </>
  );
}
