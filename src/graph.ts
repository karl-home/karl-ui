import { GraphHTML } from './graph_html';

export const NETWORK_NODE_ID: string = "NET";

export type ModuleID = string;
export type SensorID = string;
export type EntityID = ModuleID | SensorID;

export interface Sensor {
  id: SensorID;
  state_keys: string[];
  returns: string[];
}

export interface Module {
  id: ModuleID;
  params: string[];
  returns: string[];
  network: boolean;
}

export interface StateEdge {
  module_id: ModuleID;
  module_ret: string;
  sensor_id: SensorID;
  sensor_key: string;
}

export interface NetworkEdge {
  module_id: ModuleID;
  domain: string;
}

export interface DataEdge {
  stateless: boolean,
  out_id: EntityID;
  out_ret: string;
  module_id: ModuleID;
  module_param: string;
}

export interface SensorInner {
  value: Sensor;
  edges: DataEdge[];
  html: HTMLElement;
  outgoing_edges: SVGLineElement[];
  incoming_edges: SVGLineElement[];
}

export interface ModuleInner {
  value: Module;
  data_edges: DataEdge[];
  state_edges: StateEdge[];
  network_edges: NetworkEdge[];
  html: HTMLElement;
  outgoing_edges: SVGLineElement[];
  incoming_edges: SVGLineElement[];
}

export class Graph {
  sensors: { [key: string]: SensorInner }
  modules: { [key: string]: ModuleInner }

  constructor() {
    this.sensors = {};
    this.modules = {};
  }

  _exists(entity_id: string): boolean {
    return this.sensors.hasOwnProperty(entity_id) ||
      this.modules.hasOwnProperty(entity_id) ||
      entity_id == NETWORK_NODE_ID
  }

  add_sensor(sensor: Sensor): boolean {
    if (this._exists(sensor.id)) {
      return false
    } else {
      let inner: SensorInner = {
        value: sensor,
        edges: [],
        html: undefined,
        outgoing_edges: [],
        incoming_edges: [],
      }
      inner.html = GraphHTML.renderSensor(sensor.id, inner);
      this.sensors[sensor.id] = inner;
      return true
    }
  }

  add_module(mod: Module): boolean {
    if (this._exists(mod.id)) {
      return false
    } else {
      let inner: ModuleInner = {
        value: mod,
        data_edges: [],
        state_edges: [],
        network_edges: [],
        html: undefined,
        outgoing_edges: [],
        incoming_edges: [],
      }
      inner.html = GraphHTML.renderModule(mod.id, inner);
      this.modules[mod.id] = inner;
      return true
    }
  }

  add_state_edge(edge: StateEdge): boolean {
    if (this.sensors.hasOwnProperty(edge.module_id)) {
      console.error("state edge output cannot be a sensor")
    } else if (this.modules.hasOwnProperty(edge.sensor_id)) {
      console.error("state edge input cannot be a module")
    } else if (!this.modules.hasOwnProperty(edge.module_id)) {
      console.error("output module does not exist")
    } else if (!this.sensors.hasOwnProperty(edge.sensor_id)) {
      console.error("input sensor does not exist")
    } else if (!this.modules[edge.module_id].value.returns.includes(edge.module_ret)) {
      console.error("output return value does not exist")
    } else if (!this.sensors[edge.sensor_id].value.state_keys.includes(edge.sensor_key)) {
      console.error("input state key does not exist")
    } else if (this.modules[edge.module_id].state_edges.includes(edge)) {
      console.error("state edge already exists")
    } else {
      let source = this.modules[edge.module_id].html;
      let target = this.sensors[edge.sensor_id].html;
      GraphHTML.renderStateEdge(source, target);
      this.modules[edge.module_id].state_edges.push(edge)
      return true
    }
    console.error(JSON.stringify(edge))
    return false
  }

