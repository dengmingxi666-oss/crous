import fs from 'node:fs';
import path from 'node:path';
const root=process.cwd(),read=name=>fs.readFileSync(path.join(root,'public/app',name),'utf8');
const storage=`window.STATIC_DEMO=true;window.CAMPUS_STORAGE_KEY='xiaowei-standalone-v3';window.CROUS_CLOUD={mode:'local',text:'本机体验',revision:0};const backupStore=new Map();window.CAMPUS_LOCAL={getItem(k){try{return localStorage.getItem(k)||backupStore.get(k)||null}catch(e){return backupStore.get(k)||null}},setItem(k,v){backupStore.set(k,v);try{localStorage.setItem(k,v)}catch(e){}},removeItem(k){backupStore.delete(k);try{localStorage.removeItem(k)}catch(e){}}};`;
const scripts=[storage,read('core.js'),read('art.js'),read('app.js')].join('\n');
const html=`<!doctype html><html lang="zh-CN"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="theme-color" content="#18886a"><meta name="description" content="校味校园美食点评、反馈与打卡交互体验"><title>校味 · 校园美食点评推荐</title><style>${read('style.css')}</style></head><body><div id="app"></div><div id="modal-root"></div><div id="toast" role="status" aria-live="polite"></div><script>${scripts.replace(/<\/script/gi,'<\\/script')}</script></body></html>`;
fs.mkdirSync(path.join(root,'docs'),{recursive:true});fs.mkdirSync(path.join(root,'standalone'),{recursive:true});
fs.writeFileSync(path.join(root,'docs/index.html'),html);fs.writeFileSync(path.join(root,'standalone/xiaowei-demo.html'),html);
console.log('Generated docs/index.html for GitHub Pages and standalone/xiaowei-demo.html; both are self-contained local-data demos.');
