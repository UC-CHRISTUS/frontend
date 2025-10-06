import FileUpload from '../../components/FileUpload';
import styles from './page.module.css';

export default function UploadPage() {
  return (
    <div className={styles.container}>
      <FileUpload />
    </div>
  );
}