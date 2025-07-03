import React from 'react';
import { Table, Typography, Divider } from 'antd';
import AddPointModal from './loggedAddPointModal'; // Import your modal component
import '../../colorModule.css';
import '../../fontsModule.css';

const { Title } = Typography;

const Requests = () => {
  // Table data and columns
  const dataSource = [
    {
      key: '1',
      id: 'PONT-0001',
      date: '00/00/0000',
      status: 'No revisado',
    },
    {
      key: '2',
      id: 'PONT-0002',
      date: '00/00/0000',
      status: 'No revisado',
    },
  ];

  const columns = [
    {
      title: 'ID del Punto',
      dataIndex: 'id',
      key: 'id',
      width: '25%',
    },
    {
      title: 'Fecha solicitud',
      dataIndex: 'date',
      key: 'date',
      width: '25%',
    },
    {
      title: 'Estado',
      dataIndex: 'status',
      key: 'status',
      width: '25%',
    },
    {
      title: 'Opciones',
      key: 'options',
      width: '25%',
      render: () => <span style={{ fontSize: '1.2em' }}>✔</span>,
    },
  ];

  return (
    <div style={{ padding: '24px' }}>
      <Title level={2} style={{ marginBottom: '24px' }}>Solicitudes</Title>
      <div style={{ marginBottom: '16px', textAlign: 'right' }}>
        <AddPointModal /> {/* Button to open the modal */}
      </div>
      <Divider />
      
      <Table
        dataSource={dataSource}
        columns={columns}
        pagination={false}
        bordered
        style={{ marginTop: '16px' }}
      />
      
      <Divider />
    </div>
  );
};

export default Requests;