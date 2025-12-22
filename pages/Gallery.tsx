
import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { GalleryViewer } from '../components/GalleryViewer';

const Gallery: React.FC = () => {
  const [currentDocId, setCurrentDocId] = useState<string | number>('doc-vault-001');

  return (
    <div className="flex flex-column gap-4">
        {/* Gallery Header */}
        <div className="flex flex-column md:flex-row justify-content-between align-items-center surface-card p-4 border-round-xl shadow-2 border-1 border-200">
            <div>
                <h1 className="text-2xl font-bold m-0 text-900 flex align-items-center gap-2">
                    <i className="pi pi-images text-primary"></i>
                    Secure Asset Vault
                </h1>
                <p className="text-sm text-500 m-0 mt-1">Reviewing Case File: <span className="text-primary font-bold">#{currentDocId}</span></p>
            </div>
            <div className="flex gap-2 mt-3 md:mt-0">
                <Button label="Case A" icon="pi pi-folder-open" onClick={() => setCurrentDocId('doc-vault-001')} severity="secondary" size="small" outlined={currentDocId !== 'doc-vault-001'} />
                <Button label="Case B" icon="pi pi-folder-open" onClick={() => setCurrentDocId('doc-vault-002')} severity="secondary" size="small" outlined={currentDocId !== 'doc-vault-002'} />
            </div>
        </div>

        {/* Gallery Viewer with documentId passed as prop */}
        <GalleryViewer documentId={currentDocId} />
    </div>
  );
};

export default Gallery;
