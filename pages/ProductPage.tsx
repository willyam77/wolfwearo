import { useParams, useNavigate } from "react-router-dom";
import { useQuery, useAction } from "convex/react";
import { api } from "@/convex/_generated/api";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Check, CreditCard, ZoomIn, Sparkles, Star } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { useCart } from "@/lib/cart-context";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";

// Zoomable Image Component moved outside
const ZoomableImage = ({ src, alt }: { src: string, alt: string }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const imageRef = useRef<HTMLImageElement>(null);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!imageRef.current) return;
    const { left, top, width, height } = imageRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setPosition({ x, y });
  };

  return (
    <div 
      className="relative w-full h-full overflow-hidden rounded-lg cursor-crosshair bg-card"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseMove={handleMouseMove}
    >
      <img
        ref={imageRef}
        src={src}
        alt={alt}
        className={`w-full h-full object-cover transition-transform duration-200 ${isHovered ? 'scale-150' : 'scale-100'}`}
        style={isHovered ? { transformOrigin: `${position.x}% ${position.y}%` } : undefined}
      />
      {!isHovered && (
        <div className="absolute bottom-4 right-4 bg-black/50 text-white p-2 rounded-full pointer-events-none">
          <ZoomIn className="h-4 w-4" />
        </div>
      )}
    </div>
  );
};

