import React from "react";
import Logo from "../assets/INNAXYS.svg";
import Driver from "./DriverLogin";
import Passenger from "./PassengerLogin";

const Sidebar = ({ shortestPathDistance, startNodeName, chosenNodeName, shortestPathArray }) => {
  return (
    <div className="sidebar w-[300px] bg-[#E0E0E0] fixed top-0 right-0 h-full z-[1000]">
      {/* User Login */}
      <img className="mx-auto my-6 w-[250px]" src={Logo} />
      <div id="user-container" className="border-b border-black">
        <div className="flex justify-around my-3">
          <Driver />
          <Passenger />
        </div>
      </div>
      {/* Journey Info */}
      <div className="flex flex-col items-center px-[20px] border-b border-black pb-3">
        <h3 className="text-center text-[26px] tracking-widest my-3">
          JOURNEY INFO
        </h3>
        <div
          className="w-[150px] border-2 rounded-full flex justify-start items-center bg-white relative"
          style={{ boxShadow: "inset 0px 0px 10px rgba(0, 0, 0, 0.3)" }}
        >
          <div className="bg-[#CACACA] text-right p-2 text-[12px] rounded-l-full tracking-widest relative shadow-inner">
            START
          </div>
          <p className="ml-8">{startNodeName}</p>
        </div>
        <div
          className="w-[150px] border-2 rounded-full flex justify-start items-center bg-white relative mt-2"
          style={{ boxShadow: "inset 0px 0px 10px rgba(0, 0, 0, 0.3)" }}
        >
          <div className="bg-[#00B712] text-right p-2 text-[12px] rounded-l-full tracking-widest relative shadow-inner">
            FINISH
          </div>
          <p className="ml-7">{chosenNodeName}</p>
        </div>
        <button
          className="bg-[#FF0000] text-[12px] tracking-widest w-[100px] p-2 rounded-full border-2 shadow-l my-3"
          style={{ boxShadow: "inset 0px 0px 10px rgba(0, 0, 0, 0.3)" }}
        >
          RESET
        </button>
      </div>
      {/* Journey Weight */}
      <h3 className="text-center text-[26px] my-3 tracking-widest">WEIGHT</h3>
      <p className="text-center mt-8 text-[180px]">{shortestPathDistance}</p>
    </div>
  );
};

export default Sidebar;
