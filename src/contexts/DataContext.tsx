"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

export interface MarkedCell {
  row: number;
  col: string; // field name like 'col_0'
  comment?: string;
}

export interface UploadedFile {
  id: string;
  filename: string;
  uploadedBy: string; // user id
  uploadedByName: string;
  uploadedAt: string;
  rowData: any[];
  columnDefs: any[];
  markedCells: MarkedCell[];
  status: 'pending' | 'in-review' | 'completed';
}

interface DataContextType {
  files: UploadedFile[];
  addFile: (file: Omit<UploadedFile, 'id' | 'uploadedAt'>) => void;
  updateFile: (id: string, updates: Partial<UploadedFile>) => void;
  getFileById: (id: string) => UploadedFile | undefined;
  markCell: (fileId: string, row: number, col: string, comment?: string) => void;
  unmarkCell: (fileId: string, row: number, col: string) => void;
  updateCellValue: (fileId: string, row: number, col: string, value: any) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export function DataProvider({ children }: { children: React.ReactNode }) {
  const [files, setFiles] = useState<UploadedFile[]>([]);

  // Cargar archivos desde localStorage al iniciar
  useEffect(() => {
    const savedFiles = localStorage.getItem('uploadedFiles');
    if (savedFiles) {
      try {
        setFiles(JSON.parse(savedFiles));
      } catch (e) {
        console.error('Error loading files from localStorage', e);
      }
    }
  }, []);

  // Guardar archivos en localStorage cuando cambien
  useEffect(() => {
    localStorage.setItem('uploadedFiles', JSON.stringify(files));
  }, [files]);

  const addFile = (file: Omit<UploadedFile, 'id' | 'uploadedAt'>) => {
    const newFile: UploadedFile = {
      ...file,
      id: Date.now().toString(),
      uploadedAt: new Date().toISOString(),
    };
    setFiles(prev => [...prev, newFile]);
  };

  const updateFile = (id: string, updates: Partial<UploadedFile>) => {
    setFiles(prev => prev.map(file => 
      file.id === id ? { ...file, ...updates } : file
    ));
  };

  const getFileById = (id: string) => {
    return files.find(file => file.id === id);
  };

  const markCell = (fileId: string, row: number, col: string, comment?: string) => {
    setFiles(prev => prev.map(file => {
      if (file.id === fileId) {
        const existingMark = file.markedCells.find(
          m => m.row === row && m.col === col
        );
        
        if (existingMark) {
          // Update comment if exists
          return {
            ...file,
            markedCells: file.markedCells.map(m =>
              m.row === row && m.col === col
                ? { ...m, comment }
                : m
            ),
          };
        } else {
          // Add new mark
          return {
            ...file,
            markedCells: [...file.markedCells, { row, col, comment }],
          };
        }
      }
      return file;
    }));
  };

  const unmarkCell = (fileId: string, row: number, col: string) => {
    setFiles(prev => prev.map(file => {
      if (file.id === fileId) {
        return {
          ...file,
          markedCells: file.markedCells.filter(
            m => !(m.row === row && m.col === col)
          ),
        };
      }
      return file;
    }));
  };

  const updateCellValue = (fileId: string, row: number, col: string, value: any) => {
    setFiles(prev => prev.map(file => {
      if (file.id === fileId) {
        const newRowData = [...file.rowData];
        if (newRowData[row]) {
          newRowData[row] = { ...newRowData[row], [col]: value };
        }
        return { ...file, rowData: newRowData };
      }
      return file;
    }));
  };

  return (
    <DataContext.Provider value={{
      files,
      addFile,
      updateFile,
      getFileById,
      markCell,
      unmarkCell,
      updateCellValue,
    }}>
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const context = useContext(DataContext);
  if (context === undefined) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
}
