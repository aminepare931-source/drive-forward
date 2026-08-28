import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { HelpCircle, Plus, Search } from "lucide-react";
import { toast } from "sonner";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingGrid } from "@/components/common/Loading";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { questionsService } from "@/services/questions";
import { QUESTION_CATEGORIES } from "@/mocks/db";
import { useOrg } from "@/lib/org";

export const Route = createFileRoute("/_shell/questions")({
  head: () => ({
    meta: [
      { title: "Banque de questions — DriveHub" },
      {
        name: "description",
        content:
          "Constituez votre banque de questions de code de la route par thème et par niveau de difficulté.",
      },
      { property: "og:title", content: "Banque de questions — DriveHub" },
      {
        property: "og:description",
        content: "Questions de code classées par catégorie et difficulté.",
      },
    ],
  }),
  component: QuestionsPage,
});

const DIFFICULTY: Record<string, string> = { easy: "Facile", medium: "Moyen", hard: "Difficile" };

function QuestionsPage() {
  const { orgId } = useOrg();
  const qc = useQueryClient();
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [difficulty, setDifficulty] = useState("all");
  const [open, setOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["questions", orgId, search, category, difficulty],
    queryFn: () => questionsService.list(orgId, { search, category, difficulty }),
  });

  const create = useMutation({
    mutationFn: (input: {
      text: string;
      category: string;
      difficulty: "easy" | "medium" | "hard";
      choices: string[];
      correctIndex: number;
      explanation: string;
    }) => questionsService.create(orgId, input),
    onSuccess: () => {
      toast.success("Question ajoutée");
      setOpen(false);
      qc.invalidateQueries({ queryKey: ["questions", orgId] });
    },
  });

  return (
    <div>
      <PageHeader
        title="Banque de questions"
        description="Réservoir pédagogique pour vos devoirs et examens."
        actions={
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-1 size-4" /> Nouvelle question
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter une question</DialogTitle>
              </DialogHeader>
              <form
                id="new-question"
                className="space-y-4"
                onSubmit={(e) => {
                  e.preventDefault();
                  const fd = new FormData(e.currentTarget);
                  create.mutate({
                    text: String(fd.get("text")),
                    category: String(fd.get("category")),
                    difficulty: String(fd.get("difficulty")) as "easy" | "medium" | "hard",
                    choices: [String(fd.get("c0")), String(fd.get("c1")), String(fd.get("c2"))],
                    correctIndex: Number(fd.get("correct")),
                    explanation: String(fd.get("explanation")),
                  });
                }}
              >
                <div className="space-y-2">
                  <Label htmlFor="q-text">Énoncé</Label>
                  <Textarea id="q-text" name="text" required />
                </div>
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <Label htmlFor="q-cat">Catégorie</Label>
                    <select
                      id="q-cat"
                      name="category"
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      {QUESTION_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="q-diff">Difficulté</Label>
                    <select
                      id="q-diff"
                      name="difficulty"
                      className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="easy">Facile</option>
                      <option value="medium">Moyen</option>
                      <option value="hard">Difficile</option>
                    </select>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c0">Réponse 1</Label>
                  <Input id="c0" name="c0" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c1">Réponse 2</Label>
                  <Input id="c1" name="c1" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="c2">Réponse 3</Label>
                  <Input id="c2" name="c2" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="correct">Bonne réponse</Label>
                  <select
                    id="correct"
                    name="correct"
                    className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                  >
                    <option value="0">Réponse 1</option>
                    <option value="1">Réponse 2</option>
                    <option value="2">Réponse 3</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="explanation">Explication</Label>
                  <Textarea id="explanation" name="explanation" required />
                </div>
              </form>
              <DialogFooter>
                <Button type="submit" form="new-question" disabled={create.isPending}>
                  Enregistrer
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        }
      />

      <Card className="mb-4">
        <CardContent className="flex flex-col gap-3 p-4 lg:flex-row">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Rechercher une question…"
              className="pl-9"
            />
          </div>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="lg:w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {QUESTION_CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={difficulty} onValueChange={setDifficulty}>
            <SelectTrigger className="lg:w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes difficultés</SelectItem>
              <SelectItem value="easy">Facile</SelectItem>
              <SelectItem value="medium">Moyen</SelectItem>
              <SelectItem value="hard">Difficile</SelectItem>
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {isLoading ? (
        <LoadingGrid />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={HelpCircle}
          title="Aucune question"
          description="Ajustez vos filtres ou créez une question."
        />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          {data.slice(0, 40).map((q) => (
            <Card key={q.id}>
              <CardContent className="p-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="secondary">{q.category}</Badge>
                  <Badge variant="outline">{DIFFICULTY[q.difficulty]}</Badge>
                  <span className="ml-auto text-xs text-muted-foreground">
                    {q.usageCount} usages
                  </span>
                </div>
                <p className="mt-3 text-sm font-medium text-foreground">{q.text}</p>
                <ul className="mt-3 space-y-1 text-sm">
                  {q.choices.map((choice, i) => (
                    <li
                      key={choice}
                      className={
                        i === q.correctIndex ? "font-medium text-success" : "text-muted-foreground"
                      }
                    >
                      • {choice}
                    </li>
                  ))}
                </ul>
                <p className="mt-3 text-xs text-muted-foreground">{q.explanation}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
