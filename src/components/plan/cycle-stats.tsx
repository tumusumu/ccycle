'use client';

interface IStatCardProps {
  value: number;
  total: number;
  label: string;
  color: 'blue' | 'green' | 'red';
  icon: string;
  showPercentage?: boolean;
}

function StatCard({ value, total, label, color, icon, showPercentage = true }: IStatCardProps) {
  const percentage = total > 0 ? Math.round((value / total) * 100) : 0;
  const hasData = total > 0;

  const colorConfig = {
    blue: {
      bg: 'bg-gradient-to-br from-[#E3F2FD] to-[#BBDEFB]',
      text: 'text-[#1976D2]',
      labelText: 'text-[#1565C0]',
      progressBg: 'bg-[#BBDEFB]',
      progressBar: 'bg-[#2196F3]',
    },
    green: {
      bg: 'bg-gradient-to-br from-[#E8F5E9] to-[#C8E6C9]',
      text: 'text-[#388E3C]',
      labelText: 'text-[#2E7D32]',
      progressBg: 'bg-[#C8E6C9]',
      progressBar: 'bg-[#4CAF50]',
    },
    red: {
      bg: 'bg-gradient-to-br from-[#FFEBEE] to-[#FFCDD2]',
      text: 'text-[#D32F2F]',
      labelText: 'text-[#C62828]',
      progressBg: 'bg-[#FFCDD2]',
      progressBar: 'bg-[#F44336]',
    },
  };

  const config = colorConfig[color];

  return (
    <div
      className={`
        ${config.bg}
        rounded-xl p-3
        hover:shadow-md hover:-translate-y-0.5
        transition-all duration-300
        cursor-pointer
      `}
    >
      {/* Icon and Value */}
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-lg">{icon}</span>
        <div className={`text-2xl font-bold ${config.text}`}>
          {hasData ? value : '-'}
        </div>
      </div>

      {/* Label */}
      <div className={`text-xs font-medium ${config.labelText} mb-2`}>
        {label}
      </div>

      {/* Progress Bar */}
      <div className={`h-1.5 ${config.progressBg} rounded-full overflow-hidden`}>
        <div
          className={`h-full ${config.progressBar} rounded-full transition-all duration-500`}
          style={{ width: hasData ? `${Math.min(percentage, 100)}%` : '0%' }}
        />
      </div>

      {/* Stats */}
      <div className="mt-1.5 flex items-center justify-between">
        <span className="text-[10px] text-[#5D6D7E]">
          {hasData ? `${value}/${total}天` : '-'}
        </span>
        {showPercentage && (
          <span className={`text-[10px] font-semibold ${config.text}`}>
            {hasData ? `${percentage}%` : '-'}
          </span>
        )}
      </div>
    </div>
  );
}

interface ICycleStatsProps {
  cycleNumber: number;
  totalDays: number;
  completedDays: number;
  onTargetDays: number;
}

export function CycleStats({
  cycleNumber,
  totalDays = 6,
  completedDays,
  onTargetDays,
}: ICycleStatsProps) {
  const exceededDays = Math.max(0, completedDays - onTargetDays);
  const onTargetPercentage = completedDays > 0
    ? Math.round((onTargetDays / completedDays) * 100)
    : 0;

  // Determine motivational message
  const getMessage = () => {
    if (completedDays === 0) {
      return { emoji: '🚀', text: '开始你的第一天，开启健康之旅！' };
    }
    if (onTargetDays === completedDays) {
      return { emoji: '🎉', text: '完美！所有完成的天数都达标了！' };
    }
    if (onTargetPercentage >= 80) {
      return { emoji: '💪', text: `太棒了！达标率 ${onTargetPercentage}%，继续保持！` };
    }
    if (onTargetPercentage >= 50) {
      return { emoji: '👍', text: `已完成 ${completedDays} 天，${onTargetDays} 天达标，加油！` };
    }
    return { emoji: '💡', text: '每一步都是进步，调整饮食再接再厉！' };
  };

  const message = getMessage();

  return (
    <div className="bg-white rounded-2xl shadow-sm p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-semibold text-[#2C3E50]">
            本周期统计
          </h3>
          <p className="text-xs text-[#5D6D7E]">
            第{cycleNumber}周期 · 共{totalDays}天
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2.5">
        <StatCard
          value={completedDays}
          total={totalDays}
          label="已完成"
          color="blue"
          icon="📊"
        />
        <StatCard
          value={onTargetDays}
          total={completedDays}
          label="达标"
          color="green"
          icon="🎯"
        />
        <StatCard
          value={exceededDays}
          total={completedDays}
          label="超标"
          color="red"
          icon="⚠️"
        />
      </div>

      {/* Motivational Message */}
      <div className={`
        mt-3 p-2.5 rounded-xl
        ${completedDays === 0
          ? 'bg-[#E3F2FD]'
          : onTargetDays === completedDays
            ? 'bg-[#E8F5E9]'
            : 'bg-[#FFF8E1]'
        }
      `}>
        <p className={`
          text-xs text-center
          ${completedDays === 0
            ? 'text-[#1976D2]'
            : onTargetDays === completedDays
              ? 'text-[#388E3C]'
              : 'text-[#F57C00]'
          }
        `}>
          {message.emoji} {message.text}
        </p>
      </div>
    </div>
  );
}
