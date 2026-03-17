import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import AppUI from "./pages/AppPage";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/app" element={<AppUI />} />
    </Routes>
  );
}
