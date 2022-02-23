import * as _ from 'lodash';
import './css/style.css';
import { Examples } from './examples';
import { DataCanvas } from './data_canvas';
import { Graph, GraphFormat } from './graph';
import { GraphHTML } from './main/graph_html';
import { EdgeHTML } from './sidebar/edge_html';
import { PipelineHTML } from './sidebar/policy_html';
import { ModuleHTML } from './sidebar/module_html';
import { ModuleRepo } from './sidebar/module_repo';
import { SensorModals } from './sidebar/sensor_html';
import { HostModals } from './sidebar/host_html';
import { Network, _sensorWithId } from './network';
import { LegendHTML } from './legend';

const g = new Graph(document.getElementById('graph-original'), false);
const overlay = new Graph(document.getElementById('graph-overlay'), true);

function initializeNavbar() {
  let navbar = document.getElementsByClassName('navbar')[0]
  let navbarElems = Array.from(navbar.getElementsByTagName('A'))
    .map(elem => (elem as HTMLElement));
  let navbarNames = navbarElems.map(elem => elem.getAttribute('name'));
  const mainCanvas = document.getElementById('main-container');
  const dataCanvas = document.getElementById('data-container');
  mainCanvas.style.display = ''
  dataCanvas.style.display = 'none'
  navbarElems.forEach(function(elem) {
    elem.onclick = function() {
      // set active class
      navbarElems.forEach(function(other) {
        if (other.classList.contains('active')) {
          other.classList.remove('active')
        }
      })
      elem.classList.add('active')
      let activeField = elem.getAttribute('name')

      // set container display
      navbarNames.forEach(function(field) {
        let id = field + '-container'
        let container = document.getElementById(id)
        if (field != activeField) {
          container.style.display = 'none'
        } else {
          container.style.display = ''
        }
      })

      // set main or data canvas
      if (activeField == 'homecloud') {
        mainCanvas.style.display = 'none'
        dataCanvas.style.display = ''
      } else {
        mainCanvas.style.display = ''
        dataCanvas.style.display = 'none'
      }
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
  PipelineHTML.renderInitialForm(g, overlay)
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
    let format = overlay.getGraphFormat()
    Network.saveGraph(format)
  }
  document.getElementById('toggle-button').onclick = function() {
    let button = document.getElementById('toggle-button')
    if (overlay.html.style.visibility == 'hidden') {
      button.innerHTML = "Original / <b>Overlay</b>"
      g.html.style.visibility = 'hidden'
      overlay.html.style.visibility = 'visible'
    } else {
      button.innerHTML = "<b>Original</b> / Overlay"
      g.html.style.visibility = 'visible'
      overlay.html.style.visibility = 'hidden'
    }
  }
}

function initializeExampleButtons() {
  document.getElementById("pipeline-i").onclick = function() {
    Examples.pipeline_i(g)
  };
  document.getElementById("pipeline-ii").onclick = function() {
    Examples.pipeline_ii(g)
  };
  document.getElementById("pipeline-iii").onclick = function() {
    Examples.pipeline_iii(g)
  };
  document.getElementById("figure3a").onclick = function() {
    Examples.figure3a(g)
  };
  document.getElementById("figure3b").onclick = function() {
    Examples.figure3b(g)
  };
  document.getElementById("figure3c").onclick = function() {
    Examples.figure3c(g)
  };
  document.getElementById("figure9a").onclick = function() {
    Examples.figure9a(g)
  };
  document.getElementById("figure9b").onclick = function() {
    Examples.figure9b(g)
  };
}

function initializeCanvas() {
  Network.getGraph(function(f: GraphFormat) {
    g.setGraphFormat(f)
  })
  DataCanvas.initialize()
}

initializeNavbar()
initializeLegend()
initializeSidebar()
initializeExampleButtons()
initializeCanvas()
