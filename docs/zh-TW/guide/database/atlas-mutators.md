# Atlas ORM 修改器與轉換 (Mutators & Casting)

存取器 (Accessors)、修改器 (Mutators) 與屬性轉換 (Attribute Casting) 允許您在讀取或寫入資料庫屬性時轉換其值。例如，您可能希望將密碼進行雜湊處理，或者將 JSON 字串自動轉換為物件。

## 存取器與修改器

### 定義存取器 (Defining an Accessor)

存取器會在您讀取模型屬性時轉換該屬性的值。要定義存取器，請在模型中建立一個 `get[Attribute]Attribute` 方法，其中 `[Attribute]` 是您要存取屬性的「大駝峰式」命名 (StudlyCase)。

例如，我們定義一個 `first_name` 屬性的存取器：

```typescript
import { Model, column } from '@gravito/atlas';

export class User extends Model {
  @column()
  declare first_name: string;

  /**
   * 取得使用者的名字，並自動轉為首字母大寫
   */
  getFirstNameAttribute(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}
```

現在，當您存取 `first_name` 屬性時，Atlas 會自動呼叫該存取器：

```typescript
const user = await User.find(1);
console.log(user.first_name); // 'Carl'
```

### 定義修改器 (Defining a Mutator)

修改器會在您設定模型屬性值時觸發。要定義修改器，請在模型中建立一個 `set[Attribute]Attribute` 方法。

例如，我們定義一個 `first_name` 的修改器，確保寫入資料庫時總是小寫：

```typescript
import { Model, column } from '@gravito/atlas';

export class User extends Model {
  @column()
  declare first_name: string;

  /**
   * 設定使用者的名字，確保轉為小寫
   */
  setFirstNameAttribute(value: string): void {
    this._attributes['first_name'] = value.toLowerCase();
  }
}
```

修改器會接收被設定的值，您應該直接操作內部的 `_attributes` 屬性來更新值。

```typescript
const user = new User();
user.first_name = 'Carl'; // 觸發修改器，儲存為 'carl'
```

## 屬性轉換 (Attribute Casting)

屬性轉換提供了一種方便的方法，將屬性轉換為常見的資料類型。這通常比手動定義存取器和修改器更為簡潔。

您可以在模型中使用 `static casts` 屬性來定義轉換規則：

```typescript
import { Model, column } from '@gravito/atlas';

export class User extends Model {
  // ...

  static casts = {
    is_admin: 'boolean',
    settings: 'json',
    last_login_at: 'datetime'
  };
}
```

### 支援的轉換類型

Atlas 支援以下轉換類型：

-   `string`
-   `integer` / `int` / `number`
-   `float` / `double` / `real`
-   `boolean` / `bool`
-   `json` / `object`
-   `collection` (轉換為陣列)
-   `date`
-   `datetime`
-   `timestamp`

### JSON 轉換

`json` 轉換類型非常有用，適合用於儲存 serialized JSON 的資料庫欄位。當您存取該屬性時，它會自動被反序列化為 JavaScript 物件或陣列；當您設定該屬性時，若傳入物件，它會保持物件狀態直到儲存 (具體序列化行為取決於資料庫驅動)。

```typescript
class User extends Model {
  static casts = {
    options: 'json',
  };
}

const user = await User.find(1);

// 自動轉換為物件
const options = user.options; 
// { theme: 'dark', notifications: true }

// 可以直接修改屬性
options.theme = 'light';
user.options = options;

await user.save();
```

### 日期轉換 (Date Casting)

使用 `date` 或 `datetime` 轉換類型時，屬性會被轉換為原生的 JavaScript `Date` 實例。

```typescript
class Post extends Model {
  static casts = {
    published_at: 'datetime',
  };
}

const post = await Post.find(1);

console.log(post.published_at instanceof Date); // true
console.log(post.published_at.getFullYear());
```

`timestamp` 類型則會將日期轉換為 Unix Timestamp (毫秒數)。

## 進階用法：值物件 (Value Objects)

雖然 Atlas 目前沒有內建「自定義轉換類別 (Custom Casts)」，但您可以使用存取器與修改器來實現類似的「值物件」模式。這讓您可以將多個資料庫欄位封裝成一個單一的物件進行操作。

例如，假設您有 `address_line_1`, `city`, `zip` 三個欄位，您希望操作一個 `Address` 物件：

```typescript
// 定義值物件
class Address {
  constructor(
    public line1: string,
    public city: string,
    public zip: string
  ) {}

  toString() {
    return `${this.line1}, ${this.city} ${this.zip}`;
  }
}

// 在模型中使用
export class User extends Model {
  @column() declare address_line_1: string;
  @column() declare city: string;
  @column() declare zip: string;

  // 定義虛擬屬性 'address' 的存取器
  getAddressAttribute(): Address {
    return new Address(
      this.address_line_1,
      this.city,
      this.zip
    );
  }

  // 定義虛擬屬性 'address' 的修改器
  setAddressAttribute(value: Address): void {
    this.address_line_1 = value.line1;
    this.city = value.city;
    this.zip = value.zip;
  }
}
```

現在您可以這樣使用：

```typescript
const user = await User.find(1);

// 讀取為物件
console.log(user.address.toString()); 

// 寫入物件 (會自動拆解到各個欄位)
user.address = new Address('123 Main St', 'New York', '10001');
await user.save();
```

## 相關資源

存取器 (Accessors) 經常與模型序列化一起使用，用於在 JSON 輸出中包含計算屬性。

-   [模型序列化 (Serialization)](./atlas-serialization)：了解如何使用 `appends` 新增自定義屬性到 JSON，或使用 `hidden` 隱藏屬性。
