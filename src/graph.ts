import { GraphHTML } from './main/graph_html';
import { EdgeHTML } from './sidebar/edge_html';
import { ModuleList } from './sidebar/module_repo';
import { MockNetwork } from './network';

export const NETWORK_NODE_ID: string = "NET";

export type ModuleID = string;
export type SensorID = string;
export type EntityID = ModuleID | SensorID;

export interface Sensor {
  id: SensorID;
  state_keys: string[];
  returns: string[];
  description: {
    state_keys: { [key: string]: string },
    returns: { [key: string]: string },
  }
}

export interface Module {
  id: ModuleID;
  params: string[],
  returns: string[],
  network: string[],
  description: {
    module: string,
    params: { [key: string]: string };
    returns: { [key: string] : string };
    network: { [key: string] : string };
  },
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

export interface Interval {
  module_id: ModuleID,
  duration_s: number,
}

export interface GraphFormat {
  sensors: Sensor[],
  moduleIds: ModuleID[],
  edges: {
    data: DataEdge[],
    state: StateEdge[],
    network: NetworkEdge[],
    interval: Interval[],
  }
}

export interface SensorInner {
  value: Sensor;
  edges: DataEdge[];
  htmlOut: HTMLElement;
  htmlIn: HTMLElement;
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

  _genEntityID(global_entity_id: string): string {
    let entity_id = global_entity_id
    let counter = 1
    while (this._exists(entity_id)) {
      entity_id = global_entity_id + '_' + counter.toString()
      counter += 1
    }
    return entity_id
  }

  reset() {
    Object.keys(this.modules).forEach(
      module_id => this.remove_module(module_id))
    Object.keys(this.sensors).forEach(
      sensor_id => this.remove_sensor(sensor_id))
    GraphHTML.reset()
  }

  add_sensor(sensor: Sensor): boolean {
    if (this._exists(sensor.id)) {
      console.error('sensor id already exists')
      return false
    } else {
      let inner: SensorInner = {
        value: sensor,
        edges: [],
        htmlOut: undefined,
        htmlIn: undefined,
        outgoing_edges: [],
        incoming_edges: [],
        outgoing_buttons: [],
        incoming_buttons: [],
      }
      let html = GraphHTML.renderSensor(sensor.id, inner);
      inner.htmlOut = html[0]
      inner.htmlIn = html[1]
      this.sensors[sensor.id] = inner;
      return true
    }
  }

  remove_sensor(sensor_id: SensorID): boolean {
    let sensor = this.sensors[sensor_id]
    if (sensor === undefined) {
      console.error(`deleted sensor id does not exist: ${sensor_id}`)
      return false
    } else {
      // remove all outgoing edges from the module.
      sensor.edges.map(edge => Object.assign({}, edge))
        .forEach(edge => this.remove_data_edge(edge));
      // iterate through all modules to find incoming edges
      Object.values(this.modules).forEach(inner => {
        inner.state_edges.filter(edge => edge.sensor_id == sensor_id)
          .map(edge => Object.assign({}, edge))
          .forEach(edge => this.remove_state_edge(edge));
      })
      // reset the edge modifier if any button is active
      let activeButton = false
      sensor.incoming_buttons.forEach(button => {
        if (button.style.backgroundColor) {
          activeButton = true
        }
      })
      sensor.outgoing_buttons.forEach(button => {
        if (button.style.backgroundColor) {
          activeButton = true
        }
      })
      if (activeButton) {
        EdgeHTML.resetForm()
      }
      sensor.htmlOut.remove()
      sensor.htmlIn.remove()
      delete this.sensors[sensor_id]
      return true
    }
  }

  add_module(mod: Module): void {
    mod = Object.assign({}, mod)
    mod.id = this._genEntityID(mod.id)
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
    ModuleList.addModule(mod.id)
    this.modules[mod.id] = inner;
  }

