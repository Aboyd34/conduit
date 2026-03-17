import { Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import AppPage from './pages/AppPage.jsx'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/app" element={<AppPage />} />
      <Route path="*" element={<Home />} />
    </Routes>
  )
}
