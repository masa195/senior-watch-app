import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'
import { 
  saveActivity, 
  saveAlert, 
  saveStatus, 
  subscribeToActivities, 
  subscribeToAlerts,
  subscribeToStatus,
  markAlertRead,
  clearAllAlerts as clearAlertsFirestore,
  isFirestoreAvailable 
} from '../lib/firestore'

// 活動ログの型定義
export interface ActivityLog {
  id: string
  type: 'check_in' | 'emergency' | 'meal' | 'medicine' | 'sleep' | 'wake' | 'outing' | 'return'
  timestamp: Date
  message: string
  isAlert?: boolean
}

// アラートの型定義
export interface Alert {
  id: string
  type: 'emergency' | 'warning' | 'info'
  message: string
  timestamp: Date
  isRead: boolean
}

// 高齢者の状態
export interface SeniorStatus {
  lastCheckIn: Date | null
  lastMeal: Date | null
  lastMedicine: Date | null
  isAwake: boolean
  isOutside: boolean
  todayCheckIns: number
  streak: number // 連続チェックイン日数
}

interface WatchContextType {
  activities: ActivityLog[]
  alerts: Alert[]
  seniorStatus: SeniorStatus
  addActivity: (type: ActivityLog['type'], message?: string) => void
  addAlert: (type: Alert['type'], message: string) => void
  markAlertAsRead: (id: string) => void
  clearAllAlerts: () => void
  isOnline: boolean // Firestore接続状態
}

const WatchContext = createContext<WatchContextType | undefined>(undefined)

// ローカルストレージのキー
const STORAGE_KEYS = {
  activities: 'mimamori_activities',
  alerts: 'mimamori_alerts',
  status: 'mimamori_status',
}

// デフォルトのステータス
const defaultStatus: SeniorStatus = {
  lastCheckIn: null,
  lastMeal: null,
  lastMedicine: null,
  isAwake: true,
  isOutside: false,
  todayCheckIns: 0,
  streak: 0,
}

