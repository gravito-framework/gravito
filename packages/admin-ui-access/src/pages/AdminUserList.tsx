import { useAdmin } from '@gravito/admin-shell-react'
import { Edit2, Power, PowerOff, Search, Shield, UserPlus, Users } from 'lucide-react'
import React, { useCallback, useEffect, useState } from 'react'

export function AdminUserList() {
  const { sdk } = useAdmin()
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      const data = await sdk.api.get<any[]>('/users')
      setUsers(data)
    } catch (err) {
      console.error('Failed to fetch users', err)
    } finally {
      setLoading(false)
    }
  }, [sdk])

  const toggleStatus = async (user: any) => {
    try {
      await sdk.api.patch(`/users/${user.id}`, { isActive: !user.isActive })
      fetchUsers()
    } catch (err) {
      alert('操作失敗')
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">管理員帳號</h1>
          <p className="text-slate-500">管理具備後台存取權限的人員帳號</p>
        </div>
        <button
          type="button"
          className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm"
        >
          <UserPlus size={18} />
          邀請管理員
        </button>
      </div>

      {/* 搜尋區 */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input
            type="text"
            placeholder="搜尋姓名或 Email..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
        <select className="px-4 py-2 rounded-lg border border-slate-200 outline-none">
          <option>所有角色</option>
          <option>超級管理員</option>
          <option>商城營運</option>
        </select>
      </div>

      {/* 使用者表格 */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                管理員資訊
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                角色
              </th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">
                狀態
              </th>
              <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">
                操作
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              [1, 2].map((i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={4} className="px-6 py-8" />
                </tr>
              ))
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400">
                  目前尚無管理員帳號
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-bold">
                        {user.username[0].toUpperCase()}
                      </div>
                      <div>
                        <div className="font-bold text-slate-900">{user.username}</div>
                        <div className="text-xs text-slate-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {user.roles.map((r: string) => (
                        <span
                          key={r}
                          className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded border border-amber-100 flex items-center gap-1"
                        >
                          <Shield size={10} />
                          {r}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.isActive
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      <span
                        className={`w-1.5 h-1.5 rounded-full ${user.isActive ? 'bg-emerald-500' : 'bg-slate-400'}`}
                      />
                      {user.isActive ? '正常' : '已停權'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => toggleStatus(user)}
                        className={`p-2 rounded-lg transition-all ${
                          user.isActive
                            ? 'text-slate-400 hover:text-rose-600 hover:bg-rose-50'
                            : 'text-slate-400 hover:text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={user.isActive ? '停權' : '啟用'}
                      >
                        {user.isActive ? <PowerOff size={16} /> : <Power size={16} />}
                      </button>
                      <button
                        type="button"
                        className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                      >
                        <Edit2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
