import { Sensor, Graph, GraphFormat, ModuleID } from './graph';
import { DataEdge, StateEdge, NetworkEdge, Interval } from './graph';
import { Network, _sensorWithId } from './network';

function dataEdge(
  stateless: boolean,
  out_id: string,
  out_ret: string,
  module_id: string,
  module_param: string,
): DataEdge {
  return {
    stateless: stateless,
    out_id: out_id,
    out_ret: out_ret,
    module_id: module_id,
    module_param: module_param,
  }
}

function stateEdge(
  module_id: string,
  module_ret: string,
  sensor_id: string,
  sensor_key: string,
): StateEdge {
  return {
    module_id: module_id,
    module_ret: module_ret,
    sensor_id: sensor_id,
    sensor_key: sensor_key,
  }
}

function networkEdge(module_id: string, domain: string): NetworkEdge {
  return { module_id: module_id, domain: domain }
}

function interval(module_id: string, duration_s: number): Interval {
  return { module_id: module_id, duration_s: duration_s }
}

function _module(module_id: string): {
  local: ModuleID
  global: ModuleID,
  params: string[],
  returns: string[],
} {
  let mod = Network.checkModuleRepo(module_id)
  return {
    local: module_id,
    global: module_id,
    params: mod.params,
    returns: mod.returns,
  }
}

function _moduleWithID(module_id: string, new_id: string): {
  local: ModuleID
  global: ModuleID,
  params: string[],
  returns: string[],
} {
  let mod = Network.checkModuleRepo(module_id)
  return {
    local: new_id,
    global: module_id,
    params: mod.params,
    returns: mod.returns,
  }
}

export module Examples {
  export function pipeline_i(g: Graph) {
    g.setGraphFormat({
      sensors: [
        _sensorWithId('camera', 'camera')
      ],
      moduleIds: [
        _module('set_true'),
      ],
      edges: {
        data: [],
        state: [
          stateEdge('set_true', 'true', 'camera', 'livestream'),
        ],
        network: [],
        interval: [],
      },
    })
  }

  export function pipeline_ii(g: Graph) {
    g.setGraphFormat({
      sensors: [
        _sensorWithId('speaker', 'speaker'),
      ],
      moduleIds: [
        _module('picovoice_weather'),
        _module('weather'),
      ],
      edges: {
        data: [
          dataEdge(true, 'picovoice_weather', 'weather_intent', 'weather', 'weather_intent'),
          dataEdge(true, 'speaker', 'speech_command', 'picovoice_weather', 'speech'),
        ],
        state: [
          stateEdge('weather', 'weather', 'speaker', 'playback'),
        ],
        network: [
          networkEdge('weather', 'weather.com'),
        ],
        interval: [],
      },
    })
  }

  export function pipeline_iii(g: Graph) {
    g.setGraphFormat({
      sensors: [
        _sensorWithId('light', 'light'),
        _sensorWithId('speaker', 'speaker'),
      ],
      moduleIds: [
        _module('picovoice_light'),
        _module('light_switch'),
      ],
      edges: {
        data: [
          dataEdge(true, 'picovoice_light', 'light_intent', 'light_switch', 'light_intent'),
          dataEdge(true, 'speaker', 'speech_command', 'picovoice_light', 'speech'),
        ],
        state: [
          stateEdge('light_switch', 'state', 'light', 'state'),
        ],
        network: [
        ],
        interval: [
        ],
      },
    })
  }

  export function figure3a(g: Graph) {
    g.setGraphFormat({
      sensors: [
        _sensorWithId('light', 'light'),
      ],
      moduleIds: [
        _module('set_true'),
        _module('set_false'),
      ],
      edges: {
        data: [],
        state: [
          stateEdge('set_true', 'true', 'light', 'state'),
          stateEdge('set_false', 'false', 'light', 'intensity'),
          ],
        network: [],
        interval: [],
      },
    })
  }

