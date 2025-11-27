
import React, { useState, useRef } from 'react';
import { Button } from 'primereact/button';
import { Tooltip } from 'primereact/tooltip';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { Dialog } from 'primereact/dialog';
import { InputText } from 'primereact/inputtext';
import { ImageUploader } from '../components/ImageUploader';

// Initial Mock Data
const initialImages = Array.from({ length: 12 }, (_, i) => ({
  id: i,
  src: `https://picsum.photos/800/600?random=${i + 10}`,
  thumbnail: `https://picsum.photos/200/200?random=${i + 10}`,
  alt: `Gallery Image ${i + 1}`,
  title: `Scene ${i + 1}`,
  metadata: [
    { property: 'Filename', value: `IMG_${1000 + i}.jpg` },
    { property: 'Date Taken', value: new Date(2023, i, 15).toLocaleDateString() },
    { property: 'Dimensions', value: '800x600' },
    { property: 'Size', value: `${(Math.random() * 5 + 1).toFixed(1)} MB` },
    { property: 'Type', value: 'JPG' },
    { property: 'ISO', value: '100' },
    { property: 'Aperture', value: 'f/2.8' },
    { property: 'Shutter Speed', value: '1/200s' }
  ]
}));

const Gallery: React.FC = () => {
  const [images, setImages] = useState(initialImages);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [showInfo, setShowInfo] = useState(true);
  const [showUpload, setShowUpload] = useState(false);
  const [metaFilter, setMetaFilter] = useState('');
  
  const imageRef = useRef<HTMLImageElement>(null);

  const activeImage = images[currentIndex];

  // Navigation Handlers
  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setZoom(1); // Reset zoom on change
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setZoom(1);
  };

  const selectImage = (index: number) => {
    setCurrentIndex(index);
    setZoom(1);
  };

  // Toolbar Actions
  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.5, 5));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.5, 0.5));
  const handleFitScreen = () => setZoom(1);
  const toggleInfo = () => setShowInfo(!showInfo);

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head><title>Print Image</title></head>
          <body style="margin:0; display:flex; justify-content:center; align-items:center; height:100vh;">
            <img src="${activeImage.src}" style="max-width:100%; max-height:100%;" />
            <script>window.onload = () => { window.print(); window.close(); }</script>
          </body>
        </html>
      `);
      printWindow.document.close();
    }
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(activeImage.src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `image-${activeImage.id}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
      window.open(activeImage.src, '_blank');
    }
  };

  const onUploadComplete = (files: File[]) => {
    const newImages = files.map((file, idx) => {
        const objectUrl = URL.createObjectURL(file);
        return {
            id: images.length + idx,
            src: objectUrl,
            thumbnail: objectUrl,
            alt: file.name,
            title: file.name.split('.')[0],
            metadata: [
                { property: 'Filename', value: file.name },
                { property: 'Date Taken', value: new Date().toLocaleDateString() },
                { property: 'Size', value: `${(file.size / 1024 / 1024).toFixed(2)} MB` },
                { property: 'Type', value: file.type.split('/')[1].toUpperCase() }
            ]
        };
    });

    setImages([...images, ...newImages]);
    setShowUpload(false);
    setCurrentIndex(images.length);
  };

  return (
    <>
    <div className="flex border-1 border-300 border-round shadow-2 overflow-hidden surface-card" style={{ height: 'calc(100vh - 9rem)' }}>
      {/* Left Sidebar - Thumbnails & Navigation (Single Column) */}
      <div className="w-10rem surface-ground border-right-1 border-300 flex flex-column flex-shrink-0">
        
        {/* Navigation Arrows Area */}
        <div className="p-3 border-bottom-1 border-300 surface-card flex align-items-center justify-content-between shadow-1 z-1">
            <Button icon="pi pi-arrow-left" onClick={handlePrev} rounded text severity="secondary" aria-label="Previous" size="small" />
            <span className="font-bold text-600 text-sm">{currentIndex + 1} / {images.length}</span>
            <Button icon="pi pi-arrow-right" onClick={handleNext} rounded text severity="secondary" aria-label="Next" size="small" />
        </div>

        {/* Thumbnails List */}
        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
          <div className="flex flex-column gap-3">
            {images.map((img, index) => (
              <div 
                key={img.id}
                onClick={() => selectImage(index)}
                className={`cursor-pointer border-round overflow-hidden border-2 transition-all hover:shadow-2 aspect-ratio-square ${
                  index === currentIndex 
                    ? 'border-primary shadow-2' 
                    : 'border-transparent opacity-70 hover:opacity-100 hover:border-300'
                }`}
                style={{ aspectRatio: '1/1' }}
              >
                <img 
                  src={img.thumbnail} 
                  alt={img.alt} 
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Center Main Area - Image & Toolbar */}
      <div className="flex-1 flex flex-column relative surface-900 overflow-hidden min-w-0">
        
        {/* Top Toolbar */}
        <div className="h-4rem surface-overlay border-bottom-1 border-300 flex align-items-center justify-content-between px-4 shadow-1 z-2 flex-shrink-0">
          <div className="text-sm text-500 font-medium white-space-nowrap overflow-hidden text-overflow-ellipsis max-w-15rem">
            {activeImage.title}
          </div>
          
          <div className="flex gap-2 align-items-center">
            <Tooltip target=".toolbar-btn" />
            
            <Button icon="pi pi-plus" className="toolbar-btn" onClick={() => setShowUpload(true)} rounded outlined severity="info" tooltip="Upload New" aria-label="Upload" />
            <div className="w-1px h-2rem bg-300 mx-1"></div>
            
            <Button icon="pi pi-search-plus" className="toolbar-btn" onClick={handleZoomIn} rounded text severity="secondary" tooltip="Zoom In" />
            <Button icon="pi pi-search-minus" className="toolbar-btn" onClick={handleZoomOut} rounded text severity="secondary" tooltip="Zoom Out" />
            <Button icon="pi pi-arrows-alt" className="toolbar-btn" onClick={handleFitScreen} rounded text severity="secondary" tooltip="Fit Screen" />
            <div className="w-1px h-2rem bg-300 mx-1"></div>
            <Button icon="pi pi-print" className="toolbar-btn" onClick={handlePrint} rounded text severity="secondary" tooltip="Print" />
            <Button icon="pi pi-download" className="toolbar-btn" onClick={handleDownload} rounded text severity="secondary" tooltip="Download" />
            <div className="w-1px h-2rem bg-300 mx-1"></div>
            <Button 
                icon={`pi ${showInfo ? 'pi-info-circle' : 'pi-info'}`} 
                className={`toolbar-btn ${showInfo ? 'text-primary surface-100' : ''}`} 
                onClick={toggleInfo} 
                rounded 
                text 
                severity="secondary" 
                tooltip="Image Details" 
            />
          </div>
        </div>

        {/* Image Canvas */}
        <div className="flex-1 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full flex align-items-center justify-content-center p-4 surface-900 z-0">
                <div className="relative overflow-hidden w-full h-full flex align-items-center justify-content-center">
                    <img 
                        ref={imageRef}
                        src={activeImage.src} 
                        alt={activeImage.alt}
                        className="transition-transform transition-duration-300 ease-out max-w-full max-h-full shadow-4"
                        style={{ transform: `scale(${zoom})`, objectFit: 'contain' }}
                    />
                </div>
            </div>
        </div>
      </div>

      {/* Right Sidebar - Metadata */}
      {showInfo && (
        <div className="w-20rem surface-ground border-left-1 border-300 flex flex-column flex-shrink-0 transition-all transition-duration-300">
            <div className="p-4 border-bottom-1 border-300 surface-card">
                <div className="flex justify-content-between align-items-center mb-3">
                    <div>
                        <h3 className="font-bold text-800 m-0">Metadata</h3>
                        <p className="text-xs text-500 m-0 mt-1">File information</p>
                    </div>
                    <Button icon="pi pi-times" onClick={() => setShowInfo(false)} rounded text severity="secondary" size="small" aria-label="Close" />
                </div>
                <span className="p-input-icon-left w-full">
                    <i className="pi pi-search text-400" />
                    <InputText 
                        value={metaFilter} 
                        onChange={(e) => setMetaFilter(e.target.value)} 
                        placeholder="Filter properties..." 
                        className="w-full p-inputtext-sm" 
                    />
                </span>
            </div>
            <div className="overflow-y-auto flex-1 custom-scrollbar">
                <DataTable 
                    value={activeImage.metadata} 
                    stripedRows 
                    size="small" 
                    className="text-sm border-none"
                    globalFilter={metaFilter}
                    globalFilterFields={['property', 'value']}
                    emptyMessage="No metadata found."
                >
                    <Column field="property" header="Property" className="font-semibold text-600" style={{ width: '40%' }}></Column>
                    <Column field="value" header="Value"></Column>
                </DataTable>
            </div>
        </div>
      )}
    </div>

    {/* Upload Dialog */}
    <Dialog header="Upload Images" visible={showUpload} style={{ width: '50vw' }} onHide={() => setShowUpload(false)}>
        <p className="mb-4 text-600">Select images to add to the gallery. (Mock upload)</p>
        <ImageUploader onUpload={onUploadComplete} multiple={true} />
    </Dialog>
    </>
  );
};

export default Gallery;
