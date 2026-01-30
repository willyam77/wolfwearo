import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import MissionSection from "@/components/MissionSection";
import ProductList from "@/components/ProductList";
import EmailSubscription from "@/components/EmailSubscription";
import Footer from "@/components/Footer";

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navbar />
      <HeroSection />
      <MissionSection />
      <ProductList limit={3} />
      <EmailSubscription />
      <Footer />
    </div>
  );
}