
import React, { useState } from 'react';
import { Button } from 'primereact/button';
import { Dialog } from 'primereact/dialog';
import { ImageUploader } from '../components/ImageUploader';
import { GalleryViewer, GalleryItem } from '../components/GalleryViewer';

// Mock Initial Items List
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
        {/* The viewer now uses internal default API calls (mockApi.ts) to fetch content/meta */}
        <GalleryViewer items={items} />

        {/* Upload Dialog */}
        <Dialog header="Upload Evidence" visible={showUpload} style={{ width: '50vw' }} onHide={() => setShowUpload(false)}>
            <ImageUploader onUpload={onUploadComplete} multiple={true} accept="image/*,application/pdf" />
        </Dialog>
    </div>
  );
};

export default Gallery;
