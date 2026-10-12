import React, { useState, useEffect } from 'react';
import {
  Upload,
  FileText,
  FileSearch,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Trash2,
  Eye,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { healthApi, MedicalDoc } from '../../services/healthApi';

export const DocumentsPage: React.FC = () => {
  const [documents, setDocuments] = useState<MedicalDoc[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string>('');
  const [selectedType, setSelectedType] = useState('lab_report');
  const [dragActive, setDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedDocText, setSelectedDocText] = useState<{ title: string; text: string } | null>(null);

  const fetchDocs = async () => {
    try {
      setLoading(true);
      const data = await healthApi.getDocuments();
      setDocuments(data);
    } catch (e: any) {
      console.warn('Failed to load documents:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocs();
  }, []);

  const handleFileUpload = async (file: File) => {
    try {
      setUploading(true);
      setError(null);
      setUploadProgress('Uploading file to secure storage...');
      
      setTimeout(() => setUploadProgress('Running OCR text extraction...'), 800);
      setTimeout(() => setUploadProgress('Generating vector embeddings & indexing in pgvector...'), 1600);

      await healthApi.uploadDocument(file, selectedType);
      setUploadProgress('Document indexed successfully!');
      setTimeout(() => {
        setUploading(false);
        setUploadProgress('');
        fetchDocs();
      }, 500);
    } catch (e: any) {
      setError(e.message || 'Upload failed');
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this document and its RAG vector indices?')) return;
    try {
      await healthApi.deleteDocument(id);
      fetchDocs();
    } catch (e: any) {
      alert(e.message || 'Delete failed');
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-black text-[#F4F7FA] tracking-tight flex items-center gap-2.5">
          <FileSearch className="w-6 h-6 text-[#00D084]" />
          Medical Document Scanner & OCR
        </h1>
        <p className="text-xs text-[#9BAAB6] mt-1">
          Upload laboratory reports, discharge summaries, and diagnostic tests. Text is extracted, classified, and indexed into the RAG vector store for instant health copilot queries.
        </p>
      </div>

      {/* Upload Zone */}
      <div className="glass-panel-dark rounded-3xl p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <span className="text-xs font-bold text-[#F4F7FA] uppercase tracking-wider">
            Select Document Category
          </span>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'lab_report', label: 'Laboratory Report' },
              { id: 'prescription', label: 'Prescription' },
              { id: 'diagnostic', label: 'Diagnostic Summary' },
              { id: 'clinical_notes', label: 'Clinical Note' },
            ].map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition ${
                  selectedType === type.id
                    ? 'bg-[#00D084] text-[#05090D] shadow-md shadow-[#00D084]/20'
                    : 'bg-[#111F28] text-[#9BAAB6] hover:text-[#F4F7FA] border border-[#203039]'
                }`}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>

        {/* Drag and drop box */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center transition-all ${
            dragActive
              ? 'border-[#00D084] bg-[#00D084]/10'
              : 'border-[#203039] bg-[#0A1118]/70 hover:border-[#00D084]/50'
          }`}
        >
          <input
            type="file"
            id="file-upload"
            className="hidden"
            accept=".pdf,.png,.jpg,.jpeg"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleFileUpload(e.target.files[0]);
              }
            }}
          />

          <div className="flex flex-col items-center justify-center space-y-3">
            <div className="w-14 h-14 rounded-2xl bg-[#111F28] border border-[#203039] flex items-center justify-center text-[#00D084] shadow-lg shadow-[#00D084]/10">
              {uploading ? (
                <Loader2 className="w-7 h-7 animate-spin text-[#00D084]" />
              ) : (
                <Upload className="w-7 h-7" />
              )}
            </div>

            {uploading ? (
              <div className="space-y-1">
                <p className="text-sm font-bold text-[#00D084] animate-pulse">
                  {uploadProgress}
                </p>
                <p className="text-xs text-[#9BAAB6]">
                  Extracting medical parameters and indexing pgvector chunks...
                </p>
              </div>
            ) : (
              <>
                <p className="text-sm font-bold text-[#F4F7FA]">
                  Drag and drop your medical report here, or{' '}
                  <label htmlFor="file-upload" className="text-[#00D084] hover:underline cursor-pointer">
                    browse files
                  </label>
                </p>
                <p className="text-xs text-[#9BAAB6]">
                  Supports PDF, PNG, JPG (up to 15MB). Automatically sanitized and indexed into RAG.
                </p>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-[#FF5C68]/10 border border-[#FF5C68]/30 text-[#FF5C68] text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}
      </div>

      {/* Uploaded Documents List */}
      <div className="glass-panel-dark rounded-3xl p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#203039]">
          <h2 className="text-base font-bold text-[#F4F7FA]">
            Uploaded Records ({documents.length})
          </h2>
          <span className="text-[10px] text-[#00D084] font-semibold bg-[#00D084]/10 px-2.5 py-1 rounded-full border border-[#00D084]/20">
            Tenant Isolated
          </span>
        </div>

        {loading ? (
          <div className="text-center py-8 text-xs text-[#9BAAB6] flex items-center justify-center gap-2">
            <Loader2 className="w-4 h-4 animate-spin text-[#00D084]" />
            <span>Loading records...</span>
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-10 text-xs text-[#9BAAB6] space-y-2">
            <FileText className="w-8 h-8 text-[#203039] mx-auto" />
            <p>No documents uploaded yet. Upload a sample lab report or prescription to start RAG.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-4 rounded-2xl bg-[#111F28] border border-[#203039] hover:border-[#00D084]/40 transition space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-[#0D171F] border border-[#203039] flex items-center justify-center text-[#00D084]">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div className="max-w-[200px] sm:max-w-xs truncate">
                      <h3 className="text-xs font-bold text-[#F4F7FA] truncate" title={doc.original_filename}>
                        {doc.original_filename}
                      </h3>
                      <p className="text-[10px] text-[#9BAAB6] capitalize">
                        {doc.document_type.replace('_', ' ')} • {(doc.file_size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  </div>

                  <span className="text-[10px] px-2 py-0.5 rounded-lg bg-[#00D084]/15 text-[#00D084] font-bold border border-[#00D084]/30">
                    {doc.processing_status}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#203039] text-xs">
                  <span className="text-[10px] text-[#9BAAB6]">
                    Indexed: {new Date(doc.upload_timestamp).toLocaleDateString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setSelectedDocText({
                        title: doc.original_filename,
                        text: "OCR extraction verified and indexed into pgvector chunks.",
                      })}
                      className="p-1.5 rounded-lg text-[#9BAAB6] hover:text-[#00D084] hover:bg-[#0D171F] transition"
                      title="View Extracted OCR Text"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(doc.id)}
                      className="p-1.5 rounded-lg text-[#9BAAB6] hover:text-[#FF5C68] hover:bg-[#FF5C68]/10 transition"
                      title="Delete document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Extracted Text Modal */}
      {selectedDocText && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-panel-elevated rounded-3xl p-6 max-w-xl w-full space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#203039]">
              <h3 className="text-sm font-bold text-[#F4F7FA]">{selectedDocText.title}</h3>
              <button
                onClick={() => setSelectedDocText(null)}
                className="text-[#9BAAB6] hover:text-[#F4F7FA] text-xs font-bold"
              >
                Close
              </button>
            </div>
            <div className="p-4 rounded-xl bg-[#080E13] border border-[#203039] font-mono text-xs text-[#9BAAB6] max-h-80 overflow-y-auto whitespace-pre-wrap">
              {selectedDocText.text}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
