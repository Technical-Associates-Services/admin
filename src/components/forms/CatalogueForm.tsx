import { useState, useEffect } from 'react';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export function CatalogueForm({ isOpen, onClose, item, onSuccess }) {
  const [formData, setFormData] = useState({ title: '', slug: '', image: '', file: '', status: 1 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const isEditing = !!item;

  useEffect(() => {
    if (isOpen) {
      if (item) setFormData({ title: item.title || '', slug: item.slug || '', image: item.image || '', file: item.file || '', status: item.status !== undefined ? item.status : 1 });
      else setFormData({ title: '', slug: '', image: '', file: '', status: 1 });
    }
  }, [isOpen, item]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileUpload = async (e, type) => {
    const fileObj = e.target.files?.[0];
    if (!fileObj) return;
    setUploading(true);
    const data = new FormData();
    data.append('image', fileObj); 
    data.append('folder', 'catalogues');
    try {
      const res = await api.post('/admin/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setFormData(prev => ({ ...prev, [type]: res.data.fileName }));
    } catch { alert('Upload failed'); } finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditing) await api.put(`/admin/catalogues/${item.id}`, formData);
      else await api.post('/admin/catalogues', formData);
      onSuccess(); onClose();
    } catch (err: any) { alert('Failed to save catalogue: ' + err.message); } 
    finally { setIsSubmitting(false); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader><DialogTitle>{isEditing ? 'Edit Catalogue' : 'Add New Catalogue'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label>Title</Label>
            <Input name="title" value={formData.title} onChange={handleChange} required />
          </div>
          <div className="grid gap-2">
            <Label>Thumbnail Image</Label>
            <Input type="file" accept="image/*" onChange={e => handleFileUpload(e, 'image')} disabled={uploading} />
            {formData.image && <div className="text-xs text-green-600 truncate">{formData.image.split('/').pop()}</div>}
          </div>
          <div className="grid gap-2">
            <Label>PDF File (Required)</Label>
            <Input type="file" accept=".pdf" onChange={e => handleFileUpload(e, 'file')} disabled={uploading} />
            {formData.file && <div className="text-xs text-green-600 truncate">{formData.file.split('/').pop()}</div>}
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
