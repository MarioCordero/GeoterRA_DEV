import dayjs from "dayjs";
import "leaflet/dist/leaflet.css";
import PhoneInput from './PhoneInput';
import { 
  analysisRequestStore, 
  provincesIndex, 
  cantonsIndex, 
  districtsIndex 
} from '../../config/apiConf';
import { useSession } from '../../hooks/useSession';
import MapCoordinatePicker from './MapCoordinatePicker';
import React, { useState, useEffect, useRef } from "react";
import { Modal, Button, Form, Input, Radio, DatePicker, Upload, message, Spin, Select } from "antd";

const FORM_CACHE_KEY = "addPointFormCache";

const AddRequest = ({
  onRequestAdded,
  isAdmin = false,
  useTokenAuth = false
}) => {
  const { user, loading: sessionLoading } = useSession();
  const userEmail = user?.email;

  const [visible, setVisible] = useState(false);
  const [latLng, setLatLng] = useState({});
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const locationRequestRef = useRef(null);

  // Location selector state
  const [provinces, setProvinces] = useState([]);
  const [cantons, setCantons] = useState([]);
  const [districts, setDistricts] = useState([]);

  const [loadingProvinces, setLoadingProvinces] = useState(false);
  const [loadingCantons, setLoadingCantons] = useState(false);
  const [loadingDistricts, setLoadingDistricts] = useState(false);

  // Load provinces when modal opens
  useEffect(() => {
    if (visible) {
      loadProvinces();
      
      const cached = localStorage.getItem(FORM_CACHE_KEY);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (parsed.fecha && typeof parsed.fecha === "string") {
            parsed.fecha = dayjs(parsed.fecha);
          }
          form.setFieldsValue(parsed);
          if (parsed.lat && parsed.lng) {
            setLatLng({ lat: parsed.lat, lng: parsed.lng });
          }

          // Restore cantons and districts if cached
          if (parsed.provinceSnitCode) {
            handleProvinceChange(parsed.provinceSnitCode).then(() => {
              if (parsed.cantonSnitCode) {
                handleCantonChange(parsed.cantonSnitCode);
              }
            });
          }
        } catch (e) {
          console.error("Error loading cached form:", e);
        }
      }
    } else {
      setProvinces([]);
      setCantons([]);
      setDistricts([]);
    }
  }, [visible]);

  const loadProvinces = async () => {
    try {
      setLoadingProvinces(true);
      const res = await provincesIndex();
      if (res.ok && Array.isArray(res.data)) {
        setProvinces(res.data);
      }
    } catch (err) {
      console.error("Error loading provinces:", err);
    } finally {
      setLoadingProvinces(false);
    }
  };

  const handleProvinceChange = async (provinceSnitCode) => {
    form.setFieldsValue({
      cantonSnitCode: undefined,
      districtSnitCode: undefined
    });
    setCantons([]);
    setDistricts([]);

    if (!provinceSnitCode) return;

    try {
      setLoadingCantons(true);
      const res = await cantonsIndex(provinceSnitCode);
      if (res.ok && Array.isArray(res.data)) {
        setCantons(res.data);
      }
    } catch (err) {
      console.error("Error loading cantons:", err);
    } finally {
      setLoadingCantons(false);
    }
  };

  const handleCantonChange = async (cantonSnitCode) => {
    form.setFieldsValue({
      districtSnitCode: undefined
    });
    setDistricts([]);

    if (!cantonSnitCode) return;

    try {
      setLoadingDistricts(true);
      const res = await districtsIndex(cantonSnitCode);
      if (res.ok && Array.isArray(res.data)) {
        setDistricts(res.data);
      }
    } catch (err) {
      console.error("Error loading districts:", err);
    } finally {
      setLoadingDistricts(false);
    }
  };

  useEffect(() => {
    if (!visible) {
      if (locationRequestRef.current !== null) {
        locationRequestRef.current = null;
      }
    }
  }, [visible]);

  const handleOk = async () => {
    try {
      if (!userEmail) {
        message.error("Debes estar autenticado para enviar una solicitud");
        return;
      }

      const values = await form.validateFields();
      setLoading(true);

      const temperatureSensationMap = {
        "3": "Caliente",
        "2": "Templado",
        "1": "Natural"
      };

      const payload = {
        province_snit_code: Number(values.provinceSnitCode),
        canton_snit_code: Number(values.cantonSnitCode),
        district_snit_code: Number(values.districtSnitCode),
        owner_email: userEmail,
        owner_phone_number: values.contactNumber ? values.contactNumber.replace(/\D/g, '') : null,
        owner_name: values.propietario || "",
        temperature_sensation: temperatureSensationMap[values.sensTermica] || "Natural",
        bubbles: values.burbujeo === "1",
        details: values.direccion || "",
        exact_address: values.direccion || "",
        current_usage: values.usoActual || "Otro",
        latitude: latLng.lat ? Number(latLng.lat) : null,
        longitude: latLng.lng ? Number(latLng.lng) : null,
        relation_with_owner: "Titular",
      };

      const result = await analysisRequestStore(payload);
      if (result.ok) {
        setVisible(false);
        form.resetFields();
        localStorage.removeItem(FORM_CACHE_KEY);
        setLatLng({});

        if (onRequestAdded) {
          onRequestAdded();
        }

        Modal.success({
          title: "¡Solicitud enviada!",
          content: result.data?.message || "Tu solicitud fue enviada correctamente.",
        });
      } else {
        const errorMessage = result.error || "Error al enviar la solicitud";
        console.error("❌ API Response Error:", result);
        message.error(errorMessage);
      }
    } catch (err) {
      console.error("Request error:", err);
      if (err.errorFields) {
        message.warning("Por favor complete todos los campos requeridos");
      } else {
        message.error("Error al enviar la solicitud: " + err.message);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (locationRequestRef.current !== null) {
      locationRequestRef.current = null;
    }
    setLatLng({});
    setVisible(false);
  };

  // Update lat/lng in form and cache when map is clicked
  useEffect(() => {
    if (latLng.lat && latLng.lng) {
      form.setFieldsValue({ lat: latLng.lat, lng: latLng.lng });
      const current = form.getFieldsValue();
      localStorage.setItem(FORM_CACHE_KEY, JSON.stringify({ ...current, lat: latLng.lat, lng: latLng.lng }));
    }
  }, [latLng]);

  const renderStatusMessage = () => {
    if (sessionLoading) {
      return (
        <div style={{
          padding: "10px",
          backgroundColor: "#e6f7ff",
          border: "1px solid #91d5ff",
          borderRadius: "4px",
          marginBottom: "16px",
          color: "#1890ff",
          textAlign: "center"
        }}>
          <Spin size="small" /> Verificando sesión de usuario...
        </div>
      );
    }

    if (!userEmail) {
      return (
        <div style={{
          padding: "10px",
          backgroundColor: "#fff2e8",
          border: "1px solid #ffbb96",
          borderRadius: "4px",
          marginBottom: "16px",
          color: "#d46b08"
        }}>
          ⚠️ Debes iniciar sesión para agregar una solicitud
        </div>
      );
    }

    return null;
  };

  return (
    <>
      <Button type="primary" onClick={() => setVisible(true)} disabled={!userEmail}>
        Agregar Solicitud
      </Button>

      <Modal
        title="Formulario de solicitud de puntos"
        open={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        width={700}
        confirmLoading={loading}
        footer={[
          <Button key="back" onClick={handleCancel} disabled={loading}>
            Cancelar
          </Button>,
          <Button
            key="submit"
            type="primary"
            onClick={handleOk}
            loading={loading}
            disabled={!userEmail}
          >
            Enviar
          </Button>,
        ]}
      >
        {renderStatusMessage()}

        <Form layout="vertical" form={form}>
          <PhoneInput form={form} name="contactNumber" required={true} />

          {/* Location Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-3">
            <Form.Item
              label="Provincia"
              name="provinceSnitCode"
              rules={[{ required: true, message: "Seleccione una provincia" }]}
            >
              <Select
                placeholder="Provincia"
                loading={loadingProvinces}
                onChange={handleProvinceChange}
                options={provinces.map((p) => ({
                  value: p.province_snit_code,
                  label: p.province_name,
                }))}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>

            <Form.Item
              label="Cantón"
              name="cantonSnitCode"
              rules={[{ required: true, message: "Seleccione un cantón" }]}
            >
              <Select
                placeholder="Cantón"
                loading={loadingCantons}
                disabled={cantons.length === 0}
                onChange={handleCantonChange}
                options={cantons.map((c) => ({
                  value: c.canton_snit_code,
                  label: c.canton_name,
                }))}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>

            <Form.Item
              label="Distrito"
              name="districtSnitCode"
              rules={[{ required: true, message: "Seleccione un distrito" }]}
            >
              <Select
                placeholder="Distrito"
                loading={loadingDistricts}
                disabled={districts.length === 0}
                options={districts.map((d) => ({
                  value: d.district_snit_code,
                  label: d.district_name,
                }))}
                showSearch
                optionFilterProp="label"
              />
            </Form.Item>
          </div>

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
            <Select 
              placeholder="Uso que se le da a la zona" 
              options={[
                { value: 'Residencial', label: 'Residencial' },
                { value: 'Comercial', label: 'Comercial' },
                { value: 'Turístico', label: 'Turístico' },
                { value: 'Conservación', label: 'Conservación' },
                { value: 'Ganadería', label: 'Ganadería' },
                { value: 'Otro', label: 'Otro' }
              ]} 
            />
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

          {/* Map Section with Coordinate Picker */}
          <Form.Item label="Lugar en GPS">
            <MapCoordinatePicker
              latLng={latLng}
              onCoordinatesChange={(coords) => {
                setLatLng(coords);
              }}
              title="Coordenadas GPS"
              mapHeight="300px"
              showApplyButton={false}
              showClearButton={true}
            />
          </Form.Item>
        </Form>

        {loading && (
          <div style={{ textAlign: "center", marginTop: 16 }}>
            <Spin />
          </div>
        )}
      </Modal>
    </>
  );
};

export default AddRequest;