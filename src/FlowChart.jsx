import React, { useState, useCallback } from 'react';
import ReactFlow, {
    MiniMap,
    Controls,
    Background,
    useNodesState,
    useEdgesState,
    addEdge,
    getMarkerEnd,
    getBezierPath
} from 'reactflow';
import 'reactflow/dist/style.css';
import Modal from 'react-modal';
import { FaTrashAlt } from 'react-icons/fa';

const initialNodes = [
    { id: '1', type: 'input', data: { label: '📈 Campaign Start' }, position: { x: 250, y: 5 }, draggable: false },
];

const initialEdges = [];

const customStyles = {
    content: {
        top: '50%',
        left: '50%',
        right: 'auto',
        bottom: 'auto',
        marginRight: '-50%',
        transform: 'translate(-50%, -50%)',
    },
};

const CustomEdge = ({ id, sourceX, sourceY, targetX, targetY, sourcePosition, targetPosition, markerEnd, data }) => {
    const [edgePath, labelX, labelY] = getBezierPath({
        sourceX,
        sourceY,
        sourcePosition,
        targetX,
        targetY,
        targetPosition,
    });
    return (
        <>
            <path
                id={id}
                className="react-flow__edge-path"
                d={edgePath}
                markerEnd={markerEnd}
            />
            <text>
                <textPath href={`#${id}`} style={{ fontSize: 12 }} startOffset="50%" textAnchor="middle">
                    <tspan x={labelX} y={labelY} dy="-10" dx="5">
                        <button onClick={() => data.onDelete(id)}>❌</button>
                    </tspan>
                </textPath>
            </text>
        </>
    );
};

