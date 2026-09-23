import { useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Nav } from "./components/Nav";
import { ConfigProvider, useConfig } from "./lib/useConfig";
import Home from "./pages/Home";
import Resume from "./pages/Resume";
import Admin from "./pages/Admin";
import { CursorAura } from "./components/CursorAura";

/** 把可配置的站点标题同步到浏览器标签页（document.title） */
function TitleSync() {
  const cfg = useConfig();
  useEffect(() => {
    document.title = cfg.site?.title || cfg.profile?.name || "Starle 林夏";
  }, [cfg.site?.title, cfg.profile?.name]);
  return null;
}

export default function App() {
  return (
    <ConfigProvider>
      <BrowserRouter>
        <TitleSync />
        <CursorAura />
        <Routes>
          <Route path="/admin" element={<Admin />} />
          <Route
            path="/resume"
            element={
              <>
                <Nav />
                <Resume />
              </>
            }
          />
          <Route
            path="/*"
            element={
              <>
                <Nav />
                <Home />
              </>
            }
          />
        </Routes>
      </BrowserRouter>
    </ConfigProvider>
  );
}
