import './LoadingSpinner.css';

export default function LoadingSpinner({ fullScreen = false, size = 'md' }) {
  return (
    <div className={`spinner-container ${fullScreen ? 'full-screen' : ''}`}>
      <div className={`spinner ${size}`}></div>
    </div>
  );
}
