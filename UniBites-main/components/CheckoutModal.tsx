import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";
import { CheckCircle, CreditCard, Wallet, Clock, User, Phone, Hash, MessageSquare, CheckCircle2, Loader2 } from "lucide-react";
import { MenuItem, localApi } from "../utils/local/storage";
import { toast } from "sonner";

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: MenuItem[];
  cart: Record<string, number>;
  onConfirmOrder: (orderDetails: any) => void;
}

export function CheckoutModal({ isOpen, onClose, items, cart, onConfirmOrder }: CheckoutModalProps) {
  const [step, setStep] = useState<'details' | 'confirmation'>('details');
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    rollNumber: '',
    notes: '',
    paymentMethod: 'cash' // Only cash checkout is enabled (no payment gateway)
  });

  useEffect(() => {
    if (isOpen) {
      const user = localApi.auth.getUser();
      if (user) {
        setFormData(prev => ({
          ...prev,
          name: user.name || '',
          phone: user.phone || '',
          rollNumber: user.rollNumber || ''
        }));
      }
    } else {
      // Reset form data when modal closes
      resetForm();
    }
  }, [isOpen]);

  const cartItems = items.filter(item => item && item.id && cart[item.id] > 0);
  const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * cart[item.id]), 0);
  const gstAmount = totalAmount * 0.05;
  const finalAmount = totalAmount + gstAmount;

  const handlePlaceOrder = async () => {
    try {
      setIsProcessingPayment(true);
      const user = localApi.auth.getUser();
      if (!user) {
        toast.error('Please sign in to place an order');
        setIsProcessingPayment(false);
        return;
      }

      const orderData = {
        items: cartItems.map(item => ({
          id: item.id,
          name: item.name,
          price: item.price,
          quantity: cart[item.id],
          category: item.category
        })),
        totalAmount,
        gstAmount,
        finalAmount,
        paymentMethod: 'cash', // Simplified: Cash on Pickup only
        deliveryMethod: 'pickup',
        specialInstructions: formData.notes
      };
      
      onConfirmOrder(orderData);
      setStep('confirmation');
      toast.success('Order placed successfully!');
      setIsProcessingPayment(false);
    } catch (error) {
      console.error('Order placement error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to place order');
      setIsProcessingPayment(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (step === 'details') {
      handlePlaceOrder();
    }
  };

  const resetForm = () => {
    setStep('details');
    setIsProcessingPayment(false);
    setFormData({
      name: '',
      phone: '',
      rollNumber: '',
      notes: '',
      paymentMethod: 'cash'
    });
  };

  if (step === 'confirmation') {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="w-full max-w-md mx-3 sm:mx-auto">
          <DialogHeader className="text-center">
            <div className="bg-gradient-to-br from-green-100 to-emerald-100 p-6 rounded-full mx-auto mb-4 w-fit">
              <CheckCircle2 className="h-16 w-16 text-green-500" />
            </div>
            <DialogTitle className="text-2xl">Order Confirmed! 🎉</DialogTitle>
            <DialogDescription>
              Your order has been placed successfully. Please proceed to the canteen counter for pickup.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <Card>
              <CardContent className="p-4 space-y-3">
                <div className="flex items-center gap-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm"><strong>Name:</strong> {formData.name}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Hash className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm"><strong>Roll Number:</strong> {formData.rollNumber}</span>
                </div>
                <div className="flex items-center gap-2">
                  <CreditCard className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm"><strong>Total Amount:</strong> ₹{finalAmount.toFixed(0)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Wallet className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm"><strong>Payment:</strong> Cash on Pickup</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm"><strong>Ready in:</strong> 15-20 minutes</span>
                </div>
              </CardContent>
            </Card>
            
            <Button onClick={() => { onClose(); resetForm(); }} className="w-full bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 min-h-[44px] touch-manipulation">
              Got It!
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-2 xs:mx-3 sm:mx-auto">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-orange-100 to-amber-100 p-2 rounded-lg">
              <CreditCard className="h-6 w-6 text-orange-600" />
            </div>
            <div>
              <DialogTitle className="text-xl">Complete Your Order</DialogTitle>
              <DialogDescription>
                Please fill in your details to complete the order
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Details */}
          <div className="space-y-4">
            <h3 className="font-semibold flex items-center gap-2">
              <User className="h-4 w-4" />
              Personal Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rollNumber">Roll Number *</Label>
                <Input
                  id="rollNumber"
                  placeholder="e.g., 21CS101"
                  value={formData.rollNumber}
                  onChange={(e) => setFormData(prev => ({ ...prev, rollNumber: e.target.value }))}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="Enter your phone number"
                value={formData.phone}
                onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                required
              />
            </div>
          </div>
          
          {/* Special Instructions */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Special Instructions (Optional)
            </Label>
            <Textarea
              id="notes"
              placeholder="Any special requests, allergies, or dietary requirements..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              className="min-h-[80px]"
            />
          </div>
          
          {/* Payment Method - Simplified */}
          <Card className="bg-green-50 border-green-200">
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="bg-green-100 p-2 rounded-full">
                  <Wallet className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-green-900">Cash on Pickup</h4>
                  <p className="text-sm text-green-700">
                    Pay when you collect your order at the canteen counter
                  </p>
                </div>
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
            </CardContent>
          </Card>
          
          <Separator />
          
          {/* Order Summary */}
          <Card>
            <CardContent className="p-4 space-y-3">
              <h3 className="font-semibold">Order Summary</h3>
              <div className="space-y-2">
                {cartItems.map(item => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span>{item.name} × {cart[item.id]}</span>
                    <span>₹{(item.price * cart[item.id]).toFixed(0)}</span>
                  </div>
                ))}
              </div>
              <Separator />
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Subtotal</span>
                  <span>₹{totalAmount.toFixed(0)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span>GST (5%)</span>
                  <span>₹{(totalAmount * 0.05).toFixed(0)}</span>
                </div>
                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span className="text-green-600">₹{finalAmount.toFixed(0)}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Action Buttons */}
          <div className="flex flex-col xs:flex-row gap-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => { onClose(); resetForm(); }} 
              disabled={isProcessingPayment}
              className="flex-1 order-2 xs:order-1 min-h-[44px] touch-manipulation"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isProcessingPayment}
              className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 order-1 xs:order-2 min-h-[44px] touch-manipulation"
            >
              {isProcessingPayment ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Placing Order...
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Place Order (₹{finalAmount.toFixed(0)})
                </>
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
