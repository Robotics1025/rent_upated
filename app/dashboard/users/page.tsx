import DashboardLayout from '@/app/components/DashboardLayout'
import { Users, Plus, Search, Mail, Phone, Shield, Edit, Trash2, MoreVertical } from 'lucide-react'

export default function UsersManagementPage() {
  const users = [
    { id: '1', name: 'John Doe', email: 'john@example.com', phone: '+256 700 123 456', role: 'ADMIN', status: 'ACTIVE', properties: 5 },
    { id: '2', name: 'Jane Smith', email: 'jane@example.com', phone: '+256 700 234 567', role: 'ADMIN', status: 'ACTIVE', properties: 3 },
    { id: '3', name: 'Mike Johnson', email: 'mike@example.com', phone: '+256 700 345 678', role: 'TENANT', status: 'ACTIVE', properties: 0 },
    { id: '4', name: 'Sarah Williams', email: 'sarah@example.com', phone: '+256 700 456 789', role: 'TENANT', status: 'ACTIVE', properties: 0 },
    { id: '5', name: 'David Brown', email: 'david@example.com', phone: '+256 700 567 890', role: 'ADMIN', status: 'SUSPENDED', properties: 2 },
  ]

  const stats = [
    { label: 'Total Users', value: '124', color: 'bg-blue-50 text-blue-600' },
    { label: 'Admins', value: '12', color: 'bg-purple-50 text-purple-600' },
    { label: 'Tenants', value: '98', color: 'bg-emerald-50 text-emerald-600' },
    { label: 'Suspended', value: '3', color: 'bg-red-50 text-red-600' },
  ]

  return (
    <DashboardLayout userRole="ADMIN">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
            <p className="text-gray-600 mt-1">Manage all system users and their permissions</p>
          </div>
          <button className="flex items-center gap-2 bg-emerald-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-emerald-700 transition">
            <Plus className="h-5 w-5" />
            Add New User
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-white rounded-lg shadow-sm border border-gray-200 p-5">
              <div className="text-sm text-gray-600 mb-1">{stat.label}</div>
              <div className={`text-3xl font-bold ${stat.color.split(' ')[1]}`}>{stat.value}</div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search users by name, email, or phone..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none"
              />
            </div>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none">
              <option value="">All Roles</option>
              <option value="ADMIN">Admins</option>
              <option value="TENANT">Tenants</option>
              <option value="MEMBER">Members</option>
            </select>
            <select className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none">
              <option value="">All Status</option>
              <option value="ACTIVE">Active</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Properties</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                          <Users className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">{user.name}</div>
                          <div className="text-sm text-gray-500 flex items-center gap-1">
                            <Mail className="h-3 w-3" />
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 flex items-center gap-1">
                        <Phone className="h-4 w-4 text-gray-400" />
                        {user.phone}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                        user.role === 'ADMIN'
                          ? 'bg-purple-100 text-purple-800'
                          : 'bg-blue-100 text-blue-800'
                      }`}>
                        <Shield className="h-3 w-3" />
                        {user.role}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.properties} properties
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                        user.status === 'ACTIVE'
                          ? 'bg-green-100 text-green-800'
                          : 'bg-red-100 text-red-800'
                      }`}>
                        {user.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex items-center gap-2">
                        <button className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button className="p-2 text-gray-600 hover:bg-gray-50 rounded-lg transition">
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Showing <span className="font-medium">1-5</span> of <span className="font-medium">124</span> users
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
                Previous
              </button>
              <button className="px-3 py-1 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium">
                1
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
                2
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
                3
              </button>
              <button className="px-3 py-1 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm font-medium">
                Next
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  )
}
