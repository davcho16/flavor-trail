// src/components/MenuModal.js
import React from 'react';
import './MenuModal.css';

const MenuModal = ({ restaurantName, menuItems, onClose }) => {
  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="close-button" onClick={onClose}>×</button>
        <h2>{restaurantName}</h2>
        <hr />
        {menuItems.length > 0 ? (
          <ul className="menu-list">
            {menuItems.map((item, index) => (
              <li key={index} className="menu-item">
                <div className="menu-header">
                  <span className="menu-name">{item.item_name}</span>
                  <span className="menu-price">${parseFloat(item.item_price).toFixed(2)}</span>
                </div>
                {item.item_description && (
                  <p className="menu-description">{item.item_description}</p>
                )}
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-items">No menu items under that price.</p>
        )}
      </div>
    </div>
  );
};

export default MenuModal;
