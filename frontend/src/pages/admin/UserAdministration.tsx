import { useEffect, useMemo, useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  MailCheck,
  Pencil,
  RotateCcw,
  Search,
  Shield,
  Trash2,
  UserMinus,
  UserPlus,
  UserRoundCheck,
  X,
} from 'lucide-react';
import { apiFetch } from '../../lib/api';
import { UserRole, useAuth } from '../../contexts/AuthContext';

type ManagedUser = {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  status: 'Active' | 'Deactivated';
  mustChangePassword: boolean;
  createdAt: string | null;
  updatedAt: string | null;
  deactivatedAt: string | null;
  lastPasswordResetAt: string | null;
};

type EmailStatus = {
  configured: boolean;
  from: string | null;
  host: string | null;
  port: string | null;
};

const emptyForm = {
  id: '',
  name: '',
  email: '',
  role: 'Medical Officer' as UserRole,
};

export default function UserAdministration() {
  const { user } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [emailStatus, setEmailStatus] = useState<EmailStatus | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users.filter((item) => {
      const statusMatches = statusFilter === 'All' || item.status === statusFilter;
      const searchMatches = !term ||
        item.name.toLowerCase().includes(term) ||
        item.email.toLowerCase().includes(term) ||
        item.role.toLowerCase().includes(term);
      return statusMatches && searchMatches;
    });
  }, [users, statusFilter, search]);

  const activeCount = users.filter((item) => item.status === 'Active').length;
  const deactivatedCount = users.filter((item) => item.status === 'Deactivated').length;

  async function loadData() {
    setLoading(true);
    setError(null);
    try {
      const [userData, roleData, mailData] = await Promise.all([
        apiFetch<ManagedUser[]>('/api/admin/users'),
        apiFetch<UserRole[]>('/api/admin/roles'),
        apiFetch<EmailStatus>('/api/admin/email-status'),
      ]);
      setUsers(userData);
      setRoles(roleData);
      setEmailStatus(mailData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to load users');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function editUser(item: ManagedUser) {
    setEditingId(item.id);
    setForm({
      id: item.id,
      name: item.name,
      email: item.email,
      role: item.role,
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setMessage(null);

    try {
      if (editingId) {
        await apiFetch<ManagedUser>(`/api/admin/users/${editingId}`, {
          method: 'PUT',
          body: JSON.stringify(form),
        });
        setMessage('User updated successfully.');
      } else {
        await apiFetch<ManagedUser>('/api/admin/users', {
          method: 'POST',
          body: JSON.stringify(form),
        });
        setMessage('User created and temporary password email sent.');
      }
      resetForm();
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unable to save user');
    } finally {
      setSaving(false);
    }
  }

  async function runAction(action: () => Promise<unknown>, success: string) {
    setError(null);
    setMessage(null);
    try {
      await action();
      setMessage(success);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">User Administration</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage users, roles, password resets, and account lifecycle.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <span className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">
            <UserRoundCheck className="h-4 w-4 text-green-600" />
            {activeCount} Active
          </span>
          <span className="inline-flex items-center gap-2 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm font-medium text-slate-700">
            <UserMinus className="h-4 w-4 text-slate-500" />
            {deactivatedCount} Deactivated
          </span>
        </div>
      </div>

      {message && (
        <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-800">
          <CheckCircle2 className="h-4 w-4" />
          {message}
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      )}

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary-600" />
            <h2 className="text-base font-semibold text-slate-900">{editingId ? 'Modify User' : 'Create New User'}</h2>
          </div>
          <span className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold ${
            emailStatus?.configured ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20' : 'bg-amber-50 text-amber-700 ring-1 ring-amber-600/20'
          }`}>
            <MailCheck className="h-3.5 w-3.5" />
            {emailStatus?.configured ? `SMTP ready: ${emailStatus.from}` : 'SMTP not configured'}
          </span>
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 p-5 lg:grid-cols-[1.2fr_1.2fr_1fr_auto] lg:items-end">
          <div>
            <label className="block text-sm font-medium text-slate-700">Full Name</label>
            <input
              value={form.name}
              onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Email Address</label>
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700">Role</label>
            <select
              value={form.role}
              onChange={(event) => setForm((prev) => ({ ...prev, role: event.target.value as UserRole }))}
              className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              {roles.map((role) => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-md bg-primary-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-700 disabled:opacity-70"
            >
              <UserPlus className="h-4 w-4" />
              {saving ? 'Saving' : editingId ? 'Update' : 'Create'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="inline-flex items-center justify-center rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-col gap-3 border-b border-slate-200 px-5 py-4 lg:flex-row lg:items-center lg:justify-between">
          <h2 className="text-base font-semibold text-slate-900">Users</h2>
          <div className="flex flex-col gap-2 sm:flex-row">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
              <input
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search users"
                className="w-full rounded-md border border-slate-300 py-2 pl-9 pr-3 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 sm:w-64"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value)}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            >
              <option>All</option>
              <option>Active</option>
              <option>Deactivated</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200">
            <thead className="bg-slate-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">User</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Role</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Password</th>
                <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-sm text-slate-500">Loading users...</td>
                </tr>
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-sm text-slate-500">No users found.</td>
                </tr>
              ) : (
                filteredUsers.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50">
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-900">{item.name}</div>
                      <div className="text-sm text-slate-500">{item.email}</div>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-700">{item.role}</td>
                    <td className="px-5 py-4">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        item.status === 'Active' ? 'bg-green-50 text-green-700 ring-1 ring-green-600/20' : 'bg-slate-100 text-slate-700 ring-1 ring-slate-500/20'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-5 py-4 text-sm text-slate-600">
                      {item.mustChangePassword ? 'Change required' : 'Current'}
                      {item.lastPasswordResetAt && (
                        <div className="text-xs text-slate-400">Reset {new Date(item.lastPasswordResetAt).toLocaleDateString()}</div>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex flex-wrap justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => editUser(item)}
                          className="inline-flex items-center gap-1 rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                        >
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </button>
                        {item.status === 'Active' && (
                          <>
                            <button
                              type="button"
                              onClick={() => runAction(
                                () => apiFetch(`/api/admin/users/${item.id}/reset-password`, { method: 'POST' }),
                                'Temporary password email sent.'
                              )}
                              className="inline-flex items-center gap-1 rounded-md border border-blue-200 px-2.5 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-50"
                            >
                              <RotateCcw className="h-3.5 w-3.5" />
                              Reset
                            </button>
                            {item.id !== user?.id && (
                              <button
                                type="button"
                                onClick={() => runAction(
                                  () => apiFetch(`/api/admin/users/${item.id}/deactivate`, { method: 'POST' }),
                                  'User deactivated.'
                                )}
                                className="inline-flex items-center gap-1 rounded-md border border-amber-200 px-2.5 py-1.5 text-xs font-medium text-amber-700 hover:bg-amber-50"
                              >
                                <UserMinus className="h-3.5 w-3.5" />
                                Deactivate
                              </button>
                            )}
                          </>
                        )}
                        {item.status === 'Deactivated' && (
                          <>
                            <button
                              type="button"
                              onClick={() => runAction(
                                () => apiFetch(`/api/admin/users/${item.id}/reactivate`, { method: 'POST' }),
                                'User reactivated.'
                              )}
                              className="inline-flex items-center gap-1 rounded-md border border-green-200 px-2.5 py-1.5 text-xs font-medium text-green-700 hover:bg-green-50"
                            >
                              <UserRoundCheck className="h-3.5 w-3.5" />
                              Reactivate
                            </button>
                            <button
                              type="button"
                              onClick={() => runAction(
                                () => apiFetch(`/api/admin/users/${item.id}`, { method: 'DELETE' }),
                                'Deactivated user permanently deleted.'
                              )}
                              className="inline-flex items-center gap-1 rounded-md border border-red-200 px-2.5 py-1.5 text-xs font-medium text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
