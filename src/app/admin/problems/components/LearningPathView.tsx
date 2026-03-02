/* eslint-disable */
// @ts-nocheck
import React, { useCallback, useMemo } from 'react';
import ReactFlow, {
    Node,
    Edge,
    Controls,
    MiniMap,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    Connection,
    MarkerType,
    Panel,
    Position,
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { Problem } from '../types';
import { getDifficultyLabel } from '@/lib/supabase';
import { Badge } from '@/components/ui/badge';

interface LearningPathViewProps {
    problems: Problem[];
    selectedProblem: Problem | null;
    onSelectProblem: (problem: Problem) => void;
    onChangeLinkParent: (targetId: string) => void;
}

// Custom Node Component
function ProblemNode({ data }: { data: any }) {
    const problem: Problem = data.problem;
    const isSelected = data.isSelected;

    const getDifficultyColor = (diff: number) => {
        if (diff <= 3) return 'bg-green-100 border-green-300 text-green-700';
        if (diff <= 6) return 'bg-yellow-100 border-yellow-300 text-yellow-700';
        if (diff <= 8) return 'bg-orange-100 border-orange-300 text-orange-700';
        return 'bg-red-100 border-red-300 text-red-700';
    };

    return (
        <div
            className={`px-4 py-3 rounded-lg border-2 bg-white shadow-md transition-all cursor-pointer min-w-[200px] max-w-[250px] ${isSelected
                ? 'border-blue-500 shadow-lg ring-2 ring-blue-200'
                : 'border-gray-300 hover:border-blue-400 hover:shadow-lg'
                }`}
            onClick={() => data.onSelect(problem)}
        >
            <div className="flex items-start gap-2 mb-2">
                <span className="text-xl flex-shrink-0">
                    {problem.parentProblemId ? '🌱' : '🔒'}
                </span>
                <div className="flex-1 min-w-0">
                    <div className="font-semibold text-sm text-gray-800 truncate" title={problem.title}>
                        {problem.title}
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                        {getDifficultyLabel(problem.difficulty)} • D{problem.difficulty}
                    </div>
                </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
                <Badge className={`text-xs ${getDifficultyColor(problem.difficulty)} border`}>
                    D{problem.difficulty}
                </Badge>
                {problem.isGenerated && (
                    <Badge variant="secondary" className="text-xs bg-green-100 text-green-700">
                        🤖 AI
                    </Badge>
                )}
            </div>
            <div className="text-xs text-gray-400 truncate mt-1" title={problem.category}>
                {problem.category}
            </div>
        </div>
    );
}

const nodeTypes = {
    problemNode: ProblemNode,
};

// Dagre layout configuration
const dagreGraph = new dagre.graphlib.Graph();
dagreGraph.setDefaultEdgeLabel(() => ({}));

const nodeWidth = 250;
const nodeHeight = 100;

const getLayoutedElements = (nodes: Node[], edges: Edge[], direction = 'TB') => {
    const isHorizontal = direction === 'LR';
    dagreGraph.setGraph({ rankdir: direction, nodesep: 80, ranksep: 120 });

    nodes.forEach((node) => {
        dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
    });

    edges.forEach((edge) => {
        dagreGraph.setEdge(edge.source, edge.target);
    });

    dagre.layout(dagreGraph);

    nodes.forEach((node) => {
        const nodeWithPosition = dagreGraph.node(node.id);
        node.targetPosition = isHorizontal ? Position.Left : Position.Top;
        node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

        // We are shifting the dagre node position (anchor=center center) to the top left
        // so it matches the React Flow node anchor point (top left).
        node.position = {
            x: nodeWithPosition.x - nodeWidth / 2,
            y: nodeWithPosition.y - nodeHeight / 2,
        };

        return node;
    });

    return { nodes, edges };
};

export function LearningPathView({
    problems,
    selectedProblem,
    onSelectProblem,
    onChangeLinkParent,
}: LearningPathViewProps) {
    // Convert problems to React Flow nodes and edges
    const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
        const nodes: Node[] = problems.map((problem) => ({
            id: problem.id,
            type: 'problemNode',
            data: {
                problem,
                isSelected: selectedProblem?.id === problem.id,
                onSelect: onSelectProblem,
            },
            position: { x: 0, y: 0 }, // Will be set by dagre
        }));

        const edges: Edge[] = [];

        // Add parent-child edges (solid lines)
        problems.forEach((problem) => {
            if (problem.parentProblemId) {
                edges.push({
                    id: `e-${problem.parentProblemId}-${problem.id}`,
                    source: problem.parentProblemId,
                    target: problem.id,
                    type: 'smoothstep',
                    animated: false,
                    label: '파생',
                    labelStyle: { fill: '#64748b', fontSize: 10, fontWeight: 600 },
                    labelBgStyle: { fill: '#f1f5f9', fillOpacity: 0.9 },
                    labelBgPadding: [4, 4],
                    labelBgBorderRadius: 4,
                    style: { stroke: '#64748b', strokeWidth: 3 },
                    markerEnd: {
                        type: MarkerType.ArrowClosed,
                        color: '#64748b',
                        width: 20,
                        height: 20,
                    },
                });
            }
        });

        // Add linked problem edges (dashed lines)
        problems.forEach((problem) => {
            if (problem.linkedProblems && problem.linkedProblems.length > 0) {
                problem.linkedProblems.forEach((linkedId) => {
                    // Avoid duplicate edges
                    const edgeId = `e-link-${problem.id}-${linkedId}`;
                    const reverseEdgeId = `e-link-${linkedId}-${problem.id}`;

                    if (!edges.find(e => e.id === edgeId || e.id === reverseEdgeId)) {
                        edges.push({
                            id: edgeId,
                            source: problem.id,
                            target: linkedId,
                            type: 'smoothstep',
                            animated: true,
                            label: '관련',
                            labelStyle: { fill: '#3b82f6', fontSize: 10, fontWeight: 600 },
                            labelBgStyle: { fill: '#dbeafe', fillOpacity: 0.9 },
                            labelBgPadding: [4, 4],
                            labelBgBorderRadius: 4,
                            style: { stroke: '#3B82F6', strokeWidth: 3, strokeDasharray: '8,4' },
                            markerEnd: {
                                type: MarkerType.ArrowClosed,
                                color: '#3B82F6',
                                width: 20,
                                height: 20,
                            },
                        });
                    }
                });
            }
        });

        return getLayoutedElements(nodes, edges);
    }, [problems, selectedProblem, onSelectProblem]);

    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback(
        (params: Connection) => {
            // When user connects two nodes, update the parent relationship
            if (params.source && params.target) {
                onChangeLinkParent(params.target);
            }
            setEdges((eds) => addEdge(params, eds));
        },
        [setEdges, onChangeLinkParent]
    );

    const onLayout = useCallback(
        (direction: string) => {
            const { nodes: layoutedNodes, edges: layoutedEdges } = getLayoutedElements(
                nodes,
                edges,
                direction
            );

            setNodes([...layoutedNodes]);
            setEdges([...layoutedEdges]);
        },
        [nodes, edges, setNodes, setEdges]
    );

    return (
        <div className="w-full h-[700px] bg-gray-50 rounded-lg border border-gray-200">
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
                nodeTypes={nodeTypes}
                fitView
                attributionPosition="bottom-left"
                minZoom={0.1}
                maxZoom={2}
            >
                <Controls showInteractive={false} />
                <MiniMap
                    nodeColor={(node) => {
                        const problem = node.data.problem as Problem;
                        if (problem.difficulty <= 3) return '#86efac';
                        if (problem.difficulty <= 6) return '#fde047';
                        if (problem.difficulty <= 8) return '#fdba74';
                        return '#fca5a5';
                    }}
                    maskColor="rgba(0, 0, 0, 0.1)"
                    position="top-left"
                    style={{
                        backgroundColor: 'white',
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                    }}
                />
                <Background color="#aaa" gap={16} />
                <Panel position="top-right" className="bg-white p-2 rounded shadow-md border border-gray-200">
                    <div className="flex flex-col gap-2">
                        <div className="text-xs font-semibold text-gray-700 mb-1">Layout</div>
                        <button
                            onClick={() => onLayout('TB')}
                            className="px-3 py-1.5 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                            ⬇️ Vertical
                        </button>
                        <button
                            onClick={() => onLayout('LR')}
                            className="px-3 py-1.5 text-xs bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
                        >
                            ➡️ Horizontal
                        </button>
                    </div>
                </Panel>
            </ReactFlow>
        </div>
    );
}
