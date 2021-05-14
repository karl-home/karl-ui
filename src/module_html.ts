import { ModuleInner, Graph } from './graph';

export module ModuleHTML {
  // graph elements
  let g: Graph = undefined;
  let activeModule: { node: HTMLDivElement; inner: ModuleInner } = undefined;

  // form elements
  let moduleIDSpan: HTMLSpanElement;
  let networkSpan: HTMLSpanElement;
  let intervalSpan: HTMLSpanElement;
  let buttonContainer: HTMLDivElement = undefined;

  function _renderDefaultForm() {
    moduleIDSpan.innerText = '-'
    networkSpan.innerText = '-'
    intervalSpan.innerText = '-'
    if (buttonContainer !== undefined) {
      buttonContainer.remove()
      buttonContainer = undefined;
    }
  }

  function _renderEditForm() {
    moduleIDSpan.innerText = ''
    networkSpan.innerText = ''
    // <textarea rows="3" class="network-input"></textarea>
    intervalSpan.innerText = ''
    // <input type="number" class="interval-input"></input>

    if (buttonContainer !== undefined) {
      buttonContainer.remove()
    }
    buttonContainer = document.createElement('div')
    let button = document.createElement('button')
    button.innerText = 'Save'
    button.onclick = function(e) {
      // TODO
    }
    buttonContainer.appendChild(button)
    document.getElementById('module-form').appendChild(buttonContainer)
  }

  export function renderViewForm(
    node: HTMLDivElement,
    inner: ModuleInner,
  ) {
    if (activeModule !== undefined) {
      activeModule.node.style.border = ''
      if (activeModule.inner.value.id == inner.value.id) {
        activeModule = undefined
        _renderDefaultForm()
        return
      }
    }

    activeModule = { node: node, inner: inner }
    activeModule.node.style.border = '3px solid #ffd700'
    moduleIDSpan.innerText = inner.value.id
    networkSpan.innerText = JSON.stringify(inner.network_edges)
    if (inner.hasOwnProperty('interval')) {
      intervalSpan.innerText = inner.interval.toString()
    } else {
      intervalSpan.innerText = '-'
    }

    if (buttonContainer !== undefined) {
      buttonContainer.remove()
    }
    buttonContainer = document.createElement('div')
    let button = document.createElement('button')
    button.innerText = 'Edit'
    button.onclick = function(e) {
      // TODO
    }
    buttonContainer.appendChild(button)
    document.getElementById('module-form').appendChild(buttonContainer)
  }

  export function renderInitialForm(graph: Graph) {
    g = graph;

    // Create the initial form elements
    let moduleID = document.createElement('p')
    moduleID.appendChild(document.createTextNode('Module ID: '))
    moduleIDSpan = document.createElement('span')
    moduleID.appendChild(moduleIDSpan);
    let network = document.createElement('p')
    network.appendChild(document.createTextNode('Network: '))
    networkSpan = document.createElement('span')
    network.appendChild(networkSpan);
    let interval = document.createElement('p')
    interval.appendChild(document.createTextNode('Interval (s): '))
    intervalSpan = document.createElement('span')
    interval.appendChild(intervalSpan);

    // Add the elements to the UI
    let form = document.getElementById('module-form')
    form.appendChild(moduleID)
    form.appendChild(network)
    form.appendChild(interval)
    _renderDefaultForm()
  }
}