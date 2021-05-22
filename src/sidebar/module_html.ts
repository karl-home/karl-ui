import { ModuleInner, Graph } from '../graph';
import { Network } from '../network';

export module ModuleHTML {
  // graph elements
  let g: Graph = undefined;
  let activeModule: { node: HTMLDivElement; inner: ModuleInner } = undefined;

  // form elements
  let moduleIDSpan: HTMLSpanElement;
  let networkSpan: HTMLSpanElement;
  let intervalSpan: HTMLSpanElement;
  let descriptionSpan: HTMLSpanElement;
  let buttonContainer: HTMLDivElement = undefined;

  function _renderDefaultForm() {
    moduleIDSpan.innerText = '-'
    networkSpan.innerText = '-'
    intervalSpan.innerText = '-'
    descriptionSpan.innerText = '-'
    if (buttonContainer !== undefined) {
      buttonContainer.remove()
      buttonContainer = undefined;
    }
  }

  function _renderEditForm(node: HTMLDivElement, inner: ModuleInner) {
    moduleIDSpan.innerText = inner.id
    networkSpan.innerText = ''
    intervalSpan.innerText = ''
    descriptionSpan.innerText = inner.value.description.module

    const currentDomains = inner.network_edges.map(edge => edge.domain)
    const domains = Object.keys(inner.value.description.network).sort()
    domains.forEach(
      function(domain) {
        let input = document.createElement('input')
        let label = document.createElement('label')
        input.type = 'checkbox'
        input.name = domain
        input.value = domain
        if (currentDomains.includes(domain)) {
          input.checked = true
        }
        label.setAttribute('for', domain)
        label.innerText = domain
        networkSpan.appendChild(input)
        networkSpan.appendChild(label)
        networkSpan.appendChild(document.createElement('br'))
      });
    let networkInput = document.createElement('textarea')
    networkInput.rows = 1
    networkInput.className = 'network-input'
    networkInput.placeholder = 'Extra domains: one per line.'
    networkInput.appendChild(document.createTextNode(currentDomains
      .filter(domain => !domains.includes(domain)).join('\n')))
    // hide textarea unless we need to assign arbitrary domains
    networkInput.style.display = 'none'
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
    let saveButton = document.createElement('button')
    saveButton.innerText = 'Save'
    saveButton.onclick = function(e) {
      e.preventDefault()
      g.remove_network_edges(inner.id)
      networkInput.value.split('\n')
        .filter(domain => domain)
        .forEach(function(domain) {
          g.add_network_edge({ module_id: inner.id, domain: domain })
        })
      Array.from(document.getElementById('module-form').getElementsByTagName('input'))
        .filter(input => input.type == 'checkbox')
        .filter(checkbox => checkbox.checked)
        .map(checkbox => checkbox.value)
        .map(function(domain) {
          g.add_network_edge({ module_id: inner.id, domain: domain })
        });
      g.set_interval({
        module_id: inner.id,
        duration_s: parseInt(intervalInput.value),
      })
      _renderViewForm(node, inner)
    }
    let deleteButton = document.createElement('button')
    deleteButton.innerText = 'Delete'
    deleteButton.onclick = function(e) {
      e.preventDefault()
      g.remove_module(inner.id)
      _renderDefaultForm()
    }
    let cancelButton = document.createElement('button')
    cancelButton.innerText = 'Cancel'
    cancelButton.onclick = function(e) {
      e.preventDefault()
      _renderViewForm(node, inner)
    }
    buttonContainer.appendChild(saveButton)
    buttonContainer.appendChild(deleteButton)
    buttonContainer.appendChild(cancelButton)
    document.getElementById('module-form').appendChild(buttonContainer)
  }

  function _renderViewForm(node: HTMLDivElement, inner: ModuleInner) {
    activeModule = { node: node, inner: inner }
    activeModule.node.style.outline = '3px solid #ffd700'
    moduleIDSpan.innerText = inner.id
    networkSpan.innerText = inner.network_edges.map(edge => edge.domain).join('\n')
    if (inner.hasOwnProperty('interval')) {
      intervalSpan.innerText = inner.interval.toString()
    } else {
      intervalSpan.innerText = '-'
    }
    descriptionSpan.innerText = inner.value.description.module

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
    let spawnButton = document.createElement('button')
    spawnButton.innerText = 'Spawn'
    spawnButton.onclick = function(e) {
      e.preventDefault()
      Network.spawnModule(inner.id)
    }
    buttonContainer.appendChild(editButton)
    buttonContainer.appendChild(spawnButton)
    document.getElementById('module-form').appendChild(buttonContainer)
  }

  export function clickModule(node: HTMLDivElement, inner: ModuleInner) {
    if (activeModule !== undefined) {
      activeModule.node.style.outline = ''
      if (activeModule.inner.id == inner.id) {
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
    let description = document.createElement('p')
    description.appendChild(document.createTextNode('Description: '))
    descriptionSpan = document.createElement('span')
    description.appendChild(descriptionSpan)

    // Add the elements to the UI
    let form = document.getElementById('module-form')
    form.appendChild(moduleID)
    form.appendChild(network)
    form.appendChild(interval)
    form.appendChild(description)
    _renderDefaultForm()
  }
}