import React from 'react';
import { Space, Button, Tooltip, Popconfirm } from 'antd';
import { EditOutlined, DeleteOutlined } from '@ant-design/icons';

/** Badge de código/identificador legible. Siempre azul claro; NUNCA cyan/purple/green. */
export const CodeBadge = ({ children }) => (
  <span className="font-mono bg-blue-50 text-[#12467E] border border-blue-200 px-3 py-1 rounded-md font-bold text-xs inline-block">
    {children}
  </span>
);

/** Nombre principal de la fila: ícono + texto en negrita azul GeoterRA. */
export const NameCell = ({ icon, children, subtitle }) => (
  <div>
    <div className="flex items-center gap-2">
      {icon && <span className="text-[#12467E] text-base">{icon}</span>}
      <span className="font-bold text-[#12467E] text-base">{children}</span>
    </div>
    {subtitle && <span className="text-xs text-gray-500 block mt-0.5">{subtitle}</span>}
  </div>
);

/** Fecha corta. */
export const DateCell = ({ value, fallback = '—' }) => (
  <span className="text-xs text-gray-600">
    {value
      ? new Date(value).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' })
      : fallback}
  </span>
);

/** ID técnico (ULID). SOLO se renderiza para rol maintenance. */
export const SystemIdCell = ({ value }) => (
  <span className="font-mono text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-200">
    {value}
  </span>
);

/** Acciones de fila: SOLO íconos con tooltips institucionales. */
export const RowActions = ({ onEdit, onDelete, entity = 'registro', deleteDescription, extra }) => (
  <Space size="small">
    {extra}
    {onEdit && (
      <Tooltip title={`Editar ${entity}`}>
        <Button
          icon={<EditOutlined />}
          size="middle"
          onClick={onEdit}
          className="text-[#12467E] hover:text-[#0d3460] border-gray-300"
        />
      </Tooltip>
    )}
    {onDelete && (
      <Popconfirm
        title={`¿Eliminar ${entity}?`}
        description={deleteDescription || 'Esta acción es irreversible.'}
        onConfirm={onDelete}
        okText="Sí, eliminar"
        cancelText="Cancelar"
        okButtonProps={{ danger: true }}
      >
        <Tooltip title={`Eliminar ${entity}`}>
          <Button icon={<DeleteOutlined />} size="middle" danger />
        </Tooltip>
      </Popconfirm>
    )}
  </Space>
);

