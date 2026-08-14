import { useState, useEffect } from 'react';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';

export function FaqForm({ isOpen, onClose, item, onSuccess }) {
  const [formData, setFormData] = useState({
    question: '', answer: '', type_id: '', name: '', email: '', phone_number: '', status: 1
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!item;

  useEffect(() => {
    if (isOpen) {
      if (item) {
        setFormData({
          question: item.question || '',
          answer: item.answer || '',
          type_id: item.type_id?.toString() || '',
          name: item.name || '',
          email: item.email || '',
          phone_number: item.phone_number || '',
          status: item.status !== undefined ? item.status : 1
        });
      } else {
        setFormData({ question: '', answer: '', type_id: '', name: '', email: '', phone_number: '', status: 1 });
      }
    }
  }, [isOpen, item]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditing) await api.put(`/admin/faqs/${item.id}`, formData);
      else await api.post('/admin/faqs', formData);
      onSuccess(); onClose();
    } catch (err: any) { alert('Failed to save FAQ: ' + err.message); } 
    finally { setIsSubmitting(false); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{isEditing ? 'Edit FAQ' : 'Add New FAQ'}</DialogTitle></DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4 w-full">
          <div className="grid gap-2">
            <Label>Question</Label>
            <Input name="question" value={formData.question} onChange={handleChange} required />
          </div>
          <div className="grid gap-2">
            <Label>Answer</Label>
            <textarea name="answer" value={formData.answer} onChange={handleChange} rows={5} required
              className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background" />
          </div>
          <div className="grid gap-2">
            <Label>Asked By (Optional Name)</Label>
            <Input name="name" value={formData.name} onChange={handleChange} placeholder="e.g. John Doe" />
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
