import { Card, CardContent } from "./ui/card";
import { Clock, Calendar, Users, Flame, UtensilsCrossed } from "lucide-react";

interface QuickActionProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  color: string;
  onClick?: () => void;
}

function QuickActionCard({ icon, title, description, color, onClick }: QuickActionProps) {
  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
      onClick={onClick}
    >
      <CardContent className="p-6">
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-lg ${color}`}>
            {icon}
          </div>
          <div className="flex-1">
            <h3 className="font-semibold mb-1">{title}</h3>
            <p className="text-sm text-muted-foreground">{description}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface AdminQuickActionsProps {
  onViewOrders: () => void;
  onSchedulePreorder: () => void;
  onCreateGroupCart: () => void;
  onCreateFlashSale: () => void;
  onKitchenDashboard: () => void;
}

export function AdminQuickActions({
  onViewOrders,
  onSchedulePreorder,
  onCreateGroupCart,
  onCreateFlashSale,
  onKitchenDashboard,
}: AdminQuickActionsProps) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-semibold mb-1">Quick Actions</h2>
        <p className="text-sm text-muted-foreground">Common tasks you can perform</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <QuickActionCard
          icon={<Clock className="h-6 w-6 text-blue-600" />}
          title="View Order Status"
          description="Track your active orders"
          color="bg-blue-100"
          onClick={onViewOrders}
        />
        
        <QuickActionCard
          icon={<Calendar className="h-6 w-6 text-green-600" />}
          title="Schedule Preorder"
          description="Plan your meals ahead"
          color="bg-green-100"
          onClick={onSchedulePreorder}
        />
        
        <QuickActionCard
          icon={<Users className="h-6 w-6 text-purple-600" />}
          title="Create Group Cart"
          description="Order with friends"
          color="bg-purple-100"
          onClick={onCreateGroupCart}
        />
        
        <QuickActionCard
          icon={<Flame className="h-6 w-6 text-red-600" />}
          title="Create Flash Sale"
          description="Launch limited time offer"
          color="bg-red-100"
          onClick={onCreateFlashSale}
        />
        
        <QuickActionCard
          icon={<UtensilsCrossed className="h-6 w-6 text-orange-600" />}
          title="Kitchen Dashboard"
          description="Manage orders & kitchen"
          color="bg-orange-100"
          onClick={onKitchenDashboard}
        />
      </div>
    </div>
  );
}
