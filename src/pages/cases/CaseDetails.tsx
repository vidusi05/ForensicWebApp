import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, FileText, Database, User, Calendar, Activity } from 'lucide-react';
import { mockCases, mockEvidence, mockReports } from '../../data/mockData';

export default function CaseDetails() {
  const { id } = useParams<{ id: string }>();
  const caseData = mockCases.find(c => c.id === id);
  
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

  const relatedEvidence = mockEvidence.filter(e => e.caseId === id);
  const relatedReports = mockReports.filter(r => r.caseId === id);

  return (
    <div className="space-y-6">
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
          <button className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors">
            Edit Case
          </button>
          <button className="px-4 py-2 bg-primary-600 rounded-lg text-sm font-medium text-white hover:bg-primary-500 transition-colors">
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
              <button className="text-sm text-primary-600 hover:text-primary-700 font-medium">Add Evidence</button>
            </div>
            <ul className="divide-y divide-slate-100">
              {relatedEvidence.length > 0 ? relatedEvidence.map(e => (
                <li key={e.id} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{e.name}</p>
                    <p className="text-xs text-slate-500">{e.uploadedAt} • {e.size}</p>
                  </div>
                  <button className="text-sm text-slate-600 hover:text-primary-600 font-medium">View</button>
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
              {relatedReports.length > 0 ? relatedReports.map(r => (
                <li key={r.id} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{r.type} Report</p>
                    <p className="text-xs text-slate-500">Generated: {r.date}</p>
                  </div>
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                        r.status === 'Drafted' ? 'bg-blue-50 text-blue-700 ring-blue-600/20' :
                        'bg-amber-50 text-amber-700 ring-amber-600/20'
                      }`}>
                    {r.status}
                  </span>
                </li>
              )) : (
                <li className="p-6 text-center text-sm text-slate-500">No reports generated yet.</li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
