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
  Modal, Button, Form, Input, Radio, Upload, message, Spin, Select, Card, Switch, Slider, Checkbox, Tag, ConfigProvider, Alert
} from "antd";
import {
  EnvironmentFilled, ExperimentOutlined, UserOutlined, PlusCircleOutlined, ExclamationCircleOutlined
} from "@ant-design/icons";

const FORM_CACHE_KEY = "addPointFormCache";

const TEMPERATURE_LEVELS = [
  { value: 'Natural', label: 'Natural', color: '#64748b', desc: 'Temperatura ambiente / fresca' },
  { value: 'Templado', label: 'Templado', color: '#12467E', desc: 'Ligeramente tibia al tacto' },
  { value: 'Caliente', label: 'Caliente', color: '#ea580c', desc: 'Calor apreciable sin vapor denso' },
  { value: 'Muy Caliente', label: 'Muy Caliente', color: '#c2410c', desc: 'Emanación de calor intenso y vapor' },
  { value: 'Hirviendo', label: 'Hirviendo', color: '#9a3412', desc: 'Burbujeo / ebullición visible' },
];

const TEMPERATURE_MARKS = {
  0: <span className="font-medium text-xs text-gray-600">Natural</span>,
  1: <span className="font-medium text-xs text-[#12467E]">Templado</span>,
  2: <span className="font-medium text-xs text-orange-600">Caliente</span>,
  3: <span className="font-medium text-xs text-orange-700">Muy Caliente</span>,
  4: <span className="font-medium text-xs text-orange-900">Hirviendo</span>,
};

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

  // Temperature sensation slider state
  const [tempSliderIndex, setTempSliderIndex] = useState(0);
  const [isUnspecifiedTemp, setIsUnspecifiedTemp] = useState(false);

  const currentTempLevel = isUnspecifiedTemp
    ? { value: 'Sin Especificar', label: 'Sin Especificar', color: '#64748b', desc: 'No se definió una percepción térmica' }
    : (TEMPERATURE_LEVELS[tempSliderIndex] || TEMPERATURE_LEVELS[0]);

  const handleSliderChange = (val) => {
    setTempSliderIndex(val);
    form.setFieldsValue({ temperatureSensation: TEMPERATURE_LEVELS[val].value });
  };

  const handleToggleUnspecified = (checked) => {
    setIsUnspecifiedTemp(checked);
    if (checked) {
      form.setFieldsValue({ temperatureSensation: 'Sin Especificar' });
    } else {
      form.setFieldsValue({ temperatureSensation: TEMPERATURE_LEVELS[tempSliderIndex].value });
    }
  };

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
          if (parsed.temperatureSensation) {
            if (parsed.temperatureSensation === "Sin Especificar") {
              setIsUnspecifiedTemp(true);
            } else {
              setIsUnspecifiedTemp(false);
              const idx = TEMPERATURE_LEVELS.findIndex(l => l.value === parsed.temperatureSensation);
              if (idx !== -1) setTempSliderIndex(idx);
            }
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
      setTempSliderIndex(0);
      setIsUnspecifiedTemp(false);
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
        setTempSliderIndex(0);
        setIsUnspecifiedTemp(false);

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
    setTempSliderIndex(0);
    setIsUnspecifiedTemp(false);
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
        <div className="py-2.5 px-4 mb-4 bg-blue-50 border border-blue-200 rounded-xl text-xs text-[#12467E] text-center flex items-center justify-center gap-2 poppins">
          <Spin size="small" /> Verificando sesión de usuario...
        </div>
      );
    }

    if (!userEmail) {
      return (
        <Alert
          type="warning"
          showIcon
          message="Debes iniciar sesión para agregar una solicitud"
          className="mb-4 rounded-xl poppins"
        />
      );
    }

    return null;
  };

  return (
    <>
      <Button
        type="primary"
        size="medium"
        icon={<PlusCircleOutlined />}
        onClick={() => setVisible(true)}
        disabled={!userEmail}
      >
        Agregar Solicitud
      </Button>

      <Modal
        title={
          <div className="flex items-center gap-2 py-2 pr-6 border-b border-gray-100">
            <span className="poppins-bold text-lg sm:text-xl text-geoterra-blue">
              Formulario de Solicitud de Manifestación
            </span>
          </div>
        }
        open={visible}
        onOk={handleOk}
        onCancel={handleCancel}
        width="95vw"
        style={{ top: 16, maxWidth: '1050px', margin: '0 auto' }}
        styles={{ body: { padding: '16px 16px 24px' } }}
        confirmLoading={loading}
        footer={[
          <Button key="back" size="large" onClick={handleCancel} disabled={loading} className="poppins">
            Cancelar
          </Button>,
          <Button
            key="submit"
            type="primary"
            size="large"
            onClick={handleOk}
            loading={loading}
            disabled={!userEmail}
            style={{ backgroundColor: '#12467E', borderColor: '#12467E' }}
            className="poppins-bold shadow-sm"
          >
            Enviar Solicitud
          </Button>,
        ]}
      >
        {renderStatusMessage()}

        <Form
          layout="vertical"
          form={form}
          className="poppins space-y-6"
          initialValues={{
            temperatureSensation: "Natural",
            currentUsage: "Residencial",
            bubbles: "0"
          }}
        >
          {/* Section 1: Ubicación Geográfica */}
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-geoterra-blue border-b border-gray-100 pb-3 flex items-center gap-2">
              <EnvironmentFilled /> Ubicación de la Manifestación
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
              <Form.Item
                label={<span className="font-semibold text-gray-700 text-xs sm:text-sm">Provincia</span>}
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
                label={<span className="font-semibold text-gray-700 text-xs sm:text-sm">Cantón</span>}
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
                label={<span className="font-semibold text-gray-700 text-xs sm:text-sm">Distrito</span>}
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

            <Form.Item label={<span className="font-semibold text-gray-700 text-xs sm:text-sm">Dirección Exacta</span>} name="exactAddress" style={{ marginBottom: 0 }}>
              <Input.TextArea rows={2} placeholder="Ej. Camino a Bagaces, 200 m norte de escuela..." />
            </Form.Item>
          </div>

          {/* Section 2: Características de la Manifestación */}
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-geoterra-blue border-b border-gray-100 pb-3 flex items-center gap-2">
              <ExperimentOutlined /> Características de la Manifestación
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
              <Form.Item
                label={<span className="font-semibold text-gray-700 text-xs sm:text-sm">Uso Actual del Terreno</span>}
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

              <Form.Item label={<span className="font-semibold text-gray-700 text-xs sm:text-sm">Burbujeo Activo</span>} name="bubbles">
                <Radio.Group size="large" className="pt-1">
                  <Radio value="1">Sí (Activo)</Radio>
                  <Radio value="0">No</Radio>
                </Radio.Group>
              </Form.Item>
            </div>

            {/* Sensación Térmica: Selector adaptativo y táctil */}
            <div className="bg-gray-50/80 p-3.5 sm:p-4.5 rounded-xl border border-gray-200 space-y-3">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-gray-200/60 pb-2.5">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-800 text-xs sm:text-sm poppins">
                      Sensación Térmica Percibida:
                    </span>
                    <Tag
                      className="rounded-full px-2.5 py-0.5 text-xs font-bold border"
                      style={{
                        backgroundColor: '#f8fafc',
                        color: currentTempLevel.color,
                        borderColor: '#e2e8f0',
                      }}
                    >
                      {currentTempLevel.label}
                    </Tag>
                  </div>
                  <p className="text-xs text-gray-500 m-0 mt-0.5 poppins">
                    {currentTempLevel.desc}
                  </p>
                </div>

                <Checkbox
                  checked={isUnspecifiedTemp}
                  onChange={(e) => handleToggleUnspecified(e.target.checked)}
                  className="poppins text-xs text-gray-600 font-medium select-none"
                >
                  Sin especificar
                </Checkbox>
              </div>

              {!isUnspecifiedTemp ? (
                <div className="pt-1 pb-2 space-y-3">
                  <div className="px-2">
                    <ConfigProvider
                      theme={{
                        components: {
                          Slider: {
                            colorPrimary: currentTempLevel.color,
                            colorPrimaryBorder: currentTempLevel.color,
                            colorPrimaryBorderHover: currentTempLevel.color,
                            handleColor: currentTempLevel.color,
                            handleActiveColor: currentTempLevel.color,
                            dotActiveBorderColor: currentTempLevel.color,
                          },
                        },
                      }}
                    >
                      <Slider
                        min={0}
                        max={4}
                        step={1}
                        dots
                        value={tempSliderIndex}
                        onChange={handleSliderChange}
                        railStyle={{
                          backgroundColor: '#e2e8f0',
                          height: 6,
                          borderRadius: 3,
                        }}
                        trackStyle={{ backgroundColor: currentTempLevel.color, height: 6, borderRadius: 3 }}
                        tooltip={{
                          formatter: (val) => TEMPERATURE_LEVELS[val]?.label,
                        }}
                      />
                    </ConfigProvider>
                    <div className="flex justify-between text-[11px] text-gray-400 font-medium -mt-1">
                      <span>Mín: Natural</span>
                      <span>Máx: Hirviendo</span>
                    </div>
                  </div>

                  {/* Botones de selección rápida y táctil */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-1">
                    {TEMPERATURE_LEVELS.map((lvl, idx) => {
                      const isSelected = tempSliderIndex === idx && !isUnspecifiedTemp;
                      return (
                        <button
                          key={lvl.value}
                          type="button"
                          disabled={isUnspecifiedTemp}
                          onClick={() => handleSliderChange(idx)}
                          className={`px-2.5 py-2 rounded-xl text-xs font-semibold border transition-all text-center flex items-center justify-center ${
                            isSelected
                              ? 'bg-blue-50 border-[#12467E] text-[#12467E] ring-2 ring-blue-100 shadow-sm'
                              : 'bg-white border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50'
                          } ${idx === 4 ? 'col-span-2 sm:col-span-1' : ''}`}
                        >
                          {lvl.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <div className="py-3 px-4 bg-white rounded-lg border border-dashed border-gray-300 text-center text-xs text-gray-500 poppins flex items-center justify-center">
                  No se especificará una sensación térmica en este registro.
                </div>
              )}

              {/* Input oculto vinculado al formulario para validación y persistencia */}
              <Form.Item name="temperatureSensation" hidden>
                <Input />
              </Form.Item>
            </div>

            <Form.Item label={<span className="font-semibold text-gray-700 text-xs sm:text-sm">Detalles u Observaciones Adicionales</span>} name="details" style={{ marginBottom: 0 }}>
              <Input.TextArea rows={3} placeholder="Describa detalles adicionales sobre la emanación de vapor, gas o temperatura observada..." />
            </Form.Item>
          </div>

          {/* Section 3: Información del Propietario (OPCIONAL) */}
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-gray-100 pb-3 gap-3">
              <h3 className="text-base sm:text-lg font-bold text-geoterra-blue flex items-center gap-2 m-0">
                <UserOutlined /> Información del Propietario <span className="text-xs text-gray-400 font-normal">(Opcional)</span>
              </h3>

              <div className="flex flex-col sm:flex-row sm:items-center gap-2 w-full sm:w-auto">
                <span className="text-xs sm:text-sm font-semibold text-gray-600">¿Conoce al propietario?</span>
                <Radio.Group
                  value={hasOwnerInfo}
                  onChange={(e) => setHasOwnerInfo(e.target.value)}
                  buttonStyle="solid"
                  className="w-full sm:w-auto flex"
                >
                  <Radio.Button value="0" className="flex-1 sm:flex-none text-center text-xs sm:text-sm">No (Desconocido)</Radio.Button>
                  <Radio.Button value="1" className="flex-1 sm:flex-none text-center text-xs sm:text-sm">Sí (Ingresar datos)</Radio.Button>
                </Radio.Group>
              </div>
            </div>

            {hasOwnerInfo === "1" && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 pt-2">
                <Form.Item label={<span className="font-semibold text-gray-700 text-xs sm:text-sm">Nombre del Propietario</span>} name="ownerName">
                  <Input size="large" placeholder="Nombre completo del propietario" />
                </Form.Item>

                <Form.Item label={<span className="font-semibold text-gray-700 text-xs sm:text-sm">Relación con el Propietario</span>} name="relationWithOwner">
                  <Select size="large" defaultValue="Titular" options={[
                    { value: 'Titular', label: 'Propietario / Titular' },
                    { value: 'Familiar', label: 'Familiar' },
                    { value: 'Empleado', label: 'Empleado' },
                    { value: 'Socio', label: 'Socio' },
                    { value: 'Conocido', label: 'Conocido' }
                  ]} />
                </Form.Item>

                <Form.Item label={<span className="font-semibold text-gray-700 text-xs sm:text-sm">Correo del Propietario</span>} name="ownerEmail">
                  <Input size="large" type="email" placeholder="correo@ejemplo.com" />
                </Form.Item>

                <Form.Item label={<span className="font-semibold text-gray-700 text-xs sm:text-sm">Teléfono del Propietario</span>} name="contactNumber">
                  <PhoneInput size="large" />
                </Form.Item>
              </div>
            )}
          </div>

          {/* Section 4: Geolocalización en Mapa */}
          <div className="bg-white p-4 sm:p-6 rounded-xl border border-gray-200 shadow-sm space-y-4">
            <h3 className="text-base sm:text-lg font-bold text-geoterra-blue border-b border-gray-100 pb-3 flex items-center gap-2">
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