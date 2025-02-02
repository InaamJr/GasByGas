'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { DataTable } from '@/components/ui/data-table';
import { StatCard } from '@/components/ui/stat-card';
import { Card } from '@/components/ui/card';
import { useToast } from '@/components/ui/use-toast';

interface Admin {
  admin_id: number;
  name: string;
  username: string;
  email: string;
  contact: string;
  is_super_admin: boolean;
  status: string;
}

const columns = [
  { key: 'name', label: 'Name' },
  { key: 'username', label: 'Username' },
  { key: 'email', label: 'Email' },
  { key: 'contact', label: 'Contact' },
  { key: 'is_super_admin', label: 'Super Admin', 
    render: (value: boolean) => value ? 'Yes' : 'No' 
  },
  { key: 'status', label: 'Status' }
];

export default function AddAdminPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [admins, setAdmins] = useState<Admin[]>([]);
  const [selectedAdmin, setSelectedAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    nic: '',
    contact: '',
    email: '',
    username: '',
    password: '',
    is_super_admin: false,
  });
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    
    if (!session?.user?.isSuperAdmin) {
      toast({
        title: "Unauthorized",
        description: "You must be a super admin to access this page",
        variant: "destructive",
      });
      router.push("/dashboard");
      return;
    }

    fetchAdmins();
  }, [session, status, router]);

  const fetchAdmins = async () => {
    try {
      const response = await fetch('/api/admins');
      if (!response.ok) throw new Error('Failed to fetch admins');
      const data = await response.json();
      setAdmins(data);
    } catch (error) {
      console.error('Error fetching admins:', error);
      toast({
        title: "Error",
        description: "Failed to fetch admins",
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    
    // Special handling for contact number
    if (name === 'contact') {
      let formattedValue = value;
      // If user hasn't typed +94, add it
      if (!value.startsWith('+94') && value.length > 0) {
        formattedValue = '+94' + value.replace(/[^0-9]/g, '');
      }
      // Limit to +94 plus 9 digits
      if (formattedValue.length > 12) {
        formattedValue = formattedValue.slice(0, 12);
      }
      setFormData(prev => ({
        ...prev,
        contact: formattedValue
      }));
      return;
    }

    setFormData(prev => ({
      ...prev,
      [name.toLowerCase()]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: "Invalid file type",
        description: "Please upload an image file",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Image must be less than 5MB",
        variant: "destructive",
      });
      return;
    }

    setProfileImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validate NIC format
      if (!/^\d{12}$/.test(formData.nic)) {
        throw new Error('NIC must be 12 digits');
      }

      // Validate contact format
      if (!/^\+94\d{9}$/.test(formData.contact)) {
        throw new Error('Contact must be in format: +94XXXXXXXXX');
      }

      // Validate email format
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
        throw new Error('Invalid email format');
      }

      const submitData = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        submitData.append(key, value.toString());
      });

      if (profileImage) {
        submitData.append('profile_image', profileImage);
      }

      const response = await fetch('/api/admins', {
        method: 'POST',
        body: submitData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create admin');
      }

      toast({
        title: "Success",
        description: "Admin created successfully",
      });

      // Reset form
      setFormData({
        name: '',
        nic: '',
        contact: '',
        email: '',
        username: '',
        password: '',
        is_super_admin: false,
      });
      setProfileImage(null);
      setImagePreview(null);

      // Refresh admins list
      fetchAdmins();
    } catch (error: any) {
      console.error('Error creating admin:', error);
      toast({
        title: "Error",
        description: error.message || 'Failed to create admin',
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setFormData({
      name: '',
      nic: '',
      contact: '',
      email: '',
      username: '',
      password: '',
      is_super_admin: false,
    });
    setProfileImage(null);
    setImagePreview(null);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Add Admin</h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <StatCard
            title="Total Admins"
            value={admins.length}
            icon={UserPlus}
          />

          <Card className="mt-6">
            <div className="p-6">
              <h3 className="text-lg font-medium mb-4">Admins Table</h3>
              <DataTable
                columns={columns}
                data={admins}
                onRowClick={setSelectedAdmin}
              />
            </div>
          </Card>
        </div>

        <div>
          {selectedAdmin && (
            <Card className="mb-6">
              <div className="p-6">
                <h3 className="text-lg font-medium mb-4">Admin Details</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="font-medium">{selectedAdmin.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Username</p>
                    <p className="font-medium">{selectedAdmin.username}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium">{selectedAdmin.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Contact</p>
                    <p className="font-medium">{selectedAdmin.contact}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Super Admin</p>
                    <p className="font-medium">
                      {selectedAdmin.is_super_admin ? 'Yes' : 'No'}
                    </p>
                  </div>
                </div>
              </div>
            </Card>
          )}

          <Card className="p-6">
            <h3 className="text-lg font-medium mb-4">Add New Admin</h3>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input
                  name="name"
                  placeholder="Admin Name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  name="nic"
                  placeholder="NIC (12 digits)"
                  value={formData.nic}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  name="contact"
                  placeholder="Contact Number"
                  value={formData.contact}
                  onChange={handleInputChange}
                  required
                  minLength={12}
                  maxLength={12}
                  pattern="^\+94\d{9}$"
                  title="Contact number must be in format: +94XXXXXXXXX"
                />
                <Input
                  name="email"
                  type="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  name="username"
                  placeholder="Username"
                  value={formData.username}
                  onChange={handleInputChange}
                  required
                />
                <Input
                  name="password"
                  type="password"
                  placeholder="Password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                />
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    name="is_super_admin"
                    id="is_super_admin"
                    checked={formData.is_super_admin}
                    onChange={handleInputChange}
                    className="h-4 w-4"
                  />
                  <label htmlFor="is_super_admin">Super Admin</label>
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Profile Image
                  </label>
                  <div className="flex items-center space-x-4">
                    {imagePreview && (
                      <div className="relative w-20 h-20">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="w-full h-full object-cover rounded-full"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            setProfileImage(null);
                            setImagePreview(null);
                          }}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          ×
                        </button>
                      </div>
                    )}
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="block w-full text-sm text-gray-500
                        file:mr-4 file:py-2 file:px-4
                        file:rounded-full file:border-0
                        file:text-sm file:font-semibold
                        file:bg-blue-50 file:text-blue-700
                        hover:file:bg-blue-100"
                    />
                  </div>
                  <p className="mt-1 text-sm text-gray-500">
                    Maximum file size: 5MB. Supported formats: JPG, PNG, GIF
                  </p>
                </div>
              </div>
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClear}
                  disabled={loading}
                >
                  Clear
                </Button>
                <Button
                  type="submit"
                  className="bg-green-600 hover:bg-green-700"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      </div>
    </div>
  );
}