import { CSSProperties, useRef, useState } from "react";
import { useUpdateEffect } from "./useUpdateEffect";
import { InfiniteLoader } from "./InfiniteLoader";
import { VirtualMasonry } from "./VirtualMasonry";

export type InfiniteMasonryProps<T> = {
  initialItems: T[];
  total: number;
  fetchNextPage: ({
    offset,
    limit,
  }: {
    offset: number;
    limit: number;
  }) => Promise<{
    items: T[];
    total: number;
  }>;
  itemKey: (item: T) => string;
  itemRenderer: (item: T) => JSX.Element;
  columns?: number;
  className?: string;
  style?: CSSProperties;
  masonryClassName?: string;
  masonryStyle?: CSSProperties;
  columnClassName?: string;
  columnStyle?: CSSProperties;
};

export const InfiniteMasonry = <T,>({
  initialItems,
  total,
  fetchNextPage,
  columns,
  className,
  style,
  masonryClassName,
  masonryStyle,
  columnClassName,
  columnStyle,
  itemKey,
  itemRenderer,
}: InfiniteMasonryProps<T>) => {
  const stateRef = useRef({
    offset: initialItems.length,
    limit: 100,
    isNextPageLoading: false,
  });
  const [state, setState] = useState({
    items: initialItems,
    total,
    isNextPageLoading: false,
    isLoading: false,
  });

  useUpdateEffect(() => {
    setState((prevState) => ({
      ...prevState,
      isLoading: true,
    }));
    fetchNextPage({
      offset: 0,
      limit: 100,
    }).then((response) => {
      stateRef.current = {
        offset: response.items.length,
        limit: 100,
        isNextPageLoading: false,
      };
      setState((prevState) => ({
        ...prevState,
        items: response.items,
        total: response.total,
        isNextPageLoading: false,
        isLoading: false,
      }));
    });
  }, [fetchNextPage]);

  if (state.isLoading) {
    return (
      <div
        style={{
          textAlign: "center",
          fontSize: "30px",
        }}
      >
        Loading...
      </div>
    );
  }

  return (
    <InfiniteLoader
      className={className}
      style={style}
      onLoadMore={async () => {
        if (stateRef.current.isNextPageLoading) return;
        if (state.items.length >= state.total) return;
        setState((prevState) => ({
          ...prevState,
          isNextPageLoading: true,
        }));
        stateRef.current.isNextPageLoading = true;
        const newItems = await fetchNextPage({
          offset: stateRef.current.offset,
          limit: stateRef.current.limit,
        });
        stateRef.current.isNextPageLoading = false;
        stateRef.current.offset += 100;
        setState({
          ...state,
          items: [...state.items, ...newItems.items],
          total: newItems.total,
          isNextPageLoading: false,
        });
      }}
    >
      <VirtualMasonry
        columns={columns}
        className={masonryClassName}
        style={masonryStyle}
        columnClassName={columnClassName}
        columnStyle={columnStyle}
        items={state.items}
        itemKey={itemKey}
        itemRenderer={itemRenderer}
      />
    </InfiniteLoader>
  );
};
