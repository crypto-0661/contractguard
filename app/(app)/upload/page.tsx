/**
 * ContractGuard - 上传合同页面
 * 功能：文件上传、进度追踪、自动跳转到审阅结果
 */

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import ContractUploader from '../../components/ContractUploader';

export default function UploadPage() {
  const router = useRouter();
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUploadComplete = (contractId: string) => {
    setUploading(false);
    // 跳转到审阅结果页
    router.push(`/review/${contractId}`);
  };

  const handleUploadError = (message: string) => {
    setUploading(false);
    setError(message);
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="text-center mb-10">
        <h1 className="text-2xl sm:text-3xl font-extrabold text-gray-900">
          Upload Your Contract
        </h1>
        <p className="mt-2 text-gray-500 max-w-xl mx-auto">
          Drag and drop your contract file below. We support PDF, DOCX, and TXT files up to 20MB.
          Your document will be encrypted and analyzed by our AI.
        </p>
      </div>

      {/* Upload Component */}
      <ContractUploader
        onUploadComplete={handleUploadComplete}
        onUploadError={handleUploadError}
        onUploadStart={() => {
          setUploading(true);
          setError(null);
        }}
      />

      {/* Error Display */}
      {error && (
        <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div>
              <p className="text-sm font-medium text-red-800">Upload Failed</p>
              <p className="text-sm text-red-600 mt-1">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto flex-shrink-0 text-red-400 hover:text-red-600"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Upload Tips */}
      {!uploading && !error && (
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="text-center p-6 bg-white rounded-xl border border-gray-100">
            <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Secure & Encrypted</h3>
            <p className="text-xs text-gray-500">AES-256 encryption at rest. TLS 1.3 in transit. Your data stays private.</p>
          </div>
          <div className="text-center p-6 bg-white rounded-xl border border-gray-100">
            <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">Fast Analysis</h3>
            <p className="text-xs text-gray-500">Most contracts analyzed in under 5 minutes. You&apos;ll get an email when done.</p>
          </div>
          <div className="text-center p-6 bg-white rounded-xl border border-gray-100">
            <div className="w-10 h-10 bg-brand-100 rounded-lg flex items-center justify-center mx-auto mb-3">
              <svg className="w-5 h-5 text-brand-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-gray-900 mb-1">No Legal Training Needed</h3>
            <p className="text-xs text-gray-500">Plain-English results. Know exactly what to ask for in negotiations.</p>
          </div>
        </div>
      )}
    </div>
  );
}
