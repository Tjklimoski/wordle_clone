import Tile from "./Tile";
import PropTypes from 'prop-types';

export default function Board({ board, setBoard, result, setResult, animationEnd}) {
  return (
    <div
      className="board"
      onAnimationEnd={() => {
        animationEnd(setBoard, result.win || result.lose, () => {
          if (result.win && !result.playAnimation) {
            setResult((currentResult) => {
              return { ...currentResult, playAnimation: true };
            });
          }
        });
      }}
    >
      {board.map((tile, index) => (
        <Tile key={index} {...tile} />
      ))}
    </div>
  );
}

Board.propTypes = {
  board: PropTypes.array.isRequired,
  setBoard: PropTypes.func.isRequired,
  result: PropTypes.object.isRequired,
  setResult: PropTypes.func.isRequired,
  animationEnd: PropTypes.func.isRequired
}
