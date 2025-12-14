import { useRef, type ReactNode } from "react";
import ReactDOM from "react-dom";

export default function Modal({
  isOpen,
  onClose,
  children,
}: {
  isOpen: boolean;
  onClose: () => void;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  if (!isOpen) return null;

  return ReactDOM.createPortal(
    <div
      ref={ref}
      className="fixed inset-0 z-5 flex items-center justify-center bg-background/60 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === ref.current) {
          onClose();
        }
      }}
    >
      {children}
    </div>,
    document.getElementById("modal-root")!,
  );
}
