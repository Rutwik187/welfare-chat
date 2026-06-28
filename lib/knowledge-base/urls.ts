export function getPublicBaseUrl(): string {
  const url = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
  return url.replace(/\/$/, "");
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
    if (typeof window !== "undefined") {
      return `${window.location.origin}${link}`;
    }

    return `${getPublicBaseUrl()}${link}`;
  }

  return link;
}

export function getCitationLinkProps(url: string): {
  href: string;
  target: "_blank";
  rel: "noreferrer";
} {
  return {
    href: resolveCitationUrl(url),
    target: "_blank",
    rel: "noreferrer",
  };
}
