import React, { useState } from "react";
import Add from "../assets/add.png";
import AddUserModal from "./AddUserModal"; // Import the AddUserModal component

const PassengerLogin = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAddClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div>
        <p className="text-center mb-3 tracking-widest">PASSENGER</p>
        <div className="mb-3 shadow-inner rounded-full bg-[#D2D2D2] w-[120px] h-[120px] flex justify-center items-center">
          <img src={Add} onClick={handleAddClick} style={{ cursor: "pointer" }} />
        </div>
        <p className="text-center tracking-wide text-[12px]">Officer, ...</p>
      </div>
      {/* Render the AddUserModal component */}
      <AddUserModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  );
};

export default PassengerLogin;
