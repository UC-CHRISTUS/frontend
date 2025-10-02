import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Dashboard</h1>
      <div className={styles.dashboardGrid}>
        <div className={styles.card}>
          <h3>Bienvenido a DataUnion</h3>
          <p> Combina, organiza y edita tus datos de Excel directamente desde tu navegador </p>
        </div>
        {/* <div className={styles.card}>
          <h3>Estadísticas Rápidas</h3>
          <p>Archivos subidos: <strong>0</strong></p>
          <p>Espacio usado: <strong>0 MB</strong></p>
        </div> */}
      </div>
    </div>
  );
}