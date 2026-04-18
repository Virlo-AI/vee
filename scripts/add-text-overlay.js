import 'dotenv/config';
import { createCanvas, loadImage } from 'canvas';
import { readFileSync, mkdirSync, existsSync } from 'fs';
import { resolve, dirname, basename, extname, join } from 'path';
import { parseArgs } from 'util';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

const DEFAULTS = {
  color: '#ffffff',
  outlineColor: '#000000',
  outlineWidth: 3,
  paddingRatio: 0.05,
  lineHeightRatio: 1.3,
  fontFamily: 'Arial',
};

function getOutputDir(inputPath) {
  const inputDir = dirname(resolve(inputPath));
  const parentDir = dirname(inputDir);
  const outputDir = join(parentDir, 'slides-final');
  return outputDir;
}

function ensureDir(dir) {
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
  }
}

function calcFontSize(imageWidth, manual) {
  if (manual) return parseInt(manual, 10);
  return Math.round(imageWidth * 0.055);
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let current = '';

  for (const word of words) {
    const test = current ? `${current} ${word}` : word;
    const { width } = ctx.measureText(test);
    if (width > maxWidth && current) {
      lines.push(current);
      current = word;
    } else {
      current = test;
    }
  }
  if (current) lines.push(current);
  return lines;
}

function applyTextStyle(ctx, style, fontSize, fontFamily) {
  switch (style) {
    case 'bold':
      ctx.font = `bold ${fontSize}px ${fontFamily}`;
      break;
    case 'light':
      ctx.font = `300 ${fontSize}px ${fontFamily}`;
      break;
    case 'outline':
      ctx.font = `bold ${fontSize}px ${fontFamily}`;
      break;
    default:
      ctx.font = `bold ${fontSize}px ${fontFamily}`;
  }
}

function drawTextBlock(ctx, lines, x, startY, lineHeight, style, outlineWidth, color, outlineColor) {
  for (const line of lines) {
    if (style === 'outline') {
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = outlineWidth * 2;
      ctx.lineJoin = 'round';
      ctx.strokeText(line, x, startY);
      ctx.fillStyle = color;
      ctx.fillText(line, x, startY);
    } else {
      ctx.strokeStyle = outlineColor;
      ctx.lineWidth = outlineWidth;
      ctx.lineJoin = 'round';
      ctx.strokeText(line, x, startY);
      ctx.fillStyle = color;
      ctx.fillText(line, x, startY);
    }
    startY += lineHeight;
  }
}

function calcBlockHeight(lineCount, lineHeight) {
  return lineCount * lineHeight;
}

async function overlayOne(entry) {
  const {
    input,
    text,
    position = 'top',
    style = 'bold',
    fontSize: manualFontSize,
    color = DEFAULTS.color,
    outlineColor = DEFAULTS.outlineColor,
    outlineWidth = DEFAULTS.outlineWidth,
    outputDir: customOutputDir,
  } = entry;

  const inputPath = resolve(input);
  const img = await loadImage(inputPath);

  const canvas = createCanvas(img.width, img.height);
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0);

  const padding = Math.round(img.width * DEFAULTS.paddingRatio);
  const fontSize = calcFontSize(img.width, manualFontSize);
  const lineHeight = Math.round(fontSize * DEFAULTS.lineHeightRatio);
  const maxTextWidth = img.width - padding * 2;

  applyTextStyle(ctx, style, fontSize, DEFAULTS.fontFamily);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  const textEntries = Array.isArray(text)
    ? text
    : [{ content: text, position, style, color, outlineColor, outlineWidth }];

  for (const block of textEntries) {
    const blockText = typeof block === 'string' ? block : block.content;
    const blockPosition = (typeof block === 'object' && block.position) || position;
    const blockStyle = (typeof block === 'object' && block.style) || style;
    const blockColor = (typeof block === 'object' && block.color) || color;
    const blockOutlineColor = (typeof block === 'object' && block.outlineColor) || outlineColor;
    const blockOutlineWidth = (typeof block === 'object' && block.outlineWidth) || outlineWidth;

    applyTextStyle(ctx, blockStyle, fontSize, DEFAULTS.fontFamily);
    const lines = wrapText(ctx, blockText, maxTextWidth);
    const blockHeight = calcBlockHeight(lines.length, lineHeight);

    let startY;
    if (blockPosition === 'top') {
      startY = padding;
    } else if (blockPosition === 'bottom') {
      startY = img.height - padding - blockHeight;
    } else {
      startY = Math.round((img.height - blockHeight) / 2);
    }

    const x = img.width / 2;
    drawTextBlock(ctx, lines, x, startY, lineHeight, blockStyle, blockOutlineWidth, blockColor, blockOutlineColor);
  }

  const outputDir = customOutputDir
    ? resolve(customOutputDir)
    : getOutputDir(inputPath);
  ensureDir(outputDir);

  const ext = extname(inputPath) || '.png';
  const name = basename(inputPath, ext);
  const outputPath = join(outputDir, `${name}-final${ext}`);

  const { createWriteStream } = await import('fs');
  await new Promise((res, rej) => {
    const out = createWriteStream(outputPath);
    const stream = canvas.createPNGStream();
    stream.pipe(out);
    out.on('finish', res);
    out.on('error', rej);
  });

  return outputPath;
}

async function runBatch(configPath) {
  const raw = readFileSync(resolve(configPath), 'utf8');
  const entries = JSON.parse(raw);

  console.log(`adding overlays... ${entries.length} slide${entries.length !== 1 ? 's' : ''} in queue`);

  const results = [];
  for (let i = 0; i < entries.length; i++) {
    const entry = entries[i];
    try {
      const out = await overlayOne(entry);
      results.push(out);
      console.log(`slide ${i + 1} done.`);
    } catch (err) {
      console.error(`slide ${i + 1} failed. ${err.message}`);
      results.push(null);
    }
  }

  const success = results.filter(Boolean).length;
  console.log(`\nlooking clean. ${success}/${entries.length} slides ready.`);
  return results;
}

async function runSingle(args) {
  const { input, text, position, style, fontSize, color, outputDir } = args;

  if (!input || !text) {
    console.error('missing --input or --text. try again.');
    process.exit(1);
  }

  console.log(`adding overlay...`);

  try {
    const out = await overlayOne({ input, text, position, style, fontSize, color, outputDir });
    console.log(`done. saved to ${out}`);
    return [out];
  } catch (err) {
    console.error(`something broke. ${err.message}`);
    process.exit(1);
  }
}

async function main() {
  const { values } = parseArgs({
    args: process.argv.slice(2),
    options: {
      batch:      { type: 'string' },
      input:      { type: 'string' },
      text:       { type: 'string' },
      position:   { type: 'string', default: 'top' },
      style:      { type: 'string', default: 'bold' },
      fontSize:   { type: 'string' },
      color:      { type: 'string' },
      outputDir:  { type: 'string' },
    },
    strict: false,
  });

  if (values.batch) {
    return runBatch(values.batch);
  }

  return runSingle(values);
}

export { overlayOne, runBatch };

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  main().catch((err) => {
    console.error(`vee hit a wall. ${err.message}`);
    process.exit(1);
  });
}
