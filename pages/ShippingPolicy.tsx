import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Truck, Globe, Clock, MapPin } from "lucide-react";

export default function ShippingPolicy() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">Shipping Policy</h1>
          
          <div className="grid gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Globe className="h-6 w-6" />
                </div>
                <CardTitle>Free Worldwide Shipping</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  We are proud to offer free shipping on all orders, regardless of where you live. 
                  Whether you are in New York, London, Tokyo, or anywhere else, we will deliver your Wolf Wear items to your doorstep at no extra cost.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Clock className="h-6 w-6" />
                </div>
                <CardTitle>Processing Time</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  All orders are processed within 1-3 business days. Orders are not shipped or delivered on weekends or holidays.
                  If we are experiencing a high volume of orders, shipments may be delayed by a few days. Please allow additional days in transit for delivery.
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  <Truck className="h-6 w-6" />
                </div>
                <CardTitle>Shipping Estimates</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <p>
                  Our standard estimated delivery time is <strong>5-8 business days</strong>.
                </p>
                <div className="flex items-start gap-3 p-4 bg-muted/50 rounded-lg mt-4">
                  <MapPin className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                  <p className="text-sm">
                    Please note that delivery times may vary depending on your specific shipping address, local customs processing, and current shipping conditions. Remote areas may require additional time for delivery.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}