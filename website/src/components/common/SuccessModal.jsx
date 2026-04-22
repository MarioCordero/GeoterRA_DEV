import React from 'react';
import { Modal, Result, Button, Space } from 'antd';
import { CheckCircleOutlined } from '@ant-design/icons';

/**
 * Reusable Success Modal Component
 * 
 * @param {Object} props
 * @param {boolean} props.open - Whether modal is visible
 * @param {string} props.title - Modal title
 * @param {string} props.subtitle - Subtitle/subheader message
 * @param {string} props.message - Main success message
 * @param {string} props.status - Result status: "success" | "info" | "warning" (default: "success")
 * @param {Array} props.confirmText - Primary button text (default: "Continuar")
 * @param {string} props.secondaryText - Secondary button text (optional, e.g., "Volver")
 * @param {Function} props.onConfirm - Callback when primary button is clicked
 * @param {Function} props.onSecondary - Callback when secondary button is clicked
 * @param {boolean} props.autoClose - Auto-close after delay (default: false)
 * @param {number} props.autoCloseDelay - Delay in ms before auto-closing (default: 3000)
 * @param {number} props.width - Modal width (default: 416)
 * @param {boolean} props.showIcon - Show status icon (default: true)
 */
const SuccessModal = ({
  open,
  title,
  subtitle,
  message,
  status = 'success',
  confirmText = 'Continuar',
  secondaryText,
  onConfirm,
  onSecondary,
  autoClose = false,
  autoCloseDelay = 3000,
  width = 416,
  showIcon = true,
}) => {
  // Auto-close effect
  React.useEffect(() => {
    if (autoClose && open) {
      const timer = setTimeout(() => {
        onConfirm?.();
      }, autoCloseDelay);
      return () => clearTimeout(timer);
    }
  }, [autoClose, open, autoCloseDelay, onConfirm]);

  return (
    <Modal
      title={title}
      open={open}
      footer={null}
      closable={false}
      width={width}
      centered
      styles={{
        mask: {
          backgroundColor: 'rgba(0, 0, 0, 0.45)',
        },
      }}
    >
      <div className="py-6 text-center">
        {showIcon && (
          <div className="mb-4">
            <CheckCircleOutlined
              style={{
                fontSize: 48,
                color: status === 'success' ? '#52c41a' : 
                       status === 'warning' ? '#faad14' :
                       '#1890ff',
              }}
            />
          </div>
        )}

        {/* Subtitle */}
        {subtitle && (
          <p className="text-gray-500 m-0 mb-2 text-sm">
            {subtitle}
          </p>
        )}

        {/* Main message */}
        {message && (
          <p className="text-base m-0 mb-6 font-medium">
            {message}
          </p>
        )}

        {/* Action buttons */}
        <Space style={{ width: '100%', justifyContent: 'center' }} size="middle">
          {secondaryText && (
            <Button
              onClick={onSecondary}
              style={{ minWidth: 120 }}
            >
              {secondaryText}
            </Button>
          )}
          <Button
            type="primary"
            onClick={onConfirm}
            style={{ minWidth: 120 }}
          >
            {confirmText}
          </Button>
        </Space>
      </div>
    </Modal>
  );
};

export default SuccessModal;