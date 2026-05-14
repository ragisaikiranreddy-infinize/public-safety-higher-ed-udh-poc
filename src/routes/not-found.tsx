import { Link } from 'react-router-dom';
import { PageHeader } from '@/components/layout/page-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Compass } from 'lucide-react';

export default function NotFoundPage() {
  return (
    <>
      <PageHeader title="Route not built yet" eyebrow="404" />
      <div className="px-8 py-6">
        <Card>
          <CardContent className="flex items-start gap-4 p-6">
            <Compass className="mt-1 h-6 w-6 text-[var(--muted-foreground)]" />
            <div>
              <p className="text-sm">
                This route is on the implementation roadmap but hasn't been wired yet.
                R0 ships the foundation: the Command Center, role switcher, sidebar,
                theme tokens, type catalog, and seed mocks.
              </p>
              <p className="mt-2 text-xs text-[var(--muted-foreground)]">
                R1 lands the Data routes (catalog / pipelines / sources / quality / metrics).
                R3 lands People + Incidents. R4 lands the campus map. R5/R6/R7 land the three
                demo threads end-to-end.
              </p>
              <div className="mt-4">
                <Button asChild variant="accent">
                  <Link to="/">Back to Command Center</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
