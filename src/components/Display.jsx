import React from "react";
import GraphContainer from "./GraphContainer";
import BgLogo from "../assets/BgLogo.svg";
import Logo from "../assets/INNAXYS.svg";
import "../App.css";

const Display = () => {
  return (
    <div className="bg-[#e4e4e4] relative">
      <GraphContainer />
      <div className="bg-gray flex flex-col items-center justify-center ml-[290px] h-[100vh] fixed">
        <img className="w-[400px] mb-5 mt-[680px]" src={Logo} alt="Logo" />
        <p className="text-[20px] pb-6 tracking-widest">ROUTE CALCULATOR</p>
      </div>
      <div className="absolute left-[-500px] top-[-300px] z-[0]">
        <img src={BgLogo} alt="Background Logo" />
      </div>
    </div>
  );
};

export default Display;
