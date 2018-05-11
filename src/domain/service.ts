import { Node, Edge } from './model'
import * as _ from 'lodash'

export class GraphService {
  private graph: Node
  private allNodes: Node[]
  private allEdges: Edge[]

  /** the nodes and edges of the provided graph must not change while using the GraphService. */
  constructor(graph: Node) {
    this.graph = graph
  }

  findNode(nodeId: string): Node {
    return this.getAllNodes().find(node => node.sameId(nodeId))
  }

  getNeighbourNodes(node: Node): Node[] {
    let sourceIds = this.getAllEdges()
      .filter((edge) => node.sameId(edge.targetId))
      .map((edge) => edge.sourceId)

    let targetIds = this.getAllEdges()
      .filter((edge) => node.sameId(edge.sourceId))
      .map((edge) => edge.targetId)

    let neighbourNodes = this.getAllNodes()
      .filter((node) => sourceIds.includes(node.id) || targetIds.includes(node.id))

    return neighbourNodes
  }

  getNeighbourNodeIds(nodeId: string): string[] {
    const sourceIds = this.getAllEdges()
      .filter((edge) => nodeId === edge.targetId)
      .map((edge) => edge.sourceId)

    const targetIds = this.getAllEdges()
      .filter((edge) => nodeId === edge.sourceId)
      .map((edge) => edge.targetId)

    return _.union(sourceIds, targetIds)
  }

  isConnected(node: Node): boolean {
    return this.getAllEdges().some(edge => edge.sourceId === node.id || edge.targetId === node.id)
  }

  isNotConnected(node: Node): boolean {
    return !this.isConnected(node)
  }

  reduce(idsToKeep: string[]) {
    return this.reduceNodesRecursive(this.graph, idsToKeep)
  }

  getNeighbourEdges(node: Node): Edge[] {
    return this.getAllEdges()
      .filter((edge) => edge.sourceId === node.id || edge.targetId === node.id)
  }

  getAllEdges(): Edge[] {
    if (!this.allEdges) {
      this.allEdges = this.computeAllEdges(this.graph)
    }
    return this.allEdges
  }

  getAllNodes(): Node[] {
    if (!this.allNodes) {
      this.allNodes = this.computeAllNodes(this.graph)
    }
    return this.allNodes
  }

  getAllNodesOfNode(node: Node): Node[] {
    return this.computeAllNodes(node)
  }

  reduceNodesRecursive(node: Node, idsToKeep: string[]): Node {
    if (node.hasNodes()) {
      const reducedChildren = node.getNodes()
        .map(child => this.reduceNodesRecursive(child, idsToKeep))
        .filter(child => child !== null)

      if (reducedChildren.length > 0) {
        const reducedEdges = node.getEdges()
          .reduce((acc, edge) => {
            if (idsToKeep.includes(edge.sourceId) && idsToKeep.includes(edge.targetId)) {
              acc.push(edge)
            }
            return acc
          }, [])

        return new Node(node.id, reducedChildren, reducedEdges)
      }
    }

    if (idsToKeep.includes(node.id)) {
      return new Node(node.id, [], [])
    } else {
      return null
    }
  }

  private computeAllEdges(root: Node): Edge[] {
    if (root.getEdges()) {
      return _.union(root.getEdges(), _.flatten(root.getNodes().map(node => this.computeAllEdges(node))))
    } else {
      return []
    }
  }

  private computeAllNodes(root: Node): Node[] {
    if (root.getNodes()) {
      return _.union(root.getNodes(), _.flatten(root.getNodes().map(node => this.computeAllNodes(node))))
    } else {
      return []
    }
  }

  private reduceNodes(nodes: Node[], idsToKeep: string[]): Node[] {
    if (nodes) {
      return _.reduce(nodes, (result, child) => {
        if (idsToKeep.includes(child.id)) {
          result.push(child)
        }
        return result
      }, [])
    } else {
      return []
    }
  }

  private reduceEdges(node: Node, idsToKeep: string[]): Edge[] {
    if (node.getEdges()) {
      return _.reduce(node.getEdges(), (result, edge) => {
        if (idsToKeep.includes(edge.sourceId) || idsToKeep.includes(edge.targetId)) {
          result.push(edge)
        }
        return result
      }, [])
    } else {
      return []
    }
  }

}
