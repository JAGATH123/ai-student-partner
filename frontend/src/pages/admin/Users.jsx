import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminAPI } from '../../lib/api';
import Navbar from '../../components/Navbar';
import { Link } from 'react-router-dom';
import { Search, Eye, ToggleLeft, ToggleRight } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatDate } from '../../lib/utils';

export default function Users() {
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['admin-users', page, search],
    queryFn: () => adminAPI.getUsers({ page, limit: 10, search })
  });

  const toggleStatusMutation = useMutation({
    mutationFn: adminAPI.toggleUserStatus,
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-users']);
      toast.success('User status updated');
    }
  });

  if (isLoading) {
    return (
      <>
        <Navbar />
        <div className="pt-20 px-4 max-w-7xl mx-auto">
          <div className="text-center py-20">
            <div className="w-16 h-16 border-4 border-cosmic-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="pt-20 px-4 max-w-7xl mx-auto pb-20">
        <h1 className="text-4xl font-bold mb-8 bg-gradient-to-r from-neon-blue to-neon-purple bg-clip-text text-transparent">
          User Management
        </h1>

        {/* Search */}
        <div className="glass-card p-4 mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              className="input-field pl-11"
              placeholder="Search users by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Users Table */}
        <div className="glass-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Joined</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Last Login</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {data?.data?.users.map((user) => (
                  <tr key={user._id} className="hover:bg-white/5">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cosmic-500 to-cosmic-700 flex items-center justify-center mr-3">
                          {user.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-gray-400 capitalize">{user.role}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm">{user.email}</td>
                    <td className="px-6 py-4 text-sm">{formatDate(user.createdAt)}</td>
                    <td className="px-6 py-4 text-sm">{formatDate(user.lastLogin)}</td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        user.isActive ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
                      }`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-2">
                        <Link to={`/admin/users/${user._id}`}>
                          <button className="p-2 hover:bg-white/10 rounded-lg" title="View Details">
                            <Eye className="w-4 h-4" />
                          </button>
                        </Link>
                        <button
                          onClick={() => toggleStatusMutation.mutate(user._id)}
                          className="p-2 hover:bg-white/10 rounded-lg"
                          title={user.isActive ? 'Deactivate' : 'Activate'}
                        >
                          {user.isActive ? (
                            <ToggleRight className="w-4 h-4 text-green-400" />
                          ) : (
                            <ToggleLeft className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {data?.data && data.data.totalPages > 1 && (
            <div className="flex justify-between items-center p-4 border-t border-white/10">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="btn-secondary disabled:opacity-50"
              >
                Previous
              </button>
              <span className="text-sm text-gray-400">
                Page {page} of {data.data.totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(data.data.totalPages, p + 1))}
                disabled={page === data.data.totalPages}
                className="btn-secondary disabled:opacity-50"
              >
                Next
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
