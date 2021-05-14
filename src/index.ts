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

const graph = document.getElementById("graph");
document.getElementById("figure4").onclick = function() {
	graph.innerHTML = "";
	graph.appendChild(figure4().render());
};
document.getElementById("figure5").onclick = function() {
	graph.innerHTML = "";
	graph.appendChild(figure5().render());
};
