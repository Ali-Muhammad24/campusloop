import { useId, useState, type ChangeEvent, type SubmitEvent } from 'react';
import FormInput from './FormInput';
import { validateRequired } from '../utils/validation';
import type { Availability } from '../types';

// The Add / Edit form on the Manage Equipment page.
// The page does the saving. To empty the form after adding, the page gives it a new "key".

export interface EquipmentFormValues {
  name: string;
  category: string;
  description: string;
  availability: Availability;
}

type EquipmentFormErrors = Partial<Record<'name' | 'category' | 'description', string>>;

const emptyValues: EquipmentFormValues = { name: '', category: '', description: '', availability: 'Available' };

interface EquipmentFormProps {
  initialValues?: EquipmentFormValues; // filled in when editing
  submitLabel: string;
  saving: boolean;
  onSubmit: (values: EquipmentFormValues) => void;
  onCancel?: () => void; // shown as a Cancel button when set (edit mode)
}

function EquipmentForm({ initialValues = emptyValues, submitLabel, saving, onSubmit, onCancel }: EquipmentFormProps) {
  const [values, setValues] = useState<EquipmentFormValues>(initialValues);
  const [errors, setErrors] = useState<EquipmentFormErrors>({});
  const availabilityId = useId();

  function handleChange(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
    const { name, value } = event.target;
    setValues((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: undefined }));
  }

  function handleSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();

    const newErrors: EquipmentFormErrors = {
      name: validateRequired(values.name, 'Name'),
      category: validateRequired(values.category, 'Category'),
      description: validateRequired(values.description, 'Description'),
    };
    setErrors(newErrors);
    if (Object.values(newErrors).some(Boolean)) return;

    onSubmit({
      name: values.name.trim(),
      category: values.category.trim(),
      description: values.description.trim(),
      availability: values.availability,
    });
  }

  return (
    <form className="form" onSubmit={handleSubmit} noValidate>
      <FormInput
        label="Name"
        name="name"
        value={values.name}
        onChange={handleChange}
        error={errors.name}
        placeholder="e.g. Canon DSLR Camera"
        disabled={saving}
      />
      <FormInput
        label="Category"
        name="category"
        value={values.category}
        onChange={handleChange}
        error={errors.category}
        placeholder="e.g. Cameras"
        disabled={saving}
      />
      <FormInput
        label="Description"
        name="description"
        value={values.description}
        onChange={handleChange}
        error={errors.description}
        multiline
        disabled={saving}
      />
      {/* FormInput has no dropdown, so this one is written out. A value is always selected. */}
      <div className="form-group">
        <label htmlFor={availabilityId}>Availability</label>
        <select
          id={availabilityId}
          name="availability"
          value={values.availability}
          onChange={handleChange}
          disabled={saving}
        >
          <option value="Available">Available</option>
          <option value="Borrowed">Borrowed</option>
        </select>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn" disabled={saving}>
          {saving ? 'Saving...' : submitLabel}
        </button>
        {onCancel && (
          <button type="button" className="btn btn-secondary" onClick={onCancel} disabled={saving}>
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

export default EquipmentForm;
