import { Graph, GraphFormat } from '../graph';

enum UnitType {
  DeviceOutput = 0,
  Module,
  DomainName,
  DeviceInput,
}

interface IndexedGraph {
  // Map from node name to index
  index: { [key: string]: number },
  nodes: [string, UnitType][],
  edges: number[][],
}

// Converts a GraphFormat to an indexed graph that is easier to traverse.
function formatToIndexedGraph(format: GraphFormat): IndexedGraph {
  let g: IndexedGraph = {
    index: {},
    nodes: [],
    edges: [],
  }

  //////////////////////////////////////////////////////////////////////
  // Find all device input and output nodes
  let counter = 0;
  format.sensors.forEach(function(sensor) {
    sensor.state_keys.forEach(function(value) {
      let node = `#${sensor.id}.${value}`
      g.nodes.push([node, UnitType.DeviceInput])
      g.index[node] = counter++
    })
    sensor.returns.forEach(function(value) {
      let node = `${sensor.id}.${value}`
      g.nodes.push([node, UnitType.DeviceOutput])
      g.index[node] = counter++
    })
  })
  // Find module nodes
  format.moduleIds.forEach(function(value) {
    let node = value.global
    g.nodes.push([node, UnitType.Module])
    g.index[node] = counter++
  })
  // Find domain name nodes
  format.edges.network.forEach(function(edge) {
    let node = edge.domain
    g.nodes.push([node, UnitType.DomainName])
    g.index[node] = counter++
  })

  //////////////////////////////////////////////////////////////////////
  // Create an adjacency list for each node
  g.nodes.forEach(function() {
    g.edges.push([])
  })
  // Add data edges
  // The start node is either a device or a module,
  // and the end node is always a module.
  format.edges.data.forEach(function(edge) {
    let end = g.index[edge.module_id]
    let maybeDeviceOutput = `${edge.out_id}.${edge.out_ret}`
    if (maybeDeviceOutput in g.index) {
      let start = g.index[maybeDeviceOutput]
      g.edges[start].push(end)
    } else if (edge.out_id in g.index) {
      let start = g.index[edge.out_id]
      g.edges[start].push(end)
    } else {
      console.error(`start not found in data edge: ${edge}`)
    }
  })
  // Add state edges
  // The start node is always a module, and the end node always a device.
  format.edges.state.forEach(function(edge) {
    let start = g.index[edge.module_id]
    let end = g.index[`#${edge.sensor_id}.${edge.sensor_key}`]
    g.edges[start].push(end)
  })
  // Add network edges
  format.edges.network.forEach(function(edge) {
    let start = g.index[edge.module_id]
    let end = g.index[edge.domain]
    g.edges[start].push(end)
  })

  return g
}

export module PipelineHTML {
  let g: Graph = undefined;

  let form = document.getElementById('pipeline-form')

  export function renderInitialForm(graph: Graph) {
    g = graph
  }

  // Load the pipeline permissions from the current graph.
  // Allow all by default.
  export function load() {
    // TODO: Find all paths in the graph `g` from a device to the network,
    // a device to another device, or the network to a device.
    let paths: [string, UnitType][] = []
    let index = formatToIndexedGraph(g.getGraphFormat())
    console.log(index)

    // TODO: Sort by the first string.
    // TODO: Map to HTML elements.
    // TODO: Store the elements in `inputs` and `labels`.
  }
}
