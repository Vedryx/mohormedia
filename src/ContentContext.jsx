import { createContext, useContext, useEffect, useState } from "react";
const empty = { work: [], stories: [], brands: [] };
const Context = createContext(empty);
export function ContentProvider({ children }) {
  const [content, setContent] = useState(empty),
    [error, setError] = useState(false);
  useEffect(() => {
    let active = true;
    const controller = new AbortController();
    async function refresh() {
      if (document.hidden) return;
      try {
        const response = await fetch("/api/content", {
          cache: "no-store",
          signal: controller.signal,
        });
        if (!response.ok) throw new Error();
        const data = await response.json();
        if (active) {
          setContent(data);
          setError(false);
        }
      } catch (e) {
        if (active && e.name !== "AbortError") setError(true);
      }
    }
    refresh();
    const timer = setInterval(refresh, 30000);
    window.addEventListener("focus", refresh);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      active = false;
      controller.abort();
      clearInterval(timer);
      window.removeEventListener("focus", refresh);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);
  return (
    <Context.Provider value={content}>
      {error && (
        <div className="mm-content-error" role="status">
          Some portfolio content couldn’t load.{" "}
          <button onClick={() => window.location.reload()}>Try again</button>
        </div>
      )}
      {children}
    </Context.Provider>
  );
}
export const useContent = () => useContext(Context);
