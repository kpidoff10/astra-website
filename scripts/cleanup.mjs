#!/usr/bin/env node

import { spawn } from 'child_process';

// Use psql via environment to clean database
const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error('❌ DATABASE_URL not set');
  process.exit(1);
}

// Extract connection details
const url = new URL(dbUrl);
const host = url.hostname;
const port = url.port || '5432';
const database = url.pathname.slice(1);
const username = url.username;
const password = url.password;

console.log('🧹 Cleaning database...');
console.log(`📍 Host: ${host}`);
console.log(`📍 Database: ${database}`);

// Run SQL commands via environment variable for password
const env = { ...process.env, PGPASSWORD: password };

const psqlArgs = [
  '-h', host,
  '-p', port,
  '-U', username,
  '-d', database,
  '-c', 'DELETE FROM "EmailAudit"; DELETE FROM "User";'
];

const psql = spawn('psql', psqlArgs, { env });

let output = '';
let errorOutput = '';

psql.stdout.on('data', (data) => {
  output += data.toString();
  console.log(data.toString());
});

psql.stderr.on('data', (data) => {
  errorOutput += data.toString();
  console.error(data.toString());
});

psql.on('close', (code) => {
  if (code === 0) {
    console.log('\n✅ Database cleaned successfully!');
    process.exit(0);
  } else {
    console.error(`\n❌ Error: psql exited with code ${code}`);
    console.error('Make sure psql is installed: brew install postgresql@16');
    process.exit(1);
  }
});

psql.on('error', (err) => {
  console.error('❌ Failed to spawn psql:', err.message);
  console.error('Install PostgreSQL tools: brew install postgresql@16');
  process.exit(1);
});
