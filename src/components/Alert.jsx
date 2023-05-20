import { ALERT } from "../util/data";
import PropTypes from 'prop-types';

export default function Alert({ message }) {
  return (
    <div
      className="alert"
      // prevent default fade out animation behavior if win or lose alert
      style={
        message === ALERT.lose || message === ALERT.win
          ? { animation: "none" }
          : {}
      }
    >
      {message}
    </div>
  );
}

Alert.propTypes = {
  message: PropTypes.string.isRequired
}
