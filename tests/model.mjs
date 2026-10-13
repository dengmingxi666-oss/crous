import assert from 'node:assert/strict';
import vm from 'node:vm';
import fs from 'node:fs';
import { validateState } from '../lib/state-validation.ts';

const context={};vm.createContext(context);vm.runInContext(fs.readFileSync(new URL('../public/app/core.js',import.meta.url),'utf8'),context);
const Model=context.CampusModel,memory=new Map(),storage={getItem:k=>memory.get(k),setItem:(k,v)=>memory.set(k,v)};
const m=new Model(storage);
assert.equal(validateState(m.state),null);
m.state.prefs.budget=12;m.state.prefs.avoid=['鸡肉'];
assert(m.recommended().every(d=>d.price<=12&&!d.ingredients.includes('鸡肉')),'budget and avoided ingredients are hard filters');
m.state.prefs.budget=20;m.state.prefs.avoid=[];m.state.prefs.goal='增肌';assert.equal(m.recommended()[0].id,7);
m.shop(3).open=false;assert(!m.recommended().some(d=>d.shopId===3),'closed shops cannot be recommended');m.shop(3).open=true;
const dish=m.saveDish({shopId:1,name:'测试新菜',price:11,diet:'均衡饮食',tags:['微辣'],ingredients:['米饭'],art:'rice',isNew:false});
assert.equal(dish.isNew,false);assert(m.recommended().some(d=>d.id===dish.id));
dish.available=false;assert(!m.recommended().some(d=>d.id===dish.id));
assert.throws(()=>m.order(4,1,'送餐到寝','今日午餐','8栋302',''));
assert.throws(()=>m.order(1,1,'送餐到寝','今日午餐','',''));
assert.throws(()=>m.order(1,0,'到店自取','今日午餐','',''));
const o=m.order(1,2,'送餐到寝','明日午餐 12:15','8栋302','少辣');assert.equal(o.total,26);
assert.equal(m.advance(o.id).status,'制作中');assert.equal(m.advance(o.id).status,'配送中');assert.equal(m.advance(o.id).status,'已完成');assert.throws(()=>m.advance(o.id));
const pickup=m.order(4,1,'到店自取','明日午餐','','');m.advance(pickup.id);assert.equal(m.advance(pickup.id).status,'待取餐');
const review=m.addReview(1,4,'测试评价',['分量正义'],'');assert(m.state.reviews.includes(review));
assert.equal(validateState(m.state),null);
const restored=new Model(storage);assert.equal(restored.state.reviews[0].text,'测试评价');
const bad=JSON.parse(JSON.stringify(m.state));bad.orders[0].total=0;assert.equal(validateState(bad),'订单数据不正确');
bad.orders=m.state.orders;bad.dishes[0].color='javascript:alert(1)';assert.equal(validateState(bad),'菜品数据不正确');
assert.equal(validateState({}), '数据集合 shops 超出范围');

const nodes={},domContext={window:{localStorage:storage,scrollTo(){},location:{search:'',href:'https://example.test/app/index.html'},addEventListener(){},CROUS_CLOUD:{mode:'local',text:'本机体验',revision:0}},document:{querySelector:s=>nodes[s]||(nodes[s]={innerHTML:'',style:{},dataset:{},textContent:'',focus(){},classList:{add(){},remove(){}}}),body:{style:{}},addEventListener(){}},URLSearchParams,URL,FormData,Date,Math,console,setTimeout(){},clearTimeout(){}};
domContext.CampusModel=Model;vm.createContext(domContext);
vm.runInContext(fs.readFileSync(new URL('../public/app/app.js',import.meta.url),'utf8'),domContext);
vm.runInContext(fs.readFileSync(new URL('../public/app/theme.js',import.meta.url),'utf8'),domContext);
for(const [role,page] of [['student','discover'],['student','shops'],['student','wheel'],['student','rank'],['student','profile'],['student','orders'],['merchant','dashboard'],['merchant','manage'],['merchant','merchantOrders'],['merchant','merchantReviews'],['merchant','settings'],['merchant','structure']]){
 domContext.window.ui.route(role,page);assert(nodes['#app'].innerHTML.includes('CROUS'));assert(!nodes['#app'].innerHTML.includes('undefined'));assert(!nodes['#app'].innerHTML.includes('NaN'));
}
domContext.window.ui.detail(1);assert(nodes['#modal-root'].innerHTML.includes('美食证词'));
domContext.window.ui.reserve(1);assert(nodes['#modal-root'].innerHTML.includes('送餐到寝'));
domContext.window.ui.guide();assert(nodes['#modal-root'].innerHTML.includes('5分钟'));
console.log('PASS: 12 views, preference filters, closed/unlisted items, new-dish state, delivery and pickup transitions, review persistence, malformed server payloads, and core dialogs.');
