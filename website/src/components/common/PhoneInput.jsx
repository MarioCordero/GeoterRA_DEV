import React from "react";
import { Form, Input } from "antd";

const PhoneInput = ({ form }) => (
  <Form.Item
    label="Número de contacto"
    name="contactNumber"
    rules={[
      { required: true, message: "Por favor ingrese un número de contacto" },
      { pattern: /^[0-9+\s()-]{8,20}$/, message: "Ingrese un número válido" }
    ]}
  >
    <Input
      placeholder="Ej: +506 8888 8888"
      maxLength={20}
      autoComplete="tel"
    />
  </Form.Item>
);

export default PhoneInput;