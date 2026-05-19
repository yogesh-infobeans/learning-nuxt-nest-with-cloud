import { Injectable } from '@nestjs/common';
import { parseStringPromise } from 'xml2js';

export type ParsedBookContent = {
  htmlContent: string;
  plainTextContent: string;
};

@Injectable()
export class XmlParserService {
  async parseBookXml(xml: string): Promise<ParsedBookContent> {
    const parsed = await parseStringPromise(xml, {
      explicitArray: false,
      trim: true,
      normalizeTags: true,
    });

    const root = parsed.book ?? parsed;
    const title = this.asText(root.title);
    const chapters = this.normalizeToArray(root.chapters?.chapter ?? root.chapter ?? []);
    const chapterHtml = chapters
      .map((chapter: Record<string, unknown>, idx) => {
        const heading = this.asText(chapter.title) || `Chapter ${idx + 1}`;
        const paragraphs = this.normalizeToArray(chapter.paragraph ?? chapter.p ?? [])
          .map((paragraph) => `<p>${this.escapeHtml(this.asText(paragraph))}</p>`)
          .join('');
        return `<section><h2>${this.escapeHtml(heading)}</h2>${paragraphs}</section>`;
      })
      .join('');

    const htmlContent = `<article><h1>${this.escapeHtml(title)}</h1>${chapterHtml}</article>`;
    const plainTextContent = this.stripHtml(htmlContent);

    return { htmlContent, plainTextContent };
  }

  private normalizeToArray(input: unknown): Record<string, unknown>[] {
    if (Array.isArray(input)) {
      return input as Record<string, unknown>[];
    }
    if (!input) {
      return [];
    }
    return [input as Record<string, unknown>];
  }

  private asText(value: unknown): string {
    if (typeof value === 'string') {
      return value;
    }
    if (typeof value === 'number' || typeof value === 'boolean') {
      return String(value);
    }
    return '';
  }

  private escapeHtml(value: string): string {
    return value
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  private stripHtml(value: string): string {
    return value.replaceAll(/<[^>]+>/g, ' ').replaceAll(/\s+/g, ' ').trim();
  }
}
