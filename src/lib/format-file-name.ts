const formatFileName = (filename: string | undefined | null): string => {
  if (!filename) return "Document";
  try {
    // Hapus timestamp di akhir dan ekstensi file
    return (
      filename
        .replace(/-\d+(\.[^.]+)?$/, "") // Hapus timestamp dan ekstensi
        .replace(/\.[^/.]+$/, "") || // Hapus ekstensi jika masih ada
      "Document"
    );
  } catch {
    return "Document";
  }
};

export default formatFileName;
