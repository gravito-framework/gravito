/**
 * @gravito/scaffold
 *
 * Project scaffolding engine for Gravito Framework.
 * Generate enterprise-grade architecture templates with CLI support.
 *
 * @packageDocumentation
 */

// Generators
export {
  BaseGenerator,
  type GeneratorConfig,
  type GeneratorContext,
} from './generators/BaseGenerator'
export { CleanArchitectureGenerator } from './generators/CleanArchitectureGenerator'
export { DddGenerator } from './generators/DddGenerator'
export { EnterpriseMvcGenerator } from './generators/EnterpriseMvcGenerator'

// Stub Generator
export { type StubConfig, StubGenerator, type StubVariables } from './generators/StubGenerator'
// Main API
export { Scaffold } from './Scaffold'
// Types
export type { ArchitectureType, ScaffoldOptions } from './types'
