import { useMemo, useRef } from 'react';

/**
 *
 * @param dep - dependency should be array of Post or Comment
 * @param cursorPropsName
 */
export default function useCursorAndOffset(
  dep: {
    commentNumber?: number;
    postNumber?: number;
    [key: string]: any;
  }[],
  cursorPropsName: 'postNumber' | 'commentNumber'
) {
  const lastCursorIndexRef = useRef(0);
  const lastLengthRef = useRef(0);
  // cursor represnts commentNumber of last comment of comments
  // offset represnts how many comments have commentNumbers that are the same as cursor
  const { cursor, offset } = useMemo(() => {
    if (dep.length === 0) {
      return {
        cursor: 0,
        offset: 0,
      };
    }

    const cursorIndex = dep.length - 1;

    const cursor = dep[cursorIndex][cursorPropsName] ?? 0;

    // if some of elements are deleted from dependency
    // then check all the array
    if (dep.length < lastLengthRef.current) {
      let offset = 0;
      for (let i = 0; i < dep.length; i++) {
        if (cursor === dep[i][cursorPropsName]) {
          // if some of elements has the same value
          offset += 1;
        }
      }

      lastCursorIndexRef.current = cursorIndex;
      lastLengthRef.current = dep.length;

      return {
        cursor,
        offset,
      };
    }

    let offset = 0;
    for (let i = lastCursorIndexRef.current; i < dep.length; i++) {
      if (cursor === dep[i][cursorPropsName]) {
        // if some of elements has the same value
        offset += 1;
      }
    }

    lastCursorIndexRef.current = cursorIndex;
    lastLengthRef.current = dep.length;

    return {
      cursor,
      offset,
    };
  }, [dep, cursorPropsName]);

  return { cursor, offset };
}
