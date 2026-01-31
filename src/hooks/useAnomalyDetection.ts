// 異常検知フック - 定期的に異常をチェック
import { useEffect, useRef } from 'react'
import { useWatch } from '../context/WatchContext'
import { runAllAnomalyDetection, AnomalyResult } from '../lib/aiEngine'

// 検知間隔（ミリ秒）
const DETECTION_INTERVAL = 5 * 60 * 1000 // 5分ごと

export function useAnomalyDetection() {
  const { seniorStatus, addAlert } = useWatch()
  const lastAlertedRef = useRef<Record<string, number>>({})

  useEffect(() => {
    const checkAnomalies = () => {
      const anomalies = runAllAnomalyDetection(seniorStatus)
      const now = Date.now()

      anomalies.forEach(anomaly => {
        const key = `${anomaly.category}-${anomaly.type}`
        const lastAlerted = lastAlertedRef.current[key] || 0
        
        // 同じアラートは1時間に1回まで
        if (now - lastAlerted > 60 * 60 * 1000) {
          addAlert(
            anomaly.type === 'danger' ? 'emergency' : 'warning',
            anomaly.recommendation 
              ? `${anomaly.message}。${anomaly.recommendation}`
              : anomaly.message
          )
          lastAlertedRef.current[key] = now
        }
      })
    }

    // 初回チェック
    const timeout = setTimeout(checkAnomalies, 10000) // 10秒後に最初のチェック
    
    // 定期チェック
    const interval = setInterval(checkAnomalies, DETECTION_INTERVAL)

    return () => {
      clearTimeout(timeout)
      clearInterval(interval)
    }
  }, [seniorStatus, addAlert])
}

// 現在の異常状態を取得するフック
export function useCurrentAnomalies(): AnomalyResult[] {
  const { seniorStatus } = useWatch()
  return runAllAnomalyDetection(seniorStatus)
}
