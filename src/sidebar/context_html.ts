import { Graph, GraphFormat } from '../graph';

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
