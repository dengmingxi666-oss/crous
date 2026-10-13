const MAX_STATE_BYTES = 800_000;
const statuses = new Set(["待接单","制作中","待取餐","配送中","已完成","已取消"]);
export function validateState(value: unknown): string | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return "数据格式不正确";
  const s = value as Record<string, any>;
  for (const [key,max] of [["shops",50],["dishes",500],["reviews",1500],["orders",1500],["wishes",300]] as const) {
    if (!Array.isArray(s[key]) || s[key].length > max) return `数据集合 ${key} 超出范围`;
  }
  const finite = (n:any) => typeof n === "number" && Number.isFinite(n);
  const text = (v:any,max:number) => typeof v === "string" && v.length <= max;
  const shopIds = new Set<number>();
  for (const shop of s.shops) {
    if (!shop || !Number.isSafeInteger(shop.id) || shopIds.has(shop.id) || !text(shop.name,50) || !shop.name.trim() || !text(shop.place,100) || !text(shop.notice,300) || !text(shop.hours,100) || !text(shop.flavor,100) || !Number.isInteger(shop.queue) || shop.queue<0 || shop.queue>100 || !Number.isInteger(shop.minutes) || shop.minutes<0 || shop.minutes>120 || typeof shop.open!=="boolean" || typeof shop.delivery!=="boolean") return "窗口数据不正确";
    shopIds.add(shop.id);
    if(![1,2,4,5].includes(shop.venueId)||!Number.isInteger(shop.floor)||shop.floor<1||shop.floor>3||typeof shop.stall!=="string"||!/^\d{2}$/.test(shop.stall))return "档口位置数据不正确";
  }
  const dishIds = new Set<number>();
  for (const d of s.dishes) {
    if (!d || !Number.isSafeInteger(d.id) || dishIds.has(d.id) || !shopIds.has(d.shopId) || !text(d.name,60) || !d.name.trim() || !finite(d.price) || d.price<=0 || d.price>100 || !finite(d.rating) || d.rating<0 || d.rating>5 || !Number.isInteger(d.count) || d.count<0 || !Array.isArray(d.tags) || d.tags.length>15 || d.tags.some((x:any)=>!text(x,30)) || !Array.isArray(d.ingredients) || d.ingredients.length>30 || d.ingredients.some((x:any)=>!text(x,50)) || !text(d.description,500) || !text(d.quote,500) || !["rice","salad","noodle","dumpling","coffee","drink","bread"].includes(d.art) || !/^#[a-fA-F0-9]{6}$/.test(d.color) || typeof d.available!=="boolean" || typeof d.isNew!=="boolean" || !["均衡饮食","减脂","增肌"].includes(d.diet)) return "菜品数据不正确";
    dishIds.add(d.id);
    if(!["食堂美食","面食粉面","轻食","咖啡","奶茶饮品","早餐","甜品小吃","超市"].includes(d.category))return "菜品分类不正确";
  }
  if (!s.prefs || !["均衡饮食","减脂","增肌"].includes(s.prefs.goal) || !finite(s.prefs.budget) || s.prefs.budget<8 || s.prefs.budget>30 || !Array.isArray(s.prefs.tastes) || s.prefs.tastes.length>15 || !Array.isArray(s.prefs.avoid) || s.prefs.avoid.length>15 || [...s.prefs.tastes,...s.prefs.avoid].some((x:any)=>!text(x,30))) return "口味设置不正确";
  if (!Array.isArray(s.favorites) || s.favorites.some((x:any)=>!dishIds.has(x))) return "收藏数据不正确";
  for (const r of s.reviews) {
    if (!r || !Number.isSafeInteger(r.id) || !dishIds.has(r.dishId) || !text(r.name,100) || !Number.isInteger(r.score) || r.score<1 || r.score>5 || !text(r.text,500) || !text(r.date,100) || !text(r.reply,500) || !Array.isArray(r.tags) || r.tags.length>15 || r.tags.some((t:any)=>!text(t,30))) return "点评数据不正确";
    if (r.photo && (!text(r.photo,100_000) || !/^data:image\/(jpeg|png|webp);base64,[a-zA-Z0-9+/=]+$/.test(r.photo))) return "点评图片格式不正确";
  }
  for (const o of s.orders) {
    const dish = s.dishes.find((d:any)=>d.id===o?.dishId);
    if (!o || !Number.isSafeInteger(o.id) || !dish || dish.shopId!==o.shopId || !text(o.name,60) || !Number.isInteger(o.quantity) || o.quantity<1 || o.quantity>10 || !finite(o.price) || o.price<=0 || o.price>100 || !["送餐到寝","到店自取"].includes(o.type) || !text(o.time,100) || !text(o.address,200) || !text(o.note,300) || !text(o.created,100) || !statuses.has(o.status) || !finite(o.total) || Math.abs(o.total-(o.price*o.quantity+(o.type==="送餐到寝"?2:0)))>.001) return "订单数据不正确";
  }
  for (const w of s.wishes) if (!w || !Number.isSafeInteger(w.id) || !text(w.name,100) || !Number.isInteger(w.votes) || w.votes<0 || typeof w.voted!=="boolean" || !text(w.response,500)) return "想吃建议格式不正确";
  if (!Array.isArray(s.checkins)||s.checkins.length>500||!Array.isArray(s.feedback)||s.feedback.length>300) return "打卡或留言数据不正确";
  if(!s.profile||!text(s.profile.nickname,30)||!text(s.profile.recentHabit,60)||!text(s.profile.recentNote,200))return "个人资料不正确";
  for(const c of s.checkins){if(!c||!Number.isSafeInteger(c.id)||!dishIds.has(c.dishId)||!text(c.name,30)||!text(c.text,500)||!text(c.date,100))return "打卡数据不正确";if(c.photo&&(!text(c.photo,100_000)||!/^data:image\/(jpeg|png|webp);base64,[a-zA-Z0-9+/=]+$/.test(c.photo)))return "打卡图片格式不正确";}
  for(const f of s.feedback)if(!f||!Number.isSafeInteger(f.id)||![1,2,4,5].includes(f.venueId)||!text(f.type,30)||!text(f.text,500)||!text(f.date,100)||!text(f.reply,500))return "留言数据不正确";
  if (new TextEncoder().encode(JSON.stringify(s)).length > MAX_STATE_BYTES) return "记录过多，请导出备份或减少上传图片后重试";
  return null;
}
