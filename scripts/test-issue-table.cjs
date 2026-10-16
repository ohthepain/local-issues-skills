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
  click() { return this.handlers.click(); }
}

async function main() {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'issue-table-'));
  try {
    const title = '</script><img src=x onerror=alert(1)> | "quoted"';
    const manifest = {project_root: '/tmp/disposable-project', issues: [
      {id: 'original-id', title, state: 'ready-to-close', next_state: 'closed'},
      {id: 'closed-id', title: 'Closed report', state: 'closed'},
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
      const elements = Object.fromEntries(['tbody', '[role="status"]', 'pre', 'code'].map(key => [key, new Element()]));
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
    assert.equal(first.children[1].textContent, title);
    await first.children[3].children[0].click();
    assert(calls[0].prompt.includes('"action":"select"'));
    await first.children[2].children[1].click();
    await first.children[2].children[1].click();
    assert.equal(calls.length, 2, 'duplicate click must not submit twice');
    assert(calls[1].prompt.includes('"target_state":"closed"'));
    assert(calls[1].prompt.includes('"expected_state":"ready-to-close"'));
    assert(calls[1].prompt.includes('"id":"original-id"'));
    assert(calls[1].prompt.includes('"project_root":"/tmp/disposable-project"'));
    assert.equal(first.children[2].children[0].textContent, 'ready-to-close', 'no optimistic saved status');
    await closed.children[2].children[1].click();
    assert(calls[2].prompt.includes('"action":"delete"'));
    assert(calls[2].prompt.includes('"expected_state":"closed"'));
    const absent = mount(undefined);
    await absent.tbody.children[0].children[2].children[1].click();
    assert.equal(absent.pre.hidden, false);
    assert(absent.code.textContent.includes('"id":"original-id"'));
    const rejected = mount({sendFollowUpMessage: async () => { throw Error('cancelled'); }});
    const retry = rejected.tbody.children[0].children[2].children[1];
    await retry.click();
    assert.equal(retry.disabled, false);
    assert.equal(rejected.pre.hidden, false);
    console.log('Generated table handlers pass: scoped actions, duplicate guard, fallback, rejection, escaping, and no optimistic transitions.');
  } finally {
    fs.rmSync(dir, {recursive: true, force: true});
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
