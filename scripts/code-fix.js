#!/usr/bin/env node
// CLI: Code auto-fix using ESLint + Prettier
// Usage:
//   node scripts/code-fix.js --watch
//   node scripts/code-fix.js --pattern "backend/*.js"
const { spawn } = require('child_process');
// no unused imports

const args = process.argv.slice(2);
const hasWatch = args.includes('--watch');
const patternArgIndex = args.findIndex((a) => a === '--pattern');
const patterns = [];
if (patternArgIndex !== -1 && args[patternArgIndex + 1]) {
  patterns.push(args[patternArgIndex + 1]);
} else {
  patterns.push('backend/**/*.js', 'frontend/**/*.js', 'scripts/**/*.js', 'test/**/*.js');
}

function run(cmd, cmdArgs, opts = {}) {
  return new Promise((resolve, reject) => {
    const p = spawn(cmd, cmdArgs, {
      stdio: 'inherit',
      shell: process.platform === 'win32',
      ...opts,
    });
    p.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`${cmd} exited with code ${code}`));
      }
    });
  });
}

async function fixOnce() {
  const eslintArgs = ['--no-error-on-unmatched-pattern', '--fix'];
  if (patterns.length) {
    eslintArgs.unshift(...patterns);
  }
  const prettierArgs = ['--write', '.'];
  if (patterns.length) {
    // Convert glob patterns for Prettier by passing them directly
    prettierArgs.splice(1, 1, ...patterns);
  }

  console.log('\n➡️  Running ESLint --fix...');
  try {
    await run('npx', ['eslint', ...eslintArgs]);
  } catch (err) {
    console.warn('ESLint reported issues, continuing to Prettier.');
  }

  console.log('\n➡️  Running Prettier --write...');
  try {
    await run('npx', ['prettier', ...prettierArgs]);
  } catch (err) {
    console.warn('Prettier patterns unmatched, falling back to repository root.');
    await run('npx', ['prettier', '--write', '.']);
  }

  console.log('\n✅ Code fix completed.');
}

(async () => {
  if (!hasWatch) {
    await fixOnce();
    return;
  }

  // Watch mode using chokidar
  let chokidar;
  try {
    chokidar = require('chokidar');
  } catch (e) {
    console.warn('chokidar not installed. Install with: npm i -D chokidar');
    await fixOnce();
    return;
  }

  const watchPatterns = patterns.length ? patterns : ['**/*.js'];
  console.log('👀 Watch mode enabled for patterns:', watchPatterns.join(', '));

  const watcher = chokidar.watch(watchPatterns, { ignoreInitial: true });
  let running = false;
  let queued = false;
  async function trigger() {
    if (running) {
      queued = true;
      return;
    }
    running = true;
    try {
      await fixOnce();
    } catch (err) {
      console.error(err.message || err);
    } finally {
      running = false;
      if (queued) {
        queued = false;
        trigger();
      }
    }
  }

  watcher.on('add', trigger).on('change', trigger).on('unlink', trigger);
})();
