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

export function UserForm({ isOpen, onClose, user, onSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    username: '',
    password: '',
    status: 1
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!user;

  useEffect(() => {
    if (isOpen) {
      if (user) {
        setFormData({
          email: user.email || '',
          username: user.username || '',
          password: '', // Don't populate password on edit
          status: user.status !== undefined ? user.status : 1
        });
      } else {
        setFormData({
          email: '', username: '', password: '', status: 1
        });
      }
    }
  }, [isOpen, user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (isEditing) {
        await api.put(`/admin/users/${user.id}`, formData);
      } else {
        await api.post('/admin/users', formData);
      }
      onSuccess();
      onClose();
    } catch (error) {
      console.error('Form submission failed', error);
      alert('Failed to save user: ' + (error.response?.data?.error || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Edit User' : 'Add New User'}</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4 w-full">
          <div className="grid gap-2">
            <Label htmlFor="email">Email Address</Label>
            <Input id="email" type="email" name="email" value={formData.email} onChange={handleChange} required />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="username">Username</Label>
            <Input id="username" name="username" value={formData.username} onChange={handleChange} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="password">Password {isEditing && '(Leave blank to keep current)'}</Label>
            <Input id="password" type="password" name="password" value={formData.password} onChange={handleChange} required={!isEditing} />
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Saving...' : 'Save User'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
