import { useState, useEffect } from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const Modal = ({ isOpen, onClose }: ModalProps) => {
  const [isExiting, setIsExiting] = useState(false);
  if (!isOpen && !isExiting) return null;

  const handleClose = () => {
    // Start the exit animation
    setIsExiting(true);
  };

  const handleAnimationEnd = () => {
    // 2. Once the animation finishes, trigger the real close if we were exiting
    if (isExiting) {
      setIsExiting(false);
      onClose();
    }
  };

  
  return (
    <dialog onClick={handleClose} className="fixed top-0 left-0 h-full w-full bg-black/80 flex flex-col justify-center items-center py-4 px-20 outline-none m-auto backdrop-blur-md z-1">
      <div onAnimationEnd={handleAnimationEnd} className={`${isExiting ? 'animate-hide' : 'animate-show'} bg-white p-5 rounded-lg shadow-md`}>
        <h2>Create Order</h2>
        {/*a form or an import to be added here*/}
        <button onClick={handleClose} className="cursor-pointer">Close</button>
      </div>
    </dialog>
  );
};

export default Modal;
