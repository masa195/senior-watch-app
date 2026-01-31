import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Heart, 
  Bell, 
  Activity, 
  Clock,
  CheckCircle,
  AlertTriangle,
  AlertCircle,
  Info,
  Settings,
  Phone,
  Video,
  Trash2,
  ChevronRight,
  Home,
  Utensils,
  Pill,
  Moon,
  Sun,
  MapPin,
  WifiOff,
  Cloud
} from 'lucide-react'
import { useWatch, ActivityLog } from '../context/WatchContext'
import { format, formatDistanceToNow } from 'date-fns'
import { ja } from 'date-fns/locale'
import WeeklyReport from '../components/WeeklyReport'

interface FamilyDashboardProps {
  onLogout: () => void
}

// 活動タイプのアイコンと色
const activityConfig: Record<ActivityLog['type'], { icon: typeof Heart; color: string; bg: string }> = {
  check_in: { icon: Heart, color: 'text-green-600', bg: 'bg-green-100' },
  emergency: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100' },
  meal: { icon: Utensils, color: 'text-orange-600', bg: 'bg-orange-100' },
  medicine: { icon: Pill, color: 'text-purple-600', bg: 'bg-purple-100' },
  sleep: { icon: Moon, color: 'text-indigo-600', bg: 'bg-indigo-100' },
  wake: { icon: Sun, color: 'text-yellow-600', bg: 'bg-yellow-100' },
  outing: { icon: MapPin, color: 'text-sky-600', bg: 'bg-sky-100' },
  return: { icon: Home, color: 'text-green-600', bg: 'bg-green-100' },
}

