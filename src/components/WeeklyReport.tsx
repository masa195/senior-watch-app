import { useMemo } from 'react'
import { BarChart3, TrendingUp, Heart, Utensils, Pill } from 'lucide-react'
import { useWatch } from '../context/WatchContext'
import { format, subDays, startOfDay, endOfDay } from 'date-fns'
import { ja } from 'date-fns/locale'

interface DayStats {
  date: Date
  checkIns: number
  meals: number
  medicines: number
}

export default function WeeklyReport() {
  const { activities } = useWatch()

  // 過去7日間の統計を計算
  const weeklyStats = useMemo(() => {
    const stats: DayStats[] = []
    const today = new Date()

    for (let i = 6; i >= 0; i--) {
      const date = subDays(today, i)
      const dayStart = startOfDay(date)
      const dayEnd = endOfDay(date)

      const dayActivities = activities.filter(a => {
        const actDate = new Date(a.timestamp)
        return actDate >= dayStart && actDate <= dayEnd
      })

      stats.push({
        date,
        checkIns: dayActivities.filter(a => a.type === 'check_in').length,
        meals: dayActivities.filter(a => a.type === 'meal').length,
        medicines: dayActivities.filter(a => a.type === 'medicine').length,
      })
    }

    return stats
  }, [activities])

  // 合計値
  const totals = useMemo(() => ({
    checkIns: weeklyStats.reduce((sum, day) => sum + day.checkIns, 0),
    meals: weeklyStats.reduce((sum, day) => sum + day.meals, 0),
    medicines: weeklyStats.reduce((sum, day) => sum + day.medicines, 0),
  }), [weeklyStats])

  // 最大値（グラフ用）
  const maxCheckIns = Math.max(...weeklyStats.map(d => d.checkIns), 1)

  // 曜日を取得
  const getDayLabel = (date: Date) => {
    return format(date, 'E', { locale: ja })
  }

  return (
    <div className="card bg-gradient-to-br from-indigo-50 to-blue-50 border-2 border-indigo-100">
      <div className="flex items-center gap-3 mb-4">
        <BarChart3 className="w-6 h-6 text-indigo-600" />
        <h2 className="text-lg font-bold text-gray-700">
          📊 週間レポート
        </h2>
      </div>

      {/* サマリーカード */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        <div className="p-3 bg-white/60 rounded-xl text-center">
          <Heart className="w-6 h-6 text-green-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-800">{totals.checkIns}</p>
          <p className="text-xs text-gray-500">元気です</p>
        </div>
        <div className="p-3 bg-white/60 rounded-xl text-center">
          <Utensils className="w-6 h-6 text-orange-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-800">{totals.meals}</p>
          <p className="text-xs text-gray-500">食事</p>
        </div>
        <div className="p-3 bg-white/60 rounded-xl text-center">
          <Pill className="w-6 h-6 text-purple-500 mx-auto mb-1" />
          <p className="text-2xl font-bold text-gray-800">{totals.medicines}</p>
          <p className="text-xs text-gray-500">服薬</p>
        </div>
      </div>

      {/* 棒グラフ */}
      <div className="bg-white/60 rounded-xl p-4">
        <p className="text-sm text-gray-600 mb-3">「元気です」報告数</p>
        <div className="flex items-end justify-between gap-1 h-24">
          {weeklyStats.map((day, index) => {
            const height = maxCheckIns > 0 ? (day.checkIns / maxCheckIns) * 100 : 0
            const isToday = index === 6
            
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full flex flex-col items-center justify-end h-20">
                  {day.checkIns > 0 && (
                    <span className="text-xs text-gray-600 mb-1">{day.checkIns}</span>
                  )}
                  <div 
                    className={`w-full rounded-t transition-all ${
                      isToday ? 'bg-indigo-500' : 'bg-indigo-300'
                    }`}
                    style={{ height: `${Math.max(height, 4)}%` }}
                  />
                </div>
                <span className={`text-xs mt-1 ${isToday ? 'font-bold text-indigo-600' : 'text-gray-500'}`}>
                  {getDayLabel(day.date)}
                </span>
              </div>
            )
          })}
        </div>
      </div>

      {/* トレンド */}
      <div className="mt-4 p-3 bg-white/60 rounded-xl">
        <div className="flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-green-500" />
          <p className="text-sm text-gray-700">
            {totals.checkIns >= 14 && '🎉 素晴らしい！毎日しっかり報告できていますね'}
            {totals.checkIns >= 7 && totals.checkIns < 14 && '👍 良い調子です！この調子で続けましょう'}
            {totals.checkIns > 0 && totals.checkIns < 7 && '💪 もう少し「元気です」を押してみましょう'}
            {totals.checkIns === 0 && '📱 「元気です」ボタンを押してみましょう'}
          </p>
        </div>
      </div>
    </div>
  )
}
