/**
 * Menu Mode Selector Component
 * Cute navigation buttons to switch between different menu viewing modes
 */

import { Button } from "./ui/button";
import { Gift, Clock, Zap, Grid3x3 } from "lucide-react";
import { cn } from "./ui/utils";

export type MenuMode = 'all' | 'combo' | 'timebased' | 'express';

interface MenuModeSelectorProps {
  currentMode: MenuMode;
  onModeChange: (mode: MenuMode) => void;
  className?: string;
}

export function MenuModeSelector({ currentMode, onModeChange, className }: MenuModeSelectorProps) {
  const modes = [
    {
      id: 'all' as MenuMode,
      label: 'All Items',
      shortLabel: 'All',
      icon: Grid3x3,
      emoji: '🍽️',
      gradient: 'from-slate-500 to-slate-600',
      hoverGradient: 'hover:from-slate-600 hover:to-slate-700',
      lightBg: 'bg-slate-50',
      lightBorder: 'border-slate-200',
      iconColor: 'text-slate-600'
    },
    {
      id: 'combo' as MenuMode,
      label: 'Combos',
      shortLabel: 'Combo',
      icon: Gift,
      emoji: '🎁',
      gradient: 'from-green-500 to-emerald-600',
      hoverGradient: 'hover:from-green-600 hover:to-emerald-700',
      lightBg: 'bg-green-50',
      lightBorder: 'border-green-200',
      iconColor: 'text-green-600'
    },
    {
      id: 'timebased' as MenuMode,
      label: 'Time-Based',
      shortLabel: 'Time',
      icon: Clock,
      emoji: '⏰',
      gradient: 'from-blue-500 to-indigo-600',
      hoverGradient: 'hover:from-blue-600 hover:to-indigo-700',
      lightBg: 'bg-blue-50',
      lightBorder: 'border-blue-200',
      iconColor: 'text-blue-600'
    },
    {
      id: 'express' as MenuMode,
      label: 'Express',
      shortLabel: 'Express',
      icon: Zap,
      emoji: '⚡',
      gradient: 'from-purple-500 to-pink-600',
      hoverGradient: 'hover:from-purple-600 hover:to-pink-700',
      lightBg: 'bg-purple-50',
      lightBorder: 'border-purple-200',
      iconColor: 'text-purple-600'
    }
  ];

  return (
    <div className={cn("w-full", className)}>
      {/* Desktop & Tablet: Horizontal Pills */}
      <div className="hidden sm:flex items-center justify-center gap-3 flex-wrap">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isActive = currentMode === mode.id;
          
          return (
            <Button
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
              variant="ghost"
              className={cn(
                "relative group px-5 py-3 rounded-full transition-all duration-300 transform hover:scale-105",
                isActive 
                  ? `bg-gradient-to-r ${mode.gradient} text-white shadow-lg shadow-${mode.iconColor.split('-')[1]}-200` 
                  : `${mode.lightBg} ${mode.lightBorder} border-2 hover:shadow-md`
              )}
            >
              <div className="flex items-center gap-2.5">
                {/* Icon */}
                <div className={cn(
                  "flex items-center justify-center transition-transform group-hover:rotate-12",
                  isActive && "animate-pulse"
                )}>
                  <Icon className={cn(
                    "h-5 w-5",
                    isActive ? "text-white" : mode.iconColor
                  )} />
                </div>
                
                {/* Label */}
                <span className={cn(
                  "font-semibold whitespace-nowrap",
                  isActive ? "text-white" : mode.iconColor
                )}>
                  {mode.label}
                </span>
                
                {/* Emoji Badge */}
                <span className="text-base">
                  {mode.emoji}
                </span>
              </div>
              
              {/* Active Indicator */}
              {isActive && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-1 bg-white rounded-full"></div>
              )}
            </Button>
          );
        })}
      </div>

      {/* Mobile: Compact Grid */}
      <div className="sm:hidden grid grid-cols-2 gap-2.5">
        {modes.map((mode) => {
          const Icon = mode.icon;
          const isActive = currentMode === mode.id;
          
          return (
            <Button
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
              variant="ghost"
              className={cn(
                "relative h-auto py-4 px-3 rounded-2xl transition-all duration-300",
                isActive 
                  ? `bg-gradient-to-br ${mode.gradient} text-white shadow-lg` 
                  : `${mode.lightBg} ${mode.lightBorder} border-2`
              )}
            >
              <div className="flex flex-col items-center gap-2">
                {/* Icon & Emoji */}
                <div className="flex items-center gap-1.5">
                  <Icon className={cn(
                    "h-5 w-5",
                    isActive ? "text-white" : mode.iconColor
                  )} />
                  <span className="text-lg">{mode.emoji}</span>
                </div>
                
                {/* Label */}
                <div className={cn(
                  "text-sm font-semibold text-center leading-tight",
                  isActive ? "text-white" : mode.iconColor
                )}>
                  {mode.shortLabel}
                </div>
              </div>
              
              {/* Active Dot Indicator */}
              {isActive && (
                <div className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full animate-pulse"></div>
              )}
            </Button>
          );
        })}
      </div>
    </div>
  );
}
