import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export interface PDFTableColumn {
  header: string;
  dataKey: string;
}

export interface PDFTableRow {
  [key: string]: string | number;
}

// Tipe untuk nilai (grades) per mata pelajaran
type Grade = {
  subject: string;
  homework: number;
  quiz: number;
  exam: number;
  project: number;
  finalExam: number;
  finalScore: number;
};

// Tipe untuk kehadiran (attendance) per mata pelajaran
type Attendance = {
  subject: string;
  attendance: Record<string, number>; // string bisa jadi tanggal atau sesi
};

// Tipe untuk bobot penilaian (weights) per mata pelajaran
type Weight = {
  subject: string;
  weight: {
    homework: number;
    quiz: number;
    exam: number;
    project: number;
    finalExam: number;
  };
};

// Tipe utama untuk setiap siswa
type StudentRecord = {
  studentId: string;
  className: string;
  homeroom: string;
  grades: Grade[];
  attendances: Attendance[];
  weights: Weight[];
  averageScore: number;
  note: string;
};

// Tipe koleksi semua siswa
export type StudentRecords = Record<string, StudentRecord>;

// Helper to flatten student data for PDF table
export function studentDataToPDFRows(data: StudentRecords) {
  const rows: PDFTableRow[] = [];
  Object.entries(data).forEach(([name, student]) => {
    // For each subject in grades, find matching attendance
    student.grades.forEach((grade) => {
      const attendanceObj = student.attendances.find(
        (a) => a.subject === grade.subject
      );
      const attendance = attendanceObj?.attendance || {};
      rows.push({
        name,
        studentId: student.studentId,
        className: student.className,
        homeroom: student.homeroom,
        subject: grade.subject,
        homework: grade.homework ?? 0,
        quiz: grade.quiz ?? 0,
        exam: grade.exam ?? 0,
        project: grade.project ?? 0,
        finalExam: grade.finalExam ?? 0,
        finalScore: grade.finalScore ?? 0,
        present: attendance.present ?? 0,
        absent: attendance.absent ?? 0,
        late: attendance.late ?? 0,
        sick: attendance.sick ?? 0,
        excused: attendance.excused ?? 0,
        pending: attendance.pending ?? 0,
        note: student.note,
      });
    });
  });
  return rows;
}

/**
 * Generate a PDF with a table using jsPDF and jsPDF-AutoTable
 * @param title Title of the PDF document
 * @param columns Array of column definitions
 * @param rows Array of row data
 */
