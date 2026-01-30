import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Success() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md w-full bg-card border border-border rounded-lg p-8 text-center space-y-6"
        >
          <div className="flex justify-center">
            <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center">
              <CheckCircle className="h-10 w-10 text-primary" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h1 className="text-3xl font-bold">Payment Successful</h1>
            <p className="text-muted-foreground">
              Thank you for your purchase. Your order has been confirmed and will be shipped shortly.
            </p>
          </div>

          <div className="pt-4">
            <Button onClick={() => navigate("/")} className="w-full" size="lg">
              Continue Shopping
            </Button>
          </div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}