import { GoGoal } from "react-icons/go";
import { GrPlan } from "react-icons/gr";
import {
  IoIosStats,
  IoIosSettings,
  IoIosPerson,
  IoIosPersonAdd,
  IoIosEyeOff,
  IoIosLogIn,
  IoIosLogOut,
} from "react-icons/io";
import {
  FaChartBar,
  FaCalendarAlt,
  FaFacebookMessenger,
  FaUsersCog,
  FaListAlt,
} from "react-icons/fa";

export const links = [
  {
    href: "#",
    icon: FaChartBar,
    text: "Dashboard",
  },
  {
    href: "#",
    icon: FaCalendarAlt,
    text: "Kanban",
    badge: {
      text: "Pro",
      color: "bg-gray-100 text-gray-800",
      darkColor: "dark:bg-gray-700 dark:text-gray-300",
    },
  },
  {
    href: "#",
    icon: FaFacebookMessenger,
    text: "Inbox",
    badge: {
      text: "4",
      color: "bg-blue-100 text-blue-800",
      darkColor: "dark:bg-blue-900 dark:text-blue-300",
    },
  },
  {
    href: "#",
    icon: FaUsersCog,
    text: "Users",
  },
  {
    href: "#",
    icon: FaListAlt,
    text: "Products",
  },
  {
    href: "#",
    icon: IoIosLogIn,
    text: "Sign In",
  },
  {
    href: "#",
    icon: IoIosLogOut,
    text: "Sign Up",
  },
];

export const empolyeesData = [
  {
    title: "Total Empolyees",
    icon: IoIosPerson,
    count: 200,
    bgColor: "bg-gray-100",
  },
  {
    title: "On Leave",
    icon: IoIosEyeOff,
    count: 15,
    bgColor: "bg-blue-100",
  },
  {
    title: "New Joinee",
    icon: IoIosPersonAdd,
    count: 25,
    bgColor: "bg-yellow-100",
  },
];

export const shortcutLink = [
  {
    title: "Goals",
    icon: GoGoal,
  },
  {
    title: "Plan",
    icon: GrPlan,
  },
  {
    title: "Stats",
    icon: IoIosStats,
  },
  {
    title: "Setting",
    icon: IoIosSettings,
  },
];

