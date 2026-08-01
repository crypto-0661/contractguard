/**
 * ContractGuard - 合同上传组件
 * 功能：拖拽上传区域、文件类型验证、进度条、大小限制
 */

'use client';

import { useState, useCallback, useRef } from 'react';

interface ContractUploaderProps {
  onUploadComplete: (contractId: string) => void;
  onUploadError: (message: string) => void;
  onUploadStart: () => void;
  maxFileSize?: number; // MB
  allowedTypes?: string[];
}

const DEFAULT_MAX_SIZE_MB = 20;
const DEFAULT_ALLOWED_TYPES = [
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain',
];
const ALLOWED_EXTENSIONS = ['.pdf', '.docx', '.txt'];

export default function ContractUploader({
  onUploadComplete,
  onUploadError,
  onUploadStart,
  maxFileSize = DEFAULT_MAX_SIZE_MB,
  allowedTypes = DEFAULT_ALLOWED_TYPES,
}: ContractUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState<'idle' | 'validating' | 'uploading' | 'processing' | 'done' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const maxFileSizeBytes = maxFileSize * 1024 * 1024;

  /** 验证文件 */
  const validateFile = useCallback(
    (file: File): string | null => {
      // 检查文件类型
      const isAllowedMime = allowedTypes.includes(file.type);
      const isAllowedExt = ALLOWED_EXTENSIONS.some((ext) =>
        file.name.toLowerCase().endsWith(ext)
      );
      if (!isAllowedMime && !isAllowedExt) {
        return `Unsupported file type: "${file.name}". Please upload a PDF, DOCX, or TXT file.`;
      }

      // 检查文件大小
      if (file.size > maxFileSizeBytes) {
        const sizeMB = (file.size / (1024 * 1024)).toFixed(1);
        return `File size (${sizeMB}MB) exceeds the ${maxFileSize}MB limit. Please upload a smaller file.`;
      }

      // 检查文件是否为空
      if (file.size === 0) {
        return 'The file appears to be empty. Please select a valid contract file.';
      }

      return null;
    },
    [allowedTypes, maxFileSizeBytes, maxFileSize]
  );

  /** 处理文件上传 */
  const handleFile = useCallback(
    async (selectedFile: File) => {
      setStatus('validating');

      const error = validateFile(selectedFile);
      if (error) {
        setStatus('error');
        onUploadError(error);
        return;
      }

      setFile(selectedFile);
      setStatus('uploading');
      setProgress(0);
      onUploadStart();

      try {
        // 构建 FormData
        const formData = new FormData();
        formData.append('file', selectedFile);

        // 模拟进度更新（实际使用 XMLHttpRequest 追踪进度）
        const xhr = new XMLHttpRequest();

        const uploadPromise = new Promise<{ contractId: string }>((resolve, reject) => {
          xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable) {
              const percent = Math.round((e.loaded / e.total) * 100);
              setProgress(percent);
              // 文件上传完成但服务器仍在 AI 分析 → 切换到"处理中"状态
              if (percent >= 100) {
                setStatus('processing');
              }
            }
          });

          xhr.addEventListener('load', () => {
            if (xhr.status >= 200 && xhr.status < 300) {
              try {
                const response = JSON.parse(xhr.responseText);
                resolve(response);
              } catch {
                reject(new Error('Invalid server response'));
              }
            } else {
              let errorMsg = 'Upload failed';
              try {
                const err = JSON.parse(xhr.responseText);
                errorMsg = err.error || errorMsg;
              } catch {}
              reject(new Error(errorMsg));
            }
          });

          xhr.addEventListener('error', () => {
            reject(new Error('Network error. Please check your connection and try again.'));
          });

          xhr.addEventListener('abort', () => {
            reject(new Error('Upload aborted'));
          });
        });

        xhr.open('POST', '/api/upload');
        xhr.send(formData);

        const result = await uploadPromise;
        setStatus('done');
        setProgress(100);
        onUploadComplete(result.contractId);
      } catch (err) {
        setStatus('error');
        const message = err instanceof Error ? err.message : 'Upload failed';
        onUploadError(message);
      }
    },
    [validateFile, onUploadComplete, onUploadError, onUploadStart]
  );

  /** 拖拽事件 */
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const droppedFile = e.dataTransfer.files[0];
      if (droppedFile) {
        handleFile(droppedFile);
      }
    },
    [handleFile]
  );

  /** 文件选择 */
  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0];
      if (selectedFile) {
        handleFile(selectedFile);
      }
    },
    [handleFile]
  );

  /** 格式化文件大小 */
  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="w-full">
      {/* 上传区域 */}
      {status !== 'uploading' && status !== 'processing' && (
        <div
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`
            relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer
            transition-all duration-200
            ${
              isDragging
                ? 'border-brand-500 bg-brand-50 scale-[1.01]'
                : 'border-gray-300 bg-white hover:border-brand-400 hover:bg-gray-50'
            }
          `}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,.docx,.txt"
            onChange={handleFileChange}
            className="hidden"
          />

          {/* 上传图标 */}
          <div className="w-16 h-16 bg-brand-100 rounded-2xl flex items-center justify-center mx-auto mb-5">
            <svg
              className="w-8 h-8 text-brand-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
              />
            </svg>
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {isDragging ? 'Drop your contract here' : 'Drag & drop your contract here'}
          </h3>
          <p className="text-sm text-gray-500 mb-3">
            or <span className="text-brand-600 font-medium">browse files</span>
          </p>
          <p className="text-xs text-gray-400">
            Supported formats: PDF, DOCX, TXT &bull; Max size: {maxFileSize}MB
          </p>
        </div>
      )}

      {/* 上传进度 */}
      {(status === 'uploading' || status === 'processing') && (
        <div className="bg-white border border-gray-200 rounded-2xl p-8">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 bg-brand-100 rounded-xl flex items-center justify-center flex-shrink-0">
              <svg
                className="w-6 h-6 text-brand-600"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-gray-900 truncate">
                {file?.name || 'Uploading contract...'}
              </p>
              <p className="text-xs text-gray-500">
                {file && formatSize(file.size)} &bull; {status === 'uploading' ? 'Uploading...' : 'Processing...'}
              </p>
            </div>
            <span className="text-sm font-medium text-brand-600">{progress}%</span>
          </div>

          {/* Progress Bar */}
          <div className="w-full bg-gray-100 rounded-full h-2.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-brand-500 to-brand-600 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          {status === 'processing' && (
            <div className="text-center mt-4">
              <div className="flex items-center justify-center gap-2 text-sm text-brand-600 font-medium animate-pulse">
                <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                AI 正在分析你的合同
              </div>
              <p className="text-xs text-gray-400 mt-1">
                通常需要 30-60 秒，请稍候…
              </p>
            </div>
          )}
        </div>
      )}

      {/* 完成状态 */}
      {status === 'done' && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-8 text-center animate-fade-in">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-green-900 mb-1">Upload Complete!</h3>
          <p className="text-sm text-green-700">Redirecting to your review report...</p>
        </div>
      )}
    </div>
  );
}
