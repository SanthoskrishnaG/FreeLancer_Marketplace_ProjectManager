import React, { useState, useRef } from 'react';
import { UploadCloud, X, AlertCircle, Loader2, FileText, Image as ImageIcon } from 'lucide-react';
import { uploadFileApi } from '../api/file.api.js';
import { FileItem } from '../types/index.js';

interface FileUploadComponentProps {
  onFilesUploaded: (files: FileItem[]) => void;
  entityType?: 'PORTFOLIO' | 'PROJECT' | 'MILESTONE' | 'CHAT' | 'DISPUTE' | 'AVATAR';
  entityId?: string;
  maxFiles?: number;
  initialFiles?: FileItem[];
  allowMultiple?: boolean;
}

export const FileUploadComponent: React.FC<FileUploadComponentProps> = ({
  onFilesUploaded,
  entityType,
  entityId,
  maxFiles = 5,
  initialFiles = [],
  allowMultiple = true,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploadedFiles, setUploadedFiles] = useState<FileItem[]>(initialFiles);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [error, setError] = useState<string | null>(null);

  const handleFileSelection = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (uploadedFiles.length + files.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    const newlyUploaded: FileItem[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const uploaded = await uploadFileApi(file, {
          entityType,
          entityId,
          onProgress: (percent) => {
            setUploadProgress(Math.round(((i + percent / 100) / files.length) * 100));
          },
        });
        newlyUploaded.push(uploaded);
      }

      const combined = [...uploadedFiles, ...newlyUploaded];
      setUploadedFiles(combined);
      onFilesUploaded(combined);
    } catch (err: any) {
      setError(err.response?.data?.message || 'File upload failed');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemoveFile = (fileId: string) => {
    const updated = uploadedFiles.filter((f) => f.id !== fileId);
    setUploadedFiles(updated);
    onFilesUploaded(updated);
  };

  return (
    <div className="space-y-3 w-full">
      {/* Drag & Drop Upload Zone */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="p-5 border-2 border-dashed border-slate-800 hover:border-brand-500/50 bg-slate-950/60 hover:bg-slate-950 rounded-2xl cursor-pointer transition-all text-center group flex flex-col items-center justify-center space-y-2"
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileSelection}
          multiple={allowMultiple}
          className="hidden"
        />

        <div className="p-3 rounded-2xl bg-slate-900 group-hover:bg-brand-500/10 text-slate-400 group-hover:text-brand-400 border border-slate-800 transition-colors">
          <UploadCloud className="w-5 h-5" />
        </div>

        <div>
          <p className="text-xs font-semibold text-slate-200 group-hover:text-brand-400 transition-colors">
            Click to upload or drag and drop
          </p>
          <p className="text-[11px] text-slate-500 mt-0.5">
            PNG, JPG, PDF, DOCX, ZIP (Up to 15MB each)
          </p>
        </div>
      </div>

      {/* Upload Progress Bar */}
      {isUploading && (
        <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-brand-400" /> Uploading files...
            </span>
            <span className="font-bold text-brand-400">{uploadProgress}%</span>
          </div>
          <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden">
            <div
              className="bg-gradient-to-r from-brand-400 to-emerald-400 h-full rounded-full transition-all duration-200"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Error Notice */}
      {error && (
        <div className="flex items-center gap-2 p-3 text-xs text-rose-300 bg-rose-500/10 border border-rose-500/20 rounded-xl">
          <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <div className="space-y-2">
          {uploadedFiles.map((file) => {
            const isImage = file.mimeType.startsWith('image/');
            return (
              <div
                key={file.id}
                className="flex items-center justify-between p-2.5 bg-slate-950 rounded-xl border border-slate-800 text-xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="p-1.5 rounded-lg bg-slate-900 text-brand-400 border border-slate-800 shrink-0">
                    {isImage ? <ImageIcon className="w-4 h-4" /> : <FileText className="w-4 h-4" />}
                  </div>
                  <div className="truncate">
                    <p className="font-semibold text-slate-200 truncate">{file.originalName}</p>
                    <p className="text-[10px] text-slate-500">
                      {(file.size / 1024).toFixed(1)} KB •{' '}
                      <span className="text-emerald-400">Ready</span>
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleRemoveFile(file.id)}
                  className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
