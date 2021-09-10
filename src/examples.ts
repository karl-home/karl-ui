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
        _module('picovoice'),
        _module('weather'),
      ],
      edges: {
        data: [
          dataEdge(true, 'picovoice', 'weather_intent', 'weather', 'weather_intent'),
          dataEdge(true, 'speaker', 'speech_command', 'picovoice', 'speech'),
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
        _module('picovoice'),
        _module('light_switch'),
      ],
      edges: {
        data: [
          dataEdge(true, 'picovoice', 'light_intent', 'light_switch', 'light_intent'),
          dataEdge(true, 'speaker', 'speech_command', 'picovoice', 'speech'),
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

  export function pipeline_iv(g: Graph) {
    g.setGraphFormat({
      sensors: [
        _sensorWithId('occupancy_sensor', 'occupancy_sensor'),
        _sensorWithId('camera', 'camera')
      ],
      moduleIds: [
        _module('boolean'),
        _module('person_detection'),
        _module('statistics'),
      ],
      edges: {
        data: [
          dataEdge(true, 'camera', 'motion', 'person_detection', 'image'),
          dataEdge(true, 'person_detection', 'training_data', 'boolean', 'value'),
          dataEdge(false, 'occupancy_sensor', 'at_home', 'boolean', 'condition'),
          dataEdge(true, 'boolean', 'predicate', 'statistics', 'data'),
        ],
        state: [
        ],
        network: [
          networkEdge('statistics', 'statistics.com'),
        ],
        interval: [
        ],
      },
    })
  }

  export function figure4(g: Graph) {
    g.setGraphFormat({
      sensors: [
        _sensorWithId('microphone', 'microphone'),
        _sensorWithId('microphone', 'microphone_1'),
        _sensorWithId('bulb', 'kitchen_bulb'),
        _sensorWithId('bulb', 'bathroom_bulb'),
      ],
      moduleIds: [
        _module('command_classifier'),
        _module('light_switch'),
        _module('search'),
      ],
      edges: {
        data: [
          dataEdge(true, 'command_classifier', 'light', 'light_switch', 'light_intent'),
          dataEdge(true, 'command_classifier', 'search', 'search', 'query_intent'),
          dataEdge(true, 'microphone', 'sound', 'command_classifier', 'sound'),
          dataEdge(true, 'microphone_1', 'sound', 'command_classifier', 'sound'),
        ],
        state: [
          stateEdge('light_switch', 'state', 'bathroom_bulb', 'on'),
          stateEdge('light_switch', 'state', 'kitchen_bulb', 'on'),
          stateEdge('search', 'response', 'microphone', 'response'),
        ],
        network: [
          networkEdge('search', 'google.com'),
        ],
        interval: [],
      },
    })
  }

  export function figure5(g: Graph) {
    g.setGraphFormat({
      sensors: [_sensorWithId('camera', 'camera')],
      moduleIds: [
        _module('person_detection'),
        _module('differential_privacy'),
        _module('firmware_update'),
        _module('targz'),
        _module('true'),
        _module('false'),
      ],
      edges: {
        data: [
          dataEdge(true, 'camera', 'motion', 'person_detection', 'image'),
          dataEdge(true, 'person_detection', 'count', 'differential_privacy', 'count'),
          dataEdge(false, 'camera', 'streaming', 'targz', 'files'),
        ],
        state: [
          stateEdge('firmware_update', 'firmware', 'camera', 'firmware'),
          stateEdge('true', 'true', 'camera', 'livestream'),
          stateEdge('false', 'false', 'camera', 'livestream'),
        ],
        network: [
          networkEdge('differential_privacy', 'metrics.com'),
          networkEdge('firmware_update', 'firmware.com'),
        ],
        interval: [
          interval('firmware_update', 24*60*60),
        ],
      },
    })
  }

  export function diffPrivPipeline(g: Graph) {
    g.setGraphFormat({
      sensors: [_sensorWithId('camera', 'camera')],
      moduleIds: [
        _module('person_detection'),
        _module('differential_privacy'),
      ],
      edges: {
        data: [
          dataEdge(true, 'camera', 'motion', 'person_detection', 'image'),
          dataEdge(true, 'person_detection', 'count', 'differential_privacy', 'count'),
        ],
        state: [
        ],
        network: [
          networkEdge('differential_privacy', 'metrics.com'),
        ],
        interval: [
        ],
      },
    })
  }

  export function searchPipeline(g: Graph) {
      g.setGraphFormat({
      sensors: [
        _sensorWithId('microphone', 'microphone'),
      ],
      moduleIds: [
        _module('command_classifier_search'),
        _module('search'),
      ],
      edges: {
        data: [
          dataEdge(true, 'command_classifier_search', 'search', 'search', 'query_intent'),
          dataEdge(true, 'microphone', 'sound', 'command_classifier_search', 'sound'),
        ],
        state: [
        ],
        network: [
          networkEdge('search', 'google.com'),
        ],
        interval: [],
      },
    })
  }

  export function truePipeline(g: Graph) {
    g.setGraphFormat({
      sensors: [_sensorWithId('camera', 'camera')],
      moduleIds: [
        _module('true'),
      ],
      edges: {
        data: [
        ],
        state: [
          stateEdge('true', 'true', 'camera', 'livestream'),
        ],
        network: [
        ],
        interval: [
        ],
      },
    })
  }
}
