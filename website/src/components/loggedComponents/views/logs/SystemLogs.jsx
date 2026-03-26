import { logs } from '../../../../config/apiConf';
import React, { useState, useEffect } from 'react';
import { usePermissions } from '../../../../hooks/usePermissions';

const SystemLogs = () => {
  const { hasPermission, PERMISSIONS } = usePermissions();
  const [logsData, setLogsData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [autoRefresh, setAutoRefresh] = useState(true);

  useEffect(() => {
    if (!hasPermission(PERMISSIONS.VIEW_SYSTEM_LOGS)) {
      setLoading(false);
      return;
    }

    const fetchLogs = async () => {
      try {
        const response = await fetch(logs.system(), {
          credentials: 'include'
        });
        const data = await response.json();

        if (data.data && Array.isArray(data.data.logs)) {
          const rawLogs = data.data.logs;
          console.log('📋 [SystemLogs] Raw logs count:', rawLogs.length);

          const logLines = rawLogs
            .map((log) => log.replace(/\\n$/, '').trim())
            .filter((log) => log.length > 0);

          console.log('📋 [SystemLogs] Parsed logs:', logLines.length, 'lines');

          setLogsData(logLines);
          setError(null);
        } else {
          console.error('❌ [SystemLogs] No logs array found', {
            hasSuccess: data.success,
            hasData: !!data.data,
            hasLogs: !!data.data?.logs,
            isArray: Array.isArray(data.data?.logs)
          });
          setLogsData([]);
          setError('No logs data received');
        }

      } catch (err) {
        console.error('❌ [SystemLogs] Error:', err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchLogs();

    let interval;
    if (autoRefresh) {
      interval = setInterval(fetchLogs, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [autoRefresh]);

  if (!hasPermission(PERMISSIONS.VIEW_SYSTEM_LOGS)) {
    return (
      <div style={{ padding: '24px', color: 'red' }}>
        <h1>Acceso Denegado</h1>
        <p>No tienes permiso para acceder a esta sección</p>
      </div>
    );
  }

  if (loading) return <div style={{ padding: '24px' }}>Cargando logs...</div>;

  return (
    <div style={{ padding: '24px' }}>
      <h1>Registros del Sistema</h1>

      <div style={{ marginBottom: '16px' }}>
        <label>
          <input
            type="checkbox"
            checked={autoRefresh}
            onChange={(e) => setAutoRefresh(e.target.checked)}
          />
          Auto-refresh (5s)
        </label>
        <span style={{ marginLeft: '16px', color: '#666' }}>
          {logsData.length} líneas de log
        </span>
      </div>

      {error && (
        <div style={{ color: 'red', marginBottom: '16px' }}>
          Error: {error}
        </div>
      )}

      <div style={{
        backgroundColor: '#1e1e1e',
        color: '#00ff00',
        padding: '16px',
        borderRadius: '4px',
        fontFamily: 'monospace',
        fontSize: '12px',
        maxHeight: '600px',
        overflowY: 'auto',
        border: '1px solid #333'
      }}>
        {logsData.length === 0 ? (
          <p>No logs available</p>
        ) : (
          logsData.map((log, idx) => (
            <div key={idx} style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: '1.4' }}>
              {log}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SystemLogs;