  export function figure3b(g: Graph) {
    g.setGraphFormat({
      sensors: [
        _sensorWithId('speaker', 'speaker'),
      ],
      moduleIds: [
        _module('picovoice'),
        _module('weather'),
        _module('light_switch'),
      ],
      edges: {
        data: [
          dataEdge(true, 'speaker', 'speech_command', 'picovoice', 'speech'),
          dataEdge(true, 'picovoice', 'light_intent', 'light_switch', 'light_intent'),
          dataEdge(true, 'picovoice', 'weather_intent', 'weather', 'weather_intent'),
        ],
        state: [
          stateEdge('weather', 'weather', 'speaker', 'playback'),
        ],
        network: [
          networkEdge('weather', 'weather.com'),
        ],
        interval: [
        ],
      },
    })
  }

  export function figure3c(g: Graph) {
    g.setGraphFormat({
      sensors: [
        _sensorWithId('camera', 'camera'),
      ],
      moduleIds: [
        _module('person_detection'),
        _module('statistics'),
        _module('query'),
        _module('firmware_update'),
        _module('set_true'),
        _module('set_false'),
      ],
      edges: {
        data: [
          dataEdge(true, 'camera', 'motion', 'person_detection', 'image'),
          dataEdge(true, 'person_detection', 'training_data', 'statistics', 'data'),
          dataEdge(false, 'camera', 'motion', 'query', 'image_data'),
        ],
        state: [
          stateEdge('set_true', 'true', 'camera', 'livestream'),
          stateEdge('set_false', 'false', 'camera', 'livestream'),
          stateEdge('firmware_update', 'firmware', 'camera', 'firmware'),
        ],
        network: [
          networkEdge('statistics', 'statistics.com'),
          networkEdge('firmware_update', 'firmware.com'),
        ],
        interval: [
          interval('firmware_update', 24*60*60),
        ],
      },
    })
  }


  export function figure9a(g: Graph) {
    g.setGraphFormat({
      sensors: [
        _sensorWithId('light', 'light'),
        _sensorWithId('speaker', 'speaker'),
      ],
      moduleIds: [
        _module('picovoice'),
        _module('weather'),
        _module('light_switch'),
        _module('set_true'),
        _module('set_false'),
      ],
      edges: {
        data: [
          dataEdge(true, 'speaker', 'speech_command', 'picovoice', 'speech'),
          dataEdge(true, 'picovoice', 'light_intent', 'light_switch', 'light_intent'),
          dataEdge(true, 'picovoice', 'weather_intent', 'weather', 'weather_intent'),
        ],
        state: [
          stateEdge('set_true', 'true', 'light', 'state'),
          stateEdge('set_false', 'false', 'light', 'intensity'),
          stateEdge('weather', 'weather', 'speaker', 'playback'),
          stateEdge('light_switch', 'state', 'light', 'state'), // extra
        ],
        network: [
          networkEdge('weather', 'weather.com'),
        ],
        interval: [
        ],
      },
    })
  }

  export function figure9b(g: Graph) {
    g.setGraphFormat({
      sensors: [
        _sensorWithId('occupancy_sensor', 'occupancy_sensor'),
        _sensorWithId('camera', 'camera'),
        _sensorWithId('camera', 'camera_1')
      ],
      moduleIds: [
        _module('person_detection'),
        _module('boolean'),
        _module('statistics'),
        _module('query'),
        _module('firmware_update'),
        _module('set_true'),
        _module('set_false'),
      ],
      edges: {
        data: [
          dataEdge(true, 'camera_1', 'motion', 'person_detection', 'image'),
          dataEdge(true, 'camera', 'motion', 'person_detection', 'image'),
          dataEdge(true, 'person_detection', 'training_data', 'boolean', 'value'),
          dataEdge(false, 'occupancy_sensor', 'at_home', 'boolean', 'condition'),
          dataEdge(true, 'boolean', 'predicate', 'statistics', 'data'),
          dataEdge(false, 'camera', 'motion', 'query', 'image_data'),
        ],
        state: [
          stateEdge('set_true', 'true', 'camera', 'livestream'),
          stateEdge('set_false', 'false', 'camera', 'livestream'),
          stateEdge('firmware_update', 'firmware', 'camera', 'firmware'),
        ],
        network: [
          networkEdge('statistics', 'statistics.com'),
          networkEdge('firmware_update', 'firmware.com'),
        ],
        interval: [
          interval('firmware_update', 24*60*60),
        ],
      },
    })
  }
}
