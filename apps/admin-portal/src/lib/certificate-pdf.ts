import { PDFDocument, StandardFonts, rgb, type PDFFont, type PDFPage } from "pdf-lib";

const RED = rgb(0.89, 0.118, 0.141); // #E31E24
const RED_DARK = rgb(0.706, 0.094, 0.114);
const INK = rgb(0.086, 0.086, 0.102);
const MUTED = rgb(0.38, 0.38, 0.42);
const LINE = rgb(0.78, 0.76, 0.74);
const CREAM = rgb(0.988, 0.976, 0.957);
const GOLD = rgb(0.72, 0.58, 0.28);

function centerText(
  page: PDFPage,
  text: string,
  y: number,
  size: number,
  font: PDFFont,
  color: ReturnType<typeof rgb>
) {
  const width = page.getWidth();
  const textWidth = font.widthOfTextAtSize(text, size);
  page.drawText(text, {
    x: Math.max(48, (width - textWidth) / 2),
    y,
    size,
    font,
    color,
  });
}

function fitCentered(
  page: PDFPage,
  text: string,
  y: number,
  maxSize: number,
  minSize: number,
  font: PDFFont,
  color: ReturnType<typeof rgb>,
  maxWidth: number
) {
  let size = maxSize;
  while (size > minSize && font.widthOfTextAtSize(text, size) > maxWidth) {
    size -= 1;
  }
  let display = text;
  if (font.widthOfTextAtSize(display, size) > maxWidth) {
    while (display.length > 4 && font.widthOfTextAtSize(`${display}…`, size) > maxWidth) {
      display = display.slice(0, -1);
    }
    display = `${display}…`;
  }
  centerText(page, display, y, size, font, color);
}

function drawCornerOrnament(page: PDFPage, x: number, y: number, flipX: boolean, flipY: boolean) {
  const dx = flipX ? -1 : 1;
  const dy = flipY ? -1 : 1;
  page.drawLine({
    start: { x, y },
    end: { x: x + 28 * dx, y },
    thickness: 1.25,
    color: GOLD,
  });
  page.drawLine({
    start: { x, y },
    end: { x, y: y + 28 * dy },
    thickness: 1.25,
    color: GOLD,
  });
}

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
  const page = doc.addPage([841.89, 595.28]);
  const { width, height } = page.getSize();

  const titleFont = await doc.embedFont(StandardFonts.TimesRomanBold);
  const bodyFont = await doc.embedFont(StandardFonts.TimesRoman);
  const italicFont = await doc.embedFont(StandardFonts.TimesRomanItalic);
  const sansBold = await doc.embedFont(StandardFonts.HelveticaBold);
  const sans = await doc.embedFont(StandardFonts.Helvetica);

  page.drawRectangle({
    x: 0,
    y: 0,
    width,
    height,
    color: CREAM,
  });

  page.drawRectangle({
    x: 22,
    y: 22,
    width: width - 44,
    height: height - 44,
    borderColor: RED,
    borderWidth: 3,
  });

  page.drawRectangle({
    x: 32,
    y: 32,
    width: width - 64,
    height: height - 64,
    borderColor: GOLD,
    borderWidth: 1,
  });

  page.drawRectangle({
    x: 38,
    y: 38,
    width: width - 76,
    height: height - 76,
    borderColor: LINE,
    borderWidth: 0.6,
  });

  page.drawRectangle({
    x: 38,
    y: height - 52,
    width: width - 76,
    height: 14,
    color: RED,
  });

  drawCornerOrnament(page, 50, height - 64, false, true);
  drawCornerOrnament(page, width - 50, height - 64, true, true);
  drawCornerOrnament(page, 50, 64, false, false);
  drawCornerOrnament(page, width - 50, 64, true, false);

  centerText(page, "SCALEX LAUNCHPAD", height - 96, 11, sansBold, RED);
  centerText(page, "Learn. Build. Launch. Grow.", height - 114, 10, italicFont, MUTED);

  page.drawLine({
    start: { x: width / 2 - 90, y: height - 132 },
    end: { x: width / 2 + 90, y: height - 132 },
    thickness: 0.7,
    color: GOLD,
  });

  centerText(page, "Certificate of Completion", height - 168, 28, titleFont, INK);
  centerText(page, "This certifies that", height - 208, 12, bodyFont, MUTED);

  const name = input.studentName.trim() || "Student";
  fitCentered(page, name, height - 258, 36, 16, titleFont, INK, width - 160);

  page.drawLine({
    start: { x: width / 2 - 160, y: height - 270 },
    end: { x: width / 2 + 160, y: height - 270 },
    thickness: 0.8,
    color: RED_DARK,
  });

  centerText(page, "has successfully completed", height - 300, 12, bodyFont, MUTED);

  const course = input.courseTitle.trim() || "Course";
  fitCentered(page, course, height - 336, 20, 12, italicFont, INK, width - 180);

  centerText(
    page,
    "and has met the ScaleX LaunchPad milestone standard.",
    height - 366,
    11,
    bodyFont,
    MUTED
  );

  // Seal
  const sealX = width / 2;
  const sealY = 148;
  page.drawCircle({
    x: sealX,
    y: sealY,
    size: 28,
    borderColor: RED,
    borderWidth: 1.6,
  });
  page.drawCircle({
    x: sealX,
    y: sealY,
    size: 22,
    borderColor: GOLD,
    borderWidth: 0.8,
  });
  const sx = sansBold.widthOfTextAtSize("SX", 13);
  page.drawText("SX", {
    x: sealX - sx / 2,
    y: sealY - 4,
    size: 13,
    font: sansBold,
    color: RED,
  });

  const leftX = 90;
  const rightX = width - 250;
  page.drawText(`Issued ${issuedLabel}`, {
    x: leftX,
    y: 92,
    size: 10,
    font: sans,
    color: MUTED,
  });
  page.drawLine({
    start: { x: rightX, y: 108 },
    end: { x: rightX + 150, y: 108 },
    thickness: 0.7,
    color: LINE,
  });
  page.drawText("Director of Training", {
    x: rightX + 18,
    y: 92,
    size: 10,
    font: sans,
    color: MUTED,
  });

  centerText(
    page,
    "This is the official ScaleX certificate design issued to completing students.",
    58,
    8,
    sans,
    MUTED
  );

  return doc.save();
}

export function certificateStoragePath(studentId: string, courseId: string) {
  return `${studentId}/${courseId}.pdf`;
}
