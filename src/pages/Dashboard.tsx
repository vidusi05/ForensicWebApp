import { Users, FileText, AlertCircle, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockCases } from '../data/mockData';

export default function Dashboard() {
  const navigate = useNavigate();

  const stats = [
    { name: 'Active Cases', value: '124', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { name: 'Pending Reports', value: '12', icon: FileText, color: 'text-amber-600', bg: 'bg-amber-100' },
    { name: 'Upcoming Court Dates', value: '3', icon: AlertCircle, color: 'text-red-600', bg: 'bg-red-100' },
    { name: 'Issued this Month', value: '45', icon: CheckCircle2, color: 'text-green-600', bg: 'bg-green-100' },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="mt-1 text-sm text-slate-500">
          Overview of departmental activities and pending tasks.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((item) => (
          <div
            key={item.name}
            className="bg-white overflow-hidden rounded-xl border border-slate-200 shadow-sm transition-all hover:shadow-md"
          >
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className={`rounded-lg p-3 ${item.bg}`}>
                    <item.icon className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <dl>
                    <dt className="truncate text-sm font-medium text-slate-500">{item.name}</dt>
                    <dd className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
                      {item.value}
                    </dd>
                  </dl>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Cases */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 flex justify-between items-center bg-slate-50/50">
            <h3 className="text-base font-semibold leading-6 text-slate-900">Recent Cases</h3>
            <button onClick={() => navigate('/cases')} className="text-sm font-medium text-primary-600 hover:text-primary-700">View all</button>
          </div>
          <div className="divide-y divide-slate-200">
            {mockCases.slice(0, 4).map((c) => (
              <div 
                key={c.id} 
                className="px-6 py-4 hover:bg-slate-50 transition-colors cursor-pointer"
                onClick={() => navigate(`/cases/${c.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex flex-col">
                    <p className="text-sm font-medium text-slate-900">Case #{c.id}</p>
                    <p className="text-sm text-slate-500">Patient: {c.patientName} • {c.type}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                      c.status === 'Active' ? 'bg-green-50 text-green-700 ring-green-600/20' : 
                      c.status === 'Closed' ? 'bg-slate-100 text-slate-700 ring-slate-600/20' :
                      'bg-amber-50 text-amber-700 ring-amber-600/20'
                    }`}>
                      {c.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Notifications & Tasks */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50">
            <h3 className="text-base font-semibold leading-6 text-slate-900">Urgent Notifications</h3>
          </div>
          <div className="p-6 space-y-4">
            <div className="flex gap-4 p-4 rounded-lg bg-red-50 text-red-900 border border-red-100">
              <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold">Court Date Approaching</p>
                <p className="text-sm mt-1 text-red-800">High Court appearance for Case #202519 tomorrow at 9:00 AM.</p>
              </div>
            </div>
            <div className="flex gap-4 p-4 rounded-lg bg-amber-50 text-amber-900 border border-amber-100">
              <FileText className="h-5 w-5 text-amber-500 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold">Unissued MLEF</p>
                <p className="text-sm mt-1 text-amber-800">MLEF for Case #202602 is pending approval for 3 days.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
