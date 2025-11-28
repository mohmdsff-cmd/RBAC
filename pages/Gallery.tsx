
import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { ImageUploader } from '../components/ImageUploader';
import { GalleryViewer, GalleryItem } from '../components/GalleryViewer';

// Mock Initial Items (Just the list, no heavy data)
const initialList: GalleryItem[] = Array.from({ length: 12 }, (_, i) => ({
    id: i,
    title: `Evidence Item ${100 + i}`,
    type: i % 4 === 0 ? 'pdf' : 'image', // Every 4th item is a PDF
    thumbnail: i % 4 === 0 ? undefined : `https://picsum.photos/200/200?random=${i}`,
    description: 'Recovered from site B'
}));

const Gallery: React.FC = () => {
  const [items, setItems] = useState<GalleryItem[]>(initialList);
  const [showUpload, setShowUpload] = useState(false);

  // --- Mock API Implementations ---

  // 1. Fetch Content (Simulates fetching Base64 string based on ID)
  const mockFetchContent = async (id: string | number): Promise<{ base64: string; mimeType: string }> => {
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));

    const item = items.find(i => i.id === id);
    const isPdf = item?.type === 'pdf';

    // Return dummy Base64 strings
    if (isPdf) {
        // A minimal valid 1-page PDF base64 (Blank page)
        const dummyPdfBase64 = "JVBERi0xLjcKCjEgMCBvYmogICUgZW50cnkgcG9pbnQKPDwKICAvVHlwZSAvQ2F0YWxvZwogIC9QYWdlcyAyIDAgUgo+PgRlbmRvYmoKCjIgMCBvYmoKPDwKICAvVHlwZSAvUGFnZXwKICAvTWVkaWFCb3ggWyAwIDAgMjAwIDIwMCBdCiAgL0NvdW50IDEKICAvS2lkcyBbIDMgMCBSIF0KPj4KZW5kb2JqCgozIDAgb2JqCjw8CiAgL1R5cGUgL1BhZ2UKICAvUGFyZW50IDIgMCBSC4gIC9SZXNvdXJjZXMgPDwKICAgIC9Gb250IDw8CiAgICAgIC9GMSA0IDAgUgogICAgPj4KICA+PgogIC9Db250ZW50cyA1IDAgUgo+PgRlbmRvYmoKCjQgMCBvYmoKPDwKICAvVHlwZSAvRm9udAogIC9TdWJ0eXBlIC9UeXBlMQogIC9CYXNlRm9udCAvVGltZXMtUm9tYW4KPj4KZW5kb2JqCgo1IDAgb2JqCiAgPDwgL0xlbmd0aCA0NCA+PgpzdHJlYW0KQlQKNzAgNTAgVGQKL0YxIDEyIFRmCihIZWxsbywgdGhpcyBpcyBhIFBERiBkb2N1bWVudC4pIFRqCkVUCmVuZHN0cmVhbQRlbmRvYmoKCnhyZWYKMCA2CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAxMCAwMDAwMCBuIAowMDAwMDAwMDYwIDAwMDAwIG4gCjAwMDAwMDAxNTcgMDAwMDAgbiAKMDAwMDAwMDI1NSAwMDAwMCBuIAowMDAwMDAwMzYyIDAwMDAwIG4gCnRyYWlsZXIKPDwKICAvU2l6ZSA2CiAgL1Jvb3QgMSAwIFIKPj4Kc3RhcnR4cmVmCjQ1OQolJUVPRgo=";
        return { base64: dummyPdfBase64, mimeType: 'application/pdf' };
    } else {
        // In a real app, you would fetch the image bytes and convert to base64. 
        // For this mock, we'll fetch a placeholder image and convert it on the fly 
        // just to demonstrate "base64" handling in the Viewer.
        try {
            const response = await fetch(`https://picsum.photos/800/600?random=${id}`);
            const blob = await response.blob();
            return new Promise((resolve) => {
                const reader = new FileReader();
                reader.onloadend = () => {
                    const base64data = reader.result as string;
                    // remove data prefix if present to simulate raw base64 response from API
                    const rawBase64 = base64data.split(',')[1]; 
                    resolve({ base64: rawBase64, mimeType: 'image/jpeg' });
                };
                reader.readAsDataURL(blob);
            });
        } catch (e) {
            return { base64: "", mimeType: 'image/jpeg' };
        }
    }
  };

  // 2. Fetch Metadata (Simulates fetching details based on ID)
  const mockFetchMetadata = async (id: string | number): Promise<any[]> => {
     await new Promise(resolve => setTimeout(resolve, 500));
     
     return [
        { property: 'ID', value: id },
        { property: 'Fetched At', value: new Date().toLocaleTimeString() },
        { property: 'Source', value: 'Secure Vault API' },
        { property: 'Encryption', value: 'AES-256' },
        { property: 'Owner', value: 'Department of Justice' },
        { property: 'Classification', value: 'Confidential' },
        { property: 'File Size', value: `${(Math.random() * 5 + 1).toFixed(2)} MB` }
     ];
  };

  const onUploadComplete = (files: File[]) => {
    // In a real scenario, you'd upload, get an ID, and add to list.
    const newItems: GalleryItem[] = files.map((file, idx) => ({
        id: `new-${Date.now()}-${idx}`,
        title: file.name,
        type: file.type.includes('pdf') ? 'pdf' : 'image',
        thumbnail: URL.createObjectURL(file) // Just for thumbnail preview
    }));
    setItems([...items, ...newItems]);
    setShowUpload(false);
  };

  return (
    <div className="flex flex-column gap-3">
        {/* Page Header / Actions */}
        <div className="flex justify-content-between align-items-center surface-card p-3 border-round shadow-1">
            <div>
                <h1 className="text-xl font-bold m-0">Evidence Gallery</h1>
                <p className="text-sm text-500 m-0">Secure viewer with on-demand decryption</p>
            </div>
            <Button label="Upload Evidence" icon="pi pi-upload" onClick={() => setShowUpload(true)} severity="info" size="small" />
        </div>

        {/* Reusable Gallery Component */}
        <GalleryViewer 
            items={items}
            onFetchContent={mockFetchContent}
            onFetchMetadata={mockFetchMetadata}
        />

        {/* Upload Dialog */}
        <Dialog header="Upload Evidence" visible={showUpload} style={{ width: '50vw' }} onHide={() => setShowUpload(false)}>
            <ImageUploader onUpload={onUploadComplete} multiple={true} accept="image/*,application/pdf" />
        </Dialog>
    </div>
  );
};

export default Gallery;
