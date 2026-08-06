/**
 * رفع صورة من المتصفح إلى AWS عبر /api/upload (نفس أسلوب العيادة).
 */
export async function uploadFileToAws(
  file: File,
  folder = "uploads"
): Promise<{ url: string; path: string }> {
  const fd = new FormData();
  fd.append("file", file);
  fd.append("folder", folder);
  fd.append("prefix", "tourism");

  const response = await fetch("/api/upload", {
    method: "POST",
    body: fd,
  });
  const result = await response.json();

  if (!response.ok) {
    throw new Error(result.error || "فشل رفع الصورة إلى AWS");
  }

  const url = (result.url || result.path) as string;
  if (!url) throw new Error("لم يُرجع السيرفر رابط الصورة");
  return { url, path: url };
}

export async function uploadFilesToAws(
  files: File[],
  folder = "uploads"
): Promise<string[]> {
  const urls: string[] = [];
  for (const file of files) {
    const { url } = await uploadFileToAws(file, folder);
    urls.push(url);
  }
  return urls;
}
