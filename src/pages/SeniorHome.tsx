import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  Heart, 
  AlertTriangle, 
  Utensils, 
  Pill, 
  Moon, 
  Sun,
  Home,
  MapPin,
  Settings,
  Phone
} from 'lucide-react'
import { useWatch } from '../context/WatchContext'
import { format } from 'date-fns'
import { ja } from 'date-fns/locale'

interface SeniorHomeProps {
  onLogout: () => void
}

export default function SeniorHome({ onLogout: _onLogout }: SeniorHomeProps) {
  void _onLogout // 将来使用予定
  const navigate = useNavigate()
  const { addActivity, seniorStatus } = useWatch()
  const [currentTime, setCurrentTime] = useState(new Date())
  const [showEmergencyConfirm, setShowEmergencyConfirm] = useState(false)
  const [showFeedback, setShowFeedback] = useState<string | null>(null)

  // 時刻更新
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000)
    return () => clearInterval(timer)
  }, [])

  // フィードバック表示
  const showActionFeedback = (message: string) => {
    setShowFeedback(message)
    setTimeout(() => setShowFeedback(null), 3000)
  }

  // アクションハンドラー
  const handleCheckIn = () => {
    addActivity('check_in')
    showActionFeedback('「元気です」を送信しました！')
  }

  const handleEmergency = () => {
    if (showEmergencyConfirm) {
      addActivity('emergency')
      setShowEmergencyConfirm(false)
      showActionFeedback('緊急連絡を送信しました')
    } else {
      setShowEmergencyConfirm(true)
      setTimeout(() => setShowEmergencyConfirm(false), 5000)
    }
  }

  const handleMeal = () => {
    addActivity('meal')
    showActionFeedback('食事の記録を送信しました')
  }

  const handleMedicine = () => {
    addActivity('medicine')
    showActionFeedback('お薬の記録を送信しました')
  }

  const handleSleep = () => {
    addActivity(seniorStatus.isAwake ? 'sleep' : 'wake')
    showActionFeedback(seniorStatus.isAwake ? 'おやすみなさい' : 'おはようございます！')
  }

  const handleOuting = () => {
    addActivity(seniorStatus.isOutside ? 'return' : 'outing')
    showActionFeedback(seniorStatus.isOutside ? 'おかえりなさい' : 'いってらっしゃい！')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm p-4">
        <div className="max-w-lg mx-auto flex items-center justify-between">
          <div>
            <p className="text-senior-xl font-bold text-gray-800">
              {format(currentTime, 'M月d日（E）', { locale: ja })}
            </p>
            <p className="text-senior-2xl font-bold text-primary-600">
              {format(currentTime, 'HH:mm')}
            </p>
          </div>
          <button 
            onClick={() => navigate('/settings')}
            className="p-4 hover:bg-gray-100 rounded-full transition-colors"
            aria-label="設定"
          >
            <Settings className="w-8 h-8 text-gray-600" />
          </button>
        </div>
      </header>

      {/* フィードバックトースト */}
      {showFeedback && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 
                        bg-success-500 text-white px-8 py-4 rounded-2xl 
                        shadow-lg text-senior-lg font-bold fade-in">
          {showFeedback}
        </div>
      )}

      <main className="max-w-lg mx-auto p-4 pb-8 space-y-6">
        {/* メインアクション：元気ですボタン */}
        <section className="card-senior">
          <button
            onClick={handleCheckIn}
            className="w-full btn-senior btn-success pulse-gentle 
                       flex items-center justify-center gap-4 text-senior-xl"
          >
            <Heart className="w-10 h-10" />
            元気です！
          </button>
          {seniorStatus.lastCheckIn && (
            <p className="text-center mt-4 text-gray-600">
              最後の報告: {format(seniorStatus.lastCheckIn, 'HH:mm', { locale: ja })}
            </p>
          )}
          <p className="text-center mt-2 text-primary-600 font-bold">
            今日 {seniorStatus.todayCheckIns} 回報告しました
          </p>
        </section>

        {/* 緊急ボタン */}
        <section className="card-senior border-2 border-danger-200">
          <button
            onClick={handleEmergency}
            className={`w-full btn-senior flex items-center justify-center gap-4 text-senior-xl
                       ${showEmergencyConfirm ? 'btn-danger animate-pulse' : 'btn-warning'}`}
          >
            <AlertTriangle className="w-10 h-10" />
            {showEmergencyConfirm ? '本当に緊急連絡する？' : '緊急連絡'}
          </button>
          {showEmergencyConfirm && (
            <p className="text-center mt-4 text-danger-600 font-bold">
              もう一度押すと家族に緊急連絡されます
            </p>
          )}
        </section>

        {/* 日常アクション */}
        <section className="card-senior">
          <h2 className="text-senior-lg font-bold text-gray-700 mb-6 text-center">
            今日の記録
          </h2>
          <div className="grid grid-cols-2 gap-4">
            {/* 食事 */}
            <button
              onClick={handleMeal}
              className="btn-senior bg-orange-100 text-orange-700 hover:bg-orange-200
                         flex flex-col items-center justify-center gap-2"
            >
              <Utensils className="w-8 h-8" />
              <span>食事した</span>
            </button>

            {/* お薬 */}
            <button
              onClick={handleMedicine}
              className="btn-senior bg-purple-100 text-purple-700 hover:bg-purple-200
                         flex flex-col items-center justify-center gap-2"
            >
              <Pill className="w-8 h-8" />
              <span>お薬飲んだ</span>
            </button>

            {/* 起床/就寝 */}
            <button
              onClick={handleSleep}
              className={`btn-senior flex flex-col items-center justify-center gap-2
                         ${seniorStatus.isAwake 
                           ? 'bg-indigo-100 text-indigo-700 hover:bg-indigo-200' 
                           : 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200'}`}
            >
              {seniorStatus.isAwake ? (
                <>
                  <Moon className="w-8 h-8" />
                  <span>寝ます</span>
                </>
              ) : (
                <>
                  <Sun className="w-8 h-8" />
                  <span>起きました</span>
                </>
              )}
            </button>

            {/* 外出/帰宅 */}
            <button
              onClick={handleOuting}
              className={`btn-senior flex flex-col items-center justify-center gap-2
                         ${seniorStatus.isOutside 
                           ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                           : 'bg-sky-100 text-sky-700 hover:bg-sky-200'}`}
            >
              {seniorStatus.isOutside ? (
                <>
                  <Home className="w-8 h-8" />
                  <span>帰りました</span>
                </>
              ) : (
                <>
                  <MapPin className="w-8 h-8" />
                  <span>出かけます</span>
                </>
              )}
            </button>
          </div>
        </section>

        {/* 家族に電話 */}
        <section className="card-senior">
          <a
            href="tel:+81-90-0000-0000"
            className="w-full btn-senior btn-primary 
                       flex items-center justify-center gap-4 text-senior-xl"
          >
            <Phone className="w-10 h-10" />
            家族に電話する
          </a>
        </section>
      </main>
    </div>
  )
}
