const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const os = require('node:os');
const {spawnSync} = require('node:child_process');
const helper = path.resolve('skills/issues/scripts/list-issues.mjs');
const template = fs.readFileSync('skills/issues/triage-labels.md','utf8');
function fixture(fn) {
 const dir = fs.mkdtempSync(path.join(os.tmpdir(),'issues-cli-'));
 try {fn(dir);} finally {fs.rmSync(dir,{recursive:true,force:true});}
}
function report(dir,id,state,created='2026-10-17T10:00:00Z',title='Example') {
 fs.writeFileSync(path.join(dir,'.issues',id+'.md'),`---\nid: ${id}\ntitle: ${JSON.stringify(title)}\nstate: ${state}\ncreated: ${JSON.stringify(created)}\n---\nUnverified prose is not interpreted.\n`);
}
function run(dir, ...args) {
 const out = path.join(dir,'view.html');
 const result = spawnSync(process.execPath,[helper,'--project',dir,'--output',out,...args],{encoding:'utf8'});
 assert.equal(result.status,0,result.stderr);
 const html = fs.readFileSync(out,'utf8');
 return {html, data:JSON.parse(html.match(/type="application\/json"[^>]*>([\s\S]*?)<\/script>/)[1])};
}
function setup(dir,labels=template) {
 fs.mkdirSync(path.join(dir,'.issues'));
 fs.writeFileSync(path.join(dir,'.issues/triage-labels.md'),labels);
}
function snapshot(dir) {return fs.readdirSync(dir).sort().map(n=>[n,fs.readFileSync(path.join(dir,n),'utf8')]);}
test('absent and empty queues remain absent/unchanged',()=>fixture(dir=>{
 assert.equal(run(dir).data.total,0);assert(!fs.existsSync(path.join(dir,'.issues')));
 setup(dir);const before=snapshot(path.join(dir,'.issues'));assert.equal(run(dir).data.total,0);assert.deepEqual(snapshot(path.join(dir,'.issues')),before);
}));
test('standalone bundled skill lists YAML, warnings, counts, filters and stable sorting read-only',()=>fixture(dir=>{
 setup(dir);report(dir,'b','backlog');report(dir,'a','closed');report(dir,'c','in-review','invalid','</script><img src=x>');
 fs.writeFileSync(path.join(dir,'.issues/bad.md'),'broken');
 const before=snapshot(path.join(dir,'.issues'));
 const {data,html}=run(dir);
 assert.deepEqual(data.issues.map(i=>i.id),['a','b','c']);assert.equal(data.counts.closed,1);
 assert.equal(data.issues[1].next_state,'to-do');assert(data.warnings.some(w=>w.includes('bad.md')));assert(data.warnings.some(w=>w.includes('timestamp')));
 assert(!html.includes('<img'));assert.equal(data.issues[2].title,'</script><img src=x>');
 assert.equal(run(dir,'--state','closed').data.total,1);
 assert.deepEqual(run(dir,'--sort','newest').data.issues.map(i=>i.id),['a','b','c']);
 assert.deepEqual(snapshot(path.join(dir,'.issues')),before);
 // Only the installed skill bundle is copied, with no node_modules or sibling skill.
 const installed=path.join(dir,'installed');fs.cpSync(path.dirname(path.dirname(helper)),installed,{recursive:true});
 const isolated=spawnSync(process.execPath,[path.join(installed,'scripts/list-issues.mjs'),'--project',dir,'--output',path.join(dir,'isolated.html')],{encoding:'utf8'});
 assert.equal(isolated.status,0,isolated.stderr);
}));
test('custom links and no-commit bypass retain custom stages',()=>fixture(dir=>{
 setup(dir,template.replace('| `ready-for-commit` | `ready-for-commit` | `resolved` |','| `ready-for-commit` | `ready-for-commit` | `qa` |')+'\n| `custom` | `qa` | `resolved` | QA required |\n');
 fs.writeFileSync(path.join(dir,'.issues/preferences.json'),'{"commit":false}');report(dir,'a','in-review');report(dir,'b','qa');
 const {data}=run(dir);assert.equal(data.issues[0].next_state,'qa');assert.equal(data.issues[1].next_state,'resolved');
}));
test('legacy two-column states are supported',()=>fixture(dir=>{
 const roles=['ready-for-grilling','ready-for-repro','ready-to-fix','ready-to-verify','ready-for-commit','ready-to-close','closed'];
 setup(dir,'| State | Meaning / exit condition |\n| --- | --- |\n'+roles.map(s=>`| \`${s}\` | Evidence |`).join('\n'));
 report(dir,'a','ready-to-repro');report(dir,'b','ready-to-close');
 const {data}=run(dir);assert.equal(data.lifecycle_valid,true);assert.equal(data.issues[1].next_state,'closed');assert(data.issues[0].blocked_reason);
}));
test('broken/cyclic lifecycle blocks all mutations, unknown states retain saved status',()=>fixture(dir=>{
 setup(dir,template.replace('| `closed` | `closed` | — |','| `closed` | `closed` | `backlog` |'));
 report(dir,'a','closed');report(dir,'b','mystery');const {data}=run(dir);
 assert.equal(data.lifecycle_valid,false);assert(data.warnings.length);assert(data.issues.every(i=>!i.next_state));assert.equal(data.issues[1].state,'mystery');
}));
test('duplicate YAML keys and unsafe output are rejected explicitly',()=>fixture(dir=>{
 setup(dir);report(dir,'a','backlog');fs.appendFileSync(path.join(dir,'.issues/a.md'),'');
 fs.writeFileSync(path.join(dir,'.issues/b.md'),'---\nid: b\nid: duplicate\ntitle: Test\nstate: backlog\n---\n');
 assert(run(dir).data.warnings.some(w=>w.includes('b.md')));
 const before=snapshot(path.join(dir,'.issues'));
 const result=spawnSync(process.execPath,[helper,'--project',dir,'--output',path.join(dir,'.issues/a.md')],{encoding:'utf8'});
 assert.notEqual(result.status,0);assert.deepEqual(snapshot(path.join(dir,'.issues')),before);
}));

