# Accessibility Tests

This directory contains automated accessibility tests for the Willing Consulting website.

## Prerequisites

1. Install dependencies:
   ```bash
   npm install
   ```

2. Build the site:
   ```bash
   quarto render
   ```

3. Install Playwright browsers:
   ```bash
   npx playwright install chromium
   ```

## Running Tests

Run all tests:
```bash
npm test
```

Run only accessibility tests:
```bash
npm run test:accessibility
```

## What's Being Tested

- **Main Landmark Test**: Verifies that the index page has a `<main>` landmark element, which is required for WCAG 2.1 compliance.
- **General Accessibility Scan**: Runs a comprehensive accessibility scan using axe-core to catch any accessibility violations.

## Continuous Integration

The accessibility tests can be integrated into GitHub Actions or other CI/CD pipelines to prevent accessibility regressions.
