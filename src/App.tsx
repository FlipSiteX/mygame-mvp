import { Route, Routes } from "react-router-dom"
import Login from "./pages/Login"
import Game from "./pages/Game"
import Admin from "./pages/Admin"


function App() {

  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/game" element={<Game />} />
      <Route path="/admin" element={<Admin />} />
    </Routes>
  )
}

export default App
