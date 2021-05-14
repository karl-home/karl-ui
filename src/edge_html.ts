export module EdgeHTML {
  export type NodeType = 'module' | 'sensor';

  let sourceName: HTMLSpanElement;
  let targetName: HTMLSpanElement;
  let edgeTypeName: HTMLSpanElement;
  let statelessP: HTMLParagraphElement;

  function _addEdge(e: MouseEvent) {
    e.preventDefault()
    console.log('add edge')
  }

  function _renderInitialForm() {
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
    let checkbox = document.createElement('input')
    checkbox.setAttribute('type', 'checkbox')
    checkbox.checked = true
    statelessP = document.createElement('p')
    statelessP.appendChild(document.createTextNode('Stateless? '))
    statelessP.appendChild(checkbox)
    statelessP.style.visibility = 'hidden'
    let button = document.createElement('button')
    button.appendChild(document.createTextNode('Add Edge'))
    button.onclick = _addEdge

    // Add all elements to form UI
    let form = document.getElementById('edge-form')
    form.appendChild(source)
    form.appendChild(target)
    form.appendChild(edgeType)
    form.appendChild(statelessP)
    form.appendChild(button)
  }

  _renderInitialForm()

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