import React from 'react';
import WelcomeSection from '../components/homeComponents/index-welcome';
import AboutUsSection from '../components/homeComponents/index-about-us';
import HowWorksSection from '../components/homeComponents/index-how-works';
import ContactUsSection from '../components/homeComponents/index-contact-us';
import Header from '../components/Header';
import Footer from '../components/Footer';

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
      <Footer />
    </div>
  );
};

export default Home;

