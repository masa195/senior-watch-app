import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Bell, 
  User, 
  Phone, 
  Shield,
  LogOut,
  Volume2,
  MessageCircle,
  Check,
  ExternalLink
} from 'lucide-react'
import { 
  getLineSettings, 
  saveLineSettings, 
  getNotifyActivityTypes,
  saveNotifyActivityTypes 
} from '../lib/lineNotify'

interface SettingsProps {
  onLogout: () => void
  role: 'senior' | 'family'
}

export default function Settings({ onLogout, role }: SettingsProps) {
  const navigate = useNavigate()
  const isSenior = role === 'senior'

  // LINE設定の状態
  const [lineToken, setLineToken] = useState('')
  const [lineEnabled, setLineEnabled] = useState(false)
  const [notifyTypes, setNotifyTypes] = useState<string[]>([])
  const [showTokenSaved, setShowTokenSaved] = useState(false)

  // 初期化
  useEffect(() => {
    const settings = getLineSettings()
    setLineToken(settings.token)
    setLineEnabled(settings.enabled)
    setNotifyTypes(getNotifyActivityTypes())
  }, [])

  const handleNotificationPermission = async () => {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission()
      if (permission === 'granted') {
        new Notification('通知が有効になりました', {
          body: 'アラートを受け取れるようになりました',
        })
      }
    }
  }

  // LINE設定を保存
  const handleSaveLineSettings = () => {
    saveLineSettings(lineToken, lineEnabled)
    saveNotifyActivityTypes(notifyTypes)
    setShowTokenSaved(true)
    setTimeout(() => setShowTokenSaved(false), 2000)
  }

  // 通知タイプのトグル
  const toggleNotifyType = (type: string) => {
    setNotifyTypes(prev => 
      prev.includes(type) 
        ? prev.filter(t => t !== type)
        : [...prev, type]
    )
  }

  const activityTypeLabels: Record<string, string> = {
    check_in: '💚 元気です報告',
    emergency: '🚨 緊急連絡',
    meal: '🍽️ 食事',
    medicine: '💊 服薬',
    sleep: '🌙 就寝',
    wake: '☀️ 起床',
    outing: '🚶 外出',
    return: '🏠 帰宅',
  }

  return (
    <div className={`min-h-screen ${isSenior ? 'bg-gradient-to-br from-green-50 to-blue-50' : 'bg-gray-50'}`}>
      {/* ヘッダー */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-lg mx-auto p-4 flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className={`${isSenior ? 'p-4' : 'p-2'} hover:bg-gray-100 rounded-full transition-colors`}
          >
            <ArrowLeft className={`${isSenior ? 'w-8 h-8' : 'w-6 h-6'} text-gray-600`} />
          </button>
          <h1 className={`font-bold text-gray-800 ${isSenior ? 'text-senior-xl' : 'text-xl'}`}>
            設定
          </h1>
        </div>
      </header>

      {/* 保存完了トースト */}
      {showTokenSaved && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 
                        bg-green-500 text-white px-6 py-3 rounded-xl 
                        shadow-lg font-bold fade-in flex items-center gap-2">
          <Check className="w-5 h-5" />
          設定を保存しました
        </div>
      )}

      <main className="max-w-lg mx-auto p-4 space-y-4">
        {/* プロフィール */}
        <div className={isSenior ? 'card-senior' : 'card'}>
          <h2 className={`font-bold text-gray-800 mb-4 ${isSenior ? 'text-senior-lg' : 'text-lg'}`}>
            プロフィール
          </h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <div className={`${isSenior ? 'w-16 h-16' : 'w-12 h-12'} bg-primary-100 rounded-full 
                            flex items-center justify-center`}>
                <User className={`${isSenior ? 'w-8 h-8' : 'w-6 h-6'} text-primary-600`} />
              </div>
              <div>
                <p className={`font-bold text-gray-800 ${isSenior ? 'text-senior-base' : ''}`}>
                  {isSenior ? '見守られる方' : '見守る家族'}
                </p>
                <p className="text-gray-500 text-sm">
                  {isSenior ? '高齢者モード' : '家族モード'}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* LINE通知設定（家族のみ） */}
        {!isSenior && (
          <div className="card">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                <MessageCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h2 className="font-bold text-gray-800 text-lg">LINE通知</h2>
                <p className="text-sm text-gray-500">高齢者の活動をLINEで受け取る</p>
              </div>
            </div>

            {/* LINE Notify有効/無効 */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-4">
              <span className="text-gray-800 font-medium">LINE通知を有効にする</span>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  className="sr-only peer" 
                  checked={lineEnabled}
                  onChange={(e) => setLineEnabled(e.target.checked)}
                />
                <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 
                              peer-focus:ring-green-300 rounded-full peer 
                              peer-checked:after:translate-x-full peer-checked:after:border-white 
                              after:content-[''] after:absolute after:top-[4px] after:left-[4px] 
                              after:bg-white after:rounded-full after:h-6 after:w-6 
                              after:transition-all peer-checked:bg-green-500"></div>
              </label>
            </div>

            {/* トークン入力 */}
            <div className="space-y-2 mb-4">
              <label className="text-sm font-medium text-gray-700">
                LINE Notifyトークン
              </label>
              <input
                type="password"
                value={lineToken}
                onChange={(e) => setLineToken(e.target.value)}
                placeholder="トークンを入力..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl
                         focus:outline-none focus:ring-2 focus:ring-green-300 focus:border-green-500"
              />
              <a
                href="https://notify-bot.line.me/ja/"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm text-green-600 hover:underline"
              >
                トークンを取得する
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* 通知する活動タイプ */}
            <div className="space-y-2 mb-4">
              <label className="text-sm font-medium text-gray-700">
                通知する活動
              </label>
              <div className="grid grid-cols-2 gap-2">
                {Object.entries(activityTypeLabels).map(([type, label]) => (
                  <button
                    key={type}
                    onClick={() => toggleNotifyType(type)}
                    className={`p-3 rounded-xl text-sm font-medium transition-colors text-left
                              ${notifyTypes.includes(type)
                                ? 'bg-green-100 text-green-700 border-2 border-green-300'
                                : 'bg-gray-50 text-gray-600 border-2 border-transparent'}`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* 保存ボタン */}
            <button
              onClick={handleSaveLineSettings}
              className="w-full py-3 bg-green-500 text-white font-bold rounded-xl
                       hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
            >
              <Check className="w-5 h-5" />
              設定を保存
            </button>
          </div>
        )}

        {/* 通知設定 */}
        <div className={isSenior ? 'card-senior' : 'card'}>
          <h2 className={`font-bold text-gray-800 mb-4 ${isSenior ? 'text-senior-lg' : 'text-lg'}`}>
            アプリ通知
          </h2>
          <div className="space-y-4">
            <button
              onClick={handleNotificationPermission}
              className={`w-full flex items-center justify-between p-4 
                        bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors
                        ${isSenior ? 'text-senior-base' : ''}`}
            >
              <div className="flex items-center gap-3">
                <Bell className={`${isSenior ? 'w-6 h-6' : 'w-5 h-5'} text-gray-600`} />
                <span className="text-gray-800 font-medium">ブラウザ通知を許可</span>
              </div>
              <span className="text-primary-600 text-sm font-medium">設定</span>
            </button>

            {isSenior && (
              <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Volume2 className="w-6 h-6 text-gray-600" />
                  <span className="text-gray-800 font-medium text-senior-base">音声ガイド</span>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" className="sr-only peer" defaultChecked />
                  <div className="w-14 h-8 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 
                                peer-focus:ring-primary-300 rounded-full peer 
                                peer-checked:after:translate-x-full peer-checked:after:border-white 
                                after:content-[''] after:absolute after:top-[4px] after:left-[4px] 
                                after:bg-white after:rounded-full after:h-6 after:w-6 
                                after:transition-all peer-checked:bg-primary-500"></div>
                </label>
              </div>
            )}
          </div>
        </div>

        {/* 緊急連絡先 */}
        <div className={isSenior ? 'card-senior' : 'card'}>
          <h2 className={`font-bold text-gray-800 mb-4 ${isSenior ? 'text-senior-lg' : 'text-lg'}`}>
            緊急連絡先
          </h2>
          <div className="space-y-3">
            <div className={`flex items-center gap-3 p-4 bg-gray-50 rounded-xl
                          ${isSenior ? 'text-senior-base' : ''}`}>
              <Phone className={`${isSenior ? 'w-6 h-6' : 'w-5 h-5'} text-gray-600`} />
              <div className="flex-1">
                <p className="text-gray-800 font-medium">家族（太郎さん）</p>
                <p className="text-gray-500 text-sm">090-0000-0000</p>
              </div>
            </div>
            <div className={`flex items-center gap-3 p-4 bg-gray-50 rounded-xl
                          ${isSenior ? 'text-senior-base' : ''}`}>
              <Shield className={`${isSenior ? 'w-6 h-6' : 'w-5 h-5'} text-red-600`} />
              <div className="flex-1">
                <p className="text-gray-800 font-medium">救急（119）</p>
                <p className="text-gray-500 text-sm">緊急時のみ</p>
              </div>
            </div>
          </div>
        </div>

        {/* アプリ情報 */}
        <div className={isSenior ? 'card-senior' : 'card'}>
          <h2 className={`font-bold text-gray-800 mb-4 ${isSenior ? 'text-senior-lg' : 'text-lg'}`}>
            アプリ情報
          </h2>
          <div className="space-y-2 text-gray-600">
            <div className="flex justify-between">
              <span>バージョン</span>
              <span className="font-medium">1.1.0</span>
            </div>
            <div className="flex justify-between">
              <span>最終更新</span>
              <span className="font-medium">2026年1月</span>
            </div>
          </div>
        </div>

        {/* ログアウト */}
        <button
          onClick={() => {
            if (confirm('ログアウトしますか？')) {
              onLogout()
              navigate('/')
            }
          }}
          className={`w-full flex items-center justify-center gap-3 
                    bg-red-50 hover:bg-red-100 text-red-600 font-bold 
                    rounded-2xl transition-colors
                    ${isSenior ? 'p-6 text-senior-lg' : 'p-4'}`}
        >
          <LogOut className={`${isSenior ? 'w-6 h-6' : 'w-5 h-5'}`} />
          モードを切り替える
        </button>

        {/* フッター */}
        <p className={`text-center text-gray-400 ${isSenior ? 'text-senior-sm py-4' : 'text-sm py-2'}`}>
          © 2026 デジタル同居プロジェクト
        </p>
      </main>
    </div>
  )
}
