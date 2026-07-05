import React from 'react';
import { Modal, List } from 'antd';
import { ExclamationCircleOutlined } from '@ant-design/icons';

/**
 * Reusable Confirmation Modal Component
 * 
 * @param {Object} props
 * @param {boolean} props.open - Whether modal is visible
 * @param {string} props.title - Modal title
 * @param {string|ReactNode} props.message - Main message/body content
 * @param {Array} props.items - Optional list items to display (for change summaries, warnings, etc.)
 * @param {string} props.okText - OK button text (default: "Confirmar")
 * @param {string} props.cancelText - Cancel button text (default: "Cancelar")
 * @param {Function} props.onOk - Callback when OK is clicked
 * @param {Function} props.onCancel - Callback when Cancel is clicked
 * @param {boolean} props.loading - Show loading state on OK button
 * @param {boolean} props.danger - Style as danger action (red buttons)
 * @param {string} props.icon - Icon type: "warning" | "danger" | "info" (default: "info")
 * @param {number} props.width - Modal width (default: 416)
 */
const ConfirmationModal = ({
  open,
  title,
  message,
  items = [],
  okText = 'Confirmar',
  cancelText = 'Cancelar',
  onOk,
  onCancel,
  loading = false,
  danger = false,
  icon = 'info',
  width = 416,
}) => {
  const getIconStyle = () => {
    switch (icon) {
      case 'danger':
        return 'text-red-500';
      case 'warning':
        return 'text-orange-500';
      default:
        return 'text-blue-500';
    }
  };

  const getOkButtonType = () => {
    return danger ? 'primary' : 'primary';
  };

  const okButtonProps = danger ? { danger: true } : {};

  return (
    <Modal
      title={
        icon !== 'info' ? (
          <div className="flex items-center gap-2">
            <ExclamationCircleOutlined className={getIconStyle()} />
            <span>{title}</span>
          </div>
        ) : (
          title
        )
      }
      open={open}
      onOk={onOk}
      onCancel={onCancel}
      okText={okText}
      cancelText={cancelText}
      confirmLoading={loading}
      okButtonProps={{
        type: getOkButtonType(),
        ...okButtonProps,
      }}
      width={width}
    >
      <div className="py-3">
        {/* Main message */}
        <p className={danger ? 'text-red-500 font-bold mb-3' : 'mb-3'}>
          {message}
        </p>

        {/* Items list */}
        {items.length > 0 && (
          <div className="my-4">
            <List
              size="small"
              dataSource={items}
              renderItem={(item) => {
                if (typeof item === 'string') {
                  return <List.Item>{item}</List.Item>;
                }
                // Handle objects with label and value
                if (item.label && item.value) {
                  return (
                    <List.Item>
                      <span>{item.label}</span>
                      <strong className="ml-2">{item.value}</strong>
                    </List.Item>
                  );
                }
                // Handle change objects with old and new values
                if (item.old !== undefined && item.new !== undefined) {
                  return (
                    <List.Item>
                      {item.label}: <strong>{item.old}</strong> → <strong>{item.new}</strong>
                    </List.Item>
                  );
                }
                return <List.Item>{JSON.stringify(item)}</List.Item>;
              }}
            />
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ConfirmationModal;