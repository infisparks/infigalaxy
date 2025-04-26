import { create } from 'zustand';
import { GraphData, NodeData } from './types';
import { transformFirebaseData } from './firebase-data';

interface GraphState {
  data: GraphData;
  selectedNode: NodeData | null;
  hoveredNode: NodeData | null;
  cameraPosition: [number, number, number];
  isLoading: boolean;
  nodeColors: Record<string, string>;
  destroyingNodes: string[];
  wireMode: boolean;
  wireConnections: Array<[string, string]>;
  
  // Actions
  setData: (data: GraphData) => void;
  selectNode: (nodeId: string | null) => void;
  hoverNode: (nodeId: string | null) => void;
  setCameraPosition: (position: [number, number, number]) => void;
  setLoading: (isLoading: boolean) => void;
  setNodeColors: (colors: Record<string, string>) => void;
  clearFilters: () => void;
  destroyNodesByType: (type: string) => void;
  toggleWireMode: () => void;
  addWireConnection: (sourceId: string, targetId: string) => void;
  fetchData: () => Promise<void>;
}

export const useGraphStore = create<GraphState>((set, get) => ({
  data: { nodes: [] },
  selectedNode: null,
  hoveredNode: null,
  cameraPosition: [0, 0, 100],
  isLoading: true,
  nodeColors: {},
  destroyingNodes: [],
  wireMode: false,
  wireConnections: [],
  
  setData: (data) => set({ data }),
  
  selectNode: (nodeId) => {
    if (!nodeId) {
      set({ selectedNode: null });
      return;
    }
    
    const { wireMode, selectedNode, wireConnections } = get();
    
    if (wireMode && selectedNode) {
      // Add wire connection between selected nodes
      const newConnection: [string, string] = [selectedNode.id, nodeId];
      set({ 
        wireConnections: [...wireConnections, newConnection],
        selectedNode: null
      });
    } else {
      const node = get().data.nodes.find(n => n.id === nodeId) || null;
      set({ selectedNode: node });
    }
  },
  
  hoverNode: (nodeId) => {
    if (!nodeId) {
      set({ hoveredNode: null });
      return;
    }
    
    const node = get().data.nodes.find(n => n.id === nodeId) || null;
    set({ hoveredNode: node });
  },
  
  setCameraPosition: (position) => set({ cameraPosition: position }),
  
  setLoading: (isLoading) => set({ isLoading }),

  setNodeColors: (colors) => set((state) => ({
    nodeColors: { ...state.nodeColors, ...colors }
  })),

  clearFilters: () => set({ 
    selectedNode: null,
    hoveredNode: null,
    nodeColors: {},
    cameraPosition: [0, 0, 100],
    wireConnections: []
  }),

  destroyNodesByType: (type) => {
    const { data } = get();
    const nodesToDestroy = data.nodes.filter(node => node.type === type);
    set({ destroyingNodes: nodesToDestroy.map(n => n.id) });

    setTimeout(() => {
      set(state => ({
        data: {
          nodes: state.data.nodes.filter(node => node.type !== type)
        },
        destroyingNodes: [],
        selectedNode: null
      }));
    }, 2000);
  },

  toggleWireMode: () => set(state => ({ 
    wireMode: !state.wireMode,
    selectedNode: null 
  })),

  addWireConnection: (sourceId, targetId) => 
    set(state => ({ 
      wireConnections: [...state.wireConnections, [sourceId, targetId]]
    })),

  fetchData: async () => {
    try {
      set({ isLoading: true });
      const response = await fetch('https://labmedford-default-rtdb.firebaseio.com/.json');
      const data = await response.json();
      const graphData = transformFirebaseData(data);
      set({ data: graphData, isLoading: false });
    } catch (error) {
      console.error('Error fetching data:', error);
      set({ isLoading: false });
    }
  }
}));