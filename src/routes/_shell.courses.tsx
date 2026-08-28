import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { BookOpen, FileText, PlayCircle, HelpCircle } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { EmptyState } from "@/components/common/EmptyState";
import { LoadingGrid } from "@/components/common/Loading";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { coursesService } from "@/services/misc";
import { useOrg } from "@/lib/org";

export const Route = createFileRoute("/_shell/courses")({
  head: () => ({
    meta: [
      { title: "Cours et modules — DriveHub" },
      {
        name: "description",
        content:
          "Bibliothèque pédagogique : modules de code de la route, vidéos, fiches et quiz avec suivi de progression.",
      },
      { property: "og:title", content: "Cours et modules — DriveHub" },
      {
        property: "og:description",
        content: "Modules théoriques, chapitres et leçons de votre auto-école.",
      },
    ],
  }),
  component: CoursesPage,
});

const ICONS = { video: PlayCircle, doc: FileText, quiz: HelpCircle } as const;

function CoursesPage() {
  const { orgId } = useOrg();
  const { data, isLoading } = useQuery({
    queryKey: ["courses", orgId],
    queryFn: () => coursesService.list(orgId),
  });

  return (
    <div>
      <PageHeader title="Cours" description="Modules théoriques et supports pédagogiques." />
      {isLoading ? (
        <LoadingGrid />
      ) : !data || data.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="Aucun cours"
          description="Publiez un premier module pour vos élèves."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-2">
          {data.map((course) => (
            <Card key={course.id}>
              <CardHeader>
                <div className="flex items-start justify-between gap-3">
                  <CardTitle className="text-base">{course.title}</CardTitle>
                  <Badge variant="secondary">{course.category}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{course.description}</p>
                <div className="pt-2">
                  <div className="mb-1 flex justify-between text-xs">
                    <span>Progression</span>
                    <span>{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible>
                  {course.chapters.map((chapter) => (
                    <AccordionItem key={chapter.id} value={chapter.id}>
                      <AccordionTrigger className="text-sm">{chapter.title}</AccordionTrigger>
                      <AccordionContent>
                        <ul className="space-y-2">
                          {chapter.lessons.map((lesson) => {
                            const Icon = ICONS[lesson.type];
                            return (
                              <li
                                key={lesson.id}
                                className="flex items-center justify-between gap-3 text-sm"
                              >
                                <span className="flex items-center gap-2">
                                  <Icon className="size-4 text-primary" />
                                  {lesson.title}
                                </span>
                                <span className="text-xs text-muted-foreground">
                                  {lesson.durationMin} min
                                </span>
                              </li>
                            );
                          })}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
