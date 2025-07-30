import { useCallback, useEffect, useRef, useState } from "react";

export const useInfiniteGrid = <T,>({
  items,
  limit = 12,
  columns,
  gap = 16,
}: {
  items: T[];
  limit?: number;
  columns?: number;
  gap?: number;
}) => {
  const maxBatch = limit * 3;
  const heightRef = useRef<number[]>([]);
  const lastVisibleRef = useRef({ visibleStart: 0, visibleEnd: items.length });
  const [state, setState] = useState({
    items,
    visibleStart: 0,
    visibleEnd: items.length,
  });

  useEffect(() => {
    lastVisibleRef.current.visibleStart = state.visibleStart;
    lastVisibleRef.current.visibleEnd = state.visibleEnd;
    setState((prevState) => ({
      ...prevState,
      visibleStart: 0,
      visibleEnd: items.length,
      items,
    }));
    setTimeout(() => {
      if (items.length < maxBatch) {
        return;
      }
      const visible = (() => {
        if (
          lastVisibleRef.current.visibleStart === 0 &&
          lastVisibleRef.current.visibleEnd === items.length
        ) {
          return {
            visibleStart: 0,
            visibleEnd: maxBatch,
          };
        }
        if (lastVisibleRef.current.visibleEnd > items.length) {
          return {
            visibleEnd: items.length,
            visibleStart: items.length - maxBatch,
          };
        }
        return {
          visibleEnd: lastVisibleRef.current.visibleEnd,
          visibleStart: lastVisibleRef.current.visibleStart,
        };
      })();

      setState((prevState) => ({
        ...prevState,
        ...visible,
      }));
    }, 0);
  }, [items]);

  const topOffset = (() => {
    let offset = 0;
    for (let i = 0; i < state.visibleStart; i += columns) {
      offset += Math.max(...heightRef.current.slice(i, i + columns));
    }
    return offset;
  })();

  const bottomOffset = (() => {
    let offset = 0;
    for (let i = state.visibleEnd; i < items.length; i += columns) {
      offset += Math.max(...heightRef.current.slice(i, i + columns));
    }
    return offset;
  })();

  const onScroll = useCallback((e: any) => {
    console.log("222221", 1);
    const element = e.target as HTMLDivElement | null;
    if (!element) {
      console.warn("No element found");
      return;
    }
    const rect = element.getBoundingClientRect();
    console.log("rect", rect);
    console.log("window.scrollTop", window.scrollY);
    const batchHeight = (() => {
      let height = 0;
      for (let i = state.visibleStart; i < state.visibleEnd; i += columns) {
        height += Math.max(...heightRef.current.slice(i, i + columns));
      }
      return height;
    })();
    const scrollTop = element.scrollTop - Math.min(0, rect.top);
    const halfOfBatchGone = scrollTop - topOffset > batchHeight / 2;
    setState((prevState) => ({
      ...prevState,
      visibleStart:
        prevState.visibleStart + columns * 2 * (halfOfBatchGone ? 1 : -1),
      visibleEnd:
        prevState.visibleEnd + columns * 2 * (halfOfBatchGone ? 1 : -1),
    }));
  }, []);

  return {
    onScroll,
    data: { heightRef, state, topOffset, bottomOffset, gap, columns, items },
  };
};
