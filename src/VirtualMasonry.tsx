import { CSSProperties } from "react";
import { VirtualColumn } from "./VirtualColumn";

export type VirtualMasonryProps<T> = {
  items: T[];
  className?: string;
  columnClassName?: string;
  columns?: number;
  style?: CSSProperties;
  columnStyle?: CSSProperties;
  itemRenderer: (item: T) => JSX.Element;
  firstAlwaysVisible?: number;
  gap?: number;
  itemKey: (item: T) => string;
  rangeSize?: number;
};

export const VirtualMasonry = <T,>({
  className,
  style,
  columnClassName,
  columnStyle,
  items,
  columns = 4,
  itemRenderer,
  firstAlwaysVisible,
  gap = 16,
  itemKey,
  rangeSize,
}: VirtualMasonryProps<T>) => {
  const columnsToRender = (() => {
    const data: T[][] = Array.from({ length: columns }).map(() => []);
    for (let i = 0; i < items.length; i++) {
      data[i % columns].push(items[i]);
    }
    return data;
  })();

  return (
    <div
      className={className}
      style={{
        width: "100%",
        ...style,
        display: "flex",
        gap: `${gap}px`,
      }}
    >
      {columnsToRender.map((columnItems, i) => (
        <VirtualColumn
          key={i}
          style={{
            ...columnStyle,
            width: `${100 / columns}%`,
          }}
          className={columnClassName}
          items={columnItems}
          gap={gap}
          itemRenderer={itemRenderer}
          itemKey={itemKey}
          rangeSize={rangeSize}
          firstAlwaysVisible={firstAlwaysVisible / columns}
        />
      ))}
    </div>
  );
};
