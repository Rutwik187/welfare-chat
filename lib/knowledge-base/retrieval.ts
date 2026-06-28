import type { Category } from "./articles";
import { KB_ARTICLES, type KBArticle } from "./articles";

const SCORE_THRESHOLD = 2;

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2);
}

function scoreArticle(article: KBArticle, message: string, category: Category): number {
  const tokens = tokenize(message);
  let score = 0;

  if (article.category === category) {
    score += 3;
  }

  for (const tag of article.tags) {
    const tagLower = tag.toLowerCase();
    if (message.toLowerCase().includes(tagLower)) {
      score += 4;
    }
    for (const token of tokens) {
      if (tagLower.includes(token) || token.includes(tagLower)) {
        score += 1;
      }
    }
  }

  for (const token of tokens) {
    if (article.summary.toLowerCase().includes(token)) {
      score += 0.5;
    }
  }

  return score;
}

export type RetrievalResult = {
  articles: KBArticle[];
  kbLinks: { title: string; url: string }[];
  canAnswer: boolean;
};

export function retrieveArticles(
  message: string,
  category: Category,
  limit = 3
): RetrievalResult {
  const scored = KB_ARTICLES.map((article) => ({
    article,
    score: scoreArticle(article, message, category),
  }))
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  const topScore = scored[0]?.score ?? 0;
  const articles = scored.map(({ article }) => article);
  const kbLinks = articles.map((a) => ({ title: a.title, url: a.link }));

  return {
    articles,
    kbLinks,
    canAnswer: topScore >= SCORE_THRESHOLD && articles.length > 0,
  };
}

export function formatKBContext(articles: KBArticle[]): string {
  return articles
    .map(
      (a) =>
        `### ${a.title}\nLink: ${a.link}\n${a.summary}${a.escalationNotes ? `\nNote: ${a.escalationNotes}` : ""}`
    )
    .join("\n\n");
}
