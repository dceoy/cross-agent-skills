#!/usr/bin/env node
/**
 * wait_for_url.js - Wait for URL to be ready
 * Usage: node wait_for_url.js <url> [timeout_seconds]
 */

import http from 'http';
import https from 'https';

const args = process.argv.slice(2);

if (args.length === 0) {
  console.error('Usage: node wait_for_url.js <url> [timeout_seconds]');
  process.exit(1);
}

const targetUrl = args[0];
const timeoutSeconds = parseInt(args[1] || '120', 10);
const startTime = Date.now();
const maxWait = timeoutSeconds * 1000;

function checkUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    const req = client.get(url, (res) => {
      // Consider 2xx and 3xx as success
      if (res.statusCode >= 200 && res.statusCode < 400) {
        resolve(true);
      } else {
        reject(new Error(`Status ${res.statusCode}`));
      }
    });

    req.on('error', (err) => {
      reject(err);
    });

    req.setTimeout(5000, () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });
  });
}

async function waitForUrl() {
  let attempts = 0;
  let delay = 500; // Start with 500ms

  while (Date.now() - startTime < maxWait) {
    attempts++;
    try {
      await checkUrl(targetUrl);
      console.log(`✅ URL is ready after ${attempts} attempts (${Math.round((Date.now() - startTime) / 1000)}s)`);
      process.exit(0);
    } catch (err) {
      const elapsed = Math.round((Date.now() - startTime) / 1000);
      const remaining = Math.round((maxWait - (Date.now() - startTime)) / 1000);
      process.stdout.write(`\r⏳ Waiting for ${targetUrl}... (${elapsed}s elapsed, ${remaining}s remaining)`);

      // Exponential backoff up to 5s
      await new Promise(resolve => setTimeout(resolve, delay));
      delay = Math.min(delay * 1.5, 5000);
    }
  }

  console.error(`\n❌ Timeout: URL not ready after ${timeoutSeconds}s`);
  process.exit(1);
}

console.log(`⏳ Waiting for ${targetUrl} (timeout: ${timeoutSeconds}s)...`);
waitForUrl();
