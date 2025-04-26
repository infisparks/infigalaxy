// Existing types
export interface NodeData {
  id: string;
  label: string;
  type: 'memory' | 'thought' | 'event' | 'concept' | 'person' | 'test' | 'patient' | 'doctor';
  size: number;
  color?: string;
  position?: [number, number, number];
  connections: Connection[];
}

export interface Connection {
  target: string;
  relationship: Relationship;
  strength: number;
}

export type Relationship = 
  | 'knows'
  | 'created'
  | 'influenced'
  | 'connected_to'
  | 'lives_in'
  | 'attended'
  | 'tested'
  | 'prescribed'
  | 'contains';

export interface GraphData {
  nodes: NodeData[];
}

// Firebase data types
export interface BloodTest {
  testName: string;
  price: number;
  parameters: Parameter[];
  type?: string;
  updatedAt?: string;
  createdAt?: string;
}

export interface Parameter {
  name: string;
  range: {
    female?: { rangeKey: string; rangeValue: string }[];
    male?: { rangeKey: string; rangeValue: string }[];
  };
  unit: string;
  valueType: string;
  formula?: string;
  suggestions?: { description: string; shortName: string }[];
}

export interface Patient {
  name: string;
  age: string | number;
  gender: string;
  contact: string;
  bloodTests: {
    testId: string;
    testName: string;
    price: number;
  }[];
  doctorName?: string;
  createdAt: string;
}

export interface Doctor {
  doctorName: string;
  address: string;
  number: string;
  commissionPercentage: number;
}