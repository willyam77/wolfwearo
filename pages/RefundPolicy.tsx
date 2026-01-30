import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function RefundPolicy() {
  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 pt-24 pb-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center">Refund & Return Policy</h1>
          
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Our Policy</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 text-muted-foreground">
              <p>
                At Wolf Wear, we want you to be completely satisfied with your purchase. 
                If you are not happy with your order, we accept returns and refunds under the following conditions.
              </p>
              
              <div className="space-y-2">
                <h3 className="text-foreground font-semibold text-lg">Conditions for Return</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Items must be returned within 30 days of purchase.</li>
                  <li>Items must be unworn, unused, and in their original condition.</li>
                  <li>Items must have all original tags attached.</li>
                  <li>Proof of purchase is required.</li>
                </ul>
              </div>

              <div className="space-y-2">
                <h3 className="text-foreground font-semibold text-lg">How to Initiate a Return</h3>
                <p>
                  To start a return, please contact us via email at <a href="mailto:wolf.wear.classic@gmail.com" className="text-primary hover:underline">wolf.wear.classic@gmail.com</a> or 
                  message us on Instagram <a href="https://www.instagram.com/wolf.wear.classic/" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@wolf.wear.classic</a>.
                </p>
                <p>
                  Please provide your order number and the reason for the return. We will provide you with the return shipping address and further instructions.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-foreground font-semibold text-lg">Shipping Costs</h3>
                <p>
                  Please note that customers are responsible for return shipping costs. Shipping costs are non-refundable. 
                  If you receive a refund, the cost of return shipping will be deducted from your refund if a prepaid label was provided.
                </p>
              </div>

              <div className="space-y-2">
                <h3 className="text-foreground font-semibold text-lg">Refund Process</h3>
                <p>
                  Once your return is received and inspected, we will send you an email to notify you that we have received your returned item. 
                  We will also notify you of the approval or rejection of your refund.
                </p>
                <p>
                  If you are approved, then your refund will be processed, and a credit will automatically be applied to your credit card or original method of payment, within a certain amount of days.
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
