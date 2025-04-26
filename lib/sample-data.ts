import { GraphData, NodeData, Relationship } from './types';

// Helper function to generate a random position within bounds
const randomPosition = (min = -50, max = 50): [number, number, number] => {
  return [
    min + Math.random() * (max - min),
    min + Math.random() * (max - min),
    min + Math.random() * (max - min)
  ];
};

// Generate more descriptive labels
const generateLabel = (type: string, index: number): string => {
  const labels = {
    memory: [
      'First day at school',
      'Summer vacation 2019',
      'Graduation ceremony',
      'Birthday celebration',
      'Family reunion',
      'Learning to drive',
      'First job interview',
      'Moving to new city',
      'Wedding day memories',
      'Achievement award'
    ],
    thought: [
      'Future career plans',
      'Project ideas',
      'Personal growth',
      'Life philosophy',
      'Creative inspiration',
      'Problem solution',
      'Innovation concept',
      'Research theory',
      'Strategic thinking',
      'Artistic vision'
    ],
    event: [
      'Tech conference 2024',
      'Team building workshop',
      'Product launch',
      'Annual meeting',
      'Industry summit',
      'Networking event',
      'Training session',
      'Award ceremony',
      'Project milestone',
      'Company celebration'
    ],
    concept: [
      'Artificial Intelligence',
      'Sustainable Energy',
      'Digital Innovation',
      'Cloud Computing',
      'Machine Learning',
      'Data Analytics',
      'Blockchain Tech',
      'Quantum Computing',
      'Neural Networks',
      'IoT Systems'
    ],
    person: [
      'Team Leader',
      'Project Manager',
      'Tech Innovator',
      'Design Expert',
      'Research Lead',
      'Data Scientist',
      'System Architect',
      'Product Owner',
      'UX Specialist',
      'Dev Engineer'
    ]
  };
  
  const typeLabels = labels[type as keyof typeof labels] || [];
  return typeLabels[index % typeLabels.length] || `${type}_${index}`;
};

// Helper to create connections between nodes with more meaningful relationships
const createConnections = (nodes: NodeData[], maxConnections = 8) => {
  return nodes.map(node => {
    const numConnections = Math.floor(Math.random() * maxConnections) + 3; // At least 3 connections
    const connections = [];
    const relationships: Relationship[] = ['knows', 'created', 'influenced', 'connected_to', 'lives_in', 'attended'];
    
    for (let i = 0; i < numConnections; i++) {
      let targetIndex;
      do {
        targetIndex = Math.floor(Math.random() * nodes.length);
      } while (nodes[targetIndex].id === node.id && nodes.length > 1);
      
      const relationship = relationships[Math.floor(Math.random() * relationships.length)];
      
      connections.push({
        target: nodes[targetIndex].id,
        relationship,
        strength: Math.random() * 0.6 + 0.4, // Stronger connections (0.4 to 1.0)
      });
    }
    
    return {
      ...node,
      connections,
    };
  });
};

// Generate a set of initial node types with more variety
const generateInitialNodes = (count = 100): NodeData[] => {
  const types = ['memory', 'thought', 'event', 'concept', 'person'];
  const nodes: NodeData[] = [];
  
  for (let i = 0; i < count; i++) {
    const type = types[Math.floor(Math.random() * types.length)] as NodeData['type'];
    const size = Math.random() * 2 + 1; // Larger sizes between 1 and 3
    
    nodes.push({
      id: `node-${i}`,
      label: generateLabel(type, i),
      type,
      size,
      position: randomPosition(-80, 80), // Wider spread
      color: getNodeColor(type),
      connections: [],
    });
  }
  
  return nodes;
};

// Enhanced node colors with more vibrant options
export const getNodeColor = (type: NodeData['type']): string => {
  switch (type) {
    case 'memory':
      return '#FFD700'; // Brighter gold
    case 'thought':
      return '#FF3366'; // Vibrant pink-red
    case 'event':
      return '#9370DB'; // Medium purple
    case 'concept':
      return '#00CED1'; // Dark turquoise
    case 'person':
      return '#32CD32'; // Lime green
    default:
      return '#FFFFFF';
  }
};

// Generate the full graph data with more nodes
export const generateGraphData = (nodeCount = 100): GraphData => {
  let nodes = generateInitialNodes(nodeCount);
  nodes = createConnections(nodes, 12); // Up to 12 connections per node
  
  return { nodes };
};

// Default export for sample data
const sampleData = generateGraphData();
export default sampleData;