import * as _ from 'lodash';
import './style.css';
// import Icon from './icon.png';
import { figure4, figure5, SENSORS, MODULES } from './examples';
import { Graph } from './graph';

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

let g = new Graph();
document.getElementById("button-A").onclick = function() {
  g.add_sensor(SENSORS["camera"])
};
document.getElementById("button-B").onclick = function() {
  g.add_module(MODULES["person_detection"])
};
document.getElementById("button-C").onclick = function() {
  g.add_module(MODULES["differential_privacy"])
};
document.getElementById("button-D").onclick = function() {
  g.add_data_edge({
    stateless: true,
    out_id: "camera",
    out_ret: "motion",
    module_id: "person_detection",
    module_param: "image",
  })
};
document.getElementById("button-E").onclick = function() {
  g.add_data_edge({
    stateless: true,
    out_id: "person_detection",
    out_ret: "count",
    module_id: "differential_privacy",
    module_param: "count",
  })
};
