import AppBar from "./components/AppBar";
import { Box } from "@mui/material";
import "./third/reset.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <AppBar/>
      </BrowserRouter>
    </div>
  );
}

export default App;