export const wordTranslations = (language: string) => {
  return {
    subject: language === "id" ? "Mata Pelajaran" : "Subject",
    noSubjects: language === "id" ? "Tidak ada mata pelajaran" : "No subjects",
    createJournal: language === "id" ? "Buat Jurnal" : "Create Journal",
    all: language === "id" ? "Semua" : "All",
    thisWeek: language === "id" ? "Minggu Ini" : "This Week",
    thisMonth: language === "id" ? "Bulan Ini" : "This Month",
    name: language === "id" ? "Nama" : "Name",
    attendance: language === "id" ? "Kehadiran" : "Attendance",
    notes: language === "id" ? "Catatan" : "Notes",
    present: language === "id" ? "Hadir" : "Present",
    absent: language === "id" ? "Absen" : "Absent",
    late: language === "id" ? "Terlambat" : "Late",
    sick: language === "id" ? "Sakit" : "Sick",
    excused: language === "id" ? "Izin" : "Excused",
    pending: language === "id" ? "Menunggu" : "Pending",
    noAttendances:
      language === "id"
        ? "Tidak ada kehadiran atau catatan."
        : "No attendances or notes available.",
    createdBy: language === "id" ? "Dibuat oleh" : "Created By:",
    startTime: language === "id" ? "Waktu Mulai" : "Start Time:",
    endTime: language === "id" ? "Waktu Selesai" : "End Time:",
    deleteJournal: language === "id" ? "Hapus Jurnal" : "Delete Journal",
    deleteAssignmentModalTitle:
      language === "id" ? "Hapus Jurnal" : "Delete Journal",
    deleteAssignmentModalDesc:
      language === "id"
        ? "Apakah Anda yakin ingin menghapus jurnal ini? Tindakan ini tidak dapat dibatalkan."
        : "Are you sure you want to delete this journal? This action cannot be undone.",
    delete: language === "id" ? "Hapus" : "Delete",
    cancel: language === "id" ? "Batal" : "Cancel",
    saveChanges: language === "id" ? "Simpan Perubahan" : "Save Changes",
    journalCreated:
      language === "id"
        ? "Jurnal berhasil dibuat!"
        : "Journal created successfully!",
    journalDeleted:
      language === "id" ? "Jurnal berhasil dihapus!" : "Journal deleted!",
    changesSaved:
      language === "id" ? "Perubahan berhasil disimpan!" : "Changes saved!",
    create: language === "id" ? "Buat" : "Create",
    title: language === "id" ? "Judul" : "Title",
    description: language === "id" ? "Deskripsi" : "Description",
    date: language === "id" ? "Tanggal" : "Date",
    journalTitlePlaceholder:
      language === "id" ? "Judul Jurnal" : "Journal Title",
    journalDescPlaceholder:
      language === "id" ? "Deskripsi Jurnal" : "Journal Description",
    failedLoad:
      language === "id"
        ? "Gagal memuat detail jurnal"
        : "Failed to load journal detail",
    refresh: language === "id" ? "Segarkan" : "Refresh",
    homework: language === "id" ? "PR" : "Homework",
    quiz: language === "id" ? "Kuis" : "Quiz",
    exam: language === "id" ? "Ujian" : "Exam",
    project: language === "id" ? "Proyek" : "Project",
    finalExam: language === "id" ? "Ujian Akhir" : "Final Exam",
    assignedBy: language === "id" ? "Diberikan Oleh" : "Assigned By",
    type: language === "id" ? "Tipe" : "Type",
    assignmentDate: language === "id" ? "Tanggal Penugasan" : "Assignment Date",
    noGradesAvailable:
      language === "id" ? "Tidak ada nilai tersedia." : "No grades available.",
    action: language === "id" ? "Aksi" : "Action",
    score: language === "id" ? "Nilai" : "Score",
    getAssistance: language === "id" ? "Minta Asistensi" : "Get Assistance",
    createAssistance:
      language === "id" ? "Buat Asistensi" : "Create Assistance",
    assignmentDescription:
      language === "id" ? "Deskripsi Tugas" : "Assignment Description",
    assignmentTitle: language === "id" ? "Judul" : "Title",
    selectStudent: language === "id" ? "Pilih Siswa" : "Select Student",
    save: language === "id" ? "Simpan" : "Save",
    deleteAssignmentConfirmation:
      language === "id"
        ? "Apakah Anda yakin ingin menghapus tugas ini? Tindakan ini tidak dapat dibatalkan."
        : "Are you sure you want to delete this assignment? This action cannot be undone.",

    deleteAssignment: language === "id" ? "Hapus Tugas" : "Delete Assignment",
    assignmentType: language === "id" ? "Tipe Tugas" : "Assignment Type",
    noDescriptionProvided:
      language === "id"
        ? "Tidak ada deskripsi yang diberikan."
        : "No description provided.",
    createAssignment: language === "id" ? "Buat Tugas" : "Create Assignment",
    searchStudent: language === "id" ? "Cari siswa" : "Search student",
    editAssignment: language === "id" ? "Sunting Tugas" : "Edit Assignment",
    edit: language === "id" ? "Sunting" : "Edit",
    totalJournals: language === "id" ? "Total Jurnal" : "Total Journals",
    noAttendanceSummary:
      language === "id"
        ? "Tidak ada ringkasan kehadiran ditemukan."
        : "No attendance summary found.",
    noAssignmentSummaryForSubject:
      language === "id"
        ? "Tidak ada ringkasan tugas untuk mata pelajaran ini."
        : "No assignment summary for this subject.",
    assignmentSummary:
      language === "id" ? "Ringkasan Tugas" : "Assignment Summary",
    attendanceSummary:
      language === "id" ? "Ringkasan Kehadiran" : "Attendance Summary",
    statistics: language === "id" ? "Statistik" : "Statistics",
    changeViewMode:
      language === "id" ? "Ubah Mode Tampilan" : "Change View Mode",
    chooseLanguage: language === "id" ? "Pilih Bahasa" : "Choose Language",
    language: language === "id" ? "Bahasa Indonesia" : "English",
    account: language === "id" ? "Akun" : "Account",
    general: language === "id" ? "Umum" : "General",
    preferences: language === "id" ? "Preferensi" : "Preferences",
    settings: language === "id" ? "Pengaturan" : "Settings",
    profile: language === "id" ? "Profil" : "Profile",
    searchInstructor:
      language === "id" ? "Cari instruktur" : "Search instructor",
    noInstructors:
      language === "id"
        ? "Tidak ada instruktur ditemukan."
        : "No instructors found.",
    addSubject: language === "id" ? "Tambah Subyek" : "Add Subject",
    addInstructor: language === "id" ? "Tambah Instruktur" : "Add Instructor",
    username: language === "id" ? "Username" : "Username",
    status: language === "id" ? "Status" : "Status",
    owner: language === "id" ? "Pemilik" : "Owner",
    instructor: language === "id" ? "Instruktur" : "Instructor",
    accepted: language === "id" ? "Diterima" : "Accepted",
    declined: language === "id" ? "Ditolak" : "Declined",
    needConfirmation:
      language === "id" ? "Butuh Konfirmasi" : "Need Confirmation",
    remove: language === "id" ? "Hapus" : "Remove",
    removeInstructor:
      language === "id" ? "Hapus Instruktur" : "Remove Instructor",
    giveSubject: language === "id" ? "Berikan Subyek" : "Give Subject",
    undetermined: language === "id" ? "Belum Ditentukan" : "Undetermined",
    noInstructorsFound:
      language === "id"
        ? "Instruktur tidak ditemukan."
        : "No instructors found.",
    giveSubjectTo:
      language === "id" ? "Berikan subyek kepada" : "Give subject to",
    chooseOneSubjectToGive:
      language === "id"
        ? "Pilih satu subyek untuk diberikan"
        : "Choose one subject to give to",

    inviteInstructors:
      language === "id" ? "Undang Instruktur" : "Invite Instructors",

    userNotFound:
      language === "id" ? "Pengguna tidak ditemukan" : "User not found",
    invite: language === "id" ? "Undang" : "Invite",
    add: language === "id" ? "Tambah" : "Add",
    back: language === "id" ? "Kembali" : "Back",
    addStudent: language === "id" ? "Tambah Siswa" : "Add Student",
    deleteStudents: language === "id" ? "Hapus Semua Siswa" : "Delete Students",
    deleteStudentsConfirmation:
      language === "id"
        ? "Apakah Anda yakin ingin menghapus semua siswa? Tindakan ini tidak dapat dibatalkan."
        : "Are you sure you want to delete all students? This action cannot be undone.",
    studentId: language === "id" ? "ID Siswa" : "Student ID",
    birthDate: language === "id" ? "Tanggal Lahir" : "Birth Date",
    birthPlace: language === "id" ? "Tempat Lahir" : "Birth Place",
    contact: language === "id" ? "Kontak" : "Contact",
    report: language === "id" ? "Laporan" : "Report",
    createReport: language === "id" ? "Buat Laporan" : "Create Report",
    createReportFor:
      language === "id" ? "Buat Laporan untuk" : "Create Report for",
    fullReport: language === "id" ? "Laporan Lengkap" : "Full Report",
    reportByTime:
      language === "id" ? "Laporan berdasarkan Waktu" : "Report by Time",
    note: language === "id" ? "Catatan" : "Note",
    notePlaceholder:
      language === "id" ? "Catatan untuk laporan" : "Note for the report",
    startDate: language === "id" ? "Tanggal Mulai" : "Start Date",
    endDate: language === "id" ? "Tanggal Selesai" : "End Date",
    reportDescription:
      language === "id" ? "Deskripsi Laporan" : "Report Description",
    close: language === "id" ? "Tutup" : "Close",
    downloadPDF: language === "id" ? "Unduh PDF" : "Download PDF",
    editStudent: language === "id" ? "Sunting Siswa" : "Edit Student",
    address: language === "id" ? "Alamat" : "Address",
    deleteStudent: language === "id" ? "Hapus Siswa" : "Delete Student",
    deleteStudentConfirmation:
      language === "id"
        ? "Apakah Anda yakin ingin menghapus siswa ini? Tindakan ini tidak dapat dibatalkan."
        : "Are you sure you want to delete this student? This action cannot be undone.",
    noStudentFound:
      language === "id" ? "Siswa tidak ditemukan." : "No student found.",
    addStudents: language === "id" ? "Tambah Siswa" : "Add Students",
    singleUpload: language === "id" ? "Upload Tunggal" : "Single Upload",
    bulkUpload: language === "id" ? "Upload Massal" : "Bulk Upload",
    searchTopic: language === "id" ? "Cari topik" : "Search topic",
    createLearningPlan:
      language === "id" ? "Buat Rencana Pembelajaran" : "Create Learning Plan",
    assistanceRequest:
      language === "id" ? "Permintaan Bantuan" : "Assistance Request",
    beginner: language === "id" ? "Pemula" : "Beginner",
    intermediate: language === "id" ? "Menengah" : "Intermediate",
    high: language === "id" ? "Tinggi" : "High",
    hours: language === "id" ? "jam" : "hours",
    topic: language === "id" ? "Topik" : "Topic",
    learningPlanTopic:
      language === "id" ? "Topik Rencana Pembelajaran" : "Learning Plan Topic",
    level: language === "id" ? "Tingkat" : "Level",
    durationInHour: language === "id" ? "Durasi (jam)" : "Duration in Hour",
    learningStyle: language === "id" ? "Gaya Belajar" : "Learning Style",
    visual: language === "id" ? "Visual" : "Visual",
    auditory: language === "id" ? "Auditori" : "Auditory",
    kinesthetic: language === "id" ? "Kinestetik" : "Kinesthetic",
    readingWriting: language === "id" ? "Membaca-Menulis" : "Reading-Writing",
    collaborative: language === "id" ? "Kolaboratif" : "Collaborative",
    independent: language === "id" ? "Mandiri" : "Independent",
    problemBased: language === "id" ? "Berbasis Masalah" : "Problem-based",
    inquiryBased: language === "id" ? "Berbasis Inkuiri" : "Inquiry-based",
    learningPlan: language === "id" ? "Rencana Pembelajaran" : "Learning Plan",
    subjectWeights: language === "id" ? "Bobot Subyek" : "Subject Weights",
    noSubjectWeightFound:
      language === "id"
        ? "Tidak ada bobot subyek ditemukan."
        : "No subject weights found.",
    updateSubjectWeights:
      language === "id" ? "Perbarui Bobot Subyek" : "Update Subject Weights",
    enterValueInPercent:
      language === "id"
        ? "Masukkan nilai dalam persen (%)."
        : "Enter value in percent (%).",
    update: language === "id" ? "Perbarui" : "Update",
    notifications: language === "id" ? "Notifikasi" : "Notifications",
    loading: language === "id" ? "Memuat..." : "Loading...",
    failedToLoadNotifications:
      language === "id"
        ? "Gagal memuat notifikasi."
        : "Failed to load notifications.",
    noNotifications:
      language === "id" ? "Tidak ada notifikasi." : "No notifications.",
    inviteAccepted: language === "id" ? "Undangan Diterima" : "Invite Accepted",
    inviteDenied: language === "id" ? "Undangan Ditolak" : "Invite Denied",
    grade: language === "id" ? "Nilai" : "Grade",
    by: language === "id" ? "oleh" : "by",
    journalDescription:
      language === "id" ? "Deskripsi Jurnal" : "Journal Description",
    duration: language === "id" ? "Durasi" : "Duration",
    home: language === "id" ? "Beranda" : "Home",
    notification: language === "id" ? "Notifikasi" : "Notification",
    logout: language === "id" ? "Keluar" : "Logout",
    signOut: language === "id" ? "Keluar" : "Sign Out",
    logoutConfirmation:
      language === "id"
        ? "Apakah Anda yakin ingin keluar? Anda perlu masuk lagi untuk mengakses akun Anda."
        : "Are you sure you want to sign out? You will need to log in again to access your account.",
    haveBeenInvited:
      language === "id"
        ? "Anda telah diundang untuk menjadi instruktur di kelas"
        : "You have been invited to be an instructor in class",
    weightsMustBeHundred:
      language === "id"
        ? "Pastikan bobot semua penugasan berjumlah 100%"
        : "Please make sure all weights add up to 100%",
  };
};

