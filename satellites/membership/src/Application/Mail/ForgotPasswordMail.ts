import { Mailable } from '@gravito/signal'

export class ForgotPasswordMail extends Mailable {
  constructor(
    private email: string,
    private token: string
  ) {
    super()
  }

  build(): this {
    return this
      .to(this.email)
      .subject(this.t('membership.emails.reset_password_subject'))
      .view('emails/reset_password', { 
        resetUrl: `https://example.com/reset-password?token=${this.token}`,
        lang: {
          reset_password_title: this.t('membership.emails.reset_password_title'),
          reset_password_body: this.t('membership.emails.reset_password_body'),
          reset_password_button: this.t('membership.emails.reset_password_button'),
          reset_password_warning: this.t('membership.emails.reset_password_warning')
        }
      })
  }
}
