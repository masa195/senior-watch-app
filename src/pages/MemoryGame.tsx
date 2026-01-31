import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, RotateCcw, Trophy, Clock } from 'lucide-react'

// カードの絵柄（絵文字）
const cardEmojis = ['🌸', '🍎', '🐱', '🌈', '⭐', '🎀', '🍰', '🌻']

interface Card {
  id: number
  emoji: string
  isFlipped: boolean
  isMatched: boolean
}

export default function MemoryGame() {
  const navigate = useNavigate()
  const [cards, setCards] = useState<Card[]>([])
  const [flippedCards, setFlippedCards] = useState<number[]>([])
  const [moves, setMoves] = useState(0)
  const [matches, setMatches] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)
  const [elapsedTime, setElapsedTime] = useState(0)

  // ゲーム初期化
  const initGame = () => {
    const shuffledEmojis = [...cardEmojis, ...cardEmojis]
      .sort(() => Math.random() - 0.5)
    
    const newCards: Card[] = shuffledEmojis.map((emoji, index) => ({
      id: index,
      emoji,
      isFlipped: false,
      isMatched: false,
    }))
    
    setCards(newCards)
    setFlippedCards([])
    setMoves(0)
    setMatches(0)
    setIsComplete(false)
    setStartTime(new Date())
    setElapsedTime(0)
  }

  // 初回ロード時
  useEffect(() => {
    initGame()
  }, [])

  // タイマー
  useEffect(() => {
    if (!startTime || isComplete) return
    
    const timer = setInterval(() => {
      setElapsedTime(Math.floor((Date.now() - startTime.getTime()) / 1000))
    }, 1000)
    
    return () => clearInterval(timer)
  }, [startTime, isComplete])

  // カードをクリック
  const handleCardClick = (id: number) => {
    if (flippedCards.length >= 2) return
    if (cards[id].isFlipped || cards[id].isMatched) return
    
    const newCards = [...cards]
    newCards[id].isFlipped = true
    setCards(newCards)
    
    const newFlipped = [...flippedCards, id]
    setFlippedCards(newFlipped)
    
    if (newFlipped.length === 2) {
      setMoves(prev => prev + 1)
      
      const [first, second] = newFlipped
      if (cards[first].emoji === cards[second].emoji) {
        // マッチ！
        setTimeout(() => {
          const matchedCards = [...cards]
          matchedCards[first].isMatched = true
          matchedCards[second].isMatched = true
          setCards(matchedCards)
          setFlippedCards([])
          setMatches(prev => {
            const newMatches = prev + 1
            if (newMatches === cardEmojis.length) {
              setIsComplete(true)
            }
            return newMatches
          })
        }, 500)
      } else {
        // マッチしない
        setTimeout(() => {
          const resetCards = [...cards]
          resetCards[first].isFlipped = false
          resetCards[second].isFlipped = false
          setCards(resetCards)
          setFlippedCards([])
        }, 1000)
      }
    }
  }

  // 時間フォーマット
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50">
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
              🃏 神経衰弱
            </h1>
          </div>
          <button
            onClick={initGame}
            className="p-3 hover:bg-gray-100 rounded-full transition-colors"
          >
            <RotateCcw className="w-6 h-6 text-gray-600" />
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-4">
        {/* スコア */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2 px-4 py-2 bg-white rounded-xl shadow">
            <Clock className="w-5 h-5 text-blue-500" />
            <span className="font-bold text-gray-700">{formatTime(elapsedTime)}</span>
          </div>
          <div className="px-4 py-2 bg-white rounded-xl shadow">
            <span className="font-bold text-gray-700">手数: {moves}</span>
          </div>
          <div className="px-4 py-2 bg-white rounded-xl shadow">
            <span className="font-bold text-gray-700">{matches}/{cardEmojis.length}</span>
          </div>
        </div>

        {/* カード */}
        <div className="grid grid-cols-4 gap-3">
          {cards.map(card => (
            <button
              key={card.id}
              onClick={() => handleCardClick(card.id)}
              disabled={card.isFlipped || card.isMatched}
              className={`aspect-square rounded-2xl text-4xl flex items-center justify-center
                        transition-all duration-300 transform
                        ${card.isFlipped || card.isMatched
                          ? 'bg-white shadow-lg scale-105'
                          : 'bg-gradient-to-br from-purple-400 to-pink-400 hover:scale-105 cursor-pointer'
                        }
                        ${card.isMatched ? 'opacity-60' : ''}`}
            >
              {(card.isFlipped || card.isMatched) ? (
                <span className="animate-bounce">{card.emoji}</span>
              ) : (
                <span className="text-white text-2xl">？</span>
              )}
            </button>
          ))}
        </div>

        {/* クリア画面 */}
        {isComplete && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-3xl p-8 text-center max-w-sm w-full animate-bounce">
              <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
              <h2 className="text-senior-xl font-bold text-gray-800 mb-2">
                🎉 クリア！
              </h2>
              <p className="text-senior-lg text-gray-600 mb-2">
                タイム: {formatTime(elapsedTime)}
              </p>
              <p className="text-senior-lg text-gray-600 mb-6">
                手数: {moves}回
              </p>
              <div className="space-y-3">
                <button
                  onClick={initGame}
                  className="w-full btn-senior btn-primary"
                >
                  もう一度
                </button>
                <button
                  onClick={() => navigate('/games')}
                  className="w-full btn-senior bg-gray-100 text-gray-700 hover:bg-gray-200"
                >
                  他のゲーム
                </button>
              </div>
            </div>
          </div>
        )}

        {/* 遊び方 */}
        <div className="card bg-purple-50">
          <h3 className="font-bold text-gray-700 mb-2">📖 遊び方</h3>
          <p className="text-gray-600">
            カードをタップして同じ絵を2枚見つけましょう！
            できるだけ少ない手数でクリアを目指してね。
          </p>
        </div>
      </main>
    </div>
  )
}
