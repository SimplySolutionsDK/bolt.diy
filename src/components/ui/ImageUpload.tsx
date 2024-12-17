import React from 'react';
import { Upload, X } from 'lucide-react';
import { cn } from '@/utils/cn';
import { compressImage } from '@/utils/imageUtils';

interface ImageUploadProps {
  onChange: (file: File | null) => void;
  currentImageUrl?: string;
  className?: string;
}

export default function ImageUpload({ onChange, currentImageUrl, className }: ImageUploadProps) {
  const [previewUrl, setPreviewUrl] = React.useState<string | null>(currentImageUrl || null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        // Compress image before preview and upload
        const compressedFile = await compressImage(file);
        
        // Show preview of compressed image
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(compressedFile);
        
        // Pass compressed file to parent
        onChange(compressedFile);
      } catch (error) {
        console.error('Failed to compress image:', error);
        // Fallback to original file if compression fails
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreviewUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
        onChange(file);
      }
    }
  };

  const handleRemove = () => {
    setPreviewUrl(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={cn("relative group", className)}>
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />
      
      {previewUrl ? (
        <div className="relative">
          <img
            src={previewUrl}
            alt="Profile"
            className="w-20 h-20 rounded-full object-cover"
          />
          <button
            onClick={handleRemove}
            className={cn(
              "absolute -top-2 -right-2 p-1 rounded-full",
              "bg-red-100 text-red-600",
              "hover:bg-red-200 transition-colors",
              "opacity-0 group-hover:opacity-100"
            )}
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "w-20 h-20 rounded-full",
            "flex flex-col items-center justify-center gap-1",
            "bg-gray-100 dark:bg-gray-800",
            "hover:bg-gray-200 dark:hover:bg-gray-700",
            "transition-colors"
          )}
        >
          <Upload className="w-6 h-6 text-gray-400" />
          <span className="text-xs text-gray-500">Upload</span>
        </button>
      )}
    </div>
  );
}