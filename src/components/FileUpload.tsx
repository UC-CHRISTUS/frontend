'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import * as XLSX from 'xlsx';
import styles from './FileUpload.module.css';
import { useAuth } from '../contexts/AuthContext';
import { useData } from '../contexts/DataContext';

export default function FileUpload() {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { currentUser } = useAuth();
  const { addFile } = useData();

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      setSelectedFile(files[0]);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    if (!selectedFile || !currentUser) return;

    setIsUploading(true);

    const reader = new FileReader();
    reader.onload = (event) => {
      const arrayBuffer = event.target?.result;
      if (!arrayBuffer) {
        setIsUploading(false);
        return;
      }

      const workbook = XLSX.read(arrayBuffer, { type: 'array' });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];

      const jsonData: any[] = XLSX.utils.sheet_to_json(worksheet, {
        header: 1,
        defval: '',
      });

      if (jsonData.length === 0) {
        setIsUploading(false);
        return;
      }

      // Crear columnas usando la primera fila
      const cols = jsonData[0].map((val: any, index: number) => ({
        headerName: val || `Col ${index + 1}`,
        field: `col_${index}`,
        editable: true,
        resizable: true,
        sortable: true,
      }));

      // Mapear filas
      const rows = jsonData.slice(1).map((row: any[]) => {
        const obj: any = {};
        row.forEach((val, i) => {
          obj[`col_${i}`] = val;
        });
        return obj;
      });

      // Guardar archivo en el contexto
      addFile({
        filename: selectedFile.name,
        uploadedBy: currentUser.id,
        uploadedByName: currentUser.name,
        rowData: rows,
        columnDefs: cols,
        markedCells: [],
        status: 'pending',
      });

      setIsUploading(false);
      
      // Redirigir al visualizador
      router.push('/visualizator');
    };

    reader.readAsArrayBuffer(selectedFile);
  };

  return (
    <div className={styles.uploadContainer}>
      {!currentUser ? (
        <div className={styles.loginWarning}>
          <p>⚠️ Por favor, selecciona un rol para subir archivos</p>
        </div>
      ) : currentUser.role !== 'codificador' && currentUser.role !== 'superadmin' ? (
        <div className={styles.loginWarning}>
          <p>⚠️ Solo los codificadores pueden subir archivos</p>
        </div>
      ) : (
        <>
          <div
            className={`${styles.dropZone} ${isDragging ? styles.dragging : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className={styles.dropZoneContent}>
              <svg
                className={styles.uploadIcon}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <p className={styles.dropZoneText}>
                Arrastra archivo hasta esta zona
              </p>
              <p className={styles.orText}>o</p>
              <button
                type="button"
                className={styles.chooseFileButton}
                onClick={handleButtonClick}
              >
                Elegir el archivo en mi ordenador
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx,.xls,.csv"
                className={styles.fileInput}
                onChange={handleFileInputChange}
              />
            </div>
          </div>
          
          {selectedFile && (
            <div className={styles.fileInfo}>
              <p className={styles.fileName}>
                Archivo seleccionado: {selectedFile.name}
              </p>
              <p className={styles.fileSize}>
                Tamaño: {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
              </p>
              <button
                onClick={handleUpload}
                disabled={isUploading}
                className={styles.uploadButton}
              >
                {isUploading ? 'Subiendo...' : '📤 Subir archivo'}
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}