import sharp from 'sharp';
import { statSync, renameSync, existsSync } from 'node:fs';

const jobs = [
  { file: 'public/images/banner1.jpeg', width: 1920, quality: 80, label: '横幅背景' },
  { file: 'public/images/avatar.jpeg', width: 512, quality: 85, label: '头像' },
];

for (const job of jobs) {
  if (!existsSync(job.file)) {
    console.log(`跳过（不存在）: ${job.file}`);
    continue;
  }
  const before = statSync(job.file).size;
  const meta = await sharp(job.file).metadata();
  const out = await sharp(job.file)
    .resize({ width: job.width, withoutEnlargement: true })
    .jpeg({ quality: job.quality, mozjpeg: true, progressive: true })
    .toBuffer();
  const tmp = `${job.file}.tmp`;
  await sharp(out).toFile(tmp);
  renameSync(tmp, job.file);
  const after = statSync(job.file).size;
  console.log(
    `${job.label}: ${meta.width}x${meta.height} -> ${job.width}w | ` +
      `${(before / 1024).toFixed(1)}KB -> ${(after / 1024).toFixed(1)}KB ` +
      `(省 ${(100 - (after / before) * 100).toFixed(0)}%)`,
  );
}
