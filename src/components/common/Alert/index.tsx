'use client';

type CustomAlertProps = {
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
};

const CustomAlert = ({ message, onClose, onConfirm }: CustomAlertProps) => {
  const handleConfirm = () => {
    onClose();
    if (onConfirm) {
      onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[28rem] max-w-lg">
        <p className="text-lg font-semibold text-center">{message}</p>
        <div className="mt-6 flex justify-center">
          <button className="btn btn-primary" onClick={handleConfirm}>
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomAlert;
