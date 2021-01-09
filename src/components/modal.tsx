import { ReactNode, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

const modalRoot = document.getElementById('modal-root');

/**
 * Modal only can rendered on client-side rendering
 * so use next/dynamic module to import without ssr
 * @param isOpened {boolean}
 * @param children
 */
export default function Modal({
  isOpened,
  children,
}: {
  isOpened: boolean;
  children: ReactNode;
}) {
  const elementRef = useRef(document.createElement('div'));

  useEffect(() => {
    if (isOpened) {
      const element = elementRef.current;
      modalRoot.appendChild(element);

      return () => {
        modalRoot.removeChild(element);
      };
    }
  }, [isOpened]);

  if (!isOpened) {
    return null;
  }

  return createPortal(
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-25 flex justify-center items-center">
      {children}
    </div>,
    elementRef.current
  );
}
