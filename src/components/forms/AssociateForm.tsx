import { useState, useEffect } from 'react';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export function AssociateForm({ isOpen, onClose, item, onSuccess  }: { isOpen: boolean; onClose: () => void; onSuccess: () => void; [key: string]: any }) {
  const [formData, setFormData] = useState({
    title: '', slug: '', category_id: '', image: '', links: '', order: '0', status: 1
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const isEditing = !!item;

  useEffect(() => {
    if (isOpen) {
      api.get('/admin/associate-categories')
        .then(res => setCategories(res.data.categories || []))
        .catch(console.error);

      if (item) {
        setFormData({
          title: item.title || '',
          slug: item.slug || '',
          category_id: item.category_id?.toString() || '',
          image: item.image || '',
          links: item.links || '',
          order: item.order?.toString() || '0',
          status: item.status !== undefined ? item.status : 1
        });
      } else {
        setFormData({ title: '', slug: '', category_id: '', image: '', links: '', order: '0', status: 1 });
      }
    }
  }, [isOpen, item]);

  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const data = new FormData();
    data.append('image', file);
    data.append('folder', 'associates');
    try {
      const res = await api.post('/admin/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setFormData(prev => ({ ...prev, image: res.data.fileName }));
    } catch { alert('Upload failed'); } finally { setUploading(false); }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditing) await api.put(`/admin/associates/${item.id}`, formData);
      else await api.post('/admin/associates', formData);
      onSuccess(); onClose();
    } catch (err: any) { alert('Failed to save associate: ' + err.message); } 
    finally { setIsSubmitting(false); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isEditing ? 'Edit Associate' : 'Add New Associate'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Title</Label>
              <Input name="title" value={formData.title} onChange={handleChange} required />
            </div>
            <div className="grid gap-2">
              <Label>Slug</Label>
              <Input name="slug" value={formData.slug} onChange={handleChange} placeholder="Auto-generated" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Category</Label>
            <select name="category_id" value={formData.category_id} onChange={handleChange}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
              <option value="">Default (General)</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>
          <div className="grid gap-2">
            <Label>Link (URL)</Label>
            <Input name="links" value={formData.links} onChange={handleChange} placeholder="https://..." />
          </div>
          <div className="grid gap-2">
            <Label>Image / Logo</Label>
            <Input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
            {formData.image && <div className="text-xs text-green-600 truncate">{formData.image.split('/').pop()}</div>}
          </div>
          <div className="grid gap-2">
            <Label>Sort Order</Label>
            <Input type="number" name="order" value={formData.order} onChange={handleChange} />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting || uploading}>Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
