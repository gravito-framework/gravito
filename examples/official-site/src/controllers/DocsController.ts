import type { InertiaService } from '@gravito/orbit-inertia';
import type { Context } from 'hono';
import { getTranslation } from '../services/I18nService';

export class DocsController {
  index = async (c: Context) => {
    const inertia = c.get('inertia') as InertiaService;
    const locale = (c.get('locale') as string) || 'en';
    const t = getTranslation(locale);

    return inertia.render('Docs', {
      t,
      locale,
      title: t.nav.docs,
    });
  };
}
