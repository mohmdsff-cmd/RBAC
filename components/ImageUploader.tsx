
import React, { useRef } from 'react';
import { FileUpload, FileUploadHandlerEvent } from 'primereact/fileupload';
import { Toast } from 'primereact/toast';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';

interface ImageUploaderProps {
  onUpload: (files: File[]) => void;
  multiple?: boolean;
  maxFileSize?: number;
  accept?: string;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  onUpload,
  multiple = true,
  maxFileSize = 1000000,
  accept = "image/*"
}) => {
  const toast = useRef<Toast>(null);
  const fileUploadRef = useRef<FileUpload>(null);

  const onTemplateUpload = (e: FileUploadHandlerEvent) => {
    // Simulate API upload delay
    setTimeout(() => {
        // Pass files back to parent
        onUpload(e.files);
        
        toast.current?.show({ severity: 'success', summary: 'Success', detail: 'File Uploaded Successfully' });
        
        // Clear the upload component
        fileUploadRef.current?.clear();
    }, 1000);
  };

  const headerTemplate = (options: any) => {
    const { className, chooseButton, uploadButton, cancelButton } = options;
    return (
        <div className={className} style={{ backgroundColor: 'transparent', display: 'flex', alignItems: 'center' }}>
            {chooseButton}
            {uploadButton}
            {cancelButton}
            <div className="flex align-items-center gap-3 ml-auto">
                <span className="text-sm text-500">Max size: {maxFileSize / 1000000}MB</span>
            </div>
        </div>
    );
  };

  const itemTemplate = (file: object, props: any) => {
    return (
        <div className="flex align-items-center flex-wrap">
            <div className="flex align-items-center" style={{ width: '40%' }}>
                <img alt={(file as File).name} role="presentation" src={(file as any).objectURL} width={50} className="shadow-2 mr-3" />
                <span className="flex flex-column text-left ml-3">
                    {(file as File).name}
                    <small>{new Date().toLocaleDateString()}</small>
                </span>
            </div>
            <Tag value={props.formatSize} severity="warning" className="px-3 py-2" />
            <Button type="button" icon="pi pi-times" className="p-button-outlined p-button-rounded p-button-danger ml-auto" onClick={() => props.onRemove()} />
        </div>
    );
  };

  const emptyTemplate = () => {
    return (
        <div className="flex align-items-center justify-content-center flex-column py-6">
            <i className="pi pi-image mt-3 p-5 text-5xl text-400 border-2 border-dashed border-300 border-circle" />
            <span className="text-lg text-500 mt-4">Drag and Drop Images Here</span>
        </div>
    );
  };

  return (
    <div className="card">
      <Toast ref={toast} />
      <FileUpload 
        ref={fileUploadRef} 
        name="images[]" 
        url="/api/upload" 
        multiple={multiple} 
        accept={accept} 
        maxFileSize={maxFileSize}
        onUpload={onTemplateUpload} 
        customUpload
        uploadHandler={onTemplateUpload}
        headerTemplate={headerTemplate} 
        itemTemplate={itemTemplate} 
        emptyTemplate={emptyTemplate}
        chooseOptions={{ icon: 'pi pi-fw pi-images', iconOnly: false, className: 'p-button-rounded p-button-outlined' }}
        uploadOptions={{ icon: 'pi pi-fw pi-cloud-upload', iconOnly: false, className: 'p-button-rounded p-button-success' }}
        cancelOptions={{ icon: 'pi pi-fw pi-times', iconOnly: false, className: 'p-button-rounded p-button-danger' }}
      />
    </div>
  );
};
