import { Heart, Users } from 'lucide-react'

interface RoleSelectProps {
  onSelect: (role: 'senior' | 'family') => void
}

export default function RoleSelect({ onSelect }: RoleSelectProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex flex-col items-center justify-center p-6">
      {/* ロゴ・タイトル */}
      <div className="text-center mb-12 fade-in">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-primary-500 rounded-full mb-6 shadow-lg">
          <Heart className="w-12 h-12 text-white" />
        </div>
        <h1 className="text-senior-2xl font-bold text-gray-800 mb-2">
          デジタル同居
        </h1>
        <p className="text-senior-base text-gray-600">
          離れていても、いつも一緒
        </p>
      </div>

      {/* ロール選択 */}
      <div className="w-full max-w-lg space-y-6">
        <p className="text-center text-senior-lg text-gray-700 mb-8">
          あなたはどちらですか？
        </p>

        {/* 高齢者ボタン */}
        <button
          onClick={() => onSelect('senior')}
          className="w-full card-senior hover:shadow-xl transition-all duration-300 
                     hover:scale-[1.02] active:scale-[0.98] text-left
                     border-2 border-transparent hover:border-primary-300"
        >
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-success-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <span className="text-5xl">👴</span>
            </div>
            <div>
              <h2 className="text-senior-xl font-bold text-gray-800 mb-2">
                見守られる方
              </h2>
              <p className="text-senior-sm text-gray-600">
                ご高齢の方・見守りが必要な方
              </p>
            </div>
          </div>
        </button>

        {/* 家族ボタン */}
        <button
          onClick={() => onSelect('family')}
          className="w-full card-senior hover:shadow-xl transition-all duration-300 
                     hover:scale-[1.02] active:scale-[0.98] text-left
                     border-2 border-transparent hover:border-primary-300"
        >
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 bg-primary-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Users className="w-10 h-10 text-primary-600" />
            </div>
            <div>
              <h2 className="text-senior-xl font-bold text-gray-800 mb-2">
                見守る家族
              </h2>
              <p className="text-senior-sm text-gray-600">
                離れて暮らすご家族の方
              </p>
            </div>
          </div>
        </button>
      </div>

      {/* フッター */}
      <p className="mt-12 text-gray-500 text-sm">
        © 2026 デジタル同居プロジェクト
      </p>
    </div>
  )
}
