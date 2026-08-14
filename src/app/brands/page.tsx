'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader } from '@/components/ui/loader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BrandForm } from '@/components/forms/BrandForm';

export default function BrandsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/brands');
      setItems(res.data.brands || []);
    } catch (error) { console.error('Failed to fetch brands', error); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete(`/admin/brands/${id}`);
      fetchItems();
    } catch { alert('Delete failed'); }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Brands</h1>
            <p className="text-muted-foreground mt-1">Manage brands.</p>
          </div>
          <Button onClick={() => { setSelected(null); setIsFormOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Add Brand
          </Button>
        </div>
        <Card className="border-zinc-200/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle>All Brands</CardTitle>
            <CardDescription>Total: {items.length}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <Loader /> : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
                    <TableRow>
                      <TableHead className="w-[80px]">Logo</TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableRow><TableCell colSpan={3} className="text-center py-10 text-muted-foreground">No brands found.</TableCell></TableRow>
                    ) : items.map((item) => (
                      <TableRow key={item.id || item.slug}>
                        
                          <TableCell>
                            <div className="w-10 h-10 rounded-md overflow-hidden bg-zinc-100 flex items-center justify-center border">
                              <img 
                                src={item.image ? (item.image.startsWith('http') ? item.image : `${process.env.NEXT_PUBLIC_API_URL}/frontend/images/brands/${item.image}`) : '/logo.png'} 
                                alt={item.title} 
                                className="object-cover w-full h-full" 
                                onError={(e) => {
                                  if (!e.currentTarget.dataset.retried && item.image && !item.image.startsWith('http')) {
                                    e.currentTarget.dataset.retried = "true";
                                    e.currentTarget.src = `https://ivgvdteklcqtzfusbsfh.supabase.co/storage/v1/object/public/tas_media/brands/${item.image}`;
                                  } else {
                                    e.currentTarget.src = '/logo.png';
                                  }
                                }} 
                              />
                            </div>
                          </TableCell>
                        <TableCell className="font-medium">{item.title || '-'}</TableCell>
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
        <BrandForm
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          brand={selected}
          onSuccess={fetchItems}
        />
      )}
    </DashboardLayout>
  );
}
