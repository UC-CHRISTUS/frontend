'use client';

import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import Link from 'next/link';
import styles from './page.module.css';

export default function Home() {
  const { currentUser } = useAuth();
  const { files } = useData();

  // Filtrar archivos según el rol
  const visibleFiles = currentUser?.role === 'codificador' || currentUser?.role === 'jefe-codificador'
    ? files.filter(f => f.uploadedBy === currentUser?.id)
    : files; // Finanzas y superadmin ven todos

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Dashboard</h1>
      
      {!currentUser ? (
        <div className={styles.welcomeCard}>
          <h3>Bienvenido a DataUnion</h3>
          <p>Por favor, selecciona un rol para comenzar</p>
        </div>
      ) : (
        <div className={styles.dashboardGrid}>
          <div className={styles.card}>
            <h3>👋 Bienvenido, {currentUser.name}</h3>
            <p>Rol: <strong>{currentUser.role}</strong></p>
          </div>

          <div className={styles.card}>
            <h3>📂 Archivos en la plataforma</h3>
            <p className={styles.fileCount}>{visibleFiles.length}</p>
            {visibleFiles.length > 0 ? (
              <Link href="/visualizator" className={styles.link}>
                Ver archivos →
              </Link>
            ) : (
              <p className={styles.noFiles}>
                {currentUser.role === 'codificador' ? 'Sube tu primer archivo' : 'No hay archivos disponibles'}
              </p>
            )}
          </div>

          {(currentUser.role === 'codificador' || currentUser.role === 'superadmin') && (
            <div className={styles.card}>
              <h3>📤 Subir archivo</h3>
              <p>Carga archivos Excel para codificación</p>
              <Link href="/upload" className={styles.link}>
                Ir a subir →
              </Link>
            </div>
          )}

          {(currentUser.role === 'finanzas' || currentUser.role === 'jefe-finanzas' || currentUser.role === 'superadmin') && (
            <div className={styles.card}>
              <h3>💰 Tareas pendientes</h3>
              <p className={styles.fileCount}>
                {files.filter(f => f.markedCells.length > 0 && f.status !== 'completed').length}
              </p>
              <Link href="/visualizator" className={styles.link}>
                Ver tareas →
              </Link>
            </div>
          )}
        </div>
      )}
    </div>
  );
}