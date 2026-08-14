'use client';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Construction } from 'lucide-react';

export default function Page() {
  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Enquiries</h1>
          <p className="text-muted-foreground mt-1">View product enquiries from customers.</p>
        </div>
        <Card className="border-zinc-200/60 shadow-sm">
          <CardHeader><CardTitle>Enquiries</CardTitle><CardDescription>View product enquiries from customers.</CardDescription></CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed rounded-lg">
              <Construction className="h-12 w-12 text-muted-foreground/40 mb-4" />
              <h3 className="text-lg font-medium">Coming Soon</h3>
              <p className="text-sm text-muted-foreground mt-1 max-w-sm">Full CRUD management for enquiries will be available here.</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
