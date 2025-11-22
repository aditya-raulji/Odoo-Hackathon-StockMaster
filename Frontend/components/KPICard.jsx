import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

const KPICard = ({ title, value, icon: Icon, trend, trendLabel, color = 'primary' }) => {
  const colorClasses = {
    primary: 'from-primary to-primary-dark',
    secondary: 'from-secondary to-green-600',
    danger: 'from-danger to-red-600',
    warning: 'from-warning to-yellow-500',
  };

  const isTrendingUp = trend > 0;

  return (
    <div className="card-lg p-6 bg-gradient-to-br from-white to-neutral-50">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-neutral-500 mb-2">{title}</p>
          <p className="text-3xl font-bold text-neutral-900 mb-4">{value}</p>
          {trendLabel && (
            <div className="flex items-center gap-2">
              {isTrendingUp ? (
                <TrendingUp size={16} className="text-secondary" />
              ) : (
                <TrendingDown size={16} className="text-danger" />
              )}
              <span className={`text-sm font-medium ${isTrendingUp ? 'text-secondary' : 'text-danger'}`}>
                {Math.abs(trend)}% {trendLabel}
              </span>
            </div>
          )}
        </div>
        {Icon && (
          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${colorClasses[color]} flex items-center justify-center text-white`}>
            <Icon size={24} />
          </div>
        )}
      </div>
    </div>
  );
};

export default KPICard;
