import { Graph } from '../graph';

export module EdgeHTML {
  type EdgeType = 'data' | 'network' | 'state';

  // graph elements
  let g: Graph = undefined;
  let sourceElem: HTMLButtonElement = undefined;
  let targetElem: HTMLButtonElement = undefined;

  // form elements
  let sourceName: HTMLSpanElement;
  let targetName: HTMLSpanElement;
  let edgeTypeName: HTMLSpanElement;
  let statelessP: HTMLParagraphElement;
  let statelessCheckbox: HTMLInputElement;
  let buttonContainer: HTMLDivElement;

  function _removeButtonContainer() {
    if (buttonContainer !== undefined) {
      buttonContainer.remove()
      buttonContainer = undefined;
    }
  }

  export function resetForm() {
    sourceName.innerText = '-'
    targetName.innerText = '-'
    edgeTypeName.innerText = '-'
    statelessP.style.visibility = 'hidden'
    statelessCheckbox.checked = true
    if (sourceElem !== undefined) {
      sourceElem.style.backgroundColor = ''
      sourceElem = undefined;
    }
    if (targetElem !== undefined) {
      targetElem.style.backgroundColor = ''
      targetElem = undefined;
    }
    _removeButtonContainer()
  }

  function _renderDeleteButtons() {
    function deleteEdge(e: MouseEvent, g: Graph) {
      e.preventDefault()
      let edgeType = edgeTypeName.innerText;
      if (edgeType == 'data') {
        let stateless: boolean = statelessCheckbox.checked;
        g.remove_data_edge({
          stateless: stateless,
          out_id: sourceElem.getAttribute('node-id'),
          out_ret: sourceElem.getAttribute('name'),
          module_id: targetElem.getAttribute('node-id'),
          module_param: targetElem.getAttribute('name'),
        })
        resetForm()
      } else if (edgeType == 'state') {
        g.remove_state_edge({
          module_id: sourceElem.getAttribute('node-id'),
          module_ret: sourceElem.getAttribute('name'),
          sensor_id: targetElem.getAttribute('node-id'),
          sensor_key: targetElem.getAttribute('name'),
        })
        resetForm()
      } else {
        console.error(`tried to delete unknown edge type: ${edgeType}`)
      }
    }

    if (buttonContainer !== undefined) {
      buttonContainer.remove()
    }
    buttonContainer = document.createElement('div')
    buttonContainer.setAttribute('form-type', 'delete')
    let form = document.getElementById('edge-form')
    let button = document.createElement('button')
    button.appendChild(document.createTextNode('Delete Edge'))
    button.onclick = function(e) {
      deleteEdge(e, g)
    }
    buttonContainer.appendChild(button)
    form.appendChild(buttonContainer)
    statelessCheckbox.disabled = true;
  }

  function _renderAddButtons() {
    function addEdge(e: MouseEvent, g: Graph) {
      e.preventDefault()
      if (sourceElem === undefined || targetElem === undefined) {
        console.error('need to select a source and target')
        return
      }
      let edgeType = edgeTypeName.innerText
      if (edgeType == 'data') {
        let stateless: boolean = statelessCheckbox.checked;
        g.add_data_edge({
          stateless: stateless,
          out_id: sourceElem.getAttribute('node-id'),
          out_ret: sourceElem.getAttribute('name'),
          module_id: targetElem.getAttribute('node-id'),
          module_param: targetElem.getAttribute('name'),
        })
      } else if (edgeType == 'state') {
        g.add_state_edge({
          module_id: sourceElem.getAttribute('node-id'),
          module_ret: sourceElem.getAttribute('name'),
          sensor_id: targetElem.getAttribute('node-id'),
          sensor_key: targetElem.getAttribute('name'),
        })
      }
      resetForm()
    }

    _removeButtonContainer()
    buttonContainer = document.createElement('div')
    buttonContainer.setAttribute('form-type', 'add')
    let form = document.getElementById('edge-form')
    let button = document.createElement('button')
    button.appendChild(document.createTextNode('Add Edge'))
    button.onclick = function(e) {
      addEdge(e, g)
    }
    buttonContainer.appendChild(button)
    form.appendChild(buttonContainer)
    statelessCheckbox.disabled = false;
  }

