const assert = require('assert');

const normalizeDomain = (value) => {
  if (!value) return 'example.com';
  const cleaned = String(value).trim().replace(/^https?:\/\//i, '').replace(/\/$/, '').toLowerCase();
  return cleaned || 'example.com';
};

const validateDomain = (value) => {
  const cleaned = normalizeDomain(value);

  if (!cleaned || cleaned.length > 253) {
    throw new Error('Domain is required and must be shorter than 253 characters.');
  }

  if (cleaned.includes('..') || cleaned.startsWith('.') || cleaned.endsWith('.')) {
    throw new Error('Domain contains invalid formatting (double dots or leading/trailing dots).');
  }

  if (/\s/.test(cleaned) || /[\/\\:@?&=#%\[\]]/.test(cleaned)) {
    throw new Error('Domain contains unsupported characters.');
  }

  const labels = cleaned.split('.');
  if (labels.length < 2 && cleaned !== 'localhost') {
    throw new Error('Domain must have at least two labels (e.g., example.com).');
  }

  if (labels.some((label) => label.length === 0 || label.length > 63 || label.startsWith('-') || label.endsWith('-'))) {
    throw new Error('Each DNS label must be 1 to 63 characters and cannot start or end with a hyphen.');
  }

  if (!/^[a-z0-9.-]+$/i.test(cleaned)) {
    throw new Error('Only letters, numbers, dots, and hyphens are allowed in the domain.');
  }

  if (/^(\d+\.){3}\d+$/.test(cleaned)) {
    throw new Error('IP addresses should be looked up with PTR records, not as domain names.');
  }

  return cleaned;
};

function runTests() {
  console.log('Running domain validation tests...\n');

  const passed = [];
  const failed = [];

  const tests = [
    {
      name: 'Valid domain: example.com',
      input: 'example.com',
      shouldPass: true,
      expected: 'example.com'
    },
    {
      name: 'Valid domain with subdomain: www.example.com',
      input: 'www.example.com',
      shouldPass: true,
      expected: 'www.example.com'
    },
    {
      name: 'Valid domain with https:// prefix',
      input: 'https://example.com',
      shouldPass: true,
      expected: 'example.com'
    },
    {
      name: 'Valid domain with trailing slash',
      input: 'example.com/',
      shouldPass: true,
      expected: 'example.com'
    },
    {
      name: 'Invalid domain with double dots',
      input: 'example..com',
      shouldPass: false,
      error: 'invalid formatting'
    },
    {
      name: 'Invalid domain with leading dot',
      input: '.example.com',
      shouldPass: false,
      error: 'invalid formatting'
    },
    {
      name: 'Invalid domain with trailing dot',
      input: 'example.com.',
      shouldPass: false,
      error: 'invalid formatting'
    },
    {
      name: 'Invalid domain with spaces',
      input: 'example .com',
      shouldPass: false,
      error: 'unsupported characters'
    },
    {
      name: 'Invalid domain with special characters',
      input: 'example@com',
      shouldPass: false,
      error: 'unsupported characters'
    },
    {
      name: 'Invalid domain label starting with hyphen',
      input: 'example.-com',
      shouldPass: false,
      error: 'hyphen'
    },
    {
      name: 'Invalid domain label ending with hyphen',
      input: 'example.com-',
      shouldPass: false,
      error: 'hyphen'
    },
    {
      name: 'Invalid domain too long',
      input: 'a'.repeat(254),
      shouldPass: false,
      error: 'shorter than 253'
    },
    {
      name: 'Invalid domain single label',
      input: 'localhost',
      shouldPass: true,
      expected: 'localhost'
    },
    {
      name: 'Invalid IP address',
      input: '192.168.1.1',
      shouldPass: false,
      error: 'IP addresses'
    },
    {
      name: 'Invalid domain with numbers only',
      input: '123',
      shouldPass: false,
      error: 'at least two labels'
    },
    {
      name: 'Valid domain with hyphens',
      input: 'my-domain-name.com',
      shouldPass: true,
      expected: 'my-domain-name.com'
    },
    {
      name: 'Case insensitive domain',
      input: 'EXAMPLE.COM',
      shouldPass: true,
      expected: 'example.com'
    },
    {
      name: 'Uppercase with protocol',
      input: 'HTTPS://EXAMPLE.COM/',
      shouldPass: true,
      expected: 'example.com'
    },
    {
      name: 'Valid domain with numbers',
      input: 'example123.com',
      shouldPass: true,
      expected: 'example123.com'
    }
  ];

  tests.forEach((test) => {
    try {
      const result = validateDomain(test.input);
      if (test.shouldPass) {
        if (result === test.expected) {
          passed.push(test.name);
          console.log(`✓ ${test.name}`);
        } else {
          failed.push(`${test.name} - Expected "${test.expected}", got "${result}"`);
          console.log(`✗ ${test.name} - Expected "${test.expected}", got "${result}"`);
        }
      } else {
        failed.push(`${test.name} - Should have thrown error but returned "${result}"`);
        console.log(`✗ ${test.name} - Should have thrown error but returned "${result}"`);
      }
    } catch (error) {
      if (!test.shouldPass) {
        if (error.message.includes(test.error)) {
          passed.push(test.name);
          console.log(`✓ ${test.name}`);
        } else {
          failed.push(`${test.name} - Expected error containing "${test.error}", got "${error.message}"`);
          console.log(`✗ ${test.name} - Expected error containing "${test.error}", got "${error.message}"`);
        }
      } else {
        failed.push(`${test.name} - Unexpected error: ${error.message}`);
        console.log(`✗ ${test.name} - Unexpected error: ${error.message}`);
      }
    }
  });

  console.log(`\n${'='.repeat(60)}`);
  console.log(`Tests passed: ${passed.length}/${tests.length}`);
  console.log(`Tests failed: ${failed.length}/${tests.length}`);

  if (failed.length > 0) {
    console.log(`\nFailed tests:`);
    failed.forEach((test) => console.log(`  - ${test}`));
    process.exit(1);
  } else {
    console.log('\n✓ All tests passed!');
    process.exit(0);
  }
}

if (require.main === module) {
  runTests();
}

module.exports = { validateDomain, normalizeDomain };
