import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "./ui/dialog";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";
import { Clock, Calendar, ChefHat, Timer } from "lucide-react";
import { toast } from "sonner@2.0.3";

interface PreorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  itemName: string;
  itemId: string;
  onConfirmPreorder: (data: PreorderData) => void;
}

export interface PreorderData {
  itemId: string;
  pickupTime: string;
  pickupDate: string;
  quantity: number;
  specialInstructions?: string;
}

export function PreorderModal({ isOpen, onClose, itemName, itemId, onConfirmPreorder }: PreorderModalProps) {
  const [quantity, setQuantity] = useState(1);
  const [pickupDate, setPickupDate] = useState(new Date().toISOString().split('T')[0]);
  const [pickupTime, setPickupTime] = useState("");
  const [specialInstructions, setSpecialInstructions] = useState("");

  // Generate time slots from current time + 1 hour to 8 PM
  const generateTimeSlots = () => {
    const slots = [];
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    // Start from next hour if it's past 30 minutes, otherwise start from current hour + 1
    let startHour = currentMinute > 30 ? currentHour + 2 : currentHour + 1;
    
    // If it's the same day and past 7 PM, start from tomorrow
    const isToday = pickupDate === new Date().toISOString().split('T')[0];
    if (isToday && startHour >= 20) {
      return []; // No slots available for today
    }
    
    if (!isToday) {
      startHour = 8; // Start from 8 AM for future days
    }
    
    for (let hour = Math.max(startHour, 8); hour <= 19; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        const displayTime = `${hour > 12 ? hour - 12 : hour === 0 ? 12 : hour}:${minute.toString().padStart(2, '0')} ${hour >= 12 ? 'PM' : 'AM'}`;
        slots.push({ value: timeString, label: displayTime });
      }
    }
    
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleConfirm = () => {
    if (!pickupTime) {
      toast.error("Please select a pickup time");
      return;
    }

    const preorderData: PreorderData = {
      itemId,
      pickupTime,
      pickupDate,
      quantity,
      specialInstructions
    };

    onConfirmPreorder(preorderData);
    onClose();
    
    // Reset form
    setQuantity(1);
    setPickupTime("");
    setSpecialInstructions("");
  };

  // Get minimum date (today)
  const minDate = new Date().toISOString().split('T')[0];
  
  // Get maximum date (7 days from now)
  const maxDate = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md w-[90vw]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Timer className="h-5 w-5 text-orange-500" />
            Schedule Preorder
          </DialogTitle>
          <DialogDescription>
            Schedule your <span className="font-semibold text-foreground">{itemName}</span> for later pickup
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Quantity */}
          <div className="space-y-2">
            <Label>Quantity</Label>
            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                disabled={quantity <= 1}
              >
                -
              </Button>
              <span className="w-12 text-center font-semibold">{quantity}</span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setQuantity(quantity + 1)}
                disabled={quantity >= 10}
              >
                +
              </Button>
            </div>
          </div>

          {/* Pickup Date */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Pickup Date
            </Label>
            <input
              type="date"
              value={pickupDate}
              onChange={(e) => setPickupDate(e.target.value)}
              min={minDate}
              max={maxDate}
              className="w-full px-3 py-2 border border-input rounded-md bg-background"
            />
          </div>

          {/* Pickup Time */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Pickup Time
            </Label>
            <Select value={pickupTime} onValueChange={setPickupTime}>
              <SelectTrigger>
                <SelectValue placeholder="Select pickup time" />
              </SelectTrigger>
              <SelectContent>
                {timeSlots.length === 0 ? (
                  <SelectItem value="no-slots" disabled>
                    No slots available for selected date
                  </SelectItem>
                ) : (
                  timeSlots.map((slot) => (
                    <SelectItem key={slot.value} value={slot.value}>
                      {slot.label}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {/* Special Instructions */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <ChefHat className="h-4 w-4" />
              Special Instructions (Optional)
            </Label>
            <Textarea
              value={specialInstructions}
              onChange={(e) => setSpecialInstructions(e.target.value)}
              placeholder="Any special requests for preparation..."
              maxLength={200}
              className="min-h-[80px]"
            />
            <p className="text-xs text-muted-foreground">
              {specialInstructions.length}/200 characters
            </p>
          </div>

          {/* Kitchen Scheduling Info */}
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <ChefHat className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="text-sm text-orange-800">
                <p className="font-medium">Kitchen Scheduling</p>
                <p className="text-xs mt-1">
                  Your order will be prepared fresh and ready for pickup at your selected time. 
                  This helps us manage kitchen workflow and reduces your wait time!
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <Button variant="outline" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button 
            onClick={handleConfirm} 
            className="flex-1 bg-orange-500 hover:bg-orange-600"
            disabled={!pickupTime || timeSlots.length === 0}
          >
            Schedule Order
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}