import React from 'react';
import { Tooltip } from 'antd';
import { CalendarOutlined } from '@ant-design/icons';

const MONTHS_ES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
];

const MONTHS_SHORT_ES = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic'
];

/**
 * Formats a date into DD/MM/YYYY (e.g. "12/09/2026")
 * @param {string|Date} dateVal 
 * @returns {string}
 */
export const formatDateDDMMYYYY = (dateVal) => {
  if (!dateVal) return 'N/A';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return String(dateVal);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Formats a date into Spanish prose (e.g. "12 de septiembre de 2026")
 * @param {string|Date} dateVal 
 * @param {boolean} includeTime 
 * @returns {string}
 */
export const formatDateProse = (dateVal, includeTime = false) => {
  if (!dateVal) return 'N/A';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return String(dateVal);

  const day = d.getDate();
  const month = MONTHS_ES[d.getMonth()];
  const year = d.getFullYear();

  let formatted = `${day} de ${month} de ${year}`;
  if (includeTime) {
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    formatted += ` a las ${hours}:${minutes}`;
  }
  return formatted;
};

/**
 * React renderer for table date columns.
 * Displays Spanish prose date with DD/MM/YYYY numeric subtext and full tooltip.
 *
 * @param {string|Date} dateVal 
 * @param {object} [options]
 * @param {boolean} [options.showIcon=false]
 * @returns {React.ReactNode}
 */
export const renderDateWithProse = (dateVal, options = {}) => {
  if (!dateVal) return <span style={{ color: '#8c8c8c' }}>N/A</span>;
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return <span>{dateVal}</span>;

  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  const ddmmyyyy = `${day}/${month}/${year}`;
  const ddmmyy = `${day}/${month}/${String(year).slice(-2)}`;

  const prose = `${d.getDate()} de ${MONTHS_ES[d.getMonth()]} de ${year}`;
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const fullTooltip = `${prose} — ${hours}:${minutes} (${ddmmyyyy})`;

  return (
    <Tooltip title={fullTooltip}>
      <div style={{ display: 'inline-flex', flexDirection: 'column', lineHeight: 1.3 }}>
        <span style={{ fontWeight: 500, color: '#262626', fontSize: '13px' }}>
          {options.showIcon && <CalendarOutlined style={{ marginRight: 5, color: '#fa8c16' }} />}
          {prose}
        </span>
        <span style={{ fontSize: '11px', color: '#8c8c8c', fontFamily: 'monospace' }}>
          {ddmmyyyy}
        </span>
      </div>
    </Tooltip>
  );
};
