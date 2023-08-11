import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import { parseXML } from "./utils/graphUtils";
import { drag } from "d3-drag";
import GraphContainer from "./components/GraphContainer";
import Checkpoints from "./components/Checkpoints";
import "./App.css";

// Dijkstra's algorithm (finds shortest path between nodes)
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
      if (
        !visited[node] &&
        (currentNode === null || distances[node] < distances[currentNode])
      ) {
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

  // Calculates the shortest path from startNode to endNode
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

const NetworkGraph = ({
  xmlData,
  setShortestPathDistance,
  setStartNodeName,
  setChosenNodeName,
  checkpointsData,
}) => {
  // Vairiables
  const graphWidth = 800;
  const graphHeight = 500;
  const svgRef = useRef(null);
  const [shortestPathArray, setShortestPathArray] = useState([]);
  const [calculationTime, setCalculationTime] = useState(null);

  let scaledX,
    scaledY,
    scalingFactorX,
    scalingFactorY,
    nodeElements,
    linkElements,
    graphData,
    draggedNode,
    chosenNode;

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
      dragColor: "gray",
      overlapColor: "green",
      draggingLinkColor: "green",
      shortestPathColor: "green",
    },
  };

  // Green hover when Start Node is in proximity of Chosen Node
  const isOverlapping = (node1, node2) => {
    if (node1 === node2) {
      return false;
    }
    const distance = Math.sqrt(
      Math.pow(scaledX(node1) - scaledX(node2), 2) +
        Math.pow(scaledY(node1) - scaledY(node2), 2)
    );
    return distance < styles.node.radius * 1.5;
  };

  // Node Drag Behavior
  const dragHandler = drag()
    .on("start", (event, d) => {
      draggedNode = d;
      d.dragStartX = event.x - scaledX(d);
      d.dragStartY = event.y - scaledY(d);
      d.dragging = true;
      d3.select(event.sourceEvent.target.parentNode).style(
        "fill",
        styles.link.dragColor
      );
      // Ensures Start Node is always visible ontop of Chosen Node
      d3.select(event.sourceEvent.target.parentNode).raise();

      // Reset node when a new drag is initiated
      draggedNode.potentialTarget = null;

      // Set the start node name when dragging starts
      setStartNodeName(d.name);

      console.log("Start Node:", d);
    })

    // Drag Handling
    .on("drag", (event, d) => {
      d.x = (event.x - d.dragStartX) / scalingFactorX;
      d.y = (event.y - d.dragStartY) / scalingFactorY;
      nodeElements.attr(
        "transform",
        (node) => `translate(${scaledX(node)}, ${scaledY(node)})`
      );
      // Chosen node identifying and styling
      nodeElements.select("circle").style("fill", (node) => {
        if (node === d) {
          return styles.link.dragColor;
        } else if (isOverlapping(d, node)) {
          draggedNode.potentialTarget = node;
          return styles.link.overlapColor;
        } else {
          return styles.node.fill;
        }
      });
    })

    // Initiates when Start node is dropped on Chosen Node
    .on("end", (event, d) => {
      d.x = d.initialX;
      d.y = d.initialY;
      nodeElements.attr(
        "transform",
        (d) => `translate(${scaledX(d)}, ${scaledY(d)})`
      );
      // Stores Chosen Node
      chosenNode = draggedNode.potentialTarget;

      if (chosenNode) {
        console.log("Chosen Node:", chosenNode);

        // Start measuring calculation time
      const startTime = performance.now();

        // Calculate the shortest path distance using Dijkstra's algorithm
        const graph = {};
        graphData.links.forEach((link) => {
          if (!graph[link.source]) {
            graph[link.source] = [];
          }
          if (!graph[link.target]) {
            graph[link.target] = [];
          }
          graph[link.source].push({ target: link.target, weight: link.weight });
          graph[link.target].push({ target: link.source, weight: link.weight });
        });

        const shortestPath = dijkstra(graph, draggedNode.name, chosenNode.name);

         // End measuring calculation time
      const endTime = performance.now();
      const timeTaken = endTime - startTime;

      // Store the calculation time in state
      setCalculationTime(timeTaken);

        // Used to pass props into external components
        setShortestPathDistance(shortestPath.distance);

        console.log("Shortest Path Distance:", shortestPath.distance);
        console.log("Shortest Path:", shortestPath.path);

        // Finds the shortest path links
        const shortestPathLinks = shortestPath.path
          .map((node, index) => {
            if (index < shortestPath.path.length - 1) {
              return graphData.links.find((link) => {
                return (
                  (link.source === node &&
                    link.target === shortestPath.path[index + 1]) ||
                  (link.source === shortestPath.path[index + 1] &&
                    link.target === node)
                );
              });
            }
            return null;
          })
          .filter((link) => link !== null);

        // Sets Chosen Nodes name after drag handling ends
        setChosenNodeName(chosenNode.name);

        // Change the color of the shortest path links to green
        linkElements.style("stroke", (link) => {
          const linkSource = graphData.nodes.find(
            (node) => node.name === link.source
          );
          const linkTarget = graphData.nodes.find(
            (node) => node.name === link.target
          );
          const linkReverse = graphData.links.find(
            (reverseLink) =>
              reverseLink.source === link.target &&
              reverseLink.target === link.source
          );

          if (shortestPathLinks.includes(link)) {
            return styles.link.shortestPathColor;
          } else if (
            (linkSource === draggedNode && linkTarget === chosenNode) ||
            (linkSource === chosenNode && linkTarget === draggedNode) ||
            link === linkReverse
          ) {
            return styles.link.draggingLinkColor;
          } else {
            return styles.link.stroke;
          }
        });
        setShortestPathArray(shortestPath.path);
      } else {
        console.log("No chosen node.");
      }

      // Reverts Start node to original position
      draggedNode.potentialTarget = null;
    });

    // Listen for changes in calculationTime and log the value
  useEffect(() => {
    console.log("Calculation Time:", calculationTime);
  }, [calculationTime]);

  // Display Rendering
  useEffect(() => {
    let svg = d3.select(svgRef.current);
    if (xmlData) {
      graphData = parseXML(xmlData);

      // Renders graph back to original position
      svg.selectAll("*").remove();
      const maxY = d3.max(graphData.nodes, (d) => d.y);

      // Node Locations
      scalingFactorX = graphWidth / d3.max(graphData.nodes, (d) => d.x);
      scalingFactorY = graphHeight / maxY;
      scaledX = (d) => d.x * scalingFactorX;
      scaledY = (d) => d.y * scalingFactorY;

      // Render Graph Links
      linkElements = svg
        .selectAll("line")
        .data(graphData.links)
        .enter()
        .append("line")
        .attr("x1", (d) =>
          scaledX(graphData.nodes.find((node) => node.name === d.source))
        )
        .attr("y1", (d) =>
          scaledY(graphData.nodes.find((node) => node.name === d.source))
        )
        .attr("x2", (d) =>
          scaledX(graphData.nodes.find((node) => node.name === d.target))
        )
        .attr("y2", (d) =>
          scaledY(graphData.nodes.find((node) => node.name === d.target))
        )
        .style("stroke", (link) => {
          if (link.source === link.target) {
            return styles.link.draggingLinkColor;
          } else {
            return styles.link.stroke;
          }
        })
        .style("stroke-width", styles.link.strokeWidth)
        .classed("link", true)
        .attr("id", (d, i) => `link-${i}`);

      // Render link Weights
      svg
        .selectAll("text.link-weight")
        .data(graphData.links)
        .enter()
        .append("text")
        .attr("class", "link-weight")
        .attr(
          "x",
          (d) =>
            (scaledX(graphData.nodes.find((node) => node.name === d.source)) +
              scaledX(graphData.nodes.find((node) => node.name === d.target))) /
            2
        )
        .attr(
          "y",
          (d) =>
            (scaledY(graphData.nodes.find((node) => node.name === d.source)) +
              scaledY(graphData.nodes.find((node) => node.name === d.target))) /
              2 +
            5
        )
        .text((d) => d.weight)
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .style("fill", "black");

      // Render Graph Nodes
      nodeElements = svg
        .selectAll("g") 
        .data(graphData.nodes)
        .enter()
        .append("g")
        .attr("transform", (d) => `translate(${scaledX(d)}, ${scaledY(d)})`)
        .call(dragHandler);

      // Circle Styling to Nodes
      nodeElements
        .append("circle")
        .attr("r", styles.node.radius)
        .style("fill", styles.node.fill)
        .style("stroke", styles.node.stroke)
        .style("stroke-width", styles.node.strokeWidth)
        .each(function (d) {
          d.initialX = d.x;
          d.initialY = d.y;
        })
        .style("cursor", "pointer");

      // Add text labels to the groups
      nodeElements
        .append("text")
        .text((d) => d.name)
        .attr("text-anchor", "middle")
        .attr("dy", ".35em")
        .attr("dx", 1) 
        .style("fill", "black")
        .style("font-size", styles.node.labelFontSize)
        .classed("node-label", true);
    }
  }, [xmlData]);

  return (
    <GraphContainer>
      <svg
        id="graphContainer"
        className="w-[880px] h-[550px] bg-[#B8B8B8] rounded-2xl bg-opacity-80"
        ref={svgRef}
      />
      <div>
      <Checkpoints shortestPathArray={shortestPathArray} />
      <div className="ml-[-75px] mt-3 rounded-full border-2 bg-[#B8B8B8] text-center text-[12px] px-4">Calc Time: {" "}
        {calculationTime === null
          ? "0.00ms"
          : `${calculationTime.toFixed(3)} ms`}</div>
          </div>
    </GraphContainer>
  );
};

export default NetworkGraph;