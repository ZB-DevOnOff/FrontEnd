'use client';

type CustomAlertProps = {
  message: string;
  onClose: () => void;
  onConfirm?: () => void;
};

const CustomAlert = ({ message, onClose, onConfirm }: CustomAlertProps) => {
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[28rem] max-w-lg">
        <p className="text-lg font-semibold text-center">{message}</p>
        <div className="mt-6 flex justify-center">
          <button
            className="btn text-teal-50 bg-teal-500 hover:bg-teal-500 hover:text-black"
            onClick={handleConfirm}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
};

export default CustomAlert;
