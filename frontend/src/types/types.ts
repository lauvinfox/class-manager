export interface Instructor {
  instructorId: string;
  name: string;
  username: string;
  id: string;
  subject: string;
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
  subjects?: string[];
  students?: Student[];
}
export interface ClassOwnerParams {
  _id: string;
  name: string;
  username: string;
  email: string;
}
export interface ClassInfoParams {
  classId: string;
  name: string;
  description?: string;
  classOwner: ClassOwnerParams;
}
