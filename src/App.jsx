import { useState, useEffect } from "react";

const TODAY_GAMES = [
  { id:"1", away:"DAL", awayFull:"Dallas Mavericks", home:"BOS", homeFull:"Boston Celtics", time:"19:00 ET", awayLogo:"🤠", homeLogo:"🍀", total:225.5 },
  { id:"2", away:"MIA", awayFull:"Miami Heat", home:"CHA", homeFull:"Charlotte Hornets", time:"19:00 ET", awayLogo:"🔥", homeLogo:"🐝", total:218.0 },
  { id:"3", away:"POR", awayFull:"Portland Trail Blazers", home:"HOU", homeFull:"Houston Rockets", time:"20:00 ET", awayLogo:"🌹", homeLogo:"🚀", total:224.0 },
  { id:"4", away:"NYK", awayFull:"New York Knicks", home:"DEN", homeFull:"Denver Nuggets", time:"21:00 ET", awayLogo:"🗽", homeLogo:"⛰️", total:222.5 },
  { id:"5", away:"NO", awayFull:"New Orleans Pelicans", home:"PHX", homeFull:"Phoenix Suns", time:"21:00 ET", awayLogo:"🦅", homeLogo:"🌞", total:226.0 },
  { id:"6", away:"LAC", awayFull:"LA Clippers", home:"SA", homeFull:"San Antonio Spurs", time:"21:30 ET", awayLogo:"⛵", homeLogo:"🌮", total:221.0 },
  { id:"7", away:"IND", awayFull:"Indiana Pacers", home:"LAL", homeFull:"Los Angeles Lakers", time:"22:30 ET", awayLogo:"🏎️", homeLogo:"💜", total:230.0 },
];

const Q=12, TOTAL_MIN=48;
function pt(t){if(!t||t==="0:00")return 0;const[m,s]=String(t).split(":").map(Number);return(m||0)+(s||0)/60;}
function played(q,tl){return(q-1)*Q+(Q-pt(tl));}
function remaining(q,tl){return Math.max(0,TOTAL_MIN-played(q,tl));}
function qMult(q,tl){const r=pt(tl);if(q===4&&r<2)return 0.65;if(q===4&&r<4)return 0.78;if(q===4)return 0.90;return 1.0;}

function getSignal(game){
  if(!game.isLive||!game.total||(!game.homeScore&&!game.awayScore)){
    return{type:"SCHEDULED",label:"🕐 À VENIR",edge:0,confidence:0,projection:0,ourProb:50,edgePct:0};
  }
  const scored=game.homeScore+game.awayScore;
  const p=played(game.quarter,game.timeLeft);
  const r=remaining(game.quarter,game.timeLeft);
  if(p<0.5)return{type:"NEUTRAL",label:"⚖️ NEUTRE",edge:0,confidence:0,projection:scored,ourProb:50,edgePct:0};
  const pace=scored/p;
  const avgPace=game.total/TOTAL_MIN;
  const rw=Math.min(0.96,0.50+(p/TOTAL_MIN)*0.48);
  const blended=pace*rw+avgPace*(1-rw);
  const proj=+(scored+blended*qMult(game.quarter,game.timeLeft)*r).toFixed(1);
  const edge=+(proj-game.total).toFixed(1);
  const conf=Math.min(100,Math.round(Math.min(35,(p/TOTAL_MIN)*35)+Math.min(28,Math.abs(edge)*1.6)+20));
  const ourProb=Math.round((1/(1+Math.exp(-edge/8)))*100);
  const mktProb=game.polyOdds?Math.round(game.polyOdds.over*100):50;
  let type,label;
  if(edge>12&&conf>=55){type="STRONG_OVER";label="🔥 STRONG OVER";}
  else if(edge>5&&conf>=40){type="OVER";label="📈 OVER";}
  else if(edge<-12&&conf>=55){type="STRONG_UNDER";label="❄️ STRONG UNDER";}
  else if(edge<-5&&conf>=40){type="UNDER";label="📉 UNDER";}
  else{type="NEUTRAL";label="⚖️ NEUTRE";}
  return{type,label,edge,confidence:conf,projection:proj,ourProb,edgePct:+(ourProb-mktProb).toFixed(1),pacePerMin:+pace.toFixed(2),remaining:+r.toFixed(1),played:+p.toFixed(1)};
}

const COLORS={STRONG_OVER:"#00ff88",OVER:"#44ddaa",NEUTRAL:"#666",UNDER:"#ff8866",STRONG_UNDER:"#ff2244",SCHEDULED:"#333"};

