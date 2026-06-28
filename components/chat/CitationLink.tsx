import { cn } from "@/lib/utils";
import { getCitationLinkProps } from "@/lib/knowledge-base/urls";
import { BookIcon } from "lucide-react";
import type { ComponentProps } from "react";

type CitationLinkProps = Omit<ComponentProps<"a">, "href"> & {
  href: string;
  title: string;
};

export function CitationLink({
  href,
  title,
  className,
  children,
  ...props
}: CitationLinkProps) {
  const linkProps = getCitationLinkProps(href);

  return (
    <a
      className={cn("flex items-center gap-2", className)}
      href={linkProps.href}
      rel={linkProps.rel}
      target={linkProps.target}
      {...props}
    >
      {children ?? (
        <>
          <BookIcon className="h-4 w-4" />
          <span className="block font-medium">{title}</span>
        </>
      )}
    </a>
  );
}
