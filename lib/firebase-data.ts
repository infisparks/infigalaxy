import { GraphData, NodeData, BloodTest, Patient, Doctor } from './types';

const randomPosition = (min = -50, max = 50): [number, number, number] => {
  return [
    min + Math.random() * (max - min),
    min + Math.random() * (max - min),
    min + Math.random() * (max - min)
  ];
};

export const getNodeColor = (type: string): string => {
  switch (type) {
    case 'test':
      return '#00CED1'; // Turquoise for tests
    case 'patient':
      return '#FFD700'; // Gold for patients
    case 'doctor':
      return '#9370DB'; // Purple for doctors
    case 'parameter':
      return '#32CD32'; // Green for parameters
    default:
      return '#FFFFFF';
  }
};

export const transformFirebaseData = (data: any): GraphData => {
  const nodes: NodeData[] = [];
  const nodeMap = new Map<string, number>();
  let nodeIndex = 0;

  // Process blood tests
  Object.entries(data.bloodTests || {}).forEach(([testId, test]: [string, any]) => {
    const testNode: NodeData = {
      id: testId,
      label: test.testName,
      type: 'test',
      size: 2,
      position: randomPosition(-80, 80),
      color: getNodeColor('test'),
      connections: []
    };
    nodes.push(testNode);
    nodeMap.set(testId, nodeIndex++);

    // Add parameter nodes for each test
    test.parameters?.forEach((param: any, paramIndex: number) => {
      const paramId = `${testId}-param-${paramIndex}`;
      const paramNode: NodeData = {
        id: paramId,
        label: param.name,
        type: 'test',
        size: 1,
        position: randomPosition(-60, 60),
        color: getNodeColor('test'),
        connections: [{
          target: testId,
          relationship: 'contains',
          strength: 0.8
        }]
      };
      nodes.push(paramNode);
      nodeMap.set(paramId, nodeIndex++);
    });
  });

  // Process patients
  Object.entries(data.patients || {}).forEach(([patientId, patient]: [string, any]) => {
    const patientNode: NodeData = {
      id: patientId,
      label: patient.name,
      type: 'patient',
      size: 1.5,
      position: randomPosition(-100, 100),
      color: getNodeColor('patient'),
      connections: []
    };
    nodes.push(patientNode);
    nodeMap.set(patientId, nodeIndex++);

    // Connect patients to their tests
    patient.bloodTests?.forEach((test: any) => {
      patientNode.connections.push({
        target: test.testId,
        relationship: 'tested',
        strength: 0.6
      });
    });

    // Connect patients to their doctors
    if (patient.doctorName) {
      const doctorId = `doctor-${patient.doctorName.replace(/\s+/g, '-').toLowerCase()}`;
      patientNode.connections.push({
        target: doctorId,
        relationship: 'prescribed',
        strength: 0.7
      });
    }
  });

  // Process doctors
  Object.entries(data.doctor || {}).forEach(([doctorId, doctor]: [string, any]) => {
    const doctorNode: NodeData = {
      id: doctorId,
      label: doctor.doctorName,
      type: 'doctor',
      size: 2,
      position: randomPosition(-120, 120),
      color: getNodeColor('doctor'),
      connections: []
    };
    nodes.push(doctorNode);
    nodeMap.set(doctorId, nodeIndex++);
  });

  return { nodes };
};