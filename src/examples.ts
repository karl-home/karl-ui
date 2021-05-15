import { Sensor, Module, Graph } from './graph';

export const SENSORS: { [key: string]: Sensor } = {
  mic: { id: "mic", state_keys: ["response"], returns: ["sound"] },
  bulb: { id: "bulb", state_keys: ["on"], returns: [] },
  camera: {
    id: "camera",
    state_keys: ["livestream", "firmware"],
    returns: ["motion", "streaming"],
  }
};

export const MODULES: { [key: string]: Module } = {
  command_classifier: {
    id: "command_classifier",
    params: ["sound"],
    returns: ["query_intent", "light_intent"],
    network: false,
  },
  search: {
    id: "search",
    params: ["query_intent"],
    returns: ["response"],
    network: true,
  },
  light_switch: {
    id: "light_switch",
    params: ["light_intent"],
    returns: ["state"],
    network: false,
  },
  firmware_update: {
    id: "firmware_update",
    params: [],
    returns: ["firmware"],
    network: true,
  },
  person_detection: {
    id: "person_detection",
    params: ["image"],
    returns: ["box_count", "box", "count"],
    network: true,
  },
  differential_privacy: {
    id: "differential_privacy",
    params: ["count"],
    returns: [],
    network: true,
  },
  targz: {
    id: "targz",
    params: ["bytes"],
    returns: ["video"],
    network: false,
  },
  true: {
    id: "true",
    params: [],
    returns: ["true"],
    network: false,
  },
  false: {
    id: "false",
    params: [],
    returns: ["false"],
    network: false,
  },
};

export function figure4(g: Graph) {
  g.reset()
  g.add_sensor({ id: "mic", state_keys: ["response"], returns: ["sound"] })
  g.add_sensor({ id: "mic_1", state_keys: ["response"], returns: ["sound"] })
  g.add_sensor({ id: "kitchen_bulb", state_keys: ["on"], returns: [] })
  g.add_sensor({ id: "bathroom_bulb", state_keys: ["on"], returns: [] })
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
