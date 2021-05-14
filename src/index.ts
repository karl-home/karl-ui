import * as _ from 'lodash';
import './style.css';
// import Icon from './icon.png';
import { figure4, figure5 } from './examples';

function component() {
  const element = document.createElement('div');

  // Lodash, now imported by this script
  element.innerHTML = _.join(['Hello', 'webpack'], ' ');
  element.classList.add('hello');

  // Add the image to our existing div.existing
  // const myIcon = new Image();
  // myIcon.src = Icon;

  // element.appendChild(myIcon);

  return element;
}

function dragElement(elem: HTMLElement) {
  var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  document.getElementById(elem.id + "-header").onmousedown = dragMouseDown;

  function dragMouseDown(e: MouseEvent) {
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e: MouseEvent) {
     e.preventDefault();
     pos1 = pos3 - e.clientX;
     pos2 = pos4 - e.clientY;
     pos3 = e.clientX;
     pos4 = e.clientY;
     elem.style.top = (elem.offsetTop - pos2) + "px";
     elem.style.left = (elem.offsetLeft - pos1) + "px";
  }

  function closeDragElement(e: MouseEvent) {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

const graph = document.getElementById("graph");
const canvas = document.getElementById("canvas");

function renderEdge(source_id: string, target_id: string) {
  const source: HTMLElement = document.getElementById(source_id);
  const target: HTMLElement = document.getElementById(target_id);
  let x1 = source.offsetLeft + source.offsetWidth / 2;
  let y1 = source.offsetTop + source.offsetHeight / 2;
  let x2 = target.offsetLeft + target.offsetWidth / 2;
  let y2 = target.offsetTop + target.offsetHeight / 2;
  // https://dev.to/gavinsykes/appending-a-child-to-an-svg-using-pure-javascript-1h9g
  let line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
  line.setAttribute('x1', x1.toString());
  line.setAttribute('y1', y1.toString());
  line.setAttribute('x2', x2.toString());
  line.setAttribute('y2', y2.toString());
  line.setAttribute('stroke', 'black');
  line.setAttribute('stroke-width', '2px');
  canvas.append(line);
  console.log(line);
}

dragElement(document.getElementById("camera"))
dragElement(document.getElementById("person_detection"))
dragElement(document.getElementById("differential_privacy"))
renderEdge("camera", "person_detection");
renderEdge("person_detection", "differential_privacy");

document.getElementById("figure4").onclick = function() {
	graph.innerHTML = "";
	graph.appendChild(figure4().render());
};
document.getElementById("figure5").onclick = function() {
	graph.innerHTML = "";
	graph.appendChild(figure5().render());
};
