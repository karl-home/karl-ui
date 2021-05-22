import { Sensor, Graph, GraphFormat, ModuleID } from './graph';
import { DataEdge, StateEdge, NetworkEdge, Interval } from './graph';
import { MockNetwork, _sensorWithId } from './network';

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
  let mod = MockNetwork.checkModuleRepo(module_id)
  return {
    local: module_id,
    global: module_id,
    params: mod.params,
    returns: mod.returns,
  }
}

export module Examples {
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
