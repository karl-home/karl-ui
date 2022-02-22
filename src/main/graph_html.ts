import { ModuleID, SensorInner, ModuleInner } from '../graph';
import { EdgeHTML } from '../sidebar/edge_html';
import { ModuleHTML } from '../sidebar/module_html';

type NodeType = 'module' | 'sensor';

const TOP_INITIAL = 100;
const TOP_DELTA = 120;
const LEFT_INITIAL = 30;
const LEFT_DELTA = 170;
const UNCONNECTED_LEFT = 30;
const UNCONNECTED_TOP_INITIAL = 50;
const UNCONNECTED_VERTICAL_DELTA = 100;
const COLS = 4
let nnodes = 0

let vCoordUnconnectedNode = {
  coord: UNCONNECTED_TOP_INITIAL,
};
export { vCoordUnconnectedNode }

function _nextNodeLocation(): { top: number, left: number } {
  nnodes += 1
  vCoordUnconnectedNode.coord = vCoordUnconnectedNode.coord + UNCONNECTED_VERTICAL_DELTA
  return {
    top: vCoordUnconnectedNode.coord,
    left: UNCONNECTED_LEFT,
  }
}

const graph = document.getElementById('graph');
const canvas = document.getElementById("canvas");
const COLORS = {
  data: '#2196f3',
  network: 'green',
  state: 'red',
}

function _initArrows() {
  function genMarker(endarrow: boolean, name: string, fill: string) {
    let marker = document.createElementNS('http://www.w3.org/2000/svg', 'marker');
    if (endarrow) {
      marker.id = 'endarrow-' + name;
      marker.setAttribute('refX', '10');
    } else {
      marker.id = 'startarrow-' + name;
      marker.setAttribute('refX', '0');
    }
    marker.setAttribute('markerWidth', '10');
    marker.setAttribute('markerHeight', '7');
    marker.setAttribute('refY', '3.5');
    marker.setAttribute('orient', 'auto');
    marker.setAttribute('markerUnits', 'strokeWidth');

    let polygon = document.createElementNS('http://www.w3.org/2000/svg', 'polygon');
    if (endarrow) {
      polygon.setAttribute('points', '0 0, 10 3.5, 0 7');
    } else {
      polygon.setAttribute('points', '10 0, 10 7, 0 3.5');
    }
    polygon.setAttribute('fill', fill);
    marker.appendChild(polygon);
    return marker;
  }

  let defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.appendChild(genMarker(true, 'data', COLORS.data));
  defs.appendChild(genMarker(true, 'network', COLORS.network));
  defs.appendChild(genMarker(false, 'network', COLORS.network));
  defs.appendChild(genMarker(true, 'state', COLORS.state));
  canvas.appendChild(defs);
}
_initArrows();

export module GraphHTML {
  function _dragElement(
    elem: HTMLDivElement,
    outgoingEdges: SVGLineElement[],
    incomingEdges: SVGLineElement[],
    moduleInner?: ModuleInner,
  ) {
    // pos3 pos4 are the mouse's current position
    // pos1 pos2 are the deltas
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    var dragged = false;
    elem.onmousedown = dragMouseDown;

    function dragMouseDown(e: MouseEvent) {
      e.preventDefault();
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      document.onmousemove = elementDrag;
    }

    function elementDrag(e: MouseEvent) {
      e.preventDefault();
      dragged = true;
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      let x = parseFloat(elem.getAttribute('left')) - pos1;
      let y = parseFloat(elem.getAttribute('top')) - pos2;
      elem.setAttribute('left', x.toString());
      elem.setAttribute('top', y.toString());
      elem.style.left = x + 'px';
      elem.style.top = y + 'px';

      // re-render arrows to and from the dragged element
      outgoingEdges.forEach(function(line) {
        let x1 = parseFloat(line.getAttribute('x1')) - pos1;
        let y1 = parseFloat(line.getAttribute('y1')) - pos2;
        line.setAttribute('x1', x1.toString());
        line.setAttribute('y1', y1.toString());
      })
      incomingEdges.forEach(function(line) {
        let x2 = parseFloat(line.getAttribute('x2')) - pos1;
        let y2 = parseFloat(line.getAttribute('y2')) - pos2;
        line.setAttribute('x2', x2.toString());
        line.setAttribute('y2', y2.toString());
      })
    }

    function closeDragElement(e: MouseEvent) {
      e.preventDefault()
      let tagName = (e.target as HTMLElement).tagName
      if (!dragged && moduleInner !== undefined && tagName != 'BUTTON') {
        ModuleHTML.clickModule(elem, moduleInner)
      }
      dragged = false;
      document.onmouseup = null;
      document.onmousemove = null;
    }
  }

