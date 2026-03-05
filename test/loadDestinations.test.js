const { loadDestinations } = require('..');

describe('loadDestinations validation', () => {
  const ORIGINAL_ENV = { ...process.env };

  afterEach(() => {
    // Restore original env
    process.env = { ...ORIGINAL_ENV };
  });

  test('skips destinations with invalid protocol', () => {
    process.env.DEST_VALID_PROTOCOL = 'http';
    process.env.DEST_VALID_HOST = 'example.com';
    process.env.DEST_INVALID_PROTOCOL = 'ftp'; // invalid
    process.env.DEST_INVALID_HOST = 'bad.com';
    const destinations = loadDestinations();
    expect(destinations).toHaveProperty('valid');
    expect(destinations).not.toHaveProperty('invalid');
    expect(destinations.valid.protocol).toBe('http');
  });
});
