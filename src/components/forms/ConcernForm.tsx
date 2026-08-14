import { useState, useEffect } from 'react';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export function ConcernForm({ isOpen, onClose, item, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '', slug: '', description: '', image: '', links: '', order: '0', status: 1
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const isEditing = !!item;

  useEffect(() => {
    if (isOpen) {
      if (item) {
        setFormData({
          title: item.title || '',
          slug: item.slug || '',
          description: item.description || '',
          image: item.image || '',
          links: item.links || '',
          order: item.order?.toString() || '0',
          status: item.status !== undefined ? item.status : 1
        });
      } else {
        setFormData({ title: '', slug: '', description: '', image: '', links: '', order: '0', status: 1 });
      }
    }
  }, [isOpen, item]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const data = new FormData();
    data.append('image', file);
    data.append('folder', 'concerns');
    try {
      const res = await api.post('/admin/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setFormData(prev => ({ ...prev, image: res.data.fileName }));
    } catch { alert('Upload failed'); } finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditing) await api.put(`/admin/concerns/${item.id}`, formData);
      else await api.post('/admin/concerns', formData);
      onSuccess(); onClose();
    } catch (err: any) { alert('Failed to save concern: ' + err.message); } 
    finally { setIsSubmitting(false); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isEditing ? 'Edit Sister Concern' : 'Add New Sister Concern'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label>Title</Label>
            <Input name="title" value={formData.title} onChange={handleChange} required />
          </div>
          <div className="grid gap-2">
            <Label>Slug</Label>
            <Input name="slug" value={formData.slug} onChange={handleChange} placeholder="Auto-generated" />
          </div>
          <div className="grid gap-2">
            <Label>Link (URL)</Label>
            <Input name="links" value={formData.links} onChange={handleChange} placeholder="https://..." />
          </div>
          <div className="grid gap-2">
            <Label>Description</Label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={3}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" />
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
