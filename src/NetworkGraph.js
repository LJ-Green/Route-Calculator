import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { parseXML } from "./utils/graphUtils";
import { drag } from "d3-drag"; // Import the d3-drag library
import GraphContainer from "./components/GraphContainer";
import "./App.css";
import Checkpoints from "./components/Checkpoints";

// Dijkstra's algorithm to find the shortest path
function dijkstra(graph, startNode, endNode) {
  const distances = {};
  const visited = {};
  const previous = {};

  // Set initial distances to Infinity and previous nodes to null
  for (const node of Object.keys(graph)) {
    distances[node] = Infinity;
    previous[node] = null;
  }

  distances[startNode] = 0;

  while (Object.keys(visited).length < Object.keys(graph).length) {
    let currentNode = null;
    for (const node of Object.keys(graph)) {
      if (!visited[node] && (currentNode === null || distances[node] < distances[currentNode])) {
        currentNode = node;
      }
    }

    visited[currentNode] = true;

    for (const neighbor of graph[currentNode]) {
      const distance = distances[currentNode] + neighbor.weight;
      if (distance < distances[neighbor.target]) {
        distances[neighbor.target] = distance;
        previous[neighbor.target] = currentNode;
      }
    }
  }

  // Build the shortest path from startNode to endNode
  const path = [endNode];
  let prevNode = previous[endNode];
  while (prevNode) {
    path.unshift(prevNode);
    prevNode = previous[prevNode];
  }

  return {
    distance: distances[endNode],
    path,
  };
}

