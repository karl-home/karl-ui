import { Sensor, Module, Graph } from './graph';

export const SENSORS: { [key: string]: Sensor } = {
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

export const MODULES: { [key: string]: Module } = {
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

function sensorWithID(old_sensor_id: string, new_sensor_id: string): Sensor {
  let sensor = SENSORS[old_sensor_id];
  if (sensor) {
    sensor = Object.assign({}, sensor)
    sensor.id = new_sensor_id
    return sensor
  } else {
    return undefined
  }
}

export function figure4(g: Graph) {
  g.reset()
  g.add_sensor(SENSORS['mic'])
  g.add_sensor(sensorWithID('mic', 'mic_1'))
  g.add_sensor(sensorWithID('bulb', 'kitchen_bulb'))
  g.add_sensor(sensorWithID('bulb', 'bathroom_bulb'))
  g.add_module(MODULES["command_classifier"])
  g.add_module(MODULES["search"])
  g.add_module(MODULES["light_switch"])
  g.add_data_edge({
    stateless: true,
    out_id: "mic",
    out_ret: "sound",
    module_id: "command_classifier",
    module_param: "sound",
  })
  g.add_data_edge({
    stateless: true,
    out_id: "mic_1",
    out_ret: "sound",
    module_id: "command_classifier",
    module_param: "sound",
  })
  g.add_data_edge({
    stateless: true,
    out_id: "command_classifier",
    out_ret: "query_intent",
    module_id: "search",
    module_param: "query_intent",
  })
  g.add_data_edge({
    stateless: true,
    out_id: "command_classifier",
    out_ret: "light_intent",
    module_id: "light_switch",
    module_param: "light_intent",
  })
  g.add_network_edge({
    module_id: "search",
    domain: "google.com",
  })
  g.add_state_edge({
    module_id: "search",
    module_ret: "response",
    sensor_id: "mic",
    sensor_key: "response",
  })
  g.add_state_edge({
    module_id: "light_switch",
    module_ret: "state",
    sensor_id: "kitchen_bulb",
    sensor_key: "on",
  })
  g.add_state_edge({
    module_id: "light_switch",
    module_ret: "state",
    sensor_id: "bathroom_bulb",
    sensor_key: "on",
  })
}

export function figure5(g: Graph) {
  g.reset()
  g.add_sensor(SENSORS["camera"])
  g.add_module(MODULES["person_detection"])
  g.add_module(MODULES["differential_privacy"])
  g.add_module(MODULES["firmware_update"])
  g.add_module(MODULES["targz"])
  g.add_module(MODULES["true"])
  g.add_module(MODULES["false"])
  g.add_data_edge({
    stateless: true,
    out_id: "camera",
    out_ret: "motion",
    module_id: "person_detection",
    module_param: "image",
  })
  g.add_data_edge({
    stateless: true,
    out_id: "person_detection",
    out_ret: "count",
    module_id: "differential_privacy",
    module_param: "count",
  })
  g.add_data_edge({
    stateless: false,
    out_id: "camera",
    out_ret: "streaming",
    module_id: "targz",
    module_param: "bytes",
  })
  g.add_network_edge({
    module_id: "differential_privacy",
    domain: "metrics.com",
  })
  g.add_network_edge({
    module_id: "firmware_update",
    domain: "firmware.com",
  })
  g.set_interval("firmware_update", 24*60*60)
  g.add_state_edge({
    module_id: "firmware_update",
    module_ret: "firmware",
    sensor_id: "camera",
    sensor_key: "firmware",
  })
  g.add_state_edge({
    module_id: "true",
    module_ret: "true",
    sensor_id: "camera",
    sensor_key: "livestream",
  })
  g.add_state_edge({
    module_id: "false",
    module_ret: "false",
    sensor_id: "camera",
    sensor_key: "livestream",
  })
}
