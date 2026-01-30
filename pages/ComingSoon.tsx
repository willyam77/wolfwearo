import { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { toast } from "sonner";
import { Loader2, Mail, Users, Sparkles, Zap, Bell } from "lucide-react";

export default function ComingSoon() {
  const subscribe = useMutation(api.subscriptions.subscribe);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsLoading(true);
    try {
      await subscribe({ email });
      setIsSubscribed(true);
      toast.success("Welcome to the pack.");
      setEmail("");
    } catch (error) {
      console.error(error);
      toast.error("Failed to subscribe. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  return (
    <div className="min-h-screen bg-[#050511] text-white overflow-x-hidden font-sans selection:bg-blue-500/30">
      <main className="pt-20 pb-20">
        {/* Subscription Section (Moved to Top) */}
        <section className="max-w-3xl mx-auto px-6 mb-32 text-center relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-blue-600/10 rounded-full blur-[100px] pointer-events-none" />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="relative z-10"
          >
            <div className="flex flex-col items-center justify-center mb-8 gap-4">
              <img 
                src="https://harmless-tapir-303.convex.cloud/api/storage/afb7214a-2574-4852-abbc-53a265af1ff1" 
                alt="Wolf Wear" 
                className="h-24 w-24 opacity-90" 
              />
              <span className="text-3xl font-bold tracking-tight text-white">Wolf Wear</span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-4">
              Get Ready to <span className="text-blue-500 text-glow">Aura Farm</span>
            </h2>
            
            <p className="text-lg text-gray-400 mb-12 max-w-xl mx-auto">
              Join the waiting list and be the first to experience the revolution in sophisticated fashion powered by AI technology.
            </p>

            <div className="bg-[#0f0f25] border border-white/10 p-8 rounded-3xl max-w-md mx-auto shadow-2xl shadow-blue-900/10">
              {isSubscribed ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-8"
                >
                  <div className="h-16 w-16 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Mail className="h-8 w-8 text-green-400" />
                  </div>
                  <p className="text-white font-medium text-lg">You are on the list.</p>
                  <p className="text-sm text-gray-400 mt-2">
                    Watch your inbox for the signal.
                  </p>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2 text-left">
                    <label className="text-xs font-medium text-gray-400 ml-1">EMAIL ADDRESS</label>
                    <Input
                      type="email"
                      placeholder="Enter your email address"
                      className="h-12 bg-[#050511] border-white/10 focus:border-blue-500 text-white placeholder:text-gray-600"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full h-12 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-base"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                      <>
                        <Mail className="mr-2 h-4 w-4" /> Join the Pack
                      </>
                    )}
                  </Button>
                  <p className="text-xs text-gray-500 mt-4">
                    Join 1,247 fashion enthusiasts already on the list. No spam, ever.
                  </p>
                </form>
              )}
            </div>
          </motion.div>
        </section>

        {/* What to Expect Section */}
        <section className="bg-[#0a0a1a] py-24 border-y border-white/5 mb-32">
          <div className="max-w-7xl mx-auto px-6">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="text-center mb-16"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-white">What to Expect</h2>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                {
                  icon: Users,
                  title: "Join the Pack",
                  desc: "Be the first to experience the revolution in Dark Academia fashion"
                },
                {
                  icon: Sparkles,
                  title: "Exclusive Access",
                  desc: "Get early access to limited edition collections and member-only benefits"
                },
                {
                  icon: Zap,
                  title: "AI Stylist",
                  desc: "Personalized fashion recommendations powered by advanced AI technology"
                },
                {
                  icon: Bell,
                  title: "Launch Updates",
                  desc: "Be the first to know when we go live with special launch offers"
                }
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: i * 0.1 }}
                  className="bg-[#0f0f25] border border-white/5 p-8 rounded-2xl hover:border-blue-500/30 transition-colors group"
                >
                  <div className="h-12 w-12 rounded-full bg-blue-500/10 flex items-center justify-center mb-6 group-hover:bg-blue-500/20 transition-colors">
                    <item.icon className="h-6 w-6 text-blue-400" />
                  </div>
                  <h3 className="text-lg font-bold text-white mb-3">{item.title}</h3>
                  <p className="text-sm text-gray-400 leading-relaxed">
                    {item.desc}
                  </p>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Hero Section */}
        <section className="max-w-4xl mx-auto px-6 mb-32">
          <motion.div 
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            variants={fadeIn}
            className="space-y-8"
          >
            <div className="inline-block px-4 py-1.5 rounded-full bg-blue-900/30 border border-blue-500/30 text-blue-400 text-xs font-semibold tracking-wider uppercase">
              Our Mission
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-white">
              Boost Your Aura
            </h1>

            <div className="space-y-6 text-lg md:text-xl text-gray-400 leading-relaxed max-w-3xl">
              <p>
                At Wolf Wear, we believe that clothing is more than fabric—it's a statement of presence, confidence, and intellectual elegance. As the first Dark Academia fashion brand, we're on a mission to revive the lost art of sophisticated dressing in the modern world.
              </p>
              <p>
                Our Aura Farming Collection is meticulously designed to enhance your natural charisma, whether you're commanding attention in business meetings, networking with industry leaders, or creating memorable impressions in romantic encounters. Each piece embodies the perfect fusion of classical aesthetics and contemporary functionality.
              </p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 py-12 border-t border-white/10 mt-12">
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-500 mb-2">100%</div>
                <div className="text-sm text-gray-400 uppercase tracking-wider">Premium Quality</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-500 mb-2">AI</div>
                <div className="text-sm text-gray-400 uppercase tracking-wider">Powered Styling</div>
              </div>
              <div className="text-center">
                <div className="text-4xl font-bold text-blue-500 mb-2">Limited</div>
                <div className="text-sm text-gray-400 uppercase tracking-wider">Edition</div>
              </div>
            </div>

            {/* Philosophy Box */}
            <div className="bg-[#0f0f25] border border-white/10 rounded-2xl p-8 md:p-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
              <h3 className="text-2xl font-bold text-blue-400 mb-4">The Wolf Philosophy</h3>
              <p className="text-gray-300 leading-relaxed">
                Like the wolf, we value strength, intelligence, and social elegance. Our designs embody the predator's confidence and the scholar's wisdom, creating a unique aesthetic that commands respect while inviting connection.
              </p>
            </div>
          </motion.div>
        </section>
      </main>

      <footer className="py-12 text-center text-sm text-gray-600 border-t border-white/5 bg-[#050511]">
        <div className="flex flex-col items-center justify-center gap-4 mb-6">
          <img 
            src="https://harmless-tapir-303.convex.cloud/api/storage/afb7214a-2574-4852-abbc-53a265af1ff1" 
            alt="Wolf Wear" 
            className="h-12 w-12 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all duration-300" 
          />
        </div>
        <p>© {new Date().getFullYear()} Wolf Wear. All rights reserved.</p>
      </footer>
    </div>
  );
}