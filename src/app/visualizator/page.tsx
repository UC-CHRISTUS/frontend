'use client';

import React, { useState } from "react";
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import dynamic from "next/dynamic";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import "ag-grid-community/styles/ag-theme-alpine.css";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import styles from './page.module.css';

// Registrar módulos AG Grid
ModuleRegistry.registerModules([AllCommunityModule]);

// Import dinámico para evitar SSR issues con AG Grid
const AgGridReact = dynamic<any>(
  () => import("ag-grid-react").then((mod) => mod.AgGridReact),
  { ssr: false }
);

export default function VisualizatorPage() {
  const { currentUser } = useAuth();
  const { files, markCell, unmarkCell, updateCellValue } = useData();
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [gridApi, setGridApi] = useState<any>(null);

  const selectedFile = files.find(f => f.id === selectedFileId);

  const onGridReady = (params: any) => {
    setGridApi(params.api);
  };

  const handleCellClicked = (params: any) => {
    if (!selectedFile || !currentUser) return;

    // Solo codificadores pueden marcar celdas
    if (currentUser.role !== 'codificador' && currentUser.role !== 'superadmin') {
      return;
    }

    const rowIndex = params.node.rowIndex;
    const colId = params.column.getColId();

    const isMarked = selectedFile.markedCells.some(
      m => m.row === rowIndex && m.col === colId
    );

    if (isMarked) {
      unmarkCell(selectedFile.id, rowIndex, colId);
    } else {
      markCell(selectedFile.id, rowIndex, colId);
    }

    // Refrescar la celda para actualizar el estilo
    params.api.refreshCells({ rowNodes: [params.node], columns: [colId], force: true });
  };

  const handleCellValueChanged = (params: any) => {
    if (!selectedFile) return;

    const rowIndex = params.node.rowIndex;
    const colId = params.column.getColId();
    const newValue = params.newValue;

    updateCellValue(selectedFile.id, rowIndex, colId, newValue);
  };

  const handleDownload = () => {
    if (!selectedFile) return;

    const aoa = [
      selectedFile.columnDefs.map((col: any) => col.headerName),
      ...selectedFile.rowData.map((row: any) =>
        selectedFile.columnDefs.map((col: any) => row[col.field] ?? "")
      ),
    ];

    const ws = XLSX.utils.aoa_to_sheet(aoa);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Hoja1");

    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "array" });
    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `editado_${selectedFile.filename}`);
  };

  const getCellStyle = (params: any) => {
    if (!selectedFile) return {};

    const rowIndex = params.node.rowIndex;
    const colId = params.column.getColId();

    const isMarked = selectedFile.markedCells.some(
      m => m.row === rowIndex && m.col === colId
    );

    if (isMarked) {
      return { backgroundColor: '#fef3c7', border: '2px solid #f59e0b' };
    }

    return {};
  };

  const isCellEditable = (params: any) => {
    if (!currentUser || !selectedFile) return false;

    // Superadmin puede editar todo
    if (currentUser.role === 'superadmin') return true;

    // Finanzas solo puede editar celdas marcadas
    if (currentUser.role === 'finanzas' || currentUser.role === 'jefe-finanzas') {
      const rowIndex = params.node.rowIndex;
      const colId = params.column.getColId();
      return selectedFile.markedCells.some(
        m => m.row === rowIndex && m.col === colId
      );
    }

    // Codificadores no pueden editar
    return false;
  };

  if (!currentUser) {
    return (
      <div className={styles.container}>
        <div className={styles.warning}>
          <p>⚠️ Por favor, selecciona un rol para visualizar archivos</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>📊 Visualizador de Archivos</h1>

      <div className={styles.fileSelector}>
        <label className={styles.label}>Seleccionar archivo:</label>
        <select
          value={selectedFileId || ''}
          onChange={(e) => setSelectedFileId(e.target.value || null)}
          className={styles.select}
        >
          <option value="">-- Seleccionar archivo --</option>
          {files.map(file => (
            <option key={file.id} value={file.id}>
              {file.filename} - Subido por {file.uploadedByName}
              {file.markedCells.length > 0 && ` (${file.markedCells.length} celdas marcadas)`}
            </option>
          ))}
        </select>
      </div>

      {selectedFile ? (
        <div className={styles.editorContainer}>
          <div className={styles.toolbar}>
            <div className={styles.info}>
              <p><strong>Archivo:</strong> {selectedFile.filename}</p>
              <p><strong>Subido por:</strong> {selectedFile.uploadedByName}</p>
              <p><strong>Celdas marcadas:</strong> {selectedFile.markedCells.length}</p>
            </div>
            <div className={styles.actions}>
              {currentUser.role === 'codificador' && (
                <div className={styles.hint}>
                  💡 Haz clic en las celdas para marcarlas para finanzas
                </div>
              )}
              {(currentUser.role === 'finanzas' || currentUser.role === 'jefe-finanzas') && (
                <div className={styles.hint}>
                  💡 Solo puedes editar las celdas marcadas (en amarillo)
                </div>
              )}
              <button onClick={handleDownload} className={styles.downloadBtn}>
                💾 Descargar Excel
              </button>
            </div>
          </div>

          <div className="ag-theme-alpine" style={{ height: "600px", width: "100%" }}>
            <AgGridReact
              rowData={selectedFile.rowData}
              columnDefs={selectedFile.columnDefs.map((col: any) => ({
                ...col,
                editable: isCellEditable,
                cellStyle: getCellStyle,
              }))}
              defaultColDef={{
                flex: 1,
                minWidth: 100,
                resizable: true,
              }}
              onGridReady={onGridReady}
              onCellClicked={handleCellClicked}
              onCellValueChanged={handleCellValueChanged}
            />
          </div>
        </div>
      ) : (
        <div className={styles.noFile}>
          <p>Selecciona un archivo para visualizar</p>
        </div>
      )}
    </div>
  );
}
