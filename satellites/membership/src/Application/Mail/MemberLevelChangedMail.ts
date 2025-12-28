import { Mailable } from '@gravito/signal'

export class MemberLevelChangedMail extends Mailable {
  constructor(
    private email: string,
    private oldLevel: string,
    private newLevel: string
  ) {
    super()
  }

  build(): this {
    return this
      .to(this.email)
      .subject(this.t('membership.emails.level_changed_subject'))
      .view('emails/level_changed', { 
        oldLevel: this.oldLevel,
        newLevel: this.newLevel,
        lang: {
          badge_text: this.t('membership.emails.level_changed_badge'),
          title: this.t('membership.emails.level_changed_title'),
          body: this.t('membership.emails.level_changed_body')
        }
      })
  }
}
