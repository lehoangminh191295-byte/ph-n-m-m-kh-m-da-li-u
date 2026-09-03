import React, { useState } from 'react';
import { 
  Package, 
  Plus, 
  Search, 
  AlertTriangle, 
  ThermometerSnowflake, 
  Pill, 
  Syringe, 
  Edit3, 
  Trash2, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Check, 
  X, 
  Calendar, 
  Filter, 
  Printer, 
  Download,
  Clock,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { InventoryItem, InventoryCategory } from '../types';

interface InventoryViewProps {
  inventory: InventoryItem[];
  onSaveItem: (item: InventoryItem) => void;
  onDeleteItem: (itemId: string) => void;
  onAdjustStock: (itemId: string, delta: number, reason: string) => void;
}

const CATEGORY_MAP: Record<InventoryCategory, { label: string; icon: string; badgeClass: string }> = {
  TOPICAL_MEDICATION: { label: 'Thuốc bôi ngoài da', icon: '🧴', badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  ORAL_MEDICATION: { label: 'Thuốc uống', icon: '💊', badgeClass: 'bg-blue-50 text-blue-800 border-blue-200' },
  BOTOX_TOXIN: { label: 'Botox & Toxin', icon: '💉', badgeClass: 'bg-purple-50 text-purple-800 border-purple-200' },
  FILLER_HA: { label: 'Filler Hyaluronic Acid', icon: '✨', badgeClass: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  MESO_SOLUTION: { label: 'Meso & Serum tiêm', icon: '💧', badgeClass: 'bg-cyan-50 text-cyan-800 border-cyan-200' },
  CHEMICAL_PEEL: { label: 'Dung dịch Peel', icon: '🧪', badgeClass: 'bg-orange-50 text-orange-800 border-orange-200' },
  PROCEDURE_CONSUMABLE: { label: 'Vật tư thủ thuật & Laser', icon: '🔬', badgeClass: 'bg-slate-100 text-slate-800 border-slate-300' },
  DERMO_COSMETIC: { label: 'Dược mỹ phẩm phục hồi', icon: '🌿', badgeClass: 'bg-teal-50 text-teal-800 border-teal-200' },
};

export const InventoryView: React.FC<InventoryViewProps> = ({
  inventory,
  onSaveItem,
  onDeleteItem,
  onAdjustStock,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [onlyLowStock, setOnlyLowStock] = useState(false);

  // Modal states
  const [isAddEditModalOpen, setIsAddEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<InventoryItem | null>(null);

  // Quick adjust stock modal
  const [adjustingItem, setAdjustingItem] = useState<InventoryItem | null>(null);
  const [adjustQty, setAdjustQty] = useState<number>(1);
  const [adjustType, setAdjustType] = useState<'IMPORT' | 'EXPORT'>('IMPORT');
  const [adjustReason, setAdjustReason] = useState<string>('Nhập hàng mới từ nhà phân phối');

  // Form states for Add/Edit
  const [formData, setFormData] = useState<Partial<InventoryItem>>({
    code: '',
    name: '',
    activeIngredient: '',
    category: 'TOPICAL_MEDICATION',
    unit: 'Tuýp',
    stockQuantity: 10,
    minThreshold: 5,
    batchNumber: '',
    expiryDate: '',
    unitPrice: 100000,
    manufacturer: '',
    storageConditions: 'Nhiệt độ phòng < 30°C',
    notes: '',
  });

  // KPI counts
  const totalItems = inventory.length;
  const lowStockItems = inventory.filter((i) => i.stockQuantity <= i.minThreshold && i.stockQuantity > 0).length;
  const outOfStockItems = inventory.filter((i) => i.stockQuantity === 0).length;
  const coldStorageItems = inventory.filter((i) => i.storageConditions?.includes('2°C') || i.storageConditions?.includes('Tủ lạnh')).length;

  // Filtered inventory list
  const filteredInventory = inventory.filter((item) => {
    const matchesCat = selectedCategory === 'ALL' || item.category === selectedCategory;
    const matchesLowStock = !onlyLowStock || item.stockQuantity <= item.minThreshold;
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      item.name.toLowerCase().includes(term) ||
      item.activeIngredient.toLowerCase().includes(term) ||
      item.code.toLowerCase().includes(term) ||
      (item.manufacturer && item.manufacturer.toLowerCase().includes(term));

    return matchesCat && matchesLowStock && matchesSearch;
  });

  const handleOpenAddModal = () => {
    setEditingItem(null);
    setFormData({
      code: `KHO-${Date.now().toString().slice(-4)}`,
      name: '',
      activeIngredient: '',
      category: 'TOPICAL_MEDICATION',
      unit: 'Tuýp',
      stockQuantity: 20,
      minThreshold: 5,
      batchNumber: '',
      expiryDate: '2027-12-31',
      unitPrice: 150000,
      manufacturer: '',
      storageConditions: 'Nhiệt độ phòng < 30°C',
      notes: '',
    });
    setIsAddEditModalOpen(true);
  };

  const handleOpenEditModal = (item: InventoryItem) => {
    setEditingItem(item);
    setFormData({ ...item });
    setIsAddEditModalOpen(true);
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name?.trim() || !formData.activeIngredient?.trim()) return;

    const finalItem: InventoryItem = {
      id: editingItem ? editingItem.id : `inv-${Date.now()}`,
      code: formData.code?.trim() || `KHO-${Date.now().toString().slice(-4)}`,
      name: formData.name.trim(),
      activeIngredient: formData.activeIngredient.trim(),
      category: formData.category as InventoryCategory,
      unit: formData.unit?.trim() || 'Hộp',
      stockQuantity: Number(formData.stockQuantity) || 0,
      minThreshold: Number(formData.minThreshold) || 1,
      batchNumber: formData.batchNumber?.trim() || undefined,
      expiryDate: formData.expiryDate || undefined,
      unitPrice: Number(formData.unitPrice) || 0,
      manufacturer: formData.manufacturer?.trim() || undefined,
      storageConditions: formData.storageConditions?.trim() || 'Nhiệt độ phòng',
      notes: formData.notes?.trim() || undefined,
      updatedAt: new Date().toISOString(),
    };

    onSaveItem(finalItem);
    setIsAddEditModalOpen(false);
  };

  const handleConfirmAdjustStock = () => {
    if (!adjustingItem || adjustQty <= 0) return;
    const delta = adjustType === 'IMPORT' ? adjustQty : -adjustQty;
    onAdjustStock(adjustingItem.id, delta, adjustReason);
    setAdjustingItem(null);
  };

  return (
    <div className="flex-1 overflow-y-auto bg-slate-50 p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header & Main Call to Action */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-black text-slate-900 flex items-center gap-2.5">
            <span>📦</span> Quản Lý Kho Thuốc & Dược Chất Da Liễu
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Kiểm soát danh mục dược chất, số lượng tồn kho, thuốc kê đơn, Botox, Filler, Meso và cảnh báo hết hàng
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-white hover:bg-slate-100 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition shadow-2xs"
          >
            <Printer className="w-3.5 h-3.5" />
            In Phiếu Kiểm Kê
          </button>
          <button
            onClick={handleOpenAddModal}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs sm:text-sm font-bold shadow-sm transition"
          >
            <Plus className="w-4 h-4" />
            + Thêm Thuốc / Dược Chất Mới
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 text-xs font-semibold block">Tổng Số Mặt Hàng</span>
            <span className="text-xl sm:text-2xl font-black text-slate-900 mt-0.5 block">{totalItems}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-lg">
            📦
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 text-xs font-semibold block">Cảnh Báo Sắp Hết</span>
            <span className="text-xl sm:text-2xl font-black text-amber-600 mt-0.5 block">{lowStockItems}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center text-lg">
            ⚠️
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 text-xs font-semibold block">Đã Hết Hàng (Out)</span>
            <span className="text-xl sm:text-2xl font-black text-rose-600 mt-0.5 block">{outOfStockItems}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center text-lg">
            🚫
          </div>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-slate-500 text-xs font-semibold block">Bảo Quản Lạnh (2-8°C)</span>
            <span className="text-xl sm:text-2xl font-black text-cyan-600 mt-0.5 block">{coldStorageItems}</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center text-lg">
            ❄️
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-96">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Tìm theo tên thuốc, dược chất chính, hãng sản xuất..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full text-xs pl-9 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-3 self-end sm:self-center">
            <label className="flex items-center gap-1.5 cursor-pointer text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={onlyLowStock}
                onChange={(e) => setOnlyLowStock(e.target.checked)}
                className="rounded text-amber-600 focus:ring-amber-500"
              />
              <span className="text-amber-800">Chỉ xem thuốc sắp hết kho</span>
            </label>

            <span className="text-xs text-slate-500 font-medium">
              (<strong>{filteredInventory.length}</strong> / {inventory.length} loại)
            </span>
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
              selectedCategory === 'ALL'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Tất cả danh mục
          </button>
          {Object.entries(CATEGORY_MAP).map(([key, info]) => (
            <button
              key={key}
              onClick={() => setSelectedCategory(key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                selectedCategory === key
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              <span>{info.icon}</span>
              <span>{info.label}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                selectedCategory === key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
              }`}>
                {inventory.filter(i => i.category === key).length}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-100/90 text-slate-700 uppercase font-semibold text-[11px] border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Tên Thuốc & Biệt Dược</th>
                <th className="py-3 px-4">Dược Chất / Hoạt Chất Chính</th>
                <th className="py-3 px-3">Phân Loại</th>
                <th className="py-3 px-3 text-center">Tồn Kho</th>
                <th className="py-3 px-3">Hạn Dùng / Lô</th>
                <th className="py-3 px-3">Bảo Quản</th>
                <th className="py-3 px-3 text-right">Đơn Giá</th>
                <th className="py-3 px-4 text-center">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredInventory.map((item) => {
                const isOutOfStock = item.stockQuantity === 0;
                const isLowStock = item.stockQuantity <= item.minThreshold && item.stockQuantity > 0;
                const catInfo = CATEGORY_MAP[item.category] || { label: item.category, icon: '📦', badgeClass: 'bg-slate-100 text-slate-700' };

                return (
                  <tr key={item.id} className="hover:bg-slate-50/70 transition">
                    {/* Name & Code */}
                    <td className="py-3 px-4">
                      <div className="font-bold text-slate-900 text-sm">{item.name}</div>
                      <div className="text-[11px] font-mono text-slate-400 mt-0.5 flex items-center gap-1.5">
                        <span>{item.code}</span>
                        {item.manufacturer && <span>• {item.manufacturer}</span>}
                      </div>
                    </td>

                    {/* Active Ingredient */}
                    <td className="py-3 px-4">
                      <div className="font-semibold text-blue-900 bg-blue-50/80 px-2 py-1 rounded-md border border-blue-200/60 inline-block">
                        {item.activeIngredient}
                      </div>
                      {item.notes && (
                        <div className="text-[10px] text-slate-500 italic mt-1 line-clamp-1">{item.notes}</div>
                      )}
                    </td>

                    {/* Category */}
                    <td className="py-3 px-3">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${catInfo.badgeClass} inline-flex items-center gap-1 whitespace-nowrap`}>
                        <span>{catInfo.icon}</span>
                        <span>{catInfo.label}</span>
                      </span>
                    </td>

                    {/* Stock status */}
                    <td className="py-3 px-3 text-center">
                      <div className="inline-flex flex-col items-center">
                        <span className={`px-2.5 py-1 rounded-lg font-mono font-bold text-xs ${
                          isOutOfStock
                            ? 'bg-rose-100 text-rose-800 border border-rose-300'
                            : isLowStock
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        }`}>
                          {item.stockQuantity} {item.unit}
                        </span>
                        <span className="text-[10px] text-slate-400 mt-0.5 font-mono">
                          (Định mức: {item.minThreshold})
                        </span>
                      </div>
                    </td>

                    {/* Expiry Date & Batch */}
                    <td className="py-3 px-3">
                      <div className="font-mono text-slate-800 font-semibold">{item.expiryDate || 'N/A'}</div>
                      {item.batchNumber && (
                        <div className="text-[10px] text-slate-400 font-mono">Lô: {item.batchNumber}</div>
                      )}
                    </td>

                    {/* Storage */}
                    <td className="py-3 px-3">
                      <span className={`text-[11px] font-medium flex items-center gap-1 ${
                        item.storageConditions?.includes('2°C') || item.storageConditions?.includes('Tủ lạnh')
                          ? 'text-cyan-800 font-semibold'
                          : 'text-slate-600'
                      }`}>
                        {item.storageConditions?.includes('2°C') || item.storageConditions?.includes('Tủ lạnh') ? '❄️ ' : ''}
                        {item.storageConditions || 'Nhiệt độ phòng'}
                      </span>
                    </td>

                    {/* Unit Price */}
                    <td className="py-3 px-3 text-right font-mono font-bold text-slate-900 whitespace-nowrap">
                      {item.unitPrice ? item.unitPrice.toLocaleString('vi-VN') + ' đ' : 'Liên hệ'}
                    </td>

                    {/* Actions */}
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {/* Quick stock adjustment button */}
                        <button
                          onClick={() => {
                            setAdjustingItem(item);
                            setAdjustType('IMPORT');
                            setAdjustQty(10);
                            setAdjustReason('Nhập bổ sung kho phòng khám');
                          }}
                          className="px-2 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-lg text-[11px] font-bold transition flex items-center gap-0.5"
                          title="Nhập thêm hàng"
                        >
                          <ArrowDownLeft className="w-3 h-3" />
                          +Nhập
                        </button>

                        <button
                          onClick={() => {
                            setAdjustingItem(item);
                            setAdjustType('EXPORT');
                            setAdjustQty(1);
                            setAdjustReason('Xuất sử dụng cho ca điều trị / kê đơn');
                          }}
                          className="px-2 py-1 bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 rounded-lg text-[11px] font-bold transition flex items-center gap-0.5"
                          title="Xuất kho thủ công"
                        >
                          <ArrowUpRight className="w-3 h-3" />
                          -Xuất
                        </button>

                        <button
                          onClick={() => handleOpenEditModal(item)}
                          className="p-1.5 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                          title="Sửa thông tin"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          onClick={() => {
                            if (confirm(`Xác nhận xóa thuốc "${item.name}" khỏi danh mục kho?`)) {
                              onDeleteItem(item.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition"
                          title="Xóa khỏi kho"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Adjust Stock Modal */}
      {adjustingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md p-5 space-y-4 animate-in fade-in">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <span>📦</span> Điều Chỉnh Số Lượng Tồn Kho
              </h3>
              <button
                onClick={() => setAdjustingItem(null)}
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <div className="p-3 bg-slate-50 rounded-xl text-xs space-y-1 border border-slate-200">
              <div className="font-bold text-slate-900 text-sm">{adjustingItem.name}</div>
              <div className="text-blue-700 font-semibold">{adjustingItem.activeIngredient}</div>
              <div className="text-slate-500">
                Tồn hiện tại: <strong className="font-mono text-slate-900 text-sm">{adjustingItem.stockQuantity} {adjustingItem.unit}</strong>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustType('IMPORT')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    adjustType === 'IMPORT'
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <ArrowDownLeft className="w-3.5 h-3.5" />
                  + Nhập Kho Thêm
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustType('EXPORT')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                    adjustType === 'EXPORT'
                      ? 'bg-amber-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  - Xuất Sử Dụng
                </button>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Số lượng ({adjustingItem.unit}):
                </label>
                <input
                  type="number"
                  min="1"
                  value={adjustQty}
                  onChange={(e) => setAdjustQty(Math.max(1, Number(e.target.value)))}
                  className="w-full text-sm border border-slate-300 rounded-xl px-3 py-2 font-mono font-bold text-center focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Lý do điều chỉnh / Ghi chú kiểm kho:
                </label>
                <input
                  type="text"
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  placeholder="Ví dụ: Nhập hàng nhà thuốc, Xuất làm thủ thuật Botox..."
                  className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAdjustingItem(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleConfirmAdjustStock}
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs"
              >
                Xác Nhận Cập Nhật
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add / Edit Medication Item Modal */}
      {isAddEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-200 w-full max-w-2xl my-auto overflow-hidden animate-in fade-in">
            <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-base font-bold flex items-center gap-2">
                <span>{editingItem ? '✏️' : '➕'}</span>
                {editingItem ? 'Chỉnh Sửa Dược Chất & Thuốc Kho' : 'Thêm Thuốc / Dược Chất Mới Vào Kho'}
              </h3>
              <button
                onClick={() => setIsAddEditModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveForm} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Tên thuốc / Biệt dược thương mại: <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.name || ''}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Ví dụ: Klenzit-C Gel, Botox Allergan 100U, Juvederm Ultra Plus XC..."
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Mã quản lý:
                  </label>
                  <input
                    type="text"
                    value={formData.code || ''}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder="MED-01..."
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Dược chất / Hoạt chất chính (Active Ingredients): <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.activeIngredient || ''}
                  onChange={(e) => setFormData({ ...formData, activeIngredient: e.target.value })}
                  placeholder="Ví dụ: Botulinum Toxin Type A, Adapalene 0.1% + Clindamycin 1%, Acid Fusidic 2%..."
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 font-bold text-blue-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Phân loại danh mục:
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as InventoryCategory })}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white font-medium"
                  >
                    {Object.entries(CATEGORY_MAP).map(([k, v]) => (
                      <option key={k} value={k}>{v.icon} {v.label}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Quy cách / Đơn vị tính:
                  </label>
                  <input
                    type="text"
                    value={formData.unit || ''}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    placeholder="Tuýp, Hộp, Lọ 100U, Ống 1ml, Viên..."
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 p-3 rounded-xl border border-slate-200">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Số lượng tồn hiện tại:
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={formData.stockQuantity || 0}
                    onChange={(e) => setFormData({ ...formData, stockQuantity: Number(e.target.value) })}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 font-mono font-bold text-blue-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Định mức cảnh báo hết:
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={formData.minThreshold || 5}
                    onChange={(e) => setFormData({ ...formData, minThreshold: Number(e.target.value) })}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 font-mono font-bold text-amber-800"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Đơn giá bán / Niêm yết:
                  </label>
                  <input
                    type="number"
                    step="1000"
                    value={formData.unitPrice || 0}
                    onChange={(e) => setFormData({ ...formData, unitPrice: Number(e.target.value) })}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hạn sử dụng:
                  </label>
                  <input
                    type="date"
                    value={formData.expiryDate || ''}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Số lô sản xuất:
                  </label>
                  <input
                    type="text"
                    value={formData.batchNumber || ''}
                    onChange={(e) => setFormData({ ...formData, batchNumber: e.target.value })}
                    placeholder="Lô SX..."
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Hãng sản xuất / Xuất xứ:
                  </label>
                  <input
                    type="text"
                    value={formData.manufacturer || ''}
                    onChange={(e) => setFormData({ ...formData, manufacturer: e.target.value })}
                    placeholder="Allergan, Galderma, Glenmark..."
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Điều kiện bảo quản:
                  </label>
                  <select
                    value={formData.storageConditions}
                    onChange={(e) => setFormData({ ...formData, storageConditions: e.target.value })}
                    className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2 bg-white"
                  >
                    <option value="Nhiệt độ phòng < 30°C, tránh ánh sáng">Nhiệt độ phòng &lt; 30°C, tránh ánh sáng</option>
                    <option value="Tủ lạnh chuyên dụng 2°C - 8°C (Cold chain)">❄️ Tủ lạnh chuyên dụng 2°C - 8°C (Cold chain)</option>
                    <option value="Nhiệt độ phòng mát < 25°C">Nhiệt độ phòng mát &lt; 25°C</option>
                    <option value="Đóng gói kín vô trùng">Bao bì kín vô trùng</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Chỉ định / Ghi chú lâm sàng:
                </label>
                <textarea
                  rows={2}
                  value={formData.notes || ''}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="Chỉ định chính, lưu ý dị ứng hoặc chống chỉ định..."
                  className="w-full text-xs border border-slate-300 rounded-lg px-3 py-2"
                />
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsAddEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs"
                >
                  {editingItem ? 'Lưu Cập Nhật' : 'Thêm Vào Kho Thuốc'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
