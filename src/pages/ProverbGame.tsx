import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Trophy, ChevronRight, Volume2 } from 'lucide-react'

// ことわざデータ
interface Proverb {
  first: string  // 上の句
  second: string // 下の句
  meaning: string
}

const proverbs: Proverb[] = [
  { first: '笑う門には', second: '福来る', meaning: '明るく笑っている家には幸せが来る' },
  { first: '石の上にも', second: '三年', meaning: '辛抱強く続ければ必ず成功する' },
  { first: '猿も木から', second: '落ちる', meaning: '名人でも失敗することがある' },
  { first: '七転び', second: '八起き', meaning: '何度失敗しても立ち上がる' },
  { first: '花より', second: '団子', meaning: '風流より実用を取る' },
  { first: '急がば', second: '回れ', meaning: '急ぐときほど安全な道を選ぶべき' },
  { first: '塵も積もれば', second: '山となる', meaning: '小さなことも積み重ねると大きくなる' },
  { first: '犬も歩けば', second: '棒に当たる', meaning: '行動すれば思わぬ幸運に出会う' },
  { first: '一石', second: '二鳥', meaning: '一つの行動で二つの利益を得る' },
  { first: '井の中の蛙', second: '大海を知らず', meaning: '狭い世界しか知らない' },
  { first: '雨降って', second: '地固まる', meaning: '困難の後は前より良くなる' },
  { first: '継続は', second: '力なり', meaning: '続けることが力になる' },
  { first: '百聞は', second: '一見にしかず', meaning: '聞くより見る方が確実' },
  { first: '早起きは', second: '三文の徳', meaning: '早起きは良いことがある' },
  { first: '転ばぬ先の', second: '杖', meaning: '事前に準備しておくことが大切' },
]

export default function ProverbGame() {
  const navigate = useNavigate()
  const [currentProverb, setCurrentProverb] = useState<Proverb | null>(null)
  const [options, setOptions] = useState<string[]>([])
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [score, setScore] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [usedIndexes, setUsedIndexes] = useState<number[]>([])

  // 新しい問題を生成
  const generateQuestion = () => {
    // まだ使っていない問題を選ぶ
    const availableIndexes = proverbs.map((_, i) => i).filter(i => !usedIndexes.includes(i))
    
    if (availableIndexes.length === 0) {
      // 全問終了したらリセット
      setUsedIndexes([])
      return
    }
    
    const randomIndex = availableIndexes[Math.floor(Math.random() * availableIndexes.length)]
    const proverb = proverbs[randomIndex]
    
    // 選択肢を生成（正解＋3つの不正解）
    const wrongAnswers = proverbs
      .filter((_, i) => i !== randomIndex)
      .map(p => p.second)
      .sort(() => Math.random() - 0.5)
      .slice(0, 3)
    
    const allOptions = [...wrongAnswers, proverb.second].sort(() => Math.random() - 0.5)
    
    setCurrentProverb(proverb)
    setOptions(allOptions)
    setSelectedAnswer(null)
    setIsCorrect(null)
    setUsedIndexes(prev => [...prev, randomIndex])
  }

  // 初回ロード
  useEffect(() => {
    generateQuestion()
  }, [])

  // 回答をチェック
  const handleAnswer = (answer: string) => {
    if (selectedAnswer !== null || !currentProverb) return
    
    setSelectedAnswer(answer)
    const correct = answer === currentProverb.second
    setIsCorrect(correct)
    setTotalQuestions(prev => prev + 1)
    
    if (correct) {
      setScore(prev => prev + 1)
    }
  }

  // 読み上げ機能
  const speakText = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.lang = 'ja-JP'
      utterance.rate = 0.8 // ゆっくり
      speechSynthesis.speak(utterance)
    }
  }

  if (!currentProverb) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 flex items-center justify-center">
        <div className="card-senior text-center">
          <Trophy className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
          <h2 className="text-senior-xl font-bold text-gray-800 mb-2">
            🎉 全問クリア！
          </h2>
          <p className="text-senior-lg text-gray-600 mb-6">
            スコア: {score}/{totalQuestions}
          </p>
          <button
            onClick={() => {
              setUsedIndexes([])
              setScore(0)
              setTotalQuestions(0)
              generateQuestion()
            }}
            className="btn-senior btn-primary w-full"
          >
            もう一度挑戦
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50">
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
              🎴 ことわざカルタ
            </h1>
          </div>
          <div className="px-4 py-2 bg-yellow-100 rounded-full">
            <span className="font-bold text-yellow-700">🏆 {score}/{totalQuestions}</span>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-6">
        {/* 上の句カード */}
        <div className="card-senior bg-gradient-to-br from-red-50 to-orange-50 border-2 border-red-200">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-red-600 font-medium">上の句</span>
            <button
              onClick={() => speakText(currentProverb.first)}
              className="p-2 hover:bg-red-100 rounded-full transition-colors"
            >
              <Volume2 className="w-5 h-5 text-red-500" />
            </button>
          </div>
          <p className="text-senior-2xl font-bold text-center text-gray-800 py-4">
            「{currentProverb.first}」
          </p>
          <p className="text-center text-gray-500">
            続きはどれ？
          </p>
        </div>

        {/* 選択肢 */}
        <div className="space-y-3">
          {options.map((option, index) => {
            let buttonClass = 'card-senior cursor-pointer transition-all hover:shadow-lg hover:scale-[1.02]'
            
            if (selectedAnswer !== null) {
              if (option === currentProverb.second) {
                buttonClass = 'card-senior bg-green-100 border-2 border-green-400'
              } else if (option === selectedAnswer) {
                buttonClass = 'card-senior bg-red-100 border-2 border-red-400'
              } else {
                buttonClass = 'card-senior opacity-50'
              }
            }
            
            return (
              <button
                key={index}
                onClick={() => handleAnswer(option)}
                disabled={selectedAnswer !== null}
                className={`${buttonClass} w-full text-left`}
              >
                <p className="text-senior-lg font-bold text-gray-800">
                  {option}
                </p>
              </button>
            )
          })}
        </div>

        {/* 結果表示 */}
        {isCorrect !== null && (
          <div className={`card-senior text-center fade-in ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
            <p className={`text-senior-xl font-bold mb-2 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
              {isCorrect ? '🎉 正解！' : '😢 残念...'}
            </p>
            
            {/* ことわざ全文と意味 */}
            <div className="p-4 bg-white/60 rounded-xl mb-4">
              <p className="text-senior-lg font-bold text-gray-800 mb-2">
                「{currentProverb.first}{currentProverb.second}」
              </p>
              <p className="text-gray-600">
                意味: {currentProverb.meaning}
              </p>
            </div>
            
            <button
              onClick={generateQuestion}
              className="btn-senior btn-primary flex items-center justify-center gap-2 w-full"
            >
              次の問題
              <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
