/**
 * Lokul API Load Test — autocannon programmatic runner
 * Tests the 8 most traffic-critical mobile API endpoints.
 * Usage: node load-test.mjs
 */

import autocannon from 'autocannon';

const BASE = 'http://localhost:3000';
const DURATION = 10;   // seconds per endpoint
const CONNECTIONS = 10; // concurrent connections

const SUITES = [
  {
    name: 'Feature Flags (GET /api/mobile/flags)',
    url: `${BASE}/api/mobile/flags`,
  },
  {
    name: 'Locality News (GET /api/mobile/news)',
    url: `${BASE}/api/mobile/news?pinCode=400001&city=Mumbai`,
  },
  {
    name: 'Broadcasts (GET /api/mobile/broadcasts)',
    url: `${BASE}/api/mobile/broadcasts?pinCode=400001&city=Mumbai`,
  },
  {
    name: 'Feed (GET /api/mobile/feed)',
    url: `${BASE}/api/mobile/feed?pinCode=400001&limit=20`,
  },
  {
    name: 'Merchants (GET /api/mobile/merchants)',
    url: `${BASE}/api/mobile/merchants?pinCode=400001`,
  },
  {
    name: 'Classifieds (GET /api/mobile/classifieds)',
    url: `${BASE}/api/mobile/classifieds?pinCode=400001`,
  },
  {
    name: 'Group Buys (GET /api/mobile/group-buys)',
    url: `${BASE}/api/mobile/group-buys?pinCode=400001`,
  },
  {
    name: 'Posts (GET /api/mobile/posts)',
    url: `${BASE}/api/mobile/posts?pinCode=400001&limit=20`,
  },
];

function pad(str, len) {
  return String(str).padEnd(len);
}
function padL(str, len) {
  return String(str).padStart(len);
}

function printRow(label, latAvg, latP99, rps, errors, non2xx) {
  const errFlag = errors + non2xx > 0 ? ' ⚠' : '';
  console.log(
    `│ ${pad(label, 42)} │ ${padL(latAvg, 8)} │ ${padL(latP99, 8)} │ ${padL(rps, 8)} │ ${padL(errors + non2xx, 8)}${errFlag} │`
  );
}

async function runSuite(suite) {
  return new Promise((resolve) => {
    const instance = autocannon(
      {
        url: suite.url,
        connections: CONNECTIONS,
        duration: DURATION,
        headers: { 'Accept': 'application/json' },
        silent: true,
      },
      (err, result) => {
        if (err) {
          resolve({ name: suite.name, error: err.message });
        } else {
          resolve({
            name: suite.name,
            latAvg: result.latency.mean.toFixed(1),
            latP99: result.latency.p99,
            rps: Math.round(result.requests.mean),
            errors: result.errors,
            non2xx: result.non2xx,
            timeouts: result.timeouts,
            totalReqs: result.requests.total,
          });
        }
      }
    );
    autocannon.track(instance, { renderProgressBar: false });
  });
}

console.log('\n');
console.log('╔══════════════════════════════════════════════════════════════════════════════╗');
console.log('║            LOKUL API LOAD TEST  —  10s × 10 connections per endpoint        ║');
console.log('╚══════════════════════════════════════════════════════════════════════════════╝');
console.log(`  Server : ${BASE}`);
console.log(`  Date   : ${new Date().toISOString()}`);
console.log();

const results = [];
for (const suite of SUITES) {
  process.stdout.write(`  Running: ${suite.name} ... `);
  const r = await runSuite(suite);
  results.push(r);
  if (r.error) {
    console.log(`ERROR — ${r.error}`);
  } else {
    console.log(`done  (${r.totalReqs} reqs)`);
  }
}

console.log();
console.log('┌────────────────────────────────────────────┬──────────┬──────────┬──────────┬──────────┐');
console.log('│ Endpoint                                   │ Lat avg  │ Lat p99  │  Req/s   │ Errors   │');
console.log('├────────────────────────────────────────────┼──────────┼──────────┼──────────┼──────────┤');

for (const r of results) {
  if (r.error) {
    console.log(`│ ${pad(r.name, 42)} │ ${'ERROR'.padEnd(8)} │ ${''.padEnd(8)} │ ${''.padEnd(8)} │ ${''.padEnd(8)} │`);
  } else {
    printRow(r.name, `${r.latAvg}ms`, `${r.latP99}ms`, r.rps, r.errors, r.non2xx);
  }
}

console.log('└────────────────────────────────────────────┴──────────┴──────────┴──────────┴──────────┘');

// Summary
const ok = results.filter(r => !r.error && r.errors === 0 && r.non2xx === 0);
const slow = results.filter(r => !r.error && Number(r.latAvg) > 200);
const errored = results.filter(r => r.error || r.errors > 0 || r.non2xx > 0);

console.log();
console.log('── Summary ─────────────────────────────────────────────────────────────────────');
console.log(`  Clean endpoints  : ${ok.length}/${results.length}`);
if (slow.length > 0) {
  console.log(`  Slow (avg >200ms): ${slow.map(r => r.name.split('(')[0].trim()).join(', ')}`);
}
if (errored.length > 0) {
  console.log(`  With errors      : ${errored.map(r => r.name.split('(')[0].trim()).join(', ')}`);
}
console.log('────────────────────────────────────────────────────────────────────────────────');
console.log();
