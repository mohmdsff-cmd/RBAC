
import React, { useState, useEffect } from 'react';
import { EmbedPDF } from '../components/EmbedPDF';
import { mockFetchContent } from '../services/mockApi';
import { ProgressSpinner } from 'primereact/progressspinner';
import { Toast } from 'primereact/toast';

const PdfRedactionPage: React.FC = () => {
    const [pdfData, setPdfData] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);
    const toast = React.useRef<any>(null);

    useEffect(() => {
        const loadPdf = async () => {
            try {
                // Fetch a dummy PDF from our secure mock API
                const response = await mockFetchContent('secure-redact-sample-pdf');
                setPdfData(response.base64);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        loadPdf();
    }, []);

    const handleSave = (redactions: any[]) => {
        console.log("Saving redactions:", redactions);
        toast.current?.show({ 
            severity: 'success', 
            summary: 'Redactions Saved', 
            detail: `${redactions.length} regions have been flagged for secure masking.`,
            life: 3000 
        });
    };

    if (loading) {
        return (
            <div className="flex flex-column align-items-center justify-content-center h-20rem gap-4">
                <ProgressSpinner />
                <span className="text-sm font-bold text-500 uppercase tracking-widest">Accessing Secure Document...</span>
            </div>
        );
    }

    return (
        <div className="flex flex-column gap-4" style={{ height: 'calc(100vh - 10rem)' }}>
            <Toast ref={toast} />
            <div className="flex flex-column md:flex-row justify-content-between align-items-center surface-card p-4 border-round-xl shadow-2 border-1 border-200">
                <div>
                    <h1 className="text-2xl font-bold m-0 text-900 flex align-items-center gap-2">
                        <i className="pi pi-shield text-red-500"></i>
                        Secure Document Redaction
                    </h1>
                    <p className="text-sm text-500 m-0 mt-1">
                        Sensitive Statement Masking Tool • File: <span className="text-primary font-bold">incident_report_confidential.pdf</span>
                    </p>
                </div>
            </div>

            <div className="flex-1 min-h-0">
                {pdfData && (
                    <EmbedPDF 
                        data={pdfData} 
                        fileName="redacted_incident.pdf" 
                        onSave={handleSave}
                    />
                )}
            </div>
        </div>
    );
};

export default PdfRedactionPage;
