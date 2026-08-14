'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader } from '@/components/ui/loader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { TestimonialForm } from '@/components/forms/TestimonialForm';

export default function TestimonialsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/testimonials');
      // API maps full_name → name already via globalController
      setItems(res.data.testimonials || []);
    } catch (error) { console.error('Failed to fetch testimonials', error); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete(`/admin/testimonials/${id}`);
      fetchItems();
    } catch { alert('Delete failed'); }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Testimonials</h1>
            <p className="text-muted-foreground mt-1">Manage testimonials.</p>
          </div>
          <Button onClick={() => { setSelected(null); setIsFormOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Add Testimonial
          </Button>
        </div>
        <Card className="border-zinc-200/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle>All Testimonials</CardTitle>
            <CardDescription>Total: {items.length}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <Loader /> : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
                    <TableRow>
                      
                      <TableHead>Name</TableHead>
                      <TableHead>Designation</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableRow><TableCell colSpan={4} className="text-center py-10 text-muted-foreground">No testimonials found.</TableCell></TableRow>
                    ) : items.map((item) => (
                      <TableRow key={item.id || item.slug}>
                        
                        <TableCell className="font-medium">{item.name || '-'}</TableCell>
                          <TableCell className="text-muted-foreground">{item.designation || '-'}</TableCell>
                          <TableCell className="text-muted-foreground">{item.company || '-'}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => { setSelected(item); setIsFormOpen(true); }}>
                            <Edit className="h-4 w-4 text-blue-600" />
                          </Button>
                          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleDelete(item.id)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      {isFormOpen && (
        <TestimonialForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          testimonial={selected}
          onSuccess={fetchItems}
        />
      )}
    </DashboardLayout>
  );
}
