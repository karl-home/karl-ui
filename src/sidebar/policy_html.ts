import { ModuleID, StateEdge, Graph, GraphFormat } from '../graph';

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
    // Note: Backwards edge for permissions that start at a domain and
    // end at a device input. This type of edge should only be traversed
    // when the first node is a domain. This avoids the situation of
    // duplicating paths when an intermediate node has network access.
    g.edges[end].push(start)
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
  let originalGraph: Graph = undefined;
  let overlayGraph: Graph = undefined;

  let form = document.getElementById('pipeline-form')
  let inputs: HTMLInputElement[] = [];
  let paths: [string, UnitType][][] = [];

  function genUpdateButton(): HTMLButtonElement {
    let button = document.createElement('button')
    button.innerText = 'Update Overlay'
    button.onclick = function(e) {
      e.preventDefault()
      updateOverlayGraph()
    }
    return button
  }

  function updateOverlayGraph() {
    // Duplicate the original graph as the overlay graph.
    const originalFormat = originalGraph.getGraphFormat()
    overlayGraph.reset()
    overlayGraph.setGraphFormat(originalFormat)

    // Identify which pipeline permissions to revoke
    let deniedPaths: [string, UnitType][][] = inputs
      .map(function(value, index): [HTMLInputElement, number] {
        return [value, index]
      })
      .filter(value => !value[0].checked)
      .map(value => paths[value[1]]);

    // Identify the actions needed to revoke disallowed permissions.
    // The action is to delete the last node, which either removes
    // network access or a state edge.
    let networkToRemove: Set<ModuleID> = new Set()
    let stateToRemove: Set<StateEdge> = new Set()
    deniedPaths.forEach(function(path) {
      let endNode = path[path.length - 1]
      let prevNode = path[path.length - 2]
      if (endNode[1] == UnitType.DomainName) {
        networkToRemove.add(prevNode[0])
      } else if (endNode[1] == UnitType.DeviceInput) {
        const splitEndNode = endNode[0].split('.')
        const module_id = prevNode[0]
        const sensor_id = splitEndNode[0].substring(1)
        const sensor_key = splitEndNode[1]
        originalFormat.edges.state.filter(edge =>
          edge.module_id == module_id
            && edge.sensor_id == sensor_id
            && edge.sensor_key == sensor_key
        ).forEach(edge => stateToRemove.add(edge))
      } else {
        console.error('expected permission to terminate in domain or input')
      }
    })

    // Update the overlay graph to reflect these actions.
    networkToRemove.forEach(function(moduleID) {
      let removed = overlayGraph.remove_network_edges(moduleID)
      if (!removed) {
        console.error(`failed to remove network edge from ${moduleID}`)
      }
    })
    stateToRemove.forEach(function(edge) {
      let removed = overlayGraph.remove_state_edge(edge)
      if (!removed) {
        console.error(`failed to remove state edge ${edge}`)
      }
    })
  }

  export function renderInitialForm(graph: Graph, overlay: Graph) {
    originalGraph = graph
    overlayGraph = overlay
    form.appendChild(genUpdateButton())
  }

  // Load the pipeline permissions from the current graph.
  // Allow all by default.
  export function load() {
    //////////////////////////////////////////////////////////////////////
    // Find all paths in the graph `g` from a device to the network,
    // a device to another device, or the network to a device.
    let perms: [string, UnitType][][] = []
    let index = formatToIndexedGraph(originalGraph.getGraphFormat())
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
        } else if (nextNode[1] == UnitType.DomainName) {
          // do nothing if reaching an intermediate node with network access
          // to avoid traversing the edge back to the main module
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
    paths = []
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
      paths.push(rawPath)
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
    })
    // Add the update button
    form.appendChild(genUpdateButton())
  }
}
