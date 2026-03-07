import { useState, useEffect } from "react";

const PROXY = "https://nba-proxy-production.up.railway.app";

const TEAM_IDS = {
  Hawks:1610612737, Celtics:1610612738, Nets:1610612751, Hornets:1610612766,
  Bulls:1610612741, Cavaliers:1610612739, Mavericks:1610612742, Nuggets:1610612743,
  Pistons:1610612765, Warriors:1610612744, Rockets:1610612745, Pacers:1610612754,
  Clippers:1610612746, Lakers:1610612747, Grizzlies:1610612763, Heat:1610612748,
  Bucks:1610612749, Timberwolves:1610612750, Pelicans:1610612740, Knicks:1610612752,
  Thunder:1610612760, Magic:1610612753, "76ers":1610612755, Suns:1610612756,
  "Trail Blazers":1610612757, Kings:1610612758, Spurs:1610612759, Raptors:1610612761,
  Jazz:1610612762, Wizards:1610612764
};

function getLogoUrl(teamName) {
  const nickname = teamName.split(" ").pop();
  const fullName = Object.keys(TEAM_IDS).find(k => teamName.includes(k) || k.includes(nickname));
  const id = fullName ? TEAM_IDS[fullName] : null;
  return id ? `https://cdn.nba.com/logos/nba/${id}/global/L/logo.svg` : null;
}

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
  let type,label;
  if(edge>12&&conf>=55){type="STRONG_OVER";label="🔥 STRONG OVER";}
  else if(edge>5&&conf>=40){type="OVER";label="📈 OVER";}
  else if(edge<-12&&conf>=55){type="STRONG_UNDER";label="❄️ STRONG UNDER";}
  else if(edge<-5&&conf>=40){type="UNDER";label="📉 UNDER";}
  else{type="NEUTRAL";label:"⚖️ NEUTRE";}
  return{type,label,edge,confidence:conf,projection:proj,ourProb,edgePct:0,pacePerMin:+pace.toFixed(2),remaining:+r.toFixed(1),played:+p.toFixed(1)};
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
function TeamLogo({name, size=36}){
  const url = getLogoUrl(name);
  if(!url) return <span style={{fontSize:size*0.7}}>🏀</span>;
  return <img src={url} alt={name} style={{width:size,height:size,objectFit:"contain"}} onError={e=>e.target.style.display='none'}/>;
}