  remove_module(module_id: ModuleID): boolean {
    let mod = this.modules[module_id]
    if (mod === undefined) {
      console.error(`deleted module id does not exist: ${module_id}`)
      return false
    } else {
      // remove all outgoing edges from the module.
      // clone to ensure data_edges is not being mutated in two places.
      mod.data_edges.map(edge => Object.assign({}, edge))
        .forEach(edge => this.remove_data_edge(edge));
      mod.state_edges.map(edge => Object.assign({}, edge))
        .forEach(edge => this.remove_state_edge(edge));
      // iterate through all sensors and modules to find incoming edges...
      Object.values(this.sensors).forEach(inner => {
        inner.edges.filter(edge => edge.module_id == module_id)
          .map(edge => Object.assign({}, edge))
          .forEach(edge => this.remove_data_edge(edge));
      })
      Object.values(this.modules).forEach(inner => {
        inner.data_edges.filter(edge => edge.module_id == module_id)
          .map(edge => Object.assign({}, edge))
          .forEach(edge => this.remove_data_edge(edge));
      })
      // reset the edge modifier if any button is active
      let activeButton = false
      mod.incoming_buttons.forEach(button => {
        if (button.style.backgroundColor) {
          activeButton = true
        }
      })
      mod.outgoing_buttons.forEach(button => {
        if (button.style.backgroundColor) {
          activeButton = true
        }
      })
      if (activeButton) {
        EdgeHTML.resetForm()
      }
      mod.html.remove()
      delete this.modules[module_id]
      ModuleList.removeModule(module_id)
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
        target.htmlIn,
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
      var sourceHTML: HTMLElement;
      var sourceDataEdges: DataEdge[];
      if (this.modules[edge.out_id] !== undefined) {
        source = this.modules[edge.out_id]
        sourceHTML = source.html;
        sourceDataEdges = source.data_edges
      } else if (this.sensors[edge.out_id] !== undefined) {
        source = this.sensors[edge.out_id]
        sourceHTML = source.htmlOut
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
          sourceHTML,
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

  set_interval(interval: Interval): boolean {
    if (this.modules.hasOwnProperty(interval.module_id)) {
      let mod = this.modules[interval.module_id];
      if (isNaN(interval.duration_s)) {
        delete mod.interval
      } else if (interval.duration_s > 0) {
        mod.interval = interval.duration_s
      } else {
        console.error(`positive interval required: ${interval.duration_s}`)
        return false
      }
      GraphHTML.renderModuleProperties(mod)
      return true
    } else {
      console.error(`output module does not exist: ${interval.module_id}`)
      return false
    }
  }

  textRepr(): HTMLDivElement {
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

  getGraphFormat(): GraphFormat {
    let format: GraphFormat = {
      sensors: [],
      moduleIds: [],
      edges: {
        data: [],
        state: [],
        network: [],
        interval: [],
      },
    };
    format.sensors = Object.keys(this.sensors).sort()
      .map(id => Object.assign({}, this.sensors[id].value));
    format.moduleIds = Object.keys(this.modules).sort();
    format.edges.data = Object.values(this.modules)
      .map(inner => inner.data_edges)
      .concat(Object.values(this.sensors).map(inner => inner.edges))
      .reduce((a, b) => a.concat(b), [])
      .sort((a, b) => {
        return a.out_id.localeCompare(b.out_id)
          || a.out_ret.localeCompare(b.out_ret)
          || a.module_id.localeCompare(b.module_id)
          || a.module_param.localeCompare(b.module_param);
      })
    format.edges.state = Object.values(this.modules)
      .map(inner => inner.state_edges)
      .reduce((a, b) => a.concat(b), [])
      .sort((a, b) => {
        return a.module_id.localeCompare(b.module_id)
          || a.module_ret.localeCompare(b.module_ret)
          || a.sensor_id.localeCompare(b.sensor_id)
          || a.sensor_key.localeCompare(b.sensor_key);
      })
    format.edges.network = Object.values(this.modules)
      .map(inner => inner.network_edges)
      .reduce((a, b) => a.concat(b), [])
      .sort((a, b) => {
        return a.module_id.localeCompare(b.module_id)
          || a.domain.localeCompare(b.domain);
      })
    format.edges.interval = Object.values(this.modules)
      .filter(inner => inner.hasOwnProperty('interval'))
      .map(inner => {
        return {
          module_id: inner.value.id,
          duration_s: inner.interval,
        }
      })
      .sort((a, b) => a.module_id.localeCompare(b.module_id))
    return format;
  }

  setGraphFormat(f: GraphFormat) {
    // TODO: only apply the delta
    this.reset()
    f.sensors.forEach(sensor => this.add_sensor(sensor))
    f.moduleIds.forEach(id => {
      let mod = MockNetwork.checkModuleRepo(id)
      this.add_module(mod)
    })
    f.edges.data.forEach(edge => this.add_data_edge(edge))
    f.edges.state.forEach(edge => this.add_state_edge(edge))
    f.edges.network.forEach(edge => this.add_network_edge(edge))
    f.edges.interval.forEach(interval => this.set_interval(interval))
  }
}