function Ring({value,color,size=56}){
  const r=size/2-6,circ=2*Math.PI*r;
  return(
    <svg width={size} height={size} style={{transform:"rotate(-90deg)",flexShrink:0}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1a1a1a" strokeWidth={5}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5} strokeDasharray={circ} strokeDashoffset={circ*(1-Math.max(0,value)/100)} strokeLinecap="round" style={{transition:"stroke-dashoffset 0.7s"}}/>
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central" fill={color} fontSize={size<60?11:13} fontWeight={900} fontFamily="monospace" style={{transform:"rotate(90deg)",transformOrigin:`${size/2}px ${size/2}px`}}>{value>0?`${value}%`:"—"}</text>
    </svg>
  );
}
function ScoreModal({game,onSave,onClose}){
  const[hs,setHs]=useState(game.homeScore||0);
  const[as,setAs]=useState(game.awayScore||0);
  const[q,setQ]=useState(game.quarter||1);
  const[tl,setTl]=useState(game.timeLeft||"12:00");
  const[isLive,setIsLive]=useState(game.isLive||false);
  return(
    <div style={{position:"fixed",inset:0,background:"#000000cc",zIndex:999,display:"flex",alignItems:"center",justifyContent:"center"}}>
      <div style={{background:"#111",border:"1px solid #333",borderRadius:16,padding:24,width:300,fontFamily:"monospace"}}>
        <div style={{color:"#888",fontSize:10,marginBottom:12}}>MISE À JOUR SCORE</div>
        <div style={{color:"#fff",fontSize:16,fontWeight:700,marginBottom:16}}>{game.away} @ {game.home}</div>
        <div style={{display:"flex",alignItems:"center",gap:8,marginBottom:10}}>
          <label style={{color:"#555",fontSize:10,width:80}}>EN DIRECT</label>
          <div onClick={()=>setIsLive(l=>!l)} style={{width:40,height:22,borderRadius:11,background:isLive?"#00ff88":"#333",cursor:"pointer",position:"relative",transition:"background 0.3s"}}>
            <div style={{position:"absolute",top:3,left:isLive?20:3,width:16,height:16,borderRadius:"50%",background:"#fff",transition:"left 0.3s"}}/>
          </div>
        </div>
        {isLive&&(
          <>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:10}}>
              <div>
                <div style={{color:"#555",fontSize:9}}>{game.away}</div>
                <input type="number" value={as} onChange={e=>setAs(+e.target.value)} style={{width:"100%",background:"#1a1a1a",border:"1px solid #333",borderRadius:6,color:"#fff",fontFamily:"monospace",fontSize:18,fontWeight:700,padding:"8px",textAlign:"center"}}/>
              </div>
              <div>
                <div style={{color:"#555",fontSize:9}}>{game.home}</div>
                <input type="number" value={hs} onChange={e=>setHs(+e.target.value)} style={{width:"100%",background:"#1a1a1a",border:"1px solid #333",borderRadius:6,color:"#fff",fontFamily:"monospace",fontSize:18,fontWeight:700,padding:"8px",textAlign:"center"}}/>
              </div>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:16}}>
              <div>
                <div style={{color:"#555",fontSize:9}}>QUART</div>
                <select value={q} onChange={e=>setQ(+e.target.value)} style={{width:"100%",background:"#1a1a1a",border:"1px solid #333",borderRadius:6,color:"#fff",fontFamily:"monospace",fontSize:14,padding:"8px"}}>
                  {[1,2,3,4].map(i=><option key={i} value={i}>Q{i}</option>)}
                </select>
              </div>
              <div>
                <div style={{color:"#555",fontSize:9}}>TEMPS (M:SS)</div>
                <input type="text" value={tl} onChange={e=>setTl(e.target.value)} placeholder="4:32" style={{width:"100%",background:"#1a1a1a",border:"1px solid #333",borderRadius:6,color:"#fff",fontFamily:"monospace",fontSize:14,padding:"8px",boxSizing:"border-box"}}/>
              </div>
            </div>
          </>
        )}
        <div style={{display:"flex",gap:8}}>
          <button onClick={onClose} style={{flex:1,background:"#1a1a1a",border:"1px solid #333",borderRadius:8,color:"#666",fontFamily:"monospace",fontSize:12,padding:"10px",cursor:"pointer"}}>Annuler</button>
          <button onClick={()=>onSave({homeScore:hs,awayScore:as,quarter:q,timeLeft:tl,isLive})} style={{flex:2,background:"linear-gradient(135deg,#7c3aed,#5b21b6)",border:"none",borderRadius:8,color:"#fff",fontFamily:"monospace",fontSize:12,fontWeight:700,padding:"10px",cursor:"pointer"}}>✓ Mettre à jour</button>
        </div>
      </div>
    </div>
  );
}

