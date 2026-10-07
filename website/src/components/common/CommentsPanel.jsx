import React, { useState, useEffect, useCallback } from 'react';
import {
  List,
  Avatar,
  Input,
  Button,
  Tag,
  Popconfirm,
  Tooltip,
  Empty,
  Spin,
  Space,
  Typography,
  Card,
  message,
  Badge,
} from 'antd';
import {
  CommentOutlined,
  SendOutlined,
  EditOutlined,
  DeleteOutlined,
  CheckOutlined,
  CloseOutlined,
  UserOutlined,
  ReloadOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import {
  commentsIndex,
  commentsStore,
  commentsUpdate,
  commentsDelete,
} from '../../config/apiConf';
import { useSession } from '../../hooks/useSession';
import { formatDateProse, formatDateDDMMYYYY } from '../../utils/dateFormatter';

const { Text, Paragraph } = Typography;

const extractList = (resData) => {
  if (!resData) return [];
  if (Array.isArray(resData)) return resData;
  if (Array.isArray(resData.data)) return resData.data;
  if (Array.isArray(resData.data?.data)) return resData.data.data;
  if (Array.isArray(resData.items)) return resData.items;
  return [];
};

const getRoleTag = (role) => {
  const normalized = String(role || '').toLowerCase().trim();
  switch (normalized) {
    case 'admin':
    case 'administrador':
      return <Tag color="red" style={{ fontWeight: 500, borderRadius: 4 }}>Administrador</Tag>;
    case 'investigator':
    case 'investigador':
      return <Tag color="blue" style={{ fontWeight: 500, borderRadius: 4 }}>Investigador</Tag>;
    case 'field_investigator':
    case 'investigador_campo':
    case 'investigador de campo':
      return <Tag color="cyan" style={{ fontWeight: 500, borderRadius: 4 }}>Investigador de Campo</Tag>;
    case 'maintenance':
    case 'mantenimiento':
      return <Tag color="orange" style={{ fontWeight: 500, borderRadius: 4 }}>Mantenimiento</Tag>;
    case 'user':
    case 'usuario':
    default:
      return <Tag color="default" style={{ fontWeight: 500, borderRadius: 4 }}>Usuario</Tag>;
  }
};

const formatCommentTime = (dateVal) => {
  if (!dateVal) return '';
  const d = new Date(dateVal);
  if (isNaN(d.getTime())) return String(dateVal);

  const prose = formatDateProse(d);
  const numeric = formatDateDDMMYYYY(d);
  const hours = String(d.getHours()).padStart(2, '0');
  const minutes = String(d.getMinutes()).padStart(2, '0');

  return {
    display: `${prose} a las ${hours}:${minutes}`,
    numeric,
    full: `${prose} — ${hours}:${minutes} (${numeric})`,
  };
};

/**
 * Polymorphic Comments & Field Log Panel
 * Can be attached to any entity (field_trip, request, geomanifestation)
 *
 * @param {string} entityType - 'field_trip' | 'request' | 'geomanifestation'
 * @param {string} entityId - ULID of the target entity
 * @param {string} [title] - Optional title for the comments section
 * @param {boolean} [compact] - Optional compact mode
 */
const CommentsPanel = ({
  entityType,
  entityId,
  title = 'Bitácora y Comentarios',
  compact = false,
}) => {
  const { user } = useSession();
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [newCommentText, setNewCommentText] = useState('');

  // Editing state for inline editing
  const [editingId, setEditingId] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [updating, setUpdating] = useState(false);

  const currentUserId = user?.user_id || user?.id;
  const isAdmin = user?.role === 'admin';

  const loadComments = useCallback(async () => {
    if (!entityType || !entityId) return;
    try {
      setLoading(true);
      const res = await commentsIndex(entityType, entityId);
      if (res.ok) {
        setComments(extractList(res.data));
      } else {
        setComments([]);
      }
    } catch (err) {
      console.error('❌ Error loading comments:', err);
      setComments([]);
    } finally {
      setLoading(false);
    }
  }, [entityType, entityId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  const handleAddComment = async () => {
    const trimmed = newCommentText.trim();
    if (!trimmed) {
      message.warning('Por favor escribe un comentario');
      return;
    }
    if (trimmed.length > 500) {
      message.error('El comentario no puede exceder 500 caracteres');
      return;
    }

    try {
      setSubmitting(true);
      const res = await commentsStore(entityType, entityId, { comment_text: trimmed });
      if (res.ok) {
        message.success('Comentario agregado');
        setNewCommentText('');
        loadComments();
      } else {
        message.error(res.error || 'Error al agregar comentario');
      }
    } catch (err) {
      message.error(err.message || 'Error de conexión');
    } finally {
      setSubmitting(false);
    }
  };

  const handleStartEdit = (item) => {
    setEditingId(item.comment_id || item.id);
    setEditingText(item.comment_text || '');
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setEditingText('');
  };

  const handleSaveEdit = async (commentId) => {
    const trimmed = editingText.trim();
    if (!trimmed) {
      message.warning('El comentario no puede estar vacío');
      return;
    }
    if (trimmed.length > 500) {
      message.error('El comentario no puede exceder 500 caracteres');
      return;
    }

    try {
      setUpdating(true);
      const res = await commentsUpdate(commentId, { comment_text: trimmed });
      if (res.ok) {
        message.success('Comentario actualizado');
        setEditingId(null);
        setEditingText('');
        loadComments();
      } else {
        message.error(res.error || 'Error al actualizar comentario');
      }
    } catch (err) {
      message.error(err.message || 'Error de conexión');
    } finally {
      setUpdating(false);
    }
  };

  const handleDeleteComment = async (commentId) => {
    try {
      const res = await commentsDelete(commentId);
      if (res.ok) {
        message.success('Comentario eliminado');
        loadComments();
      } else {
        message.error(res.error || 'Error al eliminar comentario');
      }
    } catch (err) {
      message.error(err.message || 'Error de conexión');
    }
  };

  const canModifyComment = (item) => {
    if (isAdmin) return true;
    const authorObj = item.author || {};
    const authorId = authorObj.user_id || item.user_id;
    if (currentUserId && authorId && String(authorId).trim() === String(currentUserId).trim()) {
      return true;
    }
    return false;
  };

  return (
    <Card
      size={compact ? 'small' : 'default'}
      style={{
        borderRadius: 10,
        backgroundColor: '#fafbfc',
        border: '1px solid #e8e8e8',
        boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
      }}
      title={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <CommentOutlined style={{ color: '#fa8c16', fontSize: 18 }} />
            <Text strong style={{ fontSize: compact ? 14 : 16 }}>
              {title} ({comments.length})
            </Text>
          </div>
          <Button
            size="small"
            type="text"
            icon={<ReloadOutlined />}
            onClick={loadComments}
            loading={loading}
            title="Recargar comentarios"
          />
        </div>
      }
    >
      {/* List of comments */}
      <div
        style={{
          maxHeight: compact ? '280px' : '420px',
          overflowY: 'auto',
          paddingRight: 6,
          marginBottom: 16,
        }}
      >
        {loading && comments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <Spin tip="Cargando comentarios..." />
          </div>
        ) : comments.length === 0 ? (
          <Empty
            image={Empty.PRESENTED_IMAGE_SIMPLE}
            description="No hay notas ni comentarios registrados aún"
            style={{ margin: '16px 0' }}
          />
        ) : (
          <List
            itemLayout="horizontal"
            dataSource={comments}
            renderItem={(item) => {
              const cId = item.comment_id || item.id;
              const isEditing = editingId === cId;

              // Robust extraction supporting both nested author object and flat fields
              const authorObj = item.author || {};
              const authorId = authorObj.user_id || item.user_id;
              const firstName = (authorObj.first_name || item.first_name || '').trim();
              const lastName = (authorObj.last_name || item.last_name || '').trim();
              const fullName = [firstName, lastName].filter(Boolean).join(' ');
              const email = authorObj.email || item.email || '';
              const authorName = fullName || email || 'Usuario';
              const role = authorObj.role || item.role || 'user';

              const isAuthor = Boolean(
                currentUserId &&
                authorId &&
                String(authorId).trim() === String(currentUserId).trim()
              );

              const timeInfo = formatCommentTime(item.created_at);

              return (
                <List.Item
                  key={cId}
                  style={{
                    padding: '12px 14px',
                    backgroundColor: isAuthor ? '#f0f7ff' : '#ffffff',
                    borderRadius: 8,
                    marginBottom: 10,
                    border: isAuthor ? '1px solid #bae0ff' : '1px solid #f0f0f0',
                    borderLeft: isAuthor ? '4px solid #1890ff' : '4px solid #fa8c16',
                    boxShadow: isAuthor ? '0 2px 6px rgba(24,144,255,0.06)' : '0 1px 3px rgba(0,0,0,0.03)',
                    transition: 'all 0.2s ease',
                  }}
                  actions={
                    !isEditing && canModifyComment(item)
                      ? [
                          <Tooltip title="Editar comentario" key="edit">
                            <Button
                              type="text"
                              size="small"
                              icon={<EditOutlined />}
                              onClick={() => handleStartEdit(item)}
                            />
                          </Tooltip>,
                          <Popconfirm
                            title="¿Eliminar este comentario?"
                            key="del"
                            onConfirm={() => handleDeleteComment(cId)}
                            okText="Sí"
                            cancelText="No"
                            okButtonProps={{ danger: true }}
                          >
                            <Tooltip title="Eliminar comentario">
                              <Button type="text" size="small" danger icon={<DeleteOutlined />} />
                            </Tooltip>
                          </Popconfirm>,
                        ]
                      : []
                  }
                >
                  <List.Item.Meta
                    avatar={
                      <Avatar
                        style={{
                          backgroundColor: isAuthor ? '#1890ff' : '#fa8c16',
                          verticalAlign: 'middle',
                          fontWeight: 'bold',
                        }}
                        icon={!authorName ? <UserOutlined /> : undefined}
                      >
                        {authorName.charAt(0).toUpperCase()}
                      </Avatar>
                    }
                    title={
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <Text strong style={{ fontSize: 13, color: isAuthor ? '#096dd9' : '#262626' }}>
                          {authorName}
                        </Text>
                        {isAuthor && (
                          <Tag
                            color="#108ee9"
                            style={{
                              margin: 0,
                              fontSize: 10,
                              fontWeight: 700,
                              borderRadius: 10,
                              padding: '0 6px',
                              lineHeight: '18px',
                            }}
                          >
                            Tú
                          </Tag>
                        )}
                        {getRoleTag(role)}
                        {timeInfo.display && (
                          <Tooltip title={timeInfo.full}>
                            <Text type="secondary" style={{ fontSize: 11, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                              <ClockCircleOutlined style={{ fontSize: 10 }} />
                              {timeInfo.display}
                            </Text>
                          </Tooltip>
                        )}
                      </div>
                    }
                    description={
                      isEditing ? (
                        <div style={{ marginTop: 8 }}>
                          <Input.TextArea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            maxLength={500}
                            rows={2}
                            showCount
                            placeholder="Editar comentario..."
                          />
                          <Space style={{ marginTop: 8 }}>
                            <Button
                              size="small"
                              type="primary"
                              icon={<CheckOutlined />}
                              onClick={() => handleSaveEdit(cId)}
                              loading={updating}
                            >
                              Guardar
                            </Button>
                            <Button size="small" icon={<CloseOutlined />} onClick={handleCancelEdit}>
                              Cancelar
                            </Button>
                          </Space>
                        </div>
                      ) : (
                        <Paragraph
                          style={{
                            margin: '6px 0 0',
                            whiteSpace: 'pre-wrap',
                            color: '#262626',
                            fontSize: 13,
                            lineHeight: 1.5,
                          }}
                        >
                          {item.comment_text}
                        </Paragraph>
                      )
                    }
                  />
                </List.Item>
              );
            }}
          />
        )}
      </div>

      {/* Input box for new comment */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <Input.TextArea
          rows={compact ? 2 : 3}
          value={newCommentText}
          onChange={(e) => setNewCommentText(e.target.value)}
          placeholder="Escribe una observación, nota de campo o comentario (máx. 500 caracteres)..."
          maxLength={500}
          showCount
          disabled={submitting}
          onPressEnter={(e) => {
            if (e.ctrlKey || e.metaKey) {
              handleAddComment();
            }
          }}
        />
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '15px' }}>
          <Text type="secondary" style={{ fontSize: 11 }}>
            Presiona Ctrl + Enter para enviar
          </Text>
          <Button
            type="primary"
            icon={<SendOutlined />}
            onClick={handleAddComment}
            loading={submitting}
            style={{ backgroundColor: '#fa8c16', borderColor: '#fa8c16' }}
          >
            Enviar Comentario
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default CommentsPanel;
