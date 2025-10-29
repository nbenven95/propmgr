import React, { useState } from 'react';
import PhoneInputForm from '../components/forms/PhoneInputForm';

const PhoneTest = () => {

  console.count('Parent render');

  const [phone, setPhone] = useState('');
  return (
    <PhoneInputForm value={phone} onChange={setPhone} />
  );
};

export default PhoneTest;