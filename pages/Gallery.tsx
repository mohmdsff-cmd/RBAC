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
    // Create new image objects from uploaded files
    const newImages = files.map((file, idx) => {
        // In a real app, this URL would come from the server
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
    // Select the first new image
    setCurrentIndex(images.length);
  };

  return (
    <>
    <div className="flex h-[calc(100vh-9rem)] border rounded-lg shadow-lg overflow-hidden bg-white">
      {/* Left Sidebar - Thumbnails & Navigation (Single Column) */}
      <div className="w-40 bg-slate-50 border-r border-slate-200 flex flex-col shrink-0">
        
        {/* Navigation Arrows Area */}
        <div className="p-3 border-b border-slate-200 bg-white flex items-center justify-between shadow-sm z-10">
            <Button icon="pi pi-arrow-left" onClick={handlePrev} rounded text severity="secondary" aria-label="Previous" size="small" />
            <span className="font-bold text-slate-600 text-sm">{currentIndex + 1} / {images.length}</span>
            <Button icon="pi pi-arrow-right" onClick={handleNext} rounded text severity="secondary" aria-label="Next" size="small" />
        </div>

        {/* Thumbnails List */}
        <div className="flex-1 overflow-y-auto p-3 custom-scrollbar">
          <div className="flex flex-col gap-3">
            {images.map((img, index) => (
              <div 
                key={img.id}
                onClick={() => selectImage(index)}
                className={`cursor-pointer rounded-md overflow-hidden border-2 transition-all hover:shadow-md aspect-square ${
                  index === currentIndex 
                    ? 'border-cyan-500 shadow-lg ring-2 ring-cyan-100' 
                    : 'border-transparent opacity-70 hover:opacity-100 hover:border-slate-300'
                }`}
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
      <div className="flex-1 flex flex-col relative bg-slate-900 overflow-hidden min-w-0">
        
        {/* Top Toolbar */}
        <div className="h-16 bg-white/90 backdrop-blur-sm border-b flex items-center justify-between px-6 shadow-sm z-20 shrink-0">
          <div className="text-sm text-slate-500 font-medium truncate max-w-[200px]">
            {activeImage.title}
          </div>
          
          <div className="flex gap-2 items-center">
            <Tooltip target=".toolbar-btn" />
            
            <Button icon="pi pi-plus" className="toolbar-btn" onClick={() => setShowUpload(true)} rounded outlined severity="info" tooltip="Upload New" aria-label="Upload" />
            <div className="w-px h-6 bg-slate-300 mx-1"></div>
            
            <Button icon="pi pi-search-plus" className="toolbar-btn" onClick={handleZoomIn} rounded text severity="secondary" tooltip="Zoom In" />
            <Button icon="pi pi-search-minus" className="toolbar-btn" onClick={handleZoomOut} rounded text severity="secondary" tooltip="Zoom Out" />
            <Button icon="pi pi-arrows-alt" className="toolbar-btn" onClick={handleFitScreen} rounded text severity="secondary" tooltip="Fit Screen" />
            <div className="w-px h-6 bg-slate-300 mx-1"></div>
            <Button icon="pi pi-print" className="toolbar-btn" onClick={handlePrint} rounded text severity="secondary" tooltip="Print" />
            <Button icon="pi pi-download" className="toolbar-btn" onClick={handleDownload} rounded text severity="secondary" tooltip="Download" />
            <div className="w-px h-6 bg-slate-300 mx-1"></div>
            <Button 
                icon={`pi ${showInfo ? 'pi-info-circle' : 'pi-info'}`} 
                className={`toolbar-btn ${showInfo ? 'text-cyan-600 bg-cyan-50' : ''}`} 
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
            <div className="absolute inset-0 flex items-center justify-center p-4 bg-slate-900 z-0">
                <div className="relative overflow-hidden w-full h-full flex items-center justify-center">
                    <img 
                        ref={imageRef}
                        src={activeImage.src} 
                        alt={activeImage.alt}
                        className="transition-transform duration-300 ease-out max-w-full max-h-full object-contain shadow-2xl"
                        style={{ transform: `scale(${zoom})` }}
                    />
                </div>
            </div>
        </div>
      </div>

      {/* Right Sidebar - Metadata */}
      {showInfo && (
        <div className="w-80 bg-slate-50 border-l border-slate-200 flex flex-col shrink-0 transition-all duration-300">
            <div className="p-4 border-b border-slate-200 bg-white">
                <div className="flex justify-between items-center mb-3">
                    <div>
                        <h3 className="font-bold text-slate-800">Metadata</h3>
                        <p className="text-xs text-slate-500">File information</p>
                    </div>
                    <Button icon="pi pi-times" onClick={() => setShowInfo(false)} rounded text severity="secondary" size="small" aria-label="Close" />
                </div>
                <span className="p-input-icon-left w-full">
                    <i className="pi pi-search text-slate-400" />
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
                    <Column field="property" header="Property" className="font-semibold text-slate-600" style={{ width: '40%' }}></Column>
                    <Column field="value" header="Value"></Column>
                </DataTable>
            </div>
        </div>
      )}
    </div>

    {/* Upload Dialog */}
    <Dialog header="Upload Images" visible={showUpload} style={{ width: '50vw' }} onHide={() => setShowUpload(false)}>
        <p className="mb-4 text-slate-600">Select images to add to the gallery. (Mock upload)</p>
        <ImageUploader onUpload={onUploadComplete} multiple={true} />
    </Dialog>
    </>
  );
};

export default Gallery;