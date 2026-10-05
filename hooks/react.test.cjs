const test = require('node:test');
const assert = require('node:assert/strict');
const {spawnSync} = require('node:child_process');
const path = require('node:path');
const {output} = require('./react.cjs');

test('valid prompt produces parseable context without echoing the prompt', () => {
  const marker = 'PRIVATE_INPUT_123';
  const result = spawnSync(process.execPath, [path.join(__dirname, 'react.cjs')], {
    input: JSON.stringify({hook_event_name: 'UserPromptSubmit', prompt: marker}),
    encoding: 'utf8', env: {...process.env, SOFT_FOCUS_AUTO: ''}
  });
  assert.equal(result.status, 0);
  const body = JSON.parse(result.stdout);
  assert.equal(body.hookSpecificOutput.hookEventName, 'UserPromptSubmit');
  assert.ok(body.hookSpecificOutput.additionalContext.length > 0);
  assert.ok(!result.stdout.includes(marker));
});

test('disabled, irrelevant and empty events stay silent', () => {
  assert.equal(output({hook_event_name: 'UserPromptSubmit', prompt: 'hello'}, {SOFT_FOCUS_AUTO: 'off'}), null);
  for (const input of [null, {}, {hook_event_name: 'Stop', prompt: 'hello'},
    {hook_event_name: 'UserPromptSubmit', prompt: '  '},
    {hook_event_name: 'UserPromptSubmit', prompt: 42}]) assert.equal(output(input, {}), null);
});

test('malformed input does not block a prompt or print diagnostics', () => {
  const result = spawnSync(process.execPath, [path.join(__dirname, 'react.cjs')], {input: '{', encoding: 'utf8'});
  assert.equal(result.status, 0);
  assert.equal(result.stdout, '');
  assert.equal(result.stderr, '');
});
