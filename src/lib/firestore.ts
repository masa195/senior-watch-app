// Firestore データ操作ユーティリティ
import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  getDocs, 
  onSnapshot,
  query, 
  orderBy, 
  limit,
  serverTimestamp,
  Timestamp,
  where,
  deleteDoc
} from 'firebase/firestore'
import { db, COLLECTIONS, isDemo } from './firebase'
import type { ActivityLog, Alert, SeniorStatus } from '../context/WatchContext'

// ファミリーID（デモ用に固定、本番では認証から取得）
const FAMILY_ID = 'demo-family-001'

// 活動ログをFirestoreに保存
export async function saveActivity(activity: ActivityLog): Promise<void> {
  if (isDemo || !db) return
  
  try {
    const activitiesRef = collection(db, COLLECTIONS.families, FAMILY_ID, COLLECTIONS.activities)
    await addDoc(activitiesRef, {
      ...activity,
      timestamp: Timestamp.fromDate(activity.timestamp),
      createdAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('Error saving activity:', error)
  }
}

// アラートをFirestoreに保存
export async function saveAlert(alert: Alert): Promise<void> {
  if (isDemo || !db) return
  
  try {
    const alertsRef = collection(db, COLLECTIONS.families, FAMILY_ID, COLLECTIONS.alerts)
    await addDoc(alertsRef, {
      ...alert,
      timestamp: Timestamp.fromDate(alert.timestamp),
      createdAt: serverTimestamp(),
    })
  } catch (error) {
    console.error('Error saving alert:', error)
  }
}

// ステータスをFirestoreに保存
export async function saveStatus(status: SeniorStatus): Promise<void> {
  if (isDemo || !db) return
  
  try {
    const statusRef = doc(db, COLLECTIONS.families, FAMILY_ID)
    await setDoc(statusRef, {
      status: {
        ...status,
        lastCheckIn: status.lastCheckIn ? Timestamp.fromDate(status.lastCheckIn) : null,
        lastMeal: status.lastMeal ? Timestamp.fromDate(status.lastMeal) : null,
        lastMedicine: status.lastMedicine ? Timestamp.fromDate(status.lastMedicine) : null,
      },
      updatedAt: serverTimestamp(),
    }, { merge: true })
  } catch (error) {
    console.error('Error saving status:', error)
  }
}

// 活動ログをリアルタイムで購読
export function subscribeToActivities(
  callback: (activities: ActivityLog[]) => void
): (() => void) | null {
  if (isDemo || !db) return null
  
  const activitiesRef = collection(db, COLLECTIONS.families, FAMILY_ID, COLLECTIONS.activities)
  const q = query(activitiesRef, orderBy('timestamp', 'desc'), limit(100))
  
  return onSnapshot(q, (snapshot) => {
    const activities: ActivityLog[] = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        type: data.type,
        message: data.message,
        timestamp: data.timestamp?.toDate() || new Date(),
        isAlert: data.isAlert || false,
      }
    })
    callback(activities)
  }, (error) => {
    console.error('Error subscribing to activities:', error)
  })
}

// アラートをリアルタイムで購読
export function subscribeToAlerts(
  callback: (alerts: Alert[]) => void
): (() => void) | null {
  if (isDemo || !db) return null
  
  const alertsRef = collection(db, COLLECTIONS.families, FAMILY_ID, COLLECTIONS.alerts)
  const q = query(alertsRef, orderBy('timestamp', 'desc'), limit(50))
  
  return onSnapshot(q, (snapshot) => {
    const alerts: Alert[] = snapshot.docs.map(doc => {
      const data = doc.data()
      return {
        id: doc.id,
        type: data.type,
        message: data.message,
        timestamp: data.timestamp?.toDate() || new Date(),
        isRead: data.isRead || false,
      }
    })
    callback(alerts)
  }, (error) => {
    console.error('Error subscribing to alerts:', error)
  })
}

// ステータスをリアルタイムで購読
export function subscribeToStatus(
  callback: (status: SeniorStatus | null) => void
): (() => void) | null {
  if (isDemo || !db) return null
  
  const statusRef = doc(db, COLLECTIONS.families, FAMILY_ID)
  
  return onSnapshot(statusRef, (snapshot) => {
    if (snapshot.exists()) {
      const data = snapshot.data()
      const status = data.status
      if (status) {
        callback({
          lastCheckIn: status.lastCheckIn?.toDate() || null,
          lastMeal: status.lastMeal?.toDate() || null,
          lastMedicine: status.lastMedicine?.toDate() || null,
          isAwake: status.isAwake ?? true,
          isOutside: status.isOutside ?? false,
          todayCheckIns: status.todayCheckIns ?? 0,
          streak: status.streak ?? 0,
        })
      }
    } else {
      callback(null)
    }
  }, (error) => {
    console.error('Error subscribing to status:', error)
  })
}

// アラートを既読にする
export async function markAlertRead(alertId: string): Promise<void> {
  if (isDemo || !db) return
  
  try {
    const alertRef = doc(db, COLLECTIONS.families, FAMILY_ID, COLLECTIONS.alerts, alertId)
    await setDoc(alertRef, { isRead: true }, { merge: true })
  } catch (error) {
    console.error('Error marking alert as read:', error)
  }
}

// すべてのアラートを削除
export async function clearAllAlerts(): Promise<void> {
  if (isDemo || !db) return
  
  try {
    const alertsRef = collection(db, COLLECTIONS.families, FAMILY_ID, COLLECTIONS.alerts)
    const snapshot = await getDocs(alertsRef)
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref))
    await Promise.all(deletePromises)
  } catch (error) {
    console.error('Error clearing alerts:', error)
  }
}

// Firestoreが使用可能かどうか
export function isFirestoreAvailable(): boolean {
  return !isDemo && db !== null
}
