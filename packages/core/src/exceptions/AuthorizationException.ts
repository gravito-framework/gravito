import { GravitoException } from './GravitoException'

export class AuthorizationException extends GravitoException {
    constructor(message = 'This action is unauthorized.') {
        super(403, 'FORBIDDEN', {
            message,
            i18nKey: 'errors.authorization.forbidden',
        })
    }
}
