import { Sensor, Module, GraphFormat } from './graph'
import { Host } from './sidebar/host_html'

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
    state_keys: ['livestream', 'firmware'],
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
    id: 'command_classifier',
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
    id: 'search',
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
    id: 'light_switch',
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
    id: 'firmware_update',
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
    id: 'person_detection',
    params: ['image'],
    returns: ['box_count', 'box', 'count'],
    network: ['metrics.com'],
    description: {
      module: 'Detects a person in an image.',
      params: {
        'image': 'an image in a standard format e.g., PNG, JPEG',
      },
      returns: {
        'box_count': 'both box and count',
        'box': 'the original image, with boxes around detected persons',
        'count': 'number of detected persons',
      },
      network: {
        'metrics.com': 'share count statistics'
      },
    }
  },
  differential_privacy: {
    id: 'differential_privacy',
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
    id: 'targz',
    params: ['bytes'],
    returns: ['video'],
    network: [],
    description: {
      module: 'Combine video files from the past hour into a single ' +
        'compressed video file.',
      params: {
        'bytes': 'video files to compress',
      },
      returns: {
        'video': 'compressed video file in targz format',
      },
      network: {},
    }
  },
  true: {
    id: 'true',
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
    id: 'false',
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

  export function confirmSensor(sensorId: string) {
    console.error('unimplemented: confirm sensor in mock network')
  }

  export function confirmHost(hostId: string) {
    console.error('unimplemented: confirm host in mock network')
  }

  export function cancelSensor(sensorId: string) {
    console.error('unimplemented: cancel sensor in mock network')
  }

  export function cancelHost(hostId: string) {
    console.error('unimplemented: cancel host in mock network')
  }

  export function getSensors(): { sensor: Sensor, attestation: string }[] {
    return [
      {
        sensor: _sensorWithId('camera', 'camera_2'),
        attestation: 'QWERTY9876',
      },
      {
        sensor: _sensorWithId('camera', 'camera_3'),
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
