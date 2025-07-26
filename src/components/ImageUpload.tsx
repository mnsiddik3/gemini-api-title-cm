import { useState, useCallback } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
interface ImageUploadProps {
  onImagesSelect: (files: File[]) => void;
  selectedImages: File[];
}
export const ImageUpload = ({
  onImagesSelect,
  selectedImages
}: ImageUploadProps) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/') && file.size <= 60 * 1024 * 1024).slice(0, 100);
    if (imageFiles.length > 0) {
      onImagesSelect([...selectedImages, ...imageFiles].slice(0, 100));
    }
  }, [onImagesSelect, selectedImages]);
  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);
  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);
  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files ? Array.from(e.target.files) : [];
    const imageFiles = files.filter(file => file.type.startsWith('image/') && file.size <= 60 * 1024 * 1024).slice(0, 100);
    if (imageFiles.length > 0) {
      onImagesSelect([...selectedImages, ...imageFiles].slice(0, 100));
    }
  }, [onImagesSelect, selectedImages]);
  const removeImage = useCallback((index: number) => {
    const newImages = selectedImages.filter((_, i) => i !== index);
    onImagesSelect(newImages);
  }, [selectedImages, onImagesSelect]);
  return <Card className="p-4 sm:p-6 lg:p-8">
      <div className={`relative border-2 border-dashed rounded-lg p-6 sm:p-8 lg:p-12 text-center transition-all duration-300 ${isDragOver ? 'border-brand-primary bg-brand-primary/5 scale-105' : 'border-muted-foreground/25 hover:border-brand-primary/50'}`} onDrop={handleDrop} onDragOver={handleDragOver} onDragLeave={handleDragLeave}>
        {selectedImages.length > 0 ? <div className="space-y-4">
            <div className="text-center mb-4">
              <h3 className="text-lg font-semibold text-foreground">
                {selectedImages.length} Images Selected
              </h3>
              <p className="text-sm text-muted-foreground">
                {selectedImages.length >= 100 ? 'Maximum 100 images reached' : `You can add ${100 - selectedImages.length} more images`}
              </p>
            </div>
            
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4 max-h-80 sm:max-h-96 overflow-y-auto">
              {selectedImages.map((image, index) => <div key={`${image.name}-${image.size}-${index}`} className="relative group">
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 md:w-28 md:h-28 rounded-lg overflow-hidden shadow-lg">
                    <img src={URL.createObjectURL(image)} alt={`Selected ${index + 1}`} className="w-full h-full object-cover" />
                    <Button variant="destructive" size="icon" className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 opacity-0 group-hover:opacity-100 transition-opacity" onClick={() => removeImage(index)}>
                      <X className="w-2.5 h-2.5 sm:w-3 sm:h-3" />
                    </Button>
                  </div>
                  <div className="mt-1.5 sm:mt-2 space-y-0.5 sm:space-y-1">
                    <p className="text-xs text-muted-foreground truncate max-w-full" title={image.name}>
                      {image.name}
                    </p>
                    <div className="text-xs text-muted-foreground/70 space-y-0.5 hidden sm:block">
                      <div>Size: {(image.size / (1024 * 1024)).toFixed(2)} MB</div>
                      <div>Type: {image.type.split('/')[1].toUpperCase()}</div>
                      <div className="hidden md:block">Modified: {new Date(image.lastModified).toLocaleDateString()}</div>
                    </div>
                  </div>
                </div>)}
            </div>
            
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button variant="brandOutline" size="sm" onClick={() => document.getElementById('file-input')?.click()} disabled={selectedImages.length >= 100} className="w-full sm:w-auto">
                Add More Images
              </Button>
              <Button variant="outline" size="sm" onClick={() => onImagesSelect([])} className="w-full sm:w-auto">
                Clear All
              </Button>
            </div>
          </div> : <div className="space-y-4">
            <div className="w-12 h-12 sm:w-16 sm:h-16 mx-auto bg-gradient-primary rounded-full flex items-center justify-center animate-float">
              <Upload className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-semibold text-foreground">
                Upload Your Images
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground mt-2">Drag and drop or click to select up to 100 microstock images</p>
              <p className="text-xs text-muted-foreground mt-1">PNG, JPG, JPEG (Max 60MB each)</p>
            </div>
            <Button variant="brand" onClick={() => document.getElementById('file-input')?.click()} className="w-full sm:w-auto">
              <ImageIcon className="w-4 h-4 mr-2" />
              Select Images
            </Button>
          </div>}
        
        <input id="file-input" type="file" accept="image/*" multiple className="hidden" onChange={handleFileInput} />
      </div>
    </Card>;
};