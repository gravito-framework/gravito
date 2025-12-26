---
title: Serialization
---

# 序列化 (Serialization)

> 了解如何將 Atlas 模型轉換為 JSON 與 陣列，並控制輸出的屬性、隱藏敏感資料與追加自定義欄位。

## 基礎序列化

當您將模型實例作為回應傳回或呼叫 `JSON.stringify(model)` 時，Atlas 會自動呼叫 `toJSON()` 方法。

```ts
const user = await User.find(1)

// 自動轉換為 JSON
return c.json(user)

// 手動轉換為物件
const data = user.toJSON()
```

## 隱藏欄位 (Hidden)

有時您希望在輸出的 JSON 中隱藏某些敏感欄位（例如密碼或權杖）。您可以透過靜態屬性 `hidden` 來定義：

```ts
export class User extends Model {
  static hidden = ['password', 'remember_token']
}
```

## 顯示欄位 (Visible)

與隱藏相反，您也可以使用「白名單」模式，只輸出指定的欄位：

```ts
export class User extends Model {
  static visible = ['name', 'email']
}
```

> **注意**：如果同時設定了 `visible`，則 `hidden` 會被忽略。

## 追加屬性 (Appends)

如果您有自定義的 Accessor（存取器），並希望它們也包含在 JSON 輸出中，可以使用 `appends`：

```ts
export class User extends Model {
  static appends = ['is_admin']

  // 定義存取器
  get isAdmin() {
    return this.role === 'admin'
  }
}
```

## 關聯的序列化

當您使用 `with()` 預載入（Eager Loading）模型關聯時，關聯的數據也會自動被序列化：

```ts
const user = await User.query().with('posts').first()

// 輸出的 JSON 將包含 posts 陣列
return c.json(user)
```

---

## 下一步
了解如何透過 [模型關聯](./relations.md) 處理複雜的資料結構。
