'use client';

import { useEffect, useState } from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { api } from '@/lib/axios';
import { Button } from '@/components/ui/button';
import { Plus, Edit, Trash2 } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Loader } from '@/components/ui/loader';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { BlogForm } from '@/components/forms/BlogForm';

export default function BlogsPage() {
  const [blogs, setBlogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<any>(null);

  const fetchBlogs = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/blogs');
      setBlogs(res.data.blogs || []);
    } catch (error) {
      console.error("Failed to fetch blogs", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, []);

  const handleAdd = () => {
    setSelectedBlog(null);
    setIsFormOpen(true);
  };

  const handleEdit = (blog: any) => {
    setSelectedBlog(blog);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this blog?')) {
      try {
        await api.delete(`/admin/blogs/${id}`);
        fetchBlogs();
      } catch (error) {
        console.error('Failed to delete', error);
        alert('Failed to delete blog');
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Blogs & News</h1>
            <p className="text-muted-foreground mt-1">Manage articles, news, and company updates.</p>
          </div>
          <Button className="shadow-md" onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" /> Add Blog Post
          </Button>
        </div>

        <Card className="border-zinc-200/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle>All Blog Posts</CardTitle>
            <CardDescription>A complete list of your published and drafted articles.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader />
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
                    <TableRow>
                      <TableHead className="w-[80px]">Image</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {blogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="text-center py-10 text-muted-foreground">
                          No blog posts found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      blogs.map((blog) => (
                        <TableRow key={blog.id || blog.slug}>
                          <TableCell>
                            <div className="w-10 h-10 rounded-md overflow-hidden bg-zinc-100 flex items-center justify-center border">
                              <img 
                                src={blog.image ? (blog.image.startsWith('http') ? blog.image : `${process.env.NEXT_PUBLIC_API_URL}/frontend/images/blogs/${blog.image}`) : '/logo.png'} 
                                alt={blog.title} 
                                className="object-cover w-full h-full" 
                                onError={(e) => {
                                  if (!e.currentTarget.dataset.retried && blog.image && !blog.image.startsWith('http')) {
                                    e.currentTarget.dataset.retried = "true";
                                    e.currentTarget.src = `https://ivgvdteklcqtzfusbsfh.supabase.co/storage/v1/object/public/tas_media/blogs/${blog.image}`;
                                  } else {
                                    e.currentTarget.src = '/logo.png';
                                  }
                                }} 
                              />
                            </div>
                          </TableCell>
                          <TableCell className="font-medium truncate max-w-[300px]">{blog.title}</TableCell>
                          <TableCell className="text-muted-foreground">{new Date(blog.date).toLocaleDateString()}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleEdit(blog)}>
                              <Edit className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleDelete(blog.id)}>
                              <Trash2 className="h-4 w-4 text-red-600" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {isFormOpen && (
        <BlogForm 
          isOpen={isFormOpen} 
          onClose={() => setIsFormOpen(false)} 
          blog={selectedBlog} 
          onSuccess={fetchBlogs} 
        />
      )}
    </DashboardLayout>
  );
}
