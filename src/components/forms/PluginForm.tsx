import { useState, useEffect } from 'react';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export function PluginForm({ isOpen, onClose, item, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '', code: '', type: 'custom', tag_type: 'head', status: 1
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!item;

  useEffect(() => {
    if (isOpen) {
      if (item) {
        setFormData({
          title: item.title || '',
          code: item.code || '',
          type: item.type || 'custom',
          tag_type: item.tag_type || 'head',
          status: item.status !== undefined ? item.status : 1
        });
      } else {
        setFormData({ title: '', code: '', type: 'custom', tag_type: 'head', status: 1 });
      }
    }
  }, [isOpen, item]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditing) await api.put(`/admin/plugins/${item.id}`, formData);
      else await api.post('/admin/plugins', formData);
      onSuccess(); onClose();
    } catch (err: any) { alert('Failed to save plugin: ' + err.message); } 
    finally { setIsSubmitting(false); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isEditing ? 'Edit Plugin' : 'Add New Plugin'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4 w-full">
          <div className="grid gap-2">
            <Label>Plugin Title (e.g., Google Analytics)</Label>
            <Input name="title" value={formData.title} onChange={handleChange} required />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Type</Label>
              <select name="type" value={formData.type} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                <option value="custom">Custom JS/HTML</option>
                <option value="pixel">Tracking Pixel</option>
                <option value="style">Custom CSS</option>
              </select>
            </div>
            <div className="grid gap-2">
              <Label>Placement</Label>
              <select name="tag_type" value={formData.tag_type} onChange={handleChange} className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background">
                <option value="head">Inside &lt;head&gt;</option>
                <option value="body">Start of &lt;body&gt;</option>
                <option value="footer">Before &lt;/body&gt;</option>
              </select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Snippet Code</Label>
            <textarea name="code" value={formData.code} onChange={handleChange} rows={8} required placeholder="<!-- Paste your HTML/JS code here -->"
              className="flex w-full rounded-md border border-input bg-zinc-950 text-green-400 font-mono px-3 py-2 text-sm ring-offset-background" />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>Save</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
