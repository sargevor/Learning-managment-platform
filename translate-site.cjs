const fs=require('fs'),path=require('path'),ts=require('./usaran/node_modules/typescript');
const files=[];function visit(d){for(const e of fs.readdirSync(d,{withFileTypes:true})){const p=path.join(d,e.name);if(e.isDirectory())visit(p);else if(/\.tsx?$/.test(p))files.push(p)}}visit('usaran/src');
const entries=[],seen=new Map();
function nodes(file){const src=fs.readFileSync(file,'utf8'),ast=ts.createSourceFile(file,src,99,true,file.endsWith('tsx')?4:3),list=[];function walk(n){if((ts.isStringLiteral(n)||ts.isJsxText(n)||ts.isTemplateHead(n)||ts.isTemplateMiddle(n)||ts.isTemplateTail(n)||ts.isNoSubstitutionTemplateLiteral(n))&&/[\u0531-\u0587]/.test(n.text)){list.push(n);if(!seen.has(n.text)){seen.set(n.text,entries.length);entries.push(n.text)}}ts.forEachChild(n,walk)}walk(ast);return {src,ast,list}}
for(const f of files)nodes(f);
if(process.argv[2]==='list'){const start=Number(process.argv[3]||0),end=Number(process.argv[4]||entries.length);console.log('TOTAL',entries.length);entries.slice(start,end).forEach((t,i)=>console.log((start+i)+': '+JSON.stringify(t)));}
else if(process.argv[2]==='apply'){
 const translations=JSON.parse(fs.readFileSync('english-translations.json','utf8'));
 for(const f of files){const {src,ast,list}=nodes(f);let next=src;for(const n of list.reverse()){const value=translations[seen.get(n.text)];if(value===undefined)throw Error('Missing '+seen.get(n.text));let start=n.getStart(ast),end=n.end,out;if(ts.isJsxText(n)){start=n.pos;out=value;}else if(ts.isStringLiteral(n)){out=JSON.stringify(value);}else {const raw=src.slice(start,end);const head=ts.isTemplateHead(n),middle=ts.isTemplateMiddle(n),tail=ts.isTemplateTail(n);out=(head||!middle&&!tail?'`':'}')+value.replace(/`/g,'\\`').replace(/\$\{/g,'\\${')+(head||middle?'${':'`');}next=next.slice(0,start)+out+next.slice(end);}if(next!==src)fs.writeFileSync(f,next);}
}
