import { Sensor, Graph } from '../graph';
import { MockNetwork } from '../network';

export module SensorModals {
  let g: Graph;
  let sensors: {
    [key: string]: {
      sensor: Sensor;
      html: HTMLDivElement;
    }
  } = {};

  function clearModals() {
    Object.values(sensors).forEach(s => s.html.remove())
    sensors = {}
  }

  function confirmSensor(sensorId: string) {
    if (sensors.hasOwnProperty(sensorId)) {
      sensors[sensorId].html.remove()
      MockNetwork.confirmSensor(sensorId)
      g.add_sensor(sensors[sensorId].sensor)
      delete sensors[sensorId]
    } else {
      console.error(`failed to confirm missing sensor: ${sensorId}`)
    }
  }

  function cancelSensor(sensorId: string) {
    if (sensors.hasOwnProperty(sensorId)) {
      sensors[sensorId].html.remove()
      MockNetwork.cancelSensor(sensorId)
      delete sensors[sensorId]
    } else {
      console.error(`failed to confirm missing sensor: ${sensorId}`)
    }
  }

  function genSensorModal(sensor: Sensor, attestation: string): HTMLDivElement {
    let modal = document.createElement('div')
    let sensorId = document.createElement('p')
    sensorId.appendChild(document.createTextNode('Sensor ID: '))
    sensorId.appendChild(document.createTextNode(sensor.id))
    let attestContainer = document.createElement('p')
    attestContainer.appendChild(document.createTextNode('Attestation: '))
    attestContainer.appendChild(document.createTextNode(attestation))

    // generate buttons
    let buttons = document.createElement('div')
    buttons.className = 'button-container'
    let confirmButton = document.createElement('button')
    confirmButton.innerText = 'Confirm'
    confirmButton.onclick = function(e) {
      e.preventDefault()
      confirmSensor(sensor.id)
    }
    let cancelButton = document.createElement('button')
    cancelButton.innerText = 'Cancel'
    cancelButton.onclick = function(e) {
      e.preventDefault()
      cancelSensor(sensor.id)
    }
    buttons.appendChild(confirmButton)
    buttons.appendChild(cancelButton)

    // generate modal
    modal.className = 'modal'
    modal.appendChild(sensorId)
    modal.appendChild(attestContainer)
    modal.appendChild(buttons)
    return modal
  }

  function refreshModals() {
    clearModals()
    let container = document.getElementById('sensor-modals')
    MockNetwork.getSensors().forEach(function(val) {
      let modal = genSensorModal(val.sensor, val.attestation)
      container.appendChild(modal)
      sensors[val.sensor.id] = {
        sensor: val.sensor,
        html: modal,
      }
    })
  }

  export function renderInitialForm(graph: Graph) {
    g = graph
    refreshModals()
    let buttonContainer = document.createElement('p')
    let button = document.createElement('button')
    button.innerText = 'Refresh'
    button.onclick = function(e) {
      e.preventDefault()
      refreshModals()
    }
    buttonContainer.appendChild(button)
    document.getElementById('sensor-form').appendChild(buttonContainer)
  }
}

export module SensorList {
  let sensorIds: string[] = []
  let sensorList: HTMLUListElement;

  function renderSensorList() {
    if (sensorList) {
      sensorList.remove()
    }
    sensorList = document.createElement('ul')
    sensorIds.forEach(function(sensorId) {
      let li = document.createElement('li')
      li.appendChild(document.createTextNode(sensorId))
      sensorList.appendChild(li)
    })
    document.getElementById('sensor-list').appendChild(sensorList)
  }

  export function addSensor(sensorId: string) {
    if (!sensorIds.includes(sensorId)) {
      sensorIds.push(sensorId)
      sensorIds.sort()
      renderSensorList()
    } else {
      console.error(`sensor is already registered ${sensorId}`)
    }
  }

  export function removeSensor(sensorId: string) {
    let index = sensorIds.indexOf(sensorId)
    if (index != -1) {
      sensorIds.splice(index, 1)
      renderSensorList()
    } else {
      console.error(`error removing sensor that does not exist: ${sensorId}`)
    }
  }
}
