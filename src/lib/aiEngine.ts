// AI気づきエンジン - 行動パターン異常検知
import { ActivityLog, Alert, SeniorStatus } from '../context/WatchContext'

// 異常検知のしきい値設定
export const THRESHOLDS = {
  // チェックイン間隔（時間）
  checkIn: {
    warning: 6,    // 6時間以上チェックインなし → 注意
    danger: 12,    // 12時間以上 → 危険
  },
  // 食事間隔（時間）
  meal: {
    warning: 8,    // 8時間以上食事なし → 注意
    danger: 16,    // 16時間以上 → 危険
  },
  // 服薬間隔（時間）
  medicine: {
    warning: 26,   // 26時間以上服薬なし → 注意（1日1回の薬を想定）
    danger: 48,    // 48時間以上 → 危険
  },
  // 外出時間（時間）
  outing: {
    warning: 4,    // 4時間以上外出中 → 注意
    danger: 8,     // 8時間以上 → 危険
  },
  // 就寝時間（時間）
  sleep: {
    warning: 12,   // 12時間以上就寝中 → 注意
    danger: 18,    // 18時間以上 → 危険
  },
}

// 異常検知結果
export interface AnomalyResult {
  type: 'none' | 'warning' | 'danger'
  category: string
  message: string
  recommendation?: string
}

// 時間差計算（時間単位）
const getHoursDiff = (from: Date | null, to: Date = new Date()): number => {
  if (!from) return Infinity
  return (to.getTime() - from.getTime()) / (1000 * 60 * 60)
}

// チェックイン異常検知
export function detectCheckInAnomaly(status: SeniorStatus): AnomalyResult {
  const hours = getHoursDiff(status.lastCheckIn)
  
  if (hours >= THRESHOLDS.checkIn.danger) {
    return {
      type: 'danger',
      category: 'チェックイン',
      message: `${Math.floor(hours)}時間以上「元気です」の報告がありません`,
      recommendation: '電話で状況を確認してください',
    }
  }
  
  if (hours >= THRESHOLDS.checkIn.warning) {
    return {
      type: 'warning',
      category: 'チェックイン',
      message: `${Math.floor(hours)}時間チェックインがありません`,
      recommendation: '連絡を取ってみましょう',
    }
  }
  
  return { type: 'none', category: 'チェックイン', message: '' }
}

// 食事異常検知
export function detectMealAnomaly(status: SeniorStatus): AnomalyResult {
  const hours = getHoursDiff(status.lastMeal)
  
  if (hours >= THRESHOLDS.meal.danger) {
    return {
      type: 'danger',
      category: '食事',
      message: `${Math.floor(hours)}時間以上食事の記録がありません`,
      recommendation: '食事が取れているか確認してください',
    }
  }
  
  if (hours >= THRESHOLDS.meal.warning) {
    return {
      type: 'warning',
      category: '食事',
      message: `${Math.floor(hours)}時間食事の記録がありません`,
    }
  }
  
  return { type: 'none', category: '食事', message: '' }
}

// 服薬異常検知
export function detectMedicineAnomaly(status: SeniorStatus): AnomalyResult {
  const hours = getHoursDiff(status.lastMedicine)
  
  if (hours >= THRESHOLDS.medicine.danger) {
    return {
      type: 'danger',
      category: '服薬',
      message: `${Math.floor(hours)}時間以上お薬の記録がありません`,
      recommendation: '服薬の確認をしてください',
    }
  }
  
  if (hours >= THRESHOLDS.medicine.warning) {
    return {
      type: 'warning',
      category: '服薬',
      message: `${Math.floor(hours)}時間お薬の記録がありません`,
    }
  }
  
  return { type: 'none', category: '服薬', message: '' }
}

// 行動パターン分析
export function analyzeActivityPattern(activities: ActivityLog[]): {
  dailyCheckIns: number
  averageCheckInTime: string | null
  mostActiveHour: number | null
  activityScore: number // 0-100
} {
  if (activities.length === 0) {
    return {
      dailyCheckIns: 0,
      averageCheckInTime: null,
      mostActiveHour: null,
      activityScore: 0,
    }
  }

  // 過去7日間の活動を分析
  const now = new Date()
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
  const recentActivities = activities.filter(a => a.timestamp >= weekAgo)
  
  // チェックイン回数
  const checkIns = recentActivities.filter(a => a.type === 'check_in')
  const dailyCheckIns = checkIns.length / 7
  
  // 平均チェックイン時間
  let averageCheckInTime: string | null = null
  if (checkIns.length > 0) {
    const avgMinutes = checkIns.reduce((sum, a) => {
      const d = new Date(a.timestamp)
      return sum + d.getHours() * 60 + d.getMinutes()
    }, 0) / checkIns.length
    
    const hours = Math.floor(avgMinutes / 60)
    const minutes = Math.floor(avgMinutes % 60)
    averageCheckInTime = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`
  }
  
  // 最も活発な時間帯
  const hourCounts: Record<number, number> = {}
  recentActivities.forEach(a => {
    const hour = new Date(a.timestamp).getHours()
    hourCounts[hour] = (hourCounts[hour] || 0) + 1
  })
  
  let mostActiveHour: number | null = null
  let maxCount = 0
  Object.entries(hourCounts).forEach(([hour, count]) => {
    if (count > maxCount) {
      maxCount = count
      mostActiveHour = parseInt(hour)
    }
  })
  
  // 活動スコア（0-100）
  // 基準：1日3回のチェックイン、食事3回、服薬1回 = 100点
  const expectedActivitiesPerDay = 7
  const actualActivitiesPerDay = recentActivities.length / 7
  const activityScore = Math.min(100, Math.round((actualActivitiesPerDay / expectedActivitiesPerDay) * 100))
  
  return {
    dailyCheckIns: Math.round(dailyCheckIns * 10) / 10,
    averageCheckInTime,
    mostActiveHour,
    activityScore,
  }
}

// 全異常検知を実行
export function runAllAnomalyDetection(status: SeniorStatus): AnomalyResult[] {
  const results: AnomalyResult[] = []
  
  const checkInAnomaly = detectCheckInAnomaly(status)
  if (checkInAnomaly.type !== 'none') results.push(checkInAnomaly)
  
  const mealAnomaly = detectMealAnomaly(status)
  if (mealAnomaly.type !== 'none') results.push(mealAnomaly)
  
  const medicineAnomaly = detectMedicineAnomaly(status)
  if (medicineAnomaly.type !== 'none') results.push(medicineAnomaly)
  
  return results
}

// 異常からアラートを生成
export function createAlertsFromAnomalies(anomalies: AnomalyResult[]): Omit<Alert, 'id' | 'timestamp' | 'isRead'>[] {
  return anomalies.map(anomaly => ({
    type: anomaly.type === 'danger' ? 'emergency' : 'warning',
    message: anomaly.recommendation 
      ? `${anomaly.message}。${anomaly.recommendation}`
      : anomaly.message,
  }))
}
