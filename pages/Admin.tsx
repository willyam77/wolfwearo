import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2, Plus, Trash2, RefreshCw, Pencil, X, Upload, Settings, Lock } from "lucide-react";
import Navbar from "@/components/Navbar";
import { Id } from "@/convex/_generated/dataModel";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SalesAnalytics } from "@/components/admin/SalesAnalytics";
import { SiteCustomization } from "@/components/admin/SiteCustomization";

export default function Admin() {
  const products = useQuery(api.products.list);
  const subscriptions = useQuery(api.subscriptions.list);
  const orders = useQuery(api.orders.list);
  const users = useQuery(api.users.list);
  const messages = useQuery(api.messages.list);
  const createProduct = useMutation(api.products.create);
  const updateProduct = useMutation(api.products.update);
  const deleteProduct = useMutation(api.products.remove);
  const seedProducts = useMutation(api.seed.seedProducts);
  const generateUploadUrl = useMutation(api.products.generateUploadUrl);
  const updateOrderStatus = useMutation(api.orders.adminUpdateStatus);
  const markMessageAsRead = useMutation(api.messages.markAsRead);
  
  // Settings
  const comingSoonSetting = useQuery(api.settings.get, { key: "coming_soon" });
  const updateSetting = useMutation(api.settings.set);

  // Auth State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");

  const [isCreating, setIsCreating] = useState(false);
  const [editingId, setEditingId] = useState<Id<"products"> | null>(null);
  
  // Inventory fetching for editing
  const inventoryData = useQuery(api.products.getInventory, editingId ? { productId: editingId } : "skip");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    descriptionImage: "",
    price: "",
    beforePrice: "",
    category: "",
    images: [] as string[], // Stores existing image IDs/URLs
    slug: "",
  });

  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  
  const [descriptionImageFile, setDescriptionImageFile] = useState<File | null>(null);
  const [descriptionImagePreview, setDescriptionImagePreview] = useState<string | null>(null);

  const [variations, setVariations] = useState<{size: string, color: string, stock: number}[]>([]);

  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (inventoryData) {
      setVariations(inventoryData.map(item => ({
        size: item.size,
        color: item.color,
        stock: item.stock
      })));
    }
  }, [inventoryData]);

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      descriptionImage: "",
      price: "",
      beforePrice: "",
      category: "",
      images: [],
      slug: "",
    });
    setNewFiles([]);
    setPreviewUrls([]);
    setDescriptionImageFile(null);
    setDescriptionImagePreview(null);
    setVariations([]);
    setEditingId(null);
  };

  const handleEditClick = (product: any) => {
    setEditingId(product._id);
    setFormData({
      name: product.name,
      description: product.description,
      descriptionImage: product.descriptionImage || "",
      price: product.price.toString(),
      beforePrice: product.beforePrice ? product.beforePrice.toString() : "",
      category: product.category,
      images: product.savedImages || [], // Use savedImages (raw IDs) if available
      slug: product.slug,
    });
    setNewFiles([]);
    setPreviewUrls([]);
    setDescriptionImageFile(null);
    setDescriptionImagePreview(product.descriptionImage || null);
    // Variations will be populated by the useEffect when inventoryData loads
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      setNewFiles(prev => [...prev, ...files]);
      
      const newPreviews = files.map(file => URL.createObjectURL(file));
      setPreviewUrls(prev => [...prev, ...newPreviews]);
    }
  };

  const handleDescriptionImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setDescriptionImageFile(file);
      setDescriptionImagePreview(URL.createObjectURL(file));
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files) {
      const files = Array.from(e.dataTransfer.files).filter(file => file.type.startsWith('image/'));
      if (files.length > 0) {
        setNewFiles(prev => [...prev, ...files]);
        const newPreviews = files.map(file => URL.createObjectURL(file));
        setPreviewUrls(prev => [...prev, ...newPreviews]);
        toast.success(`Added ${files.length} image(s)`);
      }
    }
  };

  const removeNewFile = (index: number) => {
    setNewFiles(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index: number) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const addVariation = () => {
    setVariations([...variations, { size: "", color: "", stock: 0 }]);
  };

  const removeVariation = (index: number) => {
    setVariations(variations.filter((_, i) => i !== index));
  };

  const updateVariation = (index: number, field: keyof typeof variations[0], value: string | number) => {
    const newVariations = [...variations];
    newVariations[index] = { ...newVariations[index], [field]: value };
    setVariations(newVariations);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (username === "willyam" && password === "willyam77") {
      setIsAuthenticated(true);
      toast.success("Welcome back, Admin");
    } else {
      toast.error("Invalid credentials");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      // 1. Upload new files
      const uploadedImageIds: string[] = [];
      for (const file of newFiles) {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": file.type },
          body: file,
        });
        const { storageId } = await result.json();
        uploadedImageIds.push(storageId);
      }

      // Upload description image if exists
      let descriptionImageId = formData.descriptionImage;
      if (descriptionImageFile) {
        const postUrl = await generateUploadUrl();
        const result = await fetch(postUrl, {
          method: "POST",
          headers: { "Content-Type": descriptionImageFile.type },
          body: descriptionImageFile,
        });
        const { storageId } = await result.json();
        descriptionImageId = storageId;
      }

      // 2. Combine images
      const finalImages = [...formData.images, ...uploadedImageIds];

      const productData = {
        name: formData.name,
        description: formData.description,
        descriptionImage: descriptionImageId,
        price: Number(formData.price),
        beforePrice: formData.beforePrice ? Number(formData.beforePrice) : undefined,
        category: formData.category,
        images: finalImages,
        slug: formData.slug || formData.name.toLowerCase().replace(/\s+/g, "-"),
        inventory: variations,
      };

      if (editingId) {
        await updateProduct({
          id: editingId,
          ...productData,
        });
        toast.success("Product updated successfully");
      } else {
        await createProduct(productData);
        toast.success("Product created successfully");
      }
      resetForm();
    } catch (error) {
      console.error(error);
      toast.error(editingId ? "Failed to update product" : "Failed to create product");
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteProduct = async (id: any) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteProduct({ id });
      toast.success("Product deleted");
    } catch (error) {
      toast.error("Failed to delete product");
    }
  };

  const handleSeed = async () => {
    try {
      await seedProducts({});
      toast.success("Database seeded with initial products");
    } catch (error) {
      toast.error("Failed to seed database");
    }
  };

  const toggleComingSoon = async (checked: boolean) => {
    try {
      await updateSetting({ key: "coming_soon", value: checked });
      toast.success(`Coming Soon mode ${checked ? "enabled" : "disabled"}`);
    } catch (error) {
      toast.error("Failed to update setting");
    }
  };

  const handleStatusChange = async (orderId: Id<"orders">, newStatus: string) => {
    try {
      await updateOrderStatus({ id: orderId, status: newStatus });
      toast.success("Order status updated");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update order status");
    }
  };

  const handleMarkAsRead = async (id: any) => {
    try {
      await markMessageAsRead({ id });
      toast.success("Message marked as read");
    } catch (error) {
      toast.error("Failed to update message");
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="w-full max-w-md border-border bg-card">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center flex items-center justify-center gap-2">
              <Lock className="h-6 w-6 text-primary" /> Admin Access
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Username</label>
                <Input 
                  type="text" 
                  value={username} 
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="bg-background"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Password</label>
                <Input 
                  type="password" 
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="bg-background"
                />
              </div>
              <Button type="submit" className="w-full">
                Login
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 bg-card border border-border px-4 py-2 rounded-lg">
              <Settings className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Coming Soon Mode</span>
              <Switch 
                checked={comingSoonSetting === true}
                onCheckedChange={toggleComingSoon}
                disabled={comingSoonSetting === undefined}
              />
            </div>
            <Button variant="outline" onClick={handleSeed}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Seed Database
            </Button>
          </div>
        </div>

        <Tabs defaultValue="dashboard">
          <TabsList className="mb-8">
            <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
            <TabsTrigger value="products">Products</TabsTrigger>
            <TabsTrigger value="orders">Orders</TabsTrigger>
            <TabsTrigger value="inventory">Inventory</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="subscriptions">Subscriptions</TabsTrigger>
            <TabsTrigger value="messages">Messages</TabsTrigger>
            <TabsTrigger value="customization">Customization</TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard">
             <SalesAnalytics orders={orders} />
          </TabsContent>

          <TabsContent value="customization">
            <SiteCustomization />
          </TabsContent>

          <TabsContent value="products">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Product List</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {!products ? (
                      <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                    ) : (
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Image</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Price</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {products.map((product) => (
                            <TableRow key={product._id}>
                              <TableCell>
                                <div className="h-10 w-10 rounded overflow-hidden bg-muted">
                                  {product.images[0] && (
                                    <img src={product.images[0]} alt={product.name} className="h-full w-full object-cover" />
                                  )}
                                </div>
                              </TableCell>
                              <TableCell className="font-medium">{product.name}</TableCell>
                              <TableCell>${product.price}</TableCell>
                              <TableCell>{product.category}</TableCell>
                              <TableCell className="text-right">
                                <div className="flex justify-end gap-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleEditClick(product)}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => handleDeleteProduct(product._id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-destructive" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div>
                <Card>
                  <CardHeader>
                    <CardTitle>{editingId ? "Edit Product" : "Add New Product"}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      {/* Basic Info */}
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Name</label>
                          <Input
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Slug</label>
                          <Input
                            value={formData.slug}
                            onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                            placeholder="auto-generated-from-name"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Price</label>
                            <Input
                              type="number"
                              value={formData.price}
                              onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                              required
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Before Price (Optional)</label>
                            <Input
                              type="number"
                              value={formData.beforePrice}
                              onChange={(e) => setFormData({ ...formData, beforePrice: e.target.value })}
                              placeholder="Original Price"
                            />
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium">Category</label>
                            <Input
                              value={formData.category}
                              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                              required
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Description</label>
                          <Textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Description Image (Replaces Rich Text)</label>
                          <div className="flex items-start gap-4">
                            <div className="flex-1">
                              <Input
                                type="file"
                                accept="image/*"
                                onChange={handleDescriptionImageSelect}
                                className="cursor-pointer"
                              />
                              <p className="text-xs text-muted-foreground mt-1">
                                Upload an image to be displayed as the detailed product description.
                              </p>
                            </div>
                            {descriptionImagePreview && (
                              <div className="w-24 h-24 border rounded-md overflow-hidden relative bg-muted">
                                <img 
                                  src={descriptionImagePreview} 
                                  alt="Description Preview" 
                                  className="w-full h-full object-cover"
                                />
                                <button
                                  type="button"
                                  onClick={() => {
                                    setDescriptionImageFile(null);
                                    setDescriptionImagePreview(null);
                                    setFormData(prev => ({ ...prev, descriptionImage: "" }));
                                  }}
                                  className="absolute top-0 right-0 bg-destructive text-white p-1 rounded-bl-md"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Images */}
                      <div className="space-y-4">
                        
                        {/* Existing Images */}
                        {formData.images.length > 0 && (
                          <div className="grid grid-cols-3 gap-2 mb-2">
                            {formData.images.map((img, index) => (
                              <div key={index} className="relative aspect-square rounded-md overflow-hidden border border-border group">
                                <img 
                                  src={img.startsWith("http") ? img : "https://placehold.co/100?text=Stored"} 
                                  alt="Existing" 
                                  className="w-full h-full object-cover" 
                                />
                                <button
                                  type="button"
                                  onClick={() => removeExistingImage(index)}
                                  className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}

                        {/* New File Upload */}
                        <div 
                          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                            isDragging ? "border-primary bg-primary/10" : "border-border hover:border-primary"
                          }`}
                          onClick={() => fileInputRef.current?.click()}
                          onDragOver={handleDragOver}
                          onDragLeave={handleDragLeave}
                          onDrop={handleDrop}
                        >
                          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            {isDragging ? "Drop images here" : "Click or drag images here to upload"}
                          </p>
                          <input 
                            type="file" 
                            ref={fileInputRef} 
                            className="hidden" 
                            multiple 
                            accept="image/*"
                            onChange={handleFileSelect}
                          />
                        </div>

                        {/* New File Previews */}
                        {previewUrls.length > 0 && (
                          <div className="grid grid-cols-3 gap-2 mt-2">
                            {previewUrls.map((url, index) => (
                              <div key={index} className="relative aspect-square rounded-md overflow-hidden border border-border group">
                                <img src={url} alt="Preview" className="w-full h-full object-cover" />
                                <button
                                  type="button"
                                  onClick={() => removeNewFile(index)}
                                  className="absolute top-1 right-1 bg-destructive text-destructive-foreground rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Variations / Inventory */}
                      <div className="space-y-4">
                        <div className="flex justify-between items-center">
                          <label className="text-sm font-medium">Variations (Inventory)</label>
                          <Button type="button" variant="outline" size="sm" onClick={addVariation}>
                            <Plus className="h-3 w-3 mr-1" /> Add Variant
                          </Button>
                        </div>
                        
                        <div className="space-y-2">
                          {variations.map((variation, index) => (
                            <div key={index} className="flex gap-2 items-end">
                              <div className="flex-1">
                                <label className="text-xs text-muted-foreground">Size</label>
                                <Input
                                  value={variation.size}
                                  onChange={(e) => updateVariation(index, "size", e.target.value)}
                                  placeholder="e.g. M"
                                />
                              </div>
                              <div className="flex-1">
                                <label className="text-xs text-muted-foreground">Color</label>
                                <Input
                                  value={variation.color}
                                  onChange={(e) => updateVariation(index, "color", e.target.value)}
                                  placeholder="e.g. Black"
                                />
                              </div>
                              <div className="w-20">
                                <label className="text-xs text-muted-foreground">Stock</label>
                                <Input
                                  type="number"
                                  value={variation.stock}
                                  onChange={(e) => updateVariation(index, "stock", Number(e.target.value))}
                                />
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeVariation(index)}
                                className="mb-0.5"
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ))}
                          {variations.length === 0 && (
                            <p className="text-sm text-muted-foreground italic text-center py-2">
                              No variations added.
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-4">
                        <Button type="submit" className="flex-1" disabled={isCreating}>
                          {isCreating ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>{editingId ? "Update Product" : "Create Product"}</>
                          )}
                        </Button>
                        {editingId && (
                          <Button type="button" variant="outline" onClick={resetForm}>
                            Cancel
                          </Button>
                        )}
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="inventory">
            <Card>
              <CardHeader>
                <CardTitle>Stock Management</CardTitle>
              </CardHeader>
              <CardContent>
                {!products ? (
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Product</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Color</TableHead>
                        <TableHead>Stock</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {products.flatMap((product) => 
                        (product.inventory || []).map((inv: any, idx: number) => (
                          <TableRow key={`${product._id}-${idx}`}>
                            <TableCell className="font-medium">{product.name}</TableCell>
                            <TableCell>{inv.size}</TableCell>
                            <TableCell>{inv.color}</TableCell>
                            <TableCell className="font-bold">{inv.stock}</TableCell>
                            <TableCell>
                              <span className={`text-xs px-2 py-1 rounded-full ${
                                inv.stock === 0 
                                  ? 'bg-zinc-800 text-white' 
                                  : inv.stock < 5 
                                  ? 'bg-yellow-100 text-yellow-800' 
                                  : 'bg-green-100 text-green-800'
                              }`}>
                                {inv.stock === 0 ? 'Out of Stock' : inv.stock < 5 ? 'Low Stock' : 'In Stock'}
                              </span>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                      {products.every((p) => !p.inventory || p.inventory.length === 0) && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                            No inventory data available. Add variations to products to track stock.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Order Management</CardTitle>
              </CardHeader>
              <CardContent>
                {!orders ? (
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Order ID</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Customer</TableHead>
                        <TableHead>Shipping Address</TableHead>
                        <TableHead>Items</TableHead>
                        <TableHead>Amount</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orders.map((order) => (
                        <TableRow key={order._id}>
                          <TableCell className="font-mono text-xs">{order._id}</TableCell>
                          <TableCell>{new Date(order._creationTime).toLocaleDateString()} {new Date(order._creationTime).toLocaleTimeString()}</TableCell>
                          <TableCell>
                            <div className="flex flex-col">
                              <span className="font-medium">{order.email || "Guest"}</span>
                              {order.userId && <span className="text-xs text-muted-foreground">Registered User</span>}
                            </div>
                          </TableCell>
                          <TableCell>
                            {order.shippingAddress ? (
                              <div className="text-xs space-y-0.5">
                                <p className="font-medium">{order.shippingAddress.name}</p>
                                <p>{order.shippingAddress.address?.line1}</p>
                                {order.shippingAddress.address?.line2 && <p>{order.shippingAddress.address.line2}</p>}
                                <p>
                                  {order.shippingAddress.address?.city}, {order.shippingAddress.address?.state} {order.shippingAddress.address?.postal_code}
                                </p>
                                <p>{order.shippingAddress.address?.country}</p>
                              </div>
                            ) : (
                              <span className="text-xs text-muted-foreground italic">No address provided</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="space-y-1">
                              {order.items.map((item, i) => (
                                <div key={i} className="text-sm flex items-center gap-2">
                                  <span className="font-medium">{item.quantity}x</span>
                                  <span>{item.name}</span>
                                  <span className="text-muted-foreground text-xs">({item.size})</span>
                                </div>
                              ))}
                            </div>
                          </TableCell>
                          <TableCell>${order.amount.toFixed(2)}</TableCell>
                          <TableCell>
                            <Select 
                              defaultValue={order.status} 
                              onValueChange={(value) => handleStatusChange(order._id, value)}
                            >
                              <SelectTrigger className="w-[130px] h-8">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="paid">Paid</SelectItem>
                                <SelectItem value="shipped">Shipped</SelectItem>
                                <SelectItem value="delivered">Delivered</SelectItem>
                                <SelectItem value="failed">Failed</SelectItem>
                              </SelectContent>
                            </Select>
                          </TableCell>
                        </TableRow>
                      ))}
                      {orders.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No orders found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="users">
            <Card>
              <CardHeader>
                <CardTitle>Registered Users</CardTitle>
              </CardHeader>
              <CardContent>
                {!users ? (
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Joined</TableHead>
                        <TableHead>ID</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {users.map((user) => (
                        <TableRow key={user._id}>
                          <TableCell>{user.name || "N/A"}</TableCell>
                          <TableCell>{user.email || "N/A"}</TableCell>
                          <TableCell>{new Date(user._creationTime).toLocaleDateString()}</TableCell>
                          <TableCell className="font-mono text-xs">{user._id}</TableCell>
                        </TableRow>
                      ))}
                      {users.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                            No users found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="subscriptions">
            <Card>
              <CardHeader>
                <CardTitle>Email Subscriptions & Users</CardTitle>
              </CardHeader>
              <CardContent>
                {!subscriptions ? (
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Email</TableHead>
                        <TableHead>Source</TableHead>
                        <TableHead>Date Joined</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {subscriptions.map((sub: any) => (
                        <TableRow key={sub._id}>
                          <TableCell>{sub.email}</TableCell>
                          <TableCell>
                            <span className={`text-xs px-2 py-1 rounded-full ${sub.source === 'user' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'}`}>
                              {sub.source === 'user' ? 'Registered User' : 'Newsletter'}
                            </span>
                          </TableCell>
                          <TableCell>{new Date(sub._creationTime).toLocaleDateString()}</TableCell>
                        </TableRow>
                      ))}
                      {subscriptions.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-8 text-muted-foreground">
                            No subscriptions yet.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="messages">
            <Card>
              <CardHeader>
                <CardTitle>Customer Messages</CardTitle>
              </CardHeader>
              <CardContent>
                {!messages ? (
                  <Loader2 className="h-8 w-8 animate-spin mx-auto" />
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Topic</TableHead>
                        <TableHead>Message</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {messages.map((msg) => (
                        <TableRow key={msg._id} className={msg.status === "new" ? "bg-secondary/5" : ""}>
                          <TableCell className="whitespace-nowrap">
                            {new Date(msg._creationTime).toLocaleDateString()}
                          </TableCell>
                          <TableCell>{msg.name}</TableCell>
                          <TableCell>{msg.email}</TableCell>
                          <TableCell>
                            <span className="capitalize px-2 py-1 rounded-full bg-secondary/20 text-xs">
                              {msg.topic.replace("_", " ")}
                            </span>
                          </TableCell>
                          <TableCell className="max-w-xs truncate" title={msg.message}>
                            {msg.message}
                          </TableCell>
                          <TableCell>
                            <span className={`text-xs px-2 py-1 rounded-full ${
                              msg.status === 'new' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'
                            }`}>
                              {msg.status}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            {msg.status === "new" && (
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => handleMarkAsRead(msg._id)}
                              >
                                Mark Read
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                      {messages.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                            No messages found.
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}