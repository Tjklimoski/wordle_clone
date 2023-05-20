import Key from "./Key";
import PropTypes from "prop-types";

export default function Keyboard({ keyboard, handleInput }) {
  return (
    <div className="keyboard">
      {keyboard.map((key) => {
        return <Key key={key.value} {...key} handleInput={handleInput} />;
      })}
    </div>
  );
}

Keyboard.propTypes = {
  keyboard: PropTypes.array.isRequired,
  handleInput: PropTypes.func.isRequired,
};