  //if top == null, then go with _nextNodeLocation(), otherwise use
  //given height
  function _renderNode(
    id: string,
    ty: NodeType,
    inputDescs: { [key: string] : string },
    outputDescs: { [key: string] : string },
    inputs: string[],
    outputs: string[],
    outgoingButtons: HTMLButtonElement[],
    incomingButtons: HTMLButtonElement[],
    top?: number,
    left?: number
  ): HTMLDivElement {
    let node = document.createElement("div");
    node.className = "node " + ty;
    if(top == null){
      let loc = _nextNodeLocation()
      node.style.top = loc.top.toString() + 'px';
      node.setAttribute('top', loc.top.toString())
      node.style.left = loc.left.toString() + 'px';
      node.setAttribute('left', loc.left.toString())
    } else {
      node.style.top = top.toString() + 'px';
      node.setAttribute('top', top.toString())
      node.style.left = left.toString() + 'px';
      node.setAttribute('left', left.toString())
    }
    let header = document.createElement('div');
    header.className = 'node-header'
    inputs.forEach(function(val) {
      let button = document.createElement('button');
      let description = inputDescs[val] || ''
      button.className = 'hover-button'
      button.setAttribute('node-id', id)
      button.setAttribute('node-type', ty)
      button.setAttribute('name', val)
      button.setAttribute('description', description)
      button.onclick = function(e) {
        EdgeHTML.clickTarget(button)
      };
      let tooltip = document.createElement('span');
      tooltip.className = 'tooltip tooltip-top'
      tooltip.appendChild(document.createTextNode(val + ' - ' + description))
      button.appendChild(tooltip)
      header.appendChild(button)
      incomingButtons.push(button)
    })
    let footer = document.createElement('span');
    outputs.forEach(function(val) {
      let button = document.createElement('button');
      let description = outputDescs[val]
      button.className = 'hover-button'
      button.setAttribute('node-id', id)
      button.setAttribute('node-type', ty)
      button.setAttribute('name', val)
      button.setAttribute('description', description)
      button.onclick = function(e) {
        EdgeHTML.clickSource(button)
      };
      let tooltip = document.createElement('span');
      tooltip.className = 'tooltip tooltip-bottom'
      tooltip.appendChild(document.createTextNode(val + ' - ' + description))
      button.appendChild(tooltip)
      footer.appendChild(button)
      outgoingButtons.push(button)
    })
    let p = document.createElement("p");
    p.appendChild(document.createTextNode(id));
    node.appendChild(header);
    node.appendChild(p);
    node.appendChild(footer);
    // modify the DOM
    graph.appendChild(node);
    return node;
  }

  export function renderModuleProperties(inner: ModuleInner) {
    // set the background-color of the header based on the network edges
    let header: HTMLElement =
      inner.html.getElementsByClassName('node-header')[0] as HTMLElement
    if (inner.network_edges.length > 0) {
      header.style.backgroundColor = '#32CD32'
    } else {
      header.style.backgroundColor = ''
    }

    // add a clock icon if the module is on an interval schedule
    let images = inner.html.getElementsByTagName('IMG')
    if (images.length > 0) {
      images[0].remove()
    }
    if (inner.hasOwnProperty('interval')) {
      const img = new Image()
      img.src = require('../img/clock.png')
      img.className = 'icon'
      inner.html.appendChild(img)
    }
  }

  export function renderModule(id: string, inner: ModuleInner, top?: number, left?: number): HTMLDivElement {
    let node
    if(typeof top != 'undefined'){
      node = _renderNode(
        id,
        'module',
        inner.value.description.params,
        inner.value.description.returns,
        inner.value.params,
        inner.value.returns,
        inner.outgoing_buttons,
        inner.incoming_buttons,
        top,
        left
      )
    } else {
      node = _renderNode(
        id,
        'module',
        inner.value.description.params,
        inner.value.description.returns,
        inner.value.params,
        inner.value.returns,
        inner.outgoing_buttons,
        inner.incoming_buttons,
      )
    }
    _dragElement(node, inner.outgoing_edges, inner.incoming_edges, inner);
    return node
  }

