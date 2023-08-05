export function parseXML(xmlText) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, "text/xml");

  // Extract nodes and links from the XML
  const nodes = xmlDoc.getElementsByTagName("node");
  const links = xmlDoc.getElementsByTagName("link");

  // Data Structure Compatible with D3
  const graphData = {
    nodes: Array.from(nodes).map(node => ({
      name: node.getAttribute("name"),
      x: +node.querySelector("x").textContent,
      y: +node.querySelector("y").textContent,
    })),
    links: Array.from(links).map(link => ({
      source: link.getAttribute("start"),
      target: link.getAttribute("end"),
      weight: +link.querySelector("weight").textContent,
    })),
  };

  // Return the graph data
  return graphData;
}