test('unusual saved state names count literally',()=>fixture(dir=>{
 setup(dir);report(dir,'a','__proto__');report(dir,'b','constructor');
 const {data}=run(dir);assert.equal(data.counts.__proto__,1);assert.equal(data.counts.constructor,1);
}));

test('optional prototype role supports renamed states and remains optional for existing queues',()=>fixture(dir=>{
 const labels=template.replaceAll('`ready-to-prototype` | `ready-to-prototype`','`ready-to-prototype` | `design-lab`').replace('`to-do` | `ready-to-prototype`','`to-do` | `design-lab`');
 setup(dir,labels);report(dir,'feature','design-lab');
 const before=snapshot(path.join(dir,'.issues'));
 const {data}=run(dir);assert.equal(data.lifecycle_valid,true);assert.equal(data.issues[0].next_state,'in-progress');assert.deepEqual(snapshot(path.join(dir,'.issues')),before);
 const old=template.split('\n').filter(line=>!line.startsWith('| `ready-to-prototype`')).join('\n').replace('`to-do` | `ready-to-prototype`','`to-do` | `in-progress`');
 fs.writeFileSync(path.join(dir,'.issues/triage-labels.md'),old);report(dir,'feature','to-do');
 assert.equal(run(dir).data.issues[0].next_state,'in-progress');
}));
test('duplicate optional prototype roles block transitions',()=>fixture(dir=>{
 setup(dir,template+'\n| `ready-to-prototype` | `second-design` | `in-progress` | Design |\n');report(dir,'feature','to-do');
 const {data}=run(dir);assert.equal(data.lifecycle_valid,false);assert(data.warnings.some(w=>w.includes('at most one ready-to-prototype')));assert(!data.issues[0].next_state);
}));

test('quick fix requires a current assessment, implementation state and known commit policy',()=>fixture(dir=>{
 setup(dir);fs.writeFileSync(path.join(dir,'.issues/preferences.json'),'{"commit":true}');
 const updated='2026-10-18T10:00:00Z';
 function assessed(id,state='in-progress',change={}) {
  const data={id,title:'Bounded fix',state,created:updated,updated,grill_later:false,quick_fix:{state,assessed_updated:updated,reason:'Observed failure, bounded correction and automated verification.'},...change};
  fs.writeFileSync(path.join(dir,'.issues',id+'.md'),'---\n'+Object.entries(data).map(([k,v])=>`${k}: ${JSON.stringify(v)}`).join('\n')+'\n---\n');
 }
 assessed('eligible');assessed('stale','in-progress',{updated:'2026-10-18T11:00:00Z'});assessed('deferred','in-progress',{grill_later:true});assessed('closed','closed');report(dir,'unassessed','in-progress');
 const before=snapshot(path.join(dir,'.issues'));const {data}=run(dir);
 assert.deepEqual(data.issues.filter(i=>i.quick_fix).map(i=>i.id),['eligible']);assert.deepEqual(snapshot(path.join(dir,'.issues')),before);
 fs.writeFileSync(path.join(dir,'.issues/preferences.json'),'{"commit":null}');assert(run(dir).data.issues.every(i=>!i.quick_fix));
}));
