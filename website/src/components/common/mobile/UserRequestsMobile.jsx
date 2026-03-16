import React from 'react';
import { Tag, Button } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';

const UserRequestsMobile = ({ data = [], onView, onEdit, onDelete, refresh }) => {
  return (
    <div>
      {data.map((request) => (
        <div key={request.key} className="bg-white rounded-lg shadow-md p-4 mb-4">
          <div className="flex justify-between items-center mb-3">
            <p className="font-semibold text-sm">{request.id}</p>
            <Tag color="orange">Pendiente</Tag>
          </div>

          <p className="text-xs text-gray-500 mb-3">Fecha: {request.fecha}</p>

          {request.region && <div className="mb-2"><p className="text-sm"><strong>Región:</strong> {request.region}</p></div>}
          {request.propietario && <div className="mb-2"><p className="text-sm"><strong>Propietario:</strong> {request.propietario}</p></div>}
          {request.direccion && <div className="mb-3"><p className="text-sm"><strong>Dirección:</strong> {request.direccion}</p></div>}

          <div className="flex gap-2 justify-end">
            <Button size="small" type="primary" danger icon={<DeleteOutlined />} onClick={() => onDelete(request.raw)} />
            <Button size="small" type="primary" icon={<EyeOutlined />} onClick={() => onView(request.raw)} />
            <Button size="small" type="primary" icon={<EditOutlined />} className="bg-green-500 border-green-500" onClick={() => onEdit(request.raw)} />
          </div>
        </div>
      ))}

      <div className="flex justify-center mt-4">
        <Button onClick={refresh}>Refrescar</Button>
      </div>
    </div>
  );
};

export default UserRequestsMobile;