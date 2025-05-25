import React from 'react';
import ReactDOM from 'react-dom/client';
import './main.css';

// General components
import Header from './header.jsx'; // Import the Header component
import Footer from './footer.jsx'; // Import the Footer component

// Index components
import IndexWelcome from './indexComponents/index-welcome.jsx'; // Import the IndexWelcome component
import IndexAboutUs from './indexComponents/index-about-us.jsx'; // Import the IndexAboutUs component
import IndexHowWorks from './indexComponents/index-how-works.jsx'; // Import the IndexHowWorks component
import IndexContactUs from './indexComponents/index-contact-us.jsx'; // Import the IndexContactUs component
// Login components
import Login from './loginComponents/login.jsx'; // Import the SidebarLayout component
import LoginSideBar from './loginComponents/loginSidebar.jsx'; // Import the Login component

// Get DOM elements where React components will be mounted
const WelcomeCard = document.getElementById('Welcome-card'); // looks for the div with "Welcome-card" id
const AboutUsCard = document.getElementById('About-us-card'); // looks for the div with "About-us-card" id
const HowWorksCard = document.getElementById('How-works-card'); // looks for the div with "How-works-card" id
const ContactUsCard = document.getElementById('Contact-us-card'); // looks for the div with "Contact-us-card" id

const SideBar = document.getElementById('Sidebar-ant'); // looks for the div with "Sidebar-ant" id
const LoginPage = document.getElementById('Login-Page'); // looks for the div with "Login-Page" id

const HeaderElement = document.getElementById('Header-component'); // looks for the div with "Header" id
const FooterElement = document.getElementById('Footer-component'); // looks for the div with "Footer" id

if (LoginPage) {
  const LoginPageRoot = ReactDOM.createRoot(LoginPage);
  LoginPageRoot.render(
    <React.StrictMode>
      <Header />
      <Login />
      <Footer />
    </React.StrictMode>
  );
}

// INDEX COMPONENTS
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