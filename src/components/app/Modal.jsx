function ModalClose({ onClose, children }) {
  return (
    <div
      onClick={() => onClose()}
      className={`absolute top-1 right-1 cursor-pointer`}
    >
      {children}
    </div>
  );
}
function ModalHead({ className = "", children }) {
  return (
    <div
      className={`flex flex-row justify-between items-center border-b border-b-zinc-500 ${className}`}
    >
      {children}
    </div>
  );
}
function ModalBody({ className = "", children }) {
  return <div className={`min-h-40 ${className}`}>{children}</div>;
}

function ModalFooter({ className = "", children }) {
  return (
    <div className={`border-t border-t-zinc-500 ${className}`}>{children}</div>
  );
}

function ModalMain({ className = "", children }) {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation();
      }}
      className={`relative bg-white dark:bg-zinc-900 p-5 pt-10 pb-2 ${className}`}
    >
      {children}
    </div>
  );
}
export default function Modal({ key, open, onClose, children }) {
  return (
    <div
      key={key}
      className={`fixed inset-0 z-10 flex justify-center items-center transition-colors
    ${open ? "visible bg-black/5" : "invisible"}`}
      onClick={() => onClose()}
    >
      {children}
    </div>
  );
}
export { ModalClose, ModalHead, ModalMain, ModalFooter, ModalBody };
