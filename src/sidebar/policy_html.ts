import { Graph } from '../graph';

export module PipelineHTML {
  let g: Graph = undefined;

  let form = document.getElementById('pipeline-form')

  export function renderInitialForm(graph: Graph) {
    g = graph
  }

  // Load the pipeline permissions from the current graph.
  // Allow all by default.
  export function load() {
    // TODO: unimplemented
  }
}
