import { useAuth } from '../contexts/AuthContext';
import { Settings as SettingsIcon, Shield, User } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Settings</h1>
        <p className="mt-1 text-sm text-slate-500">
          Manage your account settings and preferences.
        </p>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50 flex items-center gap-2">
          <User className="h-5 w-5 text-primary-600" />
          <h3 className="text-base font-semibold leading-6 text-slate-900">Profile Information</h3>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700">Full Name</label>
              <input type="text" disabled value={user?.name || ''} className="mt-1 block w-full rounded-md border-slate-300 bg-slate-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2 px-3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Email Address</label>
              <input type="email" disabled value={user?.email || ''} className="mt-1 block w-full rounded-md border-slate-300 bg-slate-100 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm py-2 px-3" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Assigned Role</label>
              <div className="mt-2 flex items-center gap-2">
                <Shield className="h-5 w-5 text-slate-400" />
                <span className="text-sm text-slate-900 font-medium">{user?.role}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-5 border-b border-slate-200 bg-slate-50/50 flex items-center gap-2">
          <SettingsIcon className="h-5 w-5 text-primary-600" />
          <h3 className="text-base font-semibold leading-6 text-slate-900">Application Preferences</h3>
        </div>
        <div className="p-6">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-slate-900">Dark Mode</h4>
                <p className="text-sm text-slate-500">Toggle dark mode interface.</p>
              </div>
              <button type="button" className="bg-slate-200 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2">
                <span className="translate-x-0 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
              </button>
            </div>
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-slate-900">Email Notifications</h4>
                <p className="text-sm text-slate-500">Receive alerts for pending reports.</p>
              </div>
              <button type="button" className="bg-primary-600 relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2">
                <span className="translate-x-5 pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
