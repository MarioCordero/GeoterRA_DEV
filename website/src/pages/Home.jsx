import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import WelcomeSection from '../components/homeComponents/index-welcome';
import AboutUsSection from '../components/homeComponents/index-about-us';
import HowWorksSection from '../components/homeComponents/index-how-works';
import ContactUsSection from '../components/homeComponents/index-contact-us';
import LoggedHeader from '../components/loggedHeader';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { buildApiUrl } from '../config/apiConf';

const Home = () => {
  const [isLogged, setIsLogged] = useState(false);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  // Session token management functions (same as in loginForm)
  const getSessionToken = () => {
    return localStorage.getItem('geoterra_session_token');
  };

  const buildHeaders = () => {
    const headers = {};
    const token = getSessionToken();
    if (token) {
      headers['X-Session-Token'] = token;
    }
    return headers;
  };

  // Smooth scroll function
  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const headerHeight = 64; // Header height (h-16 = 64px)
      const elementPosition = element.offsetTop - headerHeight;
      
      window.scrollTo({
        top: elementPosition,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    // Check session on mount with token support
    const checkSession = async () => {
      try {
        setLoading(true);
        
        // Check if we have a token first
        const token = getSessionToken();

        const response = await fetch(buildApiUrl("check_session.php"), {
          method: "GET",
          credentials: "include",
          headers: buildHeaders(), // Include token in headers
        });
        
        const apiResponse = await response.json();

        if (apiResponse.response === 'Ok' && 
            apiResponse.data && 
            apiResponse.data.status === 'logged_in') {
          setIsLogged(true);
        } else {
          setIsLogged(false);
          // Optionally clear invalid token
          if (token) {
            console.log('Clearing invalid session token');
            localStorage.removeItem('geoterra_session_token');
          }
        }
      } catch (err) {
        console.error("Session check failed:", err);
        console.log('Session check failed');
        setIsLogged(false);
        // Clear token on error
        localStorage.removeItem('geoterra_session_token');
      } finally {
        setLoading(false);
      }
    };
    
    checkSession();
  }, []);

  // Handle hash-based navigation after page loads
  useEffect(() => {
    if (!loading && location.hash) {
      const hash = location.hash.replace('#', '');
      // Wait a bit longer for all components to render
      setTimeout(() => {
        scrollToSection(hash);
      }, 300);
    }
  }, [loading, location.hash]);

  // Show loading state while checking session
  if (loading) {
    return (
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
        
        {/* About Us Section with ID */}
        <section id="about-us">
          <AboutUsSection />
        </section>
        
        {/* How Works Section with ID */}
        <section id="how-works">
          <HowWorksSection />
        </section>
        
        {/* Contact Us Section with ID */}
        <section id="contact-us">
          <ContactUsSection />
        </section>
      </div>

      <Footer />
    </div>
  );
};

export default Home;