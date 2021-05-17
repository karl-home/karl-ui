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
