import React from 'react';
import { Tag, Button } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';

const UserRequestsDesktop = ({ data = [], onView, onEdit, onDelete, refresh }) => {
  return (
    <div className="overflow-x-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 border-b-2 border-gray-300">
            <th className="p-3 text-left font-semibold">ID del Punto</th>
            <th className="p-3 text-left font-semibold">Fecha solicitud</th>
            <th className="p-3 text-left font-semibold">Estado</th>
            <th className="p-3 text-left font-semibold">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {data.map((request) => (
            <tr key={request.key} className="border-b border-gray-200 hover:bg-gray-50">
              <td className="p-3">{request.id}</td>
              <td className="p-3">{request.fecha}</td>
              <td className="p-3"><Tag color="orange">Pendiente</Tag></td>
              <td className="p-3">
                <div className="flex gap-2">
                  <Button size="small" type="primary" danger icon={<DeleteOutlined />} onClick={() => onDelete(request.raw)} />
                  <Button size="small" type="primary" icon={<EyeOutlined />} onClick={() => onView(request.raw)} />
                  <Button size="small" type="primary" icon={<EditOutlined />} className="bg-green-500 border-green-500" onClick={() => onEdit(request.raw)} />
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="mt-4 flex justify-end">
        <Button onClick={refresh}>Refrescar</Button>
      </div>
    </div>
  );
};

export default UserRequestsDesktop;