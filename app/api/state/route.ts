import { eq, and } from "drizzle-orm";
import { getChatGPTUser } from "../../chatgpt-auth";
import { getDb } from "../../../db";
import { userStates } from "../../../db/schema";
import { validateState } from "../../../lib/state-validation";
export const dynamic = "force-dynamic";
const reply = (data: unknown,status=200) => Response.json(data,{status,headers:{"Cache-Control":"no-store"}});
export async function GET() {
  const user = await getChatGPTUser();
  if (!user) return reply({error:"请先登录后使用云端保存"},401);
  try {
    const rows = await getDb().select().from(userStates).where(eq(userStates.userId,user.userId)).limit(1);
    const row = rows[0];
    return reply({userKey:user.userId,state:row?JSON.parse(row.state):null,revision:row?.revision??0,updatedAt:row?.updatedAt??null});
  } catch { return reply({error:"云端暂时不可用，你仍可使用本机体验"},503); }
}
export async function PUT(request: Request) {
  const user = await getChatGPTUser();
  if (!user) return reply({error:"请先登录"},401);
  const origin=request.headers.get("origin");
  if (origin && origin!==new URL(request.url).origin) return reply({error:"请求来源不正确"},403);
  if (!request.headers.get("content-type")?.includes("application/json")) return reply({error:"请发送JSON数据"},415);
  if (Number(request.headers.get("content-length")||0)>900_000) return reply({error:"提交的数据过大"},413);
  let body:any;
  try { const raw=await request.text();if(new TextEncoder().encode(raw).length>900_000)return reply({error:"提交的数据过大"},413);body=JSON.parse(raw); }
  catch {return reply({error:"数据格式不正确"},400);}
  if (!Number.isInteger(body.revision)||body.revision<0) return reply({error:"版本号不正确"},400);
  const error=validateState(body.state);if(error)return reply({error},400);
  const now=Date.now(),next=body.revision+1,data=JSON.stringify(body.state);
  try {
    const db=getDb();let saved;
    if(body.revision===0){saved=await db.insert(userStates).values({userId:user.userId,state:data,revision:next,updatedAt:now}).onConflictDoNothing().returning({revision:userStates.revision});}
    else {saved=await db.update(userStates).set({state:data,revision:next,updatedAt:now}).where(and(eq(userStates.userId,user.userId),eq(userStates.revision,body.revision))).returning({revision:userStates.revision});}
    if(!saved.length)return reply({error:"另一个窗口或设备已有更新，请重新同步后再修改",conflict:true},409);
    return reply({revision:next,updatedAt:now});
  } catch {return reply({error:"云端保存失败，本机记录已保留"},503);}
}
