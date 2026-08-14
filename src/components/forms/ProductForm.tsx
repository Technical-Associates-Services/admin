import { useState, useEffect, useRef } from 'react';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';

export function ProductForm({ isOpen, onClose, product, onSuccess }: { isOpen: boolean; onClose: () => void; product?: any; onSuccess: () => void }) {
  const [formData, setFormData] = useState({
    title: '', slug: '', category_id: '', brand_id: '',
    summary: '', description: '', price: '', stock: '', image: '', status: 1
  });
  const [categories, setCategories] = useState<any[]>([]);
  const [brands, setBrands] = useState<any[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const isEditing = !!product;

  useEffect(() => {
    if (!isOpen) return;
    // Fetch dropdown data
    Promise.all([api.get('/categories'), api.get('/brands')])
      .then(([catsRes, brandsRes]) => {
        // Flatten category tree to list
        const flatCats = (cats: any[], depth = 0): any[] =>
          cats.flatMap(c => [{ id: c.id, title: ('  '.repeat(depth)) + c.title }, ...flatCats(c.subCategory || [], depth + 1)]);
        setCategories(flatCats(catsRes.data.categories || []));
        setBrands(brandsRes.data.brands || []);
      })
      .catch(console.error);

    // Populate form for edit
    if (product) {
      setFormData({
        title: product.title || '',
        slug: product.slug || '',
        category_id: product.category_id?.toString() || '',
        brand_id: product.brand_id?.toString() || '',
        summary: product.summary || '',
        description: product.description || '',
        price: product.price || '',
        stock: product.stock || '',
        image: product.image || '',
        status: product.status ?? 1
      });
    } else {
      setFormData({ title: '', slug: '', category_id: '', brand_id: '', summary: '', description: '', price: '', stock: '', image: '', status: 1 });
    }
  }, [isOpen, product]);

  // Send live preview updates
  useEffect(() => {
    if (!iframeRef.current?.contentWindow) return;
    iframeRef.current.contentWindow.postMessage({ type: 'LIVE_PREVIEW', payload: formData }, '*');
  }, [formData]);

  const handleChange = (e: any) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleFileUpload = async (e: any) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const data = new FormData();
    data.append('image', file);
    data.append('folder', 'products');
    try {
      const res = await api.post('/admin/upload', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setFormData(prev => ({ ...prev, image: res.data.fileName }));
    } catch { alert('Upload failed'); } finally { setUploading(false); }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditing) await api.put(`/admin/products/${product.id}`, formData);
      else await api.post('/admin/products', formData);
      onSuccess(); onClose();
    } catch (error: any) {
      alert('Failed to save product: ' + (error.response?.data?.error || 'Unknown error'));
    } finally { setIsSubmitting(false); }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit Product' : 'Add New Product'}</DialogTitle>
        </DialogHeader>

        <div className="flex gap-6 flex-1 overflow-hidden">
          {/* ── Form Side ── */}
          <form onSubmit={handleSubmit} className="space-y-4 flex-1 overflow-y-auto pr-2 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Product Title</Label>
                <Input name="title" value={formData.title} onChange={handleChange} required />
              </div>
              <div className="grid gap-2">
                <Label>Slug</Label>
                <Input name="slug" value={formData.slug} onChange={handleChange} placeholder="Auto-generated" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Category</Label>
                <select name="category_id" value={formData.category_id} onChange={handleChange} required
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                </select>
              </div>
              <div className="grid gap-2">
                <Label>Brand</Label>
                <select name="brand_id" value={formData.brand_id} onChange={handleChange}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                  <option value="">No Brand</option>
                  {brands.map(b => <option key={b.id} value={b.id}>{b.title}</option>)}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label>Price</Label>
                <Input name="price" value={formData.price} onChange={handleChange} placeholder="e.g. 1500.00" />
              </div>
              <div className="grid gap-2">
                <Label>Stock / Availability</Label>
                <Input name="stock" value={formData.stock} onChange={handleChange} placeholder="e.g. In Stock" />
              </div>
            </div>

            <div className="grid gap-2">
              <Label>Short Summary</Label>
              <Input name="summary" value={formData.summary} onChange={handleChange} />
            </div>

            <div className="grid gap-2">
              <Label>Description</Label>
              <textarea name="description" value={formData.description} onChange={handleChange} rows={4}
                className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring resize-none" />
            </div>

            <div className="grid gap-2">
              <Label>Product Image</Label>
              <Input type="file" accept="image/*" onChange={handleFileUpload} disabled={uploading} />
              {uploading && <span className="text-xs text-muted-foreground">Uploading to Supabase...</span>}
              {formData.image && (
                <div className="flex items-center gap-2">
                  <img
                    src={formData.image.startsWith('http') ? formData.image : `${process.env.NEXT_PUBLIC_API_URL}/api/media/products/${formData.image}`}
                    alt="preview" className="w-16 h-16 object-cover rounded border"
                    onError={(e) => e.currentTarget.style.display = 'none'}
                  />
                  <span className="text-xs text-green-600">{formData.image.split('/').pop()}</span>
                </div>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
              <Button type="submit" disabled={isSubmitting || uploading}>
                {isSubmitting ? 'Saving...' : isEditing ? 'Update Product' : 'Create Product'}
              </Button>
            </DialogFooter>
          </form>

          {/* ── Live Preview Side ── */}
          <div className="w-[380px] shrink-0 hidden lg:flex flex-col border-l pl-4 py-2">
            <Label className="mb-2 text-sm font-semibold text-muted-foreground">
              🖥 Live Preview (as seen on website)
            </Label>
            <div className="flex-1 rounded-lg border overflow-hidden bg-white relative">
              <iframe
                ref={iframeRef}
                src={`${process.env.NEXT_PUBLIC_FRONTEND_URL || 'http://localhost:3002'}/preview/product`}
                className="w-full h-full border-0"
                style={{ minHeight: '500px' }}
                onLoad={() => {
                  // Send current form data on iframe load
                  iframeRef.current?.contentWindow?.postMessage({ type: 'LIVE_PREVIEW', payload: formData }, '*');
                }}
              />
              <div className="absolute top-2 right-2 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full border border-amber-200">
                Live
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              Updates in real-time as you type. Requires tas-frontend on port 3002.
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
