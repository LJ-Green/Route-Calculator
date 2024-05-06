import React from "react";
import GraphContainer from "./GraphContainer";
import BgLogo from "../assets/BgLogo.svg";
import Logo from "../assets/INNAXYS.svg";
import "../App.css";

const Display = () => {
  return (
    <div className="bg-[#e4e4e4] relative">
      <GraphContainer />
      <div className="bg-gray flex flex-col items-center justify-center ml-[240px] h-[100vh] fixed">
        <p className="text-[50px] mt-[700px] pb-6 tracking-widest">ROUTE CALCULATOR</p>
      </div>
      <div className="absolute left-[-500px] top-[-300px] z-[0]">
        <img src={BgLogo} alt="Background Logo" />
      </div>
    </div>
  );
};

export default Display;
