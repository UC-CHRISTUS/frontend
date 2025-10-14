"use client";

import React from 'react';
import { useAuth, UserRole } from '../contexts/AuthContext';
import styles from './RoleSelector.module.css';

export default function RoleSelector() {
  const { currentUser, login, logout } = useAuth();

  const roles: { value: Exclude<UserRole, null>; label: string }[] = [
    { value: 'superadmin', label: 'Admin' },
    { value: 'codificador', label: 'Codificador' },
    { value: 'jefe-codificador', label: 'Jefe Codificador' },
    { value: 'finanzas', label: 'Finanzas' },
    { value: 'jefe-finanzas', label: 'Jefe Finanzas' },
  ];

  return (
    <div className={styles.container}>
      {currentUser ? (
        <div className={styles.userInfo}>
          <span className={styles.userName}>
            {currentUser.name}
          </span>
          <button onClick={logout} className={styles.logoutBtn}>
            Cerrar sesión
          </button>
        </div>
      ) : (
        <div className={styles.loginContainer}>
          <span className={styles.label}>Simular login como:</span>
          <select
            onChange={(e) => login(e.target.value as UserRole)}
            className={styles.select}
            defaultValue=""
          >
            <option value="" disabled>
              Seleccionar rol...
            </option>
            {roles.map(role => (
              <option key={role.value} value={role.value}>
                {role.label}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
