import { CSSProperties, useEffect, useRef, useState } from "react";
import { MeasureItem } from "./MeasureItem";

export type VirtualColumnProps<T> = {
  items: T[];
  className?: string;
  style?: CSSProperties;
  itemRenderer: (item: T) => JSX.Element;
  firstAlwaysVisible?: number;
  gap?: number;
  itemKey: (item: T) => string;
  rangeSize?: number;
};

export const VirtualColumn = <T,>({
  className,
  style,
  items,
  itemRenderer,
  firstAlwaysVisible = 25,
  gap = 16,
  itemKey,
  rangeSize = 3000,
}: VirtualColumnProps<T>) => {
  const listOffsetRef = useRef<number>(0);
  const largestIntervalRef = useRef<number>(0);
  const currentIntervalRef = useRef<number>(0);
  const rangeIndexRef = useRef<Record<number, T[]>>({});
  const listRef = useRef<HTMLDivElement | null>(null);
  const heightRef = useRef<Record<string, number>>({});
  const [state, setState] = useState<{
    visible: T[];
    offsetTop: number;
    offsetBottom: number;
  }>({
    visible: items.slice(0, firstAlwaysVisible),
    offsetTop: 0,
    offsetBottom: 0,
  });

  const rangeIndexSpread = (n: number) => {
    return Math.floor(n / rangeSize) * rangeSize;
  };

  const calculateState = (force?: boolean) => {
    const currentScroll = (() => {
      const scroll = window ? window.scrollY : 0;
      return Math.max(0, scroll - listOffsetRef.current);
    })();

    const interval = rangeIndexSpread(currentScroll);

    if (interval === currentIntervalRef.current && !force) {
      return;
    }

    const offsetTop = (() => {
      let value = 0;
      for (let i = 0; i < interval - rangeSize; i += rangeSize) {
        const items = rangeIndexRef.current[i];
        for (const item of items) {
          const key = itemKey(item);
          const height = heightRef.current[key] ?? 0;
          value += height;
          value += gap;
        }
      }
      return value;
    })();
    const offsetBottom = (() => {
      let value = 0;
      for (
        let i = interval;
        i < largestIntervalRef.current - rangeSize;
        i += rangeSize
      ) {
        const items = rangeIndexRef.current[i];
        for (const item of items) {
          const key = itemKey(item);
          const height = heightRef.current[key] ?? 0;
          value += height;
          value += gap;
        }
      }
      return value;
    })();
    currentIntervalRef.current = interval;
    setState({
      visible: [
        ...(rangeIndexRef.current[interval - rangeSize] ?? []),
        ...(rangeIndexRef.current[interval] ?? []),
        ...(rangeIndexRef.current[interval + rangeSize] ?? []),
      ],
      offsetTop,
      offsetBottom,
    });
  };

  useEffect(() => {
    listOffsetRef.current = listRef.current?.offsetTop ?? 0;
    const onScroll = () => {
      calculateState();
    };
    window.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  useEffect(() => {
    calculateState(true);
  }, [items]);

  return (
    <>
      {items.map((item) => (
        <MeasureItem
          noMeasure={heightRef.current[itemKey(item)] !== undefined}
          key={itemKey(item)}
          onMeasure={({ height }) => {
            heightRef.current[itemKey(item)] = height;
            let offset = 0;
            for (const [key, height] of Object.entries(heightRef.current)) {
              if (key === itemKey(item)) {
                break;
              }
              offset += height;
              offset += gap;
            }
            const interval = rangeIndexSpread(offset);
            rangeIndexRef.current[interval] =
              rangeIndexRef.current[interval] ?? [];
            rangeIndexRef.current[interval].push(item);
            if (interval > largestIntervalRef.current) {
              largestIntervalRef.current = interval;
            }
          }}
        >
          {itemRenderer(item)}
        </MeasureItem>
      ))}
      <div
        ref={listRef}
        style={{
          ...style,
          display: "flex",
          flexDirection: "column",
          marginTop: state.offsetTop,
          gap: `${gap}px`,
          marginBottom: state.offsetBottom,
        }}
      >
        {state.visible.map((item) => (
          <div key={itemKey(item)}>{itemRenderer(item)}</div>
        ))}
      </div>
    </>
  );
};
