import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Card,
  Input,
  Button,
  Space,
  Tag,
  Switch,
  Tooltip,
  message,
  Spin
} from 'antd';
import {
  ReloadOutlined,
  SearchOutlined,
  CodeOutlined,
  AlertOutlined,
  WarningOutlined,
  CheckCircleOutlined,
  DownloadOutlined,
  CopyOutlined,
  ClearOutlined,
  SafetyCertificateOutlined,
  FilterOutlined
} from '@ant-design/icons';
import '../../../../colorModule.css';
import '../../../../fontsModule.css';
import { maintenanceSystemLogs } from '../../../../config/apiConf';
import { usePermissions } from '../../../../hooks/usePermissions';

const SystemLogs = () => {
  const { hasPermission, PERMISSIONS } = usePermissions();
  const [logsData, setLogsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('ALL'); // ALL, ERROR, WARN, INFO, HTTP
  const [autoScroll, setAutoScroll] = useState(true);

  const terminalRef = useRef(null);

  const fetchLogs = async () => {
    try {
      const result = await maintenanceSystemLogs();

      if (!result.ok || !result.data?.logs) {
        console.error('❌ [SystemLogs] Error:', result.error || 'No logs data received');
        setLogsData([]);
        setError(result.error || 'No logs data received');
        return;
      }

      const rawLogs = result.data.logs;
      const logLines = rawLogs
        .map((log) => log.replace(/\\n$/, '').trim())
        .filter((log) => log.length > 0);

      setLogsData(logLines);
      setError(null);
    } catch (err) {
      console.error('❌ [SystemLogs] Error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!hasPermission(PERMISSIONS.VIEW_SYSTEM_LOGS)) {
      setLoading(false);
      return;
    }

    fetchLogs();

    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchLogs, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh, hasPermission]);

  // Auto-scroll effect
  useEffect(() => {
    if (autoScroll && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logsData, autoScroll]);

  // Metrics
  const metrics = useMemo(() => {
    let errorCount = 0;
    let warnCount = 0;
    let httpCount = 0;

    logsData.forEach((line) => {
      const upper = line.toUpperCase();
      if (upper.includes('ERROR') || upper.includes('EXCEPTION') || upper.includes('FAIL')) {
        errorCount++;
      } else if (upper.includes('WARN')) {
        warnCount++;
      }
      if (upper.includes('GET ') || upper.includes('POST ') || upper.includes('PUT ') || upper.includes('DELETE ')) {
        httpCount++;
      }
    });

    return {
      total: logsData.length,
      errors: errorCount,
      warnings: warnCount,
      http: httpCount,
    };
  }, [logsData]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logsData.filter((line) => {
      const upper = line.toUpperCase();

      // Filter by level
      if (selectedLevel === 'ERROR' && !(upper.includes('ERROR') || upper.includes('EXCEPTION') || upper.includes('FAIL'))) {
        return false;
      }
      if (selectedLevel === 'WARN' && !upper.includes('WARN')) {
        return false;
      }
      if (selectedLevel === 'HTTP' && !(upper.includes('GET ') || upper.includes('POST ') || upper.includes('PUT ') || upper.includes('DELETE '))) {
        return false;
      }

      // Filter by search text
      if (searchTerm) {
        return line.toLowerCase().includes(searchTerm.toLowerCase());
      }

      return true;
    });
  }, [logsData, selectedLevel, searchTerm]);

  // Download logs as text file
  const handleDownloadLogs = () => {
    const blob = new Blob([logsData.join('\n')], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `geoterra-logs-${new Date().toISOString().slice(0, 19)}.log`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    message.success('Archivo de logs descargado');
  };

  // Copy logs to clipboard
  const handleCopyLogs = () => {
    navigator.clipboard.writeText(filteredLogs.join('\n'));
    message.success('Líneas copiadas al portapapeles');
  };

  if (!hasPermission(PERMISSIONS.VIEW_SYSTEM_LOGS)) {
    return (
      <div className="w-full p-8">
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl">
          <h2 className="text-xl font-bold m-0 mb-1">Acceso Denegado</h2>
          <p className="m-0 text-sm">No cuentas con los privilegios de mantenimiento para ver los registros del servidor.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full p-4 md:p-8 space-y-6 poppins">
      {/* Header Card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-geoterra-orange poppins">
              MONITOREO • AUDITORÍA DE SISTEMA
            </span>
            <Tag color={autoRefresh ? 'success' : 'default'} className="m-0 text-[11px] font-semibold">
              {autoRefresh ? 'Live Streaming (5s)' : 'Pausado'}
            </Tag>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-geoterra-blue m-0 poppins">
            Registros del Servidor en Tiempo Real
          </h1>
          <p className="text-sm text-gray-500 mt-1 mb-0 max-w-2xl">
            Transmisión y auditoría en vivo de operaciones, eventos de seguridad y llamadas HTTP del backend GeoterRA.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto justify-end">
          <div className="flex items-center gap-2 bg-gray-50 px-3 py-1.5 rounded-xl border border-gray-200">
            <span className="text-xs font-medium text-gray-600">Auto-refresh</span>
            <Switch
              size="small"
              checked={autoRefresh}
              onChange={(checked) => setAutoRefresh(checked)}
            />
          </div>

          <Tooltip title="Copiar logs visibles al portapapeles">
            <Button icon={<CopyOutlined />} onClick={handleCopyLogs} className="border-gray-300">
              Copiar
            </Button>
          </Tooltip>

          <Tooltip title="Descargar archivo .log completo">
            <Button icon={<DownloadOutlined />} onClick={handleDownloadLogs} className="border-gray-300">
              Exportar
            </Button>
          </Tooltip>

          <Button
            type="primary"
            icon={<ReloadOutlined />}
            onClick={() => {
              setLoading(true);
              fetchLogs();
            }}
            loading={loading}
            style={{ backgroundColor: '#12467E', borderColor: '#12467E' }}
            className="poppins-bold"
          >
            Actualizar
          </Button>
        </div>
      </div>

      {/* KPI Metrics Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Total Líneas */}
        <div
          onClick={() => setSelectedLevel('ALL')}
          className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer shadow-sm hover:shadow-md ${
            selectedLevel === 'ALL' ? 'border-[#12467E] ring-2 ring-blue-100' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Buffer Total
            </span>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#12467E] flex items-center justify-center text-lg">
              <CodeOutlined />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-800 poppins">
              {metrics.total}
            </span>
            <span className="text-xs text-gray-500 font-medium">Líneas</span>
          </div>
          <div className="mt-2 text-xs text-blue-700 font-medium flex items-center gap-1">
            <CheckCircleOutlined /> Buffer circular de servidor
          </div>
        </div>

        {/* KPI 2: Errores */}
        <div
          onClick={() => setSelectedLevel(selectedLevel === 'ERROR' ? 'ALL' : 'ERROR')}
          className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer shadow-sm hover:shadow-md ${
            selectedLevel === 'ERROR' ? 'border-rose-500 ring-2 ring-rose-100' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Errores / Fallos
            </span>
            <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-lg">
              <AlertOutlined />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-rose-600 poppins">
              {metrics.errors}
            </span>
            <span className="text-xs text-gray-500 font-medium">Eventos</span>
          </div>
          <div className="mt-2 text-xs text-rose-600 font-medium flex items-center gap-1">
            {metrics.errors > 0 ? 'Requiere atención' : 'Servidor estable'}
          </div>
        </div>

        {/* KPI 3: Advertencias */}
        <div
          onClick={() => setSelectedLevel(selectedLevel === 'WARN' ? 'ALL' : 'WARN')}
          className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer shadow-sm hover:shadow-md ${
            selectedLevel === 'WARN' ? 'border-amber-500 ring-2 ring-amber-100' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Advertencias
            </span>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg">
              <WarningOutlined />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-amber-600 poppins">
              {metrics.warnings}
            </span>
            <span className="text-xs text-gray-500 font-medium">Warnings</span>
          </div>
          <div className="mt-2 text-xs text-amber-700 font-medium flex items-center gap-1">
            Avisos de tiempo de ejecución
          </div>
        </div>

        {/* KPI 4: Tráfico HTTP */}
        <div
          onClick={() => setSelectedLevel(selectedLevel === 'HTTP' ? 'ALL' : 'HTTP')}
          className={`bg-white p-5 rounded-2xl border transition-all cursor-pointer shadow-sm hover:shadow-md ${
            selectedLevel === 'HTTP' ? 'border-cyan-500 ring-2 ring-cyan-100' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Peticiones API
            </span>
            <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center text-lg">
              <SafetyCertificateOutlined />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-gray-800 poppins">
              {metrics.http}
            </span>
            <span className="text-xs text-gray-500 font-medium">Solicitudes</span>
          </div>
          <div className="mt-2 text-xs text-cyan-700 font-medium flex items-center gap-1">
            Endpoints REST activos
          </div>
        </div>
      </div>

      {/* Terminal Container Card */}
      <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm space-y-4">
        {/* Controls and Search Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
          <div className="w-full md:w-96">
            <Input
              prefix={<SearchOutlined className="text-gray-400" />}
              placeholder="Buscar en logs (endpoint, error, IP, fecha)..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              allowClear
              className="rounded-lg py-2"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-gray-500 mr-1">Filtro:</span>
            <button
              onClick={() => setSelectedLevel('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedLevel === 'ALL'
                  ? 'bg-[#12467E] text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-100'
              }`}
            >
              Todos ({metrics.total})
            </button>
            <button
              onClick={() => setSelectedLevel('ERROR')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedLevel === 'ERROR'
                  ? 'bg-rose-600 text-white'
                  : 'bg-white text-rose-700 border border-rose-200 hover:bg-rose-50'
              }`}
            >
              Errores ({metrics.errors})
            </button>
            <button
              onClick={() => setSelectedLevel('WARN')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedLevel === 'WARN'
                  ? 'bg-amber-500 text-white'
                  : 'bg-white text-amber-700 border border-amber-200 hover:bg-amber-50'
              }`}
            >
              Warnings ({metrics.warnings})
            </button>
            <button
              onClick={() => setSelectedLevel('HTTP')}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                selectedLevel === 'HTTP'
                  ? 'bg-cyan-600 text-white'
                  : 'bg-white text-cyan-700 border border-cyan-200 hover:bg-cyan-50'
              }`}
            >
              HTTP ({metrics.http})
            </button>

            <div className="h-4 w-[1px] bg-gray-300 mx-1 hidden sm:block" />

            <div className="flex items-center gap-2 bg-white px-2.5 py-1 rounded-lg border border-gray-200">
              <span className="text-[11px] font-medium text-gray-500">Auto-scroll</span>
              <Switch
                size="small"
                checked={autoScroll}
                onChange={(checked) => setAutoScroll(checked)}
              />
            </div>
          </div>
        </div>

        {/* Modern Terminal Window */}
        <div className="rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-[#0B132B]">
          {/* Terminal Window Header Bar */}
          <div className="bg-[#1C2541] px-4 py-2.5 flex items-center justify-between border-b border-slate-700">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-rose-500/80" />
              <div className="w-3 h-3 rounded-full bg-amber-500/80" />
              <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
              <span className="ml-2 font-mono text-xs text-slate-300">
                geoterra-backend-daemon.log
              </span>
            </div>
            <div className="flex items-center gap-3">
              <span className="font-mono text-[11px] text-slate-400">
                {filteredLogs.length} líneas visibles
              </span>
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>
          </div>

          {/* Terminal Body */}
          <div
            ref={terminalRef}
            className="p-4 font-mono text-xs overflow-y-auto max-h-[580px] space-y-1"
            style={{ minHeight: '380px' }}
          >
            {loading && logsData.length === 0 ? (
              <div className="py-16 text-center text-slate-400">
                <Spin tip="Conectando al stream de logs..." />
              </div>
            ) : filteredLogs.length === 0 ? (
              <div className="py-16 text-center text-slate-500 font-mono">
                No hay líneas de log que coincidan con el filtro actual.
              </div>
            ) : (
              filteredLogs.map((log, idx) => {
                const upper = log.toUpperCase();
                const isError = upper.includes('ERROR') || upper.includes('EXCEPTION') || upper.includes('FAIL');
                const isWarn = upper.includes('WARN');
                const isHttp = upper.includes('GET ') || upper.includes('POST ') || upper.includes('PUT ') || upper.includes('DELETE ');

                let textColor = 'text-slate-300';
                if (isError) textColor = 'text-rose-400 font-medium bg-rose-950/30 px-1 rounded';
                else if (isWarn) textColor = 'text-amber-300 bg-amber-950/20 px-1 rounded';
                else if (isHttp) textColor = 'text-cyan-300';

                return (
                  <div key={idx} className="flex items-start gap-3 hover:bg-white/5 py-0.5 px-1 rounded transition-colors">
                    <span className="text-slate-600 select-none text-[11px] w-10 text-right shrink-0">
                      {idx + 1}
                    </span>
                    <span className={`break-all leading-relaxed ${textColor}`}>
                      {log}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemLogs;