import { Network } from './network';

const container = document.getElementById('data-container')
const form = document.getElementById('data-form')
const canvas = document.getElementById('data-canvas')

export module DataCanvas {
  const tagSelect = document.createElement('select');
  const typeSelect = document.createElement('select');
  const dataTypes = ['none', 'raw', 'image', 'json']

  function createDownloadLink(
    timestamp: string,
    data: Uint8Array,
  ): HTMLAnchorElement {
    let elem = document.createElement('a')
    let blob = new Blob([data], {type: 'octet/stream'})
    elem.href = window.webkitURL.createObjectURL(blob);
    elem.download = timestamp;
    elem.innerText = timestamp;
    return elem;
  }

  function createRawNode(timestamp: string, data: Uint8Array) {
    let button = document.createElement('button')
    let textNode = document.createElement('div')
    button.innerText = 'Show'
    textNode.innerText = String(data)
    textNode.style.display = 'none'
    button.onclick = function() {
      if (textNode.style.display == 'none') {
        button.innerText = 'Hide'
        textNode.style.display = ''
      } else {
        button.innerText = 'Show'
        textNode.style.display = 'none'
      }
    }
    canvas.appendChild(document.createTextNode(
      '(' + data.length + ' bytes)'))
    canvas.appendChild(button)
    canvas.appendChild(document.createElement('br'))
    canvas.appendChild(textNode)
  }

  function createImageNode(timestamp: string, data: Uint8Array) {
    canvas.appendChild(document.createElement('br'))
    let img = document.createElement('img')
    var base64Data = btoa(
      new Uint8Array(data).reduce(function (blob, byte) {
        return blob + String.fromCharCode(byte);
      }, ''));
    img.src = 'data:image/png;base64,' + base64Data
    canvas.appendChild(img)
    canvas.appendChild(document.createElement('br'))
  }

  function createJsonNode(timestamp: string, data: Uint8Array) {
    canvas.appendChild(document.createElement('br'))
    let text = new TextDecoder().decode(data.buffer)
    let json = JSON.stringify(text, undefined, 2)
    canvas.appendChild(document.createTextNode(json))
    canvas.appendChild(document.createElement('br'))
  }

  function readTag() {
    let tag = tagSelect.value;
    let ty = typeSelect.value;
    Network.readTag(tag, function(results) {
      if (results.timestamps.length != results.data.length) {
        console.error("unexpected get data result:", results);
      } else {
        console.log(results);
        while (canvas.hasChildNodes()) {
          canvas.removeChild(canvas.lastChild)
        }
        for (var i = 0; i < results.data.length; i++) {
          let timestamp = results.timestamps[i];
          let data = results.data[i];
          let elem = createDownloadLink(timestamp, data)
          canvas.appendChild(elem)
          if (ty == 'raw') {
            createRawNode(timestamp, data)
          } else if (ty == 'image') {
            createImageNode(timestamp, data)
          } else if (ty == 'json') {
            createJsonNode(timestamp, data)
          } else {
            canvas.appendChild(document.createElement('br'))
          }
        }
      }
    })
  }

  export function initialize() {
    // tag select
    let tag = document.createElement('p')
    tag.appendChild(document.createTextNode('Tag: '))
    tag.appendChild(tagSelect)
    Network.listTags(function(tags) {
      console.log('listTags:', tags)
      tags.forEach(function(tag) {
        let option = document.createElement('option')
        option.value = tag
        option.innerText = tag
        tagSelect.appendChild(option)
      })
    })

    // data type select
    let ty = document.createElement('p')
    ty.appendChild(document.createTextNode('Data Type: '))
    ty.appendChild(typeSelect)
    dataTypes.forEach(function(dataType) {
      let option = document.createElement('option')
      option.value = dataType
      option.innerText = dataType
      typeSelect.appendChild(option)
    })

    // submit button
    let button = document.createElement('button')
    button.innerText = 'Submit'
    button.onclick = readTag

    // add all elements to form
    form.appendChild(tag)
    form.appendChild(ty)
    form.appendChild(button)
  }
}
