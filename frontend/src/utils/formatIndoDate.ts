export function formatIndoDate(dateString: string, useForeignFormat = false) {
  if (!dateString) return "-";
  const date = new Date(dateString);
  if (useForeignFormat) {
    // Format luar: dd/mm/yyyy (misal: 01/06/2025)
    return date.toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  }
  // Format Indonesia: 1 Juni 2025
  return date.toLocaleDateString("id-ID", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
