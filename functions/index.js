/**
 * Firebase Cloud Functions - LINE Notify連携
 * 
 * デプロイ方法:
 * 1. Firebase CLIをインストール: npm install -g firebase-tools
 * 2. ログイン: firebase login
 * 3. 初期化: firebase init functions
 * 4. デプロイ: firebase deploy --only functions
 * 
 * 注意: Blazeプラン（従量課金）が必要です
 */

const functions = require('firebase-functions')
const admin = require('firebase-admin')
const https = require('https')

admin.initializeApp()

// LINE Notify API エンドポイント
const LINE_NOTIFY_API = 'notify-api.line.me'

/**
 * LINE Notifyでメッセージを送信
 */
function sendLineNotify(token, message) {
  return new Promise((resolve, reject) => {
    const postData = `message=${encodeURIComponent(message)}`
    
    const options = {
      hostname: LINE_NOTIFY_API,
      path: '/api/notify',
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Bearer ${token}`,
        'Content-Length': Buffer.byteLength(postData)
      }
    }

    const req = https.request(options, (res) => {
      let data = ''
      res.on('data', (chunk) => { data += chunk })
      res.on('end', () => {
        if (res.statusCode === 200) {
          resolve(JSON.parse(data))
        } else {
          reject(new Error(`LINE API Error: ${res.statusCode} - ${data}`))
        }
      })
    })

    req.on('error', reject)
    req.write(postData)
    req.end()
  })
}

/**
 * Firestoreの lineNotifications コレクションを監視
 * 新しい通知リクエストが追加されたらLINEに送信
 */
exports.processLineNotification = functions.firestore
  .document('lineNotifications/{notificationId}')
  .onCreate(async (snap, context) => {
    const notification = snap.data()
    const { token, message, type, isUrgent } = notification

    if (!token || !message) {
      console.error('Invalid notification data:', notification)
      await snap.ref.update({ status: 'error', error: 'Missing token or message' })
      return
    }

    try {
      // 緊急の場合はプレフィックスを追加
      const finalMessage = isUrgent 
        ? `\n🚨 緊急通知 🚨\n${message}`
        : `\n${message}`

      await sendLineNotify(token, finalMessage)
      
      // 成功ステータスを更新
      await snap.ref.update({ 
        status: 'sent', 
        sentAt: admin.firestore.FieldValue.serverTimestamp() 
      })
      
      console.log('LINE notification sent successfully:', message)
    } catch (error) {
      console.error('Failed to send LINE notification:', error)
      await snap.ref.update({ 
        status: 'error', 
        error: error.message 
      })
    }
  })

/**
 * 定期的な見守りチェック（毎日朝9時に実行）
 * 前日にチェックインがなかった場合にアラートを送信
 */
exports.dailyWatchCheck = functions.pubsub
  .schedule('0 9 * * *')
  .timeZone('Asia/Tokyo')
  .onRun(async (context) => {
    const db = admin.firestore()
    const yesterday = new Date()
    yesterday.setDate(yesterday.getDate() - 1)
    yesterday.setHours(0, 0, 0, 0)

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    try {
      // 全ファミリーをチェック
      const familiesSnapshot = await db.collection('families').get()
      
      for (const familyDoc of familiesSnapshot.docs) {
        const familyData = familyDoc.data()
        const status = familyData.status

        if (status && status.lastCheckIn) {
          const lastCheckIn = status.lastCheckIn.toDate()
          
          // 24時間以上チェックインがない場合
          if (lastCheckIn < yesterday) {
            // アラートを追加（LINE通知トリガー）
            await db.collection('lineNotifications').add({
              token: familyData.lineToken, // ファミリーに保存されたトークン
              message: `⚠️ 24時間以上「元気です」の報告がありません。確認をお願いします。`,
              type: 'warning',
              isUrgent: true,
              status: 'pending',
              createdAt: admin.firestore.FieldValue.serverTimestamp(),
            })
          }
        }
      }
      
      console.log('Daily watch check completed')
    } catch (error) {
      console.error('Daily watch check failed:', error)
    }
  })
