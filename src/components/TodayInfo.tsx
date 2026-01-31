import { useState, useEffect } from 'react'
import { Calendar, Sparkles } from 'lucide-react'

// 今日は何の日データ（月-日をキーとして）
const anniversaryData: Record<string, string[]> = {
  '1-1': ['元日', '初詣の日'],
  '1-7': ['七草の日', '人日の節句'],
  '1-11': ['鏡開き'],
  '1-15': ['小正月', '成人の日（旧）'],
  '1-31': ['愛妻の日'],
  '2-3': ['節分'],
  '2-4': ['立春'],
  '2-11': ['建国記念の日'],
  '2-14': ['バレンタインデー'],
  '2-22': ['猫の日'],
  '3-3': ['ひな祭り', '耳の日'],
  '3-14': ['ホワイトデー'],
  '3-20': ['春分の日'],
  '4-1': ['エイプリルフール'],
  '4-4': ['あんパンの日'],
  '4-22': ['地球の日'],
  '4-29': ['昭和の日'],
  '5-3': ['憲法記念日'],
  '5-4': ['みどりの日'],
  '5-5': ['こどもの日', '端午の節句'],
  '5-8': ['母の日（第2日曜）'],
  '6-4': ['虫歯予防デー'],
  '6-16': ['和菓子の日'],
  '6-21': ['夏至'],
  '7-7': ['七夕'],
  '7-20': ['海の日'],
  '8-6': ['広島平和記念日'],
  '8-11': ['山の日'],
  '8-15': ['終戦記念日'],
  '9-1': ['防災の日'],
  '9-15': ['敬老の日（旧）'],
  '9-22': ['秋分の日'],
  '10-1': ['コーヒーの日'],
  '10-10': ['目の愛護デー', 'スポーツの日'],
  '10-31': ['ハロウィン'],
  '11-3': ['文化の日'],
  '11-11': ['ポッキーの日', '介護の日'],
  '11-15': ['七五三'],
  '11-23': ['勤労感謝の日'],
  '12-21': ['冬至'],
  '12-24': ['クリスマスイブ'],
  '12-25': ['クリスマス'],
  '12-31': ['大晦日'],
}

// 今日の一言（励ましの言葉）
const dailyQuotes = [
  { text: '今日も一日、笑顔で過ごしましょう', author: '' },
  { text: '小さな幸せを見つける日にしましょう', author: '' },
  { text: '継続は力なり', author: 'ことわざ' },
  { text: '笑う門には福来る', author: 'ことわざ' },
  { text: '千里の道も一歩から', author: 'ことわざ' },
  { text: '急がば回れ', author: 'ことわざ' },
  { text: '七転び八起き', author: 'ことわざ' },
  { text: '人生に遅すぎるということはない', author: '' },
  { text: '健康は最大の財産です', author: '' },
  { text: '今日という日は残りの人生の最初の日', author: '' },
  { text: '一日一善', author: '' },
  { text: '感謝の気持ちを忘れずに', author: '' },
  { text: '明日は明日の風が吹く', author: '' },
  { text: '塵も積もれば山となる', author: 'ことわざ' },
  { text: '人を笑わせれば、自分も幸せになれる', author: '' },
  { text: '小さなことを大切に', author: '' },
  { text: '今日できることを明日に延ばさない', author: '' },
  { text: '思いやりの心を持って', author: '' },
  { text: '自分のペースで、ゆっくりと', author: '' },
  { text: '毎日が新しいスタート', author: '' },
  { text: '心身ともに健やかに', author: '' },
  { text: '良いことがきっとありますよ', author: '' },
  { text: '深呼吸して、リラックス', author: '' },
  { text: '今日の小さな一歩が大きな成果に', author: '' },
  { text: '笑顔は最高のプレゼント', author: '' },
  { text: '前を向いて歩きましょう', author: '' },
  { text: '自分を信じて', author: '' },
  { text: '今この瞬間を大切に', author: '' },
  { text: '心に太陽を', author: '' },
  { text: '優しさは巡り巡って自分に返る', author: '' },
  { text: '一期一会', author: '' },
]

// 季節の豆知識
const seasonalTips: Record<number, string[]> = {
  1: ['おせち料理を楽しみましたか？', '寒い日は温かいお茶で一息'],
  2: ['節分の豆まきで邪気払い', '恵方巻きを食べましたか？'],
  3: ['春の訪れを感じる季節です', 'ひな祭りでお祝いを'],
  4: ['桜の季節ですね', '新年度のスタートです'],
  5: ['端午の節句、柏餅はいかが？', '五月晴れの気持ちいい季節'],
  6: ['梅雨の季節、傘を忘れずに', '紫陽花が綺麗な季節です'],
  7: ['夏本番、水分補給を忘れずに', '七夕に願い事を'],
  8: ['暑さ対策をしっかりと', 'お盆でご先祖様に感謝'],
  9: ['秋の気配を感じる頃', 'お月見を楽しみましょう'],
  10: ['食欲の秋、美味しいものを', '紅葉が楽しみな季節'],
  11: ['七五三の季節ですね', '温かい鍋物が美味しい季節'],
  12: ['一年の締めくくり', '大掃除はお済みですか？'],
}

export default function TodayInfo() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [quote, setQuote] = useState(dailyQuotes[0])

  useEffect(() => {
    const now = new Date()
    setCurrentDate(now)
    
    // 日付に基づいて今日の一言を選択（毎日変わる）
    const dayOfYear = Math.floor((now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / 86400000)
    setQuote(dailyQuotes[dayOfYear % dailyQuotes.length])
  }, [])

  const month = currentDate.getMonth() + 1
  const day = currentDate.getDate()
  const dateKey = `${month}-${day}`
  
  const anniversaries = anniversaryData[dateKey] || []
  const seasonalTip = seasonalTips[month]?.[Math.floor(Math.random() * seasonalTips[month].length)] || ''

  const weekdays = ['日', '月', '火', '水', '木', '金', '土']
  const weekday = weekdays[currentDate.getDay()]

  return (
    <div className="space-y-4">
      {/* 今日は何の日 */}
      <div className="card-senior bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-100">
        <div className="flex items-center gap-3 mb-4">
          <Calendar className="w-8 h-8 text-amber-600" />
          <h2 className="text-senior-lg font-bold text-gray-700">
            📅 今日は何の日
          </h2>
        </div>

        <div className="text-center mb-4">
          <p className="text-senior-2xl font-bold text-amber-700">
            {month}月{day}日（{weekday}）
          </p>
        </div>

        {anniversaries.length > 0 ? (
          <div className="space-y-2">
            {anniversaries.map((item, index) => (
              <div 
                key={index}
                className="p-3 bg-white/60 rounded-xl text-center"
              >
                <p className="text-senior-base font-bold text-gray-800">
                  🎉 {item}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 bg-white/60 rounded-xl text-center">
            <p className="text-senior-base text-gray-700">
              {seasonalTip || '今日も良い一日を！'}
            </p>
          </div>
        )}
      </div>

      {/* 今日の一言 */}
      <div className="card-senior bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-100">
        <div className="flex items-center gap-3 mb-4">
          <Sparkles className="w-8 h-8 text-purple-600" />
          <h2 className="text-senior-lg font-bold text-gray-700">
            💬 今日の一言
          </h2>
        </div>

        <div className="text-center p-4 bg-white/60 rounded-xl">
          <p className="text-senior-xl font-bold text-purple-700 mb-2">
            「{quote.text}」
          </p>
          {quote.author && (
            <p className="text-sm text-gray-500">
              — {quote.author}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
