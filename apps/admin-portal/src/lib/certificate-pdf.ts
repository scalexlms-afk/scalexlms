import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export async function generateCertificatePdf(input: {
  studentName: string;
  courseTitle: string;
  issuedAt: Date | string;
}): Promise<Uint8Array> {
  const issued =
    typeof input.issuedAt === "string"
      ? new Date(input.issuedAt)
      : input.issuedAt;

  const issuedLabel = issued.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });

  const doc = await PDFDocument.create();
  // A4 landscape (points)
  const page = doc.addPage([841.89, 595.28]);
  const { width, height } = page.getSize();

  const titleFont = await doc.embedFont(StandardFonts.HelveticaBold);
  const bodyFont = await doc.embedFont(StandardFonts.Helvetica);
  const italicFont = await doc.embedFont(StandardFonts.HelveticaOblique);

  const red = rgb(0.86, 0.15, 0.15);
  const ink = rgb(0.12, 0.12, 0.14);
  const muted = rgb(0.4, 0.4, 0.45);

  page.drawRectangle({
    x: 28,
    y: 28,
    width: width - 56,
    height: height - 56,
    borderColor: red,
    borderWidth: 2,
  });

  page.drawRectangle({
    x: 36,
    y: 36,
    width: width - 72,
    height: height - 72,
    borderColor: rgb(0.75, 0.75, 0.78),
    borderWidth: 1,
  });

  const brand = "ScaleX LaunchPad";
  const brandSize = 28;
  const brandWidth = titleFont.widthOfTextAtSize(brand, brandSize);
  page.drawText(brand, {
    x: (width - brandWidth) / 2,
    y: height - 110,
    size: brandSize,
    font: titleFont,
    color: red,
  });

  const subtitle = "Certificate of Completion";
  const subtitleSize = 16;
  const subtitleWidth = bodyFont.widthOfTextAtSize(subtitle, subtitleSize);
  page.drawText(subtitle, {
    x: (width - subtitleWidth) / 2,
    y: height - 150,
    size: subtitleSize,
    font: bodyFont,
    color: muted,
  });

  const presented = "This certifies that";
  const presentedSize = 12;
  const presentedWidth = bodyFont.widthOfTextAtSize(presented, presentedSize);
  page.drawText(presented, {
    x: (width - presentedWidth) / 2,
    y: height - 210,
    size: presentedSize,
    font: bodyFont,
    color: muted,
  });

  const name = input.studentName.trim() || "Student";
  const nameSize = 32;
  const nameWidth = titleFont.widthOfTextAtSize(name, nameSize);
  page.drawText(name, {
    x: (width - nameWidth) / 2,
    y: height - 260,
    size: nameSize,
    font: titleFont,
    color: ink,
  });

  const completed = "has successfully completed";
  const completedSize = 12;
  const completedWidth = bodyFont.widthOfTextAtSize(completed, completedSize);
  page.drawText(completed, {
    x: (width - completedWidth) / 2,
    y: height - 300,
    size: completedSize,
    font: bodyFont,
    color: muted,
  });

  const course = input.courseTitle.trim() || "Course";
  const courseSize = 20;
  const courseWidth = italicFont.widthOfTextAtSize(course, courseSize);
  page.drawText(course, {
    x: (width - courseWidth) / 2,
    y: height - 340,
    size: courseSize,
    font: italicFont,
    color: ink,
  });

  const dateLine = `Issued ${issuedLabel}`;
  const dateSize = 11;
  const dateWidth = bodyFont.widthOfTextAtSize(dateLine, dateSize);
  page.drawText(dateLine, {
    x: (width - dateWidth) / 2,
    y: 90,
    size: dateSize,
    font: bodyFont,
    color: muted,
  });

  return doc.save();
}

export function certificateStoragePath(studentId: string, courseId: string) {
  return `${studentId}/${courseId}.pdf`;
}
