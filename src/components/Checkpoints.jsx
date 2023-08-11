const Checkpoints = ({ shortestPathArray = [] }) => {
  return (
    
    <div className="bg-[#B8B8B8] ml-[-75px] mt-[100px] w-[150px] h-[240px] rounded-2xl p-4">
      <p className="text-white text-center text-[12px] mb-3 tracking-widest">
        CHECKPOINTS
      </p>
      <ul
        className="list-disc list-inside text-white ml-2 text-center"
        style={{ listStyle: "none" }}
      >
        {shortestPathArray.map((node, index) => (
          <li key={index} className="mb-3 relative pl-8">
            <span className="bullet-point"></span>
            {node}
          </li>
        ))}
      </ul>
      {/* Styling for the bullet points */}
      <style>
        {`
          .bullet-point {
            position: absolute;
            left: 0.75rem;
            top: 0.5rem;
            width: 0.5rem;
            height: 0.5rem;
            border: 2px solid #fff;
            border-radius: 50%; /* Creates a circular border */
          }
        `}
      </style>
    </div>
  );
};

export default Checkpoints;