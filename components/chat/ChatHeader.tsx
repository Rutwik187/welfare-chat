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
    <header className="glass-header shrink-0">
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

        <div className="header-actions">
          {session ? (
            <DropdownMenu>
              <DropdownMenuTrigger
                render={
                  <Button
                    variant="outline"
                    size="sm"
                    className="header-account-trigger"
                  >
                    <span className="header-account-avatar" aria-hidden>
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
                className="account-menu-content"
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