export function generatePDF({
  rows,
  data,
}: {
  rows: PDFTableRow[];
  data: Record<
    string,
    {
      studentId: string;
      className: string;
      homeroom: string;
      grades: {
        subject: string;
        homework: number;
        quiz: number;
        exam: number;
        project: number;
        finalExam: number;
        finalScore: number;
      }[];
      attendances: { subject: string; attendance: Record<string, number> }[];
      weights: {
        subject: string;
        weight: {
          homework: number;
          quiz: number;
          exam: number;
          project: number;
          finalExam: number;
        };
      }[];
      averageScore: number;
      note: string;
    }
  >;
}): jsPDF {
  const doc = new jsPDF();

  const columns = [
    { header: "Subject", dataKey: "subject" },
    { header: "Final Score", dataKey: "finalScore" },
    { header: "Present", dataKey: "present" },
    { header: "Absent", dataKey: "absent" },
    { header: "Late", dataKey: "late" },
    { header: "Sick", dataKey: "sick" },
    { header: "Excused", dataKey: "excused" },
    { header: "Pending", dataKey: "pending" },
    { header: "Note", dataKey: "note" },
  ];

  // ...existing code...
  doc.setFontSize(18);
  doc.setTextColor(0, 0, 0);
  // If rows exist, print Name, studentId, className as a horizontal table
  let nextY = 16;
  if (rows.length > 0) {
    const { name, studentId, className, homeroom } = rows[0];
    autoTable(doc, {
      body: [
        ["Name", name],
        ["Student Id", studentId],
        ["Class", className],
        ["Homeroom", homeroom],
      ],
      startY: nextY,
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 40 }, // left column (label)
        1: { cellWidth: 141 }, // right column (value)
      },
      alternateRowStyles: {
        fillColor: [230, 240, 255],
      },
      tableWidth: "auto",
      didParseCell: function (data) {
        // Kolom kiri (index 0) diberi warna biru
        if (data.column.index === 0) {
          data.cell.styles.fillColor = [41, 128, 185];
          data.cell.styles.textColor = 255;
          data.cell.styles.fontStyle = "bold";
        }
      },
    });
    // Get the Y position after the first table
    nextY =
      (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
        .finalY + 10;
  }

  // Split columns for finalScore and attendance
  const attendanceCols = columns.filter((col) =>
    ["present", "absent", "late", "sick", "excused", "pending"].includes(
      col.dataKey
    )
  );
  const subjectCol = columns.find((col) => col.dataKey === "subject");

  // Table for finalScore and assignment types
  const assignmentKeys = [
    "homework",
    "quiz",
    "exam",
    "project",
    "finalExam",
    "finalScore",
  ];

  const assignmentCols = assignmentKeys
    .map((key) => columns.find((col) => col.dataKey === key))
    .filter(Boolean);
  if (assignmentCols.length > 0 && subjectCol) {
    autoTable(doc, {
      head: [
        [
          subjectCol.header,
          "Homework",
          "Quiz",
          "Exam",
          "Project",
          "Final Exam",
          "Final Score",
        ],
      ],
      body: rows.map((row) => [
        row[subjectCol.dataKey],
        row["homework"],
        row["quiz"],
        row["exam"],
        row["project"],
        row["finalExam"],
        row["finalScore"],
      ]),
      startY: nextY,
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [230, 240, 255],
      },
    });
    nextY =
      (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
        .finalY + 10;
  }

  // Table for attendance
  if (attendanceCols.length > 0 && subjectCol) {
    autoTable(doc, {
      head: [[subjectCol.header, ...attendanceCols.map((col) => col.header)]],
      body: rows.map((row) => [
        row[subjectCol.dataKey],
        ...attendanceCols.map((col) => row[col.dataKey]),
      ]),
      startY: nextY,
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [230, 240, 255],
      },
    });
    nextY =
      (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
        .finalY + 10;
  }

  // Add a second table below with only the 'note' column (one per student)
  let lastY = 56;
  if (rows.length > 0) {
    // Find the last Y position after the previous table
    lastY =
      (doc as unknown as { lastAutoTable: { finalY: number } }).lastAutoTable
        .finalY || 56;
    // Get unique notes per student
    const studentNotes: { name: string; note: string }[] = [];
    const seenNames = new Set<string>();
    rows.forEach((row) => {
      if (!seenNames.has(row.name as string)) {
        studentNotes.push({
          name: row.name as string,
          note: row.note as string,
        });
        seenNames.add(row.name as string);
      }
    });
    autoTable(doc, {
      head: [["Note"]],
      body: studentNotes.map((item) => [item.note ?? ""]),
      startY: lastY + 10,
      margin: { left: 14 }, // sejajar dengan table weights/average score
      tableWidth: 100,
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 3,
        minCellHeight: 50,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
        minCellHeight: 10,
      },
      alternateRowStyles: {
        fillColor: [230, 240, 255],
      },
      columnStyles: {
        0: { cellWidth: 100 }, // pastikan lebar sama dengan average score
      },
    });

    // Get weights and averageScore for the first student
    const studentObj = Object.values(data)[0] as {
      weights: {
        subject: string;
        weight: {
          homework: number;
          quiz: number;
          exam: number;
          project: number;
          finalExam: number;
        };
      }[];
      averageScore: number;
    };
    const averageScore = studentObj?.averageScore ?? 0;

    // Table 2: Average Score
    autoTable(doc, {
      head: [["Average Score"]],
      body: [[averageScore]],
      startY: lastY + 10,
      margin: { left: 120 },
      tableWidth: 50,
      theme: "grid",
      styles: {
        fontSize: 52,
        cellPadding: 3,
        minCellHeight: 50,
        halign: "center", // Center horizontally
        valign: "middle", // Center vertically
        fontStyle: "bold",
      },
      headStyles: {
        fillColor: [41, 128, 185],
        fontSize: 10,
        textColor: 255,
        fontStyle: "bold",
        minCellHeight: 10,
        halign: "center",
        valign: "middle",
      },
      alternateRowStyles: {
        fillColor: [230, 240, 255],
      },
      columnStyles: {
        0: { cellWidth: 76, halign: "center", valign: "middle" }, // Center column
      },
    });

    // Table 1: Weights (horizontal layout, per subject)
    // Move to page 2 for weights table
    doc.addPage();
    // Add description text above the weights table (English, wrapped)
    doc.setFontSize(12);
    doc.setTextColor(40, 40, 40);
    const weightsDescription =
      "The table below shows the grading weights for each assignment type in every subject. These weights are used as the basis for calculating the final score.";
    // Wrap text to fit within page width
    const pageWidth = doc.internal.pageSize.getWidth();
    const marginLeft = 14;
    const maxTextWidth = pageWidth - marginLeft * 2;
    const lines = doc.splitTextToSize(weightsDescription, maxTextWidth);
    doc.text(lines, marginLeft, 16);
    // Get weights array from studentObj
    const weightsArr = studentObj.weights as Array<{
      subject: string;
      weight: {
        homework: number;
        quiz: number;
        exam: number;
        project: number;
        finalExam: number;
      };
    }>;
    autoTable(doc, {
      head: [["Subject", "Homework", "Quiz", "Exam", "Project", "Final Exam"]],
      body: weightsArr.map((w) => [
        w.subject,
        w.weight.homework ?? 0,
        w.weight.quiz ?? 0,
        w.weight.exam ?? 0,
        w.weight.project ?? 0,
        w.weight.finalExam ?? 0,
      ]),
      startY: 24,
      margin: { left: 14 },
      tableWidth: "auto",
      theme: "grid",
      styles: {
        fontSize: 10,
        cellPadding: 3,
      },
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: [230, 240, 255],
      },
    });
  }
  return doc;
}
