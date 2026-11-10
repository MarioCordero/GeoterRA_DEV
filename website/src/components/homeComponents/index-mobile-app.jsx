import React, { useState, useEffect } from 'react';
import { QRCode } from 'antd';
import {
  DownloadOutlined,
  AndroidOutlined,
  AppleOutlined,
  CheckCircleOutlined,
  SafetyCertificateOutlined,
  CompassOutlined,
  WifiOutlined,
  MobileOutlined,
  QrcodeOutlined,
} from '@ant-design/icons';
import NotImplementedModal from '../common/NotImplementedModal';
import { getApkDownloadUrl, getAppVersionInfo } from '../../config/apiConf';
import '../../fontsModule.css';

function IndexMobileApp() {
  const [modalConfig, setModalConfig] = useState({
    isOpen: false,
    title: '',
    subtitle: '',
    message: '',
  });

  const [versionInfo, setVersionInfo] = useState({
    available: true,
    fileSizeMB: 74.6,
    fileName: 'geoterraApp.apk',
    downloadUrl: getApkDownloadUrl(),
  });

  useEffect(() => {
    let isMounted = true;
    getAppVersionInfo()
      .then((res) => {
        if (isMounted && res?.data && res.data.available) {
          setVersionInfo((prev) => ({
            ...prev,
            ...res.data,
            downloadUrl: getApkDownloadUrl(),
          }));
        }
      })
      .catch(() => {
        // Fallback to defaults
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const handleOpenPlayStoreModal = () => {
    setModalConfig({
      isOpen: true,
      title: 'Google Play Store',
      subtitle: 'Publicación en proceso de validación',
      message:
        'La aplicación oficial de GeoterRA se encuentra actualmente en proceso de revisión para su publicación en Google Play Store. Mientras tanto, puede descargar e instalar directamente el paquete APK oficial para dispositivos Android utilizando el botón de descarga directa.',
    });
  };

  const handleOpenAppStoreModal = () => {
    setModalConfig({
      isOpen: true,
      title: 'Apple App Store',
      subtitle: 'Próximamente en iOS',
      message:
        'La versión nativa de GeoterRA para dispositivos Apple iOS se encuentra en etapa de optimización y pruebas de laboratorio. Estará disponible próximamente para descarga a través de la App Store.',
    });
  };

  const handleCloseModal = () => {
    setModalConfig((prev) => ({ ...prev, isOpen: false }));
  };

  return (
    <div className="relative py-16 sm:py-20 md:py-24 bg-white border-y border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8 lg:px-12">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#12467E] poppins-bold m-0 leading-tight">
            GeoterRA Móvil
          </h2>
          <div className="w-20 sm:w-24 border-b-4 border-geoterra-orange mx-auto my-4"></div>
          <p className="text-gray-600 text-sm sm:text-base leading-relaxed poppins m-0">
            Realice solicitudes de manifestaciones, capture coordenadas GPS satelitales de alta precisión, todo directamente desde su dispositivo, incluso en zonas remotas sin conexión a internet.
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          {/* Main APK Download Card (Left 7 cols) */}
          <div className="lg:col-span-7 bg-slate-50 border border-gray-200 rounded-2xl p-6 sm:p-8 flex flex-col justify-between shadow-sm">
            <div>
              <div className="flex items-center justify-between gap-4 flex-wrap mb-6">
                <span className="text-xs text-gray-500 font-medium poppins">
                  Android 8.0 o superior
                </span>
              </div>

              <div className="flex items-start gap-4 mb-6">
                <div className="w-14 h-14 rounded-2xl bg-[#12467E] text-white flex items-center justify-center text-3xl shrink-0 shadow-sm">
                  <AndroidOutlined />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 m-0 poppins-bold">
                    Descarga Directa del APK Android
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 m-0 mt-1 poppins">
                    Paquete instalable compilado por el Instituto de Investigaciones en Ingeniería (INII - UCR).
                  </p>
                </div>
              </div>

              {/* Version & Technical Details */}
              <div className="text-center grid grid-cols-2 sm:grid-cols-2 gap-3 mb-5 bg-white p-4 rounded-xl border border-gray-200 text-xs poppins">
                <div>
                  <span className="text-gray-400 block font-medium uppercase text-[10px]">Archivo</span>
                  <span className="font-semibold text-gray-800 font-mono">{versionInfo.fileName}</span>
                </div>
                <div>
                  <span className="text-gray-400 block font-medium uppercase text-[10px]">Tamaño</span>
                  <span className="font-semibold text-gray-800 font-mono">
                    {versionInfo.fileSizeMB ? `${versionInfo.fileSizeMB} MB` : '74.6 MB'}
                  </span>
                </div>
              </div>

              {/* QR Code Card for Mobile Scan */}
              <div className="bg-white p-4 sm:p-5 rounded-xl border border-gray-200 mb-6 flex flex-col sm:flex-row items-center gap-5">
                <div className="bg-white p-2.5 rounded-xl border border-gray-200 shrink-0 shadow-xs flex items-center justify-center">
                  <QRCode
                    value={versionInfo.downloadUrl}
                    size={118}
                    bordered={false}
                    color="#12467E"
                  />
                </div>
                <div className="text-center sm:text-left">
                  <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-1">
                    <QrcodeOutlined className="text-geoterra-orange text-sm" />
                    <span className="text-[10px] font-bold uppercase tracking-wider text-geoterra-orange poppins">
                      Escanear con Android
                    </span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-gray-900 m-0 poppins-bold mb-1">
                    Descarga directa con la cámara
                  </h4>
                  <p className="text-xs text-gray-500 m-0 leading-relaxed poppins">
                    Apunte la cámara de su teléfono o Google Lens hacia este código para iniciar la descarga del APK directamente en su dispositivo.
                  </p>
                </div>
              </div>
            </div>

            {/* Action Download Button */}
            <div className="pt-2">
              <a
                href={versionInfo.downloadUrl}
                download={versionInfo.fileName}
                className="w-full bg-geoterra-orange hover:bg-orange-600 text-white font-bold py-3.5 sm:py-4 px-6 rounded-xl transition flex items-center justify-center gap-3 shadow-sm hover:shadow text-sm sm:text-base poppins-bold cursor-pointer text-center no-underline"
              >
                <DownloadOutlined className="text-xl" />
                <span>Descargar GeoterRA APK ({versionInfo.fileSizeMB || 74.6} MB)</span>
              </a>

              <div className="flex items-center justify-center gap-2 mt-3 text-xs text-gray-500 poppins">
                <CheckCircleOutlined className="text-[#12467E]" />
                <span>Instalación directa</span>
              </div>
            </div>
          </div>

          {/* Store Links & Mock Buttons (Right 5 cols) */}
          <div className="lg:col-span-5 flex flex-col justify-between gap-4">
            {/* Google Play Store Mock Card */}
            <div
              onClick={handleOpenPlayStoreModal}
              className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm hover:border-[#12467E] transition-all cursor-pointer group flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-blue-50 text-gray-700 group-hover:text-[#12467E] flex items-center justify-center text-2xl transition shrink-0">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M3.609 1.814L13.793 12 3.61 22.186a1.94 1.94 0 0 1-.61-.955V2.77c0-.363.227-.723.61-.956zm11.238 11.24l2.122 2.12-11.66 6.732 9.538-8.852zm0-2.108L5.309 2.094l11.66 6.732-2.122 2.12zm1.096 1.054l4.248-2.453c.895-.517.895-1.357 0-1.874l-4.248-2.453-2.316 2.39 2.316 2.39z" />
                  </svg>
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block poppins">
                    DISPONIBLE PRÓXIMAMENTE
                  </span>
                  <span className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-[#12467E] transition block poppins-bold">
                    Google Play
                  </span>
                </div>
              </div>

              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 poppins whitespace-nowrap">
                En Revisión
              </span>
            </div>

            {/* Apple App Store Mock Card */}
            <div
              onClick={handleOpenAppStoreModal}
              className="bg-white border border-gray-200 rounded-2xl p-5 sm:p-6 shadow-sm hover:border-[#12467E] transition-all cursor-pointer group flex items-center justify-between"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-blue-50 text-gray-700 group-hover:text-[#12467E] flex items-center justify-center text-2xl transition shrink-0">
                  <AppleOutlined />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400 block poppins">
                    DISPONIBLE PRÓXIMAMENTE
                  </span>
                  <span className="text-base sm:text-lg font-bold text-gray-900 group-hover:text-[#12467E] transition block poppins-bold">
                    App Store
                  </span>
                </div>
              </div>

              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 poppins whitespace-nowrap">
                En Desarrollo
              </span>
            </div>

            {/* Field Features Mini-Banner */}
            <div className="bg-[#12467E] text-white p-5 rounded-2xl border border-blue-900 shadow-sm space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-200 poppins block">
                CAPACIDADES EN CAMPO
              </span>
              <div className="space-y-2 text-xs poppins text-blue-100">
                <div className="flex items-center gap-2">
                  <WifiOutlined className="text-geoterra-orange" />
                  <span>Bitácora y toma de datos 100% offline</span>
                </div>
                <div className="flex items-center gap-2">
                  <CompassOutlined className="text-geoterra-orange" />
                  <span>Proyección cartográfica oficial CRTM05</span>
                </div>
                <div className="flex items-center gap-2">
                  <MobileOutlined className="text-geoterra-orange" />
                  <span>Sincronización automática con la base central</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal for Mock Store Buttons */}
      <NotImplementedModal
        isOpen={modalConfig.isOpen}
        onClose={handleCloseModal}
        title={modalConfig.title}
        subtitle={modalConfig.subtitle}
        message={modalConfig.message}
      />
    </div>
  );
}

export default IndexMobileApp;

