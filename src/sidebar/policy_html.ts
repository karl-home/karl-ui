import { Graph, GraphFormat } from '../graph';

export module PipelineHTML {
  let g: Graph = undefined;

  let form = document.getElementById('pipeline-form')
  let inputs: HTMLInputElement[] = [];
  let labels: HTMLLabelElement[] = [];

  export function renderInitialForm(graph: Graph) {
    g = graph
  }

  // Return an array of the indexes of each pipeline that is checked
  export function getAllowedPipelines(): [string, boolean][] {
    return inputs.map(value => ["", value.checked]);
  }

  export function setPipelines(pipelines: [string, boolean][]) {
    // Remove previous elements
    while (form.hasChildNodes()) {
      form.removeChild(form.lastChild)
    }
    inputs = []
    labels = []

    // Add a new input and label element for each pipeline
    pipelines.forEach(function(value, index) {
      let input = document.createElement("input")
      let label = document.createElement("label")
      input.type = "checkbox"
      input.value = index.toString()
      input.checked = value[1]
      label.innerText = value[0]

      form.appendChild(input)
      form.appendChild(label)
      form.appendChild(document.createElement('br'))
      inputs.push(input)
      labels.push(label)
    })
  }
}

export module ContextHTML {
  let g: Graph = undefined;
  let textarea = document.createElement('textarea');

  export function renderInitialForm(graph: Graph) {
    g = graph

    // Create all the form elements
    textarea.setAttribute('rows', '5');
    textarea.setAttribute('cols', '42');
    textarea.setAttribute('placeholder', 'Ex:\n'
      + 'light.state PUBLIC\n'
      + '#camera.livestream PRIVATE\n'
      + 'speaker.speech picovoice');
    textarea.setAttribute('id', 'security-contexts')

    // Add elements to form UI
    let form = document.getElementById('context-form')
    form.appendChild(textarea)
  }

  export function getSecurityContexts(): [string, string][] {
    // Formatted as '<tag> <context>'
    //
    // See example:
    // light.state PUBLIC
    // #camera.livestream PRIVATE
    // speaker.speech picovoice
    return textarea.value.split('\n').filter(val => val != '')
      .map(val => val.split(' '))
      .map(val => [val[0], val[1]]);
  }

  export function setSecurityContexts(contexts: [string, string][]) {
    textarea.value = contexts.map(ctx => ctx[0] + " " + ctx[1]).join("\n");
  }
}
