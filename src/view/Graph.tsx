import * as React from 'react'
import { render } from 'react-dom'
import * as dagre from 'dagre'
import { Node } from './Node'
import { Edge } from './Edge'
import * as model from '../domain/model'
import { withRouter } from 'react-router'

export interface GraphProps {
  graph: model.Node
}

export class Graph extends React.Component<GraphProps, any> {
  constructor(props: GraphProps) {
    super(props)
  }

  render() {
    let dagreGraph = convertGraphToDagreGraph(this.props.graph)
    dagre.layout(dagreGraph)

    let width = dagreGraph.graph().width
    let height = dagreGraph.graph().height

    let arrangedNodes = dagreGraph.nodes().map(id => dagreGraph.node(id))
    let arrangedEdges = dagreGraph.edges().map(id => dagreGraph.edge(id))

    return (
      <div
        style={{
          width: width,
          height: height,
          position: 'relative'
        }}
      >
        {
          arrangedNodes.map(node => (
            <Node
              id={node.id}
              x={node.x}
              y={node.y}
              height={node.height}
              width={node.width}
              color={node.color}
            />
          ))
        }
        <svg width={width} height={height}>
          {
            arrangedEdges.map(edge => (
              <Edge arrangedEdge={edge} />
            ))
          }
        </svg>
      </div>
    )
  }
}

function convertGraphToDagreGraph(graph: model.Node): dagre.graphlib.Graph {
  const dagreGraph = new dagre.graphlib.Graph({ compound: true })

  dagreGraph.setGraph({})
  dagreGraph.setDefaultEdgeLabel(() => ({}))

  graph.nodes.forEach(node => {
    dagreGraph.setNode(node.id, {
      width: 100,
      height: 40,
      color: 'lightgrey',
      ...node
    })
  })
  graph.edges.forEach(edge => {
    dagreGraph.setEdge(edge.sourceNode, edge.targetNode)
  })

  if (graph.nodes.find((node) => node.id === 'c') && graph.nodes.find((node) => node.id === 'e')) {
    dagreGraph.setNode('group', {
      id: 'group',
      width: 150,
      height: 50,
      color: 'rgba(255, 0, 0, 0.2)'
    })

    dagreGraph.setParent('c', 'group')
    dagreGraph.setParent('e', 'group')
  }

  dagreGraph.graph().nodesep = 30
  dagreGraph.graph().edgesep = 15
  dagreGraph.graph().ranksep = 90
  dagreGraph.graph().ranker = 'tight-tree'

  return dagreGraph
}