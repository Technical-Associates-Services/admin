import { useState, useEffect } from 'react';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export function ServiceForm({ isOpen, onClose, item, onSuccess  }: { isOpen: boolean; onClose: () => void; onSuccess: () => void; [key: string]: any }) {
  const [formData, setFormData] = useState({
    title: '', slug: '', summary: '', description: '', image: '',
    seo_title: '', seo_keyword: '', seo_description: '', status: 1
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
          summary: item.summary || '',
          description: item.description || '',
          image: item.image || '',
          seo_title: item.seo_title || '',
          seo_keyword: item.seo_keyword || '',
          seo_description: item.seo_description || '',
          status: item.status !== undefined ? item.status : 1
        });
      } else {
        setFormData({ title: '', slug: '', summary: '', description: '', image: '', seo_title: '', seo_keyword: '', seo_description: '', status: 1 });
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
    data.append('folder', 'services');
    try {
      const res = await api.post('/admin/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setFormData(prev => ({ ...prev, image: res.data.fileName }));
    } catch { alert('Upload failed'); } finally { setUploading(false); }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditing) await api.put(`/admin/services/${item.id}`, formData);
      else await api.post('/admin/services', formData);
      onSuccess(); onClose();
    } catch (err: any) { alert('Failed to save service: ' + err.message); } 
    finally { setIsSubmitting(false); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isEditing ? 'Edit Service' : 'Add New Service'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label>Service Title</Label>
            <Input name="title" value={formData.title} onChange={handleChange} required />
          </div>
          <div className="grid gap-2">
            <Label>Slug (Optional)</Label>
            <Input name="slug" value={formData.slug} onChange={handleChange} placeholder="Auto-generated" />
          </div>
          <div className="grid gap-2">
            <Label>Summary</Label>
            <Input name="summary" value={formData.summary} onChange={handleChange} />
          </div>
          <div className="grid gap-2">
            <Label>Description</Label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={4}
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" />
          </div>
          <div className="grid gap-2">
            <Label>Cover Image</Label>
            <Input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
            {formData.image && <div className="text-xs text-green-600 truncate">{formData.image.split('/').pop()}</div>}
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
