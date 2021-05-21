import { Sensor, Module, GraphFormat } from './graph'
import { Host } from './sidebar/host_html'

interface ControllerSensor {
  id: string,
  stateKeys: [string, string][],
  returns: [string, string][],
}

interface ControllerGraphFormat {
  sensors: ControllerSensor[],
  moduleIds: {
    localId: string,
    globalId: string,
    params: string[],
    returns: string[],
  }[],
  dataEdges: [boolean, number, number, number, number][],
  stateEdges: [number, number, number, number][],
  networkEdges: [number, string][],
  intervals: [number, number][],
};

const SENSORS: { [key: string]: Sensor } = {
  mic: {
    id: 'mic',
    state_keys: ['response'],
    returns: ['sound'],
    description: {
      state_keys: {
        'response': 'text to playback as audio'
      },
      returns: {
        'sound': 'non-silence audio recording'
      }
    }
  },
  bulb: {
    id: 'bulb',
    state_keys: ['on'],
    returns: [],
    description: {
      state_keys: {
        'on': 'single bit determining whether the bulb is on or off'
      },
      returns: {}
    }
  },
  camera: {
    id: 'camera',
    state_keys: ['firmware', 'livestream'],
    returns: ['motion', 'streaming'],
    description: {
      state_keys: {
        'livestream': 'single bit determining whether the camera is streaming live video',
        'firmware': 'bytes of firmware to install',
      },
      returns: {
        'motion': 'motion-detected image',
        'streaming': 'live video stream',
      }
    }
  }
};

const MODULES: { [key: string]: Module } = {
  command_classifier: {
    globalId: 'command_classifier',
    params: ['sound'],
    returns: ['query_intent', 'light_intent'],
    network: [],
    description: {
      module: 'Classifies an audio command as a web query or a command ' +
        'to turn a light bulb on or off. Otherwise does not ouput an intent.',
      params: {
        'sound': 'single-channel audio file',
      },
      returns: {
        'query_intent': 'JSON { query: <query> }, where <query> is a text query',
        'light_intent': 'JSON { state: <state> }, where <state> is on or off',
      },
      network: {},
    }
  },
  search: {
    globalId: 'search',
    params: ['query_intent'],
    returns: ['response'],
    network: ['google.com'],
    description: {
      module: 'Searches Google given a query intent.',
      params: {
        'query_intent': 'JSON { query: <query> }, where <query> is a text query',
      },
      returns: {
        'response': 'text response to the query'
      },
      network: {
        'google.com': 'search engine'
      },
    },
  },
  light_switch: {
    globalId: 'light_switch',
    params: ['light_intent'],
    returns: ['state'],
    network: [],
    description: {
      module: 'Switches a light bulb on and off given an intent.',
      params: {
        'light_intent': 'JSON { state: <state> }, where <state> is on or off',
      },
      returns: {
        'state': 'a single byte 1 if <state> is on and 0 if <state> is off',
      },
      network: {},
    }
  },
  firmware_update: {
    globalId: 'firmware_update',
    params: [],
    returns: ['firmware'],
    network: ['firmware.com'],
    description: {
      module: 'Downloads firmware from a trusted domain and forwards to ' +
        'the device.',
      params: {},
      returns: {
        'firmware': 'bytes of the firmware to install'
      },
      network: {
        'firmware.com': 'firmware provider'
      },
    }
  },
  person_detection: {
    globalId: 'person_detection',
    params: ['image'],
    returns: ['box', 'all_count', 'count'],
    network: ['metrics.com'],
    description: {
      module: 'Detects a person in an image.',
      params: {
        'image': 'an image in a standard format e.g., PNG, JPEG',
      },
      returns: {
        'box': 'the original image, with boxes around detected persons',
        'all_count': 'number of detected objects',
        'count': 'number of detected persons',
      },
      network: {
        'metrics.com': 'share count statistics'
      },
    }
  },
  differential_privacy: {
    globalId: 'differential_privacy',
    params: ['count'],
    returns: [],
    network: ['metrics.com'],
    description: {
      module: 'Anonymize a numerical statistic.',
      params: {
        'count': 'a numerical statistic',
      },
      returns: {},
      network: {
        'metrics.com': 'share anonymized numerical statistics'
      },
    }
  },
  targz: {
    globalId: 'targz',
    params: ['files'],
    returns: ['video'],
    network: [],
    description: {
      module: 'Combine video files from the past hour into a single ' +
        'compressed video file.',
      params: {
        'files': 'video files to compress',
      },
      returns: {
        'video': 'compressed video file in targz format',
      },
      network: {},
    }
  },
  true: {
    globalId: 'true',
    params: [],
    returns: ['true'],
    network: [],
    description: {
      module: 'Output a single 1 bit.',
      params: {},
      returns: {
        'true': '1 bit',
      },
      network: {},
    }
  },
  false: {
    globalId: 'false',
    params: [],
    returns: ['false'],
    network: [],
    description: {
      module: 'Output a single 0 bit.',
      params: {},
      returns: {
        'false': '0 bit',
      },
      network: {},
    }
  },
};