  export function renderInitialForm(graph: Graph) {
    g = graph

    // Create all the form elements except the buttons
    let source = document.createElement('p')
    sourceName = document.createElement('span')
    sourceName.innerText = '-'
    source.appendChild(document.createTextNode('Source: '))
    source.appendChild(sourceName);
    let target = document.createElement('p')
    targetName = document.createElement('span')
    targetName.innerText = '-'
    target.appendChild(document.createTextNode('Target: '))
    target.appendChild(targetName);
    let edgeType = document.createElement('p')
    edgeTypeName = document.createElement('span')
    edgeTypeName.innerText = '-'
    edgeType.appendChild(document.createTextNode('Type: '))
    edgeType.appendChild(edgeTypeName);
    statelessCheckbox = document.createElement('input')
    statelessCheckbox.setAttribute('type', 'checkbox')
    statelessCheckbox.checked = true
    statelessP = document.createElement('p')
    statelessP.appendChild(document.createTextNode('Stateless? '))
    statelessP.appendChild(statelessCheckbox)
    statelessP.style.visibility = 'hidden'

    // Add elements to form UI
    let form = document.getElementById('edge-form')
    form.appendChild(source)
    form.appendChild(target)
    form.appendChild(edgeType)
    form.appendChild(statelessP)
  }

  function _setEdgeTypeAndFormVisibility() {
    if (sourceElem === undefined || targetElem === undefined) {
      edgeTypeName.innerText = '-'
      statelessP.style.visibility = 'hidden'
      _removeButtonContainer()
    } else {
      let sourceNodeTy = sourceElem.getAttribute('node-type')
      let targetNodeTy = targetElem.getAttribute('node-type')
      if (sourceNodeTy != 'module' && sourceNodeTy != 'sensor') {
        console.error(`bad state: source node type = ${sourceNodeTy}`)
      }
      if (targetNodeTy == 'module') {
        edgeTypeName.innerText = 'data'
        statelessP.style.visibility = 'visible'
      } else if (targetNodeTy == 'sensor') {
        edgeTypeName.innerText = 'state'
        statelessP.style.visibility = 'hidden'
      } else {
        console.error(`bad state: target node type = ${targetNodeTy}`)
      }
      _renderAddButtons()
    }
  }

  export function clickEdge(
    sourceButton: HTMLButtonElement,
    targetButton: HTMLButtonElement,
    edgeType: EdgeType,
    stateless?: boolean,
  ): void {
    if (sourceElem == sourceButton && targetElem == targetButton) {
      resetForm()
    } else {
      resetForm()
      _setSourceElem(sourceButton)
      _setTargetElem(targetButton)
      if (edgeType == 'data') {
        statelessCheckbox.checked = stateless;
      }
      _renderDeleteButtons()
    }
  }

  function _setSourceElem(elem: HTMLButtonElement) {
    let id = elem.getAttribute('node-id')
    let val = elem.getAttribute('name')
    let description = elem.getAttribute('description')
    let name = `${val} (${id}) - ${description}`
    if (sourceElem === elem) {
      sourceElem.style.backgroundColor = '';
      sourceElem = undefined
      sourceName.innerText = '-'
    } else {
      if (sourceElem !== undefined) {
        sourceElem.style.backgroundColor = ''
      }
      sourceElem = elem
      sourceElem.style.backgroundColor = '#ffd700'
      sourceName.innerText = name
    }
    _setEdgeTypeAndFormVisibility()
  }

  function _setTargetElem(elem: HTMLButtonElement) {
    let id = elem.getAttribute('node-id')
    let val = elem.getAttribute('name')
    let description = elem.getAttribute('description')
    let name = `${val} (${id}) - ${description}`
    if (targetElem === elem) {
      targetElem.style.backgroundColor = '';
      targetElem = undefined
      targetName.innerText = '-'
    } else {
      if (targetElem !== undefined) {
        targetElem.style.backgroundColor = ''
      }
      targetElem = elem
      targetElem.style.backgroundColor = '#ffd700'
      targetName.innerText = name
    }
    _setEdgeTypeAndFormVisibility()
  }

  export function clickSource(elem: HTMLButtonElement) {
    if (buttonContainer !== undefined) {
      if (buttonContainer.getAttribute('form-type') == 'delete') {
        resetForm()
      }
    }
    _setSourceElem(elem)
  }

  export function clickTarget(elem: HTMLButtonElement) {
    if (buttonContainer !== undefined) {
      if (buttonContainer.getAttribute('form-type') == 'delete') {
        resetForm()
      }
    }
    _setTargetElem(elem)
  }
}