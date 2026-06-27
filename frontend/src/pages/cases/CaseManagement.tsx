import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Plus, Filter, MoreVertical, X } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { apiFetch } from '../../lib/api';

export default function CaseManagement() {
  const [activeTab, setActiveTab] = useState<'clinical' | 'autopsy'>('clinical');
  const [searchQuery, setSearchQuery] = useState('');
  const [cases, setCases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [doctors, setDoctors] = useState<any[]>([]);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [patientName, setPatientName] = useState('');
  const [newCaseType, setNewCaseType] = useState<'Clinical Forensic' | 'Autopsy'>('Clinical Forensic');
  const [newCaseDate, setNewCaseDate] = useState(new Date().toISOString().split('T')[0]);
  const [selectedDoctorId, setSelectedDoctorId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  // Fetch cases
  const fetchCases = useCallback(() => {
    setLoading(true);
    const typeQuery = activeTab === 'clinical' ? 'Clinical Forensic' : 'Autopsy';
    apiFetch<any[]>(`/api/cases?type=${encodeURIComponent(typeQuery)}&search=${encodeURIComponent(searchQuery)}`)
      .then(data => {
        setCases(data);
        setError(null);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setError(err.message || 'Unable to load cases');
        setLoading(false);
      });
  }, [activeTab, searchQuery]);

  useEffect(() => {
    fetchCases();
  }, [fetchCases]);

  // Fetch doctors for the dropdown
  useEffect(() => {
    apiFetch<any[]>('/api/doctors')
      .then(data => {
        setDoctors(data);
        if (data.length > 0) {
          setSelectedDoctorId(data[0].id);
        }
      })
      .catch(err => console.error(err));
  }, []);

  const handleCreateCase = (e: React.FormEvent) => {
    e.preventDefault();
    if (!patientName || !selectedDoctorId) return;

    setSubmitting(true);
    apiFetch<any>('/api/cases', {
      method: 'POST',
      body: JSON.stringify({
        type: newCaseType,
        patientName,
        date: newCaseDate,
        doctorId: selectedDoctorId,
        username: user?.name
      })
    }).then(() => {
        setIsModalOpen(false);
        setPatientName('');
        setError(null);
        setSubmitting(false);
        const newCaseTab = newCaseType === 'Clinical Forensic' ? 'clinical' : 'autopsy';
        if (activeTab === newCaseTab) {
          fetchCases();
        } else {
          setActiveTab(newCaseTab);
        }
      })
      .catch(err => {
        console.error(err);
        setError(err.message || 'Unable to create case');
        setSubmitting(false);
      });
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Case Management</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage clinical forensic and autopsy cases.
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <button
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="flex items-center justify-center rounded-lg bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600 transition-colors"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Case
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Tabs and Filters */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-200">
        <div className="border-b border-slate-200">
          <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
            <button
              onClick={() => setActiveTab('clinical')}
              className={`${
                activeTab === 'clinical'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors`}
            >
              Clinical Forensic Cases
            </button>
            <button
              onClick={() => setActiveTab('autopsy')}
              className={`${
                activeTab === 'autopsy'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-slate-500 hover:border-slate-300 hover:text-slate-700'
              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium transition-colors`}
            >
              Autopsy Cases
            </button>
          </nav>
        </div>
        
        <div className="p-4 flex items-center justify-between gap-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex-1 max-w-lg relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="block w-full pl-9 pr-3 py-2 border border-slate-200 rounded-lg text-sm placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              placeholder={`Search ${activeTab} cases by ID or patient name...`}
            />
          </div>
          <button className="flex items-center px-3 py-2 border border-slate-200 rounded-lg text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors">
            <Filter className="h-4 w-4 mr-2 text-slate-400" />
            Filters
          </button>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Case ID
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Patient/Deceased
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Doctor
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-slate-200">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">
                    Loading cases...
                  </td>
                </tr>
              ) : cases.map((c) => (
                <tr 
                  key={c.id} 
                  className="hover:bg-slate-50 transition-colors group cursor-pointer"
                  onClick={() => navigate(`/cases/${c.id}`)}
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900">
                    #{c.id}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {c.patientName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {c.date}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                    {c.doctor}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                      c.status === 'Active' ? 'bg-green-50 text-green-700 ring-green-600/20' : 
                      c.status === 'Closed' ? 'bg-slate-100 text-slate-700 ring-slate-600/20' :
                      'bg-amber-50 text-amber-700 ring-amber-600/20'
                    }`}>
                      {c.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button className="text-slate-400 hover:text-slate-600 transition-colors" onClick={(e) => e.stopPropagation()}>
                      <MoreVertical className="h-5 w-5" />
                    </button>
                  </td>
                </tr>
              ))}
              {!loading && cases.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-sm text-slate-500">
                    No cases found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Case Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-100 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-semibold text-slate-950">Register New Forensic Case</h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-200 text-slate-500 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCreateCase} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Subject Name</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. John Doe"
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Case Type</label>
                <select 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={newCaseType}
                  onChange={(e) => setNewCaseType(e.target.value as any)}
                >
                  <option value="Clinical Forensic">Clinical Forensic</option>
                  <option value="Autopsy">Autopsy</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Date Registered</label>
                <input 
                  type="date" 
                  required
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={newCaseDate}
                  onChange={(e) => setNewCaseDate(e.target.value)}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Assigned Doctor</label>
                <select 
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500"
                  value={selectedDoctorId}
                  onChange={(e) => setSelectedDoctorId(e.target.value)}
                >
                  {doctors.map(d => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>

              <div className="pt-4 border-t border-slate-100 flex justify-end gap-3">
                <button 
                  type="button" 
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-300 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={submitting}
                  className="px-4 py-2 bg-primary-600 rounded-lg text-sm font-medium text-white hover:bg-primary-500 transition-colors disabled:opacity-50"
                >
                  {submitting ? 'Registering...' : 'Register Case'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