export function _sensorWithId(old_id: string, new_id: string): Sensor {
  let sensor = SENSORS[old_id];
  if (sensor) {
    sensor = Object.assign({}, sensor)
    sensor.id = new_id
    return sensor
  } else {
    return undefined
  }
}

export module MockNetwork {
  export function checkModuleRepo(module_id: string): Module {
    return MODULES[module_id]
  }

  export function getGraph(): GraphFormat {
    console.error('unimplemented: get graph from mock network')
    return {
      sensors: [],
      moduleIds: [],
      edges: {
        data: [],
        state: [],
        network: [],
        interval: [],
      }
    }
  }

  export function saveGraph(format: GraphFormat) {
    console.error('unimplemented: save graph to mock network')
    console.log(format)
  }

  export function spawnModule(moduleId: string) {
    console.error(`unimplemented: spawn module ${moduleId}`)
  }

  export function confirmSensor(sensorId: string) {
    console.error(`unimplemented: confirm sensor in mock network ${sensorId}`)
  }

  export function confirmHost(hostId: string) {
    console.error(`unimplemented: confirm host in mock network ${hostId}`)
  }

  export function cancelSensor(sensorId: string) {
    console.error(`unimplemented: cancel sensor in mock network ${sensorId}`)
  }

  export function cancelHost(hostId: string) {
    console.error(`unimplemented: cancel host in mock network ${hostId}`)
  }

  export function getSensors(): { sensor: Sensor, attestation: string }[] {
    return [
      {
        sensor: _sensorWithId('mic', 'mic_2'),
        attestation: 'QWERTY9876',
      },
      {
        sensor: _sensorWithId('camera', 'camera_2'),
        attestation: 'QWERTY1234',
      },
      {
        sensor: _sensorWithId('bulb', 'bulb'),
        attestation: 'QWERTY1234',
      }
    ]
  }

  export function getHosts(): { confirmed: Host[], unconfirmed: string[] } {
    return {
      confirmed: [
        {
          id: 'MyOldLaptop',
          activeModules: 8,
          online: true,
        },
        {
          id: 'GinasMacbookPro',
          activeModules: 0,
          online: false,
        }
      ],
      unconfirmed: ['RaspberryPi3'],
    }
  }
}

export module Network {
  export function checkModuleRepo(module_id: string): Module {
    return MODULES[module_id]
  }

