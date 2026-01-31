import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export default function PWAInstallPrompt() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)
  const [isInstalled, setIsInstalled] = useState(false)

  useEffect(() => {
    // すでにインストール済みかチェック
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true)
      return
    }

    // インストールプロンプトをキャッチ
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault()
      setInstallPrompt(e as BeforeInstallPromptEvent)
      
      // 3秒後にプロンプト表示
      setTimeout(() => {
        setShowPrompt(true)
      }, 3000)
    }

    window.addEventListener('beforeinstallprompt', handleBeforeInstall)

    // インストール完了を検知
    window.addEventListener('appinstalled', () => {
      setIsInstalled(true)
      setShowPrompt(false)
    })

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstall)
    }
  }, [])

  const handleInstall = async () => {
    if (!installPrompt) return

    await installPrompt.prompt()
    const { outcome } = await installPrompt.userChoice
    
    if (outcome === 'accepted') {
      setIsInstalled(true)
    }
    setShowPrompt(false)
    setInstallPrompt(null)
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    // 24時間は表示しない
    localStorage.setItem('pwa-prompt-dismissed', Date.now().toString())
  }

  // 非表示条件
  if (isInstalled || !showPrompt || !installPrompt) {
    return null
  }

  // 24時間以内に閉じた場合は表示しない
  const dismissedAt = localStorage.getItem('pwa-prompt-dismissed')
  if (dismissedAt && Date.now() - parseInt(dismissedAt) < 24 * 60 * 60 * 1000) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 fade-in">
      <div className="max-w-md mx-auto bg-white rounded-2xl shadow-2xl border border-gray-100 p-4">
        <div className="flex items-start gap-4">
          {/* アイコン */}
          <div className="w-14 h-14 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0">
            <Download className="w-7 h-7 text-primary-600" />
          </div>
          
          {/* テキスト */}
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-gray-800 mb-1">
              ホーム画面に追加
            </h3>
            <p className="text-sm text-gray-600">
              アプリとしてインストールすると、より便利に使えます
            </p>
          </div>
          
          {/* 閉じるボタン */}
          <button
            onClick={handleDismiss}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors flex-shrink-0"
            aria-label="閉じる"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>
        </div>
        
        {/* ボタン */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleDismiss}
            className="flex-1 py-3 px-4 text-gray-600 font-medium rounded-xl
                     hover:bg-gray-100 transition-colors"
          >
            あとで
          </button>
          <button
            onClick={handleInstall}
            className="flex-1 py-3 px-4 bg-primary-500 text-white font-bold rounded-xl
                     hover:bg-primary-600 transition-colors flex items-center justify-center gap-2"
          >
            <Download className="w-5 h-5" />
            インストール
          </button>
        </div>
      </div>
    </div>
  )
}
