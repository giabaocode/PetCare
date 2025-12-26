import React, { useState, useEffect } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { SuccessModal } from "../../components/ui/SuccessModal";
import { Search, Plus, AlertTriangle, PackageCheck, Edit } from "lucide-react";

// IMPORT DB CHUNG
import { db } from "../../utils/dataProvider";

export const InventoryPage: React.FC = () => {
  // Lấy dữ liệu từ db
  const [items, setItems] = useState<any[]>(db.getInventory());
  const [term, setTerm] = useState("");

  // State Modal
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const [importData, setImportData] = useState({ id: "", qty: 10 });

  // Update Real-time
  const refreshData = () => {
    setItems(db.getInventory());
  };

  useEffect(() => {
    window.addEventListener("storage", refreshData);
    window.addEventListener("local-storage-update", refreshData);
    return () => {
      window.removeEventListener("storage", refreshData);
      window.removeEventListener("local-storage-update", refreshData);
    };
  }, []);

  // LOGIC NHẬP KHO (QUAN TRỌNG)
  const handleImportStock = () => {
    if (!importData.id) return;

    // Tìm và cập nhật
    const updatedList = items.map((item) => {
      if (item.id === importData.id) {
        // Cộng dồn số lượng
        return {
          ...item,
          stock: item.stock + importData.qty,
          status:
            item.stock + importData.qty > item.minStock
              ? "In Stock"
              : "Low Stock",
        };
      }
      return item;
    });

    // Lưu vào DB chung
    db.updateInventory(updatedList);

    // Update UI
    setIsImportModalOpen(false);
    setShowSuccess(true);
    setImportData({ id: "", qty: 10 });
  };

  const filteredItems = items.filter((i) =>
    i.name.toLowerCase().includes(term.toLowerCase())
  );

  return (
    <div className="p-6 h-full flex flex-col">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">
            Kho Hàng & Thuốc
          </h1>
          <p className="text-slate-500 text-sm">Quản lý tồn kho vật tư y tế</p>
        </div>
        <div className="flex gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl outline-none"
              placeholder="Tìm thuốc..."
              value={term}
              onChange={(e) => setTerm(e.target.value)}
            />
          </div>
          <Button onClick={() => setIsImportModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" /> Nhập kho
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 flex-1 overflow-hidden flex flex-col">
        <div className="overflow-y-auto flex-1">
          <table className="w-full text-left">
            <thead className="bg-slate-50 sticky top-0 z-10">
              <tr>
                <th className="p-4 text-sm font-semibold text-slate-600">
                  Mã SP
                </th>
                <th className="p-4 text-sm font-semibold text-slate-600">
                  Tên sản phẩm
                </th>
                <th className="p-4 text-sm font-semibold text-slate-600">
                  Phân loại
                </th>
                <th className="p-4 text-sm font-semibold text-slate-600 text-right">
                  Tồn kho
                </th>
                <th className="p-4 text-sm font-semibold text-slate-600 text-right">
                  Đơn giá
                </th>
                <th className="p-4 text-sm font-semibold text-slate-600">
                  Trạng thái
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredItems.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50">
                  <td className="p-4 font-mono text-xs text-slate-400">
                    {item.id}
                  </td>
                  <td className="p-4 font-medium text-slate-800">
                    {item.name}
                  </td>
                  <td className="p-4 text-sm text-slate-600">
                    {item.category}
                  </td>
                  <td className="p-4 text-right font-bold">
                    {item.stock} {item.unit}
                  </td>
                  <td className="p-4 text-right text-slate-600">
                    {item.price.toLocaleString()}đ
                  </td>
                  <td className="p-4">
                    {item.stock <= item.minStock ? (
                      <span className="flex items-center text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded w-fit">
                        <AlertTriangle className="w-3 h-3 mr-1" /> Sắp hết
                      </span>
                    ) : (
                      <span className="flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded w-fit">
                        <PackageCheck className="w-3 h-3 mr-1" /> Sẵn sàng
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Nhập hàng vào kho"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-1">
              Chọn sản phẩm
            </label>
            <select
              className="w-full p-3 border border-gray-200 rounded-xl outline-none"
              value={importData.id}
              onChange={(e) =>
                setImportData({ ...importData, id: e.target.value })
              }
            >
              <option value="">-- Chọn thuốc cần nhập --</option>
              {items.map((i) => (
                <option key={i.id} value={i.id}>
                  {i.name} (Hiện có: {i.stock})
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Số lượng nhập thêm"
            type="number"
            value={importData.qty}
            onChange={(e) =>
              setImportData({ ...importData, qty: Number(e.target.value) })
            }
          />
          <div className="pt-4 flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setIsImportModalOpen(false)}>
              Hủy
            </Button>
            <Button
              onClick={handleImportStock}
              className="bg-green-600 hover:bg-green-700"
            >
              Xác nhận nhập
            </Button>
          </div>
        </div>
      </Modal>

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        message="Đã cập nhật kho hàng thành công!"
      />
    </div>
  );
};
