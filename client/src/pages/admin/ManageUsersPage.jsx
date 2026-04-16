import { useState, useEffect, useCallback } from 'react';
import {
  Users,
  MoreHorizontal,
  Eye,
  Shield,
  Trash2,
  Briefcase,
  FileText,
  X,
  AlertTriangle,
} from 'lucide-react';
import toast from 'react-hot-toast';
import * as adminService from '../../api/adminService';
import { useAuth } from '../../contexts/AuthContext';
import useDebounce from '../../hooks/useDebounce';
import SearchInput from '../../components/common/SearchInput';
import RoleBadge from '../../components/common/RoleBadge';
import ToggleSwitch from '../../components/common/ToggleSwitch';
import Pagination from '../../components/common/Pagination';
import ConfirmModal from '../../components/common/ConfirmModal';
import EmptyState from '../../components/common/EmptyState';
import SkeletonTable from '../../components/common/SkeletonTable';
import { getInitials } from '../../utils/helpers';

const ITEMS_PER_PAGE = 20;

const ROLE_TABS = [
  { key: 'all', label: 'All' },
  { key: 'candidate', label: 'Candidates' },
  { key: 'company', label: 'Companies' },
  { key: 'admin', label: 'Admins' },
];

const STATUS_TABS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'inactive', label: 'Inactive' },
];

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
  { value: 'name-asc', label: 'Name A-Z' },
  { value: 'name-desc', label: 'Name Z-A' },
];

/* ─────────────────── Actions Dropdown ─────────────────── */

const ActionsDropdown = ({ onViewDetails, onChangeRole, onDelete, isSelf }) => {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const handleClick = () => setOpen(false);
    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, [open]);

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setOpen((prev) => !prev);
        }}
        className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-700 dark:hover:text-slate-300"
        aria-label="Actions"
      >
        <MoreHorizontal className="h-4 w-4" />
      </button>

      {open && (
        <div className="absolute right-0 z-20 mt-1 w-48 rounded-lg border border-slate-200 bg-white py-1 shadow-lg dark:border-slate-700 dark:bg-slate-800">
          <button
            onClick={onViewDetails}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <Eye className="h-4 w-4" /> View Details
          </button>
          <button
            onClick={onChangeRole}
            disabled={isSelf}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            <Shield className="h-4 w-4" /> Change Role
          </button>
          <hr className="my-1 border-slate-200 dark:border-slate-700" />
          <button
            onClick={onDelete}
            disabled={isSelf}
            className="flex w-full items-center gap-2 px-3 py-2 text-sm text-danger-600 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40 dark:text-red-400 dark:hover:bg-red-950/30"
          >
            <Trash2 className="h-4 w-4" /> Delete
          </button>
        </div>
      )}
    </div>
  );
};

/* ─────────────────── User Detail Modal ─────────────────── */

