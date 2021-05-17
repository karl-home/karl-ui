import { Sensor, Graph } from './graph';
import { MockNetwork, _sensorWithId } from './network';

export function figure4(g: Graph) {
  g.reset()
  g.add_sensor(_sensorWithId('mic', 'mic'))
  g.add_sensor(_sensorWithId('mic', 'mic_1'))
  g.add_sensor(_sensorWithId('bulb', 'kitchen_bulb'))
  g.add_sensor(_sensorWithId('bulb', 'bathroom_bulb'))
  g.add_module(MockNetwork.checkModuleRepo('command_classifier'))
  g.add_module(MockNetwork.checkModuleRepo('search'))
  g.add_module(MockNetwork.checkModuleRepo('light_switch'))
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
  g.add_sensor(_sensorWithId('camera', 'camera'))
  g.add_module(MockNetwork.checkModuleRepo('person_detection'))
  g.add_module(MockNetwork.checkModuleRepo('differential_privacy'))
  g.add_module(MockNetwork.checkModuleRepo('firmware_update'))
  g.add_module(MockNetwork.checkModuleRepo('targz'))
  g.add_module(MockNetwork.checkModuleRepo('true'))
  g.add_module(MockNetwork.checkModuleRepo('false'))
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