function GameCard({game,selected,onSelect,onEdit}){
  const sig=getSignal(game);
  const c=COLORS[sig.type];
  const scored=(game.homeScore||0)+(game.awayScore||0);
  const progress=game.total?Math.min((scored/game.total)*100,100):0;
  const[pulse,setPulse]=useState(false);
  useEffect(()=>{const t=setInterval(()=>setPulse(p=>!p),1600);return()=>clearInterval(t);},[]);
  return(
    <div style={{position:"relative"}}>
      <div onClick={()=>onSelect(game.id)} style={{background:selected?"#0b130f":"#090909",border:`1px solid ${selected?c+"77":"#181818"}`,borderRadius:13,padding:"15px 17px",cursor:"pointer",transition:"all 0.2s"}}>
        <div style={{position:"absolute",top:11,right:44,display:"flex",alignItems:"center",gap:5}}>
          {game.isLive
            ?<><div style={{width:6,height:6,borderRadius:"50%",background:"#ff4444",boxShadow:pulse?"0 0 10px #ff4444":"none",transition:"box-shadow 0.4s"}}/><span style={{color:"#ff6666",fontSize:8,fontFamily:"monospace"}}>LIVE</span></>
            :<span style={{color:"#333",fontSize:8,fontFamily:"monospace"}}>{game.time}</span>
          }
        </div>
        <div onClick={e=>{e.stopPropagation();onEdit(game);}} style={{position:"absolute",top:8,right:10,width:26,height:26,borderRadius:6,background:"#1a1a1a",border:"1px solid #2a2a2a",display:"flex",alignItems:"center",justifyContent:"center",cursor:"pointer",fontSize:12}}>✏️</div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{fontSize:16}}>{game.awayLogo}</span>
            <span style={{color:"#ddd",fontFamily:"monospace",fontWeight:700,fontSize:14}}>{game.away}</span>
          </div>
          <div style={{textAlign:"center"}}>
            <div style={{color:"#fff",fontFamily:"monospace",fontSize:20,fontWeight:900}}>{game.isLive?`${game.awayScore}–${game.homeScore}`:"vs"}</div>
            <div style={{color:"#ffd700",fontFamily:"monospace",fontSize:9}}>{game.isLive?`Q${game.quarter} ${game.timeLeft}`:game.time}</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6}}>
            <span style={{color:"#ddd",fontFamily:"monospace",fontWeight:700,fontSize:14}}>{game.home}</span>
            <span style={{fontSize:16}}>{game.homeLogo}</span>
          </div>
        </div>
        {game.isLive&&game.total&&(
          <>
            <div style={{height:3,background:"#181818",borderRadius:2,overflow:"hidden",marginBottom:9}}>
              <div style={{height:"100%",width:`${progress}%`,background:c,transition:"width 1s"}}/>
            </div>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{background:`${c}14`,border:`1px solid ${c}30`,borderRadius:6,padding:"4px 9px",color:c,fontFamily:"monospace",fontSize:11,fontWeight:700}}>{sig.label}</div>
              <div style={{display:"flex",alignItems:"center",gap:9}}>
                <div style={{textAlign:"right"}}>
                  <div style={{color:"#333",fontSize:8,fontFamily:"monospace"}}>PROJ / LINE</div>
                  <div style={{color:c,fontFamily:"monospace",fontSize:13,fontWeight:900}}>{sig.projection} / {game.total}</div>
                </div>
                <Ring value={sig.confidence} color={c} size={46}/>
              </div>
            </div>
          </>
        )}
        {!game.isLive&&<div style={{color:"#222",fontSize:9,fontFamily:"monospace"}}>Tap ✏️ pour entrer le score</div>}
      </div>
    </div>
  );
}
export default function App(){
  const[games,setGames]=useState(TODAY_GAMES.map(g=>({...g,homeScore:0,awayScore:0,quarter:1,timeLeft:"12:00",isLive:false,polyOdds:null})));
  const[selectedId,setSelectedId]=useState("1");
  const[editGame,setEditGame]=useState(null);
  const handleSave=(saved)=>{setGames(prev=>prev.map(g=>g.id===editGame.id?{...g,...saved}:g));setEditGame(null);};
  const liveGames=games.filter(g=>g.isLive).sort((a,b)=>getSignal(b).confidence-getSignal(a).confidence);
  const scheduledGames=games.filter(g=>!g.isLive);
  const selected=games.find(g=>g.id===selectedId);
  const sig=selected?getSignal(selected):{type:"SCHEDULED",label:"",edge:0,confidence:0,projection:0,ourProb:50,edgePct:0};
  const c=COLORS[sig.type];
  return(
    <div style={{minHeight:"100vh",background:"#060606",color:"#fff",fontFamily:"monospace"}}>
      {editGame&&<ScoreModal game={editGame} onSave={handleSave} onClose={()=>setEditGame(null)}/>}
      <div style={{borderBottom:"1px solid #0f0f0f",padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",background:"#060606",position:"sticky",top:0,zIndex:100}}>
        <span style={{background:"linear-gradient(135deg,#7c3aed,#00ff88)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",fontSize:18,fontWeight:900,letterSpacing:2}}>NBA × POLYMARKET</span>
        {liveGames.length>0&&<span style={{background:"#ff444418",border:"1px solid #ff444433",borderRadius:4,padding:"3px 9px",color:"#ff8888",fontSize:9}}>● {liveGames.length} LIVE</span>}
      </div>
      <div style={{display:"flex",flexDirection:"column",gap:0}}>
        <div style={{padding:"12px",display:"flex",flexDirection:"column",gap:8}}>
          {liveGames.length>0&&<><div style={{color:"#ff4444",fontSize:8,letterSpacing:3,paddingLeft:3}}>● LIVE</div>{liveGames.map(g=><GameCard key={g.id} game={g} selected={selectedId===g.id} onSelect={setSelectedId} onEdit={setEditGame}/>)}</>}
          <div style={{color:"#333",fontSize:8,letterSpacing:3,paddingLeft:3,marginTop:4}}>CE SOIR — 6 MARS</div>
          {scheduledGames.map(g=><GameCard key={g.id} game={g} selected={selectedId===g.id} onSelect={setSelectedId} onEdit={setEditGame}/>)}
        </div>
        {selected&&(
          <div style={{padding:"12px",borderTop:"1px solid #111"}}>
            <div style={{background:`${c}08`,border:`1px solid ${c}28`,borderRadius:15,padding:"16px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div>
                <div style={{color:"#333",fontSize:9,letterSpacing:2,marginBottom:4}}>SIGNAL</div>
                <div style={{color:c,fontSize:20,fontWeight:900}}>{sig.label}</div>
                <div style={{color:"#444",fontSize:10,marginTop:2}}>{selected.awayFull} @ {selected.homeFull}</div>
              </div>
              <Ring value={sig.confidence} color={c} size={62}/>
            </div>
            {selected.isLive&&selected.total?(
              <>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
                  {[{label:"PROJETÉ",val:sig.projection,color:c},{label:"LINE",val:selected.total,color:"#aaa"},{label:"EDGE",val:`${sig.edge>0?"+":""}${sig.edge}`,color:sig.edge>3?"#00ff88":sig.edge<-3?"#ff4444":"#888"}].map((m,i)=>(
                    <div key={i} style={{background:"#0d0d0d",border:"1px solid #181818",borderRadius:10,padding:"12px"}}>
                      <div style={{color:"#333",fontSize:8,marginBottom:3}}>{m.label}</div>
                      <div style={{color:m.color,fontSize:20,fontWeight:900}}>{m.val}</div>
                    </div>
                  ))}
                </div>
                <div style={{background:"#080808",border:`1px solid ${c}1a`,borderRadius:10,padding:"14px",marginBottom:10}}>
                  <div style={{color:"#ffd700",fontSize:12,fontWeight:700,marginBottom:8}}>
                    {sig.type==="STRONG_OVER"&&"→ BET OVER — forte conviction"}
                    {sig.type==="OVER"&&"→ OVER possible — conviction moyenne"}
                    {sig.type==="STRONG_UNDER"&&"→ BET UNDER — forte conviction"}
                    {sig.type==="UNDER"&&"→ UNDER possible — surveiller"}
                    {sig.type==="NEUTRAL"&&"→ Pas d'edge clair — attendre"}
                  </div>
                  <a href="https://polymarket.com/sports/basketball/nba" target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",gap:6,background:"linear-gradient(135deg,#7c3aed,#5b21b6)",color:"#fff",textDecoration:"none",borderRadius:7,padding:"8px 14px",fontFamily:"monospace",fontSize:11,fontWeight:700}}>🔗 OUVRIR POLYMARKET</a>
                </div>
              </>
            ):(
              <div style={{background:"#0d0d0d",border:"1px solid #181818",borderRadius:10,padding:"24px",textAlign:"center"}}>
                <div style={{fontSize:32,marginBottom:8}}>🏀</div>
                <div style={{color:"#444",fontSize:11}}>Match prévu à {selected.time}</div>
                <div style={{color:"#222",fontSize:9,marginTop:6}}>Tap ✏️ pour entrer le score en direct</div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
