---
title: Pagination
---

# Pagination

> Atlas provides a simple yet powerful pagination mechanism to easily handle large datasets.

## Basic Pagination

You can use the `paginate` method to paginate query results. This method automatically handles `LIMIT` and `OFFSET`, and performs an additional `COUNT` query to fetch the total number of records.

```ts
import { DB } from '@gravito/atlas'

// 15 items per page, show page 1
const results = await DB.table('users').where('active', true).paginate(15, 1)
```

### Result Structure (`PaginateResult`)

The `paginate` method returns an object containing `data` and `pagination` metadata:

```ts
{
  "data": [...], // Current page data
  "pagination": {
    "page": 1,        // Current page number
    "perPage": 15,    // Items per page
    "total": 100,     // Total number of records
    "totalPages": 7,  // Total number of pages
    "hasNext": true,  // Is there a next page?
    "hasPrev": false  // Is there a previous page?
  }
}
```

## Simple Pagination

If you only need "Previous" and "Next" links and don't need to know the exact total count, you can use `simplePaginate`.

```ts
const results = await DB.table('users').simplePaginate(15, 1)
```

## Chunking Results

If you need to process thousands of records without loading them all into memory at once, use the `chunk` method:

```ts
await DB.table('users').chunk(100, async (users) => {
  for (const user of users) {
    // Process each chunk of data
    console.log(user.name)
  }
  
  // To stop processing, return false
  // return false;
})
```

## Deterministic Ordering

Atlas pagination automatically appends the Primary Key as a "tie-breaker" after your sorting column. This ensures that when multiple rows have the same value (e.g., `status`), the pagination results remain stable and won't contain duplicates or missing items.

If you are using a non-default primary key name, you can pass it to `paginate`:

```ts
await DB.table('users').paginate(15, 1, 'user_uuid')
```
