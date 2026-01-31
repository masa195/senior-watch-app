import { useState, useEffect } from 'react'
import { Sun, Cloud, CloudRain, CloudSnow, CloudLightning, Wind, Droplets } from 'lucide-react'

interface WeatherData {
  temperature: number
  weatherCode: number
  humidity: number
  windSpeed: number
}

// 天気コードからアイコンと説明を取得
function getWeatherInfo(code: number): { icon: typeof Sun; label: string; color: string } {
  if (code === 0) return { icon: Sun, label: '快晴', color: 'text-yellow-500' }
  if (code <= 3) return { icon: Cloud, label: '曇り', color: 'text-gray-500' }
  if (code <= 49) return { icon: Cloud, label: '霧', color: 'text-gray-400' }
  if (code <= 69) return { icon: CloudRain, label: '雨', color: 'text-blue-500' }
  if (code <= 79) return { icon: CloudSnow, label: '雪', color: 'text-blue-300' }
  if (code <= 99) return { icon: CloudLightning, label: '雷雨', color: 'text-purple-500' }
  return { icon: Cloud, label: '不明', color: 'text-gray-500' }
}

export default function TodayWeather() {
  const [weather, setWeather] = useState<WeatherData | null>(null)
  const [loading, setLoading] = useState(true)
  const [locationName, setLocationName] = useState('東京')

  useEffect(() => {
    // 位置情報を取得して天気を取得
    const fetchWeather = async (lat: number, lon: number) => {
      try {
        const response = await fetch(
          `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=Asia%2FTokyo`
        )
        const data = await response.json()
        
        setWeather({
          temperature: Math.round(data.current.temperature_2m),
          weatherCode: data.current.weather_code,
          humidity: data.current.relative_humidity_2m,
          windSpeed: Math.round(data.current.wind_speed_10m),
        })
      } catch (error) {
        console.error('天気の取得に失敗:', error)
      } finally {
        setLoading(false)
      }
    }

    // 位置情報を取得
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeather(position.coords.latitude, position.coords.longitude)
          setLocationName('現在地')
        },
        () => {
          // 位置情報が取得できない場合は東京の天気
          fetchWeather(35.6762, 139.6503)
        }
      )
    } else {
      fetchWeather(35.6762, 139.6503)
    }
  }, [])

  if (loading) {
    return (
      <div className="card-senior animate-pulse">
        <div className="h-24 bg-gray-200 rounded-xl"></div>
      </div>
    )
  }

  if (!weather) {
    return null
  }

  const weatherInfo = getWeatherInfo(weather.weatherCode)
  const WeatherIcon = weatherInfo.icon

  return (
    <div className="card-senior bg-gradient-to-br from-sky-50 to-blue-50 border-2 border-sky-100">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-senior-lg font-bold text-gray-700">
          ☀️ 今日の天気
        </h2>
        <span className="text-sm text-gray-500">{locationName}</span>
      </div>

      <div className="flex items-center gap-6">
        {/* 天気アイコン */}
        <div className={`w-20 h-20 ${weatherInfo.color} flex items-center justify-center`}>
          <WeatherIcon className="w-16 h-16" strokeWidth={1.5} />
        </div>

        {/* 気温と天気 */}
        <div className="flex-1">
          <div className="flex items-baseline gap-2">
            <span className="text-5xl font-bold text-gray-800">
              {weather.temperature}
            </span>
            <span className="text-2xl text-gray-600">°C</span>
          </div>
          <p className={`text-senior-lg font-bold ${weatherInfo.color}`}>
            {weatherInfo.label}
          </p>
        </div>
      </div>

      {/* 詳細情報 */}
      <div className="flex gap-4 mt-4 pt-4 border-t border-sky-200">
        <div className="flex items-center gap-2 text-gray-600">
          <Droplets className="w-5 h-5 text-blue-400" />
          <span>湿度 {weather.humidity}%</span>
        </div>
        <div className="flex items-center gap-2 text-gray-600">
          <Wind className="w-5 h-5 text-gray-400" />
          <span>風速 {weather.windSpeed}m/s</span>
        </div>
      </div>

      {/* アドバイス */}
      <div className="mt-4 p-3 bg-white/50 rounded-xl">
        <p className="text-senior-sm text-gray-700">
          {weather.temperature >= 30 && '🥵 暑いです。水分補給を忘れずに！'}
          {weather.temperature >= 25 && weather.temperature < 30 && '😊 過ごしやすい気温です'}
          {weather.temperature >= 15 && weather.temperature < 25 && '🌸 快適な気温です'}
          {weather.temperature >= 5 && weather.temperature < 15 && '🧥 上着があると安心です'}
          {weather.temperature < 5 && '🥶 寒いです。暖かくしてお過ごしください'}
        </p>
      </div>
    </div>
  )
}
