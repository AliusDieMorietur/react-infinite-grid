import { useEffect, useRef, useState } from "react";

export type MeasureItemProps = {
  noMeasure?: boolean;
  children: React.ReactNode;
  onMeasure: ({ width, height }: { width: number; height: number }) => void;
};

export const MeasureItem = ({
  noMeasure,
  children,
  onMeasure,
}: MeasureItemProps) => {
  const itemRef = useRef<HTMLDivElement | null>(null);
  const [isMeasured, setIsMeasured] = useState(false);

  useEffect(() => {
    (async () => {
      if (!itemRef.current) {
        console.warn("No itemRef");
        return;
      }
      setIsMeasured(true);
      onMeasure({
        width: itemRef.current.clientWidth,
        height: itemRef.current.clientHeight,
      });
    })();
  }, []);

  if (isMeasured || noMeasure) {
    return null;
  }

  return (
    <div
      ref={itemRef}
      style={{
        position: "absolute",
        visibility: "hidden",
      }}
    >
      {children}
    </div>
  );
};
