import Alert from "./Alert";
import PropTypes from 'prop-types';

export default function AlertContainer({ alerts }) {
  return (
    <div className="alerts">
      {alerts.map(({ id, message }) => (
        <Alert key={id} message={message} />
      ))}
    </div>
  );
}

AlertContainer.propTypes = {
  alerts: PropTypes.array.isRequired
}
