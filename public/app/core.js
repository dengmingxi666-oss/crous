(function(root){
'use strict';
const KEY=root.CROUS_STORAGE_KEY||'crous-campus-v2:local';
const clone=x=>JSON.parse(JSON.stringify(x));
const shops=[
{id:1,name:'小满食堂',place:'一食堂 · 2F · 06窗口',flavor:'家常饭',queue:4,minutes:3,open:true,delivery:true,notice:'午餐鸡腿饭出炉啦，米饭可以免费加一份。',hours:'10:30–13:30 / 16:30–19:30'},
{id:2,name:'面面俱到',place:'二食堂 · 1F · 03窗口',flavor:'川味面食',queue:12,minutes:10,open:true,delivery:true,notice:'藤椒牛肉面上新，微辣也很香。',hours:'10:00–20:00'},
{id:3,name:'清爽食间',place:'一食堂 · 1F · 08窗口',flavor:'轻食沙拉',queue:2,minutes:2,open:true,delivery:true,notice:'酱汁分装，轻食也能吃得满足。',hours:'10:30–19:00'},
{id:4,name:'饺子同学',place:'三食堂 · 1F · 02窗口',flavor:'北方面食',queue:6,minutes:5,open:true,delivery:false,notice:'水饺现包现煮，建议提前预约自取。',hours:'10:00–19:30'},
{id:5,name:'鱼你一起',place:'二食堂 · 2F · 11窗口',flavor:'酸菜米线',queue:5,minutes:4,open:true,delivery:true,notice:'酸菜鱼米线可选不辣，汤底每日现熬。',hours:'10:30–19:30'},
{id:6,name:'香锅研究所',place:'三食堂 · 2F · 09窗口',flavor:'麻辣香锅',queue:16,minutes:14,open:true,delivery:true,notice:'晚餐新增双人套餐，欢迎同学来试。',hours:'11:00–20:30'}
];
const dishes=[
{id:1,shopId:1,name:'照烧鸡腿饭',price:12,rating:4.8,count:126,art:'rice',color:'#f4e7d3',tags:['家常','微辣','分量足'],ingredients:['鸡肉','米饭'],diet:'均衡饮食',isNew:false,available:true,quote:'鸡腿超入味，十二块就能吃饱！',description:'一整块照烧鸡腿，搭配时蔬和软糯米饭。酱汁香甜，适合日常午餐。'},
{id:2,shopId:2,name:'藤椒牛肉面',price:15,rating:4.7,count:89,art:'noodle',color:'#e6ecd9',tags:['川味','中辣','新品'],ingredients:['牛肉','面条','香菜'],diet:'均衡饮食',isNew:true,available:true,quote:'藤椒香气很足，怕辣记得选微辣。',description:'鲜香藤椒汤底与牛肉片搭配，面条筋道；香菜可备注不加。'},
{id:3,shopId:3,name:'鸡胸蔬菜能量碗',price:16,rating:4.9,count:64,art:'salad',color:'#deebdf',tags:['清淡','不辣','高蛋白'],ingredients:['鸡肉','生菜','玉米'],diet:'减脂',isNew:true,available:true,quote:'蔬菜新鲜，酱汁分装很贴心。',description:'鸡胸肉、时令蔬菜和粗粮搭配，酱汁分装。饮食标签来自商家填写。'},
{id:4,shopId:4,name:'虾仁鲜肉水饺',price:14,rating:4.6,count:108,art:'dumpling',color:'#f1e5e5',tags:['鲜香','不辣','现包'],ingredients:['海鲜','猪肉','面粉'],diet:'均衡饮食',isNew:false,available:true,quote:'能吃到整颗虾，皮薄馅足。',description:'鲜虾与猪肉馅手工水饺，现煮出餐，醋和辣椒单独提供。'},
{id:5,shopId:5,name:'酸菜鱼米线',price:13,rating:4.5,count:97,art:'noodle',color:'#f0e9d5',tags:['酸爽','微辣','汤面'],ingredients:['海鲜','米线'],diet:'均衡饮食',isNew:false,available:true,quote:'酸酸辣辣很开胃，鱼片也不少。',description:'酸菜汤底搭配鱼片和米线，口味可选，适合喜欢酸爽口味的同学。'},
{id:6,shopId:6,name:'招牌麻辣香锅',price:18,rating:4.4,count:152,art:'rice',color:'#f0ded4',tags:['川味','中辣','锅气'],ingredients:['牛肉','蔬菜'],diet:'均衡饮食',isNew:false,available:true,quote:'味道够香，高峰时要多等一会儿。',description:'荤素搭配的一人份香锅，饭点排队较多，可以先预约。'},
{id:7,shopId:3,name:'双倍鸡胸杂粮饭',price:19,rating:4.7,count:38,art:'salad',color:'#e7eddc',tags:['清淡','不辣','高蛋白'],ingredients:['鸡肉','杂粮'],diet:'增肌',isNew:true,available:true,quote:'肉量很实在，训练完吃刚刚好。',description:'双份鸡胸肉搭配杂粮饭和蔬菜，欢迎备注酱汁分装。'},
{id:8,shopId:1,name:'番茄鸡蛋盖饭',price:9,rating:4.6,count:73,art:'rice',color:'#f5e6d2',tags:['家常','不辣','性价比'],ingredients:['鸡蛋','米饭'],diet:'均衡饮食',isNew:false,available:true,quote:'简单但好吃，月底省钱首选。',description:'新鲜番茄与鸡蛋炒制，酸甜可口，米饭免费续加。'},
{id:9,shopId:4,name:'香菇青菜蒸饺',price:10,rating:4.5,count:41,art:'dumpling',color:'#e6eadc',tags:['清淡','不辣','素食'],ingredients:['香菇','青菜','面粉'],diet:'减脂',isNew:false,available:true,quote:'喜欢清淡口的可以试试。',description:'香菇青菜馅蒸饺，口味清淡，一份十只。'}
];
function seed(){return {shops:clone(shops),dishes:clone(dishes),prefs:{goal:'均衡饮食',tastes:['家常','微辣'],avoid:[],budget:20},favorites:[3],reviews:[{id:1,dishId:1,name:'小周同学',score:5,tags:['分量足','性价比高'],text:'鸡腿超入味，十二块就能吃饱！米饭还能免费加。',date:'今天 11:40',reply:'谢谢同学，下次来还可以试试番茄鸡蛋饭～'},{id:2,dishId:3,name:'夏日小鱼',score:5,tags:['口味好','食材新鲜'],text:'蔬菜新鲜，酱汁分装很贴心，午饭想清爽一点就选它。',date:'昨天 12:05',reply:''},{id:3,dishId:6,name:'一口一口',score:3,tags:['等得有点久','偏咸'],text:'味道很香，但是中午等得有点久，口味对我来说偏咸。',date:'昨天 12:30',reply:''}],orders:[],wishes:[{id:1,name:'想吃糖醋里脊',votes:42,voted:false,response:'小满食堂：已安排试做，敬请期待！'},{id:2,name:'多一点素食选择',votes:28,voted:false,response:'清爽食间：本周已上新香菇青菜搭配。'}]};}
class Model{
 constructor(storage){this.storage=storage;try{this.state=JSON.parse(storage&&storage.getItem(KEY))||seed();}catch(e){this.state=seed();}this.persist();}
 uid(){return Math.max(Date.now(),...this.state.dishes.map(x=>x.id),...this.state.orders.map(x=>x.id),...this.state.reviews.map(x=>x.id),...this.state.wishes.map(x=>x.id))+1;}
 persist(){try{this.storage&&this.storage.setItem(KEY,JSON.stringify(this.state));}catch(e){}return this.state;}
 shop(id){return this.state.shops.find(x=>x.id===Number(id));}
 dish(id){return this.state.dishes.find(x=>x.id===Number(id));}
 eligible(d){const p=this.state.prefs;return d.available&&this.shop(d.shopId).open&&d.price<=p.budget&&!p.avoid.some(x=>d.ingredients.includes(x));}
 score(d){const p=this.state.prefs;return d.rating*10+(d.diet===p.goal?18:0)+d.tags.filter(t=>p.tastes.includes(t)).length*6-Math.min(this.shop(d.shopId).minutes,20)*.4;}
 recommended(){return this.state.dishes.filter(d=>this.eligible(d)).sort((a,b)=>this.score(b)-this.score(a));}
 reasons(d){const p=this.state.prefs;return [d.diet===p.goal?p.goal+'偏好':null,...d.tags.filter(t=>p.tastes.includes(t)),this.shop(d.shopId).minutes<=5?'排队较短':null,'预算内'].filter(Boolean).slice(0,3);}
 favorite(id){id=Number(id);const f=this.state.favorites;this.state.favorites=f.includes(id)?f.filter(x=>x!==id):[...f,id];this.persist();}
 addReview(id,score,text,tags,photo){if(!this.dish(id)||!text.trim()||score<1||score>5)throw Error('请填写有效评价');const d=this.dish(id);d.rating=Number(((d.rating*d.count+Number(score))/(d.count+1)).toFixed(1));d.count++;const r={id:this.uid(),dishId:Number(id),name:'我',score:Number(score),text:text.trim(),tags,date:new Date().toLocaleDateString('zh-CN'),reply:'',photo:photo||''};this.state.reviews.unshift(r);this.persist();return r;}
 order(dishId,quantity,type,time,address,note){const d=this.dish(dishId);if(!d||!d.available||!this.shop(d.shopId).open)throw Error('这道菜暂时无法预约');if(type==='送餐到寝'&&!this.shop(d.shopId).delivery)throw Error('该窗口仅支持自取');if(type==='送餐到寝'&&!address.trim())throw Error('请填写寝室楼栋和房间');if(!Number.isInteger(quantity)||quantity<1||quantity>10)throw Error('请选择1–10份');const o={id:this.uid(),dishId:d.id,shopId:d.shopId,name:d.name,price:d.price,quantity,type,time,address:address.trim(),note:note.trim(),total:d.price*quantity+(type==='送餐到寝'?2:0),status:'待接单',created:new Date().toLocaleString('zh-CN')};this.state.orders.unshift(o);this.persist();return o;}
 advance(id){const o=this.state.orders.find(x=>x.id===Number(id));if(!o)return;const steps=['待接单','制作中',o.type==='送餐到寝'?'配送中':'待取餐','已完成'];const idx=steps.indexOf(o.status);if(idx<0||idx>=steps.length-1)throw Error('订单状态不能继续推进');o.status=steps[idx+1];this.persist();return o;}
 saveDish(form){const shop=this.shop(form.shopId);if(!shop||!form.name.trim()||!Number.isFinite(form.price)||form.price<=0)throw Error('请填写菜名和有效价格');if(form.id){Object.assign(this.dish(form.id),form);}else{form={...form,id:this.uid(),rating:0,count:0,available:true,isNew:form.isNew??true,quote:'新菜上架，等你来尝鲜',description:form.description||'商家新上架菜品',color:'#e8ecdf'};this.state.dishes.unshift(form);}this.persist();return form;}
 reset(){this.state=seed();this.persist();}
}
root.CampusModel=Model;if(typeof module!=='undefined')module.exports={Model,seed};
})(typeof window!=='undefined'?window:globalThis);
