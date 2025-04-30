import React from 'react';
import ReactDOM from 'react-dom/client';
import './main.css';
import IndexWelcome from './index-welcome.jsx';
import IndexAboutUs from './index-about-us.jsx'

// Get DOM elements where React components will be mounted
const WelcomeCard = document.getElementById('Welcome-card'); // looks for the div with "Welcome-card" id
const AboutUsCard = document.getElementById('About-us-card'); // looks for the div with "Welcome-card" id

// Render Welcome component inside the div with id "Welcome-card"
if (WelcomeCard) {
  // Create a React root on the DOM element
  const WelcomeRoot = ReactDOM.createRoot(WelcomeCard);
  
  // Render the React component inside StrictMode
  // StrictMode helps catch potential problems during development
  WelcomeRoot.render(
    <React.StrictMode>
      <IndexWelcome />  {/* This is your Welcome component */}
    </React.StrictMode>
  );
}

// Render AboutUs component inside the div with id "About-us-card"
if (AboutUsCard) {
  // Create a separate React root for the AboutUs component
  const AboutUsRoot = ReactDOM.createRoot(AboutUsCard);
  
  // Render the component with StrictMode
  AboutUsRoot.render(
    <React.StrictMode>
      <IndexAboutUs />  {/* This is your About Us component */}
    </React.StrictMode>
  );
}