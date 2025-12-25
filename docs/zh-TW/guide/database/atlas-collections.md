# Eloquent Collections (集合)

在 Laravel Eloquent 中，查詢結果會返回一個強大的 `Collection` 實例。然而，在 Atlas ORM 中，我們選擇了不同的設計哲學。

Atlas 的 `all()` 和 `get()` 方法回傳的是 **標準的 JavaScript 陣列 (Native Arrays)**。

## 為什麼使用原生陣列？

1.  **零學習曲線**：每個 JavaScript/TypeScript 開發者都已經知道如何操作陣列。
2.  **效能**：原生陣列在現代 JavaScript 引擎中經過了極致優化，沒有額外的包裝開銷。
3.  **互操作性**：陣列可以與任何第三方庫 (如 Lodash, Ramda) 無縫協作，無需轉換。
4.  **型別安全**：TypeScript 對原生陣列的支援是最完善的。

雖然沒有專門的 `Collection` 類別，但 JavaScript 的陣列方法 (Array Methods) 已經非常強大，足以涵蓋絕大多數的使用場景。

## 常見操作對照

以下是 Laravel Collection 常用方法與原生 JavaScript 陣列操作的對照：

### 遍歷 (Each)

```typescript
const users = await User.all();

// Laravel: $users->each(...)
users.forEach(user => {
  console.log(user.name);
});

// 或者使用 for...of (推薦)
for (const user of users) {
  console.log(user.name);
}
```

### 映射 (Map)

```typescript
// Laravel: $users->map(...)
const names = users.map(user => user.name);
```

### 過濾 (Filter / Reject)

```typescript
// Laravel: $users->filter(...)
const admins = users.filter(user => user.role === 'admin');

// Laravel: $users->reject(...)
const nonAdmins = users.filter(user => user.role !== 'admin');
```

### 查找 (Find / First)

```typescript
// Laravel: $users->first(...)
const firstUser = users[0]; // 或者 users.find(u => condition)

// Laravel: $users->firstWhere('role', 'admin')
const admin = users.find(user => user.role === 'admin');
```

### 提取值 (Pluck)

Atlas 沒有內建 `pluck`，但使用 `map` 可以輕易達成：

```typescript
// Laravel: $users->pluck('id')
const ids = users.map(user => user.id);
```

### 檢查是否為空 (isEmpty / isNotEmpty)

```typescript
// Laravel: $users->isEmpty()
if (users.length === 0) {
  // ...
}

// Laravel: $users->isNotEmpty()
if (users.length > 0) {
  // ...
}
```

## 進階操作

對於更複雜的集合操作，您可以利用 `reduce` 或引入像 [Lodash](https://lodash.com/) 這樣的工具庫。

### KeyBy (以鍵分組)

將陣列轉換為以 ID 為鍵的物件：

```typescript
// Laravel: $users->keyBy('id')
const usersById = users.reduce((acc, user) => {
  acc[user.id] = user;
  return acc;
}, {} as Record<number, User>);
```

### GroupBy (分組)

使用現代 JavaScript 的 `Object.groupBy` (Node.js 21+ / Bun 1.0+)：

```typescript
// Laravel: $users->groupBy('role')
const usersByRole = Object.groupBy(users, ({ role }) => role);
```

或者使用 `reduce`：

```typescript
const usersByRole = users.reduce((acc, user) => {
  (acc[user.role] ||= []).push(user);
  return acc;
}, {} as Record<string, User[]>);
```

### Chunk (分塊)

如果您需要將陣列分割成多個小塊 (例如用於 UI grid 佈局)：

```typescript
// Laravel: $users->chunk(3)
function chunk<T>(array: T[], size: number): T[][] {
  return Array.from({ length: Math.ceil(array.length / size) }, (_, i) =>
    array.slice(i * size, i * size + size)
  );
}

const chunkedUsers = chunk(users, 3);
```

## 總結

Atlas 選擇擁抱原生 JavaScript 生態系統。透過熟練運用 `map`, `filter`, `reduce` 等陣列方法，您可以獲得與 Laravel Collections 同等強大且更高效的開發體驗。
