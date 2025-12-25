/**
 * @gravito/fortify
 *
 * End-to-End Authentication Workflows for Gravito Framework.
 * Provides ready-to-use controllers, routes, and views for:
 * - User Registration
 * - Login / Logout
 * - Password Reset
 * - Email Verification
 *
 * @packageDocumentation
 */

// Configuration
export { defaultFortifyConfig, definefortifyConfig, type FortifyConfig } from './config'
export { ForgotPasswordController } from './controllers/ForgotPasswordController'

// Controllers
export { LoginController } from './controllers/LoginController'
export { LogoutController } from './controllers/LogoutController'
export { RegisterController } from './controllers/RegisterController'
export { ResetPasswordController } from './controllers/ResetPasswordController'
export { VerifyEmailController } from './controllers/VerifyEmailController'
// Core Orbit
export { FortifyOrbit } from './FortifyOrbit'
// Middleware
export { verified } from './middleware/verified'
// Routes
export { registerAuthRoutes } from './routes/auth'