export function WatchProvider({ children }: { children: ReactNode }) {
  const [activities, setActivities] = useState<ActivityLog[]>([])
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [seniorStatus, setSeniorStatus] = useState<SeniorStatus>(defaultStatus)
  const [isOnline, setIsOnline] = useState(false)

  // Firestoreリアルタイム同期 or ローカルストレージ
  useEffect(() => {
    const firestoreAvailable = isFirestoreAvailable()
    setIsOnline(firestoreAvailable)

    if (firestoreAvailable) {
      // Firestoreからリアルタイム購読
      const unsubActivities = subscribeToActivities((data) => {
        setActivities(data)
      })

      const unsubAlerts = subscribeToAlerts((data) => {
        setAlerts(data)
        // 新しい未読アラートがあればブラウザ通知
        const unreadAlerts = data.filter(a => !a.isRead)
        if (unreadAlerts.length > 0 && 'Notification' in window && Notification.permission === 'granted') {
          const latest = unreadAlerts[0]
          new Notification('デジタル同居 - アラート', {
            body: latest.message,
            icon: '/vite.svg',
            tag: latest.id,
          })
        }
      })

      const unsubStatus = subscribeToStatus((data) => {
        if (data) {
          setSeniorStatus(data)
        }
      })

      return () => {
        unsubActivities?.()
        unsubAlerts?.()
        unsubStatus?.()
      }
    } else {
      // ローカルストレージから読み込み
      const savedActivities = localStorage.getItem(STORAGE_KEYS.activities)
      const savedAlerts = localStorage.getItem(STORAGE_KEYS.alerts)
      const savedStatus = localStorage.getItem(STORAGE_KEYS.status)

      if (savedActivities) {
        const parsed = JSON.parse(savedActivities)
        setActivities(parsed.map((a: ActivityLog) => ({
          ...a,
          timestamp: new Date(a.timestamp)
        })))
      }

      if (savedAlerts) {
        const parsed = JSON.parse(savedAlerts)
        setAlerts(parsed.map((a: Alert) => ({
          ...a,
          timestamp: new Date(a.timestamp)
        })))
      }

      if (savedStatus) {
        const parsed = JSON.parse(savedStatus)
        setSeniorStatus({
          ...parsed,
          lastCheckIn: parsed.lastCheckIn ? new Date(parsed.lastCheckIn) : null,
          lastMeal: parsed.lastMeal ? new Date(parsed.lastMeal) : null,
          lastMedicine: parsed.lastMedicine ? new Date(parsed.lastMedicine) : null,
        })
      }
    }
  }, [])

  // ローカルストレージへの保存（オフライン時のみ）
  useEffect(() => {
    if (!isOnline) {
      localStorage.setItem(STORAGE_KEYS.activities, JSON.stringify(activities))
    }
  }, [activities, isOnline])

  useEffect(() => {
    if (!isOnline) {
      localStorage.setItem(STORAGE_KEYS.alerts, JSON.stringify(alerts))
    }
  }, [alerts, isOnline])

  useEffect(() => {
    if (!isOnline) {
      localStorage.setItem(STORAGE_KEYS.status, JSON.stringify(seniorStatus))
    }
  }, [seniorStatus, isOnline])

  // 活動を追加
  const addActivity = useCallback((type: ActivityLog['type'], customMessage?: string) => {
    const now = new Date()
    const timeStr = format(now, 'HH:mm', { locale: ja })
    
    const messages: Record<ActivityLog['type'], string> = {
      check_in: `${timeStr} 元気です！と報告しました`,
      emergency: `${timeStr} 緊急ボタンが押されました！`,
      meal: `${timeStr} 食事をしました`,
      medicine: `${timeStr} お薬を飲みました`,
      sleep: `${timeStr} おやすみなさい`,
      wake: `${timeStr} おはようございます`,
      outing: `${timeStr} お出かけします`,
      return: `${timeStr} 帰宅しました`,
    }

    const newActivity: ActivityLog = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      timestamp: now,
      message: customMessage || messages[type],
      isAlert: type === 'emergency',
    }

    // Firestoreに保存
    saveActivity(newActivity)

    // ローカル状態も更新（オフライン対応）
    setActivities(prev => [newActivity, ...prev].slice(0, 100))

    // ステータス更新
    setSeniorStatus(prev => {
      const updated = { ...prev }
      
      switch (type) {
        case 'check_in':
          updated.lastCheckIn = now
          updated.todayCheckIns = prev.todayCheckIns + 1
          break
        case 'meal':
          updated.lastMeal = now
          break
        case 'medicine':
          updated.lastMedicine = now
          break
        case 'sleep':
          updated.isAwake = false
          break
        case 'wake':
          updated.isAwake = true
          break
        case 'outing':
          updated.isOutside = true
          break
        case 'return':
          updated.isOutside = false
          break
      }
      
      // Firestoreにステータス保存
      saveStatus(updated)
      
      return updated
    })

    // 緊急時はアラートも追加
    if (type === 'emergency') {
      addAlert('emergency', '緊急ボタンが押されました！すぐに確認してください。')
    }
  }, [])

  // アラートを追加
  const addAlert = useCallback((type: Alert['type'], message: string) => {
    const newAlert: Alert = {
      id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      message,
      timestamp: new Date(),
      isRead: false,
    }

    // Firestoreに保存
    saveAlert(newAlert)

    // ローカル状態も更新
    setAlerts(prev => [newAlert, ...prev].slice(0, 50))

    // ブラウザ通知
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('デジタル同居 - アラート', {
        body: message,
        icon: '/vite.svg',
        tag: newAlert.id,
      })
    }
  }, [])

  // アラートを既読にする
  const markAlertAsRead = useCallback((id: string) => {
    // Firestoreを更新
    markAlertRead(id)

    // ローカル状態も更新
    setAlerts(prev => 
      prev.map(alert => 
        alert.id === id ? { ...alert, isRead: true } : alert
      )
    )
  }, [])

  // すべてのアラートをクリア
  const clearAllAlerts = useCallback(() => {
    // Firestoreを更新
    clearAlertsFirestore()

    // ローカル状態も更新
    setAlerts([])
  }, [])

  return (
    <WatchContext.Provider 
      value={{ 
        activities, 
        alerts, 
        seniorStatus,
        addActivity, 
        addAlert, 
        markAlertAsRead,
        clearAllAlerts,
        isOnline,
      }}
    >
      {children}
    </WatchContext.Provider>
  )
}

export function useWatch() {
  const context = useContext(WatchContext)
  if (context === undefined) {
    throw new Error('useWatch must be used within a WatchProvider')
  }
  return context
}
