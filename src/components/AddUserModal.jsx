import UserData from "../utils/UserData";
import React, { useState } from "react";
import Logo from "../assets/INNAXYS.svg";

const AddUserModal = ({ isOpen, onClose }) => {
  const [searchTerm, setSearchTerm] = useState("");
  const filteredUsers = UserData.filter((user) =>
    user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleUserSelect = (e) => {
    const selectedUserId = parseInt(e.target.value);
    const selectedUser = UserData.find((user) => user.id === selectedUserId);
    console.log("Selected User:", selectedUser);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-0 left-0 w-screen h-screen flex items-center justify-center bg-black bg-opacity-50 z-[800]">
      <div className="bg-white rounded-lg p-8 w-[300px]">
        <div className="flex mb-6">
          <h2 className="text-2xl">Log In</h2>
          <img src={Logo} className="w-[100px] ml-16" />
        </div>
        <input
          placeholder="Name"
          className="w-full mb-4 px-3 py-2 border border-gray-300 rounded"
        />
        <input
          placeholder="User ID"
          className="w-full mb-4 px-3 py-2 border border-gray-300 rounded"
        />
        <select
          className="w-full mb-4 px-3 py-2 border border-gray-300 rounded"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        >
          <option value="">Existing Users</option>
          {filteredUsers.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name} - {user.rank}
            </option>
          ))}
        </select>
        <div className="flex justify-between">
          <button
            className="bg-gray-500 text-white px-4 py-2 rounded"
            onClick={onClose}
          >
            Close
          </button>
          <button className="bg-[#00b712] text-white px-4 py-2 rounded">
            Log In
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddUserModal;
