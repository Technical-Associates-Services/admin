'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader } from '@/components/ui/loader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { PageForm } from '@/components/forms/PageForm';

export default function PagesPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/pages');
      setItems(res.data.pages || []);
    } catch (error) { console.error('Failed to fetch', error); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this page?')) {
      try {
        await api.delete(`/admin/pages/${id}`);
        fetchItems();
      } catch (error) { alert('Failed to delete'); }
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Static Pages</h1>
            <p className="text-muted-foreground">Manage your custom website pages (Privacy Policy, Terms & Conditions).</p>
          </div>
          {/* Add Page button removed as per user request to only allow editing existing pages */}
        </div>

        <Card className="flex-1 border-zinc-200/60 dark:border-zinc-800/60 shadow-sm overflow-hidden flex flex-col">
          <CardHeader className="py-4 px-6 border-b border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/20">
            <CardTitle className="text-lg">All Pages</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-auto">
            {isLoading ? (
              <Loader />
            ) : items.length === 0 ? (
              <div className="flex h-full items-center justify-center text-muted-foreground py-12">No pages found.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Image</TableHead>
                    <TableHead>Page Title</TableHead>
                    <TableHead className="hidden md:table-cell">Slug</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="w-20">
                        <div className="w-12 h-12 rounded overflow-hidden">
                          {item.image ? (
                            <img 
                                src={item.image ? (item.image.startsWith('http') ? item.image : `${process.env.NEXT_PUBLIC_API_URL}/frontend/images/pages/${item.image}`) : '/logo.png'} 
                                alt={item.title} 
                                className="object-cover w-full h-full" 
                                onError={(e) => {
                                  if (!e.currentTarget.dataset.retried && item.image && !item.image.startsWith('http')) {
                                    e.currentTarget.dataset.retried = "true";
                                    e.currentTarget.src = `https://ivgvdteklcqtzfusbsfh.supabase.co/storage/v1/object/public/tas_media/pages/${item.image}`;
                                  } else {
                                    e.currentTarget.src = '/logo.png';
                                  }
                                }} 
                              />
                          ) : <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded flex items-center justify-center text-xs text-muted-foreground">N/A</div>}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium">{item.title}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground">/{item.slug}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => { setSelected(item); setIsFormOpen(true); }}><Edit className="h-4 w-4" /></Button>
                        {/* Delete button removed */}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <PageForm 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        item={selected} 
        onSuccess={fetchItems} 
      />
    </DashboardLayout>
  );
}
