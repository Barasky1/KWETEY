import { useState, useRef } from 'react';
import { Clapperboard, Film, ImagePlus, WandSparkles, Youtube, Facebook, Music2, Sparkles, Plus, Clock3, Copy, Check, LoaderCircle, Volume2, Download, Video } from 'lucide-react';

type Scene = { seconds:number; label:string; visual:string; voiceover:string; on_screen_text:string };
type Script = { title:string; hook:string; narration:string; scenes:Scene[]; generatedBy:string; notice?:string; };
export default function App() {
 const [topic,setTopic]=useState('');
 const [duration,setDuration]=useState('30');
 const [format,setFormat]=useState('9:16');
 const [tone,setTone]=useState('engaging');
 const [status,setStatus]=useState('Enter a topic to build your first video script.');
 const [loading,setLoading]=useState(false);
 const [script,setScript]=useState<Script|null>(null);
 const [copied,setCopied]=useState(false);
 const [images,setImages]=useState<Record<number,string>>({});
 const [imageLoading,setImageLoading]=useState(false);
 const [imageStatus,setImageStatus]=useState('');
 const [rendering,setRendering]=useState(false);
 const [renderStatus,setRenderStatus]=useState('');
 const [videoUrl,setVideoUrl]=useState('');
 const [speaking,setSpeaking]=useState(false);
 const canvasRef=useRef<HTMLCanvasElement|null>(null);
 async function buildScript(){
  if(topic.trim().length<4){setStatus('Please enter a topic with at least 4 characters.');return;}
  setLoading(true);setStatus('Building your video script…');setScript(null);
  try{
   const response=await fetch('/api/generate-script',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({topic,duration:Number(duration),format,tone})});
   const data=await response.json();
   if(!response.ok)throw new Error(data.error||'Could not build script.');
   setScript(data);setStatus('Your script is ready. Review the scenes below.');
  }catch(error){setStatus(error instanceof Error?error.message:'Something went wrong.');}
  finally{setLoading(false);}
 }
 async function generateImages(){
  if(!script)return;setImageLoading(true);setImageStatus('Generating scene images…');
  try{
   for(let i=0;i<script.scenes.length;i++){
    const scene=script.scenes[i];
    const response=await fetch('/api/generate-image',{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({prompt:scene.visual+'; cinematic, high detail, professional short-form video still, no text, no watermark. Aspect ratio '+format})});
    if(!response.ok){const err=await response.json().catch(()=>({}));throw new Error(err.error||'Image generation failed.');}
    const url=URL.createObjectURL(await response.blob());setImages(prev=>({...prev,[i]:url}));setImageStatus('Generated '+(i+1)+' of '+script.scenes.length+' scene images.');
   }
   setImageStatus('All scene images generated.');
  }catch(error){setImageStatus(error instanceof Error?error.message:'Image generation failed.');}
  finally{setImageLoading(false);}
 }

 function toggleNarration(){
  if(!script||!('speechSynthesis' in window))return;
  if(speaking){window.speechSynthesis.cancel();setSpeaking(false);return;}
  const utterance=new SpeechSynthesisUtterance(script.narration);
  utterance.rate=1;utterance.pitch=1;utterance.onend=()=>setSpeaking(false);utterance.onerror=()=>setSpeaking(false);
  window.speechSynthesis.cancel();window.speechSynthesis.speak(utterance);setSpeaking(true);
 }
 async function renderVideo(){
  if(!script)return;
  const missing=script.scenes.findIndex((_,i)=>!images[i]);
  if(missing!==-1){setRenderStatus('Generate all scene images before rendering. Missing scene '+(missing+1)+'.');return;}
  setRendering(true);setRenderStatus('Preparing video…');
  try{
   const canvas=canvasRef.current;if(!canvas)throw new Error('Video canvas is unavailable.');
   const dims=format==='9:16'?[720,1280]:format==='16:9'?[1280,720]:[1080,1080];
   canvas.width=dims[0];canvas.height=dims[1];
   const ctx=canvas.getContext('2d');if(!ctx)throw new Error('Canvas rendering is not supported.');
   const loaded=await Promise.all(script.scenes.map((_,i)=>new Promise<HTMLImageElement>((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('Could not load scene image '+(i+1)));img.src=images[i];})));
   const stream=canvas.captureStream(30);
   const mime=['video/webm;codecs=vp9','video/webm;codecs=vp8','video/webm'].find(t=>MediaRecorder.isTypeSupported(t));
   if(!mime)throw new Error('This browser does not support WebM video export. Try Chrome.');
   const recorder=new MediaRecorder(stream,{mimeType:mime,videoBitsPerSecond:6500000});
   const chunks:BlobPart[]=[];recorder.ondataavailable=e=>{if(e.data.size)chunks.push(e.data);};
   const stopped=new Promise<void>((resolve,reject)=>{recorder.onstop=()=>resolve();recorder.onerror=()=>reject(new Error('Video recording failed.'));});
   recorder.start(250);
   const total=script.scenes.reduce((n,scene)=>n+scene.seconds,0);let elapsed=0;
   for(let i=0;i<loaded.length;i++){
    const img=loaded[i],scene=script.scenes[i],duration=Math.max(1,scene.seconds)*1000,start=performance.now();
    while(performance.now()-start<duration){
     const progress=Math.min(1,(performance.now()-start)/duration);
     const scale=1.04+progress*.10,iw=canvas.width,ih=canvas.height;
     const imageRatio=img.width/img.height,canvasRatio=iw/ih;
     let baseW,baseH;if(imageRatio>canvasRatio){baseH=ih;baseW=ih*imageRatio;}else{baseW=iw;baseH=iw/imageRatio;}
     const dw=baseW*scale,dh=baseH*scale;
     const driftX=(dw-iw)*(.45+progress*.1),driftY=(dh-ih)*(.45-progress*.1);
     ctx.fillStyle='#080811';ctx.fillRect(0,0,iw,ih);ctx.save();ctx.beginPath();ctx.rect(0,0,iw,ih);ctx.clip();ctx.drawImage(img,(iw-dw)/2-driftX,(ih-dh)/2-driftY,dw,dh);ctx.restore();
     const gradient=ctx.createLinearGradient(0,ih*.55,0,ih);gradient.addColorStop(0,'rgba(0,0,0,0)');gradient.addColorStop(1,'rgba(0,0,0,.78)');ctx.fillStyle=gradient;ctx.fillRect(0,0,iw,ih);
     const fontSize=Math.round(iw*.055);ctx.font='700 '+fontSize+'px Arial';ctx.textAlign='center';ctx.fillStyle='#ffffff';ctx.shadowColor='#000000';ctx.shadowBlur=12;
     const words=scene.on_screen_text||scene.label;const maxWidth=iw*.82;const parts=words.split(' ');let lines:string[]=[],line='';
     for(const word of parts){const test=line?line+' '+word:word;if(ctx.measureText(test).width>maxWidth&&line){lines.push(line);line=word;}else line=test;}if(line)lines.push(line);
     const lineHeight=fontSize*1.2;lines.forEach((text,j)=>ctx.fillText(text,iw/2,ih*.82+(j-(lines.length-1)/2)*lineHeight));
     ctx.shadowBlur=0;ctx.fillStyle='rgba(255,255,255,.8)';ctx.font='500 '+Math.round(iw*.018)+'px Arial';ctx.textAlign='left';ctx.fillText('AI VIDEO STUDIO',iw*.055,ih*.06);
     await new Promise(requestAnimationFrame);
    }
    elapsed+=scene.seconds;setRenderStatus('Rendering scene '+(i+1)+' of '+loaded.length+' · '+Math.round(elapsed/total*100)+'%');
   }
   recorder.stop();await stopped;stream.getTracks().forEach(track=>track.stop());
   const blob=new Blob(chunks,{type:'video/webm'});const url=URL.createObjectURL(blob);setVideoUrl(url);setRenderStatus('Video ready. Download the WebM file below.');
  }catch(error){setRenderStatus(error instanceof Error?error.message:'Video rendering failed.');}
  finally{setRendering(false);}
 }

 async function copyScript(){
  if(!script)return;
  const textOut=[script.title,'HOOK: '+script.hook,'',...script.scenes.flatMap((s,i)=>[`SCENE ${i+1} · ${s.seconds}s · ${s.label}`,'VISUAL: '+s.visual,'VOICEOVER: '+s.voiceover,'ON SCREEN: '+s.on_screen_text,''])].join('\n');
  await navigator.clipboard.writeText(textOut);setCopied(true);setTimeout(()=>setCopied(false),1800);
 }
 return <div className="shell"><aside><div className="brand"><WandSparkles/> <span>AI VIDEO STUDIO<small>CREATIVE WORKSPACE</small></span></div><div className="workspace">● Personal workspace</div><p className="navtitle">WORKSPACE</p><a className="active"><Clapperboard/> Overview</a><a><Film/> My videos</a><a><ImagePlus/> Media library</a><p className="navtitle">PUBLISHING CHANNELS</p><a><Youtube/> YouTube <small>Not connected</small></a><a><Music2/> TikTok <small>Not connected</small></a><a><Facebook/> Facebook <small>Not connected</small></a><div className="sidebottom">BARASKY STUDIO<br/><small>Personal workspace</small></div></aside>
 <main><header><span>Workspace / <b>Overview</b></span><button>Help centre ↗</button></header>
 <section className="intro"><div className="eyebrow"><Sparkles size={14}/> YOUR AI-POWERED CREATIVE WORKSPACE</div><h1>Turn ideas into <em>videos.</em></h1><p>Create, schedule and publish short-form videos from one studio.</p></section>
 <section className="hero"><div><label>CREATE SOMETHING THAT MOVES</label><h2>Your next video<br/>starts with an idea.</h2><p>Start with a topic. Build a script, AI-generated scenes, narration and a ready-to-publish video.</p><button className="primary" onClick={()=>document.getElementById('topic')?.focus()}><Plus size={16}/> Create a video</button></div><div className="art"><div className="mockvideo"><div className="sun"/><div className="hills"/><div className="play">▶</div><small>AI VIDEO PREVIEW · 00:30</small></div><span className="tag">✦ AI visuals</span></div></section>
 <section className="stats"><article><small>VIDEOS CREATED</small><strong>{script?1:0}</strong><p>{script?'One script in this session':'Your library starts here'}</p></article><article><small>READY TO PUBLISH</small><strong>0</strong><p>No rendered videos yet</p></article><article><small>CHANNELS CONNECTED</small><strong>0 <i>/ 3</i></strong><p>Connect your social accounts</p></article></section>
 <section className="bottom"><article className="panel"><h3>Quick video brief</h3><p>Tell the studio what your next video should be about.</p><label htmlFor="topic">VIDEO TOPIC</label><input id="topic" value={topic} onChange={e=>setTopic(e.target.value)} placeholder="e.g. 5 amazing facts about the ocean"/><div className="options"><label>DURATION<select value={duration} onChange={e=>setDuration(e.target.value)}><option value="30">30 seconds</option><option value="45">45 seconds</option><option value="60">60 seconds</option><option value="90">90 seconds</option></select></label><label>FORMAT<select value={format} onChange={e=>setFormat(e.target.value)}><option value="9:16">9:16 Vertical</option><option value="16:9">16:9 Landscape</option><option value="1:1">1:1 Square</option></select></label></div><label htmlFor="tone">VIDEO STYLE</label><select id="tone" className="tone-select" value={tone} onChange={e=>setTone(e.target.value)}><option value="engaging">Engaging and energetic</option><option value="educational">Educational</option><option value="documentary">Documentary</option><option value="inspirational">Inspirational</option><option value="funny">Funny and playful</option></select><button className="primary wide" onClick={buildScript} disabled={loading}>{loading?<LoaderCircle className="spin" size={16}/>:<WandSparkles size={16}/>} {loading?'Building script…':'Generate video script'}</button><p className="status">{status}</p></article>
 <article className="panel recent"><h3>Creation pipeline</h3><p>Your video moves through these stages.</p><div className="pipeline"><div className="pipe-step active"><span>1</span><div><b>Script and storyboard</b><small>Now available · topic to scenes</small></div><Check size={15}/></div><div className="pipe-step"><span>2</span><div><b>AI scene images</b><small>Image generation integration next</small></div><Clock3 size={15}/></div><div className="pipe-step"><span>3</span><div><b>Voice and video rendering</b><small>Coming after scene generation</small></div><Clock3 size={15}/></div><div className="pipe-step"><span>4</span><div><b>Social publishing</b><small>Connect YouTube, TikTok and Facebook</small></div><Clock3 size={15}/></div></div></article></section>
 {script&&<section className="script-result"><div className="result-head"><div><div className="eyebrow">YOUR STORYBOARD</div><h2>{script.title}</h2><p>{script.hook}</p></div><div className="result-actions"><button className="copy-btn" onClick={generateImages} disabled={imageLoading}><ImagePlus size={15}/>{imageLoading?'Generating…':'Generate scene images'}</button><button className="copy-btn" onClick={copyScript}>{copied?<Check size={15}/>:<Copy size={15}/>} {copied?'Copied':'Copy script'}</button></div></div><div className="script-meta"><span><Clock3 size={13}/>{duration} seconds</span><span>{format} format</span><span>Draft source: {script.generatedBy}</span></div><div className="scene-grid">{script.scenes.map((scene,i)=><article className="scene-card" key={i}>{images[i]&&<img className="scene-image" src={images[i]} alt={scene.label}/>}<div className="scene-top"><span>SCENE {String(i+1).padStart(2,'0')}</span><small>{scene.seconds}s</small></div><h3>{scene.label}</h3><label>VISUAL DIRECTION</label><p>{scene.visual}</p><label>VOICEOVER</label><p>{scene.voiceover}</p><div className="overlay-text">“{scene.on_screen_text}”</div></article>)}</div>{imageStatus&&<p className="image-status">{imageStatus}</p>}<div className="render-tools"><button className="copy-btn" onClick={toggleNarration}><Volume2 size={15}/>{speaking?'Stop narration':'Listen to narration'}</button><button className="copy-btn" onClick={renderVideo} disabled={rendering}><Video size={15}/>{rendering?'Rendering video…':'Render video'}</button></div>{renderStatus&&<p className="image-status">{renderStatus}</p>}{videoUrl&&<div className="video-output"><video controls src={videoUrl}/><a className="copy-btn" href={videoUrl} download={'ai-video-'+Date.now()+'.webm'}><Download size={15}/> Download video</a><p>Exported as WebM. Narration is previewed separately and is not embedded in this video.</p></div>}<canvas ref={canvasRef} className="render-canvas"/><div className="narration"><label>FULL NARRATION</label><p>{script.narration}</p></div>{script.notice&&<p className="notice">{script.notice}</p>}</section>}
 <footer>AI VIDEO STUDIO · Built for ideas that travel.</footer></main></div>;
}
