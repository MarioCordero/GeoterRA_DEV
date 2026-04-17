import React from 'react';
import LoginForm from '../components/loginComponents/loginForm';
import AppHeader from '../components/common/Header';

const Login = () => {
  return (
    <div className="general-container">
      <AppHeader />
      <div className="index-container Montserrat-Regular">
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;