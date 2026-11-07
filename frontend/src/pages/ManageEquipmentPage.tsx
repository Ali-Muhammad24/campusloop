import { Fragment, useEffect, useState } from 'react';
import type { Equipment } from '../types';
import * as api from '../services/api';
import Spinner from '../components/Spinner';
import EquipmentForm, { type EquipmentFormValues } from '../components/EquipmentForm';

interface Message {
  type: 'success' | 'error';
  text: string;
}

// The item waiting for a delete decision. "blocked" means it has requests and can't be deleted.
interface DeleteCheck {
  item: Equipment;
  blocked: boolean;
}

// Everything except the id, in the shape the API expects for an update.
function toData(item: Equipment): Omit<Equipment, 'id'> {
  return {
    name: item.name,
    category: item.category,
    description: item.description,
    availability: item.availability,
    isActive: item.isActive,
  };
}

function errorText(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}

function ManageEquipmentPage() {
  const [items, setItems] = useState<Equipment[]>([]);
  // Ids of items that have at least one request (those can't be deleted).
  const [itemIdsWithRequests, setItemIdsWithRequests] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [message, setMessage] = useState<Message | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formKey, setFormKey] = useState(0); // changing it empties the Add form
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState<number | null>(null); // item whose button is being processed
  const [deleteCheck, setDeleteCheck] = useState<DeleteCheck | null>(null);

  useEffect(() => {
    let ignore = false;

    Promise.all([api.getEquipment(), api.getRequests()])
      .then(([equipment, requests]) => {
        if (ignore) return;
        setItems(equipment);
        setItemIdsWithRequests(new Set(requests.map((r) => r.equipmentId)));
      })
      .catch((error: unknown) => {
        if (!ignore) setLoadError(errorText(error, 'Could not load equipment.'));
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const editingItem = items.find((item) => item.id === editingId) ?? null;

  // ---------- Add / Edit ----------

  async function handleSave(values: EquipmentFormValues) {
    setMessage(null);
    setSaving(true);
    try {
      if (editingItem) {
        // Editing keeps the item's current active/inactive setting.
        const updated = await api.updateEquipment(editingItem.id, { ...values, isActive: editingItem.isActive });
        setItems((prev) => prev.map((item) => (item.id === updated.id ? updated : item)));
        setEditingId(null);
        setMessage({ type: 'success', text: `"${updated.name}" was updated.` });
      } else {
        // New items start active, so students can see them straight away.
        const added = await api.addEquipment({ ...values, isActive: true });
        setItems((prev) => [...prev, added]);
        setFormKey((key) => key + 1);
        setMessage({ type: 'success', text: `"${added.name}" was added.` });
      }
    } catch (error) {
      setMessage({ type: 'error', text: errorText(error, 'Could not save the item. Please try again.') });
    } finally {
      setSaving(false);
    }
  }

  function startEdit(item: Equipment) {
    setMessage(null);
    setDeleteCheck(null);
    setEditingId(item.id);
    // The form is at the top of the page.
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // ---------- Delete / Active ----------

  function askDelete(item: Equipment) {
    setMessage(null);
    setDeleteCheck({ item, blocked: itemIdsWithRequests.has(item.id) });
  }

  async function confirmDelete(item: Equipment) {
    setMessage(null);
    setBusyId(item.id);
    try {
      await api.deleteEquipment(item.id);
      setItems((prev) => prev.filter((i) => i.id !== item.id));
      if (editingId === item.id) setEditingId(null);
      setMessage({ type: 'success', text: `"${item.name}" was deleted.` });
    } catch (error) {
      setMessage({ type: 'error', text: errorText(error, 'Could not delete the item.') });
    } finally {
      setBusyId(null);
      setDeleteCheck(null);
    }
  }

  async function setActive(item: Equipment, isActive: boolean) {
    setMessage(null);
    setBusyId(item.id);
    try {
      const updated = await api.updateEquipment(item.id, { ...toData(item), isActive });
      setItems((prev) => prev.map((i) => (i.id === updated.id ? updated : i)));
      setMessage({
        type: 'success',
        text: isActive
          ? `"${updated.name}" is active again and shows in the Catalogue.`
          : `"${updated.name}" is now inactive and hidden from the Catalogue.`,
      });
    } catch (error) {
      setMessage({ type: 'error', text: errorText(error, 'Could not update the item.') });
    } finally {
      setBusyId(null);
      setDeleteCheck(null);
    }
  }

  // ---------- Page ----------

  if (loading) return <Spinner label="Loading equipment..." />;

  if (loadError) {
    return (
      <p className="alert-error" role="alert">
        {loadError}
      </p>
    );
  }

  const anyBusy = busyId !== null || saving;

  return (
    <>
      <h1>Manage Equipment</h1>

      <section className="card manage-form-card">
        <h2>{editingItem ? `Edit "${editingItem.name}"` : 'Add equipment'}</h2>
        <EquipmentForm
          // A new key gives a fresh form: when switching items, or after adding one.
          key={editingItem ? `edit-${editingItem.id}` : `add-${formKey}`}
          initialValues={editingItem ? toData(editingItem) : undefined}
          submitLabel={editingItem ? 'Save changes' : 'Add equipment'}
          saving={saving}
          onSubmit={handleSave}
          onCancel={editingItem ? () => setEditingId(null) : undefined}
        />
      </section>

      {message && (
        <p className={message.type === 'success' ? 'alert-success' : 'alert-error'} role={message.type === 'success' ? 'status' : 'alert'}>
          {message.text}
        </p>
      )}

      <h2>All equipment ({items.length})</h2>

      {items.length === 0 ? (
        <div className="card empty-message">
          <p>There is no equipment yet. Add the first item with the form above.</p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Category</th>
                <th>Availability</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <Fragment key={item.id}>
                  <tr className={item.isActive ? undefined : 'row-inactive'}>
                    <td data-label="Name">{item.name}</td>
                    <td data-label="Category">{item.category}</td>
                    <td data-label="Availability">
                      <span className={`badge ${item.availability === 'Available' ? 'badge-available' : 'badge-borrowed'}`}>
                        {item.availability}
                      </span>
                    </td>
                    <td data-label="Status">{item.isActive ? 'Active' : 'Inactive'}</td>
                    <td data-label="Actions">
                      <div className="table-actions">
                        <button type="button" className="btn btn-small" onClick={() => startEdit(item)} disabled={anyBusy}>
                          Edit
                        </button>
                        {item.isActive ? (
                          <button
                            type="button"
                            className="btn btn-small btn-secondary"
                            onClick={() => setActive(item, false)}
                            disabled={anyBusy}
                          >
                            Mark inactive
                          </button>
                        ) : (
                          <button
                            type="button"
                            className="btn btn-small btn-secondary"
                            onClick={() => setActive(item, true)}
                            disabled={anyBusy}
                          >
                            Mark active
                          </button>
                        )}
                        <button
                          type="button"
                          className="btn btn-small btn-danger"
                          onClick={() => askDelete(item)}
                          disabled={anyBusy}
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>

                  {/* In-page confirm, shown right under the item's row. */}
                  {deleteCheck?.item.id === item.id && (
                    <tr className="confirm-row">
                      <td colSpan={5}>
                        <DeleteConfirm
                          check={deleteCheck}
                          busy={busyId === item.id}
                          onDelete={() => confirmDelete(item)}
                          onMarkInactive={() => setActive(item, false)}
                          onCancel={() => setDeleteCheck(null)}
                        />
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}

interface DeleteConfirmProps {
  check: DeleteCheck;
  busy: boolean;
  onDelete: () => void;
  onMarkInactive: () => void;
  onCancel: () => void;
}

// Either "are you sure?" or, for items with requests, why delete is blocked.
function DeleteConfirm({ check, busy, onDelete, onMarkInactive, onCancel }: DeleteConfirmProps) {
  const { item, blocked } = check;

  if (blocked) {
    return (
      <div className="confirm-box" role="alert">
        <p>
          <strong>"{item.name}" has requests, so it can't be deleted.</strong>{' '}
          {item.isActive
            ? 'You can mark it inactive instead. It will be hidden from the Catalogue but kept for the request history.'
            : 'It is already inactive, so students can no longer see it.'}
        </p>
        <div className="table-actions">
          {item.isActive && (
            <button type="button" className="btn btn-small" onClick={onMarkInactive} disabled={busy}>
              {busy ? 'Saving...' : 'Mark inactive'}
            </button>
          )}
          <button type="button" className="btn btn-small btn-secondary" onClick={onCancel} disabled={busy}>
            {item.isActive ? 'Cancel' : 'Close'}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="confirm-box" role="alert">
      <p>
        <strong>Delete "{item.name}"?</strong> This can't be undone.
      </p>
      <div className="table-actions">
        <button type="button" className="btn btn-small btn-danger" onClick={onDelete} disabled={busy}>
          {busy ? 'Deleting...' : 'Yes, delete'}
        </button>
        <button type="button" className="btn btn-small btn-secondary" onClick={onCancel} disabled={busy}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default ManageEquipmentPage;
