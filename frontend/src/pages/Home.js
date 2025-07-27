import React, { useState } from 'react';
import axios from 'axios';
import SearchBar from '../components/SearchBar';
import MapView from '../components/MapView';
import MenuModal from '../components/MenuModal';
import ReservationModal from '../components/ReservationModal';
import ViewReservationsModal from '../components/ViewReservationsModal';
import './Home.css';

const Home = () => {
  const [results, setResults] = useState([]);
  const [currentPriceLimit, setCurrentPriceLimit] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentZip, setCurrentZip] = useState('');
  const [currentCuisine, setCurrentCuisine] = useState('');
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const [modalData, setModalData] = useState({
    open: false,
    restaurantName: '',
    restaurantId: null,
    menuItems: [],
  });

  const [reservationModal, setReservationModal] = useState({
    open: false,
    restaurant: null,
  });

  const [viewModal, setViewModal] = useState({
    open: false,
    restaurant: null,
  });

  const fetchPage = async (price, zip, cuisine, rating, page) => {
    const query = new URLSearchParams();
    if (price !== null) query.append('price', price);
    if (zip) query.append('zip', zip);
    if (cuisine) query.append('cuisine', cuisine);
    if (rating) query.append('rating', rating);
    query.append('page', page);
    query.append('limit', 10);

    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/meals/search?${query}`);
      const data = response.data.results;

      setResults(data);
      setCurrentPage(page);
      setTotalPages(Math.ceil(response.data.total / 10));
      setErrorMsg(data.length === 0 ? 'No results found. Try a different search.' : '');
    } catch (err) {
      console.error('Error fetching meals:', err);
      setResults([]);
      setErrorMsg('Error retrieving results.');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (data, price, zip, cuisine, rating) => {
    const parsedPrice = price ? parseFloat(price) : null;
    setCurrentPriceLimit(parsedPrice);
    setCurrentZip(zip);
    setCurrentCuisine(cuisine);
    fetchPage(parsedPrice, zip, cuisine, rating, 1);
    setModalData({ open: false, restaurantName: '', restaurantId: null, menuItems: [] });
  };

  const handleRestaurantClick = async (restaurantId, restaurantName) => {
    const menuEndpoint = currentPriceLimit !== null
      ? `/restaurants/${restaurantId}/menus/under/${currentPriceLimit}`
      : `/restaurants/${restaurantId}/menus/all`;

    try {
      const response = await axios.get(`http://localhost:5000${menuEndpoint}`);
      setModalData({
        open: true,
        restaurantName,
        restaurantId,
        menuItems: response.data,
      });
    } catch (err) {
      console.error('Failed to fetch menu:', err);
      setModalData({
        open: true,
        restaurantName,
        restaurantId,
        menuItems: [],
      });
    }
  };

  const handleReserveClick = (restaurant) => {
    setReservationModal({ open: true, restaurant });
  };

  const handleViewReservationsClick = (restaurant) => {
    setViewModal({ open: true, restaurant });
  };

  return (
    <div className="home-container">
      <header className="hero">
        <h1>Flavor Trail</h1>
        <p>Explore restaurants by price, rating, cuisine & more</p>
      </header>

      <SearchBar onSearch={handleSearch} />

      {loading && <div className="spinner" />}
      {errorMsg && <p className="error">{errorMsg}</p>}
      {results.length > 0 && <MapView locations={results} />}

      <div className="results-container">
        {results.map((item, index) => {
          const restaurant = {
            id: item.restaurant_id,
            name: item.restaurant_name,
          };
          return (
            <div className="card" key={index}>
              <h3>{item.restaurant_name}</h3>
              <p>{item.street_address}</p>
              <p>Rating: {isNaN(item.rating_score) ? 'N/A' : Number(item.rating_score).toFixed(1)}</p>
              <p>From ${isNaN(item.item_price) ? 'N/A' : Number(item.item_price).toFixed(2)}</p>
              <button onClick={() => handleRestaurantClick(restaurant.id, restaurant.name)}>
                View Menu
              </button>
              <button onClick={() => handleReserveClick(restaurant)}>
                Reserve
              </button>
              <button onClick={() => handleViewReservationsClick(restaurant)}>
                View Reservations
              </button>
            </div>
          );
        })}
      </div>

      {results.length > 0 && (
        <div className="pagination-controls">
          <button
            onClick={() => fetchPage(currentPriceLimit, currentZip, currentCuisine, null, currentPage - 1)}
            disabled={currentPage === 1}
          >
            ◀ Prev
          </button>
          <span>Page {currentPage} of {totalPages}</span>
          <button
            onClick={() => fetchPage(currentPriceLimit, currentZip, currentCuisine, null, currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            Next ▶
          </button>
        </div>
      )}

      {modalData.open && (
        <MenuModal
          restaurantName={modalData.restaurantName}
          menuItems={modalData.menuItems}
          onClose={() => setModalData({ ...modalData, open: false })}
        />
      )}

      {reservationModal.open && (
        <ReservationModal
          isOpen={true}
          restaurant={reservationModal.restaurant}
          onClose={() => setReservationModal({ ...reservationModal, open: false })}
        />
      )}

      {viewModal.open && (
        <ViewReservationsModal
          isOpen={true}
          restaurant={viewModal.restaurant}
          onClose={() => setViewModal({ ...viewModal, open: false })}
        />
      )}
    </div>
  );
};

export default Home;
