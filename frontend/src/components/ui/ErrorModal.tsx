import React from "react";
import { XCircle } from "lucide-react"; // Icon X màu đỏ
import { Modal } from "./Modal";
import { Button } from "./Button";

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  message: string;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
  isOpen,
  onClose,
  title = "Đã có lỗi xảy ra",
  message,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="">
      <div className="text-center">
        <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <XCircle className="w-10 h-10 text-red-600" />
        </div>
        <h3 className="text-xl font-bold text-slate-800 mb-2">{title}</h3>
        <p className="text-slate-500 mb-6">{message}</p>
        <Button
          onClick={onClose}
          className="w-full bg-red-600 hover:bg-red-700"
        >
          Đã hiểu, quay lại
        </Button>
      </div>
    </Modal>
  );
};
