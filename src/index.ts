import * as _ from 'lodash';
import './style.css';
import { figure4, figure5, SENSORS, MODULES } from './examples';
import { Graph } from './graph';
import { EdgeHTML } from './edge_html';
import { ModuleHTML } from './module_html';

function component() {
  const element = document.createElement('div');

  // Lodash, now imported by this script
  element.innerHTML = _.join(['Hello', 'webpack'], ' ');
  element.classList.add('hello');

  return element;
}

let g = new Graph();
document.getElementById("figure4").onclick = function() {
  figure4(g)
};
document.getElementById("figure5").onclick = function() {
  figure5(g)
};

EdgeHTML.renderInitialForm(g)
ModuleHTML.renderInitialForm(g)
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
document.getElementById('reset-button').onclick = function() {
  g.reset()
}
