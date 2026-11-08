import { useEffect, useState } from 'react';
import type { Availability, Equipment } from '../types';
import * as api from '../services/api';
import EquipmentCard from '../components/EquipmentCard';
import Spinner from '../components/Spinner';

type AvailabilityFilter = 'All' | Availability;

function CataloguePage() {
  const [items, setItems] = useState<Equipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');

  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [availability, setAvailability] = useState<AvailabilityFilter>('All');

  // Load the equipment once when the page opens.
  useEffect(() => {
    // Stops a late response from updating the page after the user has left it.
    let ignore = false;

    api
      .getEquipment()
      .then((data) => {
        // Inactive items are not lent out, so students never see them.
        if (!ignore) setItems(data.filter((item) => item.isActive));
      })
      .catch((error: unknown) => {
        if (!ignore) setLoadError(error instanceof Error ? error.message : 'Could not load equipment.');
      })
      .finally(() => {
        if (!ignore) setLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  // Category options come from the data, sorted A-Z, so new categories appear automatically.
  const categories = [...new Set(items.map((item) => item.category))].sort();

  // Search and filters all apply together.
  const searchText = search.trim().toLowerCase();
  const visibleItems = items.filter(
    (item) =>
      item.name.toLowerCase().includes(searchText) &&
      (category === 'All' || item.category === category) &&
      (availability === 'All' || item.availability === availability),
  );

  function clearFilters() {
    setSearch('');
    setCategory('All');
    setAvailability('All');
  }

  if (loading) return <Spinner label="Loading equipment..." />;

  if (loadError) {
    return (
      <p className="alert-error" role="alert">
        {loadError}
      </p>
    );
  }

  // Nothing to search or filter yet, so show a plain message instead of the filter bar.
  if (items.length === 0) {
    return (
      <>
        <h1>Equipment Catalogue</h1>
        <div className="card empty-message">
          <p>No equipment is available yet. Please check back later.</p>
        </div>
      </>
    );
  }

  return (
    <>
      <h1>Equipment Catalogue</h1>

      <div className="filter-bar">
        <div className="form-group filter-search">
          <label htmlFor="catalogue-search">Search</label>
          <input
            id="catalogue-search"
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search by name"
          />
        </div>
        <div className="form-group">
          <label htmlFor="catalogue-category">Category</label>
          <select id="catalogue-category" value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="All">All categories</option>
            {categories.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
        </div>
        <div className="form-group">
          <label htmlFor="catalogue-availability">Availability</label>
          <select
            id="catalogue-availability"
            value={availability}
            onChange={(event) => setAvailability(event.target.value as AvailabilityFilter)}
          >
            <option value="All">All</option>
            <option value="Available">Available</option>
            <option value="Borrowed">Borrowed</option>
          </select>
        </div>
      </div>

      <p className="result-count">
        Showing {visibleItems.length} of {items.length} items
      </p>

      {visibleItems.length === 0 ? (
        <div className="card empty-message">
          <p>No equipment matches your search or filters.</p>
          <button type="button" className="btn" onClick={clearFilters}>
            Clear filters
          </button>
        </div>
      ) : (
        <div className="equipment-grid">
          {visibleItems.map((item) => (
            <EquipmentCard key={item.id} item={item} />
          ))}
        </div>
      )}
    </>
  );
}

export default CataloguePage;
