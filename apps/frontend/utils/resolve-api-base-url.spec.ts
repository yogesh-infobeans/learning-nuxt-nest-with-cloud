import { describe, expect, it } from 'vitest';
import { resolveApiBaseUrl } from '../utils/resolve-api-base-url';

describe('resolveApiBaseUrl', () => {
  it('uses internal API URL during server rendering', () => {
    expect(
      resolveApiBaseUrl(true, 'http://backend:4000', 'http://localhost:4000'),
    ).toBe('http://backend:4000');
  });

  it('uses public API URL in the browser', () => {
    expect(
      resolveApiBaseUrl(false, 'http://backend:4000', 'http://localhost:4000'),
    ).toBe('http://localhost:4000');
  });

});
