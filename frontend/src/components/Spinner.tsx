// A small spinning circle with a message, shown while data loads.

interface SpinnerProps {
  label?: string;
}

function Spinner({ label = 'Loading...' }: SpinnerProps) {
  return (
    // role="status" lets screen readers announce the message.
    <div className="spinner-wrap" role="status">
      <span className="spinner" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export default Spinner;
