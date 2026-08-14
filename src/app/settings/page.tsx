'use client';
import { useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Trash2, Search, AlertTriangle } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const MODEL_OPTIONS = [
  { label: 'Products', value: 'products', titleField: 'title', endpoint: '/products' },
  { label: 'Categories', value: 'categories', titleField: 'title', endpoint: '/categories' },
  { label: 'Blogs', value: 'blogs', titleField: 'title', endpoint: '/blogs' },
  { label: 'Brands', value: 'brands', titleField: 'title', endpoint: '/brands' },
  { label: 'Banners', value: 'banners', titleField: 'title', endpoint: '/banners' },
  { label: 'Testimonials', value: 'testimonials', titleField: 'name', endpoint: '/testimonials' },
  { label: 'Contact Messages', value: 'contacts', titleField: 'name', endpoint: '/admin/contacts' },
  { label: 'Subscribers', value: 'subscribers', titleField: 'email', endpoint: '/admin/subscribers' },
];

export default function SettingsPage() {
  const [selectedModel, setSelectedModel] = useState(MODEL_OPTIONS[0]);
  const [keyword, setKeyword] = useState('');
  const [afterDate, setAfterDate] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [deleteLog, setDeleteLog] = useState<string[]>([]);

  const handleSearch = async () => {
    setIsSearching(true);
    setHasSearched(true);
    setResults([]);
    try {
      const res = await api.get(selectedModel.endpoint);
      const key = selectedModel.value;
      let data = res.data[key] || res.data.contacts || res.data.subscribers || [];

      if (keyword.trim()) {
        const kw = keyword.trim().toLowerCase();
        data = data.filter((item: any) => {
          const titleVal = (item[selectedModel.titleField] || '').toLowerCase();
          return titleVal.includes(kw) ||
            JSON.stringify(item).toLowerCase().includes(kw);
        });
      }

      if (afterDate) {
        const afterTs = new Date(afterDate).getTime();
        data = data.filter((item: any) => {
          const ts = new Date(item.created_at || item.date || 0).getTime();
          return ts >= afterTs;
        });
      }

      setResults(data);
    } catch (e) {
      console.error(e);
      alert('Search failed. Check if the backend is running.');
    } finally { setIsSearching(false); }
  };

  const handleDelete = async (item: any) => {
    const title = item[selectedModel.titleField] || item.id;
    if (!confirm(`Delete "${title}"?`)) return;
    try {
      const adminEndpoint = selectedModel.endpoint.startsWith('/admin')
        ? selectedModel.endpoint
        : `/admin/${selectedModel.value}`;
      await api.delete(`${adminEndpoint}/${item.id}`);
      setResults(prev => prev.filter(r => r.id !== item.id));
      setDeleteLog(prev => [`✅ Deleted: "${title}" (ID: ${item.id})`, ...prev]);
    } catch (e) {
      alert('Delete failed');
    }
  };

  const handleDeleteAll = async () => {
    if (!confirm(`⚠️ Delete ALL ${results.length} results? This cannot be undone!`)) return;
    const adminEndpoint = selectedModel.endpoint.startsWith('/admin')
      ? selectedModel.endpoint
      : `/admin/${selectedModel.value}`;
    let deleted = 0;
    for (const item of results) {
      try {
        await api.delete(`${adminEndpoint}/${item.id}`);
        deleted++;
        setDeleteLog(prev => [`✅ Deleted ID: ${item.id}`, ...prev]);
      } catch {
        setDeleteLog(prev => [`❌ Failed: ID ${item.id}`, ...prev]);
      }
    }
    setResults([]);
    alert(`Done. Deleted ${deleted} records.`);
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings & Data Cleanup</h1>
          <p className="text-muted-foreground mt-1">Search across any model by keyword or date, then delete test/unwanted records.</p>
        </div>

        {/* Search Panel */}
        <Card className="border-zinc-200/60 shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Search className="h-5 w-5" /> Data Search</CardTitle>
            <CardDescription>Filter any model by keyword and/or creation date, then delete results.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="grid gap-2">
                <Label>Model</Label>
                <select
                  value={selectedModel.value}
                  onChange={e => setSelectedModel(MODEL_OPTIONS.find(m => m.value === e.target.value)!)}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                >
                  {MODEL_OPTIONS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
                </select>
              </div>
              <div className="grid gap-2">
                <Label>Keyword</Label>
                <Input placeholder="e.g. test, demo, delete" value={keyword} onChange={e => setKeyword(e.target.value)} />
              </div>
              <div className="grid gap-2">
                <Label>Created After</Label>
                <Input type="date" value={afterDate} onChange={e => setAfterDate(e.target.value)} />
              </div>
              <div className="grid gap-2 justify-end">
                <Label>&nbsp;</Label>
                <Button onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? 'Searching...' : <><Search className="h-4 w-4 mr-2" /> Search</>}
                </Button>
              </div>
            </div>

            {results.length > 0 && (
              <>
                <div className="flex items-center justify-between mb-3 p-3 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200">
                  <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400">
                    <AlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">Found {results.length} record(s) — review before deleting</span>
                  </div>
                  <Button variant="destructive" size="sm" onClick={handleDeleteAll}>
                    <Trash2 className="h-4 w-4 mr-2" /> Delete All {results.length}
                  </Button>
                </div>
                <div className="rounded-md border overflow-hidden">
                  <Table>
                    <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
                      <TableRow>
                        <TableHead>ID</TableHead>
                        <TableHead>Title / Name</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead className="text-right">Action</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.map(item => (
                        <TableRow key={item.id}>
                          <TableCell className="text-muted-foreground text-sm">{item.id}</TableCell>
                          <TableCell className="font-medium">{item[selectedModel.titleField] || '-'}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {item.created_at ? new Date(item.created_at).toLocaleString() : '-'}
                          </TableCell>
                          <TableCell className="text-right">
                            <Button variant="outline" size="sm" className="text-red-600 border-red-200 hover:bg-red-50" onClick={() => handleDelete(item)}>
                              <Trash2 className="h-3 w-3 mr-1" /> Delete
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </>
            )}

            {results.length === 0 && !isSearching && !hasSearched && (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>Enter a keyword or date and click Search to find records</p>
              </div>
            )}
            {results.length === 0 && !isSearching && hasSearched && (
              <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg">
                <Search className="h-10 w-10 mx-auto mb-3 opacity-30" />
                <p>No records found matching your criteria.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Delete Log */}
        {deleteLog.length > 0 && (
          <Card className="border-zinc-200/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm">Delete Log</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="font-mono text-xs space-y-1 max-h-48 overflow-y-auto">
                {deleteLog.map((log, i) => (
                  <div key={i} className={log.startsWith('✅') ? 'text-green-600' : 'text-red-500'}>{log}</div>
                ))}
              </div>
              <Button variant="ghost" size="sm" className="mt-2 text-xs" onClick={() => setDeleteLog([])}>Clear Log</Button>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
