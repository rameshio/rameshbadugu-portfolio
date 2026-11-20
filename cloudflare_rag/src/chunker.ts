export interface TextChunkInput {
  id: string;
  source: string;
  title?: string;
  section?: string;
  page?: number;
  content: string;
}

export interface DocumentChunk {
  id: string;
  source: string;
  title: string;
  section: string;
  page: number;
  chunkIndex: number;
  text: string;
}

const DEFAULT_SEPARATORS = ["\n\n", "\n", ". ", "• ", " ", ""];

function splitSegment(text: string, chunkSize: number, separators: string[]): string[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  if (trimmed.length <= chunkSize) return [trimmed];

  const [sep, ...restSeparators] = separators;
  if (sep === undefined) {
    const hardSlices: string[] = [];
    for (let i = 0; i < trimmed.length; i += chunkSize) {
      hardSlices.push(trimmed.slice(i, i + chunkSize));
    }
    return hardSlices;
  }

  const parts = sep === "" ? Array.from(trimmed) : trimmed.split(sep);
  if (parts.length <= 1) {
    return splitSegment(trimmed, chunkSize, restSeparators);
  }

  const segments: string[] = [];
  let current = "";

  for (const part of parts) {
    const piece = sep === ". " && !part.endsWith(".") && part !== parts[parts.length - 1]
      ? `${part}.`
      : part;
    const candidate = current ? `${current}${sep === ". " ? " " : sep}${piece}` : piece;

    if (candidate.length <= chunkSize) {
      current = candidate;
      continue;
    }

    if (current) {
      segments.push(current.trim());
      current = "";
    }

    if (piece.length > chunkSize) {
      segments.push(...splitSegment(piece, chunkSize, restSeparators));
    } else {
      current = piece;
    }
  }

  if (current.trim()) {
    segments.push(current.trim());
  }

  return segments;
}

export function splitTextRecursively(
  text: string,
  options: { chunkSize?: number; chunkOverlap?: number } = {},
): string[] {
  const chunkSize = Math.max(100, options.chunkSize ?? 700);
  const chunkOverlap = Math.max(0, Math.min(options.chunkOverlap ?? 120, Math.floor(chunkSize / 2)));

  const normalized = text.replace(/\r\n/g, "\n").replace(/\u0000/g, "").trim();
  if (!normalized) return [];

  const baseSegments = splitSegment(normalized, chunkSize, DEFAULT_SEPARATORS);
  if (chunkOverlap === 0 || baseSegments.length <= 1) {
    return baseSegments;
  }

  const overlapped: string[] = [baseSegments[0]];
  for (let i = 1; i < baseSegments.length; i += 1) {
    const prev = baseSegments[i - 1];
    const tail = prev.slice(Math.max(0, prev.length - chunkOverlap)).trimStart();
    const combined = tail && baseSegments[i].length + tail.length + 1 <= chunkSize + chunkOverlap
      ? `${tail} ${baseSegments[i]}`.trim()
      : baseSegments[i];
    overlapped.push(combined);
  }

  return overlapped;
}

export function buildDocumentChunks(
  documents: TextChunkInput[],
  options: { chunkSize?: number; chunkOverlap?: number } = {},
): DocumentChunk[] {
  const chunks: DocumentChunk[] = [];

  for (const doc of documents) {
    const pieces = splitTextRecursively(doc.content, options);
    pieces.forEach((piece, index) => {
      const safeId = `${doc.id}-chunk-${index}`.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 64);
      chunks.push({
        id: safeId,
        source: doc.source,
        title: doc.title ?? doc.source,
        section: doc.section ?? "general",
        page: doc.page ?? 1,
        chunkIndex: index,
        text: piece,
      });
    });
  }

  return chunks;
}
