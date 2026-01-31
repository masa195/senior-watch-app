import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Eye, ChevronRight } from 'lucide-react'

// 間違い探しの問題データ
interface DiffPuzzle {
  id: number
  title: string
  gridSize: number // 4x4, 5x5など
  emojis: string[]
  differentIndex: number
  differentEmoji: string
  hint: string
}

const puzzles: DiffPuzzle[] = [
  {
    id: 1,
    title: '🍎 りんごの中に...',
    gridSize: 9,
    emojis: ['🍎','🍎','🍎','🍎','🍎','🍎','🍎','🍎','🍎'],
    differentIndex: 4,
    differentEmoji: '🍊',
    hint: '色が違うものを探してね',
  },
  {
    id: 2,
    title: '😊 笑顔の中に...',
    gridSize: 9,
    emojis: ['😊','😊','😊','😊','😊','😊','😊','😊','😊'],
    differentIndex: 7,
    differentEmoji: '😢',
    hint: '表情が違うものを探してね',
  },
  {
    id: 3,
    title: '🌸 桜の中に...',
    gridSize: 9,
    emojis: ['🌸','🌸','🌸','🌸','🌸','🌸','🌸','🌸','🌸'],
    differentIndex: 2,
    differentEmoji: '🌺',
    hint: '花びらの形が違うものを探してね',
  },
  {
    id: 4,
    title: '🐱 猫の中に...',
    gridSize: 12,
    emojis: ['🐱','🐱','🐱','🐱','🐱','🐱','🐱','🐱','🐱','🐱','🐱','🐱'],
    differentIndex: 8,
    differentEmoji: '🐶',
    hint: '動物が違うものを探してね',
  },
  {
    id: 5,
    title: '⭐ 星の中に...',
    gridSize: 12,
    emojis: ['⭐','⭐','⭐','⭐','⭐','⭐','⭐','⭐','⭐','⭐','⭐','⭐'],
    differentIndex: 5,
    differentEmoji: '🌙',
    hint: '形が違うものを探してね',
  },
  {
    id: 6,
    title: '🍰 ケーキの中に...',
    gridSize: 16,
    emojis: ['🍰','🍰','🍰','🍰','🍰','🍰','🍰','🍰','🍰','🍰','🍰','🍰','🍰','🍰','🍰','🍰'],
    differentIndex: 11,
    differentEmoji: '🎂',
    hint: 'ろうそくがあるものを探してね',
  },
  {
    id: 7,
    title: '🐟 魚の中に...',
    gridSize: 16,
    emojis: ['🐟','🐟','🐟','🐟','🐟','🐟','🐟','🐟','🐟','🐟','🐟','🐟','🐟','🐟','🐟','🐟'],
    differentIndex: 3,
    differentEmoji: '🐙',
    hint: '足がたくさんあるものを探してね',
  },
  {
    id: 8,
    title: '🌻 ひまわりの中に...',
    gridSize: 16,
    emojis: ['🌻','🌻','🌻','🌻','🌻','🌻','🌻','🌻','🌻','🌻','🌻','🌻','🌻','🌻','🌻','🌻'],
    differentIndex: 14,
    differentEmoji: '🌹',
    hint: '赤い花を探してね',
  },
]

