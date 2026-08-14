import { useState, useEffect } from 'react';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export function SolutionForm({ isOpen, onClose, item, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '', slug: '', summary: '', description: '', sub_title: '', image: '', download_pdf: '', download_doc: '',
    seo_title: '', seo_keyword: '', seo_description: '', status: 1
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const isEditing = !!item;

  useEffect(() => {
    if (isOpen) {
      if (item) {
        setFormData({
          title: item.title || '', slug: item.slug || '', summary: item.summary || '', description: item.description || '', sub_title: item.sub_title || '',
          image: item.image || '', download_pdf: item.download_pdf || '', download_doc: item.download_doc || '',
          seo_title: item.seo_title || '', seo_keyword: item.seo_keyword || '', seo_description: item.seo_description || '',
          status: item.status !== undefined ? item.status : 1
        });
      } else {
        setFormData({ title: '', slug: '', summary: '', description: '', sub_title: '', image: '', download_pdf: '', download_doc: '', seo_title: '', seo_keyword: '', seo_description: '', status: 1 });
      }
    }
  }, [isOpen, item]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileUpload = async (e, field) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const data = new FormData();
    data.append('image', file); // We use the same generic upload endpoint which parses 'image'
    data.append('folder', 'solutions');
    try {
      const res = await api.post('/admin/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setFormData(prev => ({ ...prev, [field]: res.data.fileName }));
    } catch { alert('Upload failed'); } finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditing) await api.put(`/admin/solutions/${item.id}`, formData);
      else await api.post('/admin/solutions', formData);
      onSuccess(); onClose();
    } catch (err: any) { alert('Failed to save solution: ' + err.message); } 
    finally { setIsSubmitting(false); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isEditing ? 'Edit Solution' : 'Add New Solution'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Solution Title</Label>
              <Input name="title" value={formData.title} onChange={handleChange} required />
            </div>
            <div className="grid gap-2">
              <Label>Sub Title</Label>
              <Input name="sub_title" value={formData.sub_title} onChange={handleChange} />
            </div>
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
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label>Image</Label>
              <Input type="file" accept="image/*" onChange={e => handleFileUpload(e, 'image')} disabled={uploading} />
              {formData.image && <div className="text-xs text-green-600 truncate">{formData.image.split('/').pop()}</div>}
            </div>
            <div className="grid gap-2">
              <Label>PDF File</Label>
              <Input type="file" accept=".pdf" onChange={e => handleFileUpload(e, 'download_pdf')} disabled={uploading} />
              {formData.download_pdf && <div className="text-xs text-green-600 truncate">{formData.download_pdf.split('/').pop()}</div>}
            </div>
            <div className="grid gap-2">
              <Label>Doc File</Label>
              <Input type="file" accept=".doc,.docx" onChange={e => handleFileUpload(e, 'download_doc')} disabled={uploading} />
              {formData.download_doc && <div className="text-xs text-green-600 truncate">{formData.download_doc.split('/').pop()}</div>}
            </div>
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
