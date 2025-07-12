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
  instructors?: {
    instructorId: string;
    name: string;
    username: string;
    id: string;
    subject: string;
    status: string;
  }[];
  subjects?: string[];
  students?: Student[];
  role: string;
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
export interface ClassHeaderProps {
  title: string;
  activeTab: string;
  handleTab: (tab: string) => void;
}
export interface Assignment {
  assignmentId: string;
  title: string;
  assignmentDate: Date;
  assignedBy: string;
  assignmentType: "homework" | "quiz" | "exam" | "project" | "finalExam";
  grades: {
    studentId: string;
    name: string;
    score: number;
    notes?: string;
  }[];
}

export interface Journal {
  journalId: string;
  title: string;
  description?: string;
  journalDate: string;
  journals: {
    studentId: string;
    status: "present" | "absent" | "late" | "sick" | "excused" | "pending";
    note?: string;
  };
}
