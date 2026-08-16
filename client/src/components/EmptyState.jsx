import { Link } from 'react-router-dom';
import './EmptyState.css';

export default function EmptyState({ icon = '📭', title, message, actionLabel, actionLink }) {
  return (
    <div className="empty-state">
      <div className="empty-state-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{message}</p>
      {actionLabel && actionLink && (
        <Link to={actionLink} className="btn btn-primary">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}
