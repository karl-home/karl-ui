import { Graph } from './graph';

export module EdgeHTML {
  export type NodeType = 'module' | 'sensor';

  let sourceName: HTMLSpanElement;
  let targetName: HTMLSpanElement;
  let edgeTypeName: HTMLSpanElement;
  let statelessP: HTMLParagraphElement;
  let statelessCheckbox: HTMLInputElement;

  function _addEdge(e: MouseEvent, g: Graph) {
    e.preventDefault()
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
    } else {
      console.error(`unhandled edge type: ${edgeType}`)
    }

    // clear the form
    sourceName.innerText = '-'
    targetName.innerText = '-'
    edgeTypeName.innerText = '-'
    statelessP.style.visibility = 'hidden'
    statelessCheckbox.checked = true
    sourceElem.style.backgroundColor = ''
    targetElem.style.backgroundColor = ''
    sourceElem = undefined;
    targetElem = undefined;
  }

  export function renderInitialForm(g: Graph) {
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
    let button = document.createElement('button')
    button.appendChild(document.createTextNode('Add Edge'))
    button.onclick = function(e) {
      _addEdge(e, g)
    }

    // Add all elements to form UI
    let form = document.getElementById('edge-form')
    form.appendChild(source)
    form.appendChild(target)
    form.appendChild(edgeType)
    form.appendChild(statelessP)
    form.appendChild(button)
  }

  let sourceElem: HTMLButtonElement = undefined;
  let targetElem: HTMLButtonElement = undefined;

  function _setEdgeTypeAndStatelessVisibility() {
    if (sourceElem === undefined || targetElem === undefined) {
      edgeTypeName.innerText = '-'
      statelessP.style.visibility = 'hidden'
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
    }
  }

  export function clickSource(elem: HTMLButtonElement, name: string) {
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
    _setEdgeTypeAndStatelessVisibility()
  }

  export function clickTarget(elem: HTMLButtonElement, name: string) {
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
    _setEdgeTypeAndStatelessVisibility()
  }
}