import { useState, useRef } from "react";
import { useQuery, useMutation, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, Upload, Sparkles, Shirt, ShoppingBag, History, Lock } from "lucide-react";
import { toast } from "sonner";
import { Id } from "@/convex/_generated/dataModel";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "@/lib/cart-context";

export default function AiStylist() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const preSelectedProductId = searchParams.get("productId");

  const { addToCart } = useCart();
  const user = useQuery(api.users.currentUser);
  const products = useQuery(api.products.list);
  const generateUploadUrl = useMutation(api.tryons.generateUploadUrl);
  const createTryOn = useMutation(api.tryons.create);
  const generateTryOnAction = useAction(api.ai.generateTryOn);
  const remainingAttempts = useQuery(api.tryons.getRemainingAttempts);
  const pastTryOns = useQuery(api.tryons.list);
  
  const [selectedProduct, setSelectedProduct] = useState<Id<"products"> | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [resultId, setResultId] = useState<Id<"tryOns"> | null>(null);
  
  const resultTryOn = useQuery(api.tryons.get, resultId ? { id: resultId } : "skip");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handle pre-selection
  if (preSelectedProductId && products && !selectedProduct) {
    const product = products.find(p => p._id === preSelectedProductId);
    if (product) {
      setSelectedProduct(product._id);
    }
  }

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleGenerate = async () => {
    if (!user) {
      toast.error("Please sign in to use the AI Stylist");
      navigate("/auth");
      return;
    }

    if (!selectedImage || !selectedProduct) {
      toast.error("Please select an image and a product");
      return;
    }

    if (remainingAttempts !== undefined && remainingAttempts <= 0) {
      toast.error("Daily limit reached. Please try again tomorrow.");
      return;
    }

    setIsGenerating(true);
    try {
      // 1. Get upload URL
      const postUrl = await generateUploadUrl();

      // 2. Upload image
      const result = await fetch(postUrl, {
        method: "POST",
        headers: { "Content-Type": selectedImage.type },
        body: selectedImage,
      });
      const { storageId } = await result.json();

      // 3. Create try-on record
      const tryOnId = await createTryOn({
        userImageStorageId: storageId,
        productId: selectedProduct,
      });
      setResultId(tryOnId);

      // 4. Trigger AI generation
      await generateTryOnAction({
        tryOnId,
        userImageStorageId: storageId,
        productId: selectedProduct,
      });

      toast.success("Styling in progress...");
    } catch (error) {
      console.error(error);
      toast.error("Failed to start generation: " + (error instanceof Error ? error.message : "Unknown error"));
      setIsGenerating(false);
    }
  };

  const handleAddToCart = () => {
    if (!resultTryOn?.productId || !products) return;
    const product = products.find(p => p._id === resultTryOn.productId);
    if (product) {
      addToCart({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        size: "One Size", // Default or prompt user
        quantity: 1
      });
      toast.success("Added to cart");
    }
  };

  // Watch for completion
  if (resultTryOn?.status === "completed" && isGenerating) {
    setIsGenerating(false);
    toast.success("Your look is ready!");
  } else if (resultTryOn?.status === "failed" && isGenerating) {
    setIsGenerating(false);
    toast.error("Generation failed: " + resultTryOn.error);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-24 pb-12 container mx-auto px-4">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
            <Sparkles className="text-primary" /> AI Stylist
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-4">
            Upload your photo and see how our Dark Academia collection looks on you.
            Powered by Gemini AI.
          </p>
          
          {!user ? (
            <div className="mt-6 p-4 bg-secondary/10 border border-border rounded-lg inline-block">
              <p className="text-sm mb-3">Sign in to access 3 free daily AI try-ons</p>
              <Button onClick={() => navigate("/auth")}>
                <Lock className="mr-2 h-4 w-4" /> Sign In to Access
              </Button>
            </div>
          ) : (
            remainingAttempts !== undefined && (
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-secondary/20 rounded-full text-sm font-medium">
                <Sparkles className="h-4 w-4 text-primary" />
                <span>{remainingAttempts} tries remaining today</span>
              </div>
            )
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
          {/* Input Section */}
          <div className="space-y-8">
            <Card className={!user ? "opacity-50 pointer-events-none relative" : ""}>
              {!user && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-background/50 backdrop-blur-sm rounded-lg">
                  <Lock className="h-12 w-12 text-muted-foreground" />
                </div>
              )}
              <CardContent className="p-6 space-y-6">
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">1. Upload Your Photo</h3>
                  <div 
                    className="border-2 border-dashed border-border rounded-lg p-8 text-center cursor-pointer hover:border-primary transition-colors"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {previewUrl ? (
                      <div className="relative aspect-[3/4] max-h-[400px] mx-auto overflow-hidden rounded-md">
                        <img src={previewUrl} alt="Preview" className="object-cover w-full h-full" />
                      </div>
                    ) : (
                      <div className="py-12">
                        <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">Click to upload a full-body photo</p>
                      </div>
                    )}
                    <input 
                      type="file" 
                      ref={fileInputRef} 
                      className="hidden" 
                      accept="image/*"
                      onChange={handleImageSelect}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-xl font-semibold">2. Select a Product</h3>
                  {!products ? (
                    <Loader2 className="animate-spin" />
                  ) : (
                    <div className="grid grid-cols-3 gap-4">
                      {products.map((product) => (
                        <div 
                          key={product._id}
                          className={`
                            cursor-pointer border rounded-md overflow-hidden relative
                            ${selectedProduct === product._id ? "border-primary ring-2 ring-primary/50" : "border-border hover:border-primary/50"}
                          `}
                          onClick={() => setSelectedProduct(product._id)}
                        >
                          <div className="aspect-square">
                            <img src={product.images[1] || product.images[0]} alt={product.name} className="object-cover w-full h-full" />
                          </div>
                          <div className="p-2 text-xs font-medium truncate">{product.name}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <Button 
                  size="lg" 
                  className="w-full" 
                  onClick={handleGenerate}
                  disabled={isGenerating || !selectedImage || !selectedProduct || (remainingAttempts !== undefined && remainingAttempts <= 0)}
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Styling...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 h-4 w-4" /> Generate Look
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Result Section */}
          <div className="space-y-8">
            <Card className="h-full">
              <CardContent className="p-6 h-full flex flex-col">
                <h3 className="text-xl font-semibold mb-6">Your Look</h3>
                <div className="flex-1 bg-secondary/10 rounded-lg flex items-center justify-center border border-border overflow-hidden min-h-[400px] relative">
                  {resultTryOn?.generatedImageUrl ? (
                    <img 
                      src={resultTryOn.generatedImageUrl} 
                      alt="Generated Look" 
                      className="w-full h-full object-contain"
                    />
                  ) : isGenerating ? (
                    <div className="text-center space-y-4">
                      <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
                      <p className="text-muted-foreground animate-pulse">Consulting the AI stylist...</p>
                    </div>
                  ) : (
                    <div className="text-center text-muted-foreground">
                      <Shirt className="h-16 w-16 mx-auto mb-4 opacity-20" />
                      <p>Select a photo and product to see the magic</p>
                    </div>
                  )}
                </div>
                
                {resultTryOn?.generatedImageUrl && resultTryOn.productId && (
                  <div className="mt-6 grid grid-cols-2 gap-4">
                    <Button 
                      variant="outline"
                      size="lg"
                      onClick={() => {
                        const product = products?.find(p => p._id === resultTryOn.productId);
                        if (product) {
                          navigate(`/product/${product.slug}`);
                        }
                      }}
                    >
                      View Product
                    </Button>
                    <Button 
                      size="lg"
                      onClick={handleAddToCart}
                    >
                      <ShoppingBag className="mr-2 h-4 w-4" /> Buy Now
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* History Section */}
        {user && pastTryOns && pastTryOns.length > 0 && (
          <div className="space-y-6">
            <h2 className="text-2xl font-bold flex items-center gap-2">
              <History className="h-6 w-6" /> Past Styles
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {pastTryOns.map((tryOn) => (
                <Card key={tryOn._id} className="overflow-hidden">
                  <div className="aspect-[3/4] relative bg-secondary/10">
                    {tryOn.generatedImageUrl ? (
                      <img 
                        src={tryOn.generatedImageUrl} 
                        alt="Past Try On" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full text-muted-foreground text-xs">
                        {tryOn.status}
                      </div>
                    )}
                  </div>
                  <div className="p-2">
                    <p className="text-xs text-muted-foreground">
                      {new Date(tryOn._creationTime).toLocaleDateString()}
                    </p>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}