  export function getGraph(callback: (format: GraphFormat) => void) {
    console.log('getGraph')
    const xhr = new XMLHttpRequest()
    xhr.open('GET', '/graph')
    xhr.send()
    xhr.onreadystatechange = function(e) {
      if (this.readyState == 4) {
        if (this.status == 200) {
          console.log(this.responseText)
          // see endpoint.rs for format
          let g: ControllerGraphFormat = JSON.parse(this.responseText)
          let sensors: Sensor[] = g.sensors.map(function(sensor) {
            return {
              id: sensor.id,
              state_keys: sensor.stateKeys.map(x => x[0]),
              returns: sensor.returns.map(x => x[0]),
              description: {
                state_keys: sensor.stateKeys.reduce(function(
                  map: { [key: string]: string },
                  key_desc: [string, string],
                ) {
                  map[key_desc[0]] = key_desc[1];
                  return map;
                }, {}),
                returns: sensor.returns.reduce(function(
                  map: { [key: string]: string },
                  ret_desc: [string, string],
                ) {
                  map[ret_desc[0]] = ret_desc[1];
                  return map;
                }, {}),
              }
            }
          });
          let moduleIds = g.moduleIds.map(function(mod) {
            return {
              local: mod.localId,
              global: mod.globalId,
              params: mod.params,
              returns: mod.returns,
            }
          });

          let getEntity = (index: number) => {
            if (index < sensors.length) {
              let sensor = sensors[index]
              return {
                id: sensor.id,
                in: sensor.state_keys,
                out: sensor.returns,
              }
            } else if (index < sensors.length + moduleIds.length) {
              let mod = g.moduleIds[index - sensors.length]
              return {
                id: mod.localId,
                in: mod.params,
                out: mod.returns,
              }
            } else {
              console.error('invalid graph format')
              return undefined;
            }
          }

          let format: GraphFormat = {
            sensors: sensors,
            moduleIds: moduleIds,
            edges: {
              data: g.dataEdges.map(function(arr) {
                let out = getEntity(arr[1])
                let mod = getEntity(arr[3])
                return {
                  stateless: arr[0],
                  out_id: out.id,
                  out_ret: out.out[arr[2]],
                  module_id: mod.id,
                  module_param: mod.in[arr[4]],
                }
              }),
              state: g.stateEdges.map(function(arr) {
                let mod = getEntity(arr[0])
                let sensor = getEntity(arr[2])
                return {
                  module_id: mod.id,
                  module_ret: mod.out[arr[1]],
                  sensor_id: sensor.id,
                  sensor_key: sensor.out[arr[3]],
                }
              }),
              network: g.networkEdges.map(function(arr) {
                return {
                  module_id: getEntity(arr[0]).id,
                  domain: arr[1],
                }
              }),
              interval: g.intervals.map(function(arr) {
                return {
                  module_id: getEntity(arr[0]).id,
                  duration_s: arr[1],
                }
              }),
            }
          };
          callback(format)
        } else {
          console.error(this)
          console.error({
            responseURL: this.responseURL,
            status: this.status,
            statusText: this.statusText,
          })
        }
      }
    }
  }

  export function saveGraph(format: GraphFormat) {
    // TODO: parse graph
    console.log('saveGraph')
    const sensors = format.sensors
      .map(function(sensor) {
        return {
          id: sensor.id,
          stateKeys: sensor.state_keys
            .map(function(key: string): [string, string] {
              // return [key, sensor.description.state_keys[key]];
              return [key, "-"];
            }),
          returns: sensor.returns
            .map(function(key: string): [string, string] {
              // return [key, sensor.description.returns[key]];
              return [key, "-"];
            }),
        }
      })
      .sort((a, b) => a.id.localeCompare(b.id));
    const moduleIds = format.moduleIds
      .map(function(mod) {
        return {
          localId: mod.local,
          globalId: mod.global,
          params: mod.params,
          returns: mod.returns,
        }
      })
      .sort(function(a, b) {
        return a.localId.localeCompare(b.localId)
          || a.globalId.localeCompare(b.globalId);
      });
    const entityMap: { [key: string]: [number, string[], string[]] } = {}
    sensors.forEach(function(sensor, index) {
      entityMap[sensor.id] = [
        index,
        sensor.stateKeys.map(val => val[0]),
        sensor.returns.map(val => val[0]),
      ]
    })
    moduleIds.forEach(function(mod, index) {
      entityMap[mod.localId] = [
        index + sensors.length,
        mod.params,
        mod.returns,
      ]
    })
    let g: ControllerGraphFormat = {
      sensors: sensors,
      moduleIds: moduleIds,
      dataEdges: format.edges.data.map(function(edge) {
        let out = entityMap[edge.out_id]
        let mod = entityMap[edge.module_id]
        return [
          edge.stateless,
          out[0],
          out[2].indexOf(edge.out_ret),
          mod[0],
          mod[1].indexOf(edge.module_param),
        ]
      }),
      stateEdges: format.edges.state.map(function(edge) {
        let mod = entityMap[edge.module_id]
        let sensor = entityMap[edge.sensor_id]
        return [
          mod[0],
          mod[2].indexOf(edge.module_ret),
          sensor[0],
          sensor[2].indexOf(edge.sensor_key),
        ]
      }),
      networkEdges: format.edges.network.map(function(edge) {
        return [entityMap[edge.module_id][0], edge.domain]
      }),
      intervals: format.edges.interval.map(function(edge) {
        return [entityMap[edge.module_id][0], edge.duration_s]
      }),
    }

    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/graph')
    xhr.setRequestHeader('Content-Type', 'application/json');
    xhr.send(JSON.stringify(g))
    xhr.onreadystatechange = function(e) {
      if (this.readyState == 4) {
        if (this.status != 200) {
          console.error({
            responseURL: this.responseURL,
            status: this.status,
            statusText: this.statusText,
          })
        }
      }
    }
  }

