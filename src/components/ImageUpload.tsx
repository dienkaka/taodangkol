import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ImageUploadProps {
  onUpload: (file: File, base64: string) => void;
  preview: string | null;
}

export function ImageUpload({ onUpload, preview }: ImageUploadProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpload(file, reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, [onUpload]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false,
  } as any);

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative group cursor-pointer overflow-hidden rounded-2xl border-2 border-dashed transition-all duration-300",
        isDragActive ? "border-primary bg-primary/5" : "border-muted-foreground/20 hover:border-primary/50",
        preview ? "aspect-[3/4]" : "aspect-video flex items-center justify-center"
      )}
    >
      <input {...getInputProps()} />
      
      {preview ? (
        <>
          <img
            src={preview}
            alt="Preview"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-white">
              <Upload className="h-8 w-8" />
              <span className="text-sm font-medium">Thay đổi ảnh gốc</span>
            </div>
          </div>
        </>
      ) : (
        <div className="flex flex-col items-center gap-4 p-8 text-center">
          <div className="rounded-full bg-primary/10 p-4">
            <ImageIcon className="h-10 w-10 text-primary" />
          </div>
          <div>
            <p className="text-xl font-semibold">Tải lên ảnh người mẫu</p>
            <p className="text-sm text-muted-foreground mt-1">
              Kéo thả hoặc click để chọn ảnh (JPG, PNG)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