export default function SpotDifference() {
  const navigate = useNavigate()
  const [currentPuzzle, setCurrentPuzzle] = useState<DiffPuzzle | null>(null)
  const [displayEmojis, setDisplayEmojis] = useState<string[]>([])
  const [found, setFound] = useState(false)
  const [showHint, setShowHint] = useState(false)
  const [score, setScore] = useState(0)
  const [puzzleIndex, setPuzzleIndex] = useState(0)
  const [wrongClicks, setWrongClicks] = useState(0)

  // パズルをセット
  const setupPuzzle = (index: number) => {
    const puzzle = puzzles[index % puzzles.length]
    const emojis = [...puzzle.emojis]
    emojis[puzzle.differentIndex] = puzzle.differentEmoji
    
    setCurrentPuzzle(puzzle)
    setDisplayEmojis(emojis)
    setFound(false)
    setShowHint(false)
    setWrongClicks(0)
  }

  // 初回ロード
  useEffect(() => {
    setupPuzzle(0)
  }, [])

  // クリック処理
  const handleClick = (index: number) => {
    if (found || !currentPuzzle) return
    
    if (index === currentPuzzle.differentIndex) {
      // 正解！
      setFound(true)
      setScore(prev => prev + 1)
    } else {
      // 不正解
      setWrongClicks(prev => prev + 1)
    }
  }

  // 次の問題
  const nextPuzzle = () => {
    const nextIndex = puzzleIndex + 1
    setPuzzleIndex(nextIndex)
    setupPuzzle(nextIndex)
  }

  // グリッドの列数を決定
  const getGridCols = (size: number) => {
    if (size <= 9) return 3
    if (size <= 16) return 4
    return 5
  }

  if (!currentPuzzle) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-teal-50">
      {/* ヘッダー */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-lg mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => navigate('/games')}
              className="p-3 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-8 h-8 text-gray-600" />
            </button>
            <h1 className="text-senior-xl font-bold text-gray-800">
              🧩 間違い探し
            </h1>
          </div>
          <div className="px-4 py-2 bg-yellow-100 rounded-full">
            <span className="font-bold text-yellow-700">🏆 {score}問</span>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-4">
        {/* 問題タイトル */}
        <div className="card-senior text-center bg-white">
          <p className="text-senior-xl font-bold text-gray-800">
            {currentPuzzle.title}
          </p>
          <p className="text-gray-600 mt-2">
            1つだけ違うものを見つけてね！
          </p>
        </div>

        {/* グリッド */}
        <div 
          className={`grid gap-2 p-4 bg-white rounded-3xl shadow-lg`}
          style={{ gridTemplateColumns: `repeat(${getGridCols(currentPuzzle.gridSize)}, 1fr)` }}
        >
          {displayEmojis.map((emoji, index) => (
            <button
              key={index}
              onClick={() => handleClick(index)}
              disabled={found}
              className={`aspect-square rounded-2xl text-4xl flex items-center justify-center
                        transition-all duration-200
                        ${found && index === currentPuzzle.differentIndex
                          ? 'bg-green-100 ring-4 ring-green-400 scale-110'
                          : 'bg-gray-50 hover:bg-gray-100 active:scale-95'
                        }
                        ${wrongClicks > 0 && index !== currentPuzzle.differentIndex && !found
                          ? 'hover:bg-red-50'
                          : ''
                        }`}
            >
              {emoji}
            </button>
          ))}
        </div>

        {/* 正解時 */}
        {found && (
          <div className="card-senior bg-green-50 text-center fade-in">
            <p className="text-senior-xl font-bold text-green-600 mb-4">
              🎉 正解！すごい！
            </p>
            <button
              onClick={nextPuzzle}
              className="btn-senior btn-success flex items-center justify-center gap-2 w-full"
            >
              次の問題
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}

        {/* ヒント */}
        {!found && (
          <div className="flex gap-3">
            <button
              onClick={() => setShowHint(true)}
              className="flex-1 py-4 bg-amber-100 text-amber-700 font-bold rounded-xl
                       flex items-center justify-center gap-2"
            >
              <Eye className="w-5 h-5" />
              ヒントを見る
            </button>
          </div>
        )}

        {showHint && !found && (
          <div className="card bg-amber-50">
            <p className="text-amber-800 font-medium">
              💡 ヒント: {currentPuzzle.hint}
            </p>
          </div>
        )}

        {/* 間違いカウント */}
        {wrongClicks > 0 && !found && (
          <p className="text-center text-gray-500">
            タップ回数: {wrongClicks}回
          </p>
        )}
      </main>
    </div>
  )
}
