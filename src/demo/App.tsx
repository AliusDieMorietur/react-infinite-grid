import { useEffect } from "react";
import { InfiniteGrid } from "../InfiniteGrid";
import { InfiniteGridV2 } from "../InfiniteGridV2";
import { useInfiniteGrid } from "../useInfiniteGrid";

const items = Array.from({ length: 100_000 }).map((_, index) => ({
  id: index,
  title: `Item ${index}`,
  backgroundColor: `hsl(${Math.random() * 360}, 50%, 50%)`,
  height: Math.floor(Math.random() * 100) + 100,
}));

// const initialItems = items.slice(0, 100);

// const fetchNextPage = async ({
//   offset,
//   limit,
// }: {
//   offset: number;
//   limit: number;
// }) => {
//   return {
//     items: items.slice(offset, offset + limit),
//     total: items.length,
//   };
// };

export default function App() {
  const { data, onScroll } = useInfiniteGrid({
    items,
    limit: 12,
    columns: 4,
    gap: 16,
  });

  useEffect(() => {
    const [html] = document.getElementsByTagName("html");
    console.log("html", html);
    if (!html) {
      console.warn("No html element found");
      return;
    }
    const a = () => {
      console.log("9999999", 9999999);
    };
    html.addEventListener("scroll", a);
    return () => {
      html.removeEventListener("scroll", a);
    };
  }, [onScroll]);

  return (
    <div style={{ height: "100%", overflowY: "auto" }}>
      <h1>Demo: InfiniteGrid</h1>
      {/* <InfiniteGrid
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: "12px",
        }}
        total={items.length}
        initialItems={initialItems}
        fetchNextPage={fetchNextPage}
        itemRenderer={(item) => (
          <div
            style={{
              backgroundColor: item.backgroundColor,
              height: "100px",
              width: "100%",
              borderRadius: "8px",
              padding: "12px",
              boxSizing: "border-box",
            }}
          >
            {item.title}
          </div>
        )}
      /> */}
      <InfiniteGrid
        data={data}
        itemRenderer={(item) => (
          <div
            style={{
              backgroundColor: item.backgroundColor,
              // height: "200px",
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