export default function FamilyDashboard({ onLogout: _onLogout }: FamilyDashboardProps) {
  void _onLogout // 将来使用予定
  const navigate = useNavigate()
  const { activities, alerts, seniorStatus, markAlertAsRead, clearAllAlerts, isOnline } = useWatch()
  const [activeTab, setActiveTab] = useState<'overview' | 'activities' | 'alerts'>('overview')
  const [currentTime, setCurrentTime] = useState(new Date())

  // 通知許可リクエスト
  useEffect(() => {
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission()
    }
  }, [])

  // 時刻更新
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  // 未読アラート数
  const unreadAlerts = alerts.filter(a => !a.isRead).length

  // ステータス計算
  const getStatusLevel = (): 'good' | 'warning' | 'danger' => {
    if (!seniorStatus.lastCheckIn) return 'warning'
    
    const hoursSinceCheckIn = (currentTime.getTime() - seniorStatus.lastCheckIn.getTime()) / (1000 * 60 * 60)
    
    if (hoursSinceCheckIn > 12) return 'danger'
    if (hoursSinceCheckIn > 6) return 'warning'
    return 'good'
  }

  const statusLevel = getStatusLevel()
  const statusConfig = {
    good: { color: 'text-green-600', bg: 'bg-green-50', border: 'border-green-200', label: '良好' },
    warning: { color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200', label: '注意' },
    danger: { color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200', label: '要確認' },
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-2xl mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-500 rounded-full flex items-center justify-center">
              <Heart className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-bold text-gray-800">デジタル同居</h1>
                {isOnline ? (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">
                    <Cloud className="w-3 h-3" />
                    同期中
                  </span>
                ) : (
                  <span className="flex items-center gap-1 px-2 py-0.5 bg-gray-100 text-gray-500 text-xs rounded-full">
                    <WifiOff className="w-3 h-3" />
                    オフライン
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-500">見守りダッシュボード</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button 
              onClick={() => setActiveTab('alerts')}
              className="relative p-3 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Bell className="w-6 h-6 text-gray-600" />
              {unreadAlerts > 0 && (
                <span className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white text-xs 
                               rounded-full flex items-center justify-center font-bold">
                  {unreadAlerts}
                </span>
              )}
            </button>
            <button 
              onClick={() => navigate('/settings')}
              className="p-3 hover:bg-gray-100 rounded-full transition-colors"
            >
              <Settings className="w-6 h-6 text-gray-600" />
            </button>
          </div>
        </div>

        {/* タブ */}
        <div className="max-w-2xl mx-auto px-4 flex border-b">
          {[
            { id: 'overview', label: '概要', icon: Activity },
            { id: 'activities', label: '活動履歴', icon: Clock },
            { id: 'alerts', label: 'アラート', icon: Bell, badge: unreadAlerts },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex-1 py-3 px-4 flex items-center justify-center gap-2 font-medium
                         border-b-2 transition-colors relative
                         ${activeTab === tab.id 
                           ? 'border-primary-500 text-primary-600' 
                           : 'border-transparent text-gray-500 hover:text-gray-700'}`}
            >
              <tab.icon className="w-5 h-5" />
              <span className="hidden sm:inline">{tab.label}</span>
              {tab.badge ? (
                <span className="w-5 h-5 bg-red-500 text-white text-xs rounded-full 
                               flex items-center justify-center">
                  {tab.badge}
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </header>

      <main className="max-w-2xl mx-auto p-4 pb-24">
        {/* 概要タブ */}
        {activeTab === 'overview' && (
          <div className="space-y-4 fade-in">
            {/* ステータスカード */}
            <div className={`card ${statusConfig[statusLevel].bg} ${statusConfig[statusLevel].border} border-2`}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">現在の状態</h2>
                <span className={`px-3 py-1 rounded-full text-sm font-bold ${statusConfig[statusLevel].color} ${statusConfig[statusLevel].bg}`}>
                  {statusConfig[statusLevel].label}
                </span>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-white rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">最後の報告</p>
                  <p className="text-xl font-bold text-gray-800">
                    {seniorStatus.lastCheckIn 
                      ? formatDistanceToNow(seniorStatus.lastCheckIn, { addSuffix: true, locale: ja })
                      : '---'}
                  </p>
                </div>
                <div className="text-center p-4 bg-white rounded-xl">
                  <p className="text-sm text-gray-500 mb-1">今日の報告</p>
                  <p className="text-xl font-bold text-gray-800">
                    {seniorStatus.todayCheckIns} 回
                  </p>
                </div>
              </div>

              {/* 状態インジケーター */}
              <div className="mt-4 flex flex-wrap gap-2">
                <span className={`px-3 py-1 rounded-full text-sm font-medium
                               ${seniorStatus.isAwake ? 'bg-yellow-100 text-yellow-700' : 'bg-indigo-100 text-indigo-700'}`}>
                  {seniorStatus.isAwake ? '☀️ 起きている' : '🌙 就寝中'}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium
                               ${seniorStatus.isOutside ? 'bg-sky-100 text-sky-700' : 'bg-green-100 text-green-700'}`}>
                  {seniorStatus.isOutside ? '🚶 外出中' : '🏠 在宅'}
                </span>
              </div>
            </div>

            {/* クイックアクション */}
            <div className="card">
              <h2 className="text-lg font-bold text-gray-800 mb-4">連絡する</h2>
              <div className="grid grid-cols-2 gap-3">
                <a
                  href="tel:+81-90-0000-0000"
                  className="flex items-center justify-center gap-2 py-4 px-6 
                           bg-primary-500 text-white rounded-xl font-bold
                           hover:bg-primary-600 transition-colors"
                >
                  <Phone className="w-5 h-5" />
                  電話
                </a>
                <button
                  className="flex items-center justify-center gap-2 py-4 px-6 
                           bg-green-500 text-white rounded-xl font-bold
                           hover:bg-green-600 transition-colors"
                >
                  <Video className="w-5 h-5" />
                  ビデオ通話
                </button>
              </div>
            </div>

            {/* 直近の活動 */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-800">直近の活動</h2>
                <button 
                  onClick={() => setActiveTab('activities')}
                  className="text-primary-600 text-sm font-medium flex items-center gap-1"
                >
                  すべて見る <ChevronRight className="w-4 h-4" />
                </button>
              </div>
              
              {activities.length === 0 ? (
                <p className="text-gray-500 text-center py-8">まだ活動がありません</p>
              ) : (
                <div className="space-y-3">
                  {activities.slice(0, 5).map(activity => {
                    const config = activityConfig[activity.type]
                    const Icon = config.icon
                    return (
                      <div key={activity.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                        <div className={`w-10 h-10 ${config.bg} rounded-full flex items-center justify-center`}>
                          <Icon className={`w-5 h-5 ${config.color}`} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-gray-800 font-medium truncate">{activity.message}</p>
                          <p className="text-sm text-gray-500">
                            {format(activity.timestamp, 'M/d HH:mm', { locale: ja })}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* 週間レポート */}
            <WeeklyReport />
          </div>
        )}

        {/* 活動履歴タブ */}
        {activeTab === 'activities' && (
          <div className="space-y-3 fade-in">
            {activities.length === 0 ? (
              <div className="card text-center py-12">
                <Activity className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                <p className="text-gray-500">まだ活動がありません</p>
              </div>
            ) : (
              activities.map(activity => {
                const config = activityConfig[activity.type]
                const Icon = config.icon
                return (
                  <div 
                    key={activity.id} 
                    className={`card flex items-center gap-4 ${activity.isAlert ? 'border-2 border-red-200' : ''}`}
                  >
                    <div className={`w-12 h-12 ${config.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                      <Icon className={`w-6 h-6 ${config.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-gray-800 font-medium">{activity.message}</p>
                      <p className="text-sm text-gray-500">
                        {format(activity.timestamp, 'M月d日（E） HH:mm', { locale: ja })}
                      </p>
                    </div>
                    {activity.isAlert && (
                      <AlertTriangle className="w-6 h-6 text-red-500 flex-shrink-0" />
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* アラートタブ */}
        {activeTab === 'alerts' && (
          <div className="space-y-3 fade-in">
            {alerts.length > 0 && (
              <div className="flex justify-end">
                <button
                  onClick={clearAllAlerts}
                  className="flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-red-600 
                           hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  すべて削除
                </button>
              </div>
            )}

            {alerts.length === 0 ? (
              <div className="card text-center py-12">
                <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-4" />
                <p className="text-gray-500">アラートはありません</p>
                <p className="text-sm text-gray-400 mt-2">問題が検知されると表示されます</p>
              </div>
            ) : (
              alerts.map(alert => {
                const alertStyles = {
                  emergency: { icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-50', border: 'border-red-200' },
                  warning: { icon: AlertCircle, color: 'text-yellow-600', bg: 'bg-yellow-50', border: 'border-yellow-200' },
                  info: { icon: Info, color: 'text-blue-600', bg: 'bg-blue-50', border: 'border-blue-200' },
                }
                const style = alertStyles[alert.type]
                const Icon = style.icon

                return (
                  <div 
                    key={alert.id}
                    onClick={() => markAlertAsRead(alert.id)}
                    className={`card cursor-pointer border-2 ${style.border} ${style.bg}
                               ${!alert.isRead ? 'ring-2 ring-offset-2 ring-red-300' : 'opacity-75'}`}
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 ${style.bg} rounded-full flex items-center justify-center flex-shrink-0`}>
                        <Icon className={`w-6 h-6 ${style.color}`} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-sm font-bold ${style.color} uppercase`}>
                            {alert.type === 'emergency' ? '緊急' : alert.type === 'warning' ? '注意' : '情報'}
                          </span>
                          {!alert.isRead && (
                            <span className="px-2 py-0.5 bg-red-500 text-white text-xs rounded-full">
                              未読
                            </span>
                          )}
                        </div>
                        <p className="text-gray-800 font-medium">{alert.message}</p>
                        <p className="text-sm text-gray-500 mt-1">
                          {format(alert.timestamp, 'M月d日 HH:mm', { locale: ja })}
                        </p>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        )}
      </main>
    </div>
  )
}
