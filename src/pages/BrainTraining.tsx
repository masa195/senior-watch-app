import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Brain, RefreshCw, Check, X, Trophy, Star } from 'lucide-react'

// クイズの種類
type QuizType = 'math' | 'kanji' | 'color' | 'memory'

interface Quiz {
  type: QuizType
  question: string
  options: string[]
  correctIndex: number
  explanation?: string
}

// 計算問題を生成
function generateMathQuiz(): Quiz {
  const operators = ['+', '-', '×']
  const operator = operators[Math.floor(Math.random() * operators.length)]
  
  let a: number, b: number, answer: number
  
  switch (operator) {
    case '+':
      a = Math.floor(Math.random() * 50) + 10
      b = Math.floor(Math.random() * 50) + 10
      answer = a + b
      break
    case '-':
      a = Math.floor(Math.random() * 50) + 30
      b = Math.floor(Math.random() * 30) + 1
      answer = a - b
      break
    case '×':
      a = Math.floor(Math.random() * 9) + 2
      b = Math.floor(Math.random() * 9) + 2
      answer = a * b
      break
    default:
      a = 10
      b = 5
      answer = 15
  }

  // 選択肢を生成（正解と近い数字）
  const options = [answer]
  while (options.length < 4) {
    const wrong = answer + Math.floor(Math.random() * 20) - 10
    if (wrong !== answer && wrong > 0 && !options.includes(wrong)) {
      options.push(wrong)
    }
  }
  
  // シャッフル
  const shuffled = options.sort(() => Math.random() - 0.5)
  const correctIndex = shuffled.indexOf(answer)

  return {
    type: 'math',
    question: `${a} ${operator} ${b} = ?`,
    options: shuffled.map(String),
    correctIndex,
  }
}

// 漢字の読み問題
const kanjiQuizzes: Quiz[] = [
  { type: 'kanji', question: '「挨拶」の読み方は？', options: ['あいさつ', 'かいさつ', 'あいしゃ', 'えつき'], correctIndex: 0 },
  { type: 'kanji', question: '「薔薇」の読み方は？', options: ['つばき', 'ばら', 'ぼたん', 'さくら'], correctIndex: 1 },
  { type: 'kanji', question: '「紫陽花」の読み方は？', options: ['しようか', 'むらさきばな', 'あじさい', 'すみれ'], correctIndex: 2 },
  { type: 'kanji', question: '「向日葵」の読み方は？', options: ['ひまわり', 'あさがお', 'たんぽぽ', 'コスモス'], correctIndex: 0 },
  { type: 'kanji', question: '「蒲公英」の読み方は？', options: ['ほうせんか', 'れんげ', 'たんぽぽ', 'すずらん'], correctIndex: 2 },
  { type: 'kanji', question: '「林檎」の読み方は？', options: ['みかん', 'りんご', 'ぶどう', 'もも'], correctIndex: 1 },
  { type: 'kanji', question: '「檸檬」の読み方は？', options: ['れもん', 'おれんじ', 'ばなな', 'めろん'], correctIndex: 0 },
  { type: 'kanji', question: '「胡瓜」の読み方は？', options: ['なす', 'きゅうり', 'とまと', 'にんじん'], correctIndex: 1 },
  { type: 'kanji', question: '「南瓜」の読み方は？', options: ['すいか', 'きゅうり', 'かぼちゃ', 'とうがん'], correctIndex: 2 },
  { type: 'kanji', question: '「海豚」の読み方は？', options: ['あざらし', 'くじら', 'いるか', 'らっこ'], correctIndex: 2 },
]

// 色の問題
const colorQuizzes: Quiz[] = [
  { type: 'color', question: '🍎 りんごは何色？', options: ['赤', '青', '黄', '緑'], correctIndex: 0 },
  { type: 'color', question: '🍌 バナナは何色？', options: ['赤', '青', '黄', '緑'], correctIndex: 2 },
  { type: 'color', question: '🥒 きゅうりは何色？', options: ['赤', '青', '黄', '緑'], correctIndex: 3 },
  { type: 'color', question: '☀️ 太陽は何色？', options: ['白', '青', '黄', '緑'], correctIndex: 2 },
  { type: 'color', question: '🌊 海は何色？', options: ['赤', '青', '黄', '緑'], correctIndex: 1 },
  { type: 'color', question: '🍊 みかんは何色？', options: ['赤', 'オレンジ', '黄', '緑'], correctIndex: 1 },
  { type: 'color', question: '🍆 なすは何色？', options: ['赤', '紫', '黄', '緑'], correctIndex: 1 },
  { type: 'color', question: '🥕 にんじんは何色？', options: ['赤', 'オレンジ', '黄', '緑'], correctIndex: 1 },
]

