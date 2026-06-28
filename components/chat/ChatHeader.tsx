"use client";

import Link from "next/link";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  ChevronDown,
  GraduationCap,
  LogOut,
  SquarePen,
} from "lucide-react";

type ChatHeaderProps = {
  session: {
    studentName: string;
    studentEmail: string;
  } | null;
  onStartNewChat: () => void;
  onEndSession: () => void;
};

function getInitials(name: string) {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function ChatHeader({
  session,
  onStartNewChat,
  onEndSession,
}: ChatHeaderProps) {
  return (
    <header className="sticky top-0 z-40 shrink-0 border-b border-border bg-card/80 backdrop-blur-xl supports-[backdrop-filter]:bg-card/70">
      <div className="mx-auto flex max-w-3xl flex-col gap-3 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-sm"
            aria-hidden
          >
            <GraduationCap className="size-4" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm font-semibold tracking-tight sm:text-base">
              Welfare Assistant
            </h1>
            <p className="text-xs text-muted-foreground sm:text-sm">
              {session
                ? "Your conversation is private and confidential"
                : "Confidential university support"}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-9 max-w-[220px] gap-2 !rounded-sm border border-border/80 bg-card px-2 shadow-xs transition-colors hover:bg-muted/40 data-open:bg-muted/50 data-popup-open:bg-muted/50"
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center !rounded-sm bg-primary/10 text-[0.65rem] font-semibold text-primary" aria-hidden>
                      {getInitials(session.studentName)}
                    </span>
                    <span className="truncate">{session.studentName}</span>
                    <ChevronDown className="size-3.5 shrink-0 text-muted-foreground" />
                  </Button>
                }
              />
              <DropdownMenuContent
                align="end"
                sideOffset={8}
                className="!w-60 !min-w-60 !rounded-md border border-border/80 bg-popover p-1.5 shadow-lg ring-1 ring-foreground/[0.04]"
              >
                <DropdownMenuGroup>
                  <DropdownMenuLabel className="px-2.5 py-2 font-normal">
                    <p className="truncate text-sm font-medium text-foreground">
                      {session.studentName}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {session.studentEmail}
                    </p>
                  </DropdownMenuLabel>
                </DropdownMenuGroup>
                <DropdownMenuSeparator className="mx-1" />
                <DropdownMenuGroup className="p-0.5">
                  <DropdownMenuItem
                    className="rounded-sm px-2.5 py-2"
                    onClick={onStartNewChat}
                  >
                    <SquarePen />
                    Start new chat
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="rounded-sm px-2.5 py-2"
                    variant="destructive"
                    onClick={onEndSession}
                  >
                    <LogOut />
                    End session
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : null}

          <Link
            href="/dashboard/login"
            className={buttonVariants({
              variant: "ghost",
              size: "sm",
              className: "h-9 px-3 text-muted-foreground hover:text-foreground",
            })}
          >
            Staff login
          </Link>
        </div>
      </div>
    </header>
  );
}
