import { readFileSync, readdirSync, lstatSync, realpathSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { resolve, dirname, join, basename, isAbsolute } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { randomUUID } from 'node:crypto';
import { parse } from 'yaml';

type Stage = { role: string; state: string; next?: string };
type Issue = { id: string; title: string; state: string; created: string; path: string; next_state?: string; blocked_reason?: string };
const roles = ['ready-for-grilling', 'ready-for-repro', 'ready-to-fix', 'ready-to-verify', 'ready-for-commit', 'ready-to-close', 'closed'];
const optionalRoles = ['ready-to-prototype'];
const text = (file: string) => readFileSync(file, 'utf8');
const plain = (value: string) => value.trim().replace(/^`(.*)`$/, '$1');
const escape = (value: string) => value.replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
function lifecycle(file: string): Stage[] {
  if (!existsSync(file)) throw Error('Missing triage-labels.md; transitions unavailable.');
  const lines = text(file).split(/\r?\n/).filter(line => /^\s*\|/.test(line));
  const rows = lines.map(line => line.trim().replace(/^\||\|$/g, '').split('|').map(plain));
  const header = rows.findIndex(row => row.includes('State') && (row.includes('Role') || row.some(cell => cell.startsWith('Meaning'))));
  if (header < 0) throw Error('Unrecognized lifecycle table.');
  const columns = rows[header];
  const body = rows.slice(header + 1).filter(row => !row.every(cell => /^:?-+:?$/.test(cell)));
  const stateAt = columns.indexOf('State'), roleAt = columns.indexOf('Role'), nextAt = columns.indexOf('Next state');
  const stages = body.map((row, index) => ({
    role: roleAt < 0 ? row[stateAt] : row[roleAt], state: row[stateAt],
    next: roleAt < 0 ? body[index + 1]?.[stateAt] : row[nextAt],
  })).map(stage => ({...stage, next: !stage.next || ['—', '-', 'none'].includes(stage.next) ? undefined : stage.next}));
  if (roleAt >= 0 && nextAt < 0) throw Error('Lifecycle lacks Next state column.');
  if (new Set(stages.map(s => s.state)).size !== stages.length || stages.some(s => !s.state)) throw Error('Duplicate or missing lifecycle state.');
  for (const role of roles) if (stages.filter(s => s.role === role).length !== 1) throw Error(`Lifecycle requires one ${role} role.`);
  for (const role of optionalRoles) if (stages.filter(s => s.role === role).length > 1) throw Error(`Lifecycle permits at most one ${role} role.`);
  if (stages.some(s => !roles.includes(s.role) && !optionalRoles.includes(s.role) && s.role !== 'custom')) throw Error('Unknown lifecycle role.');
  const byState = new Map(stages.map(s => [s.state, s]));
  for (const stage of stages) {
    const seen = new Set<string>();
    let current: Stage | undefined = stage;
    while (current) {
      if (seen.has(current.state)) throw Error('Lifecycle contains a cycle.');
      seen.add(current.state);
      if (current.role === 'closed') { if (current.next) throw Error('Closed state must be terminal.'); break; }
      if (!current.next || !byState.has(current.next)) throw Error(`Broken transition from ${current.state}.`);
      current = byState.get(current.next);
    }
  }
  return stages;
}
function main() {
  const args = process.argv.slice(2);
  const options: Record<string, string[]> = {};
  for (let i = 0; i < args.length; i++) {
    const key = args[i];
    if (!['--project', '--output', '--state', '--sort'].includes(key) || !args[i + 1]) throw Error('Usage: list-issues.mjs --project PATH --output ABSOLUTE.html [--state STATE ...] [--sort oldest|newest|title|state]');
    (options[key] ??= []).push(args[++i]);
  }
  let root = resolve(options['--project']?.[0] ?? process.cwd());
  try { root = execFileSync('git', ['-C', root, 'rev-parse', '--show-toplevel'], {encoding:'utf8', stdio:['ignore','pipe','ignore']}).trim(); } catch { /* Non-Git projects use the supplied root. */ }
  const output = options['--output']?.[0];
  if (!output || !isAbsolute(output)) throw Error('--output must be an absolute HTML path.');
  const queue = join(root, '.issues');
  // Output must never alter queue contents, even when accidentally requested there.
  let ancestor = resolve(output);
  const suffix: string[] = [];
  while (!existsSync(ancestor)) { suffix.unshift(basename(ancestor)); ancestor = dirname(ancestor); }
  const actualOutput = resolve(realpathSync(ancestor), ...suffix);
  const actualQueue = existsSync(queue) ? realpathSync(queue) : resolve(realpathSync(root), '.issues');
  if (actualOutput === actualQueue || actualOutput.startsWith(actualQueue + '/')) throw Error('Output must be outside .issues.');
  const warnings: string[] = [], issues: Issue[] = [];
  const files = existsSync(queue) ? readdirSync(queue).filter(name => /\.md$/i.test(name) && name !== 'triage-labels.md').sort() : [];
  let stages: Stage[] = [], noCommit = false, preferencesValid = true;
  if (files.length) {
    try { stages = lifecycle(join(queue, 'triage-labels.md')); } catch (error) { warnings.push(String(error)); }
    const prefs = join(queue, 'preferences.json');
    if (existsSync(prefs)) try {
      const value = JSON.parse(text(prefs));
      if (!value || ![true, false, null].includes(value.commit)) throw Error('commit must be true, false, or null');
      noCommit = value.commit === false;
    } catch (error) { preferencesValid = false; warnings.push(`preferences.json: ${error}`); }
  }
  for (const name of files) try {
    const path = join(queue, name);
    if (!lstatSync(path).isFile()) throw Error('Not a regular report file.');
    const source = text(path).replace(/^\uFEFF/, '');
    const match = source.match(/^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/);
    if (!match) throw Error('Missing YAML frontmatter.');
    const data = parse(match[1]);
    for (const key of ['id', 'title', 'state']) if (typeof data?.[key] !== 'string' || !data[key].trim()) throw Error(`Missing/invalid ${key}.`);
    if (data.id !== basename(name, '.md')) throw Error('ID differs from report filename.');
    const created = typeof data.created === 'string' ? data.created : '';
    if (!created || !/^\d{4}-\d\d-\d\dT/.test(created) || !Number.isFinite(Date.parse(created))) warnings.push(`${name}: missing/invalid created timestamp; sorted after dated reports.`);
    const issue: Issue = {id:data.id, title:data.title, state:data.state, created, path};
    const stage = stages.find(s => s.state === issue.state);
    if (!stage || !preferencesValid) issue.blocked_reason = !stage ? 'Unknown state or invalid lifecycle; transition unavailable.' : 'Invalid commit preference; transition unavailable.';
    else {
      let next = stage.next;
      if (noCommit && next === stages.find(s => s.role === 'ready-for-commit')?.state) next = stages.find(s => s.role === 'ready-for-commit')?.next;
      issue.next_state = next;
    }
    issues.push(issue);
  } catch (error) { warnings.push(`${name}: ${error}`); }
  const duplicates = new Set(issues.filter((issue, i) => issues.findIndex(other => other.id === issue.id) !== i).map(issue => issue.id));
  for (const id of duplicates) warnings.push(`${id}: duplicate ID; actions unavailable.`);
  const selected = issues.filter(issue => !duplicates.has(issue.id) && (!options['--state'] || options['--state'].includes(issue.state)));
  const sort = options['--sort']?.[0] ?? 'oldest';
  if (!['oldest','newest','title','state'].includes(sort)) throw Error('Unsupported sort.');
  const compare = (a: string, b: string) => a < b ? -1 : a > b ? 1 : 0;
  selected.sort((a,b) => {
    if (sort === 'title' || sort === 'state') return compare(a[sort], b[sort]) || compare(a.id,b.id);
    const date = (value: string) => /^\d{4}-\d\d-\d\dT/.test(value) ? Date.parse(value) : NaN;
    const av = date(a.created), bv = date(b.created);
    if (!Number.isFinite(av) || !Number.isFinite(bv)) return Number.isFinite(av) ? -1 : Number.isFinite(bv) ? 1 : compare(a.id,b.id);
    return (sort === 'newest' ? bv-av : av-bv) || compare(a.id,b.id);
  });
  const counts: Record<string, number> = Object.create(null);
  for (const issue of selected) counts[issue.state] = (counts[issue.state] ?? 0) + 1;
  const data = {project_root:root, acceptance_state:stages.find(s => s.role === 'ready-to-close')?.state ?? null,
    closed_state:stages.find(s => s.role === 'closed')?.state ?? null, lifecycle_valid:stages.length > 0,
    request_advances:true, issues:selected, warnings, counts, total:selected.length};
  const skill = resolve(dirname(fileURLToPath(import.meta.url)), '..');
  const payload = JSON.stringify(data).replace(/</g,'\\u003c').replace(/>/g,'\\u003e').replace(/&/g,'\\u0026').replace(/\u2028/g,'\\u2028').replace(/\u2029/g,'\\u2029');
  const summary = `${selected.length} issues${options['--state'] ? ` shown of ${issues.length}` : ''}` + Object.entries(counts).map(([state,n]) => ` · ${state}: ${n}`).join('');
  const diagnostics = warnings.length ? `<ul>${warnings.map(w => `<li>${escape(w)}</li>`).join('')}</ul>` : '';
  const rootId = 'issues-'+randomUUID();
  const html = `<p>${escape(summary)}</p>${diagnostics}\n` + text(join(skill,'assets/issue-table.html')).replace(/__ROOT__|__CAPTION__|__DATA__/g, marker => ({__ROOT__:rootId, __CAPTION__:escape(`Local issues — ${basename(root)}`), __DATA__:payload}[marker]!));
  mkdirSync(dirname(output),{recursive:true}); writeFileSync(output,html);
  console.log(JSON.stringify({path:output, project_root:root, total:selected.length, counts, warnings}));
}
try { main(); } catch (error) { console.error(String(error)); process.exitCode = 1; }