const NetworkGraph = ({ xmlData,
  setShortestPathDistance,
  setStartNodeName,
  setChosenNodeName,
  checkpointsData, }) => { 
  const graphWidth = 800; // Increase the desired width of the graph
  const graphHeight = 500; // Increase the desired height of the graph
  const svgRef = useRef(null); // To store SVG element
  const [shortestPathArray, setShortestPathArray] = useState([]);
  let scaledX, scaledY, scalingFactorX, scalingFactorY, nodeElements, linkElements, graphData; // Variables outside the useEffect

  // Styling for nodes and links
  const styles = {
    node: {
      fill: "white",
      stroke: "black",
      strokeWidth: 8,
      radius: 22,
      labelFontSize: "35px",
    },
    link: {
      stroke: "#DEDEDE",
      strokeWidth: 8,
      dragColor: "gray", // Fill color for nodes when being dragged
      overlapColor: "green", // Fill color for nodes when overlapping during drag
      draggingLinkColor: "green", // Stroke color for links connected to dragged nodes
      shortestPathColor: "green", // Color for shortest path links
    },
  };
  
  const isOverlapping = (node1, node2) => {
    if (node1 === node2) {
      // If node1 is the same as node2 (the dragged node itself), return false
      return false;
    }
  
    const distance = Math.sqrt(
      Math.pow(scaledX(node1) - scaledX(node2), 2) +
      Math.pow(scaledY(node1) - scaledY(node2), 2)
    );
  
    return distance < styles.node.radius * 1.5; // Diameter of Nodes
  };

  let draggedNode;
  let chosenNode; // Add a variable to store the chosen node after the drag is complete

  // Node Drag Behavior
const dragHandler = drag()
.on("start", (event, d) => {
  draggedNode = d;
  d.dragStartX = event.x - scaledX(d);
  d.dragStartY = event.y - scaledY(d);
  d.dragging = true;
  d3.select(event.sourceEvent.target.parentNode).style("fill", styles.link.dragColor);

  // Raise the SVG group of the dragged node once more at the end of dragging to ensure it's on top
    d3.select(event.sourceEvent.target.parentNode).raise();
  
  console.log("Start Node:", d);

  // Set the start node name when dragging starts
  setStartNodeName(d.name);

  // Reset the potential target node at the start of drag
  draggedNode.potentialTarget = null;
})
.on("drag", (event, d) => {
  d.x = (event.x - d.dragStartX) / scalingFactorX;
  d.y = (event.y - d.dragStartY) / scalingFactorY;
  nodeElements.attr("transform", (node) => `translate(${scaledX(node)}, ${scaledY(node)})`);

  nodeElements.select("circle").style("fill", (node) => {
    if (node === d) {
      return styles.link.dragColor;
    } else if (isOverlapping(d, node)) {
      // Set the potential target node when overlapping during drag
      draggedNode.potentialTarget = node;
      return styles.link.overlapColor;
    } else {
      return styles.node.fill;
    }
  });
})
.on("end", (event, d) => {
  d.x = d.initialX;
  d.y = d.initialY;
  nodeElements.attr("transform", (d) => `translate(${scaledX(d)}, ${scaledY(d)})`);

  chosenNode = draggedNode.potentialTarget; // Store the chosen node after the drag is complete

  if (chosenNode) {
    console.log("Chosen Node:", chosenNode);

    // Update the link style for the chosen link and its reverse direction
    linkElements.style("stroke", (link) => {
      const linkSource = graphData.nodes.find((node) => node.name === link.source);
      const linkTarget = graphData.nodes.find((node) => node.name === link.target);
      const linkReverse = graphData.links.find((reverseLink) => reverseLink.source === link.target && reverseLink.target === link.source);

      if (
        (linkSource === draggedNode && linkTarget === chosenNode) ||
        (linkSource === chosenNode && linkTarget === draggedNode) ||
        link === linkReverse
      ) {
        return styles.link.draggingLinkColor; // Turn the link blue if it connects the dragged node to the chosen node or its reverse direction
      } else {
        return styles.link.stroke; // Use the default color for other links
      }
    });


    
    // Calculate the shortest path distance and path using Dijkstra's algorithm
    const graph = {};
    graphData.links.forEach((link) => {
      if (!graph[link.source]) {
        graph[link.source] = [];
      }
      if (!graph[link.target]) {
        graph[link.target] = [];
      }
      graph[link.source].push({ target: link.target, weight: link.weight });
      graph[link.target].push({ target: link.source, weight: link.weight }); // Add reverse link for undirected graph
    });

    // Calculate the shortest path distance and path using Dijkstra's algorithm
    const shortestPath = dijkstra(graph, draggedNode.name, chosenNode.name);
        
    // Update the shortest path distance using the function passed from App component
    setShortestPathDistance(shortestPath.distance);

    console.log("Shortest Path Distance:", shortestPath.distance);
    console.log("Shortest Path:", shortestPath.path);

    // Find the shortest path links
    const shortestPathLinks = shortestPath.path.map((node, index) => {
      if (index < shortestPath.path.length - 1) {
        return graphData.links.find((link) => {
          return (
            (link.source === node && link.target === shortestPath.path[index + 1]) ||
            (link.source === shortestPath.path[index + 1] && link.target === node)
          );
        });
      }
      return null;
    }).filter((link) => link !== null);

    // Set the chosen node name when dragging ends and a target node is chosen
    setChosenNodeName(chosenNode.name);


    // Change the color of the shortest path links to green
    linkElements.style("stroke", (link) => {
      const linkSource = graphData.nodes.find((node) => node.name === link.source);
      const linkTarget = graphData.nodes.find((node) => node.name === link.target);
      const linkReverse = graphData.links.find((reverseLink) => reverseLink.source === link.target && reverseLink.target === link.source);

      if (shortestPathLinks.includes(link)) {
        return styles.link.shortestPathColor; // Turn the link green for the shortest path
      } else if (
        (linkSource === draggedNode && linkTarget === chosenNode) ||
        (linkSource === chosenNode && linkTarget === draggedNode) ||
        link === linkReverse
      ) {
        return styles.link.draggingLinkColor; // Turn the link blue if it connects the dragged node to the chosen node or its reverse direction
      } else {
        return styles.link.stroke; // Use the default color for other links
      }
    });
    setShortestPathArray(shortestPath.path);
  } else {
    console.log("No chosen node.");

    // Update the link style again based on the connection status for all links
    linkElements.style("stroke", (link) => {
      const sourceNode = graphData.nodes.find((node) => node.name === link.source);
      const targetNode = graphData.nodes.find((node) => node.name === link.target);
      if (sourceNode && sourceNode.dragging || targetNode && targetNode.dragging) {
        return styles.link.draggingLinkColor;
      } else {
        // Check if the link has the same "start" and "end" nodes
        if (link.source === link.target) {
          return styles.link.draggingLinkColor; // Turn the link blue
        } else {
          return styles.link.stroke; // Use the default color for other links
        }
      }
    });
  }

  // Reset the potential target node at the end of the drag
  draggedNode.potentialTarget = null;
});

  useEffect(() => {
    let svg = d3.select(svgRef.current); // Access the svg element using the ref
    if (xmlData) {
      graphData = parseXML(xmlData);
 
      svg.selectAll("*").remove(); // Ensures graph returns to original position
      const maxY = d3.max(graphData.nodes, (d) => d.y); // Calculate the maximum Y value for scaling
      scalingFactorX = graphWidth / d3.max(graphData.nodes, (d) => d.x); // Renders nodes in correct position
      scalingFactorY = graphHeight / maxY;

      scaledX = (d) => d.x * scalingFactorX; // Mapping function to convert original node positions to scaled positions
      scaledY = (d) => d.y * scalingFactorY;

      // Render Graph Links
    linkElements = svg
    .selectAll("line") // Select all lines (links) from the SVG
    .data(graphData.links)
    .enter()
    .append("line")
    .attr("x1", (d) => scaledX(graphData.nodes.find((node) => node.name === d.source)))
    .attr("y1", (d) => scaledY(graphData.nodes.find((node) => node.name === d.source)))
    .attr("x2", (d) => scaledX(graphData.nodes.find((node) => node.name === d.target)))
    .attr("y2", (d) => scaledY(graphData.nodes.find((node) => node.name === d.target)))
    .style("stroke", (link) => {
      // Check if the link has the same "start" and "end" nodes
      if (link.source === link.target) {
        return styles.link.draggingLinkColor; // Turn the link blue
      } else {
        return styles.link.stroke; // Use the default color for other links
      }
    })
    .style("stroke-width", styles.link.strokeWidth)
    .classed("link", true) // Add a class "link" to the links
    .attr("id", (d, i) => `link-${i}`); // Give each link a unique ID

  // NEW: Render link weights as SVG text elements with a slight downward shift
svg
.selectAll("text.link-weight") // Select all existing link-weight text elements
.data(graphData.links)
.enter()
.append("text") // Append new text elements for link weights
.attr("class", "link-weight")
.attr("x", (d) => (scaledX(graphData.nodes.find((node) => node.name === d.source)) + scaledX(graphData.nodes.find((node) => node.name === d.target))) / 2)
.attr("y", (d) => (scaledY(graphData.nodes.find((node) => node.name === d.source)) + scaledY(graphData.nodes.find((node) => node.name === d.target))) / 2 + 5) // Move the text down by 5 units
.text((d) => d.weight)
.attr("text-anchor", "middle")
.style("font-size", "16px")
.style("fill", "black");

      // Render Graph Nodes
      nodeElements = svg
        .selectAll("g") // Select groups instead of circles
        .data(graphData.nodes)
        .enter()
        .append("g") // Append groups instead of circles
        .attr("transform", (d) => `translate(${scaledX(d)}, ${scaledY(d)})`) // Set the initial position
        .call(dragHandler); // Apply the drag behavior to the groups

      // Circle Styling to Nodes
nodeElements
  .append("circle")
  .attr("r", styles.node.radius)
  .style("fill", styles.node.fill)
  .style("stroke", styles.node.stroke)
  .style("stroke-width", styles.node.strokeWidth)
  .each(function (d) { 
    d.initialX = d.x; // Store the initial position of each node as separate properties
    d.initialY = d.y;
  })
  .style("cursor", "pointer") // Set the cursor to "pointer" on hover


      // Add text labels to the groups
      nodeElements
        .append("text")
        .text((d) => d.name) // Display the node name
        .attr("text-anchor", "middle") // Center the text horizontally
        .attr("dy", ".35em") // Center the text vertically
        .attr("dx", 1) // Add extra horizontal padding
        .style("fill", "black")
        .style("font-size", styles.node.labelFontSize)
        .classed("node-label", true); // Add the class 'node-label'
    }
  }, [xmlData]);

  return (
    <GraphContainer>
      {/* Increase the width and height of the SVG container */}
      <svg
        id="graphContainer"
        className="w-[880px] h-[550px] bg-[#B8B8B8] rounded-2xl bg-opacity-80"
        ref={svgRef}
      />
      <Checkpoints shortestPathArray={shortestPathArray} />
    </GraphContainer>
  );
};

export default NetworkGraph;