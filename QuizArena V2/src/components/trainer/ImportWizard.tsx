'use client';

import React, { useState } from 'react';
import { Upload, FileSpreadsheet, FileText, CheckCircle2, AlertTriangle, X, ArrowRight, Loader2 } from 'lucide-react';
import { IImportPreviewSummary } from '@/types';
import { useToast } from '../ui/ToastNotification';

interface ImportWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (count: number) => void;
}

export const ImportWizard: React.FC<ImportWizardProps> = ({ isOpen, onClose, onImportSuccess }) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isParsing, setIsParsing] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [previewSummary, setPreviewSummary] = useState<IImportPreviewSummary | null>(null);
  const { showToast } = useToast();

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setPreviewSummary(null);
    }
  };

  const handleUploadAndPreview = async () => {
    if (!selectedFile) return;
    setIsParsing(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const res = await fetch('/api/v1/quizzes/import', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to parse file.');
      }

      setPreviewSummary(json.data);
      showToast(`Parsed ${json.data.totalParsed} question entries (${json.data.validCount} valid).`, 'info');
    } catch (err: any) {
      showToast(err.message || 'File parsing error', 'error');
    } finally {
      setIsParsing(false);
    }
  };

  const handleConfirmImport = async () => {
    if (!selectedFile || !previewSummary) return;
    setIsConfirming(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('confirm', 'true');

      const res = await fetch('/api/v1/quizzes/import', {
        method: 'POST',
        body: formData,
      });

      const json = await res.json();
      if (!res.ok || !json.success) {
        throw new Error(json.error?.message || 'Failed to commit import.');
      }

      const importedCount = json.data.importedCount;
      showToast(`Successfully imported ${importedCount} questions to Question Bank!`, 'success');
      onImportSuccess(importedCount);
      onClose();
    } catch (err: any) {
      showToast(err.message || 'Import confirmation failed', 'error');
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full p-6 space-y-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-slate-100 pb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Import Questions</h2>
            <p className="text-xs text-slate-500">Upload Excel (.xlsx, .xls) or Word (.docx) files</p>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-slate-600 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {!previewSummary ? (
          <div className="space-y-6">
            <div className="border-2 border-dashed border-slate-200 hover:border-blue-500 rounded-2xl p-8 text-center transition-colors bg-slate-50/50">
              <input
                type="file"
                id="file-upload"
                accept=".xlsx,.xls,.docx"
                onChange={handleFileChange}
                className="hidden"
              />
              <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                  <Upload className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    {selectedFile ? selectedFile.name : 'Click to upload or drag & drop'}
                  </p>
                  <p className="text-xs text-slate-400 mt-1">Supported formats: Excel (.xlsx, .xls) and Word (.docx)</p>
                </div>
              </label>
            </div>

            <div className="flex items-center justify-between text-xs text-slate-500 bg-blue-50/50 p-3 rounded-xl border border-blue-100">
              <span className="flex items-center space-x-2">
                <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
                <span>Excel Template</span>
              </span>
              <span className="flex items-center space-x-2">
                <FileText className="w-4 h-4 text-blue-600" />
                <span>Word Template</span>
              </span>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                onClick={handleUploadAndPreview}
                disabled={!selectedFile || isParsing}
                className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl transition flex items-center space-x-2 shadow-md shadow-blue-500/20"
              >
                {isParsing ? <Loader2 className="w-4 h-4 animate-spin" /> : <span>Parse & Preview</span>}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        ) : (
          /* Import Preview Breakdown Screen */
          <div className="space-y-5">
            <div className="grid grid-cols-3 gap-3">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
                <p className="text-xs text-slate-500 font-medium">Total Entries</p>
                <p className="text-xl font-bold text-slate-900">{previewSummary.totalParsed}</p>
              </div>
              <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200">
                <p className="text-xs text-emerald-700 font-medium">Valid Questions</p>
                <p className="text-xl font-bold text-emerald-900">{previewSummary.validCount}</p>
              </div>
              <div className="p-3.5 bg-amber-50 rounded-xl border border-amber-200">
                <p className="text-xs text-amber-700 font-medium">Validation Errors</p>
                <p className="text-xl font-bold text-amber-900">{previewSummary.errorCount}</p>
              </div>
            </div>

            <div className="max-h-60 overflow-y-auto space-y-2 border border-slate-200 rounded-xl p-3 bg-slate-50/50">
              {previewSummary.diagnostics.map((diag, i) => (
                <div
                  key={i}
                  className={`flex items-start justify-between p-2.5 rounded-lg border text-xs ${
                    diag.status === 'VALID'
                      ? 'bg-white border-slate-200/80 text-slate-800'
                      : 'bg-amber-50/90 border-amber-200 text-amber-950'
                  }`}
                >
                  <div className="flex items-start space-x-2 flex-1 pr-2">
                    {diag.status === 'VALID' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                    ) : (
                      <AlertTriangle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                    )}
                    <div>
                      <span className="font-semibold text-slate-900">Entry {diag.rowOrIndex}: </span>
                      <span>{diag.questionText}</span>
                      {diag.errorMessage && (
                        <p className="text-[11px] text-amber-700 font-medium mt-0.5">{diag.errorMessage}</p>
                      )}
                    </div>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      diag.status === 'VALID' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-200 text-amber-900'
                    }`}
                  >
                    {diag.status}
                  </span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                onClick={() => setPreviewSummary(null)}
                className="text-xs font-semibold text-blue-600 hover:text-blue-800"
              >
                ← Back to Upload
              </button>
              <div className="flex space-x-3">
                <button
                  onClick={onClose}
                  className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  onClick={handleConfirmImport}
                  disabled={previewSummary.validCount === 0 || isConfirming}
                  className="px-5 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 rounded-xl transition flex items-center space-x-2 shadow-md shadow-emerald-600/20"
                >
                  {isConfirming ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                  <span>Confirm & Import ({previewSummary.validCount})</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
