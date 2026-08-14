import { useState, useEffect } from 'react';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export function BrandForm({ isOpen, onClose, brand, onSuccess }) {
  const [formData, setFormData] = useState({ title: '', slug: '', image: '', status: 1 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const isEditing = !!brand;

  useEffect(() => {
    if (isOpen) {
      setFormData(brand
        ? { title: brand.title || '', slug: brand.slug || '', image: brand.image || '', status: brand.status ?? 1 }
        : { title: '', slug: '', image: '', status: 1 }
      );
    }
  }, [isOpen, brand]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const data = new FormData();
    data.append('image', file);
    data.append('folder', 'brands');
    try {
      const res = await api.post('/admin/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setFormData(prev => ({ ...prev, image: res.data.fileName }));
    } catch { alert('Upload failed'); } finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditing) await api.put(`/admin/brands/${brand.id}`, formData);
      else await api.post('/admin/brands', formData);
      onSuccess(); onClose();
    } catch { alert('Failed to save brand'); } finally { setIsSubmitting(false); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[420px]">
        <DialogHeader><DialogTitle>{isEditing ? 'Edit Brand' : 'Add Brand'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-2"><Label>Brand Name</Label><Input name="title" value={formData.title} onChange={handleChange} required /></div>
          <div className="grid gap-2"><Label>Slug</Label><Input name="slug" value={formData.slug} onChange={handleChange} placeholder="Auto-generated" /></div>
          <div className="grid gap-2">
            <Label>Brand Logo</Label>
            <Input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
            {uploading && <span className="text-xs text-muted-foreground">Uploading...</span>}
            {formData.image && <div className="text-xs text-green-600 truncate">File: {formData.image}</div>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting || uploading}>{isSubmitting ? 'Saving...' : 'Save Brand'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
