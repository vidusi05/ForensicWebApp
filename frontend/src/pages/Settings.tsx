import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { AlertTriangle, CheckCircle2, LockKeyhole, Settings as SettingsIcon, Shield, User } from 'lucide-react';

export default function Settings() {
  const { user, changePassword } = useAuth();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [savingPassword, setSavingPassword] = useState(false);

  const handlePasswordChange = async (event: React.FormEvent) => {
    event.preventDefault();
    setPasswordMessage(null);
    setPasswordError(null);

    if (newPassword.length < 10) {
      setPasswordError('New password must contain at least 10 characters.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirmation do not match.');
      return;
    }

    setSavingPassword(true);
    try {
      await changePassword(currentPassword, newPassword);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setPasswordMessage('Password changed successfully.');
    } catch (error) {
      setPasswordError(error instanceof Error ? error.message : 'Unable to change password.');
    } finally {
      setSavingPassword(false);
    }
  };

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
          <LockKeyhole className="h-5 w-5 text-primary-600" />
          <h3 className="text-base font-semibold leading-6 text-slate-900">Change Password</h3>
        </div>
        <form onSubmit={handlePasswordChange} className="p-6 space-y-5">
          {passwordMessage && (
            <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
              <CheckCircle2 className="h-4 w-4" />
              {passwordMessage}
            </div>
          )}

          {passwordError && (
            <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
              <AlertTriangle className="h-4 w-4" />
              {passwordError}
            </div>
          )}

          <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div>
              <label className="block text-sm font-medium text-slate-700">Current Password</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Confirm New Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
                required
              />
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={savingPassword}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <LockKeyhole className="h-4 w-4" />
              {savingPassword ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </form>
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