function GameCard({game,selected,onSelect}){
  const sig=getSignal(game);
  const c=COLORS[sig.type];
  const scored=(game.homeScore||0)+(game.awayScore||0);
  const progress=game.total?Math.min((scored/game.total)*100,100):0;
  const[pulse,setPulse]=useState(false);
  useEffect(()=>{const t=setInterval(()=>setPulse(p=>!p),1600);return()=>clearInterval(t);},[]);
  return(
    <div onClick={()=>onSelect(game.id)} style={{background:selected?"#0b130f":"#090909",border:`1px solid ${selected?c+"77":"#181818"}`,borderRadius:13,padding:"15px 17px",cursor:"pointer",transition:"all 0.2s",boxShadow:selected?`0 0 18px ${c}14`:"none"}}>
      <div style={{position:"absolute",top:11,right:12,display:"flex",alignItems:"center",gap:5}}>
        {game.isLive
          ?<><div style={{width:6,height:6,borderRadius:"50%",background:"#ff4444",boxShadow:pulse?"0 0 10px #ff4444":"none",transition:"box-shadow 0.4s"}}/><span style={{color:"#ff6666",fontSize:8,fontFamily:"monospace"}}>LIVE</span></>
          :<span style={{color:"#333",fontSize:8,fontFamily:"monospace"}}>{game.time}</span>
        }
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <TeamLogo name={game.awayFull} size={32}/>
          <span style={{color:"#ddd",fontFamily:"monospace",fontWeight:700,fontSize:14}}>{game.away}</span>
        </div>
        <div style={{textAlign:"center"}}>
          <div style={{color:"#fff",fontFamily:"monospace",fontSize:20,fontWeight:900}}>{game.isLive?`${game.awayScore}–${game.homeScore}`:"vs"}</div>
          <div style={{color:"#ffd700",fontFamily:"monospace",fontSize:9}}>{game.isLive?`Q${game.quarter} ${game.timeLeft}`:game.time}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{color:"#ddd",fontFamily:"monospace",fontWeight:700,fontSize:14}}>{game.home}</span>
          <TeamLogo name={game.homeFull} size={32}/>
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
      {!game.isLive&&<div style={{color:"#222",fontSize:9,fontFamily:"monospace",marginTop:4}}>Les scores se mettent à jour automatiquement</div>}
    </div>
  );
}
export default function App(){
  const[games,setGames]=useState([]);
  const[selectedId,setSelectedId]=useState(null);
  const[status,setStatus]=useState("loading");
  const[lastUpdate,setLastUpdate]=useState(null);

  const loadGames = async()=>{
    try{
      const res = await fetch(`${PROXY}/nba/scores`);
      const data = await res.json();
      if(!Array.isArray(data)) throw new Error("bad data");
      const mapped = data.map(g=>({
        id: g.id,
        away: g.away,
        awayFull: g.awayFull,
        home: g.home,
        homeFull: g.homeFull,
        awayScore: g.awayScore||0,
        homeScore: g.homeScore||0,
        quarter: g.quarter||1,
        timeLeft: g.timeLeft||"12:00",
        isLive: g.isLive||false,
        time: g.time||"",
        total: g.total||null,
        polyOdds: null,
      }));
      setGames(mapped);
      if(!selectedId && mapped.length>0){
        setSelectedId((mapped.find(g=>g.isLive)||mapped[0]).id);
      }
      setLastUpdate(new Date().toLocaleTimeString("fr-CA"));
      setStatus("ok");
    }catch(e){
      setStatus("error");
    }
  };

  useEffect(()=>{loadGames();const iv=setInterval(loadGames,30000);return()=>clearInterval(iv);},[]);

  const selected=games.find(g=>g.id===selectedId);
  const sig=selected?getSignal(selected):{type:"SCHEDULED",label:"",edge:0,confidence:0,projection:0,ourProb:50,edgePct:0};
  const c=COLORS[sig.type];
  const liveGames=games.filter(g=>g.isLive).sort((a,b)=>getSignal(b).confidence-getSignal(a).confidence);
  const scheduledGames=games.filter(g=>!g.isLive);

  return(
    <div style={{minHeight:"100vh",background:"#060606",color:"#fff",fontFamily:"monospace"}}>
      <div style={{borderBottom:"1px solid #0f0f0f",padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",background:"#060606",position:"sticky",top:0,zIndex:100}}>
        <span style={{background:"linear-gradient(135deg,#7c3aed,#00ff88)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",fontSize:18,fontWeight:900,letterSpacing:2}}>NBA × POLYMARKET</span>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {lastUpdate&&<span style={{color:"#1a1a1a",fontSize:8}}>↻ {lastUpdate}</span>}
          {liveGames.length>0&&<span style={{background:"#ff444418",border:"1px solid #ff444433",borderRadius:4,padding:"3px 9px",color:"#ff8888",fontSize:9}}>● {liveGames.length} LIVE</span>}
        </div>
      </div>

      {status==="loading"&&(
        <div style={{display:"flex",justifyContent:"center",alignItems:"center",height:"70vh",flexDirection:"column",gap:14}}>
          <div style={{color:"#333",fontSize:11,letterSpacing:2}}>Chargement des matchs...</div>
          <div style={{display:"flex",gap:6}}>
            {[0,1,2].map(i=><div key={i} style={{width:6,height:6,borderRadius:"50%",background:"#7c3aed",opacity:0.4+i*0.3}}/>)}
          </div>
        </div>
      )}

      {status==="error"&&(
        <div style={{margin:20,background:"#1a0808",border:"1px solid #ff444433",borderRadius:12,padding:"18px 22px"}}>
          <div style={{color:"#ff4444",fontSize:12,marginBottom:8}}>⚠️ Impossible de charger les matchs</div>
          <button onClick={()=>{setStatus("loading");loadGames();}} style={{background:"#7c3aed22",border:"1px solid #7c3aed44",borderRadius:6,color:"#a78bfa",fontFamily:"monospace",fontSize:11,padding:"6px 14px",cursor:"pointer"}}>Réessayer</button>
        </div>
      )}

      {status==="ok"&&(
        <div style={{display:"flex",flexDirection:"column",gap:0}}>
          <div style={{padding:"12px",display:"flex",flexDirection:"column",gap:8,position:"relative"}}>
            {liveGames.length>0&&<><div style={{color:"#ff4444",fontSize:8,letterSpacing:3,paddingLeft:3}}>● LIVE</div>{liveGames.map(g=><GameCard key={g.id} game={g} selected={selectedId===g.id} onSelect={setSelectedId}/>)}</>}
            {scheduledGames.length>0&&<><div style={{color:"#333",fontSize:8,letterSpacing:3,paddingLeft:3,marginTop:4}}>CE SOIR</div>{scheduledGames.map(g=><GameCard key={g.id} game={g} selected={selectedId===g.id} onSelect={setSelectedId}/>)}</>}
            {games.length===0&&<div style={{textAlign:"center",color:"#333",padding:40,fontSize:12}}>Aucun match NBA aujourd'hui</div>}
          </div>

          {selected&&(
            <div style={{padding:"12px",borderTop:"1px solid #111"}}>
              <div style={{background:`${c}08`,border:`1px solid ${c}28`,borderRadius:15,padding:"16px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                <div>
                  <div style={{color:"#333",fontSize:9,letterSpacing:2,marginBottom:4}}>SIGNAL</div>
                  <div style={{color:c,fontSize:20,fontWeight:900}}>{sig.label||"🕐 À VENIR"}</div>
                  <div style={{color:"#444",fontSize:10,marginTop:2}}>{selected.awayFull} @ {selected.homeFull}</div>
                  <div style={{color:"#222",fontSize:9,marginTop:1}}>LINE: {selected.total||"—"}</div>
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
                  <div style={{color:"#222",fontSize:9,marginTop:6}}>Les scores se chargent automatiquement au tip-off</div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
