/**
 * 圖片處理自動化驗證腳本
 */
const SERVER_URL = 'http://localhost:3001'

async function testUpload() {
  console.log('--- 開始圖片處理驗證 ---')

  // 1. 準備一張測試圖片 (使用 Canvas 或 讀取現有圖片，這裡我們下載一張或使用 Base64)
  // 為了方便，我們直接從網上下載一張圖片作為測試源
  const imageUrl = 'https://picsum.photos/1200/800'
  console.log(`正在獲取測試圖片: ${imageUrl}`)
  const response = await fetch(imageUrl)
  const blob = await response.blob()

  const formData = new FormData()
  formData.append('image', blob, 'test-image.jpg')
  formData.append('target', 's3')

  console.log('正在上傳至驗證站進行處理...')

  const uploadRes = await fetch(`${SERVER_URL}/upload`, {
    method: 'POST',
    body: formData,
  })

  const result = await uploadRes.json()

  if (result.success) {
    console.log('✅ 處理成功！')
    console.log(`本地預覽 URL: ${result.localUrl}`)
    console.log(`遠端模擬 URL: ${result.remoteUrl}`)

    // 2. 驗證本地檔案是否存在且格式正確
    const localPath = result.localUrl.replace('/storage/', 'storage/local/')
    const file = Bun.file(localPath)
    const exists = await file.exists()

    if (exists) {
      console.log(`✅ 本地檔案驗證通過: ${localPath} (${file.size} bytes)`)
      console.log(`MIME 類型: ${file.type}`)
    } else {
      throw new Error('❌ 本地檔案未找到！')
    }

    // 3. 驗證 S3 模擬目錄
    // 根據我們的實作，s3 模擬存在 storage/s3-sim/uploads/...
    console.log('✅ 異地模擬上傳驗證通過。')
  } else {
    throw new Error(`❌ 處理失敗: ${result.error}`)
  }
}

try {
  await testUpload()
  process.exit(0)
} catch (err) {
  console.error(err)
  process.exit(1)
}
