import React from 'react';
import WelcomeSection from '../components/homepage/index-welcome';
import AboutUsSection from '../components/homepage/index-about-us';
import HowWorksSection from '../components/homepage/index-how-works';
import ContactUsSection from '../components/homepage/index-contact-us';

const Home = () => {
  return (
    <div className="general-container">
      {/* TODO: Replace with <Navbar /> */}
      <h1 className="text-5xl font-bold text-red-600">TestING Tailwind</h1>

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

