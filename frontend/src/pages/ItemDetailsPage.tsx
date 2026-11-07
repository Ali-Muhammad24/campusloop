import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import type { Equipment } from '../types';
import * as api from '../services/api';
import { useAppSelector } from '../store/hooks';
import { selectUser } from '../store/authSlice';
import Spinner from '../components/Spinner';
import RequestForm from '../components/RequestForm';

function ItemDetailsPage() {
  // Reads the item id from the URL, e.g. /equipment/3 gives id = "3".
  const { id } = useParams();
  const itemId = Number(id);
  const validId = Number.isInteger(itemId) && itemId > 0;

  const user = useAppSelector(selectUser);

  // The loaded item, together with the id it was loaded for (item is null if it wasn't found).
  const [result, setResult] = useState<{ id: number; item: Equipment | null } | null>(null);

  // Still loading until we have a result for the id that is in the URL right now.
  const loading = validId && result?.id !== itemId;
  const item = validId && result?.id === itemId ? result.item : null;

  // Load the item whenever the id in the URL changes.
  useEffect(() => {
    if (!validId) return;
    let ignore = false; // stops a late response from updating the page after leaving it

    api
      .getEquipmentById(itemId)
      .then((data) => {
        if (!ignore) setResult({ id: itemId, item: data });
      })
      .catch(() => {
        // The mock API only throws "not found", so this shows the "not found" message.
        if (!ignore) setResult({ id: itemId, item: null });
      });

    return () => {
      ignore = true;
    };
  }, [itemId, validId]);

  const backLink = (
    <Link to="/" className="back-link">
      ← Back to catalogue
    </Link>
  );

  if (loading) return <Spinner label="Loading item..." />;

  // Inactive items are hidden from students, so they count as "not found" too.
  if (!item || !item.isActive) {
    return (
      <>
        {backLink}
        <div className="card empty-message">
          <h1>Item not found</h1>
          <p>This item doesn't exist or is no longer available to borrow.</p>
        </div>
      </>
    );
  }

  const badgeClass = item.availability === 'Available' ? 'badge badge-available' : 'badge badge-borrowed';

  // What shows under the details: a message or the request form.
  let requestSection;
  if (item.availability !== 'Available') {
    requestSection = (
      <p className="alert-info">This item is currently unavailable. It's borrowed by someone else.</p>
    );
  } else if (!user) {
    requestSection = (
      <p className="alert-info">
        <Link to="/login">Log in</Link> as a student to request this item.
      </p>
    );
  } else if (user.role !== 'Student') {
    requestSection = <p className="alert-info">Only students can request equipment.</p>;
  } else {
    // "key" gives a fresh, empty form if the user opens a different item.
    requestSection = <RequestForm key={item.id} itemId={item.id} studentId={user.id} />;
  }

  return (
    <>
      {backLink}
      <div className="card item-details">
        <h1>{item.name}</h1>
        <p className="item-details-category">{item.category}</p>
        <span className={badgeClass}>{item.availability}</span>
        <p className="item-details-description">{item.description}</p>
      </div>

      <section className="card item-request">
        <h2>Request this item</h2>
        {requestSection}
      </section>
    </>
  );
}

export default ItemDetailsPage;
