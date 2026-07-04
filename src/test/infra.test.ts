import { describe, expect, it } from 'vitest';

describe('test environment', () => {
  it('provides a jsdom window with working localStorage', () => {
    window.localStorage.setItem('probe', '1');
    expect(window.localStorage.getItem('probe')).toBe('1');
    window.localStorage.removeItem('probe');
  });
});
