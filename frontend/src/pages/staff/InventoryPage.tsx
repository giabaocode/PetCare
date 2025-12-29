import React, { useState, useEffect } from "react";
import { Button } from "../../components/ui/Button";
import { Input } from "../../components/ui/Input";
import { Modal } from "../../components/ui/Modal";
import { SuccessModal } from "../../components/ui/SuccessModal";
import {
  Search,
  Plus,
  AlertTriangle,
  PackageCheck,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Package,
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { productsApi } from "../../api/productApi";

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);
    return () => clearTimeout(handler);
  }, [value, delay]);
  return debouncedValue;
}

export const InventoryPage: React.FC = () => {
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);
  const [page, setPage] = useState(1);
  const limit = 10;

  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [importData, setImportData] = useState({ id: "", qty: 10 });

  const { data, isLoading } = useQuery({
    queryKey: ["inventory", page, debouncedSearch],
    queryFn: async () => {
      const res = await productsApi.getAll({
        page,
        limit,
        search: debouncedSearch,
      });

      if (res.data && res.pagination) {
        return res;
      }

      return {
        data: Array.isArray(res) ? res : [],
        pagination: { totalPages: 1 },
      };
    },
  });

  const items = data?.data || [];
  const totalPages = data?.pagination?.totalPages || 1;

  const importMutation = useMutation({
    mutationFn: async () => {
      return await productsApi.importStock({
        productId: importData.id,
        quantity: importData.qty,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      setIsImportModalOpen(false);
      setShowSuccess(true);
      setImportData({ id: "", qty: 10 });
    },
    onError: (err: any) => {
      alert("Lỗi nhập kho: " + err.message);
    },
  });

  const handleImportStock = () => {
    importMutation.mutate();
  };

  return (
    <div className="space-y-6 fade-in pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Package className="w-6 h-6 text-primary" /> Quản lý Kho hàng
          </h1>
          <p className="text-slate-500 text-sm mt-1">
            Theo dõi tồn kho thuốc, vaccine và vật tư y tế.
          </p>
        </div>
        <Button onClick={() => setIsImportModalOpen(true)}>
          <Plus className="w-4 h-4 mr-2" /> Nhập kho
        </Button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex items-center gap-2">
        <Search className="w-5 h-5 text-gray-400" />
        <input
          type="text"
          placeholder="Tìm kiếm tên sản phẩm..."
          className="flex-1 outline-none text-slate-700 placeholder:text-gray-400"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setPage(1);
          }}
        />
        {searchTerm !== debouncedSearch && (
          <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
        )}
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
        {isLoading ? (
          <div className="p-12 flex justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : (
          <>
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100 text-xs uppercase text-gray-500 font-semibold">
                  <th className="p-4">Tên sản phẩm</th>
                  <th className="p-4">Loại / Đơn vị</th>
                  <th className="p-4 text-center">Tồn kho</th>
                  <th className="p-4 text-right">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {items.length > 0 ? (
                  items.map((item: any) => (
                    <tr
                      key={item.MaSP}
                      className="hover:bg-slate-50 transition-colors"
                    >
                      <td className="p-4 font-medium text-slate-800">
                        {item.TenSP}
                      </td>
                      <td className="p-4 text-sm text-slate-500">
                        <span className="bg-blue-50 text-blue-700 px-2 py-1 rounded text-xs font-bold mr-2">
                          {item.LoaiSP}
                        </span>
                        {item.DonViTinh}
                      </td>
                      <td className="p-4 text-center font-bold text-slate-700">
                        {item.SoLuongTon || 0}
                      </td>
                      <td className="p-4 text-right">
                        {Number(item.SoLuongTon) <= 10 ? (
                          <div className="inline-flex items-center text-xs font-bold text-red-600 bg-red-50 px-2 py-1 rounded border border-red-100">
                            <AlertTriangle className="w-3 h-3 mr-1" /> Sắp hết
                          </div>
                        ) : (
                          <div className="inline-flex items-center text-xs font-bold text-green-600 bg-green-50 px-2 py-1 rounded border border-green-100">
                            <PackageCheck className="w-3 h-3 mr-1" /> Sẵn sàng
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-gray-500">
                      Không tìm thấy sản phẩm nào.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-gray-100 bg-gray-50">
                <Button
                  variant="ghost"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  size="sm"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" /> Trước
                </Button>
                <span className="text-sm text-gray-600 font-medium">
                  Trang {page} / {totalPages}
                </span>
                <Button
                  variant="ghost"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  size="sm"
                >
                  Sau <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal Import */}
      <Modal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        title="Nhập kho sản phẩm"
      >
        <div className="space-y-4">
          <div className="p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
            <span className="font-bold">Mẹo:</span> Chọn sản phẩm từ danh sách
            bên dưới để nhập thêm số lượng vào kho chi nhánh hiện tại.
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Chọn sản phẩm
            </label>
            <select
              className="w-full h-11 px-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary/20 outline-none"
              value={importData.id}
              onChange={(e) =>
                setImportData({ ...importData, id: e.target.value })
              }
            >
              <option value="">-- Chọn thuốc cần nhập --</option>
              {/* LƯU Ý: Ở đây dropdown chỉ hiện các sản phẩm trong trang hiện tại. 
                 Để tốt nhất, bạn nên làm 1 ô tìm kiếm riêng cho modal này, 
                 nhưng để đơn giản ta dùng danh sách hiện có.
              */}
              {items.map((i: any) => (
                <option key={i.MaSP} value={i.MaSP}>
                  {i.TenSP} (Hiện có: {i.SoLuongTon || 0})
                </option>
              ))}
            </select>
          </div>
          <Input
            label="Số lượng nhập thêm"
            type="number"
            min={1}
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
              isLoading={importMutation.isPending}
              disabled={!importData.id || importData.qty <= 0}
            >
              Xác nhận nhập
            </Button>
          </div>
        </div>
      </Modal>

      <SuccessModal
        isOpen={showSuccess}
        onClose={() => setShowSuccess(false)}
        message="Nhập kho thành công!"
      />
    </div>
  );
};
