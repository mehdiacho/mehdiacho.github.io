import { weekRange } from '../../lib/arcade/week';

/** Draws a champion's certificate on a canvas and downloads it as a PNG. Nothing leaves the browser. */
export async function downloadCertificate(entry: { week: string; alias: string; score: number; title: string }) {
  try { await document.fonts.ready; } catch { /* System fonts are fine. */ }
  const W = 1754, H = 1240;
  const canvas = document.createElement('canvas'); canvas.width = W; canvas.height = H;
  const ctx = canvas.getContext('2d'); if (!ctx) throw new Error('This browser cannot draw the certificate.');
  const display = 'Grotesk, "Helvetica Neue", Arial, sans-serif';
  const mono = '"Fira Code Variable", ui-monospace, monospace';
  ctx.fillStyle = '#141619'; ctx.fillRect(0, 0, W, H);
  // The brut panel: a heavy rule and an acid offset shadow.
  ctx.fillStyle = '#ccff00'; ctx.fillRect(110, 110, W - 180, H - 180);
  ctx.fillStyle = '#f4f1e8'; ctx.fillRect(70, 70, W - 180, H - 180);
  ctx.strokeStyle = '#141619'; ctx.lineWidth = 6; ctx.strokeRect(70, 70, W - 180, H - 180);
  ctx.fillStyle = '#141619'; ctx.textBaseline = 'alphabetic';
  ctx.font = `600 26px ${mono}`; ctx.fillText('MEHDIACHO.TECH / WEEKLY ARCADE', 150, 190);
  ctx.textAlign = 'right'; ctx.fillText(entry.week, W - 190, 190); ctx.textAlign = 'left';
  ctx.fillRect(150, 220, W - 340, 4);
  ctx.font = `700 92px ${display}`; ctx.fillText('Champion of the week', 150, 360);
  ctx.font = `400 34px ${display}`; ctx.fillText('This certifies that', 150, 460);
  let size = 190; ctx.font = `700 ${size}px ${display}`;
  while (size > 90 && ctx.measureText(entry.alias).width > 1040) { size -= 10; ctx.font = `700 ${size}px ${display}`; }
  ctx.fillText(entry.alias, 140, 650);
  ctx.font = `400 34px ${display}`;
  ctx.fillText(`finished top of the board in ${entry.title}, ${weekRange(entry.week)} (UTC),`, 150, 750);
  ctx.fillText(`with a score the server replayed and confirmed:`, 150, 800);
  ctx.font = `700 120px ${mono}`; ctx.fillText(entry.score.toLocaleString('en-GB'), 150, 950);
  // Seal.
  ctx.save(); ctx.translate(W - 340, 420); ctx.rotate(-0.2);
  ctx.fillStyle = '#141619'; ctx.beginPath(); ctx.arc(0, 0, 150, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#ccff00'; ctx.lineWidth = 5; ctx.beginPath(); ctx.arc(0, 0, 126, 0, Math.PI * 2); ctx.stroke();
  ctx.fillStyle = '#ccff00'; ctx.textAlign = 'center';
  ctx.font = `700 74px ${display}`; ctx.fillText(entry.week.slice(5), 0, 22);
  ctx.font = `600 22px ${mono}`; ctx.fillText('IMMORTALISED', 0, 76); ctx.fillText(entry.week.slice(0, 4), 0, -62);
  ctx.restore();
  ctx.fillStyle = '#141619'; ctx.fillRect(150, 1030, 520, 3);
  ctx.font = `400 28px ${display}`; ctx.fillText('Mehdi Acho, keeper of the scoreboard', 150, 1075);
  ctx.font = `500 22px ${mono}`; ctx.fillStyle = '#585e68'; ctx.fillText('Listed in the hall of fame at mehdiacho.tech/#play', 150, 1115);
  const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
  if (!blob) throw new Error('The certificate could not be drawn.');
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob); link.download = `champion-${entry.week}-${entry.alias}.png`;
  document.body.append(link); link.click(); link.remove();
  setTimeout(() => URL.revokeObjectURL(link.href), 10_000);
}
