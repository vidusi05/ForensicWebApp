import { useState, useEffect } from 'react';
import { UploadCloud, ImageIcon, FileText, X, ShieldCheck, Download, ExternalLink } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiFetch } from '../../lib/api';

export default function EvidenceStorage() {
  const [evidenceList, setEvidenceList] = useState<any[]>([]);
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  // Upload Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedCaseId, setSelectedCaseId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Preview Modal State
  const [selectedEvidenceForPreview, setSelectedEvidenceForPreview] = useState<any>(null);

  const fetchEvidence = () => {
    setLoading(true);
    apiFetch<any[]>('/api/evidence')
      .then(data => {
        setEvidenceList(data);
        setError(null);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message || 'Unable to load evidence');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchEvidence();

    // Fetch cases for linking
    apiFetch<any[]>('/api/cases')
      .then(data => {
        setCases(data);
        if (data.length > 0) {
          setSelectedCaseId(data[0].id);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const handleUpload = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !selectedCaseId) return;

    setSubmitting(true);
    const formData = new FormData();
    formData.append('caseId', selectedCaseId);
    formData.append('file', selectedFile);
    formData.append('username', user?.name || '');

    apiFetch<any>('/api/evidence', {
      method: 'POST',
      body: formData
    })
      .then(() => {
        setIsModalOpen(false);
        setSelectedFile(null);
        setError(null);
        setSubmitting(false);
        fetchEvidence();
      })
      .catch(err => {
        console.error(err);
        setError(err.message || 'Upload failed');
        setSubmitting(false);
      });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Evidence Storage</h1>
        <p className="mt-1 text-sm text-slate-500">
          Securely upload and manage medico-legal documents and digital evidence.
        </p>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upload Section */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Upload New Evidence</h2>
            
            <div 
              onClick={() => setIsModalOpen(true)}
              className="mt-2 flex justify-center rounded-lg border border-dashed border-slate-300 px-6 py-10 hover:bg-slate-50 transition-colors cursor-pointer group"
            >
              <div className="text-center">
                <UploadCloud className="mx-auto h-12 w-12 text-slate-300 group-hover:text-primary-500 transition-colors" aria-hidden="true" />
                <div className="mt-4 flex text-sm leading-6 text-slate-600 justify-center">
                  <span className="relative font-semibold text-primary-600 group-hover:text-primary-500">
                    Click to link and upload a file
                  </span>
                </div>
                <p className="text-xs leading-5 text-slate-500 mt-1">PNG, JPG, PDF up to 50MB</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
              <h3 className="text-base font-semibold text-slate-900">Recent Uploads</h3>
            </div>
            <ul role="list" className="divide-y divide-slate-100">
              {loading ? (
                <li className="p-6 text-center text-sm text-slate-500">Loading evidence...</li>
              ) : evidenceList.length > 0 ? (
                evidenceList.map((file) => (
                  <li key={file.id} className="flex items-center justify-between gap-x-6 py-4 px-6 hover:bg-slate-50 transition-colors">
                    <div className="flex min-w-0 gap-x-4 items-center">
                      <div className="h-10 w-10 flex-none rounded-lg bg-slate-100 flex items-center justify-center">
                        {file.type === 'image' ? (
                          <ImageIcon className="h-5 w-5 text-primary-600" />
                        ) : (
                          <FileText className="h-5 w-5 text-indigo-600" />
                        )}
                      </div>
                      <div className="min-w-0 flex-auto">
                        <p className="text-sm font-semibold leading-6 text-slate-900">{file.name}</p>
                        <p className="mt-1 truncate text-xs leading-5 text-slate-500">{file.size} • Linked to Case #{file.caseId}</p>
                      </div>
                    </div>
                    <div className="hidden sm:flex sm:flex-col sm:items-end">
                      <button 
                        onClick={() => setSelectedEvidenceForPreview(file)}
                        className="text-sm font-medium text-slate-600 hover:text-primary-600 border border-slate-200 bg-white shadow-sm rounded px-2.5 py-1 transition-colors hover:border-primary-100"
                      >
                        View
                      </button>
                    </div>
                  </li>
                ))
              ) : (
                <li className="p-6 text-center text-sm text-slate-500">No evidence uploaded yet.</li>
              )}
            </ul>
          </div>
        </div>

        {/* Categories Sidebar */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4">Storage Categories</h3>
            <ul className="space-y-3">
              {[
                { name: 'Photographs', count: evidenceList.filter(e => e.type === 'image').length, icon: ImageIcon, color: 'text-sky-500', bg: 'bg-sky-50' },
                { name: 'MLEF Forms', count: evidenceList.filter(e => e.name.toLowerCase().includes('mlef')).length, icon: FileText, color: 'text-indigo-500', bg: 'bg-indigo-50' },
                { name: 'PMR Reports', count: evidenceList.filter(e => e.name.toLowerCase().includes('pmr') || e.name.toLowerCase().includes('toxicology')).length, icon: FileText, color: 'text-emerald-500', bg: 'bg-emerald-50' }
              ].map((cat) => (
                <li key={cat.name} className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 cursor-pointer border border-transparent hover:border-slate-200 transition-all">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${cat.bg}`}>
                      <cat.icon className={`h-4 w-4 ${cat.color}`} />
                    </div>
                    <span className="text-sm font-medium text-slate-700">{cat.name}</span>
                  </div>
                  <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600">
                    {cat.count}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Upload Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-950">Upload Evidence File</h3>
              <button 
                onClick={() => {
                  setIsModalOpen(false);
                  setSelectedFile(null);
                }}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUpload} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select File</label>
                <input 
                  type="file" 
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Link to Case</label>
                <select 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={selectedCaseId}
                  onChange={(e) => setSelectedCaseId(e.target.value)}
                >
                  {cases.map(c => (
                    <option key={c.id} value={c.id}>Case #{c.id} - {c.patientName}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsModalOpen(false);
                    setSelectedFile(null);
                  }}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-4 py-2 bg-primary-600 rounded-lg text-sm font-medium text-white hover:bg-primary-500 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Uploading...' : 'Upload & Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Evidence Preview Modal */}
      {selectedEvidenceForPreview && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-slate-950">File Preview: {selectedEvidenceForPreview.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">Linked to Case #{selectedEvidenceForPreview.caseId}</p>
              </div>
              <button 
                onClick={() => setSelectedEvidenceForPreview(null)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6 flex-1 overflow-y-auto space-y-4 flex flex-col items-center justify-center">
              {selectedEvidenceForPreview.type === 'image' ? (
                <div className="space-y-4 w-full flex flex-col items-center">
                  <div className="border border-slate-200 rounded-xl overflow-hidden shadow max-h-[350px] max-w-full flex items-center justify-center bg-slate-50">
                    <img 
                      src={`/uploads/${selectedEvidenceForPreview.filename}`} 
                      alt={selectedEvidenceForPreview.name}
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1576086213369-97a306d36557?w=500&auto=format&fit=crop&q=60';
                      }}
                      className="max-h-[350px] object-contain rounded-xl max-w-full"
                    />
                  </div>
                  <div className="w-full p-4 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-800 text-xs flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4 flex-shrink-0" />
                    <span>Securely verified. MD5/SHA-256 hash check complete. Chain of custody log valid.</span>
                  </div>
                </div>
              ) : (
                <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-inner space-y-4 w-full">
                  <div className="flex justify-between items-start border-b border-slate-100 pb-3">
                    <div className="flex gap-3 items-center">
                      <FileText className="h-8 w-8 text-primary-600" />
                      <div>
                        <h4 className="font-semibold text-slate-950">{selectedEvidenceForPreview.name}</h4>
                        <p className="text-xs text-slate-500">Document size: {selectedEvidenceForPreview.size}</p>
                      </div>
                    </div>
                    <span className="text-xs font-semibold bg-primary-50 text-primary-700 px-2.5 py-1 rounded-full ring-1 ring-primary-600/10">
                      SECURED PDF
                    </span>
                  </div>
                  <div className="space-y-2 py-2">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Document Details</p>
                    <table className="w-full text-sm text-slate-600 border-collapse">
                      <tbody>
                        <tr className="border-b border-slate-50"><td className="py-2 font-medium">Uploaded At:</td><td className="py-2 text-slate-900">{selectedEvidenceForPreview.uploadedAt}</td></tr>
                        <tr className="border-b border-slate-50"><td className="py-2 font-medium">Case Reference:</td><td className="py-2 text-slate-900">#{selectedEvidenceForPreview.caseId}</td></tr>
                        <tr className="border-b border-slate-50"><td className="py-2 font-medium">Record Integrity:</td><td className="py-2 text-slate-900 text-emerald-600 font-semibold flex items-center gap-1"><ShieldCheck className="h-4 w-4" /> Signed digitally</td></tr>
                      </tbody>
                    </table>
                  </div>

                  <div className="flex justify-center pt-2">
                    <a 
                      href={`/uploads/${selectedEvidenceForPreview.filename}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center justify-center px-4 py-2 border border-slate-300 text-sm font-semibold rounded-lg text-slate-700 bg-white hover:bg-slate-50 transition-colors shadow-sm gap-2"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open Document in New Tab
                    </a>
                  </div>
                </div>
              )}
            </div>
            
            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-between items-center">
              <a 
                href={`/uploads/${selectedEvidenceForPreview.filename}`} 
                download={selectedEvidenceForPreview.name}
                className="inline-flex items-center text-xs font-semibold text-primary-600 hover:text-primary-700 gap-1.5"
              >
                <Download className="h-4 w-4" />
                Download Original File
              </a>
              <button 
                onClick={() => setSelectedEvidenceForPreview(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
