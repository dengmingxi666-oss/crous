import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';
const source=fs.readFileSync(new URL('../public/app/boot.js',import.meta.url),'utf8');
const tick=()=>new Promise(r=>setTimeout(r,25));

async function boot(server,memory=new Map(),denyStorage=false){
 const storage={getItem:k=>memory.get(k)??null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)};
 const context={window:{},localStorage:denyStorage?{getItem(){throw Error("Storage denied")},setItem(){throw Error("Storage denied")},removeItem(){throw Error("Storage denied")}}:storage,AbortSignal,console,setTimeout,clearTimeout,confirm:()=>true};
 context.window.window=context.window;
 const node={textContent:'',dataset:{},remove(){},innerHTML:''};
 context.document={querySelector:()=>node,createElement:()=>({}),addEventListener(){},body:{appendChild(script){if(script.src==='app.js'){context.window.CampusSeed=()=>({value:'seed'});const modelStorage=context.window.CAMPUS_LOCAL;context.window.campusModel={state:JSON.parse(modelStorage.getItem(context.window.CROUS_STORAGE_KEY)||'{"value":"seed"}'),storage:modelStorage,persist(){modelStorage.setItem(context.window.CROUS_STORAGE_KEY,JSON.stringify(this.state));return this.state;}};context.window.ui={refreshes:0,navigations:0,close(){},refresh(){this.refreshes++;},go(){this.navigations++;},toast(){}};}setTimeout(()=>script.onload(),0);}}};
 context.window.addEventListener=()=>{};
 context.fetch=async(url,options)=>{
  if(!options?.method){return {ok:!server.offline,status:server.offline?503:200,json:async()=>({userKey:server.user,state:server.state,revision:server.revision,updatedAt:123})};}
  const body=JSON.parse(options.body);server.puts++;
  if(server.failSave)return {ok:false,status:503,json:async()=>({error:'云端保存失败，本机记录已保留'})};
  if(body.revision!==server.revision)return {ok:false,status:409,json:async()=>({error:'另一个窗口或设备已有更新，请重新同步后再修改'})};
  server.state=body.state;server.revision++;
  return {ok:true,json:async()=>({revision:server.revision,updatedAt:456})};
 };
 vm.createContext(context);await vm.runInContext(source,context);return {context,storage,memory};
}

const server={user:'user-a',state:{value:'cloud'},revision:1,puts:0};
const first=await boot(server);assert.equal(first.context.window.campusModel.state.value,'cloud');
first.context.window.campusModel.state.value='changed';first.context.window.campusModel.persist();await first.context.window.crousCloud.retry();
assert.equal(server.state.value,'changed');assert.equal(server.revision,2);assert.equal(first.context.window.CROUS_CLOUD.dirty,false);

server.failSave=true;first.context.window.campusModel.state.value='offline change';first.context.window.campusModel.persist();await first.context.window.crousCloud.retry();
assert.equal(first.storage.getItem('crous-campus-v2:user-a:dirty'),'1');assert.equal(server.state.value,'changed');
server.failSave=false;const second=await boot(server,first.memory);assert.equal(second.context.window.campusModel.state.value,'offline change','reopening must preserve unsynced changes');await second.context.window.crousCloud.retry();assert.equal(server.state.value,'offline change');

const key='crous-campus-v2:user-a';second.memory.set(key,JSON.stringify({value:'local concurrent change'}));second.memory.set(key+':dirty','1');second.memory.set(key+':revision','2');
const conflicted=await boot(server,second.memory);assert.equal(conflicted.context.window.CROUS_CLOUD.text,'同步冲突');assert.equal(conflicted.context.window.campusModel.state.value,'local concurrent change');await conflicted.context.window.crousCloud.retry();assert.equal(server.state.value,'offline change','conflict must not replace newer cloud data');
await conflicted.context.window.crousCloud.reload();assert.equal(conflicted.context.window.campusModel.state.value,'offline change');assert.equal(conflicted.context.window.ui.refreshes,1);assert.equal(conflicted.context.window.ui.navigations,0,'reload must refresh the current role view');
conflicted.context.window.CROUS_CLOUD.saving=true;server.state={value:'do not load while saving'};await conflicted.context.window.crousCloud.reload();assert.equal(conflicted.context.window.campusModel.state.value,'offline change');conflicted.context.window.CROUS_CLOUD.saving=false;
server.state=null;server.revision=0;await conflicted.context.window.crousCloud.reload();assert.equal(conflicted.context.window.campusModel.state.value,'seed','empty cloud must replace stale local data');

const other={user:'user-b',state:{value:'other account'},revision:1,puts:0};const third=await boot(other,second.memory);assert.equal(third.context.window.CROUS_STORAGE_KEY,'crous-campus-v2:user-b');assert.equal(third.context.window.campusModel.state.value,'other account');
const local=await boot({offline:true,puts:0});assert.equal(local.context.window.CROUS_CLOUD.mode,'local');
const denied=await boot({user:'no-storage',state:{value:'cloud without storage'},revision:1,puts:0},new Map(),true);assert.equal(denied.context.window.campusModel.state.value,'cloud without storage');denied.context.window.campusModel.state.value='memory change';denied.context.window.campusModel.persist();await denied.context.window.crousCloud.retry();assert.equal(denied.context.window.CROUS_CLOUD.dirty,false);
console.log('PASS: cloud save, failed-save retention, reopening unsynced state, conflict protection, explicit cloud reload, per-account isolation, and offline fallback.');
await new Promise(r=>setTimeout(r,700));
