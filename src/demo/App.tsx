import { useState } from "react";
import { InfiniteMasonry } from "../InfiniteMasonry";

const items0 = Array.from({ length: 1_000 }).map((_, index) => ({
  id: index,
  title: `SOURCE 0 Item ${index}`,
  backgroundColor: `hsl(${Math.random() * 360}, 50%, 50%)`,
  height: Math.floor(Math.random() * 100) + 100,
}));

const items1 = Array.from({ length: 1_000 }).map((_, index) => ({
  id: index,
  title: `SOURCE 1 Item ${index}`,
  backgroundColor: `hsl(${Math.random() * 360}, 50%, 50%)`,
  height: Math.floor(Math.random() * 100) + 100,
}));

export default function App() {
  const [source, seatSource] = useState<number>(0);

  const fetchNextPage = async ({
    offset,
    limit,
  }: {
    offset: number;
    limit: number;
  }) => {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const sourceItems = source === 0 ? items0 : items1;
    return {
      items: sourceItems.slice(offset, offset + limit),
      total: sourceItems.length,
    };
  };

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Demo: InfiniteGrid</h1>
      <button
        style={{
          position: "fixed",
        }}
        onClick={() => seatSource(source === 0 ? 1 : 0)}
      >
        source {source}
      </button>
      <InfiniteMasonry
        itemKey={(item) => `${item.id}`}
        itemRenderer={(item) => (
          <div
            style={{
              backgroundColor: item.backgroundColor,
              height: item.height,
              width: "100%",
              borderRadius: "8px",
              padding: "12px",
              boxSizing: "border-box",
            }}
          >
            {item.title}
          </div>
        )}
        initialItems={items0.slice(0, 500)}
        total={items0.length}
        fetchNextPage={fetchNextPage}
      />
      <div
        style={{
          width: "100%",
          height: "100vh",
        }}
      ></div>
    </div>
  );
}