export default function BrainTraining() {
  const navigate = useNavigate()
  const [currentQuiz, setCurrentQuiz] = useState<Quiz | null>(null)
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null)
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null)
  const [score, setScore] = useState(0)
  const [totalQuestions, setTotalQuestions] = useState(0)
  const [quizType, setQuizType] = useState<QuizType | null>(null)

  // 新しいクイズを生成
  const generateQuiz = (type: QuizType) => {
    setSelectedAnswer(null)
    setIsCorrect(null)
    
    let quiz: Quiz
    switch (type) {
      case 'math':
        quiz = generateMathQuiz()
        break
      case 'kanji':
        quiz = kanjiQuizzes[Math.floor(Math.random() * kanjiQuizzes.length)]
        break
      case 'color':
        quiz = colorQuizzes[Math.floor(Math.random() * colorQuizzes.length)]
        break
      default:
        quiz = generateMathQuiz()
    }
    
    setCurrentQuiz(quiz)
    setQuizType(type)
  }

  // 回答をチェック
  const checkAnswer = (index: number) => {
    if (selectedAnswer !== null || !currentQuiz) return
    
    setSelectedAnswer(index)
    const correct = index === currentQuiz.correctIndex
    setIsCorrect(correct)
    setTotalQuestions(prev => prev + 1)
    
    if (correct) {
      setScore(prev => prev + 1)
    }
  }

  // クイズタイプ選択画面
  if (!quizType) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
        <header className="bg-white shadow-sm sticky top-0 z-40">
          <div className="max-w-lg mx-auto p-4 flex items-center gap-4">
            <button 
              onClick={() => navigate('/')}
              className="p-4 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-8 h-8 text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-purple-600" />
              <h1 className="text-senior-xl font-bold text-gray-800">
                脳トレクイズ
              </h1>
            </div>
          </div>
        </header>

        <main className="max-w-lg mx-auto p-4 space-y-4">
          <div className="card-senior text-center">
            <p className="text-senior-lg text-gray-700 mb-6">
              どのクイズに挑戦しますか？
            </p>
            
            <div className="space-y-4">
              <button
                onClick={() => generateQuiz('math')}
                className="w-full btn-senior bg-blue-100 text-blue-700 hover:bg-blue-200
                         flex items-center justify-center gap-3"
              >
                🔢 計算問題
              </button>
              
              <button
                onClick={() => generateQuiz('kanji')}
                className="w-full btn-senior bg-green-100 text-green-700 hover:bg-green-200
                         flex items-center justify-center gap-3"
              >
                📚 漢字の読み
              </button>
              
              <button
                onClick={() => generateQuiz('color')}
                className="w-full btn-senior bg-yellow-100 text-yellow-700 hover:bg-yellow-200
                         flex items-center justify-center gap-3"
              >
                🎨 色クイズ
              </button>
            </div>
          </div>

          {/* スコア表示 */}
          {totalQuestions > 0 && (
            <div className="card-senior bg-gradient-to-r from-yellow-50 to-amber-50">
              <div className="flex items-center justify-center gap-3">
                <Trophy className="w-8 h-8 text-yellow-600" />
                <p className="text-senior-lg font-bold text-gray-800">
                  今日の成績: {score} / {totalQuestions} 問正解
                </p>
              </div>
            </div>
          )}
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50">
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-lg mx-auto p-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setQuizType(null)}
              className="p-4 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-8 h-8 text-gray-600" />
            </button>
            <div className="flex items-center gap-3">
              <Brain className="w-8 h-8 text-purple-600" />
              <h1 className="text-senior-xl font-bold text-gray-800">
                {quizType === 'math' && '🔢 計算問題'}
                {quizType === 'kanji' && '📚 漢字の読み'}
                {quizType === 'color' && '🎨 色クイズ'}
              </h1>
            </div>
          </div>
          
          {/* スコア */}
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-100 rounded-full">
            <Star className="w-5 h-5 text-yellow-600" />
            <span className="font-bold text-yellow-700">{score}</span>
          </div>
        </div>
      </header>

      <main className="max-w-lg mx-auto p-4 space-y-6">
        {currentQuiz && (
          <>
            {/* 問題 */}
            <div className="card-senior text-center">
              <p className="text-senior-2xl font-bold text-gray-800 mb-2">
                {currentQuiz.question}
              </p>
            </div>

            {/* 選択肢 */}
            <div className="grid grid-cols-2 gap-4">
              {currentQuiz.options.map((option, index) => {
                let buttonClass = 'btn-senior bg-white border-2 border-gray-200 text-gray-800 hover:border-purple-300'
                
                if (selectedAnswer !== null) {
                  if (index === currentQuiz.correctIndex) {
                    buttonClass = 'btn-senior bg-green-100 border-2 border-green-500 text-green-700'
                  } else if (index === selectedAnswer) {
                    buttonClass = 'btn-senior bg-red-100 border-2 border-red-500 text-red-700'
                  }
                }
                
                return (
                  <button
                    key={index}
                    onClick={() => checkAnswer(index)}
                    disabled={selectedAnswer !== null}
                    className={`${buttonClass} flex items-center justify-center`}
                  >
                    {option}
                    {selectedAnswer !== null && index === currentQuiz.correctIndex && (
                      <Check className="w-6 h-6 ml-2" />
                    )}
                    {selectedAnswer === index && index !== currentQuiz.correctIndex && (
                      <X className="w-6 h-6 ml-2" />
                    )}
                  </button>
                )
              })}
            </div>

            {/* 結果表示 */}
            {isCorrect !== null && (
              <div className={`card-senior text-center ${isCorrect ? 'bg-green-50' : 'bg-red-50'}`}>
                <p className={`text-senior-xl font-bold ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                  {isCorrect ? '🎉 正解！' : '😢 残念...'}
                </p>
                {!isCorrect && (
                  <p className="text-senior-base text-gray-600 mt-2">
                    正解は「{currentQuiz.options[currentQuiz.correctIndex]}」でした
                  </p>
                )}
              </div>
            )}

            {/* 次の問題ボタン */}
            {selectedAnswer !== null && (
              <button
                onClick={() => generateQuiz(quizType)}
                className="w-full btn-senior btn-primary flex items-center justify-center gap-3"
              >
                <RefreshCw className="w-6 h-6" />
                次の問題
              </button>
            )}
          </>
        )}
      </main>
    </div>
  )
}
