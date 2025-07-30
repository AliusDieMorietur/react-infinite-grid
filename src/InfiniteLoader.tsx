import { CSSProperties, ReactNode, useEffect, useRef } from "react";

export type InfiniteLoaderProps = {
  children: ReactNode;
  onLoadMore?: () => void;
  className?: string;
  style?: CSSProperties;
};

export const InfiniteLoader = ({
  children,
  onLoadMore,
  className,
  style,
}: InfiniteLoaderProps): JSX.Element => {
  const loaderRef = useRef<HTMLDivElement | null>(null);
  const offsetRef = useRef<number>(0);

  useEffect(() => {
    offsetRef.current = loaderRef.current?.offsetTop ?? 0;
    const onScroll = () => {
      if (!loaderRef.current) return;
      const currentScroll = (() => {
        const scroll = window ? window.scrollY : 0;
        return Math.max(0, scroll - offsetRef.current);
      })();
      if (currentScroll + window.innerHeight > loaderRef.current.clientHeight) {
        onLoadMore?.();
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  return (
    <div ref={loaderRef} className={className} style={style}>
      {children}
    </div>
  );
};
