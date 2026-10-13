import { requireChatGPTUser } from "./chatgpt-auth";
export const dynamic="force-dynamic";
export default async function Home(){ await requireChatGPTUser("/");return <iframe title="CROUS 食物法庭" src="/app/index.html" style={{border:0,width:"100%",height:"100dvh",display:"block"}} allow="clipboard-write"/>;}
