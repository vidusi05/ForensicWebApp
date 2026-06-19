import { useState, useEffect } from 'react';
import { FileText, Download, Printer, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

export default function Reporting() {
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  // Form State
  const [reportType, setReportType] = useState('MLEF');
  const [caseId, setCaseId] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Preview State
  const [selectedReportForPreview, setSelectedReportForPreview] = useState<any>(null);
  const [previewCaseData, setPreviewCaseData] = useState<any>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);

  const fetchReports = () => {
    setLoading(true);
    fetch('/api/reports')
      .then(res => res.json())
      .then(data => {
        setReports(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchReports();
  }, []);

  // Fetch case details when a report is selected for preview
  useEffect(() => {
    if (selectedReportForPreview) {
      setLoadingPreview(true);
      fetch(`/api/cases/${selectedReportForPreview.caseId}`)
        .then(res => {
          if (!res.ok) throw new Error('Case details not found');
          return res.json();
        })
        .then(data => {
          setPreviewCaseData(data.caseData);
          setLoadingPreview(false);
        })
        .catch(err => {
          console.error(err);
          setLoadingPreview(false);
        });
    } else {
      setPreviewCaseData(null);
    }
  }, [selectedReportForPreview]);

  const handleGenerateReport = (e: React.FormEvent) => {
    e.preventDefault();
    if (!caseId) return;
    setError(null);
    setSubmitting(true);

    // Verify case exists first
    fetch(`/api/cases/${caseId}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`Case #${caseId} does not exist.`);
        }
        return res.json();
      })
      .then(() => {
        // Create report
        return fetch('/api/reports', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            caseId,
            type: reportType,
            username: user?.name
          })
        });
      })
      .then(res => {
        if (!res.ok) throw new Error('Failed to create report.');
        return res.json();
      })
      .then(() => {
        setCaseId('');
        setSubmitting(false);
        fetchReports();
      })
      .catch(err => {
        console.error(err);
        setError(err.message || 'Error generating report');
        setSubmitting(false);
      });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between no-print">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Reporting & Tracking</h1>
          <p className="mt-1 text-sm text-slate-500">
            Generate standardized medico-legal reports and track statuses.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 no-print">
        {/* Generate Report Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Generate New Report</h2>
          <form onSubmit={handleGenerateReport} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg text-sm font-medium">
                {error}
              </div>
            )}
            <div>
              <label htmlFor="report-type" className="block text-sm font-medium leading-6 text-slate-900">
                Report Type
              </label>
              <select
                id="report-type"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
                className="mt-2 block w-full rounded-md border-0 py-2 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-primary-600 sm:text-sm sm:leading-6 focus:outline-none"
              >
                <option value="MLEF">Medico-Legal Examination Form (MLEF)</option>
                <option value="PMR">Postmortem Report (PMR)</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="case-id" className="block text-sm font-medium leading-6 text-slate-900">
                Case ID
              </label>
              <input
                type="text"
                id="case-id"
                required
                placeholder="e.g. 2026101"
                value={caseId}
                onChange={(e) => setCaseId(e.target.value)}
                className="mt-2 block w-full rounded-md border-0 py-2 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-primary-600 sm:text-sm sm:leading-6 focus:outline-none"
              />
            </div>
            
            <button 
              type="submit"
              disabled={submitting}
              className="w-full mt-4 flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 transition-colors disabled:opacity-50"
            >
              <FileText className="h-4 w-4 mr-2" />
              {submitting ? 'Generating...' : 'Generate Draft'}
            </button>
          </form>
        </div>

        {/* Tracking Registers */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
            <h3 className="text-base font-semibold text-slate-900">Digital Register Tracker</h3>
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
              Live Updates
            </span>
          </div>
          <div className="p-0 max-h-[300px] overflow-y-auto">
            <ul className="divide-y divide-slate-100">
              {loading ? (
                <li className="p-4 text-center text-slate-500 text-sm">Loading tracker...</li>
              ) : reports.length > 0 ? (
                reports.slice(0, 5).map((item) => (
                  <li key={item.id} className="p-4 hover:bg-slate-50 transition-colors cursor-pointer" onClick={() => setSelectedReportForPreview(item)}>
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">Case #{item.caseId} - {item.type}</p>
                        <p className="text-xs text-slate-500 mt-1">Generated: {item.date}</p>
                      </div>
                      <div>
                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                          item.status === 'Issued' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                          item.status === 'Drafted' ? 'bg-blue-50 text-blue-700 ring-blue-600/20' :
                          'bg-amber-50 text-amber-700 ring-amber-600/20'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    </div>
                  </li>
                ))
              ) : (
                <li className="p-4 text-center text-slate-500 text-sm">No report records found.</li>
              )}
            </ul>
          </div>
        </div>
      </div>

      {/* Recent Reports Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden no-print">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
          <h3 className="text-base font-semibold text-slate-900">Recently Generated Reports</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Report Info</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Case Link</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date Issued</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 text-sm">Loading reports...</td>
                </tr>
              ) : reports.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-slate-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-slate-900">{item.type} Report</div>
                        <div className="text-sm text-slate-500">Ref: {item.id.toUpperCase()}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-700">
                    <Link to={`/cases/${item.caseId}`} className="text-primary-600 hover:text-primary-700 font-medium">
                      #{item.caseId}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                      item.status === 'Issued' ? 'bg-green-50 text-green-700 ring-green-600/20' :
                      item.status === 'Drafted' ? 'bg-blue-50 text-blue-700 ring-blue-600/20' :
                      'bg-amber-50 text-amber-700 ring-amber-600/20'
                    }`}>
                      {item.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {item.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button 
                        onClick={() => setSelectedReportForPreview(item)}
                        className="text-slate-500 hover:text-primary-600 font-medium border border-slate-200 rounded px-2 py-1 bg-white hover:border-primary-100 shadow-sm transition-colors mr-2"
                      >
                        View Report
                      </button>
                      <button className="text-slate-400 hover:text-primary-600" title="Download">
                        <Download className="h-4 w-4" />
                      </button>
                      <button className="text-slate-400 hover:text-primary-600" title="Print" onClick={() => setSelectedReportForPreview(item)}>
                        <Printer className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!loading && reports.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500 text-sm">No report records found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

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
                  disabled={loadingPreview}
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
              {loadingPreview ? (
                <div className="text-center py-12 text-slate-500">Loading document details...</div>
              ) : previewCaseData ? (
                <div className="space-y-6 max-w-2xl mx-auto border border-slate-100 p-8 shadow-sm rounded-lg print:border-0 print:shadow-none print:p-0 animate-in fade-in duration-255">
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
                          <td className="p-2">#{previewCaseData.id}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="p-2 bg-slate-50 font-semibold border-r border-slate-200">Date Registered:</td>
                          <td className="p-2">{previewCaseData.date}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="p-2 bg-slate-50 font-semibold border-r border-slate-200">Examination Date:</td>
                          <td className="p-2">{selectedReportForPreview.date}</td>
                        </tr>
                        <tr>
                          <td className="p-2 bg-slate-50 font-semibold border-r border-slate-200">Assigned Medical Officer:</td>
                          <td className="p-2">{previewCaseData.doctor}</td>
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
                          <td className="p-2">{previewCaseData.patientName}</td>
                        </tr>
                        <tr className="border-b border-slate-200">
                          <td className="p-2 bg-slate-50 font-semibold border-r border-slate-200">Gender / Status:</td>
                          <td className="p-2">{previewCaseData.type === 'Clinical Forensic' ? 'Patient (Clinical)' : 'Deceased (Autopsy)'}</td>
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
                      <p className="font-serif italic">{previewCaseData.doctor}</p>
                      <p className="text-xs font-medium text-slate-500 mt-1">Consultant JMO / Medical Officer</p>
                      <p className="text-xs font-medium text-slate-400">Department of Forensic Medicine</p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-red-500">Failed to load report document details.</div>
              )}
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
