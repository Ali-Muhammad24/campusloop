import { Link } from 'react-router-dom';
import type { Equipment } from '../types';

// One equipment item in the Catalogue grid. The whole card links to the item's details page.

interface EquipmentCardProps {
  item: Equipment;
}

function EquipmentCard({ item }: EquipmentCardProps) {
  const badgeClass = item.availability === 'Available' ? 'badge badge-available' : 'badge badge-borrowed';

  return (
    <Link to={`/equipment/${item.id}`} className="card equipment-card">
      <h3 className="equipment-card-name">{item.name}</h3>
      <p className="equipment-card-category">{item.category}</p>
      <span className={badgeClass}>{item.availability}</span>
    </Link>
  );
}

export default EquipmentCard;
