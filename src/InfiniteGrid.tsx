import {
  CSSProperties,
  UIEvent,
  UIEventHandler,
  useEffect,
  useRef,
  useState,
} from "react";

export type GetList<T> = {
  items: T[];
  total: number;
};

export type InfiniteGridProps<T> = {
  items: T[];
  className?: string;
  columns?: number;
  style?: CSSProperties;
  itemRenderer: (item: T) => JSX.Element;
  limit?: number;
  gap?: number;
};

export const InfiniteGrid = <T,>({
  className,
  style,
  items,
  columns = 4,
  itemRenderer,
  limit = 12,
  gap = 16,
}: InfiniteGridProps<T>) => {
  const maxBatch = limit * 3;
  const heightRef = useRef<number[]>([]);
  const lastVisibleRef = useRef({ visibleStart: 0, visibleEnd: items.length });
  const [state, setState] = useState({
    items,
    visibleStart: 0,
    visibleEnd: items.length,
  });
  const scrollTopRef = useRef(0);

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

  const onScroll = (e: any) => {
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
    console.log("element.scrollTop", element.scrollTop);
    const halfOfBatchGone = element.scrollTop - topOffset > batchHeight / 2;
    setState((prevState) => ({
      ...prevState,
      visibleStart:
        prevState.visibleStart + columns * 2 * (halfOfBatchGone ? 1 : -1),
      visibleEnd:
        prevState.visibleEnd + columns * 2 * (halfOfBatchGone ? 1 : -1),
    }));
  };

  return (
    <div
      className={className}
      style={{
        height: "80dvh",
        overflowY: "auto",
        ...style,
      }}
      onScroll={onScroll}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, 1fr)`,
          gap: `${gap}px`,
          marginTop: `${topOffset}px`,
          marginBottom: `${bottomOffset}px`,
        }}
      >
        {items.map((item, index) => {
          if (index < state.visibleStart || index >= state.visibleEnd) {
            return null;
          }
          return (
            <div
              key={index}
              ref={(e) => {
                if (!e) return;
                heightRef.current[index] = e.clientHeight;
              }}
            >
              {itemRenderer(item)}
            </div>
          );
        })}
      </div>
    </div>
  );
};
