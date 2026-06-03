import { mockAuditLogs } from '../data/mockData';
import { ShieldAlert, Activity, FileText } from 'lucide-react';

export default function AuditLog() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">System Audit Logs</h1>
        <p className="mt-1 text-sm text-slate-500">
          View all system access and modification records. Restrict to System Administrators.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50 flex justify-between items-center">
          <h3 className="text-base font-semibold leading-6 text-slate-900">Recent Activity</h3>
          <span className="inline-flex items-center rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600">
            Last 24 Hours
          </span>
        </div>
        <div className="divide-y divide-slate-200">
          {mockAuditLogs.map((log) => (
            <div key={log.id} className="p-6 hover:bg-slate-50 transition-colors">
              <div className="flex gap-4">
                <div className="flex-shrink-0 mt-1">
                  {log.action.includes('Login') ? <ShieldAlert className="h-5 w-5 text-indigo-500" /> :
                   log.action.includes('Case') ? <Activity className="h-5 w-5 text-green-500" /> :
                   <FileText className="h-5 w-5 text-amber-500" />}
                </div>
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{log.action}</p>
                      <p className="text-sm text-slate-600 mt-1">{log.details}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-500">{log.timestamp}</p>
                      <p className="text-xs font-medium text-slate-700 mt-1">{log.user}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
