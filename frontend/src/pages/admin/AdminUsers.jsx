import { useEffect, useState } from 'react';
import { MdEdit, MdDelete, MdCheck, MdBlock } from 'react-icons/md';
import api from '../../services/api';
import toast from 'react-hot-toast';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = async () => {
    try {
      const res = await api.get('/admin/users');
      setUsers(res.data.users || []);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleToggleRole = async (user) => {
    const nextRole = user.role === 'admin' ? 'user' : 'admin';
    try {
      await api.put(`/admin/users/${user._id}`, { role: nextRole });
      toast.success('User role updated');
      fetchUsers();
    } catch (err) {
      toast.error('Failed to update role');
    }
  };

  const handleToggleStatus = async (user) => {
    const nextActive = !user.isActive;
    try {
      await api.put(`/admin/users/${user._id}`, { isActive: nextActive });
      toast.success(nextActive ? 'User account activated' : 'User account deactivated');
      fetchUsers();
    } catch (err) {
      toast.error('Status toggle failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete user completely? This action is irreversible.')) return;
    try {
      await api.delete(`/admin/users/${id}`);
      toast.success('User deleted completely');
      fetchUsers();
    } catch (err) {
      toast.error('Deletion failed');
    }
  };

  return (
    <div className="space-y-8 min-h-screen pb-12 animate-fade-in">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 dark:text-white font-display">Manage Users</h1>
        <p className="text-sm text-slate-500 dark:text-dark-muted font-medium mt-1">Review user profiles, toggle administrator access privileges, or block accounts.</p>
      </div>

      {isLoading ? (
        <div className="h-40 skeleton animate-pulse" />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="table-cq">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody className="text-xs font-semibold text-slate-650 dark:text-slate-350">
                {users.map((u) => (
                  <tr key={u._id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <img src={u.avatarUrl || `https://ui-avatars.com/api/?name=${u.name}&background=0f766e&color=fff`} alt={u.name} className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <p className="font-bold text-slate-850 dark:text-white">{u.name}</p>
                          <p className="text-2xs text-slate-400 font-medium">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="capitalize">{u.role}</td>
                    <td>
                      <span className={`badge ${u.isActive ? 'badge-success' : 'badge-error'}`}>
                        {u.isActive ? 'Active' : 'Blocked'}
                      </span>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <button onClick={() => handleToggleRole(u)} className="btn-secondary btn-sm px-2 py-1 text-2xs" title="Toggle role">
                          Make {u.role === 'admin' ? 'User' : 'Admin'}
                        </button>
                        <button onClick={() => handleToggleStatus(u)} className={`p-1.5 rounded text-white ${u.isActive ? 'bg-amber-500' : 'bg-green-500'}`} title={u.isActive ? 'Block' : 'Activate'}>
                          {u.isActive ? <MdBlock /> : <MdCheck />}
                        </button>
                        <button onClick={() => handleDelete(u._id)} className="p-1.5 bg-red-500 text-white rounded hover:bg-red-600" title="Delete">
                          <MdDelete />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
