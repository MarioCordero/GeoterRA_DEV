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
import { 
  Modal, Button, Form, Input, Radio, Upload, message, Spin, Select, Card, Switch 
} from "antd";
import { 
  EnvironmentFilled, ExperimentOutlined, UserOutlined, PlusCircleOutlined 
} from "@ant-design/icons";

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
  const [hasOwnerInfo, setHasOwnerInfo] = useState("0"); // "0": No (default/null), "1": Sí (Conozco al propietario)

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
          form.setFieldsValue(parsed);
          if (parsed.lat && parsed.lng) {
            setLatLng({ lat: parsed.lat, lng: parsed.lng });
          }
          if (parsed.hasOwnerInfo) {
            setHasOwnerInfo(parsed.hasOwnerInfo);
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
      setHasOwnerInfo("0");
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

  const handleOk = async () => {
    try {
      if (!userEmail) {
        message.error("Debes estar autenticado para enviar una solicitud");
        return;
      }

      const values = await form.validateFields();
      setLoading(true);

      // Build payload matching RegisterInvestigationRequestDTO
      const payload = {
        province_snit_code: Number(values.provinceSnitCode),
        canton_snit_code: Number(values.cantonSnitCode),
        district_snit_code: Number(values.districtSnitCode),
        current_usage: values.currentUsage || "Otro",
        temperature_sensation: values.temperatureSensation || "Natural",
        bubbles: values.bubbles === "1" || values.bubbles === true,
        exact_address: values.exactAddress?.trim() || null,
        details: values.details?.trim() || null,
        latitude: latLng.lat ? Number(latLng.lat) : null,
        longitude: latLng.lng ? Number(latLng.lng) : null,
        
        // Owner info is completely optional (null if not provided or unknown)
        owner_name: hasOwnerInfo === "1" && values.ownerName?.trim() ? values.ownerName.trim() : null,
        owner_phone_number: hasOwnerInfo === "1" && values.contactNumber ? values.contactNumber.replace(/\D/g, '') : null,
        owner_email: hasOwnerInfo === "1" && values.ownerEmail?.trim() ? values.ownerEmail.trim() : null,
        relation_with_owner: hasOwnerInfo === "1" && values.relationWithOwner ? values.relationWithOwner : (hasOwnerInfo === "1" ? "Titular" : null),
      };

      const result = await analysisRequestStore(payload);
      if (result.ok) {
        setVisible(false);
        form.resetFields();
        localStorage.removeItem(FORM_CACHE_KEY);
        setLatLng({});
        setHasOwnerInfo("0");

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
    setLatLng({});
    setHasOwnerInfo("0");
    setVisible(false);
  };

  // Cache coordinates and form data when changed
  useEffect(() => {
    if (latLng.lat && latLng.lng) {
      form.setFieldsValue({ lat: latLng.lat, lng: latLng.lng });
      const current = form.getFieldsValue();
      localStorage.setItem(FORM_CACHE_KEY, JSON.stringify({ ...current, lat: latLng.lat, lng: latLng.lng, hasOwnerInfo }));
    }
  }, [latLng, hasOwnerInfo]);

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
      <Button 
        type="primary" 
        size="large"
        icon={<PlusCircleOutlined />}
        onClick={() => setVisible(true)} 
        disabled={!userEmail}
      >
        Agregar Solicitud
      </Button>

      <Modal
        title={
          <div className="flex items-center gap-2 py-2 pr-6 border-b border-gray-100">
            <span className="poppins-bold text-xl text-geoterra-blue">
              Formulario de Solicitud de Manifestación
            </span>
          </div>
        }
        open={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        width="88vw"
        style={{ top: 20, maxWidth: '1100px' }}
        bodyStyle={{ padding: '24px 32px 32px 32px' }}
        confirmLoading={loading}
        footer={[
          <Button key="back" size="large" onClick={handleCancel} disabled={loading}>
            Cancelar
          </Button>,
          <Button
            key="submit"
            type="primary"
            size="large"
            onClick={handleOk}
            loading={loading}
            disabled={!userEmail}
          >
            Enviar Solicitud
          </Button>,
        ]}
      >
        {renderStatusMessage()}

        <Form 
          layout="vertical" 
          form={form} 
          className="poppins space-y-8"
          initialValues={{
            temperatureSensation: "Natural",
            currentUsage: "Residencial",
            bubbles: "0"
          }}
        >
          {/* Section 1: Ubicación Geográfica */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-geoterra-blue border-b border-gray-100 pb-3 flex items-center gap-2">
              <EnvironmentFilled /> Ubicación de la Manifestación
            </h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <Form.Item
                label="Provincia"
                name="provinceSnitCode"
                rules={[{ required: true, message: "Seleccione una provincia" }]}
              >
                <Select
                  size="large"
                  placeholder="Seleccione provincia"
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
                  size="large"
                  placeholder="Seleccione cantón"
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
                  size="large"
                  placeholder="Seleccione distrito"
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

            <Form.Item label="Dirección Exacta" name="exactAddress">
              <Input.TextArea rows={2} placeholder="Ej. Camino a Bagaces, 200 m norte de escuela..." />
            </Form.Item>
          </div>

          {/* Section 2: Características de la Manifestación */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-geoterra-blue border-b border-gray-100 pb-3 flex items-center gap-2">
              <ExperimentOutlined /> Características de la Manifestación
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Form.Item 
                label="Uso Actual del Terreno" 
                name="currentUsage" 
                rules={[{ required: true, message: "Seleccione el uso actual" }]}
              >
                <Select
                  size="large"
                  placeholder="Seleccione el uso del terreno"
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

              <Form.Item 
                label="Sensación Térmica" 
                name="temperatureSensation" 
                rules={[{ required: true, message: "Seleccione la sensación térmica" }]}
              >
                <Select
                  size="large"
                  placeholder="Sensación térmica percibida"
                  options={[
                    { value: 'Hirviendo', label: '🔥 Hirviendo' },
                    { value: 'Muy Caliente', label: '🌶️ Muy Caliente' },
                    { value: 'Caliente', label: '🥵 Caliente' },
                    { value: 'Templado', label: '🌤️ Templado' },
                    { value: 'Natural', label: '🍃 Natural' },
                    { value: 'Sin Especificar', label: '🤷 Sin Especificar' }
                  ]}
                />
              </Form.Item>

              <Form.Item label="Burbujeo Activo" name="bubbles">
                <Radio.Group size="large" className="pt-2">
                  <Radio value="1">Sí (Activo)</Radio>
                  <Radio value="0">No</Radio>
                </Radio.Group>
              </Form.Item>
            </div>

            <Form.Item label="Detalles u Observaciones Adicionales" name="details">
              <Input.TextArea rows={3} placeholder="Describa detalles adicionales sobre la emanación de vapor, gas o temperatura observada..." />
            </Form.Item>
          </div>

          {/* Section 3: Información del Propietario (OPCIONAL) */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-3 gap-2">
              <h3 className="text-lg font-bold text-geoterra-blue flex items-center gap-2 m-0">
                <UserOutlined /> Información del Propietario <span className="text-xs text-gray-400 font-normal">(Opcional)</span>
              </h3>
              
              <div className="flex items-center gap-3">
                <span className="text-sm font-semibold text-gray-600">¿Conoce al propietario?</span>
                <Radio.Group 
                  value={hasOwnerInfo} 
                  onChange={(e) => setHasOwnerInfo(e.target.value)}
                  buttonStyle="solid"
                >
                  <Radio.Button value="0">No (Desconocido)</Radio.Button>
                  <Radio.Button value="1">Sí (Ingresar datos)</Radio.Button>
                </Radio.Group>
              </div>
            </div>

            {hasOwnerInfo === "1" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
                <Form.Item label="Nombre del Propietario" name="ownerName">
                  <Input size="large" placeholder="Nombre completo del propietario" />
                </Form.Item>

                <Form.Item label="Relación con el Propietario" name="relationWithOwner">
                  <Select size="large" defaultValue="Titular" options={[
                    { value: 'Titular', label: 'Propietario / Titular' },
                    { value: 'Familiar', label: 'Familiar' },
                    { value: 'Empleado', label: 'Empleado' },
                    { value: 'Socio', label: 'Socio' },
                    { value: 'Conocido', label: 'Conocido' }
                  ]} />
                </Form.Item>

                <Form.Item label="Correo del Propietario" name="ownerEmail">
                  <Input size="large" type="email" placeholder="correo@ejemplo.com" />
                </Form.Item>

                <Form.Item label="Teléfono del Propietario" name="contactNumber">
                  <PhoneInput size="large" />
                </Form.Item>
              </div>
            )}
          </div>

          {/* Section 4: Geolocalización en Mapa */}
          <div className="bg-white p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-lg font-bold text-geoterra-blue border-b border-gray-100 pb-3 flex items-center gap-2">
              <EnvironmentFilled /> Geolocalización GPS
            </h3>

            <MapCoordinatePicker
              latLng={latLng}
              onCoordinatesChange={(coords) => {
                setLatLng(coords);
              }}
              title="Coordenadas GPS"
              mapHeight="350px"
              showApplyButton={false}
              showClearButton={true}
            />
          </div>
        </Form>
      </Modal>
    </>
  );
};

export default AddRequest;