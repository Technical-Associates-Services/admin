import { useState, useEffect } from 'react';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export function BannerForm({ isOpen, onClose, banner, onSuccess  }: { isOpen: boolean; onClose: () => void; onSuccess: () => void; [key: string]: any }) {
  const [formData, setFormData] = useState({ title: '', subtitle: '', links: '', image: '', status: 1 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const isEditing = !!banner;

  useEffect(() => {
    if (isOpen) {
      if (banner) {
        setFormData({
          title: banner.title || '',
          subtitle: banner.subtitle || '',
          links: banner.links || '',     // schema field: links
          image: banner.image || '',
          status: banner.status ?? 1
        });
      } else {
        setFormData({ title: '', subtitle: '', links: '', image: '', status: 1 });
      }
    }
  }, [isOpen, banner]);

  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const data = new FormData();
    data.append('image', file);
    data.append('folder', 'banners');
    try {
      const res = await api.post('/admin/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setFormData(prev => ({ ...prev, image: res.data.fileName }));
    } catch { alert('Upload failed'); } finally { setUploading(false); }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditing) await api.put(`/admin/banners/${banner.id}`, formData);
      else await api.post('/admin/banners', formData);
      onSuccess(); onClose();
    } catch (err: any) {
      alert('Failed to save banner: ' + (err.response?.data?.error || err.message));
    } finally { setIsSubmitting(false); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader><DialogTitle>{isEditing ? 'Edit Banner' : 'Add New Banner'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid gap-2">
            <Label>Headline / Title</Label>
            <Input name="title" value={formData.title} onChange={handleChange} required />
          </div>
          <div className="grid gap-2">
            <Label>Sub-Headline</Label>
            <Input name="subtitle" value={formData.subtitle} onChange={handleChange} />
          </div>
          <div className="grid gap-2">
            <Label>Button Link URL</Label>
            <Input name="links" value={formData.links} onChange={handleChange} placeholder="https://..." />
          </div>
          <div className="grid gap-2">
            <Label>Banner Image</Label>
            <Input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
            {uploading && <span className="text-xs text-muted-foreground">Uploading...</span>}
            {formData.image && (
              <div className="flex items-center gap-2 mt-1">
                <img
                  src={formData.image.startsWith('http') ? formData.image : `https://ivgvdteklcqtzfusbsfh.supabase.co/storage/v1/object/public/tas_media/banners/${formData.image}`}
                  alt="preview" className="w-20 h-10 object-cover rounded border"
                  onError={(e) => e.currentTarget.style.display = 'none'}
                />
                <span className="text-xs text-green-600">{formData.image.split('/').pop()}</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting || uploading}>
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Banner' : 'Create Banner'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
