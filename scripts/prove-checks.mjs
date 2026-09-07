import {mkdtemp,cp,symlink,readFile,writeFile} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import {join,resolve} from 'node:path';
import {spawnSync} from 'node:child_process';
const root=resolve('.'),scratch=await mkdtemp(join(tmpdir(),'diary-mutations-'));
for(const path of ['src','companion','public','scripts','docs/verification','package.json','vite.config.ts','vitest.config.ts','tsconfig.json','tailwind.config.js','postcss.config.js'])await cp(join(root,path),join(scratch,path),{recursive:true});
await symlink(join(root,'node_modules'),join(scratch,'node_modules'),'dir');await symlink(join(root,'dist'),join(scratch,'dist'),'dir');
const cases=[
 ['no-op','src/lib/diaryData.ts','let pending:', '// harmless comment\nlet pending:','lib',false],
 ['calendar gap','src/lib/diaryData.ts','!unresolvedDates.includes(key)','false','lib',true],
 ['field validation','src/lib/diaryData.ts',"['topic', 'quote', 'source', 'weeklyTheme']",'[]','lib',true],
 ['HTTP status','src/lib/diaryData.ts','if (!response.ok)','if (false)','lib',true],
 ['request cache','src/lib/diaryData.ts','pending ??= fetch','fetch','lib',true],
 ['shared loader update','src/lib/diaryData.ts','publish({data,loading:false,error:null});','/* no notification */','components',true],
 ['backup version','src/lib/journal.ts',"!['2.0','3.0'].includes(String(v.version))",'false','lib',true],
 ['note schema','src/lib/journal.ts','object(v) && date(v.dateKey)', 'object(v) && true','lib',true],
 ['import conflict','src/lib/journal.ts',"merged.conflicts.push(n)","merged[field][key] = n",'lib',true],
 ['recovery barrier','src/lib/journal.ts',"storage.setItem('srf-import-recovery', JSON.stringify({ backup: backup(current), raw }));",'/* removed recovery */','lib',true],
 ['rollback','src/lib/journal.ts','for (const [key, value] of Object.entries(raw))','for (const [key, value] of [])','lib',true],
 ['draft persistence','src/lib/journal.ts',"storage.setItem('srf-note-drafts',JSON.stringify({...drafts,[key]:{dateKey:key,content,timestamp:Date.now()}}));",'/* removed draft save */','lib',true],
 ['quote height','src/lib/quoteCard.ts','Math.max(1200,bookY+book.length*42+210)','1200','lib',true],
 ['date identity','src/lib/diaryDate.ts','new Date(CANONICAL_YEAR, month - 1, day)','new Date(year, month - 1, day - 1)','lib',true],
 ['patch author','scripts/merge-diary-json.mjs',"typeof entry.source !== 'string' || !entry.source.trim()",'false','lib',true],
 ['API keys','companion/jobs.mjs',"return Object.fromEntries(['HOME'", "return {...source}; return Object.fromEntries(['HOME'",'companion',true],
 ['Astra model','companion/jobs.mjs',"MODEL='gpt-6-astra'", "MODEL='gpt-5.6-sol'",'companion',true],
 ['ChatGPT auth','companion/jobs.mjs','code===0 && /Logged in using ChatGPT/i.test(text)','code===0','companion',true],
 ['PNG validation','companion/jobs.mjs','if(bytes.length<45', 'return {width:256,height:256}; if(bytes.length<45','companion',true],
 ['persisted job identity','companion/jobs.mjs','job.id !== id','false','companion',true],
 ['cancel state','companion/jobs.mjs',"job.state='cancelled'", "job.state='completed'",'companion',true],
 ['origin access','companion/server.mjs',"(req.headers.origin && req.headers.origin!==origin)",'false','companion',true],
 ['session access','companion/server.mjs',"if(!sameToken(req.headers['x-diary-session']))",'if(false)','companion',true],
 ['private fields','companion/server.mjs',"Object.keys(input).some((k)=>!['dateKey','style'].includes(k))",'false','companion',true],
 ['reflection close guard','src/components/NotesPanel/NotesPanel.tsx','if (!draftSafe) { setStorageError', 'if (false) { setStorageError','components',true],
 ['leap substitution','src/hooks/useDiaryEntry.ts','data?.entries[toMMDD(selectedDate)] ?? null',"data?.entries[toMMDD(selectedDate)] ?? data?.entries['02-28'] ?? null",'components',true],
 ['concurrent drafts','src/lib/journal.ts','original!==undefined && existing && existing.content!==original && existing.content!==content','false','lib',true],
 ['rollover','src/App.tsx','today.toDateString() !== lastToday.current','false','components',true],
 ['save preserves newer draft','src/lib/journal.ts','if (drafts[key]?.content === content)','if (true)','lib',true],
 ['reflection input validation','src/lib/journal.ts','validateNotes({ [key]: saved });','/* validation removed */','lib',true],
 ['draft input validation','src/lib/journal.ts','validateNotes({ [key]: { dateKey: key, content, timestamp: Date.now() } });','/* validation removed */','lib',true],
 ['artwork reconnect retries preview','src/components/ArtworkPanel.tsx','setConnection((value) => value + 1);','/* reconnect ignored */','components',true],
 ['artwork disconnect readiness','src/components/ArtworkPanel.tsx','setReady(false);','/* retain stale readiness */','components',true],
 ['failed save feedback','src/components/NotesPanel/NotesPanel.tsx','setStorageError(draftSafe','setStorageError(true','components',true],
 ['source wording custody','public/data/diary-entries.json','Therefore whosoever heareth these sayings of mine','Whoever hears these sayings','lib',true],
];
const run=suite=>spawnSync('npm',['run',`test:${suite}`],{cwd:scratch,encoding:'utf8',timeout:45000});
for(const suite of ['lib','components','companion']){const result=run(suite);if(result.status!==0)throw new Error(`Baseline ${suite} failed: ${result.stdout}\n${result.stderr}`);}
const results=[];
for(const [name,path,from,to,suite,expected] of cases){
  const file=join(scratch,path),original=await readFile(file,'utf8');const positions=[];let compact='';for(let i=0;i<original.length;i++){if(!/\s/.test(original[i])){compact+=original[i];positions.push(i);}}const needle=from.replace(/\s/g,'');const index=compact.indexOf(needle);if(index<0)throw new Error(`Mutation not applied: ${name}`);
  const changed=original.slice(0,positions[index])+to+original.slice(positions[index+needle.length-1]+1);
  await writeFile(file,changed);const result=run(suite);await writeFile(file,original);
  const killed=result.status!==0;const log=result.stdout+'\n'+result.stderr;
  const evidence=log.split('\n').filter(line=>/✖|FAIL|AssertionError|Assertion|expected|Expected|not ok/.test(line)).slice(0,5).join('\n');
  if(killed&&!/Assertion|expected|Expected|FAIL|✖|not ok/.test(evidence))throw new Error(`Unproven test failure for ${name}: ${log}`);
  results.push({name,result:killed?'KILLED':'SURVIVED',expected:expected?'KILLED':'SURVIVED',evidence});console.log(name,killed?'KILLED':'SURVIVED');
}
await writeFile(join(root,'artifacts/acceptance/mutations.json'),JSON.stringify({scratch,results},null,2));
if(results.some(r=>r.result!==r.expected))process.exitCode=1;
