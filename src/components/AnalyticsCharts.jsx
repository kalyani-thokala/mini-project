import React from 'react';
import { 
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from 'recharts';
import { useApp } from '../context/AppContext';

export default function AnalyticsCharts({ stats }) {
  const { questionStatus, theme, savedSessions } = useApp();

  const isDark = theme === 'dark';

  // 1. Prepare data for Pie Chart (Completion Status)
  const remainingCount = Math.max(0, stats.totalGenerated - stats.completedCount - stats.practicingCount);
  
  const statusData = [
    { name: 'Completed', value: stats.completedCount, color: '#10b981' }, // emerald-500
    { name: 'Practicing', value: stats.practicingCount, color: '#f59e0b' }, // amber-500
    { name: 'Not Started', value: remainingCount, color: isDark ? '#1e293b' : '#e2e8f0' } // darkBorder / slate-200
  ].filter(item => stats.totalGenerated > 0 || item.name === 'Not Started'); // Keep not started if total is 0

  if (stats.totalGenerated === 0) {
    // default visualization placeholder
    statusData[0] = { name: 'No Data', value: 1, color: isDark ? '#1e293b' : '#e2e8f0' };
  }

  // 2. Prepare data for Bar Chart (Difficulty Breakdown)
  // Let's count how many questions are Completed and Practicing in each difficulty level
  let diffCounts = {
    Beginner: { completed: 0, practicing: 0 },
    Intermediate: { completed: 0, practicing: 0 },
    Advanced: { completed: 0, practicing: 0 }
  };

  // Scan saved sessions to find difficulties of active questions
  savedSessions.forEach(session => {
    session.questions?.forEach(q => {
      const qStatus = questionStatus[q.id];
      const diff = q.difficultyLevel || q.difficulty || 'Intermediate';
      const normalizedDiff = diffCounts[diff] ? diff : 'Intermediate';

      if (qStatus === 'completed') {
        diffCounts[normalizedDiff].completed += 1;
      } else if (qStatus === 'practicing') {
        diffCounts[normalizedDiff].practicing += 1;
      }
    });
  });

  const difficultyData = [
    { name: 'Beginner', Completed: diffCounts.Beginner.completed, Practicing: diffCounts.Beginner.practicing },
    { name: 'Intermediate', Completed: diffCounts.Intermediate.completed, Practicing: diffCounts.Intermediate.practicing },
    { name: 'Advanced', Completed: diffCounts.Advanced.completed, Practicing: diffCounts.Advanced.practicing }
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      
      {/* Completion Status (Pie Chart) */}
      <div className="lg:col-span-5 p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">Preparation Breakdown</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: isDark ? '#151b2c' : '#ffffff',
                  borderColor: isDark ? '#1e293b' : '#e2e8f0',
                  color: isDark ? '#f8fafc' : '#1e293b' 
                }}
              />
              <Legend 
                verticalAlign="bottom" 
                height={36} 
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Difficulty Breakdown (Bar Chart) */}
      <div className="lg:col-span-7 p-6 rounded-3xl bg-white dark:bg-darkCard border border-slate-100 dark:border-darkBorder shadow-premium">
        <h3 className="text-base font-bold text-slate-800 dark:text-slate-100 mb-4">Focus by Difficulty</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={difficultyData}
              margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#1e293b' : '#f1f5f9'} vertical={false} />
              <XAxis 
                dataKey="name" 
                stroke={isDark ? '#475569' : '#94a3b8'} 
                fontSize={11}
                fontWeight="semibold"
                tickLine={false}
              />
              <YAxis 
                stroke={isDark ? '#475569' : '#94a3b8'} 
                fontSize={11}
                fontWeight="semibold"
                tickLine={false}
                allowDecimals={false}
              />
              <Tooltip
                contentStyle={{ 
                  backgroundColor: isDark ? '#151b2c' : '#ffffff',
                  borderColor: isDark ? '#1e293b' : '#e2e8f0',
                  color: isDark ? '#f8fafc' : '#1e293b' 
                }}
              />
              <Legend 
                iconType="circle"
                iconSize={8}
                formatter={(value) => <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">{value}</span>}
              />
              <Bar dataKey="Completed" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              <Bar dataKey="Practicing" fill="#818cf8" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

    </div>
  );
}
