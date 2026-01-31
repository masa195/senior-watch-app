import { useState, useEffect } from 'react'
import { Pill, Clock, Check, Bell, Plus, X } from 'lucide-react'

interface MedicineSchedule {
  id: string
  name: string
  time: string
  taken: boolean
  takenAt?: string
}

// ローカルストレージキー
const MEDICINE_KEY = 'mimamori_medicine_schedule'
const MEDICINE_LOG_KEY = 'mimamori_medicine_log'

// デフォルトのスケジュール
const defaultSchedule: MedicineSchedule[] = [
  { id: '1', name: '朝のお薬', time: '08:00', taken: false },
  { id: '2', name: '昼のお薬', time: '12:00', taken: false },
  { id: '3', name: '夜のお薬', time: '19:00', taken: false },
]

export default function MedicineReminder() {
  const [schedules, setSchedules] = useState<MedicineSchedule[]>([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newMedicineName, setNewMedicineName] = useState('')
  const [newMedicineTime, setNewMedicineTime] = useState('08:00')
  const [currentTime, setCurrentTime] = useState(new Date())

  // 初期化
  useEffect(() => {
    const saved = localStorage.getItem(MEDICINE_KEY)
    if (saved) {
      setSchedules(JSON.parse(saved))
    } else {
      setSchedules(defaultSchedule)
    }

    // 日付が変わったらリセット
    const today = new Date().toDateString()
    const lastDate = localStorage.getItem('mimamori_medicine_date')
    if (lastDate !== today) {
      const reset = (saved ? JSON.parse(saved) : defaultSchedule).map((s: MedicineSchedule) => ({
        ...s,
        taken: false,
        takenAt: undefined
      }))
      setSchedules(reset)
      localStorage.setItem('mimamori_medicine_date', today)
    }

    // 現在時刻を更新
    const timer = setInterval(() => setCurrentTime(new Date()), 60000)
    return () => clearInterval(timer)
  }, [])

  // スケジュールを保存
  useEffect(() => {
    if (schedules.length > 0) {
      localStorage.setItem(MEDICINE_KEY, JSON.stringify(schedules))
    }
  }, [schedules])

  // 服薬をマーク
  const markAsTaken = (id: string) => {
    const now = new Date()
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`
    
    setSchedules(prev => prev.map(s => 
      s.id === id ? { ...s, taken: true, takenAt: timeStr } : s
    ))

    // ログを保存
    const log = JSON.parse(localStorage.getItem(MEDICINE_LOG_KEY) || '[]')
    log.push({
      date: now.toISOString(),
      medicineId: id,
      medicineName: schedules.find(s => s.id === id)?.name,
    })
    localStorage.setItem(MEDICINE_LOG_KEY, JSON.stringify(log.slice(-100)))
  }

  // 新しい薬を追加
  const addMedicine = () => {
    if (!newMedicineName.trim()) return
    
    const newSchedule: MedicineSchedule = {
      id: Date.now().toString(),
      name: newMedicineName,
      time: newMedicineTime,
      taken: false,
    }
    
    setSchedules(prev => [...prev, newSchedule].sort((a, b) => a.time.localeCompare(b.time)))
    setNewMedicineName('')
    setNewMedicineTime('08:00')
    setShowAddForm(false)
  }

  // 薬を削除
  const removeMedicine = (id: string) => {
    if (confirm('このお薬を削除しますか？')) {
      setSchedules(prev => prev.filter(s => s.id !== id))
    }
  }

  // 次の服薬時間を計算
  const getNextMedicine = () => {
    const now = `${currentTime.getHours().toString().padStart(2, '0')}:${currentTime.getMinutes().toString().padStart(2, '0')}`
    const next = schedules.find(s => !s.taken && s.time >= now)
    return next
  }

  const nextMedicine = getNextMedicine()
  const allTaken = schedules.every(s => s.taken)
  const takenCount = schedules.filter(s => s.taken).length

  return (
    <div className="card-senior bg-gradient-to-br from-rose-50 to-pink-50 border-2 border-rose-100">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <Pill className="w-8 h-8 text-rose-600" />
          <h2 className="text-senior-lg font-bold text-gray-700">
            💊 お薬リマインダー
          </h2>
        </div>
        <span className="px-3 py-1 bg-rose-100 text-rose-700 rounded-full text-sm font-bold">
          {takenCount}/{schedules.length}
        </span>
      </div>

      {/* 次の服薬 */}
      {nextMedicine && !allTaken && (
        <div className="p-4 bg-white/60 rounded-xl mb-4">
          <div className="flex items-center gap-2 text-rose-600 mb-2">
            <Bell className="w-5 h-5" />
            <span className="font-medium">次のお薬</span>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-senior-lg font-bold text-gray-800">{nextMedicine.name}</p>
              <p className="text-gray-600">{nextMedicine.time}</p>
            </div>
            <button
              onClick={() => markAsTaken(nextMedicine.id)}
              className="px-6 py-3 bg-rose-500 text-white font-bold rounded-xl
                       hover:bg-rose-600 transition-colors flex items-center gap-2"
            >
              <Check className="w-5 h-5" />
              飲んだ
            </button>
          </div>
        </div>
      )}

      {/* 全部飲んだ */}
      {allTaken && schedules.length > 0 && (
        <div className="p-4 bg-green-100 rounded-xl mb-4 text-center">
          <p className="text-senior-lg font-bold text-green-700">
            ✨ 今日のお薬は全部飲みました！
          </p>
        </div>
      )}

      {/* スケジュール一覧 */}
      <div className="space-y-2">
        {schedules.map(schedule => (
          <div 
            key={schedule.id}
            className={`flex items-center justify-between p-3 rounded-xl transition-colors
                      ${schedule.taken ? 'bg-green-50' : 'bg-white/40'}`}
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center
                            ${schedule.taken ? 'bg-green-100' : 'bg-gray-100'}`}>
                {schedule.taken ? (
                  <Check className="w-5 h-5 text-green-600" />
                ) : (
                  <Clock className="w-5 h-5 text-gray-400" />
                )}
              </div>
              <div>
                <p className={`font-medium ${schedule.taken ? 'text-green-700' : 'text-gray-800'}`}>
                  {schedule.name}
                </p>
                <p className="text-sm text-gray-500">
                  {schedule.time}
                  {schedule.takenAt && ` → ${schedule.takenAt}に服用`}
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {!schedule.taken && (
                <button
                  onClick={() => markAsTaken(schedule.id)}
                  className="px-4 py-2 bg-rose-100 text-rose-700 font-medium rounded-lg
                           hover:bg-rose-200 transition-colors"
                >
                  飲んだ
                </button>
              )}
              <button
                onClick={() => removeMedicine(schedule.id)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* 追加フォーム */}
      {showAddForm ? (
        <div className="mt-4 p-4 bg-white/60 rounded-xl">
          <div className="space-y-3">
            <input
              type="text"
              value={newMedicineName}
              onChange={(e) => setNewMedicineName(e.target.value)}
              placeholder="お薬の名前"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl
                       focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
            <input
              type="time"
              value={newMedicineTime}
              onChange={(e) => setNewMedicineTime(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl
                       focus:outline-none focus:ring-2 focus:ring-rose-300"
            />
            <div className="flex gap-2">
              <button
                onClick={addMedicine}
                className="flex-1 py-3 bg-rose-500 text-white font-bold rounded-xl
                         hover:bg-rose-600 transition-colors"
              >
                追加
              </button>
              <button
                onClick={() => setShowAddForm(false)}
                className="flex-1 py-3 bg-gray-200 text-gray-700 font-bold rounded-xl
                         hover:bg-gray-300 transition-colors"
              >
                キャンセル
              </button>
            </div>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full mt-4 py-3 border-2 border-dashed border-rose-200 
                   text-rose-600 font-medium rounded-xl
                   hover:bg-rose-50 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          お薬を追加
        </button>
      )}
    </div>
  )
}
