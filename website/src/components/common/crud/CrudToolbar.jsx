import React from 'react';
import { Input, Button } from 'antd';
import { SearchOutlined, ReloadOutlined } from '@ant-design/icons';

/**
 * CrudToolbar component for GeoterRA CRUD views.
 * Standardizes the search input, filters, item counters, and refresh action.
 */
const CrudToolbar = ({
  searchPlaceholder = 'Buscar...',
  searchValue = '',
  onSearchChange,
  filters,
  shown = 0,
  total = 0,
  noun = 'registros',
  onReload,
  loading = false,
  extra,
}) => (
  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
    <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
      <div className="w-full md:w-80">
        <Input
          prefix={<SearchOutlined className="text-gray-400" />}
          placeholder={searchPlaceholder}
          value={searchValue}
          onChange={(e) => onSearchChange?.(e.target.value)}
          allowClear
          className="rounded-lg py-2"
        />
      </div>
      {filters}
    </div>

    <div className="flex items-center gap-3 flex-wrap">
      <span className="text-xs text-gray-500 font-medium">
        Mostrando {shown} de {total} {noun}
      </span>
      {extra}
      {onReload && (
        <Button
          icon={<ReloadOutlined spin={loading} />}
          onClick={onReload}
          loading={loading}
          className="poppins font-medium border-gray-300"
        >
          Actualizar
        </Button>
      )}
    </div>
  </div>
);

export default CrudToolbar;

