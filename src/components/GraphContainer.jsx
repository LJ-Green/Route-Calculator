const GraphContainer = ({ children }) => {
  
  return (
    <div
      className="graph-container absolute z-[100]"
      style={{
        display: 'flex',
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingLeft: '200px',
        paddingTop: '80px',
      }}
    >
      {children}
    </div>
  );
};

export default GraphContainer;