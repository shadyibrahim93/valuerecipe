module.exports=[70406,(e,t,i)=>{t.exports=e.x("next/dist/compiled/@opentelemetry/api",()=>require("next/dist/compiled/@opentelemetry/api"))},74538,e=>e.a(async(t,i)=>{try{let t=await e.y("openai");e.n(t),i()}catch(e){i(e)}},!0),42184,e=>{"use strict";e.s([])},87730,e=>e.a(async(t,i)=>{try{var n=e.i(74538);e.i(42184);var r=t([n]);[n]=r.then?(await r)():r;let s=new n.default({apiKey:process.env.OPENAI_API_KEY});async function a(e,t){if("POST"!==e.method)return t.status(405).json({error:"Method not allowed"});let{type:i,recipe:n}=e.body;if(!i||!n)return t.status(400).json({error:"Missing type or recipe data"});let r=n.ingredients?.map(e=>e.ingredient.replace(/-/g," ")).join(", "),a=n.instructions?.map(e=>`${e.step}. ${e.text}`).join("\n"),o=n.nutrition?JSON.stringify(n.nutrition):"No nutrition provided",l="";"preparation-paragraph"===i&&(l=`
      Write a detailed but non-boring preparation paragraph for a recipe page.
      Use SEO-friendly language, natural flow, and reference the recipe title,
      ingredients, and nutrition.

      Recipe Title: ${n.title}
      Ingredients: ${r}
      Nutrition: ${o}

      Keep the tone helpful, warm, clean, and professional.
      Do NOT write lists. Write one cohesive paragraph.
    `),"chef-tips"===i&&(l=`
      Generate 2–4 short, helpful chef tips for this recipe.
      Make them specific to the recipe, based on ingredients & instructions.
      No fluff. No generic tips.

      Recipe Title: ${n.title}
      Ingredients: ${r}
      Instructions: ${a}

      Output format:
      - Tip 1
      - Tip 2
      - Tip 3
    `),"total-time"===i&&(l=`
      Estimate the cooking times for this recipe based strictly on the ingredients
      and instructions.

      Output EXACTLY in this format:
      "Prep: X minutes • Cook: X minutes • Total: X minutes"

      Recipe Title: ${n.title}
      Instructions:
      ${a}
    `),"tools-needed"===i&&(l=`
      Generate a clean bullet list of ONLY the tools needed for this recipe.
      Base it on the instructions and ingredients.

      Examples of tools:
      - Large skillet
      - Knife
      - Cutting board
      - Baking sheet
      - Oven
      - Whisk
      - Mixing bowl
      - Saucepan

      Output format: one tool per line, no numbering.

      Recipe Title: ${n.title}
      Ingredients: ${r}
      Instructions:
      ${a}
    `);try{let e=(await s.chat.completions.create({model:"gpt-4.1-mini",messages:[{role:"system",content:"Your cooking assistant that generates content for RekaDish."},{role:"user",content:l}]})).choices[0].message.content;return t.status(200).json({aiContent:e})}catch(e){return console.error("AI Error:",e),t.status(500).json({error:"Failed to generate AI content"})}}e.s(["default",()=>a]),i()}catch(e){i(e)}},!1),7456,e=>e.a(async(t,i)=>{try{var n=e.i(26747),r=e.i(90406),a=e.i(44898),s=e.i(62950),o=e.i(87730),l=e.i(7031),p=e.i(81927),u=e.i(46432),d=t([o]);[o]=d.then?(await d)():d;let h=(0,s.hoist)(o,"default"),g=(0,s.hoist)(o,"config"),f=new a.PagesAPIRouteModule({definition:{kind:r.RouteKind.PAGES_API,page:"/api/ai-generate",pathname:"/api/ai-generate",bundlePath:"",filename:""},userland:o,distDir:".next",relativeProjectDir:""});async function c(e,t,i){f.isDev&&(0,u.addRequestMeta)(e,"devRequestTimingInternalsEnd",process.hrtime.bigint());let r="/api/ai-generate";r=r.replace(/\/index$/,"")||"/";let a=await f.prepare(e,t,{srcPage:r});if(!a){t.statusCode=400,t.end("Bad Request"),null==i.waitUntil||i.waitUntil.call(i,Promise.resolve());return}let{query:s,params:o,prerenderManifest:d,routerServerContext:c}=a;try{let i=e.method||"GET",n=(0,l.getTracer)(),a=n.getActiveScopeSpan(),u=f.instrumentationOnRequestError.bind(f),h=async a=>f.render(e,t,{query:{...s,...o},params:o,allowedRevalidateHeaderKeys:[],multiZoneDraftMode:!1,trustHostHeader:!1,previewProps:d.preview,propagateError:!1,dev:f.isDev,page:"/api/ai-generate",internalRevalidate:null==c?void 0:c.revalidate,onError:(...t)=>u(e,...t)}).finally(()=>{if(!a)return;a.setAttributes({"http.status_code":t.statusCode,"next.rsc":!1});let e=n.getRootSpanAttributes();if(!e)return;if(e.get("next.span_type")!==p.BaseServerSpan.handleRequest)return void console.warn(`Unexpected root span type '${e.get("next.span_type")}'. Please report this Next.js issue https://github.com/vercel/next.js`);let s=e.get("next.route");if(s){let e=`${i} ${s}`;a.setAttributes({"next.route":s,"http.route":s,"next.span_name":e}),a.updateName(e)}else a.updateName(`${i} ${r}`)});a?await h(a):await n.withPropagatedContext(e.headers,()=>n.trace(p.BaseServerSpan.handleRequest,{spanName:`${i} ${r}`,kind:l.SpanKind.SERVER,attributes:{"http.method":i,"http.target":e.url}},h))}catch(e){if(f.isDev)throw e;(0,n.sendError)(t,500,"Internal Server Error")}finally{null==i.waitUntil||i.waitUntil.call(i,Promise.resolve())}}e.s(["config",0,g,"default",0,h,"handler",()=>c]),i()}catch(e){i(e)}},!1)];

//# sourceMappingURL=%5Broot-of-the-server%5D__68daf638._.js.map