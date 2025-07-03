import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Input, Radio, DatePicker, Upload } from "antd";
import { MapContainer, TileLayer, Marker, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const defaultPosition = [9.93333, -84.08333]; // Example: San José, Costa Rica
const FORM_CACHE_KEY = "addPointFormCache";

function LocationMarker({ setLatLng }) {
  const [position, setPosition] = useState(null);

  useMapEvents({
    click(e) {
      setPosition(e.latlng);
      setLatLng(e.latlng);
    },
  });

  return position === null ? null : <Marker position={position} />;
}

const AddPointModal = () => {
  const [visible, setVisible] = useState(false);
  const [latLng, setLatLng] = useState({});
  const [form] = Form.useForm();

  // Load cached form data when modal opens
  useEffect(() => {
    if (visible) {
      const cached = localStorage.getItem(FORM_CACHE_KEY);
      if (cached) {
        const parsed = JSON.parse(cached);
        form.setFieldsValue(parsed);
        if (parsed.lat && parsed.lng) setLatLng({ lat: parsed.lat, lng: parsed.lng });
      }
    }
  }, [visible, form]);

  // Save form data to cache on change
  const handleValuesChange = (_, allValues) => {
    localStorage.setItem(FORM_CACHE_KEY, JSON.stringify(allValues));
  };

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        // TODO: handle form submission (API call)
        setVisible(false);
        form.resetFields();
        localStorage.removeItem(FORM_CACHE_KEY);
      })
      .catch(() => {});
  };

  const handleCancel = () => {
    setVisible(false);
    // Do not clear cache here, so user can resume later
  };

  // Update lat/lng in form and cache when map is clicked
  useEffect(() => {
    if (latLng.lat && latLng.lng) {
      form.setFieldsValue({ lat: latLng.lat, lng: latLng.lng });
      const current = form.getFieldsValue();
      localStorage.setItem(FORM_CACHE_KEY, JSON.stringify({ ...current, lat: latLng.lat, lng: latLng.lng }));
    }
    // eslint-disable-next-line
  }, [latLng]);

  return (
    <>
      <Button type="primary" onClick={() => setVisible(true)}>
        Agregar punto
      </Button>
      <Modal
        title="Formulario de solicitud de puntos"
        open={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={700}
        footer={[
          <Button key="back" onClick={handleCancel}>
            Cancelar
          </Button>,
          <Button key="submit" type="primary" onClick={handleOk}>
            Enviar
          </Button>,
        ]}
      >
        <Form
          layout="vertical"
          form={form}
          onValuesChange={handleValuesChange}
        >
          <Form.Item label="Nombre del punto" name="pointId" rules={[{ required: true }]}>
            <Input placeholder="Ingrese el ID del punto" />
          </Form.Item>
          <Form.Item label="Número de contacto" name="contactNumber" rules={[{ required: true }]}>
            <Input placeholder="Ingrese un número de contacto" />
          </Form.Item>
          <Form.Item label="Fecha" name="fecha" rules={[{ required: true }]}>
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>
          <Form.Item label="Sensación térmica" name="sensTermica" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value="3">Caliente</Radio>
              <Radio value="2">Tibio</Radio>
              <Radio value="1">Frio</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="Propietario de la zona" name="propietario">
            <Input placeholder="En caso de que sea en propiedad privada" />
          </Form.Item>
          <Form.Item label="Uso actual" name="usoActual">
            <Input placeholder="Uso que se le da a la zona" />
          </Form.Item>
          <Form.Item label="Presenta burbujeo" name="burbujeo" rules={[{ required: true }]}>
            <Radio.Group>
              <Radio value="1">Sí</Radio>
              <Radio value="0">No</Radio>
            </Radio.Group>
          </Form.Item>
          <Form.Item label="Indicaciones para llegar al lugar" name="direccion">
            <Input.TextArea placeholder="Como se llega a la zona" />
          </Form.Item>
          <Form.Item label="Subir Foto" name="foto" valuePropName="fileList" getValueFromEvent={e => e && e.fileList}>
            <Upload beforeUpload={() => false} maxCount={1}>
              <Button>Seleccionar archivo</Button>
            </Upload>
          </Form.Item>
          <Form.Item label="Lugar en GPS">
            <div style={{ height: 250, marginBottom: 8 }}>
              <MapContainer center={defaultPosition} zoom={8} style={{ height: "100%", width: "100%" }}>
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <LocationMarker setLatLng={setLatLng} />
              </MapContainer>
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
              <Input
                placeholder="Latitud"
                value={latLng.lat || ""}
                readOnly
                style={{ width: "50%" }}
              />
              <Input
                placeholder="Longitud"
                value={latLng.lng || ""}
                readOnly
                style={{ width: "50%" }}
              />
            </div>
          </Form.Item>
        </Form>
      </Modal>
    </>
  );
};

export default AddPointModal; 