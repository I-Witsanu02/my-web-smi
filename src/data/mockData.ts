import { DetectedROI, PatientCase, UserProfile } from '../types';

export const currentUser: UserProfile = {
  name: 'Doctor 1',
  role: 'Clinical Reviewer',
  email: '',
  institution: 'Bone Age Research Unit',
  avatarUrl: '',
};

const ROI_LABELS: Array<[string, string, string]> = [
  ['Carpal', 'Carpal Bones', 'กระดูกข้อมือ (Carpal)'],
  ['DP3', 'Distal Phalanx 3', 'ข้อนิ้วส่วนปลาย นิ้วกลาง (DP3)'],
  ['MC1', 'Metacarpal 1', 'กระดูกฝ่ามือ นิ้วโป้ง (MC1)'],
  ['MP3', 'Middle Phalanx 3', 'ข้อนิ้วส่วนกลาง นิ้วกลาง (MP3)'],
  ['MP5', 'Middle Phalanx 5', 'ข้อนิ้วส่วนกลาง นิ้วก้อย (MP5)'],
  ['PP1', 'Proximal Phalanx 1', 'ข้อนิ้วส่วนโคน นิ้วโป้ง (PP1)'],
  ['PP3', 'Proximal Phalanx 3', 'ข้อนิ้วส่วนโคน นิ้วกลาง (PP3)'],
  ['Radius', 'Distal Radius', 'ปลายกระดูกเรเดียส (Distal Radius)'],
  ['Ulna', 'Distal Ulna', 'ปลายกระดูกอัลนา (Distal Ulna)'],
];

// Anatomical definitions only. Values stay empty until the backend returns
// evidence calculated from the uploaded radiograph.
export const defaultROIs: DetectedROI[] = ROI_LABELS.map(([code, name, nameTh], index) => ({
  id: `roi-${index + 1}`,
  code,
  name,
  nameTh,
  confidence: 0,
  importance: 0,
  thumbnailUrl: '',
  bbox: { top: '0%', left: '0%', width: '0%', height: '0%' },
  status: 'pending',
  anatomicalNote: '',
}));

export const initialCases: PatientCase[] = [];
