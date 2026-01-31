import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Gamepad2 } from 'lucide-react'

interface GameInfo {
  id: string
  title: string
  emoji: string
  description: string
  color: string
  bgColor: string
  path: string
}

const games: GameInfo[] = [
  {
    id: 'memory',
    title: '神経衰弱',
    emoji: '🃏',
    description: '同じ絵を見つけよう！記憶力を鍛えるゲーム',
    color: 'text-purple-600',
    bgColor: 'from-purple-50 to-pink-50',
    path: '/games/memory',
  },
  {
    id: 'spot',
    title: '間違い探し',
    emoji: '🧩',
    description: '1つだけ違うものを探そう！観察力アップ',
    color: 'text-green-600',
    bgColor: 'from-green-50 to-teal-50',
    path: '/games/spot-difference',
  },
  {
    id: 'proverb',
    title: 'ことわざカルタ',
    emoji: '🎴',
    description: '上の句に続く下の句は？日本の知恵を学ぼう',
    color: 'text-amber-600',
    bgColor: 'from-amber-50 to-orange-50',
    path: '/games/proverb',
  },
  {
    id: 'brain',
    title: '脳トレクイズ',
    emoji: '🧠',
    description: '計算・漢字・色クイズで脳を活性化！',
    color: 'text-indigo-600',
    bgColor: 'from-indigo-50 to-purple-50',
    path: '/brain-training',
  },
]

export default function GameSelect() {
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-lg mx-auto p-4 flex items-center gap-4">
          <button 
            onClick={() => navigate('/')}
            className="p-3 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ArrowLeft className="w-8 h-8 text-gray-600" />
          </button>
          <div className="flex items-center gap-3">
            <Gamepad2 className="w-8 h-8 text-indigo-600" />
            <h1 className="text-senior-xl font-bold text-gray-800">
              ゲームで遊ぼう
            </h1>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-4">
        {/* 説明 */}
        <div className="text-center py-4">
          <p className="text-senior-lg text-gray-600">
            🎮 好きなゲームを選んでね！
          </p>
        </div>

        {/* ゲーム一覧 */}
        <div className="space-y-4">
          {games.map(game => (
            <button
              key={game.id}
              onClick={() => navigate(game.path)}
              className={`w-full card-senior bg-gradient-to-br ${game.bgColor} 
                        hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]
                        text-left`}
            >
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 bg-white/60 rounded-2xl flex items-center justify-center text-5xl">
                  {game.emoji}
                </div>
                <div className="flex-1">
                  <h2 className={`text-senior-lg font-bold ${game.color}`}>
                    {game.title}
                  </h2>
                  <p className="text-gray-600 mt-1">
                    {game.description}
                  </p>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* おすすめ */}
        <div className="card bg-gradient-to-r from-yellow-50 to-amber-50 border-2 border-yellow-200">
          <div className="flex items-center gap-3">
            <span className="text-3xl">💡</span>
            <div>
              <p className="font-bold text-gray-800">今日のおすすめ</p>
              <p className="text-sm text-gray-600">
                毎日少しずつ遊ぶと脳が元気になりますよ！
              </p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
