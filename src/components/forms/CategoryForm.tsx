import { useState, useEffect } from 'react';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';

export function CategoryForm({ isOpen, onClose, category, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '', slug: '', subtitle: '', description: '', image: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const isEditing = !!category;

  // Populate form when editing
  useEffect(() => {
    if (isOpen) {
      if (category) {
        setFormData({
          title: category.title || '',
          slug: category.slug || '',
          subtitle: category.subtitle || '',
          description: category.description || '',
          image: category.image || ''
        });
      } else {
        setFormData({ title: '', slug: '', subtitle: '', description: '', image: '' });
      }
    }
  }, [isOpen, category]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const data = new FormData();
    data.append('image', file);
    data.append('folder', 'categories');
    try {
      const res = await api.post('/admin/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setFormData(prev => ({ ...prev, image: res.data.fileName }));
    } catch { alert('Upload failed'); } finally { setUploading(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditing) {
        await api.put(`/admin/categories/${category.id}`, formData);
      } else {
        await api.post('/admin/categories', formData);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Form submission failed', error);
      alert('Failed to save category');
    } finally { setIsSubmitting(false); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Category' : 'Add New Category'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">Slug (Optional)</Label>
              <Input id="slug" name="slug" value={formData.slug} onChange={handleChange} placeholder="Auto-generated" />
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="subtitle">Subtitle</Label>
            <Input id="subtitle" name="subtitle" value={formData.subtitle} onChange={handleChange} />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="image">Category Image</Label>
            <Input id="image" type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
            {uploading && <span className="text-xs text-muted-foreground">Uploading...</span>}
            {formData.image && (
              <div className="flex items-center gap-2 mt-1">
                <img
                  src={formData.image}
                  alt="preview"
                  className="w-12 h-12 object-cover rounded border"
                  onError={(e) => e.currentTarget.style.display = 'none'}
                />
                <span className="text-xs text-green-600 truncate">{formData.image.split('/').pop()}</span>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting || uploading}>
              {isSubmitting ? 'Saving...' : isEditing ? 'Update Category' : 'Create Category'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
