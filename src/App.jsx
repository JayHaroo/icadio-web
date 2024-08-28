import React from "react";
import "./App.css";
import logo from "./assets/transparent/Logo-with-name.png";
import listen from "./assets/transparent/Listen.png";

function App() {
  return (
    <>
      <div className="flex items-center justify-center">
        <img src={logo} alt="icadio-logo" className="w-[120px]" />
      </div>
      <div className="flex items-center justify-center">
        <div className="w-[400px] h-[400px] bg-black"></div>
      </div>
      <div className="flex items-center justify-center">
        <img src={listen} alt="listen-logo" className="w-[120px]" />
      </div>
    </>
  );
}

export default App;
