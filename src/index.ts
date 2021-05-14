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

dragElement(document.getElementById("draggable1"))
dragElement(document.getElementById("draggable2"))
dragElement(document.getElementById("draggable3"))

const graph = document.getElementById("graph");
document.getElementById("figure4").onclick = function() {
	graph.innerHTML = "";
	graph.appendChild(figure4().render());
};
document.getElementById("figure5").onclick = function() {
	graph.innerHTML = "";
	graph.appendChild(figure5().render());
};
