import { useState, useEffect } from 'react';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';

export function TestimonialForm({ isOpen, onClose, testimonial, onSuccess  }: { isOpen: boolean; onClose: () => void; onSuccess: () => void; [key: string]: any }) {
  const [formData, setFormData] = useState({ name: '', designation: '', company: '', message: '', image: '', status: 1 });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const isEditing = !!testimonial;

  useEffect(() => {
    if (isOpen) {
      setFormData(testimonial
        ? { name: testimonial.name || '', designation: testimonial.designation || '', company: testimonial.company || '', message: testimonial.message || '', image: testimonial.image || '', status: testimonial.status ?? 1 }
        : { name: '', designation: '', company: '', message: '', image: '', status: 1 }
      );
    }
  }, [isOpen, testimonial]);

  const handleChange = (e: any) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const data = new FormData();
    data.append('image', file);
    data.append('folder', 'testimonials');
    try {
      const res = await api.post('/admin/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setFormData({ ...formData, image: res.data.fileName });
    } catch { alert('Upload failed'); } finally { setUploading(false); }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditing) await api.put(`/admin/testimonials/${testimonial.id}`, formData);
      else await api.post('/admin/testimonials', formData);
      onSuccess(); onClose();
    } catch { alert('Failed to save'); } finally { setIsSubmitting(false); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader><DialogTitle>{isEditing ? 'Edit Testimonial' : 'Add Testimonial'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2"><Label>Client Name</Label><Input name="name" value={formData.name} onChange={handleChange} required /></div>
            <div className="grid gap-2"><Label>Designation</Label><Input name="designation" value={formData.designation} onChange={handleChange} /></div>
          </div>
          <div className="grid gap-2"><Label>Company</Label><Input name="company" value={formData.company} onChange={handleChange} /></div>
          <div className="grid gap-2">
            <Label>Message / Quote</Label>
            <textarea name="message" value={formData.message} onChange={handleChange} rows={4}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50" />
          </div>
          <div className="grid gap-2">
            <Label>Client Photo</Label>
            <Input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
            {uploading && <span className="text-xs text-muted-foreground">Uploading...</span>}
            {formData.image && <div className="text-xs text-green-600 truncate">File: {formData.image}</div>}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting || uploading}>{isSubmitting ? 'Saving...' : 'Save'}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
