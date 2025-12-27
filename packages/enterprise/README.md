# @gravito/enterprise

Enterprise architecture primitives for Gravito framework. This package provides the building blocks for Domain-Driven Design (DDD) and Clean Architecture in Gravito applications.

## Features

- **Base Entity**: Includes identity management and domain event recording.
- **Value Object**: Immutable value types with structural equality.
- **Domain Events**: Standard structure for domain events.
- **Generic Repository**: Standard interface for persistence.
- **Use Case**: Base class for application business rules.

## Usage

```typescript
import { Entity, ValueObject, UseCase, Repository } from '@gravito/enterprise'

// Define an Entity
class User extends Entity<string> {
  // ...
}

// Define a Value Object
class Email extends ValueObject<{ value: string }> {
  // ...
}

// Define a Repository Interface
interface UserRepository extends Repository<User, string> {
  findByEmail(email: string): Promise<User | null>
}

// Define a Use Case
class CreateUser extends UseCase<CreateUserInput, UserDTO> {
  async execute(input: CreateUserInput): Promise<UserDTO> {
    // ...
  }
}
```