  export function spawnModule(moduleId: string) {
    console.error(`unimplemented: spawn module ${moduleId}`)
  }

  export function confirmSensor(sensorId: string) {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/sensor/confirm/' + sensorId)
    xhr.send()
    xhr.onreadystatechange = function(e) {
      if (this.readyState == 4) {
        if (this.status != 200) {
          console.error({
            responseURL: this.responseURL,
            status: this.status,
            statusText: this.statusText,
          })
        }
      }
    }
  }

  export function cancelSensor(sensorId: string) {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/sensor/cancel/' + sensorId)
    xhr.send()
    xhr.onreadystatechange = function(e) {
      if (this.readyState == 4) {
        if (this.status != 200) {
          console.error({
            responseURL: this.responseURL,
            status: this.status,
            statusText: this.statusText,
          })
        }
      }
    }
  }

  export function getSensors(callback: (
    sensors: { sensor: Sensor, attestation: string }[],
  ) => void) {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', '/sensors')
    xhr.send()
    xhr.onreadystatechange = function(e) {
      if (this.readyState == 4) {
        if (this.status == 200) {
          let res: {
            sensor: ControllerSensor,
            attestation: string,
          }[] = JSON.parse(this.responseText)
          console.log(res)
          callback(res.map(function(val) {
            return {
              sensor: {
                id: val.sensor.id,
                state_keys: val.sensor.stateKeys.map(x => x[0]),
                returns: val.sensor.returns.map(x => x[0]),
                description: {
                  state_keys: val.sensor.stateKeys.reduce(function(
                    map: { [key: string]: string },
                    key_desc: [string, string],
                  ) {
                    map[key_desc[0]] = key_desc[1];
                    return map;
                  }, {}),
                  returns: val.sensor.returns.reduce(function(
                    map: { [key: string]: string },
                    ret_desc: [string, string],
                  ) {
                    map[ret_desc[0]] = ret_desc[1];
                    return map;
                  }, {}),
                }
              },
              attestation: val.attestation,
            }
          }))
        } else {
          console.error({
            responseURL: this.responseURL,
            status: this.status,
            statusText: this.statusText,
          })
        }
      }
    }
    return [
      {
        sensor: _sensorWithId('mic', 'mic_2'),
        attestation: 'QWERTY9876',
      },
      {
        sensor: _sensorWithId('camera', 'camera_2'),
        attestation: 'QWERTY1234',
      },
      {
        sensor: _sensorWithId('bulb', 'bulb'),
        attestation: 'QWERTY1234',
      }
    ]
  }

  export function confirmHost(hostId: string) {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/host/confirm/' + hostId)
    xhr.send()
    xhr.onreadystatechange = function(e) {
      if (this.readyState == 4) {
        if (this.status != 200) {
          console.error({
            responseURL: this.responseURL,
            status: this.status,
            statusText: this.statusText,
          })
        }
      }
    }
  }

  export function cancelHost(hostId: string) {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', '/host/cancel/' + hostId)
    xhr.send()
    xhr.onreadystatechange = function(e) {
      if (this.readyState == 4) {
        if (this.status != 200) {
          console.error({
            responseURL: this.responseURL,
            status: this.status,
            statusText: this.statusText,
          })
        }
      }
    }
  }

  export function getHosts(callback: (
    confirmed: Host[],
    unconfirmed: string[],
  ) => void) {
    const xhr = new XMLHttpRequest()
    xhr.open('GET', '/hosts')
    xhr.send()
    xhr.onreadystatechange = function(e) {
      if (this.readyState == 4) {
        if (this.status == 200) {
          let res: {
            confirmed: Host[],
            unconfirmed: string[]
          } = JSON.parse(this.responseText)
          callback(res.confirmed, res.unconfirmed)
        } else {
          console.error({
            responseURL: this.responseURL,
            status: this.status,
            statusText: this.statusText,
          })
        }
      }
    }
  }
}
