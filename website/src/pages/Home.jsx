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
        const response = await fetch("http://163.178.171.105/API/check_session.php", {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        console.log("Session check response:", data);
        setIsLogged(data.status === "logged_in");
      } catch (err) {
        console.error("Session check failed:", err);
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