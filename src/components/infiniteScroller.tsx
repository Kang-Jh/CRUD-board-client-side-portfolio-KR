import { useEffect, useRef } from 'react';
import { ElementType, ReactNode } from 'react';

/**
 * @member className - className that deliver to container
 * @member items - items that should be rendered
 * @member idPrefix - idPrefix is used to observe last item
 * @member fetchMore - when last item is visible on viewport then fetchMore invoked
 * @member render - this method specify how to render individual item
 * @member container - container that contains rendered items
 */
export interface InifiniteScrollerProps {
  className?: string;
  items: any[];
  idPrefix: string;
  fetchMore: (...args: any[]) => Promise<void>;
  render: (item: any, index: number) => ReactNode;
  container?: ElementType;
}

/**
 * @property {ElementType} container - container that contains rendered items
 * @property {Array<any>} items - items that should be rendered
 * @property {string} idPrefix is used to observe last item
 * @property {function} fetchMore - when last item is visible on viewport then fetchMore invoked
 * @property {function} render - this method specify how to render items. rendered DOM elements should contain id attribute
 *  that starts with idPrefix and followed by hyphen and index(idPrefix-index form) so that InfiniteScroller can observe last items
 * @property {string} className - className that deliver to container
 */
const InfiniteScroller = ({
  container = 'div',
  items,
  idPrefix,
  fetchMore,
  render,
  className = '',
}: InifiniteScrollerProps) => {
  const observerRef = useRef<IntersectionObserver>();

  useEffect(() => {
    const lastElement = document.getElementById(
      `${idPrefix}-${items.length - 1}`
    );

    if (!lastElement) {
      return;
    }

    const observerCallback: IntersectionObserverCallback = (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          fetchMore();
        }
      });
    };
    const observerOptions: IntersectionObserverInit = {
      threshold: 0,
    };

    observerRef.current = new IntersectionObserver(
      observerCallback,
      observerOptions
    );
    observerRef.current.observe(lastElement);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [idPrefix, fetchMore, items.length]);

  if (!render) {
    return null;
  }

  const Container = container;

  return <Container className={className}>{items.map(render)}</Container>;
};

export default InfiniteScroller;
