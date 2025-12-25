import React, { useState, useEffect } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { SuccessModal } from "../../components/ui/SuccessModal";
import {
  Search,
  Plus,
  AlertTriangle,
  ArrowDownToLine,
  MoreHorizontal,
  Trash,
  Edit,
  PackageCheck,
} from "lucide-react";
// IMPORT DATA PROVIDER
import { getSharedInventory } from "../../utils/dataProvider";

export const InventoryPage: React.FC = () => {
  // KHỞI TẠO TỪ DATA PROVIDER
  const [items, setItems] = useState<any[]>(getSharedInventory);
  const [term, setTerm] = useState("");
  const [activeTab, setActiveTab] = useState("Tất cả");

  // State Modal...
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [notificationMsg, setNotificationMsg] = useState("");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    name: "",
    category: "Vaccine",
    price: "",
    unit: "",
    stock: "0",
    minStock: "10",
  });

  const [importData, setImportData] = useState({ id: "", qty: 0 });

  // --- HÀM UPDATE DATA DÙNG CHUNG ---
  const updateInventory = (newItems: any[]) => {
    setItems(newItems);
    localStorage.setItem("pcx_inventory", JSON.stringify(newItems));
    // Bắn sự kiện để Dashboard cập nhật ngay
    window.dispatchEvent(new Event("storage"));
    window.dispatchEvent(new Event("local-storage-update"));
  };

  // Đồng bộ nếu có thay đổi từ nơi khác (ví dụ Dashboard nhập nhanh)
  useEffect(() => {
    const handleUpdate = () => setItems(getSharedInventory());
    window.addEventListener("local-storage-update", handleUpdate);
    return () =>
      window.removeEventListener("local-storage-update", handleUpdate);
  }, []);

  const filtered = items.filter((i) => {
    const matchesSearch =
      i.name.toLowerCase().includes(term.toLowerCase()) ||
      i.id.toLowerCase().includes(term.toLowerCase());
    const matchesTab = activeTab === "Tất cả" || i.category === activeTab;
    return matchesSearch && matchesTab;
  });

  // --- ACTIONS ---
  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      name: "",
      category: "Vaccine",
      price: "",
      unit: "",
      stock: "0",
      minStock: "10",
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (item: any) => {
    setEditingId(item.id);
    setFormData({
      name: item.name,
      category: item.category,
      price: item.price,
      unit: item.unit,
      stock: String(item.stock),
      minStock: String(item.minStock || 10),
    });
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formData.name) return alert("Vui lòng nhập tên");
    let newItems;

    if (editingId) {
      newItems = items.map((i) =>
        i.id === editingId
          ? {
              ...i,
              ...formData,
              stock: Number(formData.stock),
              minStock: Number(formData.minStock),
            }
          : i
      );
      setNotificationMsg("Cập nhật thông tin thành công!");
    } else {
      const newItem = {
        id: `SP${Math.floor(Math.random() * 1000)}`,
        name: formData.name,
        category: formData.category,
        stock: Number(formData.stock),
        minStock: Number(formData.minStock),
        unit: formData.unit || "Cái",
        price: formData.price,
        status: Number(formData.stock) > 0 ? "In Stock" : "Out of Stock",
      };
      newItems = [newItem, ...items];
      setNotificationMsg("Thêm sản phẩm mới thành công!");
    }

    updateInventory(newItems); // Dùng hàm update chung
    setIsModalOpen(false);
    setShowSuccess(true);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Xóa sản phẩm này khỏi kho?")) {
      const newItems = items.filter((i) => i.id !== id);
      updateInventory(newItems);
      setActiveMenu(null);
    }
  };

  const handleImportStock = () => {
    if (!importData.id || importData.qty <= 0)
      return alert("Số lượng không hợp lệ!");

    const newItems = items.map((item) => {
      if (item.id === importData.id) {
        const newStock = item.stock + importData.qty;
        return {
          ...item,
          stock: newStock,
          status: newStock === 0 ? "Out of Stock" : "In Stock",
        };
      }
      return item;
    });

    updateInventory(newItems);
    setIsImportModalOpen(false);
    setImportData({ id: "", qty: 0 });
    setNotificationMsg("Nhập kho thành công!");
    setShowSuccess(true);
  };

  return (
    <div className="pb-10" onClick={() => setActiveMenu(null)}>
      {/* ... (Giữ nguyên phần giao diện Header, Tabs, Table) ... */}
      {/* Chỉ cần copy phần logic ở trên, phần JSX UI bên dưới giữ nguyên như cũ */}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-end md:items-center gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Kho hàng & Vật tư
          </h1>
          <p className="text-slate-500 text-sm">
            Quản lý thuốc, vắc-xin và định mức tồn kho
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="bg-white border-green-600 text-green-700 hover:bg-green-50"
            onClick={() => setIsImportModalOpen(true)}
          >
            <ArrowDownToLine className="w-4 h-4 mr-2" /> Nhập hàng
          </Button>
          <Button
            className="bg-primary hover:bg-primary-600 shadow-lg shadow-primary/20"
            onClick={handleOpenAdd}
          >
            <Plus className="w-4 h-4 mr-2" /> Thêm sản phẩm
          </Button>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {["Tất cả", "Vaccine", "Thuốc", "Thức ăn", "Phụ kiện"].map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all whitespace-nowrap ${
              activeTab === cat
                ? "bg-slate-800 text-white shadow-md"
                : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50"
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-3 text-slate-400 w-4 h-4" />
            <Input
              placeholder="Tìm tên sản phẩm, mã SKU..."
              className="pl-9 h-10 bg-white"
              value={term}
              onChange={(e) => setTerm(e.target.value)}
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
              <tr>
                <th className="p-4">Sản phẩm</th>
                <th className="p-4">Danh mục</th>
                <th className="p-4 text-right">Giá bán</th>
                <th className="p-4 text-center">Tồn kho</th>
                <th className="p-4 text-center">Trạng thái</th>
                <th className="p-4 text-right">#</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((item) => (
                <tr
                  key={item.id}
                  className="hover:bg-slate-50 transition-colors"
                >
                  <td className="p-4">
                    <div>
                      <p className="font-bold text-slate-800">{item.name}</p>
                      <p className="text-xs text-slate-400 font-mono">
                        {item.id}
                      </p>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded bg-slate-100 text-slate-600 text-xs font-medium">
                      {item.category}
                    </span>
                  </td>
                  <td className="p-4 text-right font-medium text-slate-700">
                    {Number(item.price).toLocaleString()}đ
                  </td>
                  <td className="p-4 text-center">
                    <span className="font-bold text-slate-800">
                      {item.stock}
                    </span>{" "}
                    <span className="text-xs text-slate-500">{item.unit}</span>
                  </td>
                  <td className="p-4 text-center">
                    {(() => {
                      const min = item.minStock || 10;
                      const isLow = item.stock <= min;
                      const isOut = item.stock === 0;
                      if (isOut)
                        return (
                          <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded flex items-center justify-center gap-1">
                            <AlertTriangle className="w-3 h-3" /> Hết hàng
                          </span>
                        );
                      if (isLow)
                        return (
                          <span className="text-xs font-bold text-orange-600 bg-orange-50 px-2 py-1 rounded flex items-center justify-center gap-1 animate-pulse">
                            <AlertTriangle className="w-3 h-3" /> Sắp hết (&le;
                            {min})
                          </span>
                        );
                      return (
                        <span className="text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded">
                          Sẵn sàng
                        </span>
                      );
                    })()}
                  </td>
                  <td className="p-4 text-right relative">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleOpenEdit(item)}
                        className="text-sm font-medium text-blue-600 hover:underline flex items-center"
                      >
                        <Edit className="w-3 h-3 mr-1" /> Sửa
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenu(
                            activeMenu === item.id ? null : item.id
                          );
                        }}
                        className="p-2 hover:bg-gray-100 rounded-full transition"
                      >
                        <MoreHorizontal className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                    {activeMenu === item.id && (
                      <div className="absolute right-8 top-8 w-32 bg-white shadow-xl rounded-xl border border-slate-100 z-10 overflow-hidden animate-fade-in">
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="w-full text-left px-4 py-3 text-sm hover:bg-red-50 flex items-center gap-2 text-red-500"
                        >
                          <Trash className="w-4 h-4" /> Xóa SP
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingId ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}
      >
        <div className="space-y-4">
          <Input
            label="Tên sản phẩm"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Danh mục
            </label>
            <select
              className="w-full h-11 border border-gray-200 rounded-xl px-3 outline-none"
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
            >
              <option>Vaccine</option>
              <option>Thuốc</option>
              <option>Thức ăn</option>
              <option>Phụ kiện</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Giá bán"
              type="number"
              value={formData.price}
              onChange={(e) =>
                setFormData({ ...formData, price: e.target.value })
              }
            />
            <Input
              label="Đơn vị tính"
              placeholder="Lọ/Gói/Cái"
              value={formData.unit}
              onChange={(e) =>
                setFormData({ ...formData, unit: e.target.value })
              }
            />
          </div>
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100">
            <div>
              <Input
                label="Tồn kho hiện tại"
                type="number"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: e.target.value })
                }
              />
            </div>
            <div>
              <Input
                label="Mức báo động (Min)"
                type="number"
                placeholder="Mặc định: 10"
                value={formData.minStock}
                onChange={(e) =>
                  setFormData({ ...formData, minStock: e.target.value })
                }
              />
              <p className="text-[10px] text-gray-500 mt-1 italic">
                *Hệ thống sẽ cảnh báo khi tồn kho thấp hơn mức này
              </p>
            </div>
          </div>
          <div className="pt-4 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsModalOpen(false)}>
              Hủy
            </Button>
            <Button onClick={handleSave}>Lưu thông tin</Button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Nhập kho sản phẩm"
      >
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-xl text-blue-800 text-sm flex items-start gap-3">
            <PackageCheck className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <p>
              Chọn sản phẩm và nhập số lượng hàng mới về. Hệ thống sẽ cộng dồn
              vào kho hiện tại.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chọn sản phẩm
            </label>
            <select
              className="w-full h-12 px-3 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500"
              value={importData.id}
              onChange={(e) =>
                setImportData({ ...importData, id: e.target.value })
              }
            >
              <option value="">-- Chọn sản phẩm --</option>
              {items.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} (Hiện có: {p.stock} {p.unit})
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Số lượng nhập thêm"
            type="number"
            min="1"
            placeholder="VD: 50"
            value={importData.qty}
            onChange={(e) =>
              setImportData({ ...importData, qty: Number(e.target.value) })
            }
          />
          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100">
            <Button variant="ghost" onClick={() => setIsImportModalOpen(false)}>
              Hủy bỏ
            </Button>
            <Button
              onClick={handleImportStock}
              className="bg-green-600 hover:bg-green-700 shadow-green-200"
            >
              Xác nhận Nhập kho
            </Button>
          </div>
        </div>
      </Modal>

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        message={notificationMsg}
      />
    </div>
  );
};
