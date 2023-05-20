import PropTypes from 'prop-types';

export default function Tile({ value, status, animation}) {
  return (
    <div
      data-tile-status={status}
      className={`tile${animation ? " " + animation : ""}`}
    >
      {value}
    </div>
  );
}

Tile.propTypes = {
  value: PropTypes.string,
  status: PropTypes.string.isRequired,
  animation: PropTypes.string
}
