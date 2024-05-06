import React, { useState, useEffect } from "react";
import NetworkGraph from "./NetworkGraph";
import Display from "./components/Display";
import Sidebar from "./components/Sidebar";

const App = () => {
  const [xmlData, setXmlData] = useState(null);
  const [shortestPathDistance, setShortestPathDistance] = useState(0);
  const [startNodeName, setStartNodeName] = useState(null);
  const [chosenNodeName, setChosenNodeName] = useState(null);
  const [shortestPathArray, setShortestPathArray] = useState([]);
  const [calculationTime, setCalculationTime] = useState(null);

  useEffect(() => {
    // Fetching the XML file
    fetch("graph.xml")
      .then((response) => response.text())
      .then((data) => setXmlData(data))
      .catch((error) => console.error("Error fetching XML data:", error));
  }, []);

  return (
    <div className="app-container">
      {/* Passing the shortestPathArray, startNodeName, and chosenNodeName to the NetworkGraph component */}
      <NetworkGraph
        xmlData={xmlData}
        setShortestPathDistance={setShortestPathDistance}
        setStartNodeName={setStartNodeName}
        setChosenNodeName={setChosenNodeName}
        setShortestPathArray={setShortestPathArray}
        setCalculationTime={setCalculationTime}
      />
      <Display />
      {/* Passing the shortestPathDistance, startNodeName, and chosenNodeName to the Sidebar component */}
      <Sidebar
        shortestPathDistance={shortestPathDistance}
        startNodeName={startNodeName}
        chosenNodeName={chosenNodeName}
        shortestPathArray={shortestPathArray}
        calculationTime={calculationTime}
      />
    </div>
  );
};

export default App;