export default function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const product = useQuery(api.products.getBySlug, { slug: slug || "" });
  const allProducts = useQuery(api.products.list);
  const createCheckoutSession = useAction(api.stripe.createCheckoutSession);
  const { addToCart } = useCart();
  
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Fetch inventory to get available sizes and colors
  const inventory = useQuery(api.products.getInventory, product ? { productId: product._id } : "skip");
  
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [availableColors, setAvailableColors] = useState<string[]>([]);

  useEffect(() => {
    if (inventory) {
      // Extract unique colors
      const colors = Array.from(new Set(
        inventory
          .filter(item => item.stock > 0 && item.color)
          .map(item => item.color)
      ));
      setAvailableColors(colors);
      
      // If we have colors but none selected, select the first one? 
      // Or let user select. For now, let's just filter sizes based on selection.
      
      const relevantInventory = selectedColor 
        ? inventory.filter(item => item.color === selectedColor)
        : inventory;

      // Extract unique sizes from relevant inventory where stock > 0
      const sizes = Array.from(new Set(
        relevantInventory
          .filter(item => item.stock > 0)
          .map(item => item.size)
      ));
      setAvailableSizes(sizes);
      
      // If selected size is no longer available in new color, deselect it
      if (selectedSize && !sizes.includes(selectedSize)) {
        setSelectedSize(null);
      }
    }
  }, [inventory, selectedColor]);

  if (product === undefined) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (product === null) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4">
        <h1 className="text-2xl font-bold">Product not found</h1>
        <Button onClick={() => navigate("/")}>Go Home</Button>
      </div>
    );
  }

  const handleAddToCart = () => {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }
    if (availableColors.length > 0 && !selectedColor) {
      toast.error("Please select a color");
      return;
    }
    
    if (product) {
      addToCart({
        productId: product._id,
        name: product.name,
        price: product.price,
        image: product.images[0],
        size: selectedSize,
        color: selectedColor || undefined,
        quantity: 1,
      });
      
      toast.success("Added to cart", {
        description: `${product.name} (${selectedSize}${selectedColor ? `, ${selectedColor}` : ''}) added to your cart.`,
      });
    }
  };

  const handleBuyNow = async () => {
    if (!selectedSize) {
      toast.error("Please select a size");
      return;
    }
    if (availableColors.length > 0 && !selectedColor) {
      toast.error("Please select a color");
      return;
    }
    
    setIsCheckingOut(true);
    try {
      // Note: Stripe checkout session creation might need update to handle color metadata if needed
      // For now passing product ID is enough, but we might want to pass specific variation info in future
      const url = await createCheckoutSession({ 
        productId: product._id,
        domain: window.location.origin,
        size: selectedSize,
        color: selectedColor || undefined
      });
      if (url) {
        window.location.href = url;
      } else {
        throw new Error("No checkout URL returned");
      }
    } catch (error) {
      console.error(error);
      toast.error("Failed to initiate checkout: " + (error instanceof Error ? error.message : "Unknown error"));
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handleAiTryOn = () => {
    if (product) {
      navigate(`/stylist?productId=${product._id}`);
    }
  };

  // Filter for "More Products"
  const moreProducts = allProducts 
    ? allProducts.filter(p => p._id !== product?._id).slice(0, 4) 
    : [];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <Button 
          variant="ghost" 
          className="mb-8 pl-0 hover:pl-2 transition-all"
          onClick={() => navigate("/")}
        >
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to Collection
        </Button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          {/* Image Section with Carousel and Zoom */}
          <div className="space-y-4">
            <Carousel className="w-full">
              <CarouselContent>
                {product.images.map((img: string, index: number) => (
                  <CarouselItem key={index}>
                    <div className="aspect-[3/4] w-full">
                      <ZoomableImage src={img} alt={`${product.name} view ${index + 1}`} />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {product.images.length > 1 && (
                <>
                  <CarouselPrevious className="left-2" />
                  <CarouselNext className="right-2" />
                </>
              )}
            </Carousel>
            
            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-2">
                {product.images.map((img: string, i: number) => (
                  <div 
                    key={i} 
                    className="w-20 aspect-square rounded-md overflow-hidden border border-border cursor-pointer hover:border-primary flex-shrink-0"
                  >
                    <img src={img} alt={`${product.name} thumbnail ${i}`} className="w-full h-full object-cover" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Details Section */}
          <div className="space-y-8">
            <div>
              <Badge variant="outline" className="mb-4">{product.category}</Badge>
              <h1 className="text-4xl font-bold mb-2">{product.name}</h1>
              <div className="flex items-baseline gap-3">
                <p className="text-2xl font-bold text-primary">${product.price}</p>
                {product.beforePrice && (
                  <p className="text-lg text-muted-foreground line-through">${product.beforePrice}</p>
                )}
              </div>
            </div>

            <div className="prose prose-invert">
              <p className="text-muted-foreground text-lg leading-relaxed">
                {product.description}
              </p>
            </div>

            <div className="space-y-6">
              {/* Color Selection */}
              {availableColors.length > 0 && (
                <div className="space-y-3">
                  <label className="text-sm font-medium">Select Color</label>
                  <div className="flex flex-wrap gap-3">
                    {availableColors.map((color) => (
                      <button
                        key={color}
                        onClick={() => setSelectedColor(color)}
                        className={`
                          px-4 py-2 rounded-md border transition-all text-sm font-medium
                          ${selectedColor === color 
                            ? "border-primary bg-primary/10 text-primary ring-1 ring-primary" 
                            : "border-input hover:border-primary/50"}
                        `}
                      >
                        {color}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Size Selection */}
              <div className="space-y-3">
                <label className="text-sm font-medium">Select Size</label>
                {availableSizes.length > 0 ? (
                  <div className="flex flex-wrap gap-3">
                    {availableSizes.map((size) => (
                      <button
                        key={size}
                        onClick={() => setSelectedSize(size)}
                        className={`
                          w-12 h-12 rounded-md border flex items-center justify-center transition-all
                          ${selectedSize === size 
                            ? "border-primary bg-primary/10 text-primary ring-1 ring-primary" 
                            : "border-input hover:border-primary/50"}
                        `}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground italic">
                    {selectedColor 
                      ? "No sizes available for this color." 
                      : "No sizes available currently."}
                  </p>
                )}
              </div>
            </div>

            <div className="pt-8 border-t border-border flex flex-col gap-4">
              <Button size="lg" className="w-full" onClick={handleBuyNow} disabled={isCheckingOut || availableSizes.length === 0}>
                {isCheckingOut ? <Loader2 className="h-4 w-4 animate-spin" /> : <><CreditCard className="mr-2 h-4 w-4" /> Buy Now</>}
              </Button>
              <div className="grid grid-cols-2 gap-4">
                <Button size="lg" variant="outline" className="w-full" onClick={handleAddToCart} disabled={availableSizes.length === 0}>
                  Add to Cart
                </Button>
                <Button size="lg" variant="secondary" className="w-full bg-white/10 hover:bg-white/20 text-white border border-white/20" onClick={handleAiTryOn}>
                  <Sparkles className="mr-2 h-4 w-4" /> AI Try-On
                </Button>
              </div>
            </div>

            <div className="bg-secondary/20 p-6 rounded-lg space-y-4">
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium">Premium Materials</h4>
                  <p className="text-sm text-muted-foreground">Crafted from the finest ethically sourced fabrics.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Check className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <h4 className="font-medium">Free Shipping Worldwide</h4>
                  <p className="text-sm text-muted-foreground">Estimated delivery: 5-8 business days</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Rich Description Section */}
        {product.descriptionImage && (
          <div className="mb-16 max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Product Details</h2>
            <div className="rounded-lg overflow-hidden border border-border bg-card">
              <img 
                src={product.descriptionImage} 
                alt="Product Details" 
                className="w-full h-auto"
              />
            </div>
          </div>
        )}

        {/* Customer Reviews Section */}
        <div className="mb-16 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold mb-8">Customer Reviews</h2>
          <div className="grid gap-6 md:grid-cols-2">
            {[
              { name: "Alex M.", rating: 5, text: "Absolutely stunning quality. The fit is perfect and the material feels luxurious." },
              { name: "Sarah K.", rating: 5, text: "Exactly what I was looking for. The dark academia vibe is spot on." },
              { name: "James R.", rating: 4, text: "Great shirt, shipping was faster than expected. Will buy again." },
              { name: "Emily W.", rating: 5, text: "The AI try-on feature helped me pick the right size. Fits like a glove!" }
            ].map((review, i) => (
              <div key={i} className="bg-card border border-border p-6 rounded-lg">
                <div className="flex items-center gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className={`h-4 w-4 ${j < review.rating ? "text-yellow-500 fill-yellow-500" : "text-muted-foreground"}`} />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4">"{review.text}"</p>
                <p className="font-medium text-sm">- {review.name}</p>
              </div>
            ))}
          </div>
        </div>

        {/* More Products Section */}
        {moreProducts.length > 0 && (
          <div className="border-t border-border pt-16">
            <h2 className="text-2xl font-bold mb-8">You May Also Like</h2>
            <Carousel
              opts={{
                align: "start",
                loop: true,
              }}
              className="w-full"
            >
              <CarouselContent className="-ml-4">
                {moreProducts.map((p) => (
                  <CarouselItem key={p._id} className="pl-4 basis-full md:basis-1/3 lg:basis-1/4">
                    <div 
                      className="group cursor-pointer h-full"
                      onClick={() => navigate(`/product/${p.slug}`)}
                    >
                      <div className="aspect-[3/4] bg-secondary/10 rounded-lg overflow-hidden mb-4 relative">
                        <img 
                          src={p.images[0]} 
                          alt={p.name} 
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        {p.inventory && p.inventory.reduce((acc: number, item: any) => acc + item.stock, 0) === 0 && (
                          <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                            <span className="text-white font-medium px-3 py-1 border border-white/30 rounded-full backdrop-blur-sm">
                              Out of Stock
                            </span>
                          </div>
                        )}
                      </div>
                      <h3 className="font-medium truncate">{p.name}</h3>
                      <div className="flex items-baseline gap-2">
                        <p className="text-muted-foreground">${p.price}</p>
                        {p.beforePrice && (
                          <p className="text-xs text-muted-foreground line-through">${p.beforePrice}</p>
                        )}
                      </div>
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              <CarouselPrevious className="left-0 md:-left-12" />
              <CarouselNext className="right-0 md:-right-12" />
            </Carousel>
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}