  add_network_edge(edge: NetworkEdge): boolean {
    if (this.sensors.hasOwnProperty(edge.module_id)) {
      console.error("network edge output cannot be a sensor")
    } else if (!this.modules.hasOwnProperty(edge.module_id)) {
      console.error("output module does not exist")
    } else if (this.modules[edge.module_id].network_edges.includes(edge)) {
      console.error("network edge already exists")
    } else {
      // TODO
      this.modules[edge.module_id].network_edges.push(edge)
      return true
    }
    console.error(JSON.stringify(edge))
    return false
  }

  add_data_edge(edge: DataEdge): boolean {
    if (this.sensors.hasOwnProperty(edge.module_id)) {
      console.error("state edge input cannot be a sensor")
    } else if (!this.modules.hasOwnProperty(edge.module_id)) {
      console.error("input module does not exist")
    } else if (!this.modules[edge.module_id].value.params.includes(edge.module_param)) {
      console.error("input param does not exist")
    } else {
      let mod = this.modules[edge.out_id];
      let sensor = this.sensors[edge.out_id];
      let target = this.modules[edge.module_id];
      if (mod !== undefined) {
        if (!mod.value.returns.includes(edge.out_ret)) {
          console.error("output return value does not exist")
        } else if (mod.data_edges.includes(edge)) {
          console.error("data edge already exists")
        } else {
          let html = GraphHTML.renderDataEdge(mod.html, target.html, edge.stateless);
          mod.data_edges.push(edge)
          mod.outgoing_edges.push(html);
          target.incoming_edges.push(html);
          return true
        }
      } else if (sensor !== undefined) {
        if (!sensor.value.returns.includes(edge.out_ret)) {
          console.error("output return value does not exist")
        } else if (sensor.edges.includes(edge)) {
          console.error("data edge already exists")
        } else {
          let html = GraphHTML.renderDataEdge(sensor.html, target.html, edge.stateless);
          sensor.edges.push(edge)
          sensor.outgoing_edges.push(html);
          target.incoming_edges.push(html);
          return true
        }
      } else {
        console.error("output entity does not exist")
      }
    }
    console.error(JSON.stringify(edge))
    return false
  }

  render(): HTMLDivElement {
    const div = document.createElement("div");

    // Render sensors
    const sensors = document.createElement("div");
    let ul = document.createElement("ul");
    for (const sensor_id in this.sensors) {
      let sensor = this.sensors[sensor_id].value;
      let li = document.createElement("li");
      li.appendChild(document.createTextNode(JSON.stringify(sensor)));
      ul.appendChild(li);
    }
    sensors.appendChild(document.createTextNode("Sensors:"))
    sensors.appendChild(ul);
    div.appendChild(sensors);

    // Render modules
    const modules = document.createElement("div");
    ul = document.createElement("ul");
    for (const module_id in this.modules) {
      let mod = this.modules[module_id].value;
      let li = document.createElement("li");
      li.appendChild(document.createTextNode(JSON.stringify(mod)));
      ul.appendChild(li);
    }
    modules.appendChild(document.createTextNode("Modules:"))
    modules.appendChild(ul);
    div.appendChild(modules);

    // Render edges
    const edges = document.createElement("div");
    let arr: (StateEdge | NetworkEdge | DataEdge)[] = [];
    for (const module_id in this.modules) {
      arr = arr.concat(this.modules[module_id].data_edges);
      arr = arr.concat(this.modules[module_id].network_edges);
      arr = arr.concat(this.modules[module_id].state_edges);
    }
    for (const sensor_id in this.sensors) {
      arr = arr.concat(this.sensors[sensor_id].edges);
    }
    ul = document.createElement("ul");
    arr.forEach(function(edge) {
      let li = document.createElement("li");
      li.appendChild(document.createTextNode(JSON.stringify(edge)));
      ul.appendChild(li);
    })
    edges.appendChild(document.createTextNode("Edges:"))
    edges.appendChild(ul);
    div.appendChild(edges);

    return div;
  }
}
