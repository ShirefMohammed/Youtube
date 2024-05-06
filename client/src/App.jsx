import { BrowserRouter, Routes, Route } from "react-router-dom";
import { io } from "socket.io-client";
import { PersistLogin } from "./components";
import { MainContent } from "./pages";

// Initialize Socket Server
const SERVER_URL = import.meta.env.VITE_SERVER_URL;
const socket = io(SERVER_URL);

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<PersistLogin socket={socket} />}>
          <Route path="/*" element={<MainContent socket={socket} />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
