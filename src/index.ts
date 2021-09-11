import * as _ from 'lodash';
import './css/style.css';
import { Examples } from './examples';
import { DataCanvas } from './data_canvas';
import { Graph, GraphFormat } from './graph';
import { EdgeHTML } from './sidebar/edge_html';
import { ContextHTML } from './sidebar/context_html';
import { ModuleHTML } from './sidebar/module_html';
import { ModuleRepo } from './sidebar/module_repo';
import { SensorModals } from './sidebar/sensor_html';
import { HostModals } from './sidebar/host_html';
import { Network, _sensorWithId } from './network';

const g = new Graph();

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

function initializeSidebar() {
  EdgeHTML.renderInitialForm(g)
  ModuleHTML.renderInitialForm(g)
  ContextHTML.renderInitialForm(g)
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
    Network.getGraph(function(f: GraphFormat, contexts: [string, string][]) {
      g.setGraphFormat(f)
      ContextHTML.setSecurityContexts(contexts)
    })
  }
  document.getElementById('save-button').onclick = function() {
    let format = g.getGraphFormat()
    let contexts = ContextHTML.getSecurityContexts()
    Network.saveGraph(format, contexts)
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
  document.getElementById("pipeline-iv").onclick = function() {
    Examples.pipeline_iv(g)
  };
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

function initializeCanvas() {
  Network.getGraph(function(f: GraphFormat, contexts: [string, string][]) {
    g.setGraphFormat(f)
    ContextHTML.setSecurityContexts(contexts)
  })
  DataCanvas.initialize()
}

initializeNavbar()
initializeSidebar()
initializeExampleButtons()
initializeCanvas()
