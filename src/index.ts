import * as _ from 'lodash';
import './css/style.css';
import { Examples } from './examples';
import { Graph, GraphFormat } from './graph';
import { EdgeHTML } from './sidebar/edge_html';
import { ModuleHTML } from './sidebar/module_html';
import { ModuleRepo } from './sidebar/module_repo';
import { SensorModals } from './sidebar/sensor_html';
import { HostModals } from './sidebar/host_html';
import { Network, _sensorWithId } from './network';
import { LegendHTML } from './legend';

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

function initializeLegend() {
  LegendHTML.initialize()
  var modal = document.getElementById("simpleModal");
  var modalBtn = document.getElementById("modalBtn");
  var closeBtn = document.getElementsByClassName("closeBtn")[0];
  modalBtn.addEventListener("click", openModal);
  closeBtn.addEventListener("click", closeModal);
  function openModal() {
    modal.style.display = "block";
  }
  function closeModal() {
    modal.style.display = "none";
  }
}

function initializeSidebar() {
  EdgeHTML.renderInitialForm(g)
  ModuleHTML.renderInitialForm(g)
  ModuleRepo.renderInitialForm(g)
  SensorModals.renderInitialForm(g)
  HostModals.renderInitialForm()
  document.getElementById('reset-button').onclick = function() {
    g.reset()
  }
  document.getElementById('refresh-button').onclick = function() {
    g.reset()
    document.getElementById('host-refresh-button').click()
    document.getElementById('sensor-refresh-button').click()
    Network.getGraph(function(f: GraphFormat) {
      g.setGraphFormat(f)
    })
  }
  document.getElementById('save-button').onclick = function() {
    let format = g.getGraphFormat()
    Network.saveGraph(format)
  }
}

function initializeExampleButtons() {
  document.getElementById("figure4").onclick = function() {
    Examples.figure4(g)
  };
  document.getElementById("figure5").onclick = function() {
    Examples.figure5(g)
  };
  document.getElementById("button-A").onclick = function() {
    Examples.diffPrivPipeline(g)
  };
  document.getElementById("button-B").onclick = function() {
    Examples.searchPipeline(g)
  };
  document.getElementById("button-C").onclick = function() {
    Examples.truePipeline(g)
  };
}

function initializeGraph() {
  Network.getGraph(function(f: GraphFormat) {
    g.setGraphFormat(f)
  })
}

initializeNavbar()
initializeLegend()
initializeSidebar()
initializeExampleButtons()
initializeGraph()
