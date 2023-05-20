import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDeleteLeft } from "@fortawesome/free-solid-svg-icons";
import PropTypes from 'prop-types';

export default function Key({value, status, handleInput }) {
  return (
    <button
      key={value}
      className="key"
      data-value={value}
      data-key-status={status}
      // on currentTarget in order to handle user clicking delete icon
      onClick={(e) => handleInput(e.currentTarget.dataset.value)}
    >
      {value === "delete" ? <FontAwesomeIcon icon={faDeleteLeft} /> : value}
    </button>
  );
}

Key.propTypes = {
  value: PropTypes.string.isRequired,
  status: PropTypes.string.isRequired,
  handleInput: PropTypes.func.isRequired
}
