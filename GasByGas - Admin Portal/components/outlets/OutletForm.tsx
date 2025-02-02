'use client';

import { useState } from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

const formSchema = z.object({
  outlet_name: z.string().min(2, 'Outlet name must be at least 2 characters'),
  district: z.string().min(2, 'District must be at least 2 characters'),
  manager_name: z.string().min(2, 'Manager name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  contact_no: z.string().regex(/^\+?\d{10,13}$/, 'Invalid phone number'),
  outlet_registration_id: z.string().min(2, 'Registration ID is required'),
  outlet_address: z.string().min(5, 'Address must be at least 5 characters'),
  outlet_certificate: z.any(),
  username: z.string().min(4, 'Username must be at least 4 characters'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  nic: z.string().regex(/^[0-9]{9}[vVxX]$/, 'Invalid NIC format'),
});

export function OutletForm({ isOpen, onClose, outlet = null }) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      outlet_name: outlet?.outlet_name || '',
      district: outlet?.district || '',
      manager_name: outlet?.manager_name || '',
      email: outlet?.email || '',
      contact_no: outlet?.contact_no || '',
      outlet_registration_id: outlet?.outlet_registration_id || '',
      outlet_address: outlet?.outlet_address || '',
      outlet_certificate: '',
      username: outlet?.username || '',
      password: '',
      nic: outlet?.nic || '',
    },
  });

  const onSubmit = async (values) => {
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      Object.keys(values).forEach(key => {
        if (key === 'outlet_certificate' && values[key][0]) {
          formData.append(key, values[key][0]);
        } else {
          formData.append(key, values[key]);
        }
      });

      const response = await fetch('/api/outlets', {
        method: outlet ? 'PUT' : 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Failed to save outlet');

      toast({
        title: 'Success',
        description: `Outlet ${outlet ? 'updated' : 'created'} successfully`,
      });
      onClose();
    } catch (error) {
      toast({
        title: 'Error',
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>
            {outlet ? 'Edit Outlet' : 'Add New Outlet'}
          </DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="outlet_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Outlet Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="district"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>District</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="manager_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Manager Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="nic"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>NIC</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="123456789V" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input {...field} type="email" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="contact_no"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Number</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="+94XXXXXXXXX" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="outlet_registration_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Registration ID</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="outlet_certificate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Certificate</FormLabel>
                    <FormControl>
                      <Input 
                        type="file" 
                        onChange={(e) => field.onChange(e.target.files)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Username</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="outlet_address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : outlet ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
