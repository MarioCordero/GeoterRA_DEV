import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import WelcomeSection from '../components/homeComponents/index-welcome';
import AboutUsSection from '../components/homeComponents/index-about-us';
import HowWorksSection from '../components/homeComponents/index-how-works';
import ContactUsSection from '../components/homeComponents/index-contact-us';
import LoggedHeader from '../components/common/loggedHeader';
import Header from '../components/common/Header';
import Footer from '../components/common/Footer';
import { useSession } from '../hooks/useSession';

const Home = () => {
  const { isLogged, loading } = useSession();
  const location = useLocation();

  // TODO, MAKE THIS COMPONENT GLOBAL, AND USE IT IN ALL PAGES, TO HANDLE HASH NAVIGATION SMOOTHLY
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 64;
      const elementPosition = element.offsetTop - headerHeight;
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    if (!loading && location.hash) {
      const hash = location.hash.replace('#', '');
      setTimeout(() => {
        scrollToSection(hash);
      }, 300);
    }
  }, [loading, location.hash]);

  if (loading) {
    return (
      // TODO MAKE A GEOTERRA LOADER COMPONENT 
      <div className="general-container">
        <Header />
        <div className="index-container Montserrat-Regular flex justify-center items-center min-h-screen">
          <div className="text-center">
            <p>Verificando sesión...</p>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="general-container">
      {isLogged ? <LoggedHeader /> : <Header />}
      <div className="index-container Montserrat-Regular">
        <WelcomeSection />
        <section id="about-us">
          <AboutUsSection />
        </section>
        <section id="how-works">
          <HowWorksSection />
        </section>
        <section id="contact-us">
          <ContactUsSection />
        </section>
      </div>
      <Footer />
    </div>
  );
};

export default Home;