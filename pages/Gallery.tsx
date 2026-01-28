
import React, { useState, useEffect } from 'react';
import { Button } from 'primereact/button';
import { GalleryViewer } from '../components/GalleryViewer';
import { mockFetchCases, CaseSummary } from '../services/mockApi';

const Gallery: React.FC = () => {
  const [selectedCase, setSelectedCase] = useState<CaseSummary | null>(null);

  useEffect(() => {
    const loadCases = async () => {
        try {
            const data = await mockFetchCases();
            if (data.length > 0) setSelectedCase(data[0]);
        } catch (e) {
            console.error("Failed to load cases");
        }
    };
    loadCases();
  }, []);

  return (
    <div className="h-full flex flex-column gap-3" style={{ height: 'calc(100vh - 8rem)' }}>
        {/* Gallery Header */}
        <div className="surface-card p-3 border-round-xl shadow-2 border-1 border-200 flex align-items-center justify-content-between shrink-0">
            <div>
                <h1 className="text-xl font-bold m-0 text-900 flex align-items-center gap-2">
                    <i className="pi pi-images text-primary"></i>
                    Secure Asset Vault
                </h1>
                <p className="text-xs text-500 m-0 mt-1">Reviewing Case File: <span className="text-primary font-bold">{selectedCase?.id || 'Loading Context...'}</span></p>
            </div>
            <div className="flex gap-2">
                <Button label="Upload New Asset" icon="pi pi-cloud-upload" size="small" outlined />
                <Button label="Export Log" icon="pi pi-download" size="small" severity="secondary" outlined />
            </div>
        </div>

        {/* Main Viewer Area */}
        <div className="flex-1 border-1 border-200 border-round-xl overflow-hidden shadow-2 surface-card">
            {selectedCase ? (
                <GalleryViewer 
                    documentId={selectedCase.id} 
                    showInfo={true} 
                    className="h-full border-none shadow-none border-round-0"
                    style={{ height: '100%', maxHeight: '100%' }}
                />
            ) : (
                <div className="flex align-items-center justify-content-center h-full text-500">
                    <i className="pi pi-spin pi-spinner text-4xl"></i>
                </div>
            )}
        </div>
    </div>
  );
};

export default Gallery;
