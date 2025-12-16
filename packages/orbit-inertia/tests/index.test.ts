import { describe, expect, it, mock } from 'bun:test';
import { InertiaService } from '../src/InertiaService';

describe('InertiaService', () => {
  it('should render JSON when X-Inertia header is present', async () => {
    const req = {
      url: '/test',
      header: (key: string) => (key === 'X-Inertia' ? 'true' : undefined),
    };

    const ctx = {
      req,
      header: mock(),
      json: mock((data: any) => data),
    } as any;

    const service = new InertiaService(ctx, { version: '1.0' });
    const result = service.render('TestComponent', { foo: 'bar' });

    expect(ctx.header).toHaveBeenCalledWith('X-Inertia', 'true');
    expect(result).toEqual({
      component: 'TestComponent',
      props: { foo: 'bar' },
      url: '/test',
      version: '1.0',
    });
  });

  it('should share props across renders', () => {
    const req = {
      url: '/test',
      header: () => 'true',
    };

    const ctx = {
      req,
      header: mock(),
      json: mock((data: any) => data),
    } as any;

    const service = new InertiaService(ctx, { version: '1.0' });
    service.share('user', { name: 'Carl' });

    const result = service.render('Dashboard');

    expect(result.props).toEqual({
      user: { name: 'Carl' },
    });
  });
});