  export function renderSensor(
    id: string,
    inner: SensorInner,
    outTop?: number,
    inTop?: number,
    outLeft?: number,
    inLeft?: number
  ): [HTMLDivElement, HTMLDivElement] {
    let nodeOut
    let nodeIn
    if(typeof outTop != 'undefined'){
      nodeOut = _renderNode(
        id,
        'sensor',
        {},
        inner.value.description.returns,
        [],
        inner.value.returns,
        inner.outgoing_buttons,
        inner.incoming_buttons,
        outTop,
        outLeft
      )
    } else {
      nodeOut = _renderNode(
        id,
        'sensor',
        {},
        inner.value.description.returns,
        [],
        inner.value.returns,
        inner.outgoing_buttons,
        inner.incoming_buttons,
      )
      
    }
    if(typeof inTop != 'undefined'){
      nodeIn = _renderNode(
        id,
        'sensor',
        inner.value.description.state_keys,
        {},
        inner.value.state_keys,
        [],
        inner.outgoing_buttons,
        inner.incoming_buttons,
        inTop,
        inLeft
      )
    } else {
      nodeIn = _renderNode(
        id,
        'sensor',
        inner.value.description.state_keys,
        {},
        inner.value.state_keys,
        [],
        inner.outgoing_buttons,
        inner.incoming_buttons,
      )
    }

    
    // only affect the correct edges when dragged
    _dragElement(nodeOut, inner.outgoing_edges, []);
    _dragElement(nodeIn, [], inner.incoming_edges);
    return [nodeOut, nodeIn]
  }

  export function renderDataEdge(
    sourceNode: HTMLElement,
    sourceButton: HTMLButtonElement,
    sourceOffset: number,
    targetNode: HTMLElement,
    targetButton: HTMLButtonElement,
    targetOffset: number,
    stateless: boolean,
  ): SVGLineElement {
    let x1 = sourceNode.offsetLeft + sourceNode.offsetWidth / 2 + sourceOffset;
    let y1 = sourceNode.offsetTop + sourceNode.offsetHeight;
    let x2 = targetNode.offsetLeft + targetNode.offsetWidth / 2 + targetOffset;
    let y2 = targetNode.offsetTop;
    // https://dev.to/gavinsykes/appending-a-child-to-an-svg-using-pure-javascript-1h9g
    let line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1.toString());
    line.setAttribute('y1', y1.toString());
    line.setAttribute('x2', x2.toString());
    line.setAttribute('y2', y2.toString());
    line.setAttribute('marker-end', 'url(#endarrow-data)');
    line.setAttribute('stroke', '#2196f3');
    line.setAttribute('stroke-width', '3px');
    if (!stateless) {
      line.setAttribute('stroke-dasharray', '4');
    }
    line.onclick = function(e) {
      EdgeHTML.clickEdge(sourceButton, targetButton, 'data', stateless);
    }
    canvas.append(line);
    return line;
  }

  export function renderStateEdge(
    sourceNode: HTMLElement,
    sourceButton: HTMLButtonElement,
    sourceOffset: number,
    targetNode: HTMLElement,
    targetButton: HTMLButtonElement,
    targetOffset: number,
  ): SVGLineElement {
    let x1 = sourceNode.offsetLeft + sourceNode.offsetWidth / 2 + sourceOffset;
    let y1 = sourceNode.offsetTop + sourceNode.offsetHeight;
    let x2 = targetNode.offsetLeft + targetNode.offsetWidth / 2 + targetOffset;
    let y2 = targetNode.offsetTop;
    // https://dev.to/gavinsykes/appending-a-child-to-an-svg-using-pure-javascript-1h9g
    let line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
    line.setAttribute('x1', x1.toString());
    line.setAttribute('y1', y1.toString());
    line.setAttribute('x2', x2.toString());
    line.setAttribute('y2', y2.toString());
    line.setAttribute('marker-end', 'url(#endarrow-state)');
    line.setAttribute('stroke', 'red');
    line.setAttribute('stroke-width', '3px');
    line.onclick = function(e) {
      EdgeHTML.clickEdge(sourceButton, targetButton, 'state');
    }
    canvas.append(line);
    return line;
  }

  export function reset() {
    nnodes = 0
  }
}
