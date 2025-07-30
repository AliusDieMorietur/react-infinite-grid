import {
  CSSProperties,
  UIEvent,
  UIEventHandler,
  useEffect,
  useRef,
  useState,
} from "react";

export type InfiniteGridProps<T> = {
  className?: string;
  style?: CSSProperties;
  itemRenderer: (item: T) => JSX.Element;
  data: {
    heightRef: React.MutableRefObject<number[]>;
    state: {
      visibleStart: number;
      visibleEnd: number;
    };
    topOffset: number;
    bottomOffset: number;
    gap: number;
    columns: number;
    items: T[];
  };
  onScroll?: (e: any) => void;
};

export const InfiniteGrid = <T,>({
  className,
  style,
  itemRenderer,
  onScroll,
  data: { heightRef, state, topOffset, bottomOffset, gap, columns, items },
}: InfiniteGridProps<T>) => {
  return (
    <div className={className} style={style} onScroll={onScroll}>
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
