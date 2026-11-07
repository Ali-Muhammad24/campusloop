import { useEffect, useState } from 'react';
import type { BorrowRequest, Equipment, RequestStatus } from '../types';
import * as api from '../services/api';
import Spinner from '../components/Spinner';
import StatusBadge from '../components/StatusBadge';
import { formatDate } from '../utils/formatDate';

type StatusFilter = 'All' | RequestStatus;
type RequestAction = 'approve' | 'reject' | 'return';

const statusOptions: StatusFilter[] = ['All', 'Pending', 'Approved', 'Rejected', 'Returned'];

interface Message {
  type: 'success' | 'error';
  text: string;
}

function AdminDashboardPage() {
  const [requests, setRequests] = useState<BorrowRequest[]>([]);
  const [equipment, setEquipment] = useState<Equipment[]>([]);
  // Student id -> name, so each request can show who made it.
  const [studentNames, setStudentNames] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [statusFilter, setStatusFilter] = useState<StatusFilter>('All');
  const [message, setMessage] = useState<Message | null>(null);
  const [busyId, setBusyId] = useState<number | null>(null); // request whose button is being processed

  useEffect(() => {
    let ignore = false;

    Promise.all([api.getRequests(), api.getEquipment(), api.getUsers()])
      .then(([allRequests, allEquipment, users]) => {
        if (ignore) return;
        // Newest first (higher id = created later).
        setRequests([...allRequests].sort((a, b) => b.id - a.id));
        setEquipment(allEquipment);
        setStudentNames(Object.fromEntries(users.map((user) => [user.id, user.name])));
      })
      .catch((error: unknown) => {
        if (!ignore) setLoadError(error instanceof Error ? error.message : 'Could not load the dashboard.');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  function findItem(equipmentId: number): Equipment | undefined {
    return equipment.find((item) => item.id === equipmentId);
  }

  // Runs Approve, Reject or Mark Returned, then updates the page's own data,
  // so the counts and the table change straight away without reloading.
  async function handleAction(request: BorrowRequest, action: RequestAction) {
    setMessage(null);
    setBusyId(request.id);

    const studentName = studentNames[request.studentId] ?? 'the student';
    const itemName = findItem(request.equipmentId)?.name ?? 'the item';

    try {
      let updated: BorrowRequest;
      let text: string;

      if (action === 'approve') {
        updated = await api.approveRequest(request.id);
        text = `Approved ${studentName}'s request. "${itemName}" is now Borrowed.`;
      } else if (action === 'reject') {
        updated = await api.rejectRequest(request.id);
        text = `Rejected ${studentName}'s request for "${itemName}".`;
      } else {
        updated = await api.markReturned(request.id);
        text = `"${itemName}" was returned and is Available again.`;
      }

      setRequests((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));

      // Approving lends the item out; returning makes it available again (same as the API does).
      if (action !== 'reject') {
        const availability = action === 'approve' ? 'Borrowed' : 'Available';
        setEquipment((prev) =>
          prev.map((item) => (item.id === updated.equipmentId ? { ...item, availability } : item)),
        );
      }

      setMessage({ type: 'success', text });
    } catch (error) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Something went wrong. Please try again.' });
    } finally {
      setBusyId(null);
    }
  }

  if (loading) return <Spinner label="Loading dashboard..." />;

  if (loadError) {
    return (
      <p className="alert-error" role="alert">
        {loadError}
      </p>
    );
  }

  // Counts are worked out from the data on every render, so they are always up to date.
  // Inactive items aren't lent out, so they are not counted.
  const activeItems = equipment.filter((item) => item.isActive);
  const availableCount = activeItems.filter((item) => item.availability === 'Available').length;
  const borrowedCount = activeItems.filter((item) => item.availability === 'Borrowed').length;

  const visibleRequests =
    statusFilter === 'All' ? requests : requests.filter((request) => request.status === statusFilter);

  return (
    <>
      <h1>Admin Dashboard</h1>

      <div className="stat-grid">
        <div className="card stat-card">
          <span className="stat-value">{availableCount}</span>
          <span className="stat-label">Available items</span>
        </div>
        <div className="card stat-card">
          <span className="stat-value">{borrowedCount}</span>
          <span className="stat-label">Borrowed items</span>
        </div>
        <div className="card stat-card">
          <span className="stat-value">{requests.length}</span>
          <span className="stat-label">Total requests</span>
        </div>
      </div>

      <h2>Requests</h2>

      {message && (
        <p className={message.type === 'success' ? 'alert-success' : 'alert-error'} role={message.type === 'success' ? 'status' : 'alert'}>
          {message.text}
        </p>
      )}

      {requests.length === 0 ? (
        <div className="card empty-message">
          <p>There are no requests yet. They will appear here when students request equipment.</p>
        </div>
      ) : (
        <>
          <div className="filter-bar">
            <div className="form-group">
              <label htmlFor="dashboard-status">Status</label>
              <select
                id="dashboard-status"
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as StatusFilter)}
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status === 'All' ? 'All statuses' : status}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <p className="result-count">
            Showing {visibleRequests.length} of {requests.length} requests
          </p>

          {visibleRequests.length === 0 ? (
            <div className="card empty-message">
              <p>No {statusFilter.toLowerCase()} requests.</p>
              <button type="button" className="btn" onClick={() => setStatusFilter('All')}>
                Show all requests
              </button>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Equipment</th>
                    <th>Purpose</th>
                    <th>Return by</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleRequests.map((request) => {
                    const item = findItem(request.equipmentId);
                    // Another request already has this item, so this one can't be approved yet.
                    const itemBorrowed = item?.availability === 'Borrowed';
                    const anyBusy = busyId !== null;

                    return (
                      <tr key={request.id}>
                        <td data-label="Student">{studentNames[request.studentId] ?? 'Unknown student'}</td>
                        <td data-label="Equipment">{item?.name ?? 'Unknown item'}</td>
                        <td data-label="Purpose">{request.purpose}</td>
                        <td data-label="Return by">{formatDate(request.expectedReturnDate)}</td>
                        <td data-label="Status">
                          <StatusBadge status={request.status} />
                        </td>
                        <td data-label="Actions">
                          <div>
                            {request.status === 'Pending' && (
                              <>
                                <div className="table-actions">
                                  <button
                                    type="button"
                                    className="btn btn-small btn-success"
                                    onClick={() => handleAction(request, 'approve')}
                                    disabled={anyBusy || itemBorrowed}
                                  >
                                    Approve
                                  </button>
                                  <button
                                    type="button"
                                    className="btn btn-small btn-danger"
                                    onClick={() => handleAction(request, 'reject')}
                                    disabled={anyBusy}
                                  >
                                    Reject
                                  </button>
                                </div>
                                {itemBorrowed && (
                                  <p className="action-note">Item is currently borrowed. Approve it once it's returned.</p>
                                )}
                              </>
                            )}
                            {request.status === 'Approved' && (
                              <button
                                type="button"
                                className="btn btn-small"
                                onClick={() => handleAction(request, 'return')}
                                disabled={anyBusy}
                              >
                                Mark Returned
                              </button>
                            )}
                            {(request.status === 'Rejected' || request.status === 'Returned') && (
                              <span className="action-none">No actions</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </>
  );
}

export default AdminDashboardPage;
