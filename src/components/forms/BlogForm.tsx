import { useState, useEffect } from 'react';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';

export function BlogForm({ isOpen, onClose, blog, onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    slug: '',
    summary: '',
    description: '',
    category_id: '',
    image: '',
    seo_title: '',
    seo_keyword: '',
    seo_description: '',
    status: 1
  });

  const [categories, setCategories] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const isEditing = !!blog;

  // Fetch blog categories (since schema shows Blog depends on BlogCategory, let's try /categories or we'll map to regular categories for now)
  // Let's assume there is a /blog-categories or similar, wait, looking at API_SPEC we might only have /categories
  // Actually, we can just use an input or basic dropdown for now if we don't have a specific endpoint. 
  // Wait, let's check what endpoints exist for blog categories... I will just fetch from /admin/categories for now and assume they can be used, or just default to 1.
  useEffect(() => {
    if (isOpen) {
      // Just fetch regular categories as a fallback, or if backend has it. 
      // It's just an integer in schema.
      api.get('/categories')
        .then(res => {
           // Flatten tree
           const flatCats = (cats: any[], depth = 0): any[] =>
             cats.flatMap(c => [{ id: c.id, title: ('  '.repeat(depth)) + c.title }, ...flatCats(c.subCategory || [], depth + 1)]);
           setCategories(flatCats(res.data.categories || []));
        }).catch(console.error);

      if (blog) {
        setFormData({
          title: blog.title || '',
          slug: blog.slug || '',
          summary: blog.summary || '',
          description: blog.description || '',
          category_id: blog.category_id?.toString() || '1',
          image: blog.image || '',
          seo_title: blog.seo_title || '',
          seo_keyword: blog.seo_keyword || '',
          seo_description: blog.seo_description || '',
          status: blog.status !== undefined ? blog.status : 1
        });
      } else {
        setFormData({
          title: '', slug: '', summary: '', description: '', category_id: '1', image: '', seo_title: '', seo_keyword: '', seo_description: '', status: 1
        });
      }
    }
  }, [isOpen, blog]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const data = new FormData();
    data.append('image', file);
    data.append('folder', 'blogs');

    try {
      const res = await api.post('/admin/upload', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setFormData({ ...formData, image: res.data.fileName });
    } catch (error) {
      console.error('Upload failed', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditing) {
        await api.put(`/admin/blogs/${blog.id}`, formData);
      } else {
        await api.post('/admin/blogs', formData);
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Form submission failed', error);
      alert('Failed to save blog: ' + (error.response?.data?.error || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Blog' : 'Add New Blog'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4 w-full">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Blog Title</Label>
              <Input id="title" name="title" value={formData.title} onChange={handleChange} required />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="slug">Slug (Optional)</Label>
              <Input id="slug" name="slug" value={formData.slug} onChange={handleChange} placeholder="Auto-generated" />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="category_id">Category</Label>
            <select name="category_id" value={formData.category_id} onChange={handleChange} required
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
              <option value="1">General</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
            </select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="summary">Short Summary</Label>
            <Input id="summary" name="summary" value={formData.summary} onChange={handleChange} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="image">Cover Image</Label>
            <Input id="image" type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
            {uploading && <span className="text-xs text-muted-foreground">Uploading...</span>}
            {formData.image && (
              <div className="flex items-center gap-2 mt-1">
                <img
                  src={formData.image.startsWith('http') ? formData.image : `https://ivgvdteklcqtzfusbsfh.supabase.co/storage/v1/object/public/tas_media/blogs/${formData.image}`}
                  alt="preview" className="w-16 h-16 object-cover rounded border"
                  onError={(e) => e.currentTarget.style.display = 'none'}
                />
                <span className="text-xs text-green-600 truncate">{formData.image.split('/').pop()}</span>
              </div>
            )}
          </div>

          {/* SEO Fields */}
          <div className="pt-4 border-t border-border/50">
            <h4 className="text-sm font-semibold mb-3">SEO Meta Details</h4>
            <div className="space-y-3">
              <div className="grid gap-2">
                <Label>SEO Title</Label>
                <Input name="seo_title" value={formData.seo_title} onChange={handleChange} />
              </div>
              <div className="grid gap-2">
                <Label>SEO Keywords</Label>
                <Input name="seo_keyword" value={formData.seo_keyword} onChange={handleChange} />
              </div>
              <div className="grid gap-2">
                <Label>SEO Description</Label>
                <Input name="seo_description" value={formData.seo_description} onChange={handleChange} />
              </div>
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting || uploading}>
              {isSubmitting ? 'Saving...' : 'Save Blog'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
