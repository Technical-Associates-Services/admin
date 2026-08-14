'use client';
import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader } from '@/components/ui/loader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function ContactsPage() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selected, setSelected] = useState<any>(null);

  const fetch = async () => {
    setIsLoading(true);
    try { const r = await api.get('/admin/contacts'); setItems(r.data.contacts || []); }
    catch(e) { console.error(e); } finally { setIsLoading(false); }
  };

  useEffect(() => { fetch(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this message?')) return;
    try { await api.delete('/admin/contacts/' + id); fetch(); }
    catch { alert('Delete failed'); }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Contact Messages</h1>
          <p className="text-muted-foreground mt-1">Inbox from the website contact form.</p>
        </div>
        {selected && (
          <Card className="border-blue-200 bg-blue-50 dark:bg-blue-950/30">
            <CardContent className="pt-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <p className="font-bold text-lg">{selected.name} <span className="font-normal text-muted-foreground text-sm">({selected.email})</span></p>
                  {selected.phone && <p className="text-sm text-muted-foreground">📞 {selected.phone}</p>}
                  {selected.subject && <p className="text-sm font-medium">Subject: {selected.subject}</p>}
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{selected.message}</p>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setSelected(null)}>✕ Close</Button>
              </div>
            </CardContent>
          </Card>
        )}
        <Card className="border-zinc-200/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle>All Messages</CardTitle>
            <CardDescription>Total: {items.length}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <Loader /> : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Subject</TableHead>
                      <TableHead>Preview</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableRow><TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No messages yet.</TableCell></TableRow>
                    ) : items.map((item) => (
                      <TableRow key={item.id} className="cursor-pointer hover:bg-zinc-50" onClick={() => setSelected(item)}>
                        <TableCell className="font-medium">{item.name}</TableCell>
                        <TableCell className="text-muted-foreground">{item.email}</TableCell>
                        <TableCell>{item.subject || '-'}</TableCell>
                        <TableCell className="max-w-[200px] truncate text-muted-foreground text-sm">{item.message}</TableCell>
                        <TableCell className="text-right" onClick={e => e.stopPropagation()}>
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
    </DashboardLayout>
  );
}
