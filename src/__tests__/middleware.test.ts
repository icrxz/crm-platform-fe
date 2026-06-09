/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';
import { middleware } from '../middleware';

function buildRequest(
  pathname: string,
  options: { jwt?: string; userAgent?: string } = {}
): NextRequest {
  const url = `http://localhost${pathname}`;
  const req = new NextRequest(url, {
    headers: {
      'user-agent': options.userAgent ?? 'Mozilla/5.0 (Windows NT 10.0)',
    },
  });
  if (options.jwt) {
    req.cookies.set('jwt', options.jwt);
  }
  return req;
}

const TV_USER_AGENTS = [
  'Mozilla/5.0 (Linux; Android 9; AFT Build) AppleWebKit/537.36',
  'Mozilla/5.0 (SMART-TV; Linux; Tizen 5.0)',
  'Mozilla/5.0 (webOS/5.0; Linux/SmartTV)',
  'Mozilla/5.0 (AppleTV; CPU TV OS 14_0)',
  'Roku/DVP-9.10',
  'Mozilla/5.0 (Linux; Android 9; CrKey) AppleWebKit/537.36',
  'Mozilla/5.0 (Linux; Android 9; GoogleTV) AppleWebKit/537.36',
  'Mozilla/5.0 (Linux; Android 9) Android TV AppleWebKit/537.36',
];

const BROWSER_USER_AGENTS = [
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120',
  'Mozilla/5.0 (Macintosh; Intel Mac OS X) Safari/537.36',
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0) Mobile/15E148',
];

describe('middleware', () => {
  describe('unauthenticated user', () => {
    it('should redirect to /login when accessing a protected route', () => {
      const req = buildRequest('/home');
      const res = middleware(req);
      expect(res?.headers.get('location')).toContain('/login');
    });

    it('should allow access to /login', () => {
      const req = buildRequest('/login');
      const res = middleware(req);
      expect(res?.headers.get('location')).toBeNull();
    });
  });

  describe('authenticated browser user', () => {
    it('should redirect from /login to /home', () => {
      const req = buildRequest('/login', { jwt: 'token' });
      const res = middleware(req);
      expect(res?.headers.get('location')).toContain('/home');
    });

    it('should not redirect from /home to /tv/dashboards', () => {
      const req = buildRequest('/home', { jwt: 'token' });
      const res = middleware(req);
      expect(res?.headers.get('location')).toBeNull();
    });
  });

  describe('authenticated TV device', () => {
    TV_USER_AGENTS.forEach((ua) => {
      it(`should redirect from /login to /tv/dashboards — ${ua.slice(0, 50)}`, () => {
        const req = buildRequest('/login', { jwt: 'token', userAgent: ua });
        const res = middleware(req);
        expect(res?.headers.get('location')).toContain('/tv/dashboards');
      });

      it(`should redirect from /home to /tv/dashboards — ${ua.slice(0, 50)}`, () => {
        const req = buildRequest('/home', { jwt: 'token', userAgent: ua });
        const res = middleware(req);
        expect(res?.headers.get('location')).toContain('/tv/dashboards');
      });
    });

    BROWSER_USER_AGENTS.forEach((ua) => {
      it(`should NOT detect as TV — ${ua.slice(0, 50)}`, () => {
        const req = buildRequest('/login', { jwt: 'token', userAgent: ua });
        const res = middleware(req);
        expect(res?.headers.get('location')).not.toContain('/tv/dashboards');
      });
    });
  });

  describe('TV route protection', () => {
    it('should redirect unauthenticated user from /tv/dashboards to /login', () => {
      const req = buildRequest('/tv/dashboards');
      const res = middleware(req);
      expect(res?.headers.get('location')).toContain('/login');
    });
  });
});
