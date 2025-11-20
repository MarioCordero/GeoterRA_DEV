import React from 'react';
import LoginForm from '../components/loginComponents/loginForm';
import Header from '../components/Header';

const Login = () => {
  return (
    <div className="general-container">
      {/* TODO: Replace with <Navbar /> */}
      <Header />

      <div className="index-container Montserrat-Regular">
        <LoginForm />
      </div>

      {/* TODO: Replace with <Footer /> */}
    </div>
  );
};

export default Login;