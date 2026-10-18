import React from 'react';
import { LucideIcon, Info, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { MetricComparison } from '../../types';
import { formatComparisonBadge } from '../../utils/analytics';

interface MetricCardProps {
  title: string;
  value: string | number;
  comparison: MetricComparison;
  icon: LucideIcon;
  iconColor?: string;
  tooltip?: string;
  suffix?: string;
  sparklineData?: number[];
  onClick?: () => void;
}

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  comparison,
  icon: Icon,
  iconColor = 'text-accent-purple',
  tooltip,
  suffix = '%',
  sparklineData,
  onClick,
}) => {
  const badge = formatComparisonBadge(comparison, suffix);

  return (
    <div 
      onClick={onClick}
      className={`bg-navy-900/90 border border-navy-800 hover:border-navy-700/80 rounded-2xl p-5 shadow-lg backdrop-blur-sm transition-all duration-200 text-left relative group ${
        onClick ? 'cursor-pointer hover:bg-navy-850/80' : ''
      }`}
    >
      {/* Top row: Label, Tooltip, Icon */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-1.5">
          <span className="text-xs font-medium text-text-secondary">{title}</span>
          {tooltip && (
            <div className="relative group/tooltip">
              <Info className="w-3.5 h-3.5 text-text-muted hover:text-text-secondary cursor-pointer" />
              <div className="absolute left-1/2 bottom-full mb-1.5 -translate-x-1/2 hidden group-hover/tooltip:block bg-navy-950 border border-navy-700 text-text-primary text-[11px] px-2.5 py-1.5 rounded-lg shadow-xl whitespace-nowrap z-30 pointer-events-none">
                {tooltip}
              </div>
            </div>
          )}
        </div>
        <div className={`p-2 rounded-xl bg-navy-800/80 border border-navy-750 ${iconColor}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>

      {/* Main Metric Value */}
      <div className="mt-3 flex items-baseline justify-between">
        <h3 className="text-2xl font-bold tracking-tight text-text-primary font-sans">
          {value}
        </h3>

        {/* Optional mini visual indicator */}
        {sparklineData && sparklineData.length > 0 && (
          <div className="flex items-end space-x-0.5 h-5 w-14">
            {sparklineData.map((val, idx) => {
              const max = Math.max(...sparklineData, 1);
              const heightPct = Math.max(15, (val / max) * 100);
              return (
                <div
                  key={idx}
                  style={{ height: `${heightPct}%` }}
                  className="flex-1 bg-accent-purple/30 rounded-t-sm group-hover:bg-accent-purple/60 transition-colors"
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Bottom row: Comparison Badge & Previous Value */}
      <div className="mt-3.5 pt-3 border-t border-navy-800/70 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-1.5">
          <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[11px] font-semibold border ${badge.className}`}>
            {comparison.isNeutral ? (
              <Minus className="w-2.5 h-2.5" />
            ) : comparison.isPositive ? (
              <TrendingUp className="w-2.5 h-2.5" />
            ) : (
              <TrendingDown className="w-2.5 h-2.5" />
            )}
            <span>{badge.text}</span>
          </span>
        </div>

        <span className="text-[11px] text-text-muted">
          prev: {typeof comparison.previousValue === 'number' && comparison.previousValue >= 1000 ? comparison.previousValue.toLocaleString('en-IN') : comparison.previousValue}
        </span>
      </div>
    </div>
  );
};
