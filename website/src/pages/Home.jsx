import React, { useEffect, useState } from 'react';
import WelcomeSection from '../components/homeComponents/index-welcome';
import AboutUsSection from '../components/homeComponents/index-about-us';
import HowWorksSection from '../components/homeComponents/index-how-works';
import ContactUsSection from '../components/homeComponents/index-contact-us';
import LoggedHeader from '../components/loggedHeader';
import Header from '../components/Header';
import Footer from '../components/Footer';

const Home = () => {
  const [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    // Check session on mount
    const checkSession = async () => {
      try {
        console.log("Checking session...");
        // http://163.178.171.105/API/check_session.php
        // http://geoterra.com/API/check_session.php
        const response = await fetch("http://geoterra.com/API/check_session.php", {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        console.log("Session check response:", data);
        
        if (data.status === 'logged_in') {
          console.log('Session is active');
          setIsLogged(true);
        } else {
          console.log('Session is not active');
          setIsLogged(false);
        }
      } catch (err) {
        console.error("Session check failed:", err);
        console.log('Session check failed');
        setIsLogged(false);
      }
    };
    
    checkSession();
  }, []);

  return (
    <div className="general-container">
      {isLogged ? <LoggedHeader /> : <Header />}

      <div className="index-container Montserrat-Regular">
        <WelcomeSection />
        <AboutUsSection />
        <HowWorksSection />
        <ContactUsSection />
      </div>

      <Footer />
    </div>
  );
};

export default Home;