const FlowChart = () => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [modalIsOpen, setIsOpen] = useState(false);
    const [timeModalIsOpen, setTimeModalIsOpen] = useState(false);
    const [confirmDeleteModalIsOpen, setConfirmDeleteModalIsOpen] = useState(false);
    const [nodeIdToDelete, setNodeIdToDelete] = useState(null);
    const [nodeId, setNodeId] = useState(2);
    const [lastNodeId, setLastNodeId] = useState('1');
    const [days, setDays] = useState(1);
    const [time, setTime] = useState('00:00');

    const openModal = () => setIsOpen(true);
    const closeModal = () => setIsOpen(false);
    const openTimeModal = () => setTimeModalIsOpen(true);
    const closeTimeModal = () => setTimeModalIsOpen(false);
    const openConfirmDeleteModal = () => setConfirmDeleteModalIsOpen(true);
    const closeConfirmDeleteModal = () => setConfirmDeleteModalIsOpen(false);

    const addNode = (type, parentId) => {
        let label;
        switch (type) {
            case 'request':
                label = '🔗 Send Connection Request';
                break;
            case 'message':
                label = '✉️ Send Message';
                break;
            case 'email':
                label = '📧 InMail';
                break;
            case 'profile':
                label = '👤 View Profile';
                break;
            case 'follow':
                label = '🔗 Follow';
                break;
            case 'post':
                label = '👍 Like Post';
                break;
            case 'wait':
                label = `🕒 ${days} Day${days > 1 ? 's' : ''} at ${time}`;
                break;
            case 'end':
                label = '🏁 End';
                break;
            default:
                label = 'New Node';
        }

        const newNode = {
            id: nodeId.toString(),
            data: {
                label: (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span>{label}</span>
                        <button onClick={() => { setNodeIdToDelete(nodeId.toString()); openConfirmDeleteModal(); }}>
                            <FaTrashAlt />
                        </button>
                    </div>
                )
            },
            position: { x: 250, y: 100 + nodeId * 100 },
            draggable: false,
        };

        const buttonsNode = {
            id: (nodeId + 1).toString(),
            data: { label: (<><button onClick={openTimeModal}>{1 + 1}</button></>) },
            position: { x: 250, y: 100 + (nodeId + 1) * 100 },
            draggable: false,
        };

        setNodes((nds) => nds.concat(newNode, buttonsNode));
        const newEdges = [
            { id: `e${lastNodeId}-${nodeId}`, source: lastNodeId, target: nodeId.toString(), animated: false, type: 'custom', data: { onDelete: handleDeleteEdge } },
            { id: `e${nodeId}-${nodeId + 1}`, source: nodeId.toString(), target: (nodeId + 1).toString(), animated: false, type: 'custom', data: { onDelete: handleDeleteEdge } }
        ];
        setEdges((eds) => eds.concat(newEdges));
        setNodeId((id) => id + 4);
        setLastNodeId((nodeId + 1).toString());
        closeModal();
    };

    const handleTimeSubmit = () => {
        addNode('wait', lastNodeId);
        closeTimeModal();
    };

    const handleDeleteEdge = useCallback((id) => {
        setEdges((eds) => eds.filter((e) => e.id !== id));
    }, [setEdges]);

    const handleDeleteNode = () => {
        setNodes((nds) => nds.filter((node) => node.id !== nodeIdToDelete));
        setEdges((eds) => eds.filter((edge) => edge.source !== nodeIdToDelete && edge.target !== nodeIdToDelete));
        closeConfirmDeleteModal();
    };

    return (
        <div style={{ height: '100vh' }}>
            <ReactFlow
                nodes={nodes}
                edges={edges}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                fitView
                nodesConnectable={true}
                nodesDraggable={true}
                elementsSelectable={true}
                panOnDrag={true}
                zoomOnScroll={true}
                zoomOnPinch={true}
                edgeTypes={{ custom: CustomEdge }}
            >
                <MiniMap />
                <Controls />
                <Background color="red" gap={10} />
            </ReactFlow>
            <button style={{ position: 'absolute', top: '10rem', left: '30rem', padding: '10px' }} onClick={openModal}>
                Add Action
            </button>
            <Modal
                isOpen={modalIsOpen}
                onRequestClose={closeModal}
                style={customStyles}
                contentLabel="Add Action Modal"
            >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <button onClick={() => addNode('request', lastNodeId)} style={{ margin: '5px' }}>Send Connection Request</button>
                    <button onClick={() => addNode('message', lastNodeId)} style={{ margin: '5px' }}>Send Message</button>
                    <button onClick={() => addNode('email', lastNodeId)} style={{ margin: '5px' }}>InMail</button>
                    <button onClick={() => addNode('profile', lastNodeId)} style={{ margin: '5px' }}>View Profile</button>
                    <button onClick={() => addNode('follow', lastNodeId)} style={{ margin: '5px' }}>Follow</button>
                    <button onClick={() => addNode('post', lastNodeId)} style={{ margin: '5px' }}>Like Post</button>
                    <button onClick={closeModal} style={{ margin: '5px' }}>Close</button>
                </div>
            </Modal>
            <Modal
                isOpen={timeModalIsOpen}
                onRequestClose={closeTimeModal}
                style={customStyles}
                contentLabel="Set Time Modal"
            >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <label>
                        Days:
                        <input
                            type="number"
                            value={days}
                            onChange={(e) => setDays(e.target.value)}
                            style={{ margin: '5px' }}
                        />
                    </label>
                    <button onClick={handleTimeSubmit} style={{ margin: '5px' }}>Add Time</button>
                    <button onClick={closeTimeModal} style={{ margin: '5px' }}>Close</button>
                </div>
            </Modal>
            <Modal
                isOpen={confirmDeleteModalIsOpen}
                onRequestClose={closeConfirmDeleteModal}
                style={customStyles}
                contentLabel="Confirm Delete Modal"
            >
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <p>Are you sure you want to delete this?</p>
                    <button onClick={handleDeleteNode} style={{ margin: '5px' }}>Yes</button>
                    <button onClick={closeConfirmDeleteModal} style={{ margin: '5px' }}>No</button>
                </div>
            </Modal>
        </div>
    );
};

export default FlowChart;
