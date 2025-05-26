import React from 'react';
import WelcomeSection from '../components/homepage/index-welcome';
import AboutUsSection from '../components/homepage/index-about-us';
import HowWorksSection from '../components/homepage/index-how-works';
import ContactUsSection from '../components/homepage/index-contact-us';
import Header from '../components/Header';

const Home = () => {
  return (
    <div className="general-container">
      {/* TODO: Replace with <Navbar /> */}
      <Header />

      <div className="index-container Montserrat-Regular">
        <WelcomeSection />
        <AboutUsSection />
        <HowWorksSection />
        <ContactUsSection />
      </div>

      {/* TODO: Replace with <Footer /> */}
    </div>
  );
};

export default Home;

