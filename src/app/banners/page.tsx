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
import { BannerForm } from '@/components/forms/BannerForm';

export default function BannersPage() {
  const [banners, setBanners] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Modal state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedBanner, setSelectedBanner] = useState<any>(null);

  const fetchBanners = async () => {
    setIsLoading(true);
    try {
      const res = await api.get('/banners');
      setBanners(res.data.banners || []);
    } catch (error) {
      console.error("Failed to fetch banners", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleAdd = () => {
    setSelectedBanner(null);
    setIsFormOpen(true);
  };

  const handleEdit = (banner: any) => {
    setSelectedBanner(banner);
    setIsFormOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this banner?')) {
      try {
        await api.delete(`/admin/banners/${id}`);
        fetchBanners();
      } catch (error) {
        console.error('Failed to delete', error);
        alert('Failed to delete banner');
      }
    }
  };

  return (
    <DashboardLayout>
      <div className="flex flex-col space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Banners</h1>
            <p className="text-muted-foreground mt-1">Manage website banners and sliders.</p>
          </div>
          <Button className="shadow-md" onClick={handleAdd}>
            <Plus className="mr-2 h-4 w-4" /> Add Banner
          </Button>
        </div>

        <Card className="border-zinc-200/60 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle>All Banners</CardTitle>
            <CardDescription>Active banners across the site.</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <Loader />
            ) : (
              <div className="rounded-md border overflow-hidden">
                <Table>
                  <TableHeader className="bg-zinc-50 dark:bg-zinc-900/50">
                    <TableRow>
                      <TableHead className="w-[120px]">Image</TableHead>
                      <TableHead>Headline</TableHead>
                      <TableHead>Link</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {banners.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">
                          No banners found.
                        </TableCell>
                      </TableRow>
                    ) : (
                      banners.map((banner) => (
                        <TableRow key={banner.id}>
                          <TableCell>
                            <div className="w-16 h-8 rounded-md overflow-hidden bg-zinc-100 flex items-center justify-center border">
                              <img 
                                src={banner.image ? (banner.image.startsWith('http') ? banner.image : `${process.env.NEXT_PUBLIC_API_URL}/frontend/images/banners/${banner.image}`) : '/logo.png'} 
                                alt={banner.title} 
                                className="object-cover w-full h-full" 
                                onError={(e) => {
                                  if (!e.currentTarget.dataset.retried && banner.image && !banner.image.startsWith('http')) {
                                    e.currentTarget.dataset.retried = "true";
                                    e.currentTarget.src = `https://ivgvdteklcqtzfusbsfh.supabase.co/storage/v1/object/public/tas_media/banners/${banner.image}`;
                                  } else {
                                    e.currentTarget.src = '/logo.png';
                                  }
                                }} 
                              />
                            </div>
                          </TableCell>
                          <TableCell className="font-medium truncate max-w-[200px]">{banner.title || 'No Title'}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">{banner.link || '-'}</TableCell>
                          <TableCell>{banner.order}</TableCell>
                          <TableCell className="text-right space-x-2">
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleEdit(banner)}>
                              <Edit className="h-4 w-4 text-blue-600" />
                            </Button>
                            <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleDelete(banner.id)}>
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
        <BannerForm 
          isOpen={isFormOpen} 
          onClose={() => setIsFormOpen(false)} 
          banner={selectedBanner} 
          onSuccess={fetchBanners} 
        />
      )}
    </DashboardLayout>
  );
}
