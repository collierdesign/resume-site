import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Nav } from "./components/Nav";
import { ConfigProvider } from "./lib/useConfig";
import Home from "./pages/Home";
import Resume from "./pages/Resume";
import Admin from "./pages/Admin";

export default function App() {
  return (
    <ConfigProvider>
      <BrowserRouter>
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