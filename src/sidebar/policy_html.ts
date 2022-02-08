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


// Returns a string in the corresponding color given the type.
// device output = orange, module = black,
// domain name = green, device input = red.
function unitToTextNode(node: [string, UnitType]): HTMLSpanElement {
  let span = document.createElement('span')
  span.innerText = node[0]
  switch(node[1]) {
    case UnitType.DeviceOutput: {
      span.style.color = "orange"
      break
    }
    case UnitType.DomainName: {
      span.style.color = "green"
      break
    }
    case UnitType.DeviceInput: {
      span.style.color = "red"
      break
    }
  }
  return span
}

export module PipelineHTML {
  let g: Graph = undefined;

  let form = document.getElementById('pipeline-form')
  let inputs: HTMLInputElement[] = [];
  let labels: HTMLLabelElement[] = [];

  export function renderInitialForm(graph: Graph) {
    g = graph
  }

  // Load the pipeline permissions from the current graph.
  // Allow all by default.
  export function load() {
    //////////////////////////////////////////////////////////////////////
    // Find all paths in the graph `g` from a device to the network,
    // a device to another device, or the network to a device.
    let perms: [string, UnitType][][] = []
    let index = formatToIndexedGraph(g.getGraphFormat())
    let queue: [string, UnitType][][] = index.nodes
      .filter(node => node[1] == UnitType.DeviceOutput ||
        node[1] == UnitType.DomainName)
      .map(node => [node]);
    while (queue.length > 0) {
      let path = queue.shift()
      let node = path[path.length - 1]
      if (!(node[0] in index.index)) {
        console.error(`node ${node[0]} not found in index`)
        return
      }
      index.edges[index.index[node[0]]].forEach(function(nextNodeID) {
        let startNode = path[0]
        let nextNode = index.nodes[nextNodeID]
        let nextPath = Object.assign([], path)
        nextPath.push(nextNode)
        // Check the end condition for the node
        if (nextNode[1] == UnitType.DeviceInput ||
          (startNode[1] == UnitType.DeviceOutput && nextNode[1] == UnitType.DomainName)) {
          perms.push(nextPath)
        } else {
          queue.push(nextPath)
        }
      })
    }
    perms.sort()

    //////////////////////////////////////////////////////////////////////
    // Update the HTML for pipeline permissions.
    // Remove previous elements
    while (form.hasChildNodes()) {
      form.removeChild(form.lastChild)
    }
    inputs = []
    labels = []
    // Map permissions to HTML elements
    let permsLabels = perms.map(function(rawPath) {
      let label = document.createElement("label")
      rawPath.map(unitToTextNode).map(function(span, index) {
        if (index > 0) {
          let arrow = document.createTextNode(" → ")
          label.appendChild(arrow)
        }
        label.appendChild(span)
      })
      return label
    })
    // Add a new input and label element for each permission
    permsLabels.forEach(function(label, index) {
      let input = document.createElement("input")
      input.type = "checkbox"
      input.value = index.toString()
      input.checked = true

      form.appendChild(input)
      form.appendChild(label)
      form.appendChild(document.createElement('br'))
      inputs.push(input)
      labels.push(label)
    })
  }
}
