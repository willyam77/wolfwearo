import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

export default function About() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <main className="pt-24 pb-12">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto space-y-12">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-center space-y-6"
            >
              <h1 className="text-4xl md:text-6xl font-bold text-primary">The Wolf Philosophy</h1>
              <p className="text-xl text-muted-foreground leading-relaxed">
                "In a world of noise, silence is the loudest statement."
              </p>
            </motion.div>

            <div className="prose prose-invert max-w-none space-y-8">
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                className="bg-card border border-border p-8 rounded-lg"
              >
                <h2 className="text-2xl font-bold mb-4 text-foreground">Our Origins</h2>
                <p className="text-muted-foreground leading-relaxed">
                  Wolf Wear was born from a desire to reclaim the elegance of the past while embracing the boldness of the future. We noticed a gap in the market for clothing that speaks to the intellectual, the observer, and the leader. Our designs are inspired by the dark academia aesthetic—libraries, rainy days, classic literature, and the pursuit of knowledge.
                </p>
              </motion.div>

              <div className="grid md:grid-cols-2 gap-8">
                <motion.div 
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="bg-card border border-border p-8 rounded-lg"
                >
                  <h2 className="text-2xl font-bold mb-4 text-foreground">Craftsmanship</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    We believe that true luxury lies in longevity. Every stitch is placed with intention, every fabric chosen for its texture and durability. We reject fast fashion in favor of timeless pieces that age gracefully with you.
                  </p>
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="bg-card border border-border p-8 rounded-lg"
                >
                  <h2 className="text-2xl font-bold mb-4 text-foreground">The Aura</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    Clothing is an extension of your aura. When you wear Wolf Wear, you are not just covering your body; you are projecting an image of confidence, intelligence, and mystery. It is armor for the modern world.
                  </p>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}