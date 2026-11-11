import React, { useState, useMemo, useEffect } from 'react';
import {
  Modal,
  Input,
  Select,
  Button,
  Tag,
  Empty,
  Checkbox,
  Spin,
  Space,
} from 'antd';
import {
  UserOutlined,
  SearchOutlined,
  TeamOutlined,
  ClearOutlined,
  CheckOutlined,
  MailOutlined,
  PhoneOutlined,
} from '@ant-design/icons';

export const ROLE_TAG_CONFIG = {
  admin: { color: 'blue', label: 'Administrador' },
  maintenance: { color: 'default', label: 'Mantenimiento' },
  field_investigator: { color: 'orange', label: 'Investigador de Campo' },
  investigator: { color: 'blue', label: 'Investigador de Laboratorio' },
  user: { color: 'default', label: 'Usuario General' },
};

/**
 * UserSelectModal
 * Modal pop-up para seleccionar usuarios/participantes con filtros por rol traducidos al español.
 */
const UserSelectModal = ({
  open,
  onClose,
  users = [],
  selectedUserIds = [],
  onConfirm,
  loading = false,
  title = 'Seleccionar Participantes de la Gira',
  multiple = true,
}) => {
  const [searchText, setSearchText] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [tempSelected, setTempSelected] = useState([]);

  // Sync temp selection when modal opens
  useEffect(() => {
    if (open) {
      setTempSelected(Array.isArray(selectedUserIds) ? [...selectedUserIds] : []);
      setSearchText('');
      setRoleFilter('ALL');
    }
  }, [open, selectedUserIds]);

  // Compute metrics per role
  const roleCounts = useMemo(() => {
    let investigators = 0;
    let admins = 0;
    let generalUsers = 0;

    users.forEach((u) => {
      if (u.role === 'investigator' || u.role === 'field_investigator') {
        investigators++;
      } else if (u.role === 'admin' || u.role === 'maintenance') {
        admins++;
      } else {
        generalUsers++;
      }
    });

    return {
      all: users.length,
      investigators,
      admins,
      generalUsers,
    };
  }, [users]);

  // Filtered users
  const filteredUsers = useMemo(() => {
    const q = searchText.trim().toLowerCase();
    return users.filter((u) => {
      const fullName = `${u.first_name || ''} ${u.last_name || ''}`.trim().toLowerCase();
      const matchesSearch =
        !q ||
        fullName.includes(q) ||
        (u.email && u.email.toLowerCase().includes(q)) ||
        (u.phone_number && u.phone_number.includes(q));

      let matchesRole = true;
      if (roleFilter !== 'ALL') {
        if (roleFilter === 'INVESTIGATORS') {
          matchesRole = u.role === 'investigator' || u.role === 'field_investigator';
        } else if (roleFilter === 'ADMINS') {
          matchesRole = u.role === 'admin' || u.role === 'maintenance';
        } else {
          matchesRole = u.role === roleFilter;
        }
      }

      return matchesSearch && matchesRole;
    });
  }, [users, searchText, roleFilter]);

  const handleToggleUser = (userId) => {
    if (!multiple) {
      setTempSelected([userId]);
      return;
    }
    setTempSelected((prev) =>
      prev.includes(userId) ? prev.filter((id) => id !== userId) : [...prev, userId]
    );
  };

  const handleSelectAllVisible = () => {
    const visibleIds = filteredUsers.map((u) => u.user_id || u.id);
    const allSelected = visibleIds.every((id) => tempSelected.includes(id));
    if (allSelected) {
      setTempSelected((prev) => prev.filter((id) => !visibleIds.includes(id)));
    } else {
      setTempSelected((prev) => Array.from(new Set([...prev, ...visibleIds])));
    }
  };

  const handleConfirm = () => {
    if (onConfirm) {
      const selectedUsers = users.filter((u) => tempSelected.includes(u.user_id || u.id));
      onConfirm(tempSelected, selectedUsers);
    }
    onClose();
  };

  const areAllVisibleSelected =
    filteredUsers.length > 0 &&
    filteredUsers.every((u) => tempSelected.includes(u.user_id || u.id));

  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      width={720}
      style={{ top: 20, maxWidth: 'calc(100vw - 24px)', margin: '0 auto' }}
      styles={{ body: { padding: '16px 20px 20px' } }}
      destroyOnClose
      title={
        <div className="flex items-center gap-2.5 py-1 pr-6 border-b border-gray-100">
          <div className="w-9 h-9 rounded-xl bg-blue-50 text-geoterra-blue flex items-center justify-center text-lg flex-shrink-0">
            <TeamOutlined />
          </div>
          <div className="min-w-0">
            <span className="poppins-bold text-base sm:text-lg text-geoterra-blue block truncate">
              {title}
            </span>
            <span className="text-xs text-gray-500 font-normal block truncate">
              Filtra por rol y selecciona los miembros del equipo para la gira.
            </span>
          </div>
        </div>
      }
    >
      <div className="space-y-4 pt-2 poppins">
        {/* Search & Quick Filters */}
        <div className="space-y-3 bg-gray-50/70 p-3.5 rounded-xl border border-gray-200/80">
          <div className="flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
            <Input
              prefix={<SearchOutlined className="text-gray-400" />}
              placeholder="Buscar por nombre, correo o teléfono..."
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              allowClear
              size="middle"
              className="flex-1"
            />
            <Select
              value={roleFilter}
              onChange={setRoleFilter}
              className="w-full sm:w-56"
              size="middle"
            >
              <Select.Option value="ALL">Todos los Roles ({roleCounts.all})</Select.Option>
              <Select.Option value="INVESTIGATORS">
                Investigadores ({roleCounts.investigators})
              </Select.Option>
              <Select.Option value="field_investigator">Investigador de Campo</Select.Option>
              <Select.Option value="investigator">Investigador de Lab</Select.Option>
              <Select.Option value="ADMINS">
                Admin & Mantenimiento ({roleCounts.admins})
              </Select.Option>
              <Select.Option value="user">
                Usuario General ({roleCounts.generalUsers})
              </Select.Option>
            </Select>
          </div>

          {/* Role quick filter pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-1 text-xs">
            <button
              type="button"
              onClick={() => setRoleFilter('ALL')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                roleFilter === 'ALL'
                  ? 'bg-geoterra-blue text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Todos ({roleCounts.all})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('INVESTIGATORS')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                roleFilter === 'INVESTIGATORS'
                  ? 'bg-orange-500 text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Investigadores ({roleCounts.investigators})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('ADMINS')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                roleFilter === 'ADMINS'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Administración ({roleCounts.admins})
            </button>
            <button
              type="button"
              onClick={() => setRoleFilter('user')}
              className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
                roleFilter === 'user'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-200'
              }`}
            >
              Usuarios Generales ({roleCounts.generalUsers})
            </button>

            {(searchText || roleFilter !== 'ALL') && (
              <Button
                type="link"
                size="small"
                icon={<ClearOutlined />}
                onClick={() => {
                  setSearchText('');
                  setRoleFilter('ALL');
                }}
                className="text-gray-500 hover:text-gray-700 p-0 ml-auto text-xs"
              >
                Limpiar filtros
              </Button>
            )}
          </div>
        </div>

        {/* Top bar with selection count & quick select all */}
        <div className="flex items-center justify-between px-1 text-xs text-gray-500">
          <span>
            Mostrando <strong className="text-gray-700">{filteredUsers.length}</strong> de {users.length} usuarios
          </span>
          {multiple && filteredUsers.length > 0 && (
            <button
              type="button"
              onClick={handleSelectAllVisible}
              className="text-geoterra-blue hover:underline font-semibold cursor-pointer"
            >
              {areAllVisibleSelected
                ? 'Deseleccionar visibles'
                : 'Seleccionar todos los visibles'}
            </button>
          )}
        </div>

        {/* Users List */}
        <div className="max-h-[50vh] overflow-y-auto space-y-2 pr-1 border border-gray-100 rounded-xl p-2 bg-gray-50/40">
          {loading ? (
            <div className="py-12 text-center">
              <Spin />
              <p className="mt-2 text-xs text-gray-500">Cargando lista de usuarios...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-8 text-center bg-white rounded-lg border border-gray-200">
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description="No se encontraron usuarios que coincidan con la búsqueda o el rol filtrado."
              />
            </div>
          ) : (
            filteredUsers.map((user) => {
              const uId = user.user_id || user.id;
              const isSelected = tempSelected.includes(uId);
              const fullName =
                [user.first_name, user.last_name].filter(Boolean).join(' ') ||
                user.email ||
                'Usuario sin nombre';
              const roleConfig = ROLE_TAG_CONFIG[user.role] || {
                color: 'default',
                label: user.role || 'Usuario',
              };

              // User initials
              const initials = (
                (user.first_name?.[0] || '') + (user.last_name?.[0] || '')
              ).toUpperCase() || 'U';

              return (
                <div
                  key={uId}
                  onClick={() => handleToggleUser(uId)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-blue-50/70 border-geoterra-blue shadow-xs'
                      : 'bg-white border-gray-200 hover:border-gray-300 hover:bg-gray-50/50'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0 flex-1 pr-2">
                    {multiple ? (
                      <Checkbox
                        checked={isSelected}
                        onChange={(e) => {
                          e.stopPropagation();
                          handleToggleUser(uId);
                        }}
                      />
                    ) : (
                      <div
                        className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                          isSelected ? 'border-geoterra-blue bg-geoterra-blue' : 'border-gray-300'
                        }`}
                      >
                        {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                      </div>
                    )}

                    <div className="w-9 h-9 rounded-full bg-blue-100 text-geoterra-blue flex items-center justify-center font-bold text-xs flex-shrink-0">
                      {initials}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <span className="font-semibold text-sm text-gray-800 truncate">
                          {fullName}
                        </span>
                        <Tag
                          color={roleConfig.color}
                          className="rounded-full px-2 py-0 text-[11px] font-medium m-0 border-0"
                        >
                          {roleConfig.label}
                        </Tag>
                      </div>

                      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 text-xs text-gray-500 mt-0.5">
                        {user.email && (
                          <span className="flex items-center gap-1 truncate">
                            <MailOutlined className="text-gray-400 text-[10px]" />
                            {user.email}
                          </span>
                        )}
                        {user.phone_number && (
                          <span className="flex items-center gap-1 text-gray-400">
                            <PhoneOutlined className="text-gray-400 text-[10px]" />
                            {user.phone_number}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0 pl-2">
                    {isSelected ? (
                      <span className="inline-flex items-center gap-1 text-xs font-semibold text-geoterra-blue bg-blue-100/70 px-2 py-1 rounded-md">
                        <CheckOutlined /> Asignado
                      </span>
                    ) : (
                      <Button size="small" type="dashed" className="text-xs">
                        Seleccionar
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Modal Footer */}
        <div className="pt-3 border-t border-gray-200 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="text-xs text-gray-600 text-center sm:text-left">
            <span className="font-bold text-geoterra-blue">{tempSelected.length}</span> participante(s) seleccionado(s)
          </div>

          <div className="flex items-center gap-2.5">
            <Button size="large" onClick={onClose} className="flex-1 sm:flex-initial">
              Cancelar
            </Button>
            <Button
              type="primary"
              size="large"
              icon={<CheckOutlined />}
              onClick={handleConfirm}
              style={{ backgroundColor: '#12467E', borderColor: '#12467E' }}
              className="poppins-bold shadow-sm flex-1 sm:flex-initial"
            >
              Confirmar Selección ({tempSelected.length})
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default UserSelectModal;

