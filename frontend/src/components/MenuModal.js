// MenuModal.js
// React component that displays a list of menu items for a selected restaurant in a modal popup.
// Used to show affordable menu options filtered by price.
// Renders menu item name, price, and description, or a fallback message if no items are found.

import React from 'react';
import './MenuModal.css'; // Modal and menu styling

const MenuModal = ({ restaurantName, menuItems, onClose }) => {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>&times;</button>
        <h2>{restaurantName} Menu</h2>
        <hr />
        <ul className="menu-list">
          {menuItems.length === 0 ? (
            <p className="no-items">No items found under the selected price.</p>
          ) : (
            menuItems.map((item, index) => (
              <li key={index} className="menu-item">
                <div className="menu-header">
                  <span className="menu-name">{item.item_name}</span>
                  <span className="menu-price">
                    {isNaN(Number(item.item_price)) ? 'N/A' : `$${Number(item.item_price).toFixed(2)}`}
                  </span>
                </div>
                <p className="menu-description">{item.item_description}</p>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
  );
};

export default MenuModal;