// ------- ==
// chart data, later we will use this!!!

// const options = {
//   series: [44, 55, 41],
//   options: {
//     chart: {
//       type: "donut",
//       height: 350,
//     },
//     labels: ["Desktop", "Tablet", "Mobile"],
//     colors: ["#FF5733", "#33FF57", "#3357FF"],
//     legend: {
//       position: "bottom",
//       labels: {
//         colors: darkMode ? "#dddddd" : "#000000",
//       },
//     },
//     dataLabels: {
//       style: {
//         colors: ["#dddddd"],
//       },
//     },
//     responsive: [
//       {
//         breakpoint: 480,
//         options: {
//           chart: {
//             width: 200,
//           },
//           legend: {
//             position: "bottom",
//           },
//         },
//       },
//     ],
//   },
// };

// ..........
// const chartConfig = {
//   series: [
//     {
//       name: "Sales",
//       data: [50, 40, 300, 320, 500, 350, 200, 230, 500],
//     },
//   ],
//   options: {
//     chart: {
//       type: "bar",
//       height: 240,
//       toolbar: {
//         show: false,
//       },
//     },
//     title: {
//       show: false,
//     },
//     dataLabels: {
//       enabled: false,
//     },
//     colors: ["#020617"],
//     plotOptions: {
//       bar: {
//         columnWidth: "40%",
//         borderRadius: 2,
//       },
//     },
//     xaxis: {
//       axisTicks: {
//         show: false,
//       },
//       axisBorder: {
//         show: false,
//       },
//       labels: {
//         style: {
//           colors: darkMode ? "#dddddd" : "#616161",
//           fontSize: "12px",
//           fontFamily: "inherit",
//           fontWeight: 400,
//         },
//       },
//       categories: [
//         "Apr",
//         "May",
//         "Jun",
//         "Jul",
//         "Aug",
//         "Sep",
//         "Oct",
//         "Nov",
//         "Dec",
//       ],
//     },
//     yaxis: {
//       labels: {
//         style: {
//           colors: darkMode ? "#dddddd" : "#616161",
//           fontSize: "12px",
//           fontFamily: "inherit",
//           fontWeight: 400,
//         },
//       },
//     },
//     grid: {
//       show: true,
//       borderColor: "#a0a0a0",
//       strokeDashArray: 5,
//       xaxis: {
//         lines: {
//           show: true,
//         },
//       },
//       padding: {
//         top: 5,
//         right: 20,
//       },
//     },
//     fill: {
//       opacity: 0.8,
//     },
//     tooltip: {
//       theme: "dark",
//     },
//   },
// };
