import sharp from 'sharp';
import type { ImageMetadata } from 'astro';

const cache = new Map<string, Promise<string | undefined>>();

/**
 * A blurred, roughly 1 KB preview of a painting as a CSS `url()`, inlined into the HTML
 * so the very first paint already shows the scene's own colours and shapes while the
 * full image downloads, and stays behind it if that download ever fails.
 * The tiny bitmap is wrapped in an SVG blur, so it scales up smoothly instead of blocky.
 */
export function artPreview(image: ImageMetadata) {
  const path = (image as ImageMetadata & { fsPath?: string }).fsPath;
  if (!path) return Promise.resolve(undefined);
  let preview = cache.get(path);
  if (!preview) {
    preview = render(path).catch(() => undefined);
    cache.set(path, preview);
  }
  return preview;
}

async function render(path: string) {
  const { data, info } = await sharp(path).resize(32).webp({ quality: 50 }).toBuffer({ resolveWithObject: true });
  const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 ${info.width} ${info.height}'>`
    + `<filter id='b' x='0' y='0' width='1' height='1' color-interpolation-filters='sRGB'>`
    + `<feGaussianBlur stdDeviation='.55' edgeMode='duplicate'/>`
    + `<feComponentTransfer><feFuncA type='discrete' tableValues='1 1'/></feComponentTransfer></filter>`
    + `<image width='100%' height='100%' preserveAspectRatio='none' filter='url(#b)' href='data:image/webp;base64,${data.toString('base64')}'/></svg>`;
  return `url("data:image/svg+xml,${svg.replace(/</g, '%3C').replace(/>/g, '%3E').replace(/#/g, '%23')}")`;
}
