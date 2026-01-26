
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
            <div className={className} style={{ backgroundColor: 'transparent', display: 'flex', alignItems: 'center' }}>
                {chooseButton}
                {uploadButton}
                {cancelButton}
                <div className="flex align-items-center gap-3 ml-auto">
                    <span className="white-space-nowrap text-sm text-600">
                        {totalSize > 0 ? `Pending: ${(totalSize / 1024 / 1024).toFixed(2)} MB` : 'Ready'}
                    </span>
                    <Badge value={uploadType} severity="info"></Badge>
                </div>
            </div>
        );
    };

    const itemTemplate = (file: object, props: ItemTemplateOptions) => {
        const f = file as File;
        const isPdf = f.name.toLowerCase().endsWith('.pdf');
        const isImage = f.type.startsWith('image/');

        return (
            <div className="flex align-items-center flex-wrap p-3 surface-0 border-bottom-1 border-200">
                <div className="flex align-items-center" style={{ width: '40%' }}>
                     <i className={`pi ${isPdf ? 'pi-file-pdf text-red-500' : isImage ? 'pi-image text-blue-500' : 'pi-file text-gray-500'} text-xl mr-3`}></i>
                    <span className="flex flex-column text-left">
                        <span className="font-medium text-900">{f.name}</span>
                        <small className="text-500">{new Date(f.lastModified).toLocaleDateString()}</small>
                    </span>
                </div>
                <Tag value={props.formatSize} severity="warning" className="px-3 py-2" />
                <Button 
                    type="button" 
                    icon="pi pi-times" 
                    className="p-button-outlined p-button-rounded p-button-danger ml-auto" 
                    onClick={() => onTemplateRemove(f, props.onRemove)} 
                />
            </div>
        );
    };

    const emptyTemplate = () => {
        return (
            <div 
                className="flex align-items-center justify-content-center flex-column py-6 cursor-pointer hover:surface-100 transition-colors border-round w-full"
                onClick={onDropZoneClick}
            >
                <i className="pi pi-cloud-upload mt-3 p-5 text-5xl text-400 border-2 border-dashed border-300 border-circle bg-surface-50" />
                <span className="text-lg text-500 mt-4 font-semibold">Drag and Drop Files Here</span>
                <span className="text-sm text-400 mt-2">
                    Accepted: {accept} • Max: {(maxFileSize / 1024 / 1024).toFixed(0)}MB
                </span>
            </div>
        );
    };

    return (
        <div className="surface-card p-4 shadow-2 border-round">
            <Toast ref={toast} />
            
            <div className="flex justify-content-between align-items-center mb-4">
                <div className="flex align-items-center gap-2">
                    <span className="text-xl font-bold text-900">Upload Portal</span>
                    <Tag value={typeInfo.label} className={`bg-${typeInfo.color}-100 text-${typeInfo.color}-700`} />
                </div>
            </div>

            {/* Wrapper div to scope DOM query for fallback click handling */}
            <div ref={wrapperRef}>
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
                    chooseOptions={{ icon: 'pi pi-fw pi-plus', iconOnly: false, className: 'p-button-rounded p-button-outlined' }}
                    uploadOptions={{ icon: 'pi pi-fw pi-cloud-upload', iconOnly: false, className: 'p-button-rounded p-button-success' }}
                    cancelOptions={{ icon: 'pi pi-fw pi-trash', iconOnly: false, className: 'p-button-rounded p-button-danger' }}
                    customUpload
                    uploadHandler={customUploadHandler}
                />
            </div>
        </div>
    );
};
