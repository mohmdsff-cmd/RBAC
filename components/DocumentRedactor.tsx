import React, { useRef } from 'react';
import { Card } from 'primereact/card';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Message } from 'primereact/message';
import { Toast } from 'primereact/toast';
import { EmbedPDF, Redaction } from './EmbedPDF';
import { usePdfDocument, useUpdateDocumentRedactions } from '../services/apiService';

interface DocumentRedactorProps {
    documentId: string | number;
    onSaveSuccess?: (data: { success: boolean; message: string }) => void;
}

export const DocumentRedactor: React.FC<DocumentRedactorProps> = ({ documentId, onSaveSuccess }) => {
    const toast = useRef<Toast>(null);
    const { data: document, isLoading, error, refetch } = usePdfDocument(documentId);
    const updateRedactions = useUpdateDocumentRedactions();

    const handleSave = async (redactions: Redaction[]) => {
        if (!documentId) return;

        updateRedactions.mutate(
            { documentId, redactions },
            {
                onSuccess: (response) => {
                    toast.current?.show({
                        severity: 'success',
                        summary: 'Redactions Saved Successfully',
                        detail: response.message || `${redactions.length} regions secured and updated via API.`,
                        life: 4000
                    });
                    if (onSaveSuccess) {
                        onSaveSuccess(response);
                    }
                },
                onError: (err: any) => {
                    toast.current?.show({
                        severity: 'error',
                        summary: 'Save Failed',
                        detail: err.message || 'There was an issue updating the document redactions.',
                        life: 4000
                    });
                }
            }
        );
    };

    if (isLoading) {
        return (
            <div className="flex flex-column align-items-center justify-content-center py-8 gap-4" id="redactor-loader">
                <ProgressSpinner style={{ width: '50px', height: '50px' }} strokeWidth="8" fill="var(--surface-ground)" animationDuration=".5s" />
                <span className="text-sm font-bold text-600 uppercase tracking-widest">Accessing Secure Vault...</span>
            </div>
        );
    }

    if (error || !document) {
        return (
            <Card className="shadow-2 border-round-xl border-1 border-200" id="redactor-error-card">
                <div className="text-center p-4">
                    <Message severity="error" text="Failed to retrieve document secure stream." className="mb-4 w-full" />
                    <p className="text-600 mb-4">The secure document with ID <span className="font-mono font-bold text-900">{documentId}</span> could not be opened or does not exist.</p>
                    <button 
                        onClick={() => refetch()} 
                        className="p-button p-component p-button-outlined"
                        style={{ borderRadius: '4px' }}
                    >
                        <i className="pi pi-refresh mr-2"></i> Retry Connection
                    </button>
                </div>
            </Card>
        );
    }

    return (
        <div className="flex flex-column gap-4" style={{ height: '100%' }} id={`document-redactor-${documentId}`}>
            <Toast ref={toast} />
            
            <div className="flex flex-column md:flex-row justify-content-between align-items-start md:align-items-center surface-card p-4 border-round-xl shadow-1 border-1 border-100 gap-3">
                <div className="flex align-items-center gap-3">
                    <div className="w-3rem h-3rem border-round-full flex align-items-center justify-content-center bg-red-50 text-red-500">
                        <i className="pi pi-shield text-xl"></i>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold m-0 text-900 tracking-tight flex align-items-center gap-2">
                            Secure Workspace Redactor
                        </h1>
                        <p className="text-xs text-500 m-0 mt-1">
                            Document Ref: <span className="text-primary font-bold font-mono">{documentId}</span> • Name: <span className="text-700 font-bold">{document.fileName}</span>
                        </p>
                    </div>
                </div>
                <div className="flex align-items-center gap-2">
                    {updateRedactions.isPending && (
                        <span className="text-xs text-500 font-bold flex align-items-center gap-2">
                            <i className="pi pi-spin pi-spinner text-sm text-red-500"></i>
                            Syncing database...
                        </span>
                    )}
                    <span className="px-3 py-1 text-xs font-bold border-round-3xl bg-blue-50 text-blue-700 border-1 border-blue-100 uppercase tracking-wider">
                        Active Sandbox Mode
                    </span>
                </div>
            </div>

            <div className="flex-1 min-h-0 relative">
                {updateRedactions.isPending && (
                    <div 
                        className="absolute top-0 left-0 w-full h-full flex flex-column align-items-center justify-content-center gap-3 border-round-xl z-5"
                        style={{ backgroundColor: 'rgba(255, 255, 255, 0.75)', backdropFilter: 'blur(2px)' }}
                    >
                        <ProgressSpinner style={{ width: '40px', height: '40px' }} strokeWidth="6" />
                        <span className="text-sm font-bold text-900">Uploading Securing Masks to API...</span>
                    </div>
                )}
                <EmbedPDF 
                    data={document.base64} 
                    fileName={document.fileName} 
                    onSave={handleSave} 
                />
            </div>
        </div>
    );
};
