// Execute the generated fragment's real handlers against a small DOM/host test double.
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const vm = require('node:vm');
const { spawnSync } = require('node:child_process');

class Element {
  constructor() { this.children = []; this.handlers = {}; this.textContent = ''; this.hidden = true; }
  append(...items) { this.children.push(...items); }
  setAttribute() {}
  addEventListener(name, handler) { this.handlers[name] = handler; }
  click() { return this.disabled ? undefined : this.handlers.click(); }
  change(checked) { this.checked = checked; return this.handlers.change(); }
}

async function main() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'issue-table-'));
  try {
    const title = '</script><img src=x onerror=alert(1)> | "quoted"';
    const manifest = {project_root: '/tmp/disposable-project', issues: [
      {id: 'original-id', title, state: 'ready-to-close', next_state: 'closed'},
      {id: 'closed-id', title: 'Closed report', state: 'closed'},
      {id: 'second-ready', title: 'Second ready report', state: 'ready-to-close', next_state: 'closed'},
      {id: 'repro-id', title: 'Reproduced report', state: 'ready-for-repro', next_state: 'ready-to-fix'},
    ]};
    const input = path.join(dir, 'input.json');
    const output = path.join(dir, 'table.html');
    fs.writeFileSync(input, JSON.stringify(manifest));
    const result = spawnSync('python3', [path.join(__dirname, '../skills/issues/scripts/render_table.py'), input, output], {encoding: 'utf8'});
    assert.equal(result.status, 0, result.stderr);
    const html = fs.readFileSync(output, 'utf8');
    assert(!html.includes('<img'));
    const data = JSON.parse(html.match(/type="application\/json"[^>]*>([\s\S]*?)<\/script>/)[1]);
    const script = html.match(/<script>([\s\S]*?)<\/script>/)[1];
    function mount(openai) {
      const elements = Object.fromEntries(['tbody', '[role="status"]', 'pre', 'code', '[data-role="select-all"]', '[data-role="selection-count"]', '[data-batch="close"]', '[data-batch="next"]', '[data-batch="delete"]'].map(key => [key, new Element()]));
      const root = {querySelector: key => elements[key]};
      vm.runInNewContext(script, {
        window: {openai},
        document: {getElementById: id => id.endsWith('-data') ? {textContent: JSON.stringify(data)} : root,
          createElement: () => new Element()},
      });
      return elements;
    }
    const calls = [];
    const elements = mount({sendFollowUpMessage: async request => { calls.push(request); }});
    const [first, closed] = elements.tbody.children;
    const checkboxLabel = first.children[0].children[0];
    assert.equal(checkboxLabel.className, 'form-check', 'row checkbox needs the renderer wrapper for its checked indicator');
    const rowCheckbox = checkboxLabel.children[0];
    rowCheckbox.change(true);
    assert.equal(rowCheckbox.checked, true);
    assert.equal(elements['[data-role="selection-count"]'].textContent, '1 selected');
    assert.equal(elements['[data-role="select-all"]'].indeterminate, true);
    rowCheckbox.change(false);
    assert.equal(rowCheckbox.checked, false);
    assert.equal(elements['[data-role="selection-count"]'].textContent, '0 selected');
    assert.equal(first.children[2].textContent, title);
    await first.children[4].children[0].click();
    assert(calls[0].prompt.includes('"action":"select"'));
    await first.children[3].children[1].click();
    await first.children[3].children[1].click();
    assert.equal(calls.length, 2, 'duplicate click must not submit twice');
    assert(calls[1].prompt.includes('"target_state":"closed"'));
    assert(calls[1].prompt.includes('"expected_state":"ready-to-close"'));
    assert(calls[1].prompt.includes('"id":"original-id"'));
    assert(calls[1].prompt.includes('"project_root":"/tmp/disposable-project"'));
    assert.equal(first.children[3].children[0].textContent, 'ready-to-close', 'no optimistic saved status');
    await closed.children[3].children[1].click();
    assert(calls[2].prompt.includes('"action":"delete"'));
    assert(calls[2].prompt.includes('"expected_state":"closed"'));
    const absent = mount(undefined);
    await absent.tbody.children[0].children[3].children[1].click();
    assert.equal(absent.pre.hidden, false);
    assert(absent.code.textContent.includes('"id":"original-id"'));
    const rejected = mount({sendFollowUpMessage: async () => { throw Error('cancelled'); }});
    const retry = rejected.tbody.children[0].children[3].children[1];
    await retry.click();
    assert.equal(retry.disabled, false);
    assert.equal(rejected.pre.hidden, false);
    const batchCalls = [];
    const batch = mount({sendFollowUpMessage: async request => { batchCalls.push(request); }});
    assert.equal(batch['[data-batch="close"]'].disabled, true, 'empty selection cannot submit');
    batch['[data-role="select-all"]'].change(true);
    await batch['[data-batch="close"]'].click();
    assert.equal(batchCalls.length, 1, 'one message for the whole batch');
    const payload = JSON.parse(batchCalls[0].prompt.match(/explicit issue batch: (.*?)\. Resolve /)[1]);
    assert.deepEqual(payload.actions.map(a => a.id), ['original-id', 'second-ready']);
    assert(payload.actions.every(a => a.action === 'next' && a.expected_state === 'ready-to-close' && a.target_state === 'closed'));
    assert.deepEqual(payload.skipped_ids, ['closed-id', 'repro-id']);
    await batch['[data-batch="close"]'].click();
    assert.equal(batchCalls.length, 1, 'submitted rows cannot be sent twice');
    assert.equal(batch.tbody.children.length, 4, 'no optimistic removal');
    const deletion = mount({sendFollowUpMessage: async request => { batchCalls.push(request); }});
    deletion['[data-role="select-all"]'].change(true);
    await deletion['[data-batch="delete"]'].click();
    const deletes = JSON.parse(batchCalls[1].prompt.match(/explicit issue batch: (.*?)\. Resolve /)[1]);
    assert.deepEqual(deletes.actions.map(a => a.id), ['closed-id']);
    assert(deletes.actions.every(a => a.action === 'delete' && a.expected_state === 'closed'));
    const advances = mount({sendFollowUpMessage: async request => { batchCalls.push(request); }});
    advances['[data-role="select-all"]'].change(true);
    await advances['[data-batch="next"]'].click();
    const next = JSON.parse(batchCalls[2].prompt.match(/explicit issue batch: (.*?)\. Resolve /)[1]);
    assert.deepEqual(next.actions.map(a => a.id), ['repro-id']);
    const failedBatch = mount({sendFollowUpMessage: async () => { throw Error('rejected'); }});
    failedBatch['[data-role="select-all"]'].change(true);
    await failedBatch['[data-batch="close"]'].click();
    assert.equal(failedBatch['[data-batch="close"]'].disabled, false, 'retry after failure');
    assert.equal(failedBatch.pre.hidden, false);
    const noBridge = mount(undefined);
    noBridge['[data-role="select-all"]'].change(true);
    await noBridge['[data-batch="close"]'].click();
    assert.equal(noBridge.pre.hidden, false);
    assert(noBridge.code.textContent.includes('explicit issue batch'));
    data.issues = [
      {id: 'quick', title: 'Bounded fix', state: 'in-progress', quick_fix: true},
      {id: 'ordinary', title: 'No assessment', state: 'in-progress'},
      {id: 'closed', title: 'Closed', state: 'closed', quick_fix: true},
    ];
    const quickCalls = [];
    const quick = mount({sendFollowUpMessage: async request => quickCalls.push(request)});
    const work = quick.tbody.children[0].children[4];
    assert.equal(work.children[0].textContent, 'Work on issue');
    const quickButton = work.children[1].children[0];
    assert.equal(quickButton.textContent, 'Quick fix');
    assert.equal(quick.tbody.children[1].children[4].children.length, 1);
    assert.equal(quick.tbody.children[2].children[4].children.length, 1);
    await quickButton.click();await quickButton.click();
    assert.equal(quickCalls.length, 1);
    assert(quickCalls[0].prompt.includes('"action":"quick-fix"'));
    assert(quickCalls[0].prompt.includes('"expected_state":"in-progress"'));
    assert(quickCalls[0].prompt.includes('fix only this issue'));
    const quickFallback = mount(undefined);
    await quickFallback.tbody.children[0].children[4].children[1].children[0].click();
    assert.equal(quickFallback.pre.hidden, false);
    assert(quickFallback.code.textContent.includes('"action":"quick-fix"'));
    const quickRejected = mount({sendFollowUpMessage: async () => { throw Error('cancelled'); }});
    const quickRetry = quickRejected.tbody.children[0].children[4].children[1].children[0];
    await quickRetry.click();assert.equal(quickRetry.disabled, false);
    data.acceptance_state = 'resolved';
    data.closed_state = 'done';
    data.issues = [
      {id: 'custom-close', title: 'Acceptance', state: 'resolved', next_state: 'done'},
      {id: 'custom-delete', title: 'Terminal', state: 'done'},
      {id: 'qa', title: 'Extra stage', state: 'qa', next_state: 'resolved'},
    ];
    const customCalls = [];
    const custom = mount({sendFollowUpMessage: async request => customCalls.push(request)});
    custom['[data-role="select-all"]'].change(true);
    await custom['[data-batch="close"]'].click();
    assert(customCalls[0].prompt.includes('"target_state":"done"'));
    await custom['[data-batch="next"]'].click();
    assert(customCalls[1].prompt.includes('"target_state":"resolved"'));
    await custom.tbody.children[1].children[3].children[1].click();
    assert(customCalls[2].prompt.includes('"action":"delete"'));
    console.log('Table handlers pass: individual and batch scopes, selection, one dispatch, separate deletion, duplicates, fallback, rejection, and escaping.');

  } finally {
    fs.rmSync(dir, {recursive: true, force: true});
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
