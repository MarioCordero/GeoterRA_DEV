import React from 'react';
import LoginForm from '../components/loginComponents/loginForm';
import Header from '../components/common/Header';

const Login = () => {
  return (
    <div className="general-container">
      <Header />
      <div className="index-container Montserrat-Regular">
        <LoginForm />
      </div>
    </div>
  );
};

export default Login;