'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Trash2, CheckCircle, XCircle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader } from '@/components/ui/loader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function ReviewsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/admin/reviews');
      setItems(res.data.reviews || []);
    } catch (error) { console.error('Failed to fetch', error); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleUpdateStatus = async (id: number, status: number) => {
    try {
      await api.put(`/admin/reviews/${id}/status`, { status });
      fetchItems();
    } catch (error) { alert('Failed to update status'); }
  };

  const handleDelete = async (id: number) => {
    if (confirm('Are you sure you want to delete this review?')) {
      try {
        await api.delete(`/admin/reviews/${id}`);
        fetchItems();
      } catch (error) { alert('Failed to delete'); }
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col h-full space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Product Reviews</h1>
            <p className="text-muted-foreground">Manage and moderate customer reviews.</p>
          </div>
        </div>

        <Card className="flex-1 border-zinc-200/60 dark:border-zinc-800/60 shadow-sm overflow-hidden flex flex-col">
          <CardHeader className="py-4 px-6 border-b border-zinc-100 dark:border-zinc-800/60 bg-zinc-50/50 dark:bg-zinc-900/20">
            <CardTitle className="text-lg">All Reviews</CardTitle>
          </CardHeader>
          <CardContent className="p-0 flex-1 overflow-auto">
            {isLoading ? (
              <Loader />
            ) : items.length === 0 ? (
              <div className="flex h-full items-center justify-center text-muted-foreground py-12">No reviews found.</div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Reviewer</TableHead>
                    <TableHead>Product</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead className="hidden md:table-cell">Comment</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <div className="font-medium">{item.name}</div>
                        <div className="text-xs text-muted-foreground">{item.email}</div>
                      </TableCell>
                      <TableCell className="font-medium text-blue-500">{item.product?.title || 'Unknown'}</TableCell>
                      <TableCell>
                         <div className="flex text-yellow-500">
                           {Array(item.star).fill(0).map((_, i) => <span key={i}>★</span>)}
                         </div>
                      </TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground max-w-[300px] truncate">{item.message}</TableCell>
                      <TableCell>
                        {item.status === 1 ? (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Approved</span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        {item.status === 0 ? (
                           <Button variant="ghost" size="icon" className="text-green-500 hover:text-green-600" onClick={() => handleUpdateStatus(item.id, 1)} title="Approve"><CheckCircle className="h-4 w-4" /></Button>
                        ) : (
                           <Button variant="ghost" size="icon" className="text-yellow-500 hover:text-yellow-600" onClick={() => handleUpdateStatus(item.id, 0)} title="Unapprove"><XCircle className="h-4 w-4" /></Button>
                        )}
                        <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-600" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
