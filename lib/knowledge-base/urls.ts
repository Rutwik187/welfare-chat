export function getPublicBaseUrl(): string {
  const url = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
  return url.replace(/\/$/, "");
}

export function getResourceSlug(link: string): string | null {
  const path = link.startsWith("http")
    ? (() => {
        try {
          return new URL(link).pathname;
        } catch {
          return null;
        }
      })()
    : link;

  if (!path?.startsWith("/resources/")) {
    return null;
  }

  const slug = path.slice("/resources/".length).replace(/\/$/, "");
  return slug || null;
}

export function isAppResourceUrl(url: string): boolean {
  return getResourceSlug(url) !== null;
}

export function resolveCitationUrl(link: string): string {
  if (
    link.startsWith("http://") ||
    link.startsWith("https://") ||
    link.startsWith("tel:")
  ) {
    return link;
  }

  if (link.startsWith("/")) {
    return `${getPublicBaseUrl()}${link}`;
  }

  return link;
}

export function getCitationLinkProps(url: string): {
  href: string;
  target?: "_blank";
  rel?: "noreferrer";
} {
  const slug = getResourceSlug(url);

  if (slug) {
    return { href: `/resources/${slug}` };
  }

  return { href: url, target: "_blank", rel: "noreferrer" };
}
