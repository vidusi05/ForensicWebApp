export const mockCases = [
  { id: '2026101', type: 'Clinical Forensic', patientName: 'John Doe', date: '2026-06-01', status: 'Active', doctor: 'Dr. A. Perera' },
  { id: '2026102', type: 'Autopsy', patientName: 'Jane Smith', date: '2026-06-02', status: 'Pending PMR', doctor: 'Dr. B. Silva' },
  { id: '2026103', type: 'Clinical Forensic', patientName: 'Michael Brown', date: '2026-06-02', status: 'Closed', doctor: 'Dr. A. Perera' },
  { id: '2026104', type: 'Autopsy', patientName: 'Unknown', date: '2026-06-03', status: 'Active', doctor: 'Dr. C. Fernando' },
];

export const mockEvidence = [
  { id: 'ev1', caseId: '2026101', name: 'Crime_Scene_1.jpg', size: '2.4 MB', type: 'image', uploadedAt: '2026-06-01 10:00 AM' },
  { id: 'ev2', caseId: '2026101', name: 'MLEF_Draft.pdf', size: '1.2 MB', type: 'document', uploadedAt: '2026-06-01 11:30 AM' },
  { id: 'ev3', caseId: '2026102', name: 'Toxicology_Report.pdf', size: '840 KB', type: 'document', uploadedAt: '2026-06-02 14:00 PM' },
];

export const mockReports = [
  { id: 'rep1', caseId: '2026101', type: 'MLEF', status: 'Drafted', date: '2026-06-01' },
  { id: 'rep2', caseId: '2026102', type: 'PMR', status: 'Pending Signature', date: '2026-06-02' },
];

export const mockAuditLogs = [
  { id: 'log1', action: 'User Login', user: 'Dr. A. Perera', timestamp: '2026-06-03 08:00 AM', details: 'Successful login via IP 192.168.1.1' },
  { id: 'log2', action: 'Case Created', user: 'Data Entry Operator', timestamp: '2026-06-03 08:15 AM', details: 'Created case #2026104' },
  { id: 'log3', action: 'Evidence Uploaded', user: 'Dr. C. Fernando', timestamp: '2026-06-03 08:45 AM', details: 'Uploaded 3 photos to case #2026104' },
];
