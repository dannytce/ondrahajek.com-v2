import { useEffect, type ReactNode } from 'react';
import FocusLock from 'react-focus-lock';
import { createPortal } from 'react-dom';

interface ModalProps {
  isOpen: boolean;
  onRequestClose: (event: unknown) => void;
  headerText?: string;
  children: ReactNode;
}

function canUseDOM() {
  return !!(
    typeof window !== 'undefined' &&
    window.document &&
    window.document.createElement
  );
}

export function Modal({
  isOpen,
  onRequestClose,
  children,
  headerText,
}: ModalProps) {
  useEffect(() => {
    const onKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.code === 'Escape' && isOpen) {
        onRequestClose(event as unknown as KeyboardEvent);
      }
    };

    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    document.addEventListener('keydown', onKeyDown, false);
    return () => {
      document.removeEventListener('keydown', onKeyDown, false);
    };
  }, [isOpen, onRequestClose]);

  const modal = (
    <>
      <div
        className="fixed w-full h-full top-0 left-0 bg-black/30 z-modal cursor-pointer"
        onClick={onRequestClose}
        onKeyDown={(e) => e.key === 'Escape' && onRequestClose(e as unknown as KeyboardEvent)}
        role="button"
        tabIndex={0}
        aria-label="Close"
      />
      <FocusLock>
        <div
          className="fixed top-0 left-0 right-0 bottom-0 bg-black/75 z-modal p-[clamp(10px,3vw,60px)]"
          aria-modal
          aria-labelledby={headerText}
          tabIndex={-1}
          role="dialog"
        >
          <div>
            <div>
              {headerText ? <div>{headerText}</div> : null}
              <button
                type="button"
                className="fixed z-modalCloseButton h-8 w-8 right-[15px] top-5 p-0 bg-transparent border-0 appearance-none select-none transition-opacity duration-200 opacity-60 cursor-pointer hover:opacity-100 text-white text-2xl leading-8"
                onClick={onRequestClose}
              >
                ×
              </button>
            </div>
            <div className="animate-scaleIn">{children}</div>
          </div>
        </div>
      </FocusLock>
    </>
  );

  if (!canUseDOM()) {
    return null;
  }

  return isOpen ? createPortal(modal, document.body) : null;
}
