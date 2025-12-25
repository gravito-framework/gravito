# Atlas ORM Mutators & Casting

Accessors, mutators, and attribute casting allow you to transform attribute values when you retrieve or set them on model instances. For example, you may want to hash a password when it is saved to the database, or automatically convert a JSON string into an object when accessed.

## Accessors & Mutators

### Defining an Accessor

An accessor transforms an attribute value when it is accessed. To define an accessor, create a `get[Attribute]Attribute` method on your model where `[Attribute]` is the "StudlyCase" name of the column you wish to access.

For example, let's define an accessor for the `first_name` attribute:

```typescript
import { Model, column } from '@gravito/atlas';

export class User extends Model {
  @column()
  declare first_name: string;

  /**
   * Get the user's first name, automatically capitalizing the first letter.
   */
  getFirstNameAttribute(value: string): string {
    return value.charAt(0).toUpperCase() + value.slice(1);
  }
}
```

Now, when you access the `first_name` attribute, Atlas will automatically call the accessor:

```typescript
const user = await User.find(1);
console.log(user.first_name); // 'Carl'
```

### Defining a Mutator

A mutator transforms an attribute value when it is set. To define a mutator, create a `set[Attribute]Attribute` method on your model.

For example, let's define a mutator for `first_name` to ensure it is always stored in lowercase:

```typescript
import { Model, column } from '@gravito/atlas';

export class User extends Model {
  @column()
  declare first_name: string;

  /**
   * Set the user's first name, ensuring it is lowercase.
   */
  setFirstNameAttribute(value: string): void {
    this._attributes['first_name'] = value.toLowerCase();
  }
}
```

The mutator receives the value that is being set. You should update the internal `_attributes` property directly.

```typescript
const user = new User();
user.first_name = 'Carl'; // Triggers mutator, stored as 'carl'
```

## Attribute Casting

Attribute casting provides a convenient way to convert attributes to common data types. This is often cleaner than manually defining accessors and mutators.

You can define casting rules using the `static casts` property on your model:

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

### Supported Cast Types

Atlas supports the following cast types:

-   `string`
-   `integer` / `int` / `number`
-   `float` / `double` / `real`
-   `boolean` / `bool`
-   `json` / `object`
-   `collection` (Casts to array)
-   `date`
-   `datetime`
-   `timestamp`

### JSON Casting

The `json` cast type is particularly useful for working with columns that store serialized JSON. When you access the attribute, it will automatically be deserialized into a JavaScript object or array. When you set the attribute, if you pass an object, it will maintain its object state until saved (serialization depends on the database driver).

```typescript
class User extends Model {
  static casts = {
    options: 'json',
  };
}

const user = await User.find(1);

// Automatically converted to object
const options = user.options; 
// { theme: 'dark', notifications: true }

// You can modify the object directly (be sure to re-assign or mark dirty if needed)
options.theme = 'light';
user.options = options;

await user.save();
```

### Date Casting

When using the `date` or `datetime` cast type, the attribute will be converted to a native JavaScript `Date` instance.

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

The `timestamp` type will convert the date to a Unix Timestamp (milliseconds).

## Advanced Usage: Value Objects

While Atlas does not currently support built-in "Custom Cast Classes", you can implement the "Value Object" pattern using accessors and mutators. This allows you to encapsulate multiple database columns into a single object.

For example, suppose you have `address_line_1`, `city`, and `zip` columns, and you want to work with an `Address` object:

```typescript
// Define Value Object
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

// Usage in Model
export class User extends Model {
  @column() declare address_line_1: string;
  @column() declare city: string;
  @column() declare zip: string;

  // Accessor for virtual 'address' property
  getAddressAttribute(): Address {
    return new Address(
      this.address_line_1,
      this.city,
      this.zip
    );
  }

  // Mutator for virtual 'address' property
  setAddressAttribute(value: Address): void {
    this.address_line_1 = value.line1;
    this.city = value.city;
    this.zip = value.zip;
  }
}
```

Now you can use it like this:

```typescript
const user = await User.find(1);

// Read as object
console.log(user.address.toString()); 

// Write as object (automatically decomposes to columns)
user.address = new Address('123 Main St', 'New York', '10001');
await user.save();
```

## See Also

Accessors are often used in conjunction with model serialization to include computed attributes in JSON output.

-   [Model Serialization](./atlas-serialization): Learn how to use `appends` to add custom attributes to JSON, or `hidden` to hide them.
