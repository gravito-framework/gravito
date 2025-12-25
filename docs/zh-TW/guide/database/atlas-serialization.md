# 模型序列化 (Serialization)

在構建 JSON API 時，您經常需要將模型與關聯轉換為陣列或 JSON。Atlas 提供了便捷的方法來執行這些轉換，並允許您控制序列化輸出中包含哪些屬性。

## 序列化模型與集合

### 序列化為 JSON

要將模型轉換為 JSON，您可以使用 `toJSON` 方法。此方法會遞迴地序列化屬性與已載入的關聯：

```typescript
const user = await User.find(1);

return user.toJSON();
```

或者，直接呼叫 `JSON.stringify` 也會自動觸發 `toJSON`：

```typescript
const json = JSON.stringify(user);
```

### 序列化集合

當您查詢多筆資料時，回傳的是模型實例的陣列。您可以直接將其轉換為 JSON：

```typescript
const users = await User.all();

return JSON.stringify(users);
```

## 隱藏屬性 (Hiding Attributes)

有時您希望限制模型陣列或 JSON 中包含的屬性，例如密碼 (passwords)、令牌 (tokens) 或其他敏感資訊。

要從序列化輸出中隱藏屬性，請在模型中使用 `hidden` 靜態屬性：

```typescript
import { Model, column } from '@gravito/atlas';

class User extends Model {
  @column() declare id: number;
  @column() declare name: string;
  @column() declare password: string;

  // 這些屬性將在 JSON 輸出中被隱藏
  static hidden = ['password', 'remember_token'];
}
```

> **注意**：若要隱藏關聯，請將關聯的方法名稱 (即屬性名稱) 加入 `hidden` 陣列中。

## 可見屬性 (Visible Attributes)

如果您更傾向於使用「白名單」方式，即明確指定 **應該** 包含在序列化輸出中的屬性，可以使用 `visible` 靜態屬性。當定義了 `visible` 時，只有列表中的屬性會被輸出，其餘皆會隱藏：

```typescript
class User extends Model {
  // 只有 id 和 name 會被包含在 JSON 中
  static visible = ['id', 'name'];
}
```

## 追加值 (Appending Values)

有時，您可能需要新增在資料庫中沒有對應欄位的屬性。例如，您可能有一個存取器 (Accessor) 計算出的值。

### 步驟 1：定義存取器

首先，為該值定義一個存取器：

```typescript
class User extends Model {
  // 定義 'is_admin' 的存取器
  getIsAdminAttribute() {
    return this.role === 'admin';
  }
}
```

### 步驟 2：追加屬性

接著，將該存取器的名稱 (Snake Case) 加入 `appends` 靜態屬性：

```typescript
class User extends Model {
  // 將 'is_admin' 加入序列化輸出
  static appends = ['is_admin'];
}
```

現在，當模型被轉換為 JSON 時，`is_admin` 屬性將會包含在內。追加的屬性也會遵循 `hidden` 和 `visible` 的設定。

## 日期序列化 (Date Serialization)

預設情況下，Atlas 會將 `Date` 物件序列化為 ISO-8601 字串 (例如 `2023-12-25T12:00:00.000Z`)。

如果您需要自定義日期的序列化格式，建議使用存取器來轉換並追加該屬性：

```typescript
class Post extends Model {
  // 定義一個格式化的日期存取器
  getFormattedDateAttribute() {
    // 使用您喜歡的日期庫 (如 date-fns)
    return this.created_at.toLocaleDateString();
  }

  // 隱藏原始日期，追加格式化後的日期
  static hidden = ['created_at'];
  static appends = ['formatted_date'];
}
```