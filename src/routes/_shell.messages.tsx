import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { MessageSquare, Send } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingGrid } from "@/components/common/Loading";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { messagingService } from "@/services/misc";
import { db } from "@/mocks/db";
import { useOrg } from "@/lib/org";
import { dateTime, initials } from "@/lib/format";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/_shell/messages")({
  head: () => ({
    meta: [
      { title: "Messagerie — DriveHub" },
      {
        name: "description",
        content:
          "Échangez avec les élèves, les moniteurs et l'équipe administrative de l'auto-école depuis une messagerie centralisée.",
      },
      { property: "og:title", content: "Messagerie — DriveHub" },
      {
        property: "og:description",
        content: "Conversations directes, de groupe et annonces de l'auto-école.",
      },
    ],
  }),
  component: MessagesPage,
});

const KIND_LABELS: Record<string, string> = {
  direct: "Direct",
  group: "Groupe",
  announcement: "Annonce",
};

function MessagesPage() {
  const { orgId, session } = useOrg();
  const qc = useQueryClient();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [body, setBody] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["conversations", orgId],
    queryFn: () => messagingService.list(orgId),
  });
  const conversations = data ?? [];
  const active = conversations.find((c) => c.id === activeId) ?? conversations[0] ?? null;

  const userMap = useMemo(() => {
    const map = new Map<string, string>();
    db().users.forEach((u) => map.set(u.id, `${u.firstName} ${u.lastName}`));
    return map;
  }, []);

  const send = useMutation({
    mutationFn: () => messagingService.send(orgId, active!.id, session.user.id, body.trim()),
    onSuccess: () => {
      setBody("");
      void qc.invalidateQueries({ queryKey: ["conversations", orgId] });
    },
  });

  if (isLoading)
    return (
      <div>
        <PageHeader title="Messagerie" description="Vos échanges avec l'équipe et les élèves." />
        <LoadingGrid />
      </div>
    );

  return (
    <div>
      <PageHeader title="Messagerie" description="Vos échanges avec l'équipe et les élèves." />
      {conversations.length === 0 ? (
        <EmptyState
          icon={MessageSquare}
          title="Aucune conversation"
          description="Les échanges apparaîtront ici."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[320px_1fr]">
          <Card className="overflow-hidden">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Conversations</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[520px]">
                <ul>
                  {conversations.map((c) => (
                    <li key={c.id}>
                      <button
                        type="button"
                        onClick={() => setActiveId(c.id)}
                        className={cn(
                          "w-full border-b border-border/60 px-4 py-3 text-left transition hover:bg-muted/60",
                          active?.id === c.id && "bg-muted",
                        )}
                      >
                        <div className="flex items-center justify-between gap-2">
                          <span className="truncate font-medium text-foreground">{c.subject}</span>
                          <Badge variant="outline" className="shrink-0">
                            {KIND_LABELS[c.kind] ?? c.kind}
                          </Badge>
                        </div>
                        <p className="mt-1 truncate text-xs text-muted-foreground">
                          {c.messages[c.messages.length - 1]?.body ?? "Aucun message"}
                        </p>
                      </button>
                    </li>
                  ))}
                </ul>
              </ScrollArea>
            </CardContent>
          </Card>

          <Card className="flex flex-col">
            <CardHeader className="border-b border-border/60 pb-3">
              <CardTitle className="text-base">{active?.subject}</CardTitle>
              <p className="text-xs text-muted-foreground">
                {active?.participantIds.length ?? 0} participant(s)
              </p>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col gap-4 p-4">
              <ScrollArea className="h-[380px] pr-3">
                <div className="space-y-4">
                  {active?.messages.map((m) => {
                    const mine = m.authorId === session.user.id;
                    const name = userMap.get(m.authorId) ?? "Utilisateur";
                    return (
                      <div key={m.id} className={cn("flex gap-3", mine && "flex-row-reverse")}>
                        <Avatar className="size-8 shrink-0">
                          <AvatarFallback className="text-xs">
                            {initials(name.split(" ")[0] ?? "U", name.split(" ")[1] ?? "")}
                          </AvatarFallback>
                        </Avatar>
                        <div
                          className={cn(
                            "max-w-[75%] rounded-xl px-3 py-2",
                            mine
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground",
                          )}
                        >
                          <p className="text-xs font-medium opacity-80">{name}</p>
                          <p className="mt-1 whitespace-pre-wrap text-sm">{m.body}</p>
                          <p className="mt-1 text-[11px] opacity-70">{dateTime(m.at)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
              <div className="flex items-end gap-2 border-t border-border/60 pt-3">
                <Textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Écrire un message…"
                  className="min-h-[64px]"
                />
                <Button
                  onClick={() => send.mutate()}
                  disabled={!active || !body.trim() || send.isPending}
                >
                  <Send className="mr-2 size-4" />
                  Envoyer
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
