// Helper to generate a full CRUD page for a given model
// Usage: node scripts/gen_page.js
const fs = require('fs');
const path = require('path');

const pages = [
  {
    name: 'Testimonials',
    slug: 'testimonials',
    apiGet: '/testimonials',
    apiAdmin: '/admin/testimonials',
    formImport: "import { TestimonialForm } from '@/components/forms/TestimonialForm';",
    formComponent: 'TestimonialForm',
    formProp: 'testimonial',
    columns: [
      { head: 'Name', key: 'name', className: 'font-medium' },
      { head: 'Designation', key: 'designation', isMuted: true },
      { head: 'Company', key: 'company', isMuted: true },
    ],
  },
  {
    name: 'Brands',
    slug: 'brands',
    apiGet: '/brands',
    apiAdmin: '/admin/brands',
    formImport: "import { BrandForm } from '@/components/forms/BrandForm';",
    formComponent: 'BrandForm',
    formProp: 'brand',
    hasImage: true,
    columns: [
      { head: 'Name', key: 'title', className: 'font-medium' },
    ],
  },
];

const baseDir = path.join(__dirname, '..', 'src', 'app');

for (const p of pages) {
  const dir = path.join(baseDir, p.slug);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const imageTH = p.hasImage ? `<TableHead className="w-[80px]">Logo</TableHead>` : '';
  const imageTD = p.hasImage ? `
                          <TableCell>
                            <div className="w-10 h-10 rounded-md overflow-hidden bg-zinc-100 flex items-center justify-center border">
                              <img src={item.image} alt={item.title} className="object-cover w-full h-full" onError={(e) => (e.currentTarget.src = '/logo.png')} />
                            </div>
                          </TableCell>` : '';

  const dataCols = p.columns.map(c => {
    const cls = c.className ? ` className="${c.className}"` : c.isMuted ? ` className="text-muted-foreground"` : '';
    return `<TableCell${cls}>{item.${c.key} || '-'}</TableCell>`;
  }).join('\n                          ');

  const colCount = p.columns.length + (p.hasImage ? 1 : 0) + 1; // +1 for actions

  const content = `'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Loader } from '@/components/ui/loader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
${p.formImport}

export default function ${p.name}Page() {
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selected, setSelected] = useState<any>(null);

  const fetchItems = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('${p.apiGet}');
      setItems(res.data.${p.slug} || []);
    } catch (error) { console.error('Failed to fetch ${p.slug}', error); }
    finally { setIsLoading(false); }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure?')) return;
    try {
      await api.delete(\`${p.apiAdmin}/\${id}\`);
      fetchItems();
    } catch { alert('Delete failed'); }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">${p.name}</h1>
            <p className="text-muted-foreground mt-1">Manage ${p.name.toLowerCase()}.</p>
          </div>
          <Button onClick={() => { setSelected(null); setIsFormOpen(true); }}>
            <Plus className="mr-2 h-4 w-4" /> Add ${p.name.slice(0, -1)}
          </Button>
        </div>
        <Card className="border-zinc-200/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle>All ${p.name}</CardTitle>
            <CardDescription>Total: {items.length}</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? <Loader /> : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
                    <TableRow>
                      ${imageTH}
                      ${p.columns.map(c => `<TableHead>${c.head}</TableHead>`).join('\n                      ')}
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {items.length === 0 ? (
                      <TableRow><TableCell colSpan={${colCount}} className="text-center py-10 text-muted-foreground">No ${p.name.toLowerCase()} found.</TableCell></TableRow>
                    ) : items.map((item) => (
                      <TableRow key={item.id || item.slug}>
                        ${imageTD}
                        ${dataCols}
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
        <${p.formComponent}
          isOpen={isFormOpen}
          onClose={() => setIsFormOpen(false)}
          ${p.formProp}={selected}
          onSuccess={fetchItems}
        />
      )}
    </DashboardLayout>
  );
}
`;

  fs.writeFileSync(path.join(dir, 'page.tsx'), content);
  console.log(`✅ Written: ${p.slug}/page.tsx`);
}
