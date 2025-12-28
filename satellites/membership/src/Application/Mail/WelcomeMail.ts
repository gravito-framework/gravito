import { Mailable } from '@gravito/signal'

export class WelcomeMail extends Mailable {
  constructor(
    private email: string,
    private token: string
  ) {
    super()
  }

  build(): this {
    return this
      .to(this.email)
      .subject(this.t('membership.emails.welcome_subject'))
      .view('emails/welcome', { 
        verificationUrl: `https://example.com/verify?token=${this.token}`,
        lang: {
          welcome_title: this.t('membership.emails.welcome_title'),
          welcome_body: this.t('membership.emails.welcome_body'),
          verify_button: this.t('membership.emails.verify_button')
        }
      })
  }
}
