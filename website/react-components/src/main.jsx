import React from 'react';
import ReactDOM from 'react-dom/client';
import './main.css';
import IndexWelcome from './index-welcome.jsx';

const WelcomeCard = document.getElementById('Welcome-card'); // Busca el div con id "Welcome-card"

// Renderiza el componente dentro del div con id "Welcome-card"
const Card = ReactDOM.createRoot(WelcomeCard);
Card.render(
  <React.StrictMode>
    <IndexWelcome />  {/* Aquí se renderiza tu componente */}
  </React.StrictMode>
);
