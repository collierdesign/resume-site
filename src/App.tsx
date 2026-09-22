import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Nav } from "./components/Nav";
import { ConfigProvider } from "./lib/useConfig";
import Home from "./pages/Home";
import Resume from "./pages/Resume";
import Admin from "./pages/Admin";
import { CursorAura } from "./components/CursorAura";

export default function App() {
  return (
    <ConfigProvider>
      <BrowserRouter>
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
