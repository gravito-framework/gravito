# Orbit Prism V2 Implementation Plan

## Objective
Upgrade the `@gravito/prism` TemplateEngine to "Level 2" capability, introducing Layout Inheritance, Stacks, and Component architecture while maintaining the "Zero-Dependency" and "Lightweight" design principles. This upgrade is specifically targeted to support typical backend use cases like Email Templating and SSG Documents.

## Core Features (New)

### 1. Layout Inheritance (Blade-style)
- **Syntax**:
    - `@extends('layoutName')`: Define the parent layout.
    - `@section('name') ... @endsection`: Define a content block.
    - `@yield('name', 'defaultContent')`: Output a content block in the layout.
- **Behavior**:
    - The engine detects `@extends` at the start of the file.
    - It processes the child view first, extracting all `@section` blocks.
    - It then loads the parent layout and replaces `@yield` placeholders with the extracted content.

### 2. Stacks (Resource Management)
- **Syntax**:
    - `@push('stackName') ... @endpush`: Push content to a named stack.
    - `@stack('stackName')`: Output the entire stack content.
- **Behavior**:
    - Similar to sections but additive (multiple pushes append to the same stack).
    - Perfect for pushing specific scripts (`<script src="...">`) or styles from partials/components to the `<head>` or end of `<body>`.

### 3. Components & Slots (Level 2)
- **Syntax**:
    - `<x-name attr="val"> ... </x-name>`: Render a component file (`views/components/name.html`).
    - `{{ $slot }}`: The default content inside the component tag.
    - `<x-slot:name> ... </x-slot:name>`: Named slots passed to the component.
- **Behavior**:
    - Components are treated as isolated sub-templates with their own data scope (attributes + slots).
    - Resolves from `views/components/`.

### 4. Directives (Consistency Upgrade)
- Support basic Directives to align with the new syntax style, while keeping backward compatibility with `{{#if}}`.
    - `@if(condition)` / `@else` / `@endif` (Optional, can just map to existing logic).
    - `@foreach(items as item)` / `@endforeach`.
    - *Decision*: For V2 release, we focus on Layouts/Components. We can keep `{{}}` for data binding as it's distinct from structural directives `@`.

## Architecture Changes (TemplateEngine.ts)

The current `loadAndInterpolate` is a linear pass. We need a **Two-Pass Compilation** for storage-heavy features (Layouts, Stacks).

### New Pipeline:
1.  **Parse & Extract**: Read the source file. Identify `@extends`.
2.  **Structural Processing (Pass 1)**:
    - If `@extends` exists:
        - Parse and strip all `@section` and `@push` blocks from the child.
        - Load parent layout.
    - If no `@extends`: Use content as is.
3.  **Component Expansion (Pass 2)**:
    - Recursively find `<x-name>` tags.
    - Resolve component template.
    - Extract attributes and slots.
    - Render component with (attributes + slots) merged into its data scope.
    - Replace `<x-name>` with result.
4.  **Legacy Processing (Pass 3)**:
    - Run existing `processLoops` (or upgrade to `@foreach`).
    - Run existing `processConditionals`.
    - Run `interpolate` (Variables).

## Step-by-Step Implementation

1.  **Refactor `TemplateEngine` Class**:
    - Add `sections: Map<string, string>` and `stacks: Map<string, string[]>` to state (per render request).
    - *Note*: Since `render` can be called concurrently, we cannot store request-state on the class instance directly if using singleton pattern. We should create a `Renderer` context object or pass state down the chain.
    - *Decision*: Create a transient `RenderContext` class or object passed through private methods.

2.  **Implement `processLayouts`**:
    - Regex to find `@extends('...')`.
    - Regex to capture `@section('...') ... @endsection`.
    - Regex to capture `@push('...') ... @endpush`.
    - Logic to swap Child <-> Parent.

3.  **Implement `processComponents`**:
    - Regex to match `<x-([a-zA-Z0-9-]+)([^>]*)>(.*?)</x-\1>` (Simple recursive matcher).
    - Attribute parser (reuse existing helper arg parser logic?).
    - Slot extractor.

4.  **Testing**:
    - Create `tests/prism-v2.test.ts` to verify new features.
