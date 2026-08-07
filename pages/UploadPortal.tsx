
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
        <div className="w-full max-w-6xl mx-auto flex flex-col gap-6">
             <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 m-0 tracking-tight">Document Ingestion</h1>
                    <p className="text-gray-500 m-0 mt-1">Select a processing channel and upload files for asynchronous handling.</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-4 flex flex-col">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 flex flex-col h-full">
                        <h3 className="text-lg font-bold text-gray-900 mb-2 m-0">Channel Configuration</h3>
                        <p className="text-sm text-gray-500 mb-6">Select the destination system for your files.</p>
                        
                        <div className="flex flex-col gap-6 flex-1">
                            <SelectButton 
                                value={selectedType} 
                                onChange={(e) => e.value && setSelectedType(e.value)} 
                                options={typeOptions} 
                                className="w-full flex flex-col gap-2 custom-select-button"
                            />
                            
                            <div className="bg-gray-50 p-5 rounded-xl border border-gray-100 mt-auto">
                                <span className="block text-xs font-bold text-gray-900 uppercase tracking-wider mb-3">Channel Policies</span>
                                <ul className="m-0 pl-4 text-sm text-gray-600 space-y-2">
                                    <li>Files are processed sequentially.</li>
                                    <li>Max Size: <span className="font-bold text-gray-900">{(reqs.max / 1000000).toFixed(0)}MB</span></li>
                                    <li>Allowed: <span className="font-bold text-gray-900">{reqs.accept}</span></li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div className="lg:col-span-8 flex flex-col">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 h-full">
                        <UnifiedUpload 
                            uploadType={selectedType}
                            accept={reqs.accept}
                            maxFileSize={reqs.max}
                        />
                    </div>
                </div>
            </div>
            <style>{`
                .custom-select-button .p-button {
                    border-radius: 0.75rem !important;
                    background: #f8fafc;
                    border: 1px solid #e2e8f0;
                    color: #475569;
                    font-weight: 500;
                    transition: all 0.2s;
                }
                .custom-select-button .p-button:not(.p-disabled):not(.p-highlight):hover {
                    background: #f1f5f9;
                    border-color: #cbd5e1;
                    color: #0f172a;
                }
                .custom-select-button .p-button.p-highlight {
                    background: #eff6ff;
                    border-color: #3b82f6;
                    color: #1d4ed8;
                    box-shadow: 0 0 0 1px #3b82f6;
                }
            `}</style>
        </div>
    );
};

export default UploadPortal;
