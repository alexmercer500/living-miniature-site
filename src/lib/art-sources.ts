import { getImage } from 'astro:assets';
import type { ImageMetadata } from 'astro';

/** Soft painted scenes hide compression well: this quality costs a little fine grain and saves
 *  roughly a third of the bytes, so the paintings arrive sooner on phone connections. Widths
 *  stay at the source resolution (1024/1672px) so nothing is ever upscaled. */
export const ART_QUALITY = { avif: 45, webp: 64 } as const;
export const ART_WIDTHS = { mobile: [480, 768, 1024], desktop: [1280, 1672] } as const;

export interface ArtSource { type: string; mobile: string; desktop?: string }
export interface ArtSources { sources: ArtSource[]; fallback: { src: string }; staticWide: { src: string } }

const variants = async (src: ImageMetadata, widths: readonly number[], format: 'avif' | 'webp') =>
  (await Promise.all(widths.map(async width => {
    const img = await getImage({ src, width, format, quality: ART_QUALITY[format] });
    return `${img.src} ${width}w`;
  }))).join(', ');

/** The srcsets of one painting. Shared by Art.astro and the head preloads so a preloaded URL is
 *  always exactly the candidate the browser's <picture> would choose — a mismatch would make it
 *  download the painting twice. */
export async function artSources(mobile: ImageMetadata, desktop?: ImageMetadata): Promise<ArtSources> {
  const sources = await Promise.all((['avif', 'webp'] as const).map(async type => ({
    type: `image/${type}`,
    mobile: await variants(mobile, ART_WIDTHS.mobile, type),
    desktop: desktop ? await variants(desktop, ART_WIDTHS.desktop, type) : undefined,
  })));
  const fallback = await getImage({ src: mobile, width: 768, format: 'webp', quality: ART_QUALITY.webp });
  const staticWide = desktop ? await getImage({ src: desktop, width: 1280, format: 'webp', quality: ART_QUALITY.webp }) : fallback;
  return { sources, fallback, staticWide };
}
