export interface Instructor {
  instructorId: string;
  name: string;
  username: string;
  id: string;
  role: string;
  status: string;
}
export interface Student {
  id: string;
  studentId: string;
  name: string;
  birthDate: string;
  birthPlace: string;
  contact: string;
  address: string;
}
export interface ClassInfo {
  classId: string;
  name: string;
  description?: string;
  classOwner: string;
  instructors?: Instructor[];
  roles?: string[];
  students?: Student[];
}
