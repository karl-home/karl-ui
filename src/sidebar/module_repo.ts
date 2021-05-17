import { Module, Graph } from '../graph';
import { MockNetwork } from '../network';

export module ModuleRepo {
  let g: Graph = undefined;
  let mod: Module = undefined;

  // form elements
  let moduleIdInput: HTMLInputElement;
  let registerButton: HTMLButtonElement
  let container: HTMLDivElement;
  let descriptionElem: HTMLSpanElement;
  let paramsElem: HTMLUListElement;
  let returnsElem: HTMLUListElement;
  let networkElem: HTMLUListElement;
  let error: HTMLSpanElement

  function resetForm() {
    registerButton.disabled = true
    moduleIdInput.value = ''
    container.style.display = 'none'
    descriptionElem.innerText = ''
    paramsElem.innerText = ''
    returnsElem.innerText = ''
    networkElem.innerText = ''
    error.innerText = ''
  }

  function populateForm(mod: Module) {
    registerButton.disabled = false
    paramsElem.innerText = ''
    returnsElem.innerText = ''
    networkElem.innerText = ''

    descriptionElem.innerText = mod.description.module
    mod.params.forEach(function(param) {
      let li = document.createElement('li')
      li.innerText = param + ' - ' + mod.description.params[param]
      paramsElem.appendChild(li)
    })
    mod.returns.forEach(function(ret) {
      let li = document.createElement('li')
      li.innerText = ret + ' - ' + mod.description.returns[ret]
      returnsElem.appendChild(li)
    })
    mod.network.forEach(function(domain) {
      let li = document.createElement('li')
      li.innerText = domain + ' - ' + mod.description.network[domain]
      returnsElem.appendChild(li)
    })
  }

  function onInputKey(e: Event) {
    let moduleId = moduleIdInput.value
    if (moduleId) {
      mod = MockNetwork.checkModuleRepo(moduleId)
      if (mod) {
        populateForm(mod)
        container.style.display = ''
        error.innerText = ''
      } else {
        registerButton.disabled = true
        container.style.display = 'none'
        error.innerText = 'Invalid module ID.'
      }
    } else {
      resetForm()
    }
  }

  function clickRegisterModule(e: Event) {
    e.preventDefault()
    g.add_module(mod)
    resetForm()
  }

  export function renderInitialForm(graph: Graph) {
    g = graph

    function genModuleIdInput(): HTMLParagraphElement {
      let p = document.createElement('p')
      moduleIdInput = document.createElement('input')
      moduleIdInput.type = 'text'
      moduleIdInput.oninput = onInputKey
      p.appendChild(document.createTextNode('Global Module ID: '))
      p.appendChild(moduleIdInput)
      return p
    }

    function genDescription(): HTMLParagraphElement {
      let p = document.createElement('p')
      descriptionElem = document.createElement('span')
      p.appendChild(document.createTextNode('Description: '))
      p.appendChild(descriptionElem)
      return p
    }

    function genParams(): HTMLParagraphElement {
      let p = document.createElement('p')
      paramsElem = document.createElement('ul')
      p.appendChild(document.createTextNode('Parameters:'))
      p.appendChild(paramsElem)
      return p
    }

    function genReturns(): HTMLParagraphElement {
      let p = document.createElement('p')
      returnsElem = document.createElement('ul')
      p.appendChild(document.createTextNode('Return Values:'))
      p.appendChild(returnsElem)
      return p
    }

    function genNetwork(): HTMLParagraphElement {
      let p = document.createElement('p')
      networkElem = document.createElement('ul')
      p.appendChild(document.createTextNode('Network Domains:'))
      p.appendChild(networkElem)
      return p
    }

    function genButton(): HTMLButtonElement {
      registerButton = document.createElement('button')
      registerButton.innerText = 'Register Module'
      registerButton.onclick = clickRegisterModule
      registerButton.disabled = true
      return registerButton
    }

    function genErrorText(): HTMLSpanElement {
      error = document.createElement('span')
      error.className = 'error'
      return error
    }

    container = document.createElement('div')
    container.appendChild(genDescription())
    container.appendChild(genParams())
    container.appendChild(genReturns())
    container.appendChild(genNetwork())
    container.style.display = 'none'

    let form = document.getElementById('register-module-form')
    form.appendChild(genModuleIdInput())
    form.appendChild(container)
    form.appendChild(genButton())
    form.appendChild(genErrorText())
  }
}

export module ModuleList {
  let moduleIds: string[] = []
  let moduleList: HTMLUListElement = undefined

  function renderModuleList() {
    if (moduleList) {
      moduleList.remove()
    }
    moduleList = document.createElement('ul')
    moduleIds.forEach(function(moduleId) {
      let li = document.createElement('li')
      li.appendChild(document.createTextNode(moduleId))
      moduleList.appendChild(li)
    })
    document.getElementById('registered-modules').appendChild(moduleList)
  }

  export function addModule(moduleId: string) {
    if (!moduleIds.includes(moduleId)) {
      moduleIds.push(moduleId)
      moduleIds.sort()
      renderModuleList()
    } else {
      console.error(`module is already registered ${moduleId}`)
    }
  }

  export function removeModule(moduleId: string) {
    let index = moduleIds.indexOf(moduleId)
    if (index != -1) {
      moduleIds.splice(index, 1)
      renderModuleList()
    } else {
      console.error(`error removing module that does not exist: ${moduleId}`)
    }
  }
}
