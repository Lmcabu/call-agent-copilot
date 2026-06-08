import { KBDoc } from "../agent/types";
import { kbDocs } from "./docs";

function scoreDoc(doc: KBDoc, query: string): number {
  const q = query.toLowerCase();
  const terms = q.split(/\s+/).filter((t) => t.length > 2);

  let score = 0;

  for (const term of terms) {
    if (doc.title.toLowerCase().includes(term)) score += 3;
    if (doc.category.toLowerCase().includes(term)) score += 2;
    if (doc.content.toLowerCase().includes(term)) score += 1;
    if (doc.keywords.some((k) => k.toLowerCase().includes(term))) score += 2;
  }

  return score;
}

export function retrieveDocs(query: string, topK = 3): KBDoc[] {
  if (!query.trim()) return [];

  const scored = kbDocs
    .map((doc) => ({ doc, score: scoreDoc(doc, query) }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, topK)
    .map(({ doc }) => doc);

  return scored;
}
