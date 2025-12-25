# Model Serialization

When building JSON APIs, you often need to convert your models and relationships to arrays or JSON. Atlas provides convenient methods for making these conversions, as well as controlling which attributes are included in your serialized output.

## Serializing Models & Collections

### Serializing to JSON

To convert a model to JSON, you should use the `toJSON` method. This method recursively serializes attributes and loaded relationships:

```typescript
const user = await User.find(1);

return user.toJSON();
```

Alternatively, calling `JSON.stringify` on a model will also automatically call `toJSON`:

```typescript
const json = JSON.stringify(user);
```

### Serializing Collections

When you query multiple records, an array of model instances is returned. You can convert this array directly to JSON:

```typescript
const users = await User.all();

return JSON.stringify(users);
```

## Hiding Attributes

Sometimes you may wish to limit the attributes, such as passwords or tokens, that are included in your model's array or JSON representation.

To hide attributes from serialization, use the `hidden` static property on your model:

```typescript
import { Model, column } from '@gravito/atlas';

class User extends Model {
  @column() declare id: number;
  @column() declare name: string;
  @column() declare password: string;

  // These attributes will be hidden in JSON output
  static hidden = ['password', 'remember_token'];
}
```

> **Note**: To hide relationships, add the relationship's method name (property name) to the `hidden` array.

## Visible Attributes

Alternatively, you may use a "allowlist" approach by defining a `visible` static property. When `visible` is defined, only the listed attributes will be included in the serialized output; all others will be hidden:

```typescript
class User extends Model {
  // Only id and name will be included in JSON
  static visible = ['id', 'name'];
}
```

## Appending Values

Occasionally, you may need to add attributes that do not have a corresponding column in your database. For example, you might have a value computed by an Accessor.

### Step 1: Define an Accessor

First, define an accessor for the value:

```typescript
class User extends Model {
  // Define accessor for 'is_admin'
  getIsAdminAttribute() {
    return this.role === 'admin';
  }
}
```

### Step 2: Append the Attribute

Next, add the accessor's name (in snake_case) to the `appends` static property:

```typescript
class User extends Model {
  // Add 'is_admin' to serialized output
  static appends = ['is_admin'];
}
```

Now, when the model is converted to JSON, the `is_admin` attribute will be included. Appended attributes will also respect `hidden` and `visible` settings.

## Date Serialization

By default, Atlas serializes `Date` objects to ISO-8601 strings (e.g., `2023-12-25T12:00:00.000Z`).

If you need to customize the date serialization format, it is recommended to use an accessor to transform and append the formatted date:

```typescript
class Post extends Model {
  // Define a formatted date accessor
  getFormattedDateAttribute() {
    // Use your preferred date library (e.g., date-fns)
    return this.created_at.toLocaleDateString();
  }

  // Hide the original date and append the formatted one
  static hidden = ['created_at'];
  static appends = ['formatted_date'];
}
```