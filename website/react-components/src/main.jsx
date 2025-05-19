import React from 'react';
import ReactDOM from 'react-dom/client';
import './main.css';
import IndexWelcome from './index-welcome.jsx';
import IndexAboutUs from './index-about-us.jsx'
import IndexHowWorks from './index-how-works.jsx'
import IndexContactUs from './index-contact-us.jsx';
import SidebarLayout from './sidebar.jsx';

// Get DOM elements where React components will be mounted
const WelcomeCard = document.getElementById('Welcome-card'); // looks for the div with "Welcome-card" id
const AboutUsCard = document.getElementById('About-us-card'); // looks for the div with "About-us-card" id
const HowWorksCard = document.getElementById('How-works-card'); // looks for the div with "How-works-card" id
const ContactUsCard = document.getElementById('Contact-us-card'); // looks for the div with "Contact-us-card" id
const SideBar = document.getElementById('Sidebar-ant'); // looks for the div with "Sidebar-ant" id

if (SideBar) {
  const SidebarRoot = ReactDOM.createRoot(SideBar);
  SidebarRoot.render(
    <React.StrictMode>
      <SidebarLayout />
    </React.StrictMode>
  );
}

if (WelcomeCard) {
  const WelcomeRoot = ReactDOM.createRoot(WelcomeCard);
  
  WelcomeRoot.render(
    <React.StrictMode>
      <IndexWelcome />  {/* This is your Welcome component */}
    </React.StrictMode>
  );
}

if (AboutUsCard) {
  const AboutUsRoot = ReactDOM.createRoot(AboutUsCard);
  
  AboutUsRoot.render(
    <React.StrictMode>
      <IndexAboutUs />  {/* This is your About Us component */}
    </React.StrictMode>
  );
}

if (HowWorksCard) {
  const HowWorksRoot = ReactDOM.createRoot(HowWorksCard);
  
  HowWorksRoot.render(
    <React.StrictMode>
      <IndexHowWorks />  {/* This is your About Us component */}
    </React.StrictMode>
  );
}

if (ContactUsCard) {
  const ContactUsRoot = ReactDOM.createRoot(ContactUsCard);
  
  ContactUsRoot.render(
    <React.StrictMode>
      <IndexContactUs />  {/* This is your About Us component */}
    </React.StrictMode>
  );
}
