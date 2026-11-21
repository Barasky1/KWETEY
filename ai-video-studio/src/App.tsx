import { useState } from 'react';
import { Clapperboard, Film, ImagePlus, WandSparkles, Youtube, Facebook, Music2, Sparkles, Plus, Clock3, Copy, Check, LoaderCircle } from 'lucide-react';

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
 {script&&<section className="script-result"><div className="result-head"><div><div className="eyebrow">YOUR STORYBOARD</div><h2>{script.title}</h2><p>{script.hook}</p></div><button className="copy-btn" onClick={copyScript}>{copied?<Check size={15}/>:<Copy size={15}/>} {copied?'Copied':'Copy script'}</button></div><div className="script-meta"><span><Clock3 size={13}/>{duration} seconds</span><span>{format} format</span><span>Draft source: {script.generatedBy}</span></div><div className="scene-grid">{script.scenes.map((scene,i)=><article className="scene-card" key={i}><div className="scene-top"><span>SCENE {String(i+1).padStart(2,'0')}</span><small>{scene.seconds}s</small></div><h3>{scene.label}</h3><label>VISUAL DIRECTION</label><p>{scene.visual}</p><label>VOICEOVER</label><p>{scene.voiceover}</p><div className="overlay-text">“{scene.on_screen_text}”</div></article>)}</div><div className="narration"><label>FULL NARRATION</label><p>{script.narration}</p></div>{script.notice&&<p className="notice">{script.notice}</p>}</section>}
 <footer>AI VIDEO STUDIO · Built for ideas that travel.</footer></main></div>;
}
