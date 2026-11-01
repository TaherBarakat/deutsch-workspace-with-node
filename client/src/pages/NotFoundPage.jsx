import { Link } from 'react-router-dom';
import { Compass } from 'lucide-react';
import { EmptyState } from '../components/ui/EmptyState.jsx';

export function NotFoundPage() {
  return (
    <EmptyState
      icon={Compass}
      title="This page wandered off"
      description="The page you were looking for does not exist. Return to your vocabulary library to keep learning."
    >
      <Link className="button button--accent button--md" to="/">Back to overview</Link>
    </EmptyState>
  );
}
