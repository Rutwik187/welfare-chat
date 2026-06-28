import type { Category } from "./articles";
import { KB_ARTICLES, type KBArticle } from "./articles";
import { resolveCitationUrl } from "./urls";

const SCORE_THRESHOLD = 2;
const MIN_CONTENT_SCORE = 2;

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2);
}

function scoreArticle(
  article: KBArticle,
  message: string,
  category: Category
): { score: number; contentScore: number } {
  const tokens = tokenize(message);
  let score = 0;
  let contentScore = 0;

  if (article.category === category) {
    score += 3;
  }

  for (const tag of article.tags) {
    const tagLower = tag.toLowerCase();
    if (message.toLowerCase().includes(tagLower)) {
      score += 4;
      contentScore += 4;
    }
    for (const token of tokens) {
      if (tagLower.includes(token) || token.includes(tagLower)) {
        score += 1;
        contentScore += 1;
      }
    }
  }

  for (const token of tokens) {
    if (article.summary.toLowerCase().includes(token)) {
      score += 0.5;
      contentScore += 0.5;
    }
  }

  return { score, contentScore };
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
  const scored = KB_ARTICLES.map((article) => {
    const { score, contentScore } = scoreArticle(article, message, category);
    return { article, score, contentScore };
  })
    .filter(({ score }) => score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);

  const top = scored[0];
  const articles = scored.map(({ article }) => article);
  const kbLinks = articles.map((a) => ({
    title: a.title,
    url: resolveCitationUrl(a.link),
  }));

  return {
    articles,
    kbLinks,
    canAnswer:
      Boolean(top) &&
      top.score >= SCORE_THRESHOLD &&
      top.contentScore >= MIN_CONTENT_SCORE &&
      articles.length > 0,
  };
}

export function formatKBContext(articles: KBArticle[]): string {
  return articles
    .map(
      (a) =>
        `### ${a.title}\nLink: ${resolveCitationUrl(a.link)}\n${a.summary}${a.escalationNotes ? `\nNote: ${a.escalationNotes}` : ""}`
    )
    .join("\n\n");
}
