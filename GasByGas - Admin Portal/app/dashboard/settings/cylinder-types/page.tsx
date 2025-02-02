"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { Loader2 } from "lucide-react";

interface CylinderType {
  type_id: number;
  name: string;
  description: string | null;
  weight_kg: number;
  price: number;
}

export default function CylinderTypesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [cylinderTypes, setCylinderTypes] = useState<CylinderType[]>([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    weight_kg: "",
    price: "",
  });

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

    fetchCylinderTypes();
  }, [session, status, router]);

  const fetchCylinderTypes = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/cylinder-types");
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to fetch cylinder types");
      }
      
      const data = await response.json();
      setCylinderTypes(Array.isArray(data) ? data : []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to fetch cylinder types",
        variant: "destructive",
      });
      setCylinderTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch("/api/cylinder-types", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name.trim(),
          description: formData.description.trim() || null,
          weight_kg: parseFloat(formData.weight_kg),
          price: parseFloat(formData.price),
        }),
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to add cylinder type");
      }

      toast({
        title: "Success",
        description: "Cylinder type added successfully",
      });
      setOpen(false);
      setFormData({ name: "", description: "", weight_kg: "", price: "" });
      fetchCylinderTypes();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to add cylinder type",
        variant: "destructive",
      });
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!session?.user?.isSuperAdmin) {
    return null;
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Cylinder Types</h1>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button>Add New Cylinder Type</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Cylinder Type</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  required
                  maxLength={20}
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  maxLength={100}
                  value={formData.description}
                  onChange={(e) =>
                    setFormData({ ...formData, description: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Weight (kg)</label>
                <Input
                  required
                  type="number"
                  step="0.01"
                  value={formData.weight_kg}
                  onChange={(e) =>
                    setFormData({ ...formData, weight_kg: e.target.value })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Price</label>
                <Input
                  required
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) =>
                    setFormData({ ...formData, price: e.target.value })
                  }
                />
              </div>
              <Button type="submit" className="w-full">
                Add Cylinder Type
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Weight (kg)</TableHead>
            <TableHead>Price</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {Array.isArray(cylinderTypes) && cylinderTypes.length > 0 ? (
            cylinderTypes.map((type) => (
              <TableRow key={type.type_id}>
                <TableCell>{type.name}</TableCell>
                <TableCell>{type.description}</TableCell>
                <TableCell>{Number(type.weight_kg).toFixed(2)}</TableCell>
                <TableCell>RS{Number(type.price).toFixed(2)}</TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-4">
                No cylinder types found
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  );
}
