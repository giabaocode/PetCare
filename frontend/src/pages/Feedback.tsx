import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { userDataApi } from "../api/user-data";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";
import { useNavigate } from "react-router-dom";
import { Star, MessageSquare } from "lucide-react";

// Component Star Rating nhỏ
const StarRating = ({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (val: number) => void;
}) => {
  const [hover, setHover] = useState(0);
  return (
    <div className="bg-gray-50 p-4 rounded-xl">
      <label className="block font-bold text-gray-700 mb-2">{label}</label>
      <div className="flex gap-2">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="focus:outline-none transition-transform hover:scale-110"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
          >
            <Star
              className={`w-8 h-8 transition-colors ${
                star <= (hover || value)
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-gray-300"
              }`}
            />
          </button>
        ))}
      </div>
    </div>
  );
};

export const Feedback: React.FC = () => {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const { register, handleSubmit, setValue, watch } = useForm({
    defaultValues: {
      DiemChatLuong: 5,
      ThaiDoNhanVien: 5,
      MucHaiLongTongThe: 5,
      BinhLuan: "",
    },
  });

  const formValues = watch();

  const mutation = useMutation({
    mutationFn: (d: any) =>
      userDataApi.sendFeedback({
        ...d,
        MaKH: profile?.MaKH,
        MaCN: "CN01",
        NgayDanhGia: new Date().toISOString(),
      }),
    onSuccess: () => {
      alert("Cảm ơn phản hồi của bạn!");
      navigate("/dashboard");
    },
  });

  return (
    <div className="min-h-screen bg-gray-50 p-6 flex justify-center items-center">
      <div className="bg-white rounded-3xl shadow-xl p-8 w-full max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="w-8 h-8 fill-current" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Đánh giá Dịch vụ</h2>
          <p className="text-gray-500">
            Ý kiến của bạn giúp chúng tôi phục vụ tốt hơn
          </p>
        </div>

        <form
          onSubmit={handleSubmit((d) => mutation.mutate(d))}
          className="space-y-4"
        >
          <StarRating
            label="Chất lượng dịch vụ"
            value={formValues.DiemChatLuong}
            onChange={(v) => setValue("DiemChatLuong", v)}
          />
          <StarRating
            label="Thái độ nhân viên"
            value={formValues.ThaiDoNhanVien}
            onChange={(v) => setValue("ThaiDoNhanVien", v)}
          />
          <StarRating
            label="Mức độ hài lòng chung"
            value={formValues.MucHaiLongTongThe}
            onChange={(v) => setValue("MucHaiLongTongThe", v)}
          />

          <div className="pt-2">
            <label className="block font-bold text-gray-700 mb-2">
              Bình luận chi tiết
            </label>
            <textarea
              {...register("BinhLuan")}
              className="w-full p-4 border border-gray-200 rounded-xl h-32 focus:ring-2 focus:ring-primary outline-none resize-none bg-gray-50 focus:bg-white transition"
              placeholder="Chia sẻ thêm về trải nghiệm của bạn..."
            ></textarea>
          </div>

          <Button
            type="submit"
            className="w-full h-12 text-lg rounded-xl shadow-lg shadow-primary/20"
            disabled={mutation.isPending}
          >
            Gửi Đánh giá
          </Button>
        </form>
      </div>
    </div>
  );
};
