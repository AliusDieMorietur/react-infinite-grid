import { CSSProperties, useEffect, useRef, useState } from "react";
import { InView } from "react-intersection-observer";

export type GetList<T> = {
  items: T[];
  total: number;
};

export type InfiniteGridProps<T> = {
  className?: string;
  style?: CSSProperties;
  initialItems: T[];
  total: number;
  fetchNextPage?: (data: {
    offset: number;
    limit: number;
  }) => Promise<GetList<T>>;
  itemRenderer: (item: T) => JSX.Element;
  skeletonRenderer?: () => JSX.Element;
  errorRenderer?: () => JSX.Element;
  emptyState?: () => JSX.Element;
  limit?: number;
  overScan?: number;
  firstAlwaysVisible?: number;
};

export const InfiniteGrid = <T,>({
  className,
  initialItems,
  total,
  fetchNextPage,
  itemRenderer,
  skeletonRenderer,
  errorRenderer,
  emptyState,
  limit = 12,
  overScan = 12,
  firstAlwaysVisible = 12,
  style,
}: InfiniteGridProps<T>) => {
  const stateRef = useRef({
    items: initialItems,
    total,
    offset: 0,
    isNextPageLoading: false,
    isError: false,
    lastRequestId: -1,
    view: {},
    itemHeight: {},
    isFirstMount: true,
  });
  const listRef = useRef<HTMLDivElement>(null);
  const [_, update] = useState([]);

  const hasNextPage = total > stateRef.current.items.length;

  const loadPage = async () => {
    if (stateRef.current.isNextPageLoading || !fetchNextPage) return;
    stateRef.current.isNextPageLoading = true;
    update([]);
    const _limit = stateRef.current.isFirstMount
      ? stateRef.current.items.length
      : limit;
    const newOffset = stateRef.current.offset + _limit;
    stateRef.current.offset = newOffset;
    const requestId = Math.random();
    stateRef.current.lastRequestId = requestId;
    const response = await fetchNextPage({
      offset: newOffset,
      limit,
    }).catch((error) => {
      console.error(error);
      stateRef.current.isError = true;
      stateRef.current.isNextPageLoading = false;
      return null;
    });
    if (stateRef.current.lastRequestId !== requestId) return;
    if (response === null) return;
    stateRef.current.items = [...stateRef.current.items, ...response.items];
    stateRef.current.total = response.total;
    stateRef.current.isNextPageLoading = false;
    update([]);
  };

  useEffect(() => {
    if (stateRef.current.isFirstMount) {
      stateRef.current.isFirstMount = false;
      return;
    }
    stateRef.current.lastRequestId = -1;
    stateRef.current.items = initialItems;
    stateRef.current.total = total;
    stateRef.current.offset = 0;
    stateRef.current.isNextPageLoading = false;
    stateRef.current.isError = false;
    update([]);
  }, [initialItems]);

  if (stateRef.current.isError) {
    return errorRenderer ? errorRenderer() : <div>Error</div>;
  }

  if (total === 0) {
    return emptyState ? emptyState() : <></>;
  }

  return (
    <>
      <div ref={listRef} className={className} style={style}>
        {stateRef.current.items.map((item, index) => (
          <InView
            key={index}
            onChange={(inView) => {
              stateRef.current.view[index] = inView;
              if (
                inView &&
                index >= stateRef.current.items.length - overScan &&
                hasNextPage
              ) {
                loadPage();
              }
            }}
          >
            {({ inView, ref, entry }) => {
              const isVisible =
                inView ||
                stateRef.current.view[index - overScan] ||
                stateRef.current.view[index + overScan] ||
                index <= firstAlwaysVisible;

              stateRef.current.itemHeight[index] = Math.max(
                (entry?.target.clientHeight ?? 0,
                stateRef.current.itemHeight[index] ?? 0)
              );

              return (
                <div ref={ref} className="flex flex-col">
                  {isVisible && itemRenderer(item)}
                  {!isVisible && (
                    <div
                      style={{
                        height: stateRef.current.itemHeight[index],
                      }}
                    />
                  )}
                </div>
              );
            }}
          </InView>
        ))}
      </div>
      {hasNextPage && (
        <InView
          onChange={(inView) => {
            if (inView && hasNextPage) {
              loadPage();
            }
          }}
        >
          {({ ref }) => <div ref={ref}>{skeletonRenderer?.()}</div>}
        </InView>
      )}
    </>
  );
};
