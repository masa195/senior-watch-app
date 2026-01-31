import { useNavigate } from 'react-router-dom'
import { 
  ArrowLeft, 
  Bell, 
  User, 
  Phone, 
  Shield,
  LogOut,
  Moon,
  Volume2,
  Smartphone
} from 'lucide-react'

interface SettingsProps {
  onLogout: () => void
  role: 'senior' | 'family'
}

export default function Settings({ onLogout, role }: SettingsProps) {
  const navigate = useNavigate()
  const isSenior = role === 'senior'

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

        {/* 通知設定 */}
        <div className={isSenior ? 'card-senior' : 'card'}>
          <h2 className={`font-bold text-gray-800 mb-4 ${isSenior ? 'text-senior-lg' : 'text-lg'}`}>
            通知
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
                <span className="text-gray-800 font-medium">通知を許可する</span>
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
              <span className="font-medium">1.0.0</span>
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
