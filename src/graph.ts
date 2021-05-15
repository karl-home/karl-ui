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
  outgoing_buttons: HTMLButtonElement[];
  incoming_buttons: HTMLButtonElement[];
}

export interface ModuleInner {
  value: Module;
  data_edges: DataEdge[];
  state_edges: StateEdge[];
  network_edges: NetworkEdge[];
  interval?: number,
  html: HTMLElement;
  outgoing_edges: SVGLineElement[];
  incoming_edges: SVGLineElement[];
  outgoing_buttons: HTMLButtonElement[];
  incoming_buttons: HTMLButtonElement[];
}

function dataEdgeEquals(e1: DataEdge, e2: DataEdge): boolean {
  return e1.stateless == e2.stateless
    && e1.out_id == e2.out_id
    && e1.out_ret == e2.out_ret
    && e1.module_id == e2.module_id
    && e1.module_param == e2.module_param;
}

function stateEdgeEquals(e1: StateEdge, e2: StateEdge): boolean {
  return e1.module_id == e2.module_id
    && e1.module_ret == e2.module_ret
    && e1.sensor_id == e2.sensor_id
    && e1.sensor_key == e2.sensor_key;
}

function networkEdgeEquals(e1: NetworkEdge, e2: NetworkEdge): boolean {
  return e1.module_id == e2.module_id && e1.domain == e2.domain
}

