/**
 * Feature Toggles Component
 * Allows users to seamlessly switch between different menu modes
 */

import { Switch } from "./ui/switch";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Gift, Clock, Zap } from "lucide-react";

interface FeatureTogglesProps {
  settings: {
    enableComboOffers: boolean;
    enableTimeBasedMenu: boolean;
    enableExpressMenu: boolean;
  };
  onSettingsChange: (settings: Partial<{
    enableComboOffers: boolean;
    enableTimeBasedMenu: boolean;
    enableExpressMenu: boolean;
  }>) => void;
}

export function FeatureToggles({ settings, onSettingsChange }: FeatureTogglesProps) {
  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-orange-500" />
          Menu Features
        </CardTitle>
        <CardDescription>
          Customize your menu browsing experience
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Combo Offers Toggle */}
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-start space-x-3 flex-1">
            <Gift className="h-5 w-5 text-green-600 mt-0.5" />
            <div className="flex-1">
              <Label htmlFor="combo-offers" className="cursor-pointer">
                Combo Offers
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                View special combo deals and bundled items
              </p>
            </div>
          </div>
          <Switch
            id="combo-offers"
            checked={settings.enableComboOffers}
            onCheckedChange={(checked) => 
              onSettingsChange({ enableComboOffers: checked })
            }
          />
        </div>

        {/* Time-Based Menu Toggle */}
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-start space-x-3 flex-1">
            <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <Label htmlFor="time-based-menu" className="cursor-pointer">
                Time-Based Menu
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Show items based on meal times (breakfast, lunch, dinner)
              </p>
            </div>
          </div>
          <Switch
            id="time-based-menu"
            checked={settings.enableTimeBasedMenu}
            onCheckedChange={(checked) => 
              onSettingsChange({ enableTimeBasedMenu: checked })
            }
          />
        </div>

        {/* Express Menu Toggle */}
        <div className="flex items-center justify-between space-x-4">
          <div className="flex items-start space-x-3 flex-1">
            <Zap className="h-5 w-5 text-purple-600 mt-0.5" />
            <div className="flex-1">
              <Label htmlFor="express-menu" className="cursor-pointer">
                Express Menu
              </Label>
              <p className="text-sm text-muted-foreground mt-1">
                Show only items ready in under 5 minutes
              </p>
            </div>
          </div>
          <Switch
            id="express-menu"
            checked={settings.enableExpressMenu}
            onCheckedChange={(checked) => 
              onSettingsChange({ enableExpressMenu: checked })
            }
          />
        </div>
      </CardContent>
    </Card>
  );
}
