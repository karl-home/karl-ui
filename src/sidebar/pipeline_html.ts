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
    inputs.forEach(function(value) {
      value.remove()
    })
    labels.forEach(function(value) {
      value.remove()
    })
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
