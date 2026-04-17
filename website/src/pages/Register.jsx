import React from 'react';
import { useState } from 'react';
import RegisterForm from '../components/registerComponents/registerForm';
import AppHeader from '../components/common/Header';
import Footer from '../components/common/Footer';

const Register = () => {
  return (
    <div className="general-container">
      <AppHeader />
      <div className="index-container Montserrat-Regular">
        <RegisterForm />
      </div>
      <Footer />
    </div>
  );
};
export default Register;