const UserDetailModal = ({ user, onClose }) => {
  if (!user) return null;

  const fullName = user.role === 'company'
    ? user.companyName || `${user.firstName} ${user.lastName}`
    : `${user.firstName} ${user.lastName}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-xl bg-white p-6 shadow-xl dark:bg-slate-800">
        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="mb-4 flex items-center gap-4">
          {user.profileImage || user.companyLogo ? (
            <img
              src={user.profileImage || user.companyLogo}
              alt={fullName}
              className="h-14 w-14 rounded-full object-cover"
            />
          ) : (
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary-100 text-lg font-bold text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
              {getInitials(user.firstName, user.lastName)}
            </div>
          )}
          <div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white">{fullName}</h3>
            <p className="text-sm text-slate-500 dark:text-slate-400">{user.email}</p>
          </div>
        </div>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-700">
            <span className="text-slate-500 dark:text-slate-400">Role</span>
            <RoleBadge role={user.role} />
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-700">
            <span className="text-slate-500 dark:text-slate-400">Status</span>
            <span className={`font-medium ${user.isActive ? 'text-green-600' : 'text-red-500'}`}>
              {user.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>
          <div className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-700">
            <span className="text-slate-500 dark:text-slate-400">Joined</span>
            <span className="text-slate-700 dark:text-slate-300">
              {new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </span>
          </div>
          {user.role === 'company' && (
            <>
              <div className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-700">
                <span className="text-slate-500 dark:text-slate-400">Jobs Posted</span>
                <span className="font-medium text-slate-700 dark:text-slate-300">{user.jobCount ?? 0}</span>
              </div>
              {user.industry && (
                <div className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-700">
                  <span className="text-slate-500 dark:text-slate-400">Industry</span>
                  <span className="text-slate-700 dark:text-slate-300">{user.industry}</span>
                </div>
              )}
            </>
          )}
          {user.role === 'candidate' && (
            <div className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400">Applications</span>
              <span className="font-medium text-slate-700 dark:text-slate-300">{user.applicationCount ?? 0}</span>
            </div>
          )}
          {user.phone && (
            <div className="flex justify-between border-b border-slate-100 pb-2 dark:border-slate-700">
              <span className="text-slate-500 dark:text-slate-400">Phone</span>
              <span className="text-slate-700 dark:text-slate-300">{user.phone}</span>
            </div>
          )}
          {user.location && (
            <div className="flex justify-between">
              <span className="text-slate-500 dark:text-slate-400">Location</span>
              <span className="text-slate-700 dark:text-slate-300">{user.location}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

/* ─────────────────── Change Role Modal ─────────────────── */

const ChangeRoleModal = ({ user, onClose, onConfirm, isLoading }) => {
  const [selectedRole, setSelectedRole] = useState('');
  const roles = ['candidate', 'company', 'admin'].filter((r) => r !== user?.role);

  if (!user) return null;

  const fullName = user.role === 'company'
    ? user.companyName || `${user.firstName} ${user.lastName}`
    : `${user.firstName} ${user.lastName}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => !isLoading && onClose()} />
      <div className="relative z-10 w-full max-w-md rounded-xl bg-white p-6 shadow-xl dark:bg-slate-800">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute right-3 top-3 rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-100 disabled:opacity-40 dark:hover:bg-slate-700"
          aria-label="Close"
        >
          <X className="h-4 w-4" />
        </button>

        <h2 className="mb-1 text-lg font-semibold text-slate-900 dark:text-white">Change Role</h2>
        <p className="mb-4 text-sm text-slate-500 dark:text-slate-400">
          Change the role for <span className="font-medium text-slate-700 dark:text-slate-300">{fullName}</span>
        </p>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            Current Role
          </label>
          <RoleBadge role={user.role} />
        </div>

        <div className="mb-4">
          <label className="mb-2 block text-sm font-medium text-slate-700 dark:text-slate-300">
            New Role
          </label>
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none dark:border-slate-600 dark:bg-slate-700 dark:text-white"
          >
            <option value="">Select a role...</option>
            {roles.map((role) => (
              <option key={role} value={role}>
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </option>
            ))}
          </select>
        </div>

        {selectedRole === 'admin' && (
          <div className="mb-4 rounded-lg border border-amber-200 bg-amber-50 p-3 dark:border-amber-800 dark:bg-amber-950/30">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600 dark:text-amber-400" />
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Admin users have full platform access including user management, content moderation, and system settings.
              </p>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 disabled:opacity-40 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700"
          >
            Cancel
          </button>
          <button
            onClick={() => onConfirm(user._id, selectedRole)}
            disabled={!selectedRole || isLoading}
            className="rounded-lg bg-primary-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-primary-700 disabled:opacity-40"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Updating...
              </span>
            ) : (
              'Update Role'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/* ─────────────────── Mobile User Card ─────────────────── */

const MobileUserCard = ({ user, currentUserId, togglingId, onToggleStatus, onViewDetails, onChangeRole, onDelete }) => {
  const isSelf = user._id === currentUserId;
  const fullName = user.role === 'company'
    ? user.companyName || `${user.firstName} ${user.lastName}`
    : `${user.firstName} ${user.lastName}`;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
      <div className="mb-3 flex items-start justify-between">
        <div className="flex items-center gap-3">
          {user.profileImage || user.companyLogo ? (
            <img src={user.profileImage || user.companyLogo} alt={fullName} className="h-10 w-10 rounded-full object-cover" />
          ) : (
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 text-sm font-bold text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
              {getInitials(user.firstName, user.lastName)}
            </div>
          )}
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900 dark:text-white">{fullName}</p>
            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{user.email}</p>
          </div>
        </div>
        <ActionsDropdown
          onViewDetails={() => onViewDetails(user)}
          onChangeRole={() => onChangeRole(user)}
          onDelete={() => onDelete(user)}
          isSelf={isSelf}
        />
      </div>

      <div className="mb-3 flex flex-wrap items-center gap-2">
        <RoleBadge role={user.role} />
        <span className="text-xs text-slate-500 dark:text-slate-400">
          Joined {new Date(user.createdAt).toLocaleDateString()}
        </span>
      </div>

      <div className="mb-3 text-xs text-slate-500 dark:text-slate-400">
        {user.role === 'company' && (
          <span className="flex items-center gap-1">
            <Briefcase className="h-3 w-3" /> {user.jobCount ?? 0} jobs
          </span>
        )}
        {user.role === 'candidate' && (
          <span className="flex items-center gap-1">
            <FileText className="h-3 w-3" /> {user.applicationCount ?? 0} applications
          </span>
        )}
      </div>

      <div className="flex items-center justify-between border-t border-slate-100 pt-3 dark:border-slate-700">
        <ToggleSwitch
          checked={user.isActive}
          onChange={() => onToggleStatus(user)}
          disabled={isSelf || togglingId === user._id}
          label={user.isActive ? 'Active' : 'Inactive'}
        />
      </div>
    </div>
  );
};

/* ─────────────────── Main Page ─────────────────── */

const ManageUsersPage = () => {
  const { user: currentUser } = useAuth();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1, total: 0 });

  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 400);
  const [roleFilter, setRoleFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOption, setSortOption] = useState('newest');

  const [togglingId, setTogglingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [roleTarget, setRoleTarget] = useState(null);
  const [changingRole, setChangingRole] = useState(false);
  const [detailTarget, setDetailTarget] = useState(null);

  /* ── Fetch users ── */
  const fetchUsers = useCallback(async (page = 1) => {
    setLoading(true);
    try {
      const params = { page, limit: ITEMS_PER_PAGE, sort: sortOption };
      if (debouncedSearch) params.search = debouncedSearch;
      if (roleFilter !== 'all') params.role = roleFilter;
      if (statusFilter === 'active') params.isActive = 'true';
      if (statusFilter === 'inactive') params.isActive = 'false';

      const response = await adminService.getAllUsers(params);
      setUsers(response.data || []);
      setPagination({
        page: response.pagination?.page || page,
        totalPages: response.pagination?.totalPages || 1,
        total: response.pagination?.total || 0,
      });
    } catch (error) {
      toast.error(error.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, roleFilter, statusFilter, sortOption]);

  useEffect(() => {
    fetchUsers(1);
  }, [fetchUsers]);

  /* ── Toggle status (optimistic) ── */
  const handleToggleStatus = async (targetUser) => {
    if (targetUser._id === currentUser?._id) return;

    setTogglingId(targetUser._id);
    const newStatus = !targetUser.isActive;
    const original = [...users];

    setUsers((prev) =>
      prev.map((u) => (u._id === targetUser._id ? { ...u, isActive: newStatus } : u)),
    );

    try {
      await adminService.updateUserStatus(targetUser._id, { isActive: newStatus });
      if (!newStatus && targetUser.role === 'company') {
        toast.success('User deactivated. Their jobs are now inactive.');
      } else {
        toast.success(`User ${newStatus ? 'activated' : 'deactivated'} successfully`);
      }
    } catch (error) {
      setUsers(original);
      toast.error(error.message || 'Failed to update user status');
    } finally {
      setTogglingId(null);
    }
  };

  /* ── Change role ── */
  const handleChangeRole = async (userId, newRole) => {
    setChangingRole(true);
    try {
      await adminService.updateUserRole(userId, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u._id === userId ? { ...u, role: newRole } : u)),
      );
      toast.success('User role updated successfully');
      setRoleTarget(null);
    } catch (error) {
      toast.error(error.message || 'Failed to update role');
    } finally {
      setChangingRole(false);
    }
  };

  /* ── Delete user ── */
  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await adminService.deleteUser(deleteTarget._id);
      setUsers((prev) => prev.filter((u) => u._id !== deleteTarget._id));
      setPagination((prev) => ({ ...prev, total: prev.total - 1 }));
      toast.success('User and all related data deleted successfully');
      setDeleteTarget(null);
    } catch (error) {
      toast.error(error.message || 'Failed to delete user');
    } finally {
      setDeleting(false);
    }
  };

  const getDeleteWarning = (targetUser) => {
    if (!targetUser) return '';
    const parts = [`This will permanently delete ${targetUser.firstName} ${targetUser.lastName}'s account.`];
    if (targetUser.role === 'company') {
      parts.push(`All their jobs (${targetUser.jobCount ?? 0}) and associated applications will also be deleted.`);
    }
    if (targetUser.role === 'candidate') {
      parts.push(`All their applications (${targetUser.applicationCount ?? 0}) will also be deleted.`);
    }
    parts.push('This action cannot be undone.');
    return parts.join(' ');
  };

  return (
    <div className="space-y-6">
      {/* 1. Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
          Manage Users
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {pagination.total} total users
        </p>
      </div>

      {/* 2. Toolbar */}
      <div className="space-y-4">
        {/* Search + Sort */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex-1 sm:max-w-sm">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search by name, email, company..."
            />
          </div>
          <select
            value={sortOption}
            onChange={(e) => setSortOption(e.target.value)}
            className="rounded-lg border border-slate-300 px-3 py-2.5 text-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 focus:outline-none dark:border-slate-600 dark:bg-slate-800 dark:text-white"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* Role filter */}
        <div className="flex flex-wrap gap-4">
          <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800/50">
            {ROLE_TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setRoleFilter(key)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  roleFilter === key
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* Status filter */}
          <div className="flex gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800/50">
            {STATUS_TABS.map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                  statusFilter === key
                    ? 'bg-white text-slate-900 shadow-sm dark:bg-slate-700 dark:text-white'
                    : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Content */}
      {loading ? (
        <SkeletonTable rows={8} columns={7} />
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title="No users found"
          description={debouncedSearch ? `No users matching "${debouncedSearch}". Try a different search.` : 'No users match the current filters.'}
        />
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800 lg:block">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 dark:border-slate-700 dark:bg-slate-800/80">
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">User</th>
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Role</th>
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Status</th>
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Joined</th>
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Activity</th>
                  <th className="px-4 py-3 font-medium text-slate-600 dark:text-slate-400">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {users.map((u) => {
                  const isSelf = u._id === currentUser?._id;
                  const fullName = u.role === 'company'
                    ? u.companyName || `${u.firstName} ${u.lastName}`
                    : `${u.firstName} ${u.lastName}`;

                  return (
                    <tr key={u._id} className="transition-colors hover:bg-slate-50 dark:hover:bg-slate-750">
                      {/* User */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {u.profileImage || u.companyLogo ? (
                            <img src={u.profileImage || u.companyLogo} alt={fullName} className="h-9 w-9 rounded-full object-cover" />
                          ) : (
                            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-700 dark:bg-primary-900/30 dark:text-primary-400">
                              {getInitials(u.firstName, u.lastName)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-900 dark:text-white">
                              {fullName}
                              {isSelf && (
                                <span className="ml-1.5 text-xs text-slate-400">(You)</span>
                              )}
                            </p>
                            <p className="truncate text-xs text-slate-500 dark:text-slate-400">{u.email}</p>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-4 py-3">
                        <RoleBadge role={u.role} />
                      </td>

                      {/* Status */}
                      <td className="px-4 py-3">
                        <ToggleSwitch
                          checked={u.isActive}
                          onChange={() => handleToggleStatus(u)}
                          disabled={isSelf || togglingId === u._id}
                        />
                      </td>

                      {/* Joined */}
                      <td className="px-4 py-3 text-slate-500 dark:text-slate-400">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>

                      {/* Activity */}
                      <td className="px-4 py-3 text-slate-600 dark:text-slate-400">
                        {u.role === 'company' && (
                          <span className="inline-flex items-center gap-1">
                            <Briefcase className="h-3.5 w-3.5" /> {u.jobCount ?? 0} jobs
                          </span>
                        )}
                        {u.role === 'candidate' && (
                          <span className="inline-flex items-center gap-1">
                            <FileText className="h-3.5 w-3.5" /> {u.applicationCount ?? 0} apps
                          </span>
                        )}
                        {u.role === 'admin' && (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-4 py-3">
                        <ActionsDropdown
                          onViewDetails={() => setDetailTarget(u)}
                          onChangeRole={() => setRoleTarget(u)}
                          onDelete={() => setDeleteTarget(u)}
                          isSelf={isSelf}
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 lg:hidden">
            {users.map((u) => (
              <MobileUserCard
                key={u._id}
                user={u}
                currentUserId={currentUser?._id}
                togglingId={togglingId}
                onToggleStatus={handleToggleStatus}
                onViewDetails={setDetailTarget}
                onChangeRole={setRoleTarget}
                onDelete={setDeleteTarget}
              />
            ))}
          </div>

          {/* 5. Pagination */}
          {pagination.totalPages > 1 && (
            <Pagination
              currentPage={pagination.page}
              totalPages={pagination.totalPages}
              onPageChange={(page) => fetchUsers(page)}
              totalItems={pagination.total}
              itemsPerPage={ITEMS_PER_PAGE}
            />
          )}
        </>
      )}

      {/* User Detail Modal */}
      <UserDetailModal user={detailTarget} onClose={() => setDetailTarget(null)} />

      {/* Change Role Modal */}
      <ChangeRoleModal
        user={roleTarget}
        onClose={() => setRoleTarget(null)}
        onConfirm={handleChangeRole}
        isLoading={changingRole}
      />

      {/* Delete Confirmation */}
      <ConfirmModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title={`Delete "${deleteTarget?.firstName} ${deleteTarget?.lastName}"?`}
        message={getDeleteWarning(deleteTarget)}
        confirmText="Delete User"
        variant="danger"
        isLoading={deleting}
      />
    </div>
  );
};

export default ManageUsersPage;
