import React from "react";
import { Check, X } from "lucide-react";
import { Button } from "./Button";

interface SuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
}

export const SuccessModal: React.FC<SuccessModalProps> = ({
  isOpen,
  onClose,
  title = "Thành công!",
  message,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
      ></div>
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-sm z-10 p-6 text-center animate-slide-in relative m-4">
        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
          <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
            <Check className="w-6 h-6 text-white stroke-[3px]" />
          </div>
        </div>
        <h3 className="text-2xl font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-slate-500 mb-6">{message}</p>
        <Button
          onClick={onClose}
          className="w-full bg-green-600 hover:bg-green-700 shadow-lg shadow-green-200"
        >
          Tuyệt vời
        </Button>
      </div>
    </div>
  );
};
