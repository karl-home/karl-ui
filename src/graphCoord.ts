import { GraphFormat } from './graph';

export class GraphCoord {

  adjacencyMatrix = new Array()
  nodeIDToIndex = new Map()
  nodeDepth: number[]
  levelOrder: number[]
  counterMap = new Map() //helper map for levelOrder
  STEP_SIZE = 170
  INITIAL_HEIGHT = 100
  MAX_WIDTH = 800

  findCoords(f: GraphFormat){
    let numNodes = this.getNumNodes(f)
    this.buildNodeIDToIndex(f)
    this.buildAdjacencyMatrix(f)
    this.nodeDepth = new Array()

    for(let i = 0; i < numNodes; i++){
      this.nodeDepth[i] = 0
    }
    for(let i = 0; i < numNodes; i++){
      this.getNodeDepth(i)
    }
    for(let i = 0; i < numNodes; i++){
      if(this.nodeDepth[i] == -1){
        this.nodeDepth[i] = undefined
      }
    }

    this.counterMap = new Map()
    //initializing heights for counterMap
    for(let i = 0; i < numNodes; i++){
      //if height currently is not in map
      if(this.counterMap.get(this.nodeDepth[i]) == undefined){
        this.counterMap.set(this.nodeDepth[i], 1)
      }
    }

    this.levelOrder = new Array()
    for(let i = 0; i < numNodes; i++){
      this.levelOrder[i] = 0
    }
    for(let i = 0; i < numNodes; i++){
      if(this.nodeDepth[i] == this.INITIAL_HEIGHT){
        this.getLevelOrderTraversal(i)
      }
    }

    let numAtDepth = new Map()
    for(let i = 0; i < numNodes; i++){
      if(numAtDepth.get(this.nodeDepth[i]) == undefined){
        numAtDepth.set(this.nodeDepth[i], 1)
      } else {
        numAtDepth.set(this.nodeDepth[i], numAtDepth.get(this.nodeDepth[i]) + 1)
      }
    }

    let nodeHorizontal = new Array()
    for(let i = 0; i < numNodes; i++){
      nodeHorizontal[i] = this.MAX_WIDTH / (numAtDepth.get(this.nodeDepth[i]) + 1) * this.levelOrder[i]
    }

    return [this.nodeDepth, nodeHorizontal]
  }

  private getNumNodes(f: GraphFormat){
    return f.sensors.length * 2 + f.moduleIds.length
  }

  private buildNodeIDToIndex(f: GraphFormat){
    for(let i = 0; i < f.sensors.length; i++){
      this.nodeIDToIndex.set(f.sensors[i].id + 'OUT', 2 * i)
      this.nodeIDToIndex.set(f.sensors[i].id + 'IN', 2 * i + 1)
    }

    for(let i = 0; i < f.moduleIds.length; i++){
      this.nodeIDToIndex.set(f.moduleIds[i].local, i + f.sensors.length * 2)
    }
  }

  private buildAdjacencyMatrix(f: GraphFormat){
    let numNodes = this.getNumNodes(f)
    for(let i = 0; i < numNodes; i++){
      this.adjacencyMatrix[i] = new Array()
      for(let j = 0; j < numNodes; j++){
        this.adjacencyMatrix[i][j] = 0
      }
    }
    
    for(let i = 0; i < f.edges.data.length; i++){
      if(this.nodeIDToIndex.get(f.edges.data[i].out_id + "OUT") == undefined){
        this.adjacencyMatrix[this.nodeIDToIndex.get(f.edges.data[i].out_id)][this.nodeIDToIndex.get(f.edges.data[i].module_id)] = 1
      } else {
        this.adjacencyMatrix[this.nodeIDToIndex.get(f.edges.data[i].out_id + "OUT")][this.nodeIDToIndex.get(f.edges.data[i].module_id)] = 1
      }
    }

    for(let i = 0; i < f.edges.state.length; i++){
      this.adjacencyMatrix[this.nodeIDToIndex.get(f.edges.state[i].module_id)][this.nodeIDToIndex.get(f.edges.state[i].sensor_id + "IN")] = 1
    }
  }

  getNodeDepth(nodeIndex: number){
    if(this.nodeDepth[nodeIndex] != 0){
      return this.nodeDepth[nodeIndex]
    } 
    let children = this.findNodeChildren(nodeIndex)
    let parents = this.findNodeParent(nodeIndex)
    if(children.length == 0){
      if(parents.length == 0){
        this.nodeDepth[nodeIndex] = -1
        return -1
      }
    }
    if(parents.length == 0){
      this.nodeDepth[nodeIndex] = this.INITIAL_HEIGHT
      return this.INITIAL_HEIGHT
    }
    else {
      let max = 0;
      parents.forEach(parent => {
        max = Math.max(max, this.getNodeDepth(parent))
      });
      this.nodeDepth[nodeIndex] = max + this.STEP_SIZE
      return max + this.STEP_SIZE
    }
  }

  getLevelOrderTraversal(rootIndex: number,){
    if(this.levelOrder[rootIndex] != 0){
      return this.levelOrder[rootIndex]
    }
    let queue = new Array()
    queue.push(rootIndex)
    while(queue.length != 0){
      let dq = queue.shift()
      if(this.levelOrder[dq] == 0){
        this.levelOrder[dq] = this.counterMap.get(this.nodeDepth[dq])
        this.counterMap.set(this.nodeDepth[dq], this.counterMap.get(this.nodeDepth[dq]) + 1)
        let children = this.findNodeChildren(dq)
        children.forEach(element => {
          queue.push(element)
        });        
      }
      
    }
    
  }

  //returns indicies of the node's children
  findNodeChildren(nodeIndex: number){
    let result = new Array
    for(let i = 0; i < this.adjacencyMatrix.length; i++){
      if(this.adjacencyMatrix[nodeIndex][i] == 1){
        result.push(i)
      }
    }
    return result
  }

  //returns indicies of the node's parents
  findNodeParent(nodeIndex: number){
    let result = new Array
    for(let i = 0; i < this.adjacencyMatrix.length; i++){
      if(this.adjacencyMatrix[i][nodeIndex] == 1){
        result.push(i)
      }
    }
    return result
  }
  
  
  }
