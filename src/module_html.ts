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

  function _renderEditForm(node: HTMLDivElement, inner: ModuleInner) {
    moduleIDSpan.innerText = inner.value.id
    networkSpan.innerText = ''
    intervalSpan.innerText = ''

    let networkInput = document.createElement('textarea')
    networkInput.rows = 3
    networkInput.className = 'network-input'
    networkInput.placeholder = 'Enter one domain per line.'
    networkInput.appendChild(document.createTextNode(
      inner.network_edges.map(edge => edge.domain).join('\n')))
    networkSpan.appendChild(networkInput)
    let intervalInput = document.createElement('input')
    intervalInput.type = 'number'
    intervalInput.className = 'interval-input'
    if (inner.hasOwnProperty('interval')) {
      intervalInput.value = inner.interval.toString()
    }
    intervalSpan.appendChild(intervalInput)

    if (buttonContainer !== undefined) {
      buttonContainer.remove()
    }
    buttonContainer = document.createElement('div')
    let button = document.createElement('button')
    button.innerText = 'Save'
    button.onclick = function(e) {
      e.preventDefault()
      g.remove_network_edges(inner.value.id)
      networkInput.value.split('\n').forEach(function(domain) {
        if (domain) {
          g.add_network_edge({ module_id: inner.value.id, domain: domain })
        }
      })
      g.set_interval(inner.value.id, parseInt(intervalInput.value))
      _renderViewForm(node, inner)
    }
    buttonContainer.appendChild(button)
    document.getElementById('module-form').appendChild(buttonContainer)
  }

  function _renderViewForm(node: HTMLDivElement, inner: ModuleInner) {
    activeModule = { node: node, inner: inner }
    activeModule.node.style.outline = '3px solid #ffd700'
    moduleIDSpan.innerText = inner.value.id
    networkSpan.innerText = inner.network_edges.map(edge => edge.domain).join('\n')
    if (inner.hasOwnProperty('interval')) {
      intervalSpan.innerText = inner.interval.toString()
    } else {
      intervalSpan.innerText = '-'
    }

    if (buttonContainer !== undefined) {
      buttonContainer.remove()
    }
    buttonContainer = document.createElement('div')
    let editButton = document.createElement('button')
    editButton.innerText = 'Edit'
    editButton.onclick = function(e) {
      e.preventDefault()
      _renderEditForm(node, inner)
    }
    let deleteButton = document.createElement('button')
    deleteButton.innerText = 'Delete'
    deleteButton.onclick = function(e) {
      e.preventDefault()
      g.remove_module(inner.value.id)
      _renderDefaultForm()
    }
    buttonContainer.appendChild(editButton)
    buttonContainer.appendChild(deleteButton)
    document.getElementById('module-form').appendChild(buttonContainer)
  }

  export function clickModule(node: HTMLDivElement, inner: ModuleInner) {
    if (activeModule !== undefined) {
      activeModule.node.style.outline = ''
      if (activeModule.inner.value.id == inner.value.id) {
        activeModule = undefined
        _renderDefaultForm()
        return
      }
    }
    _renderViewForm(node, inner)
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