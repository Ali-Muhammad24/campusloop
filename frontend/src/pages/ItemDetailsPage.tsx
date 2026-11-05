import { useParams } from 'react-router-dom';

function ItemDetailsPage() {
  // Reads the item id from the URL, e.g. /equipment/3 gives id = "3".
  const { id } = useParams();

  return <h1>Item Details (item {id})</h1>;
}

export default ItemDetailsPage;
