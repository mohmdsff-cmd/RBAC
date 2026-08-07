
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
    <div className="flex flex-column gap-4" style={{ height: 'calc(100vh - 12rem)' }}>
        {/* Gallery Header */}
        <div className="surface-card border-round-xl p-4 shadow-1 border-1 border-200 flex flex-column md:flex-row align-items-start md:align-items-center justify-content-between flex-shrink-0">
            <div>
                <h1 className="text-2xl font-bold m-0 text-900 flex align-items-center gap-3">
                    <div className="w-3rem h-3rem bg-indigo-100 text-indigo-600 border-round-xl flex align-items-center justify-content-center shadow-1">
                        <i className="pi pi-images text-xl"></i>
                    </div>
                    Secure Asset Vault
                </h1>
                <p className="text-sm text-500 m-0 mt-2">Reviewing Case File: <span className="text-indigo-600 font-mono font-semibold bg-indigo-50 px-2 py-1 border-round-md">{selectedCase?.id || 'Loading Context...'}</span></p>
            </div>
            <div className="flex gap-3 mt-4 md:mt-0">
                <Button label="Upload New Asset" icon="pi pi-cloud-upload" size="small" outlined className="text-indigo-600 border-indigo-200 hover:surface-hover font-medium px-4" />
                <Button label="Export Log" icon="pi pi-download" size="small" severity="secondary" outlined className="text-600 border-200 hover:surface-hover font-medium px-4" />
            </div>
        </div>

        {/* Main Viewer Area */}
        <div className="flex-1 border-1 border-200 border-round-xl overflow-hidden shadow-1 surface-card relative">
            {selectedCase ? (
                <GalleryViewer 
                    documentId={selectedCase.id} 
                    showInfo={true} 
                    className="h-full border-none shadow-none border-round-none"
                    style={{ height: '100%', maxHeight: '100%' }}
                />
            ) : (
                <div className="absolute top-0 left-0 w-full h-full flex flex-column align-items-center justify-content-center text-400 surface-ground">
                    <i className="pi pi-spin pi-spinner text-4xl mb-4 text-indigo-500"></i>
                    <span className="text-sm font-medium text-500">Loading secure assets...</span>
                </div>
            )}
        </div>
    </div>
  );
};

export default Gallery;
