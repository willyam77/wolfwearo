import Navbar from "@/components/Navbar";
import ProductList from "@/components/ProductList";
import Footer from "@/components/Footer";
import EmailSubscription from "@/components/EmailSubscription";
import { motion } from "framer-motion";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";

export default function Collection() {
  const collectionBg = useQuery(api.settings.get, { key: "collection_hero_bg" });

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      <Navbar />
      <main className="pt-16 flex-1">
        <div className="relative bg-secondary/10 py-24 border-b border-border overflow-hidden">
          {/* Custom Background Media */}
          {collectionBg && (
            <div className="absolute inset-0 z-0">
              {collectionBg.type === "video" ? (
                <video 
                  src={collectionBg.url} 
                  className="w-full h-full object-cover opacity-50"
                  autoPlay muted loop playsInline
                />
              ) : (
                <img 
                  src={collectionBg.url} 
                  className="w-full h-full object-cover opacity-50"
                  alt="Collection Hero"
                />
              )}
              {/* Overlay */}
              <div className="absolute inset-0 bg-black/60" />
            </div>
          )}

          <div className="container mx-auto px-4 text-center relative z-10">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl md:text-6xl font-bold mb-4 text-white drop-shadow-lg"
            >
              The Collection
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="text-gray-200 max-w-2xl mx-auto text-lg drop-shadow-md"
            >
              Curated pieces for the modern intellectual.
            </motion.p>
          </div>
        </div>
        <ProductList withFilters={true} />
      </main>
      <EmailSubscription />
      <Footer />
    </div>
  );
}