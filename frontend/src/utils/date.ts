// Fungsi untuk mendapatkan Senin dan Minggu minggu ini
export function getThisWeekRange() {
  const today = new Date();
  // Cari hari Senin minggu ini (0=minggu, 1=senin, dst)
  const dayOfWeek = today.getDay();
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() - ((dayOfWeek + 6) % 7));
  weekStart.setHours(0, 0, 0, 0);
  // Minggu minggu ini = Senin minggu ini + 6 hari
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  weekEnd.setHours(23, 59, 59, 999);
  return { weekStart, weekEnd };
}
// Fungsi untuk mendapatkan awal dan akhir bulan ini
export function getThisMonthRange() {
  const today = new Date();
  const monthStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    1,
    0,
    0,
    0,
    0
  );
  const monthEnd = new Date(
    today.getFullYear(),
    today.getMonth() + 1,
    0,
    23,
    59,
    59,
    999
  );
  return { monthStart, monthEnd };
}
