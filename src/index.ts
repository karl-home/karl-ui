import * as _ from 'lodash';
import './css/style.css';
import { figure4, figure5, SENSORS, MODULES } from './examples';
import { Graph } from './graph';
import { EdgeHTML } from './sidebar/edge_html';
import { ModuleHTML } from './sidebar/module_html';

const g = new Graph();

function initializeNavbar() {
  let navbar = document.getElementsByClassName('navbar')[0]
  let navbarElems = Array.from(navbar.getElementsByTagName('A'))
    .map(elem => (elem as HTMLElement));
  let navbarNames = navbarElems.map(elem => elem.getAttribute('name'));
  navbarElems.forEach(function(elem) {
    elem.onclick = function() {
      // set active class
      navbarElems.forEach(function(other) {
        if (other.classList.contains('active')) {
          other.classList.remove('active')
        }
      })
      elem.classList.add('active')

      // set container display
      navbarNames.forEach(function(field) {
        let id = field + '-container'
        let container = document.getElementById(id)
        if (field != elem.getAttribute('name')) {
          container.style.display = 'none'
        } else {
          container.style.display = ''
        }
      })
    }
  })
  navbarElems[0].click()
}

function initializeSidebar() {
  EdgeHTML.renderInitialForm(g)
  ModuleHTML.renderInitialForm(g)
  document.getElementById('reset-button').onclick = function() {
    g.reset()
  }
}

function initializeExampleButtons() {
  document.getElementById("figure4").onclick = function() {
    figure4(g)
  };
  document.getElementById("figure5").onclick = function() {
    figure5(g)
  };
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
}

initializeNavbar()
initializeSidebar()
initializeExampleButtons()
