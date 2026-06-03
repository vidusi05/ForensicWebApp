import { FileText, Download, Printer, Share2 } from 'lucide-react';

export default function Reporting() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reporting & Tracking</h1>
        <p className="mt-1 text-sm text-slate-500">
          Generate standardized medico-legal reports and track statuses.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Generate Report Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Generate New Report</h2>
          <div className="space-y-4">
            <div>
              <label htmlFor="report-type" className="block text-sm font-medium leading-6 text-slate-900">
                Report Type
              </label>
              <select
                id="report-type"
                className="mt-2 block w-full rounded-md border-0 py-2 pl-3 pr-10 text-slate-900 ring-1 ring-inset ring-slate-300 focus:ring-2 focus:ring-primary-600 sm:text-sm sm:leading-6"
              >
                <option>Medico-Legal Examination Form (MLEF)</option>
                <option>Postmortem Report (PMR)</option>
                <option>Cause of Death Form</option>
                <option>Statistical Summary</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="case-id" className="block text-sm font-medium leading-6 text-slate-900">
                Case ID
              </label>
              <input
                type="text"
                id="case-id"
                placeholder="e.g. 2026123"
                className="mt-2 block w-full rounded-md border-0 py-2 px-3 text-slate-900 ring-1 ring-inset ring-slate-300 placeholder:text-slate-400 focus:ring-2 focus:ring-primary-600 sm:text-sm sm:leading-6"
              />
            </div>
            
            <button className="w-full mt-4 flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 transition-colors">
              <FileText className="h-4 w-4 mr-2" />
              Generate Draft
            </button>
          </div>
        </div>

        {/* Tracking Registers */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
            <h3 className="text-base font-semibold text-slate-900">Digital Register Tracker</h3>
            <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-600/20">
              Live Updates
            </span>
          </div>
          <div className="p-0">
            <ul className="divide-y divide-slate-100">
              {[
                { case: '2026010', type: 'MLEF', status: 'Drafted', date: 'Today, 10:45 AM' },
                { case: '2026009', type: 'PMR', status: 'Pending Signature', date: 'Today, 09:15 AM' },
                { case: '2026005', type: 'MLEF', status: 'Issued', date: 'Yesterday' },
              ].map((item, idx) => (
                <li key={idx} className="p-4 hover:bg-slate-50 transition-colors">
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Case #{item.case} - {item.type}</p>
                      <p className="text-xs text-slate-500 mt-1">Last updated: {item.date}</p>
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
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Recent Reports Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
          <h3 className="text-base font-semibold text-slate-900">Recently Generated Reports</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Report Info</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Generated By</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Date Issued</th>
                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {[1, 2, 3].map((idx) => (
                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <FileText className="h-5 w-5 text-slate-400 mr-3" />
                      <div>
                        <div className="text-sm font-medium text-slate-900">MLEF - Case #202580</div>
                        <div className="text-sm text-slate-500">Ref: MLR-{2026}-0{idx}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-slate-900">Dr. A. Perera</div>
                    <div className="text-sm text-slate-500">Consultant JMO</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    Jun 02, 2026
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <div className="flex justify-end gap-2">
                      <button className="text-slate-400 hover:text-primary-600" title="Download">
                        <Download className="h-4 w-4" />
                      </button>
                      <button className="text-slate-400 hover:text-primary-600" title="Print">
                        <Printer className="h-4 w-4" />
                      </button>
                      <button className="text-slate-400 hover:text-primary-600" title="Share">
                        <Share2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
