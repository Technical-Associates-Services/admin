import { useState, useEffect } from 'react';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export function JobForm({ isOpen, onClose, item, onSuccess  }: { isOpen: boolean; onClose: () => void; onSuccess: () => void; [key: string]: any }) {
  const [formData, setFormData] = useState({
    title: '', slug: '', salary: 'Negotiable', deadline: '', education: '', experience: '',
    no_of_vacancy: '', type: 'Full Time', description: '', summary: '', image: '', order: '0', status: 1
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const isEditing = !!item;

  useEffect(() => {
    if (isOpen) {
      if (item) {
        setFormData({
          title: item.title || '', slug: item.slug || '', salary: item.salary || 'Negotiable', deadline: item.deadline || '',
          education: item.education || '', experience: item.experience || '', no_of_vacancy: item.no_of_vacancy || '',
          type: item.type || 'Full Time', description: item.description || '', summary: item.summary || '',
          image: item.image || '', order: item.order?.toString() || '0', status: item.status !== undefined ? item.status : 1
        });
      } else {
        setFormData({ title: '', slug: '', salary: 'Negotiable', deadline: '', education: '', experience: '', no_of_vacancy: '', type: 'Full Time', description: '', summary: '', image: '', order: '0', status: 1 });
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
    data.append('folder', 'jobs');
    try {
      const res = await api.post('/admin/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setFormData(prev => ({ ...prev, image: res.data.fileName }));
    } catch { alert('Upload failed'); } finally { setUploading(false); }
  };

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditing) await api.put(`/admin/jobs/${item.id}`, formData);
      else await api.post('/admin/jobs', formData);
      onSuccess(); onClose();
    } catch (err: any) { alert('Failed to save job: ' + err.message); } 
    finally { setIsSubmitting(false); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isEditing ? 'Edit Job' : 'Add New Job'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4 w-full">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Job Title</Label>
              <Input name="title" value={formData.title} onChange={handleChange} required />
            </div>
            <div className="grid gap-2">
              <Label>Job Type</Label>
              <select name="type" value={formData.type} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                <option value="Full Time">Full Time</option>
                <option value="Part Time">Part Time</option>
                <option value="Contract">Contract</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label>Salary</Label>
              <Input name="salary" value={formData.salary} onChange={handleChange} />
            </div>
            <div className="grid gap-2">
              <Label>Vacancy</Label>
              <Input name="no_of_vacancy" value={formData.no_of_vacancy} onChange={handleChange} />
            </div>
            <div className="grid gap-2">
              <Label>Deadline (Date)</Label>
              <Input type="date" name="deadline" value={formData.deadline} onChange={handleChange} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Education Reqs</Label>
              <Input name="education" value={formData.education} onChange={handleChange} />
            </div>
            <div className="grid gap-2">
              <Label>Experience</Label>
              <Input name="experience" value={formData.experience} onChange={handleChange} />
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Description</Label>
            <textarea name="description" value={formData.description} onChange={handleChange} rows={4} className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" />
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
