import React, { useState } from 'react';
import { DocumentRedactor } from '../components/DocumentRedactor';
import { Dropdown } from 'primereact/dropdown';

const PdfRedactionPage: React.FC = () => {
    const [selectedDocId, setSelectedDocId] = useState<string>('secure-redact-sample-pdf');

    const documentOptions = [
        { label: 'Confidential Incident Report (Incident_Report_01)', value: 'secure-redact-sample-pdf' },
        { label: 'Witness Statement (Statement_Doe_9921)', value: 'api1-doc1' },
        { label: 'Signed Search Warrant (Warrant_Signed_8842)', value: 'api3-doc1' },
    ];

    return (
        <div className="flex flex-column gap-4" style={{ height: 'calc(100vh - 10rem)' }} id="pdf-redaction-page">
            <div className="flex flex-column sm:flex-row justify-content-between align-items-stretch sm:align-items-center surface-card px-4 py-3 border-round-xl shadow-1 border-1 border-100 gap-3">
                <div className="flex flex-column gap-1">
                    <span className="text-xs font-bold text-500 uppercase tracking-wider">Select Secure Source Stream</span>
                    <Dropdown 
                        value={selectedDocId} 
                        options={documentOptions} 
                        onChange={(e) => setSelectedDocId(e.value)} 
                        placeholder="Select a Document"
                        className="w-full sm:w-25rem font-medium"
                    />
                </div>
                <div className="text-right sm:text-left text-xs text-500 max-w-25rem">
                    Choose a secure stream from the directory to fetch its PDF data, designate secure masking coordinates, and compile/sync the changes back via our API.
                </div>
            </div>

            <div className="flex-1 min-h-0">
                <DocumentRedactor documentId={selectedDocId} />
            </div>
        </div>
    );
};

export default PdfRedactionPage;
