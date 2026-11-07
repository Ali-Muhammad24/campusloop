import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import type { BorrowRequest } from '../types';
import * as api from '../services/api';
import { useAppSelector } from '../store/hooks';
import { selectUser } from '../store/authSlice';
import Spinner from '../components/Spinner';
import StatusBadge from '../components/StatusBadge';

// Turns "2026-11-14" into "14 Nov 2026".
// The parts are passed separately so the date isn't shifted by the time zone.
function formatDate(isoDate: string): string {
  const [year, month, day] = isoDate.split('-').map(Number);
  return new Date(year, month - 1, day).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

function MyRequestsPage() {
  // ProtectedRoute makes sure a Student is logged in before this page shows.
  const user = useAppSelector(selectUser);
  const userId = user?.id;

  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  // Equipment id -> name, so each request can show the item's name.
  const [equipmentNames, setEquipmentNames] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  useEffect(() => {
    if (userId === undefined) return;
    let ignore = false;

    // Load both at the same time instead of one after the other.
    Promise.all([api.getRequestsByStudent(userId), api.getEquipment()])
      .then(([myRequests, equipment]) => {
        if (ignore) return;
        // Newest first (higher id = created later).
        setRequests([...myRequests].sort((a, b) => b.id - a.id));
        setEquipmentNames(Object.fromEntries(equipment.map((item) => [item.id, item.name])));
      })
      .catch((error: unknown) => {
        if (!ignore) setLoadError(error instanceof Error ? error.message : 'Could not load your requests.');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, [userId]);

  if (loading) return <Spinner label="Loading your requests..." />;

  if (loadError) {
    return (
      <p className="alert-error" role="alert">
        {loadError}
      </p>
    );
  }

  return (
    <>
      <h1>My Requests</h1>

      {requests.length === 0 ? (
        <div className="card empty-message">
          <p>You haven't made any requests yet.</p>
          <Link to="/" className="btn">
            Browse the Catalogue
          </Link>
        </div>
      ) : (
        <ul className="request-list">
          {requests.map((request) => (
            <li key={request.id} className="card request-card">
              <div className="request-card-header">
                <h2 className="request-card-name">{equipmentNames[request.equipmentId] ?? 'Unknown item'}</h2>
                <StatusBadge status={request.status} />
              </div>
              <dl className="request-card-details">
                <div>
                  <dt>Purpose</dt>
                  <dd>{request.purpose}</dd>
                </div>
                <div>
                  <dt>Expected return</dt>
                  <dd>{formatDate(request.expectedReturnDate)}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}

export default MyRequestsPage;
