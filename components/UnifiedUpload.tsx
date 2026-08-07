
import React, { useRef, useState } from 'react';
import { FileUpload, FileUploadHandlerEvent, ItemTemplateOptions } from 'primereact/fileupload';
import { Button } from 'primereact/button';
import { Toast } from 'primereact/toast';
import { Tag } from 'primereact/tag';
import { Badge } from 'primereact/badge';

type UploadType = 1 | 2 | 3;

interface UnifiedUploadProps {
    uploadType: UploadType;
    accept: string; // e.g. ".pdf,.jpg,.png"
    maxFileSize: number; // in bytes
    onUploadComplete?: () => void;
}

export const UnifiedUpload: React.FC<UnifiedUploadProps> = ({ 
    uploadType, 
    accept, 
    maxFileSize, 
    onUploadComplete 
}) => {
    const toast = useRef<Toast>(null);
    const fileUploadRef = useRef<FileUpload>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [totalSize, setTotalSize] = useState(0);

    const getTypeLabel = (type: UploadType) => {
        switch(type) {
            case 1: return { label: 'Standard Document (Type 1)', color: 'blue' };
            case 2: return { label: 'Secure Evidence (Type 2)', color: 'purple' };
            case 3: return { label: 'Compliance Audit (Type 3)', color: 'orange' };
            default: return { label: 'Unknown', color: 'gray' };
        }
    };

    const typeInfo = getTypeLabel(uploadType);

    const onDropZoneClick = () => {
        // Robust fallback: Find the input inside the wrapper since ref.choose() might be unavailable
        if (wrapperRef.current) {
            const fileInput = wrapperRef.current.querySelector('input[type="file"]') as HTMLInputElement;
            if (fileInput) {
                fileInput.click();
            }
        }
    };

    const onValidationFail = (file: File) => {
        toast.current?.show({
            severity: 'error',
            summary: 'File Rejected',
            detail: `"${file.name}" is not a supported format or exceeds the size limit.`
        });
    };

    const onTemplateSelect = (e: any) => {
        const files: File[] = e.files;
        const allowedExtensions = accept.split(',').map(ext => ext.trim().toLowerCase());
        let hasInvalidFile = false;

        // Manual validation check to enforce strict typing
        for (const file of files) {
            const fileName = file.name.toLowerCase();
            const isExtValid = allowedExtensions.some(allowed => fileName.endsWith(allowed));
            
            if (!isExtValid) {
                hasInvalidFile = true;
                onValidationFail(file);
            }
        }

        if (hasInvalidFile) {
            // Clear invalid selection to enforce rules
            fileUploadRef.current?.clear();
            setTotalSize(0);
            return;
        }
        
        let batchSize = 0;
        // Calculate size of newly added files
        for (let i = 0; i < files.length; i++) {
            batchSize += files[i].size || 0;
        }
        
        // Add batch size to total
        setTotalSize(prev => prev + batchSize);
        
        toast.current?.show({ 
            severity: 'info', 
            summary: 'Files Selected', 
            detail: `${files.length} file(s) added to queue.` 
        });
    };

    const onTemplateRemove = (file: File, callback: Function) => {
        setTotalSize(prev => prev - file.size);
        callback();
    };

    const onTemplateClear = () => {
        setTotalSize(0);
    };

    const customUploadHandler = async (e: FileUploadHandlerEvent) => {
        const files = e.files;
        
        // Final Safety Check
        const allowedExtensions = accept.split(',').map(ext => ext.trim().toLowerCase());
        const validFiles = files.filter(file => 
            allowedExtensions.some(allowed => file.name.toLowerCase().endsWith(allowed))
        );

        if (validFiles.length !== files.length) {
            toast.current?.show({ severity: 'error', summary: 'Error', detail: 'Some files are invalid and were skipped.' });
            if (validFiles.length === 0) {
                fileUploadRef.current?.clear();
                return;
            }
        }

        // Sequential Upload Logic: Process one file at a time
        for (let i = 0; i < validFiles.length; i++) {
            const file = validFiles[i];
            console.log(`[Queue ${i+1}/${validFiles.length}] Uploading ${file.name} to endpoint TYPE_${uploadType}...`);
            
            // Simulate API latency per file to demonstrate sequential processing
            await new Promise(resolve => setTimeout(resolve, 800));
        }

        toast.current?.show({ 
            severity: 'success', 
            summary: 'Batch Upload Complete', 
            detail: `Successfully processed ${validFiles.length} files.` 
        });

        // Clear component state after success
        fileUploadRef.current?.clear();
        setTotalSize(0);
        
        if (onUploadComplete) onUploadComplete();
    };

    const headerTemplate = (options: any) => {
        const { className, chooseButton, uploadButton, cancelButton } = options;
        
        return (
            <div className={`${className} flex align-items-center justify-content-between p-4 surface-ground border-bottom-1 border-100`}>
                <div className="flex gap-2">
                    {chooseButton}
                    {uploadButton}
                    {cancelButton}
                </div>
                <div className="flex align-items-center gap-3">
                    <span className="white-space-nowrap text-sm font-medium text-600">
                        {totalSize > 0 ? `Pending: ${(totalSize / 1024 / 1024).toFixed(2)} MB` : 'Ready'}
                    </span>
                    <Badge value={uploadType} severity="info" className="bg-blue-100 text-blue-700"></Badge>
                </div>
            </div>
        );
    };

    const itemTemplate = (file: object, props: ItemTemplateOptions) => {
        const f = file as File;
        const isPdf = f.name.toLowerCase().endsWith('.pdf');
        const isImage = f.type.startsWith('image/');

        return (
            <div className="flex align-items-center justify-content-between p-4 surface-card border-bottom-1 border-100 hover:surface-hover transition-colors">
                <div className="flex align-items-center gap-4 w-6">
                    <div className={`w-3rem h-3rem border-round-xl flex align-items-center justify-content-center ${isPdf ? 'bg-red-50 text-red-500' : isImage ? 'bg-blue-50 text-blue-500' : 'surface-100 text-500'}`}>
                        <i className={`pi ${isPdf ? 'pi-file-pdf' : isImage ? 'pi-image' : 'pi-file'} text-xl`}></i>
                    </div>
                    <div className="flex flex-column">
                        <span className="font-semibold text-900 white-space-nowrap overflow-hidden text-overflow-ellipsis">{f.name}</span>
                        <span className="text-xs text-500">{new Date(f.lastModified).toLocaleDateString()}</span>
                    </div>
                </div>
                <div className="flex align-items-center gap-4">
                    <Tag value={props.formatSize} severity="warning" className="px-3 py-1 border-round-3xl font-medium text-xs bg-orange-50 text-orange-700 border-1 border-orange-200" />
                    <Button 
                        type="button" 
                        icon="pi pi-times" 
                        className="p-button-rounded p-button-text p-button-danger w-2rem h-2rem p-0 hover:bg-red-50" 
                        onClick={() => onTemplateRemove(f, props.onRemove)} 
                    />
                </div>
            </div>
        );
    };

    const emptyTemplate = () => {
        return (
            <div 
                className="flex flex-column align-items-center justify-content-center py-6 cursor-pointer hover:surface-hover transition-colors border-round-xl w-full border-2 border-dashed border-200 m-4"
                onClick={onDropZoneClick}
            >
                <div className="w-4rem h-4rem bg-blue-50 text-blue-500 border-round-full flex align-items-center justify-content-center mb-4">
                    <i className="pi pi-cloud-upload text-3xl" />
                </div>
                <span className="text-lg text-900 font-bold">Drag and Drop Files Here</span>
                <span className="text-sm text-500 mt-2">
                    Accepted: {accept} • Max: {(maxFileSize / 1024 / 1024).toFixed(0)}MB
                </span>
            </div>
        );
    };

    return (
        <div className="flex flex-column h-full">
            <Toast ref={toast} />
            
            <div className="flex justify-content-between align-items-center mb-4">
                <div className="flex align-items-center gap-3">
                    <div className="w-3rem h-3rem bg-indigo-50 text-indigo-600 border-round-xl flex align-items-center justify-content-center">
                        <i className="pi pi-upload text-xl"></i>
                    </div>
                    <div>
                        <h2 className="text-lg font-bold text-900 m-0">Upload Portal</h2>
                        <span className={`inline-block mt-1 text-xs font-medium px-2 py-1 border-round-3xl bg-${typeInfo.color}-50 text-${typeInfo.color}-700 border-1 border-${typeInfo.color}-200`}>
                            {typeInfo.label}
                        </span>
                    </div>
                </div>
            </div>

            {/* Wrapper div to scope DOM query for fallback click handling */}
            <div ref={wrapperRef} className="flex-1 custom-fileupload">
                <FileUpload 
                    key={uploadType}
                    ref={fileUploadRef} 
                    name="docs[]" 
                    url="/api/upload" 
                    multiple={true}
                    accept={accept} 
                    maxFileSize={maxFileSize}
                    onSelect={onTemplateSelect} 
                    onError={onTemplateClear} 
                    onClear={onTemplateClear}
                    onValidationFail={onValidationFail}
                    headerTemplate={headerTemplate} 
                    itemTemplate={itemTemplate} 
                    emptyTemplate={emptyTemplate}
                    chooseOptions={{ icon: 'pi pi-fw pi-plus', label: 'Choose', className: 'p-button-outlined p-button-secondary' }}
                    uploadOptions={{ icon: 'pi pi-fw pi-cloud-upload', label: 'Upload', className: 'p-button-primary' }}
                    cancelOptions={{ icon: 'pi pi-fw pi-times', label: 'Cancel', className: 'p-button-text p-button-secondary' }}
                    customUpload
                    uploadHandler={customUploadHandler}
                />
            </div>
            <style>{`
                .custom-fileupload .p-fileupload {
                    border: 1px solid #e2e8f0;
                    border-radius: 1rem;
                    overflow: hidden;
                    background: #fff;
                }
                .custom-fileupload .p-fileupload-content {
                    padding: 0;
                    border: none;
                }
                .custom-fileupload .p-button {
                    border-radius: 0.5rem;
                    font-weight: 500;
                    font-size: 0.875rem;
                    padding: 0.5rem 1rem;
                }
            `}</style>
        </div>
    );
};
