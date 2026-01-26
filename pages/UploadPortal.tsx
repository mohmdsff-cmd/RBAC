
import React, { useState } from 'react';
import { UnifiedUpload } from '../components/UnifiedUpload';
import { SelectButton } from 'primereact/selectbutton';
import { Card } from 'primereact/card';

const UploadPortal: React.FC = () => {
    const [selectedType, setSelectedType] = useState<1 | 2 | 3>(1);

    const typeOptions = [
        { label: 'Standard (Type 1)', value: 1 },
        { label: 'Secure (Type 2)', value: 2 },
        { label: 'Audit (Type 3)', value: 3 }
    ];

    const getRequirements = (type: number) => {
        switch(type) {
            case 1: return { accept: '.jpg,.jpeg,.png', max: 5000000 }; // 5MB Images
            case 2: return { accept: '.pdf,.docx,.enc', max: 15000000 }; // 15MB Docs
            case 3: return { accept: '.csv,.xlsx,.xml', max: 2000000 }; // 2MB Spreadsheets
            default: return { accept: '*', max: 1000000 };
        }
    };

    const reqs = getRequirements(selectedType);

    return (
        <div className="w-full max-w-5xl mx-auto mt-4">
             <div className="mb-4">
                <h1 className="text-3xl font-bold text-800 m-0">Document Ingestion</h1>
                <p className="text-500 m-0 mt-2">Select a processing channel and upload files for asynchronous handling.</p>
            </div>

            <div className="grid">
                <div className="col-12 md:col-4">
                    <Card title="Channel Configuration" className="h-full shadow-1">
                        <p className="text-sm text-600 mb-3">Select the destination system for your files.</p>
                        <div className="flex flex-column gap-3">
                            <SelectButton 
                                value={selectedType} 
                                onChange={(e) => e.value && setSelectedType(e.value)} 
                                options={typeOptions} 
                                className="w-full flex flex-column"
                                pt={{
                                    button: { className: 'w-full mb-2' }
                                }}
                            />
                            
                            <div className="surface-50 p-3 border-round border-1 border-200 mt-3">
                                <span className="block text-xs font-bold text-700 uppercase mb-2">Channel Policies</span>
                                <ul className="m-0 pl-3 text-sm text-600 line-height-3">
                                    <li>Files are processed sequentially.</li>
                                    <li>Max Size: <span className="font-bold text-900">{(reqs.max / 1000000).toFixed(0)}MB</span></li>
                                    <li>Allowed: <span className="font-bold text-900">{reqs.accept}</span></li>
                                </ul>
                            </div>
                        </div>
                    </Card>
                </div>
                
                <div className="col-12 md:col-8">
                    <UnifiedUpload 
                        uploadType={selectedType}
                        accept={reqs.accept}
                        maxFileSize={reqs.max}
                    />
                </div>
            </div>
        </div>
    );
};

export default UploadPortal;
