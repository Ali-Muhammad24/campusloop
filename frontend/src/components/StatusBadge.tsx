import type { RequestStatus } from '../types';

// One colour class per status (colours are in index.css).
const statusClass: Record<RequestStatus, string> = {
  Pending: 'badge-pending',
  Approved: 'badge-approved',
  Rejected: 'badge-rejected',
  Returned: 'badge-returned',
};

interface StatusBadgeProps {
  status: RequestStatus;
}

// A coloured pill showing a request's status. Reused on any page that lists requests.
function StatusBadge({ status }: StatusBadgeProps) {
  return <span className={`badge ${statusClass[status]}`}>{status}</span>;
}

export default StatusBadge;
