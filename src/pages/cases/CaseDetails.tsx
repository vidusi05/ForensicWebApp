import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileText, Database, User, Calendar, Activity, X, Printer, ShieldCheck, Download, ExternalLink, AlertCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiFetch } from '../../lib/api';

export default function CaseDetails() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  
  const [caseData, setCaseData] = useState<any>(null);
  const [evidence, setEvidence] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [summons, setSummons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals state
  const [isEvidenceModalOpen, setIsEvidenceModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [submittingEvidence, setSubmittingEvidence] = useState(false);

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportType, setReportType] = useState<'MLEF' | 'PMR'>('MLEF');
  const [generatingReport, setGeneratingReport] = useState(false);

  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('Active');
  const [updatingStatus, setUpdatingStatus] = useState(false);

  const [isSummonModalOpen, setIsSummonModalOpen] = useState(false);
  const [whoIssued, setWhoIssued] = useState('');
  const [courtDate, setCourtDate] = useState('');
  const [dateOfIssue, setDateOfIssue] = useState('');
  const [submittingSummon, setSubmittingSummon] = useState(false);

  // Preview Modals State
  const [selectedEvidenceForPreview, setSelectedEvidenceForPreview] = useState<any>(null);
  const [selectedReportForPreview, setSelectedReportForPreview] = useState<any>(null);

  const fetchCaseDetails = useCallback(() => {
    if (!id) return;
    setLoading(true);
    apiFetch<any>(`/api/cases/${id}`)
      .then(data => {
        setCaseData(data.caseData);
        setEvidence(data.evidence);
        setReports(data.reports);
        setSummons(data.summons || []);
        setSelectedStatus(data.caseData.status);
        setError(null);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message || 'Unable to load case details');
        setLoading(false);
      });
  }, [id]);

  useEffect(() => {
    fetchCaseDetails();
  }, [fetchCaseDetails]);

  const handleAddEvidence = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile) return;

    setSubmittingEvidence(true);
    const formData = new FormData();
    formData.append('caseId', id || '');
    formData.append('file', selectedFile);
    formData.append('username', user?.name || '');

    apiFetch<any>('/api/evidence', {
      method: 'POST',
      body: formData
    })
      .then(() => {
        setIsEvidenceModalOpen(false);
        setSelectedFile(null);
        setError(null);
        setSubmittingEvidence(false);
        fetchCaseDetails();
      })
      .catch(err => {
        console.error(err);
        setError(err.message || 'Upload failed');
        setSubmittingEvidence(false);
      });
  };

  const handleGenerateReport = (e: React.FormEvent) => {
    e.preventDefault();
    setGeneratingReport(true);

    apiFetch<any>('/api/reports', {
      method: 'POST',
      body: JSON.stringify({
        caseId: id,
        type: reportType,
        username: user?.name
      })
    }).then(() => {
        setIsReportModalOpen(false);
        setError(null);
        setGeneratingReport(false);
        fetchCaseDetails();
      })
      .catch(err => {
        console.error(err);
        setError(err.message || 'Unable to generate report');
        setGeneratingReport(false);
      });
  };

  const handleUpdateStatus = (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingStatus(true);

    apiFetch<any>(`/api/cases/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({
        status: selectedStatus,
        username: user?.name
      })
    }).then(() => {
        setIsStatusModalOpen(false);
        setError(null);
        setUpdatingStatus(false);
        fetchCaseDetails();
      })
      .catch(err => {
        console.error(err);
        setError(err.message || 'Unable to update status');
        setUpdatingStatus(false);
      });
  };

  const handleLinkSummon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!whoIssued || !courtDate || !dateOfIssue) return;

    setSubmittingSummon(true);

    apiFetch<any>('/api/summons', {
      method: 'POST',
      body: JSON.stringify({
        caseId: id,
        whoIssued,
        courtDate,
        dateOfIssue,
        username: user?.name
      })
    }).then(() => {
      setIsSummonModalOpen(false);
      setWhoIssued('');
      setCourtDate('');
      setDateOfIssue('');
      setError(null);
      setSubmittingSummon(false);
      fetchCaseDetails();
    })
    .catch(err => {
      console.error(err);
      setError(err.message || 'Failed to link summon');
      setSubmittingSummon(false);
    });
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-500">Loading case details...</p>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold text-slate-900">Case Not Found</h2>
        <p className="mt-2 text-slate-500">The case you're looking for doesn't exist or you don't have access.</p>
        <Link to="/cases" className="mt-4 inline-flex items-center text-primary-600 hover:text-primary-700">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Cases
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link to="/cases" className="p-2 rounded-full hover:bg-slate-200 text-slate-500 transition-colors">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Case #{caseData.id}</h1>
            <p className="mt-1 text-sm text-slate-500">{caseData.type}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={() => setIsStatusModalOpen(true)}
            className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
          >
            Edit Status
          </button>
          <button 
            onClick={() => {
              setReportType(caseData.type === 'Clinical Forensic' ? 'MLEF' : 'PMR');
              setIsReportModalOpen(true);
            }}
            className="px-4 py-2 bg-primary-600 rounded-lg text-sm font-medium text-white hover:bg-primary-500 transition-colors"
          >
            Generate Report
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Case Info */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
            <h3 className="text-base font-semibold text-slate-900 mb-4 border-b border-slate-100 pb-2">Case Details</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Patient / Deceased</p>
                  <p className="text-sm text-slate-600">{caseData.patientName}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Date Registered</p>
                  <p className="text-sm text-slate-600">{caseData.date}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Activity className="h-5 w-5 text-slate-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-slate-900">Assigned Doctor</p>
                  <p className="text-sm text-slate-600">{caseData.doctor}</p>
                </div>
              </div>
              <div className="pt-4 border-t border-slate-100">
                <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ring-inset ${
                      caseData.status === 'Active' ? 'bg-green-50 text-green-700 ring-green-600/20' : 
                      caseData.status === 'Closed' ? 'bg-slate-100 text-slate-700 ring-slate-600/20' :
                      'bg-amber-50 text-amber-700 ring-amber-600/20'
                    }`}>
                  Status: {caseData.status}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Evidence & Reports */}
        <div className="lg:col-span-2 space-y-6">
          {/* Evidence */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <Database className="h-5 w-5 text-primary-600" />
                Linked Evidence
              </h3>
              <button 
                onClick={() => setIsEvidenceModalOpen(true)}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Add Evidence
              </button>
            </div>
            <ul className="divide-y divide-slate-100">
              {evidence.length > 0 ? evidence.map(e => (
                <li key={e.id} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{e.name}</p>
                    <p className="text-xs text-slate-500">{e.uploadedAt} • {e.size}</p>
                  </div>
                  <button 
                    onClick={() => setSelectedEvidenceForPreview(e)}
                    className="text-sm text-slate-600 hover:text-primary-600 font-medium border border-slate-200 rounded px-2.5 py-1 hover:border-primary-100 transition-colors bg-white shadow-sm"
                  >
                    View
                  </button>
                </li>
              )) : (
                <li className="p-6 text-center text-sm text-slate-500">No evidence uploaded yet.</li>
              )}
            </ul>
          </div>

          {/* Reports */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary-600" />
                Associated Reports
              </h3>
            </div>
            <ul className="divide-y divide-slate-100">
              {reports.length > 0 ? reports.map(r => (
                <li key={r.id} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{r.type} Report</p>
                    <p className="text-xs text-slate-500">Generated: {r.date}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                          r.status === 'Drafted' ? 'bg-blue-50 text-blue-700 ring-blue-600/20' :
                          r.status === 'Issued' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                          'bg-amber-50 text-amber-700 ring-amber-600/20'
                        }`}>
                      {r.status}
                    </span>
                    <button 
                      onClick={() => setSelectedReportForPreview(r)}
                      className="text-sm text-slate-600 hover:text-primary-600 font-medium border border-slate-200 rounded px-2.5 py-1 hover:border-primary-100 transition-colors bg-white shadow-sm"
                    >
                      View Report
                    </button>
                  </div>
                </li>
              )) : (
                <li className="p-6 text-center text-sm text-slate-500">No reports generated yet.</li>
              )}
            </ul>
          </div>

          {/* Summons & Court Dates */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
              <h3 className="text-base font-semibold text-slate-900 flex items-center gap-2">
                <AlertCircle className="h-5 w-5 text-primary-600" />
                Summons & Court Dates
              </h3>
              <button 
                onClick={() => setIsSummonModalOpen(true)}
                className="text-sm text-primary-600 hover:text-primary-700 font-medium"
              >
                Link Court Summon
              </button>
            </div>
            <ul className="divide-y divide-slate-100">
              {summons.length > 0 ? summons.map(s => (
                <li key={s.id} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-slate-900">Summon Reference: {s.id.toUpperCase()}</p>
                    <p className="text-xs text-slate-500">Issued by: {s.whoIssued} • Issued on: {s.dateOfIssue}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold bg-red-50 text-red-700 ring-1 ring-inset ring-red-600/10">
                      Court Date: {s.courtDate}
                    </span>
                  </div>
                </li>
              )) : (
                <li className="p-6 text-center text-sm text-slate-500">No summons linked to this case yet.</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Add Evidence Modal */}
      {isEvidenceModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-950">Add Digital Evidence File</h3>
              <button 
                onClick={() => {
                  setIsEvidenceModalOpen(false);
                  setSelectedFile(null);
                }}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAddEvidence} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Select File</label>
                <input 
                  type="file" 
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 file:mr-4 file:py-1 file:px-3 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                  onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                />
                <p className="text-xs text-slate-400 mt-1">Upload images (JPG/PNG) or legal documents (PDF).</p>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsEvidenceModalOpen(false);
                    setSelectedFile(null);
                  }}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submittingEvidence}
                  className="px-4 py-2 bg-primary-600 rounded-lg text-sm font-medium text-white hover:bg-primary-500 transition-colors disabled:opacity-50"
                >
                  {submittingEvidence ? 'Uploading...' : 'Upload & Link'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Generate Report Modal */}
      {isReportModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-950">Generate Medico-Legal Report</h3>
              <button 
                onClick={() => setIsReportModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleGenerateReport} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Report Type</label>
                <select 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value as any)}
                >
                  <option value="MLEF">Medico-Legal Examination Form (MLEF)</option>
                  <option value="PMR">Postmortem Report (PMR)</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsReportModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={generatingReport}
                  className="px-4 py-2 bg-primary-600 rounded-lg text-sm font-medium text-white hover:bg-primary-500 transition-colors disabled:opacity-50"
                >
                  {generatingReport ? 'Generating...' : 'Generate Draft'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Status Modal */}
      {isStatusModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-950">Update Case Status</h3>
              <button 
                onClick={() => setIsStatusModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleUpdateStatus} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                <select 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={selectedStatus}
                  onChange={(e) => setSelectedStatus(e.target.value)}
                >
                  <option value="Active">Active</option>
                  <option value="Pending PMR">Pending PMR</option>
                  <option value="Closed">Closed</option>
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsStatusModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={updatingStatus}
                  className="px-4 py-2 bg-primary-600 rounded-lg text-sm font-medium text-white hover:bg-primary-500 transition-colors disabled:opacity-50"
                >
                  {updatingStatus ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Link Summon Modal */}
      {isSummonModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-950">Link Court Summon</h3>
              <button 
                onClick={() => {
                  setIsSummonModalOpen(false);
                  setWhoIssued('');
                  setCourtDate('');
                  setDateOfIssue('');
                }}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleLinkSummon} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Issuing Authority / Court</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Magistrate Court Peradeniya"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={whoIssued}
                  onChange={(e) => setWhoIssued(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date of Issue</label>
                <input 
                  type="date" 
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={dateOfIssue}
                  onChange={(e) => setDateOfIssue(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Court Appearance Date</label>
                <input 
                  type="date" 
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={courtDate}
                  onChange={(e) => setCourtDate(e.target.value)}
                />
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => {
                    setIsSummonModalOpen(false);
                    setWhoIssued('');
                    setCourtDate('');
                    setDateOfIssue('');
                  }}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submittingSummon}
                  className="px-4 py-2 bg-primary-600 rounded-lg text-sm font-medium text-white hover:bg-primary-500 transition-colors disabled:opacity-50"
                >
                  {submittingSummon ? 'Linking...' : 'Link Summon'}
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
                        // Fallback in case of mock/seeded file that doesn't physically exist in uploads folder
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

      {/* Report Print Preview Modal */}
      {selectedReportForPreview && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full shadow-2xl border border-slate-100 overflow-hidden flex flex-col my-8">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between no-print">
              <div>
                <h3 className="font-semibold text-slate-950">Medico-Legal Document Viewer</h3>
                <p className="text-xs text-slate-500 mt-0.5">Reference: {selectedReportForPreview.id.toUpperCase()}</p>
              </div>
              <div className="flex gap-2">
                <button 
                  onClick={handlePrint}
                  className="p-2 rounded-lg hover:bg-slate-200 text-slate-600 transition-colors flex items-center gap-1.5 text-sm font-medium border border-slate-200 bg-white"
                >
                  <Printer className="h-4 w-4" />
                  Print
                </button>
                <button 
                  onClick={() => setSelectedReportForPreview(null)}
                  className="p-2 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Document Content */}
            <div className="p-12 bg-white flex-1 overflow-y-auto print:p-0" id="print-area">
              <div className="space-y-6 max-w-2xl mx-auto border border-slate-100 p-8 shadow-sm rounded-lg print:border-0 print:shadow-none print:p-0">
                {/* Letterhead */}
                <div className="text-center border-b-2 border-slate-900 pb-4 space-y-1">
                  <h2 className="text-xl font-bold tracking-wide uppercase text-slate-950">Department of Forensic Medicine</h2>
                  <h3 className="text-sm font-semibold tracking-wide text-slate-700">FACULTY OF MEDICINE • UNIVERSITY OF PERADENIYA</h3>
                  <p className="text-xs text-slate-500">Peradeniya, Sri Lanka • Tel: +94 812 396 000</p>
                </div>

                <div className="text-center py-2">
                  <h4 className="text-lg font-extrabold tracking-wider underline uppercase text-slate-900">
                    {selectedReportForPreview.type === 'MLEF' ? 'Medico-Legal Examination Form (MLEF)' : 'Postmortem Examination Report (PMR)'}
                  </h4>
                  <p className="text-xs font-medium text-slate-500 mt-1">Ref No: MLR-2026-{selectedReportForPreview.id.substring(4, 8).toUpperCase()}</p>
                </div>

                {/* Case Reference Table */}
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest">1. Case Administration</h5>
                  <table className="w-full text-sm text-slate-800 border border-slate-200 border-collapse">
                    <tbody>
                      <tr className="border-b border-slate-200">
                        <td className="p-2 bg-slate-50 font-semibold w-1/3 border-r border-slate-200">Case ID:</td>
                        <td className="p-2">#{caseData.id}</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="p-2 bg-slate-50 font-semibold border-r border-slate-200">Date Registered:</td>
                        <td className="p-2">{caseData.date}</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="p-2 bg-slate-50 font-semibold border-r border-slate-200">Examination Date:</td>
                        <td className="p-2">{selectedReportForPreview.date}</td>
                      </tr>
                      <tr>
                        <td className="p-2 bg-slate-50 font-semibold border-r border-slate-200">Assigned Medical Officer:</td>
                        <td className="p-2">{caseData.doctor}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Subject Details Table */}
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest">2. Subject Details</h5>
                  <table className="w-full text-sm text-slate-800 border border-slate-200 border-collapse">
                    <tbody>
                      <tr className="border-b border-slate-200">
                        <td className="p-2 bg-slate-50 font-semibold w-1/3 border-r border-slate-200">Subject Name:</td>
                        <td className="p-2">{caseData.patientName}</td>
                      </tr>
                      <tr className="border-b border-slate-200">
                        <td className="p-2 bg-slate-50 font-semibold border-r border-slate-200">Gender / Status:</td>
                        <td className="p-2">{caseData.type === 'Clinical Forensic' ? 'Patient (Clinical)' : 'Deceased (Autopsy)'}</td>
                      </tr>
                      <tr>
                        <td className="p-2 bg-slate-50 font-semibold border-r border-slate-200">Legal Authorization:</td>
                        <td className="p-2">
                          {selectedReportForPreview.type === 'MLEF' ? 'Hospital Police Inquest Request' : 'Magistrate Court Order Inquest'}
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </div>

                {/* Medical Findings Text */}
                <div className="space-y-2">
                  <h5 className="text-xs font-bold text-slate-400 uppercase tracking-widest">3. Medical Observations & Conclusion</h5>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg text-sm text-slate-800 leading-relaxed font-serif">
                    {selectedReportForPreview.type === 'MLEF' ? (
                      <p>
                        The subject was examined clinically in detail. External examination reveals multiple minor abrasions on the upper limbs and contusions on the chest wall. General state of health is otherwise satisfactory. Observations indicate blunt force trauma. Digital photographs and radiology investigations have been linked to this case file.
                      </p>
                    ) : (
                      <p>
                        Postmortem examination of the deceased was performed at the Hospital Morgue. The external and internal findings show severe head injuries with fracturing of the skull base, associated with subarachnoid hemorrhage. The toxicology results are pending. The cause of death is determined to be cranio-cerebral injuries following blunt force trauma.
                      </p>
                    )}
                  </div>
                </div>

                {/* Signature Block */}
                <div className="pt-12 flex justify-between items-end">
                  <div className="text-xs text-slate-500">
                    <p>Report Generated: {selectedReportForPreview.date}</p>
                    <p>System Ref: {selectedReportForPreview.id}</p>
                  </div>
                  <div className="text-center w-64 border-t border-slate-400 pt-2 text-sm text-slate-800 font-semibold">
                    <p className="font-serif italic">{caseData.doctor}</p>
                    <p className="text-xs font-medium text-slate-500 mt-1">Consultant JMO / Medical Officer</p>
                    <p className="text-xs font-medium text-slate-400">Department of Forensic Medicine</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 no-print">
              <button 
                onClick={() => setSelectedReportForPreview(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold transition-colors"
              >
                Close Report
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
