import React, { useState } from "react";
import AddUserModal from "./AddUserModal";
import JohnDoe from './../assets/JohnDoe.svg'

const DriverLogin = () => {
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
        <p className="text-center mb-3 tracking-widest">DRIVER</p>
        <div className="mb-3 shadow-inner rounded-full bg-[#D2D2D2] w-[120px] h-[120px] flex justify-center items-center">
          <img src={JohnDoe} className="rounded-full"/>
        </div>
        <p className="text-center tracking-wide text-[12px]">Officer, John Doe</p>
      </div>
      <AddUserModal isOpen={isModalOpen} onClose={handleCloseModal} />
    </>
  );
};

export default DriverLogin;