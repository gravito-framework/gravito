import React, { useEffect, useState } from 'react';
import { useAdmin } from '@gravito/admin-shell-react';
import { Shield, ShieldAlert, Plus, Edit2, Trash2, RefreshCw, X, Check } from 'lucide-react';

export function RoleList() {
  const { sdk } = useAdmin();
  const [roles, setRoles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // 彈窗狀態
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({ name: '', permissions: [] as string[] });

  // 預設可選權限清單 (真實環境應從 API 獲取)
  const availablePermissions = [
    { id: 'catalog.products.read', label: '讀取商品' },
    { id: 'catalog.products.edit', label: '編輯商品' },
    { id: 'commerce.orders.view', label: '查看訂單' },
    { id: 'commerce.orders.refund', label: '執行退款' },
    { id: 'marketing.coupons.manage', label: '管理優惠券' },
    { id: 'access.roles.manage', label: '管理角色權限' },
  ];

  const fetchRoles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await sdk.api.get<any[]>('/roles');
      setRoles(data);
    } catch (err: any) {
      setError(err.message || '無法獲取角色列表');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRole = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name) return;

    setIsSubmitting(true);
    try {
      await sdk.api.post('/roles', formData);
      await fetchRoles(); // 重新整理列表
      setIsModalOpen(false);
      setFormData({ name: '', permissions: [] });
    } catch (err: any) {
      alert(err.message || '建立失敗');
    } finally {
      setIsSubmitting(false);
    }
  };

  const togglePermission = (id: string) => {
    setFormData(prev => ({
      ...prev,
      permissions: prev.permissions.includes(id)
        ? prev.permissions.filter(p => p !== id)
        : [...prev.permissions, id]
    }));
  };

  useEffect(() => {
    fetchRoles();
  }, [sdk]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">角色權限管理</h1>
          <p className="text-slate-500">定義系統角色及其可執行的操作權限</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={fetchRoles}
            className="p-2 text-slate-500 hover:text-indigo-600 hover:bg-slate-100 rounded-lg transition-all"
          >
            <RefreshCw size={20} className={loading ? "animate-spin" : ""} />
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-semibold flex items-center gap-2 hover:bg-indigo-700 transition-colors shadow-sm"
          >
            <Plus size={18} />
            新增角色
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-xl flex items-center gap-3">
          <ShieldAlert size={20} />
          <p className="text-sm font-medium">{error}</p>
        </div>
      )}

      {/* 角色列表表格 */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slate-50 border-b border-slate-200">
            <tr>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">角色名稱</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">權限概覽</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">人員數</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              [1, 2, 3].map(i => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={4} className="px-6 py-8 bg-white" />
                </tr>
              ))
            ) : roles.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-slate-400 italic">
                  目前尚無定義角色
                </td>
              </tr>
            ) : (
              roles.map(role => (
                <tr key={role.id} className="hover:bg-slate-50/50 transition-colors text-sm">
                  <td className="px-6 py-4 font-semibold text-slate-900">
                    <div className="flex items-center gap-3">
                      <Shield size={18} className={role.permissions.includes('*') ? "text-amber-500" : "text-indigo-500"} />
                      {role.name}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {role.permissions.length === 0 ? '無權限' : `${role.permissions.length} 項權限`}
                  </td>
                  <td className="px-6 py-4 text-slate-600">{role.userCount || 0} 位</td>
                  <td className="px-6 py-4 text-right">
                    <button className="p-2 text-slate-400 hover:text-indigo-600 rounded-lg transition-all"><Edit2 size={16} /></button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 新增角色 Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="p-6 border-b border-slate-100 flex items-center justify-between">
              <h2 className="text-xl font-bold text-slate-900">新增角色</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleCreateRole}>
              <div className="p-6 space-y-6">
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-2">角色名稱</label>
                  <input 
                    type="text" 
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                    placeholder="例如：初級客服、倉庫管理員"
                    value={formData.name}
                    onChange={e => setFormData(f => ({ ...f, name: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-slate-700 mb-3">權限配置</label>
                  <div className="grid grid-cols-2 gap-3">
                    {availablePermissions.map(p => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => togglePermission(p.id)}
                        className={cn(
                          "flex items-center justify-between px-4 py-3 rounded-xl border transition-all text-left",
                          formData.permissions.includes(p.id) 
                            ? "border-indigo-600 bg-indigo-50 text-indigo-700 ring-1 ring-indigo-600" 
                            : "border-slate-200 hover:border-slate-300 text-slate-600"
                        )}
                      >
                        <span className="text-sm font-medium">{p.label}</span>
                        {formData.permissions.includes(p.id) && <Check size={16} />}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
              <div className="p-6 bg-slate-50 flex gap-3">
                <button 
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-slate-200 font-semibold text-slate-600 hover:bg-white transition-all"
                >
                  取消
                </button>
                <button 
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-[2] bg-indigo-600 text-white px-4 py-2.5 rounded-xl font-bold hover:bg-indigo-700 disabled:opacity-50 transition-all shadow-lg shadow-indigo-100"
                >
                  {isSubmitting ? "建立中..." : "確認建立"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}


