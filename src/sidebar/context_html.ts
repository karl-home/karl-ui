import { Graph } from '../graph';

export module ContextHTML {
  let g: Graph = undefined;

  export function renderInitialForm(graph: Graph) {
    g = graph

    // Create all the form elements
    let textarea = document.createElement('textarea');
    textarea.setAttribute('rows', '10');
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
}
