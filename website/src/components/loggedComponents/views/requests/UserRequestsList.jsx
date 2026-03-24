import React from 'react';
import UserRequests from '../../../common/UserRequests';
import { usePermissions } from '../../../../hooks/usePermissions';

/**
 * UserRequestsList View
 * Wrapper around UserRequests component
 * Can be shown to all authenticated users
 */
const UserRequestsList = () => {
  return <UserRequests />;
};

export default UserRequestsList;
