import { GravitoException } from './GravitoException'

export class AuthenticationException extends GravitoException {
  constructor(message = 'Unauthenticated.') {
    super(401, 'UNAUTHENTICATED', {
      message,
      i18nKey: 'errors.authentication.unauthenticated',
    })
  }
}
