import { Link } from 'react-router';
import { btnPrimary, stateContainer, stateDesc, stateTitle } from '../styles/classes';

export function NotFoundPage() {
  return (
    <div className={stateContainer}>
      <h2 className={stateTitle}>Page Not Found</h2>
      <p className={stateDesc}>The page you are looking for does not exist.</p>
      <Link to="/" className={`${btnPrimary} mt-2`}>
        Return to Home
      </Link>
    </div>
  );
}