function buttonOffset(index: number, length: number): number {
  const buttonWidth = 25;
  return buttonWidth * ((index + 1) - length / 2.0 - 0.5);
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
        outgoing_buttons: [],
        incoming_buttons: [],
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
        outgoing_buttons: [],
        incoming_buttons: [],
      }
      inner.html = GraphHTML.renderModule(mod.id, inner);
      GraphHTML.renderModuleProperties(inner)
      this.modules[mod.id] = inner;
      return true
    }
  }

  add_state_edge(edge: StateEdge): boolean {
    function eq(other: StateEdge): boolean {
      return stateEdgeEquals(edge, other)
    }

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
    } else if (this.modules[edge.module_id].state_edges.findIndex(eq) != -1) {
      console.error("state edge already exists")
    } else {
      let source = this.modules[edge.module_id];
      let target = this.sensors[edge.sensor_id];

      let sourceReturns = source.value.returns;
      let targetKeys = target.value.state_keys;
      let sourceIndex = sourceReturns.indexOf(edge.module_ret);
      let targetIndex = targetKeys.indexOf(edge.sensor_key);
      let html = GraphHTML.renderStateEdge(
        source.html,
        source.outgoing_buttons[sourceIndex],
        buttonOffset(sourceIndex, sourceReturns.length),
        target.html,
        target.incoming_buttons[targetIndex],
        buttonOffset(targetIndex, targetKeys.length),
      );
      source.state_edges.push(edge)
      source.outgoing_edges.push(html);
      target.incoming_edges.push(html);
      return true
    }
    console.error(JSON.stringify(edge))
    return false
  }

  remove_state_edge(edge: StateEdge): boolean {
    function eq(other: StateEdge): boolean {
      return stateEdgeEquals(edge, other)
    }

    let source = this.modules[edge.module_id]
    let target = this.sensors[edge.sensor_id]
    if (source === undefined) {
      console.error("output module does not exist")
    } else if (target === undefined) {
      console.error("input sensor does not exist")
    } else {
      let sourceIndex = source.state_edges.findIndex(eq);
      if (sourceIndex == -1) {
        console.error("state edge does not exist")
      } else {
        source.state_edges.splice(sourceIndex, 1)
        let deleted = source.outgoing_edges.splice(sourceIndex, 1);
        if (deleted.length > 0) {
          let line = deleted[0]
          let targetIndex = target.incoming_edges.indexOf(line)
          if (targetIndex != -1) {
            target.incoming_edges.splice(targetIndex, 1);
            line.remove()
          } else {
            console.error('failed to delete SVG line from incoming edges')
          }
        } else {
          console.error('failed to delete SVG line from outgoing edges')
        }
        return true
      }
    }
    console.error(JSON.stringify(edge))
    return false
  }

  add_network_edge(edge: NetworkEdge): boolean {
    function eq(other: NetworkEdge): boolean {
      return networkEdgeEquals(edge, other)
    }

    if (this.sensors.hasOwnProperty(edge.module_id)) {
      console.error("network edge output cannot be a sensor")
    } else if (!this.modules.hasOwnProperty(edge.module_id)) {
      console.error("output module does not exist")
    } else if (this.modules[edge.module_id].network_edges.findIndex(eq) != -1) {
      console.error("network edge already exists")
    } else {
      // TODO
      let mod = this.modules[edge.module_id];
      mod.network_edges.push(edge)
      GraphHTML.renderModuleProperties(mod)
      return true
    }
    console.error(JSON.stringify(edge))
    return false
  }

  remove_network_edges(module_id: ModuleID): boolean {
    if (this.modules.hasOwnProperty(module_id)) {
      let mod = this.modules[module_id]
      mod.network_edges = []
      GraphHTML.renderModuleProperties(mod)
      return true
    } else {
      console.error(`output module does not exist: ${module_id}`)
      return false
    }
  }

  add_data_edge(edge: DataEdge): boolean {
    if (this.sensors.hasOwnProperty(edge.module_id)) {
      console.error("state edge input cannot be a sensor")
    } else if (!this.modules.hasOwnProperty(edge.module_id)) {
      console.error("input module does not exist")
    } else if (!this.modules[edge.module_id].value.params.includes(edge.module_param)) {
      console.error("input param does not exist")
    } else {
      var source: ModuleInner | SensorInner;
      var sourceDataEdges: DataEdge[];
      if (this.modules[edge.out_id] !== undefined) {
        source = this.modules[edge.out_id]
        sourceDataEdges = source.data_edges
      } else if (this.sensors[edge.out_id] !== undefined) {
        source = this.sensors[edge.out_id]
        sourceDataEdges = source.edges
      } else {
        console.error("output entity does not exist")
        console.error(JSON.stringify(edge))
        return false
      }

      let target = this.modules[edge.module_id];
      let sourceReturns = source.value.returns;
      let targetParams = target.value.params;
      let sourceIndex = sourceReturns.indexOf(edge.out_ret);
      let targetIndex = targetParams.indexOf(edge.module_param);
      if (!sourceReturns.includes(edge.out_ret)) {
        console.error("output return value does not exist")
      } else if (sourceDataEdges.includes(edge)) {
        console.error("data edge already exists")
      } else {
        let html = GraphHTML.renderDataEdge(
          source.html,
          source.outgoing_buttons[sourceIndex],
          buttonOffset(sourceIndex, sourceReturns.length),
          target.html,
          target.incoming_buttons[targetIndex],
          buttonOffset(targetIndex, targetParams.length),
          edge.stateless,
        );
        sourceDataEdges.push(edge)
        source.outgoing_edges.push(html);
        target.incoming_edges.push(html);
        return true
      }
    }
    console.error(JSON.stringify(edge))
    return false
  }

  remove_data_edge(edge: DataEdge): boolean {
    if (!this.modules.hasOwnProperty(edge.module_id)) {
      console.error("input module does not exist")
    } else {
      var source: ModuleInner | SensorInner;
      var sourceDataEdges: DataEdge[];
      if (this.modules[edge.out_id] !== undefined) {
        source = this.modules[edge.out_id]
        sourceDataEdges = source.data_edges;
      } else if (this.sensors[edge.out_id] !== undefined) {
        source = this.sensors[edge.out_id]
        sourceDataEdges = source.edges;
      } else {
        console.error("output entity does not exist")
        console.error(JSON.stringify(edge))
        return false
      }

      let sourceIndex = sourceDataEdges.findIndex(function(other) {
        return dataEdgeEquals(edge, other)
      })
      if (sourceIndex == -1) {
        console.error("data edge does not exist")
        console.error(JSON.stringify(sourceDataEdges))
      } else {
        sourceDataEdges.splice(sourceIndex, 1)
        let deleted = source.outgoing_edges.splice(sourceIndex, 1);
        if (deleted.length > 0) {
          let target = this.modules[edge.module_id];
          let line = deleted[0]
          let targetIndex = target.incoming_edges.indexOf(line)
          if (targetIndex != -1) {
            target.incoming_edges.splice(targetIndex, 1);
            line.remove()
          } else {
            console.error('failed to delete SVG line from incoming edges')
          }
        } else {
          console.error('failed to delete SVG line from outgoing edges')
        }
        return true
      }
    }
    console.error(JSON.stringify(edge))
    return false
  }

  set_interval(module_id: ModuleID, interval: number): boolean {
    if (this.modules.hasOwnProperty(module_id)) {
      let mod = this.modules[module_id];
      if (isNaN(interval)) {
        delete mod.interval
      } else if (interval > 0) {
        mod.interval = interval
      } else {
        console.error(`positive interval required: ${interval}`)
        return false
      }
      GraphHTML.renderModuleProperties(mod)
      return true
    } else {
      console.error(`output module does not exist: ${module_id}`)
      return false
    }
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
