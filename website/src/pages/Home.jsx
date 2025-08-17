import React, { useEffect, useState } from 'react';
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

  useEffect(() => {
    // Check session on mount with token support
    const checkSession = async () => {
      try {
        setLoading(true);
        // DEBUG
        // console.log("Checking session with token...");
        
        // Check if we have a token first
        const token = getSessionToken();
        // DEBUG
        // console.log("Session token present:", !!token);

        const response = await fetch(buildApiUrl("check_session.php"), {
          method: "GET",
          credentials: "include",
          headers: buildHeaders(), // Include token in headers
        });
        
        const apiResponse = await response.json();
        // DEBUG
        // console.log("Session check response:", apiResponse);

        if (apiResponse.response === 'Ok' && 
            apiResponse.data && 
            apiResponse.data.status === 'logged_in') {
          // DEBUG
          // console.log('✅ Session is active for user:', apiResponse.data.user);
          setIsLogged(true);
        } else {
          // DEBUG
          // console.log('❌ Session is not active');
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
        <AboutUsSection />
        <HowWorksSection />
        <ContactUsSection />
      </div>

      <Footer />
    </div>
  );
};

export default Home;