// LINE Notify 連携ユーティリティ
import { db, isDemo } from './firebase'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'

// LINE通知設定のローカルストレージキー
const LINE_TOKEN_KEY = 'mimamori_line_token'
const LINE_ENABLED_KEY = 'mimamori_line_enabled'

// LINE通知設定を保存
export function saveLineSettings(token: string, enabled: boolean): void {
  if (token) {
    localStorage.setItem(LINE_TOKEN_KEY, token)
  } else {
    localStorage.removeItem(LINE_TOKEN_KEY)
  }
  localStorage.setItem(LINE_ENABLED_KEY, enabled ? 'true' : 'false')
}

// LINE通知設定を取得
export function getLineSettings(): { token: string; enabled: boolean } {
  return {
    token: localStorage.getItem(LINE_TOKEN_KEY) || '',
    enabled: localStorage.getItem(LINE_ENABLED_KEY) === 'true',
  }
}

// LINE通知が有効かチェック
export function isLineNotifyEnabled(): boolean {
  const settings = getLineSettings()
  return settings.enabled && settings.token.length > 0
}

// 通知タイプの絵文字マッピング
const notificationEmojis: Record<string, string> = {
  check_in: '💚',
  emergency: '🚨',
  meal: '🍽️',
  medicine: '💊',
  sleep: '🌙',
  wake: '☀️',
  outing: '🚶',
  return: '🏠',
  warning: '⚠️',
  info: 'ℹ️',
}

// Firestoreに通知リクエストを保存（Cloud Functionsで処理）
export async function queueLineNotification(
  type: string,
  message: string,
  isUrgent: boolean = false
): Promise<boolean> {
  const settings = getLineSettings()
  
  if (!settings.enabled || !settings.token) {
    console.log('LINE通知が無効または未設定')
    return false
  }

  // Firestoreが使用可能な場合は通知キューに追加
  if (!isDemo && db) {
    try {
      const emoji = notificationEmojis[type] || '📢'
      const notificationMessage = `${emoji} ${message}`
      
      await addDoc(collection(db, 'lineNotifications'), {
        token: settings.token,
        message: notificationMessage,
        type,
        isUrgent,
        status: 'pending',
        createdAt: serverTimestamp(),
      })
      
      console.log('LINE通知リクエストをキューに追加:', notificationMessage)
      return true
    } catch (error) {
      console.error('LINE通知リクエストの保存に失敗:', error)
      return false
    }
  }
  
  // デモモードまたはFirestoreが使えない場合はコンソールに出力
  const emoji = notificationEmojis[type] || '📢'
  console.log(`[LINE通知デモ] ${emoji} ${message}`)
  return true
}

// 緊急通知を送信
export async function sendEmergencyLineNotification(message: string): Promise<boolean> {
  return queueLineNotification('emergency', message, true)
}

// 日常報告の通知を送信
export async function sendActivityLineNotification(
  type: string,
  message: string
): Promise<boolean> {
  // 緊急以外は設定で通知するか選択可能にする
  const notifyTypes = getNotifyActivityTypes()
  
  if (!notifyTypes.includes(type) && type !== 'emergency') {
    return false
  }
  
  return queueLineNotification(type, message, type === 'emergency')
}

// 通知する活動タイプを取得
const NOTIFY_TYPES_KEY = 'mimamori_notify_types'
const defaultNotifyTypes = ['check_in', 'emergency', 'meal', 'medicine']

export function getNotifyActivityTypes(): string[] {
  const saved = localStorage.getItem(NOTIFY_TYPES_KEY)
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch {
      return defaultNotifyTypes
    }
  }
  return defaultNotifyTypes
}

export function saveNotifyActivityTypes(types: string[]): void {
  localStorage.setItem(NOTIFY_TYPES_KEY, JSON.stringify(types))
}
