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

function getLogoUrl(teamName){
  const fullName=Object.keys(TEAM_IDS).find(k=>teamName.includes(k));
  const id=fullName?TEAM_IDS[fullName]:null;
  return id?`https://cdn.nba.com/logos/nba/${id}/global/L/logo.svg`:null;
}

const Q=12,TOTAL_MIN=48;
function pt(t){if(!t||t==="0:00")return 0;const[m,s]=String(t).split(":").map(Number);return(m||0)+(s||0)/60;}
function played(q,tl){return(q-1)*Q+(Q-pt(tl));}
function remaining(q,tl){return Math.max(0,TOTAL_MIN-played(q,tl));}
function qMult(q,tl){const r=pt(tl);if(q===4&&r<2)return 0.65;if(q===4&&r<4)return 0.78;if(q===4)return 0.90;return 1.0;}

function getPreMatchPrediction(game, teamStats){
  if(!teamStats) return null;
  const homeSt = Object.values(teamStats).find(t=>game.homeFull.includes(t.name.split(" ").pop()));
  const awaySt = Object.values(teamStats).find(t=>game.awayFull.includes(t.name.split(" ").pop()));
  const homeKey = Object.keys(teamStats).find(k=>game.homeFull.includes(k)||game.home===k);
  const awayKey = Object.keys(teamStats).find(k=>game.awayFull.includes(k)||game.away===k);
  const hStats = homeKey?teamStats[homeKey]:null;
  const aStats = awayKey?teamStats[awayKey]:null;
  if(!hStats?.ppg||!aStats?.ppg) return null;
  const proj = +((hStats.ppg + aStats.ppg) * 0.95).toFixed(1);
  return { proj, homePpg: hStats.ppg, awayPpg: aStats.ppg, homeOppg: hStats.oppg, awayOppg: aStats.oppg };
}

function getLiveSignal(game){
  if(!game.isLive||!game.total||(!game.homeScore&&!game.awayScore)){
    return{type:"SCHEDULED",label:"🕐 À VENIR",edge:0,confidence:0,projection:0};
  }
  const scored=game.homeScore+game.awayScore;
  const p=played(game.quarter,game.timeLeft);
  const r=remaining(game.quarter,game.timeLeft);
  if(p<0.5)return{type:"NEUTRAL",label:"⚖️ NEUTRE",edge:0,confidence:0,projection:scored};
  const pace=scored/p;
  const avgPace=game.total/TOTAL_MIN;
  const rw=Math.min(0.96,0.50+(p/TOTAL_MIN)*0.48);
  const blended=pace*rw+avgPace*(1-rw);
  const proj=+(scored+blended*qMult(game.quarter,game.timeLeft)*r).toFixed(1);
  const edge=+(proj-game.total).toFixed(1);
  const conf=Math.min(100,Math.round(Math.min(35,(p/TOTAL_MIN)*35)+Math.min(28,Math.abs(edge)*1.6)+20));
  let type,label;
  if(edge>12&&conf>=55){type="STRONG_OVER";label="🔥 STRONG OVER";}
  else if(edge>5&&conf>=40){type="OVER";label="📈 OVER";}
  else if(edge<-12&&conf>=55){type="STRONG_UNDER";label="❄️ STRONG UNDER";}
  else if(edge<-5&&conf>=40){type="UNDER";label="📉 UNDER";}
  else{type="NEUTRAL";label="⚖️ NEUTRE";}
  return{type,label,edge,confidence:conf,projection:proj,pacePerMin:+pace.toFixed(2),remaining:+r.toFixed(1)};
}

const COLORS={STRONG_OVER:"#00aa55",OVER:"#33bb77",NEUTRAL:"#999",UNDER:"#ff7744",STRONG_UNDER:"#ff2244",SCHEDULED:"#ccc"};

function Ring({value,color,size=56}){
  const r=size/2-6,circ=2*Math.PI*r;
  return(
    <svg width={size} height={size} style={{transform:"rotate(-90deg)",flexShrink:0}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e8e8e8" strokeWidth={5}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5} strokeDasharray={circ} strokeDashoffset={circ*(1-Math.max(0,value)/100)} strokeLinecap="round" style={{transition:"stroke-dashoffset 0.7s"}}/>
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central" fill={color} fontSize={size<60?11:13} fontWeight={900} fontFamily="monospace" style={{transform:"rotate(90deg)",transformOrigin:`${size/2}px ${size/2}px`}}>{value>0?`${value}%`:"—"}</text>
    </svg>
  );
}

function TeamLogo({name,size=32}){
  const url=getLogoUrl(name);
  if(!url)return<span style={{fontSize:size*0.7}}>🏀</span>;
  return<img src={url} alt={name} style={{width:size,height:size,objectFit:"contain"}} onError={e=>e.target.style.display='none'}/>;
}
function PreMatchCard({game, teamStats}){
  const pred = getPreMatchPrediction(game, teamStats);
  const[pulse,setPulse]=useState(false);
  useEffect(()=>{const t=setInterval(()=>setPulse(p=>!p),1600);return()=>clearInterval(t);},[]);

  return(
    <div style={{background:"#ffffff",border:"1px solid #e8e8e8",borderRadius:13,padding:"15px 17px",boxShadow:"0 1px 6px #00000008"}}>
      <div style={{position:"absolute",right:12,top:11}}>
        <span style={{color:"#ccc",fontSize:8,fontFamily:"monospace"}}>{game.time?.slice(11,16)} ET</span>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <TeamLogo name={game.awayFull} size={32}/>
          <span style={{color:"#111",fontWeight:700,fontSize:14}}>{game.away}</span>
        </div>
        <div style={{textAlign:"center"}}>
          <div style={{color:"#111",fontSize:18,fontWeight:900}}>VS</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{color:"#111",fontWeight:700,fontSize:14}}>{game.home}</span>
          <TeamLogo name={game.homeFull} size={32}/>
        </div>
      </div>

      {pred ? (
        <div style={{background:"#f8f8f8",borderRadius:10,padding:"10px 12px"}}>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:8}}>
            <div style={{textAlign:"center"}}>
              <div style={{color:"#bbb",fontSize:8,fontFamily:"monospace"}}>MOY {game.away}</div>
              <div style={{color:"#111",fontSize:15,fontWeight:700}}>{pred.awayPpg}</div>
            </div>
            <div style={{textAlign:"center"}}>
              <div style={{color:"#bbb",fontSize:8,fontFamily:"monospace"}}>PROJECTION</div>
              <div style={{color:"#7c3aed",fontSize:18,fontWeight:900}}>{pred.proj}</div>
            </div>
            <div style={{textAlign:"center"}}>
              <div style={{color:"#bbb",fontSize:8,fontFamily:"monospace"}}>MOY {game.home}</div>
              <div style={{color:"#111",fontSize:15,fontWeight:700}}>{pred.homePpg}</div>
            </div>
          </div>
          {game.total && (
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div style={{fontSize:9,fontFamily:"monospace",color:"#bbb"}}>LINE: {game.total}</div>
              <div style={{
                background: pred.proj > game.total ? "#00aa5515" : "#ff224415",
                border: `1px solid ${pred.proj > game.total ? "#00aa5530" : "#ff224430"}`,
                borderRadius:6, padding:"3px 8px",
                color: pred.proj > game.total ? "#00aa55" : "#ff2244",
                fontSize:10, fontWeight:700, fontFamily:"monospace"
              }}>
                {pred.proj > game.total ? "📈 OVER PRÉVU" : "📉 UNDER PRÉVU"}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{color:"#ddd",fontSize:9,fontFamily:"monospace",textAlign:"center",padding:"8px 0"}}>
          Chargement des stats...
        </div>
      )}
    </div>
  );
}

function GameCard({game,selected,onSelect,teamStats}){
  const sig=getLiveSignal(game);
  const c=COLORS[sig.type];
  const scored=(game.homeScore||0)+(game.awayScore||0);
  const progress=game.total?Math.min((scored/game.total)*100,100):0;
  const[pulse,setPulse]=useState(false);
  useEffect(()=>{const t=setInterval(()=>setPulse(p=>!p),1600);return()=>clearInterval(t);},[]);
  return(
    <div onClick={()=>onSelect(game.id)} style={{background:selected?"#f0fff8":"#ffffff",border:`1px solid ${selected?c+"77":"#e8e8e8"}`,borderRadius:13,padding:"15px 17px",cursor:"pointer",transition:"all 0.2s",boxShadow:selected?`0 0 18px ${c}14`:"0 1px 6px #00000008",position:"relative"}}>
      <div style={{position:"absolute",top:11,right:12,display:"flex",alignItems:"center",gap:5}}>
        {game.isLive
          ?<><div style={{width:6,height:6,borderRadius:"50%",background:"#ff4444",boxShadow:pulse?"0 0 10px #ff4444":"none",transition:"box-shadow 0.4s"}}/><span style={{color:"#ff4444",fontSize:8,fontFamily:"monospace"}}>LIVE</span></>
          :<span style={{color:"#ccc",fontSize:8,fontFamily:"monospace"}}>{game.time?.slice(11,16)} ET</span>
        }
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <TeamLogo name={game.awayFull} size={32}/>
          <span style={{color:"#111",fontFamily:"monospace",fontWeight:700,fontSize:14}}>{game.away}</span>
        </div>
        <div style={{textAlign:"center"}}>
          <div style={{color:"#111",fontFamily:"monospace",fontSize:20,fontWeight:900}}>{game.isLive?`${game.awayScore}–${game.homeScore}`:"vs"}</div>
          <div style={{color:"#f59e0b",fontFamily:"monospace",fontSize:9}}>{game.isLive?`Q${game.quarter} ${game.timeLeft}`:""}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{color:"#111",fontFamily:"monospace",fontWeight:700,fontSize:14}}>{game.home}</span>
          <TeamLogo name={game.homeFull} size={32}/>
        </div>
      </div>
      {game.isLive&&game.total&&(
        <>
          <div style={{height:3,background:"#e8e8e8",borderRadius:2,overflow:"hidden",marginBottom:9}}>
            <div style={{height:"100%",width:`${progress}%`,background:c,transition:"width 1s"}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{background:`${c}15`,border:`1px solid ${c}30`,borderRadius:6,padding:"4px 9px",color:c,fontFamily:"monospace",fontSize:11,fontWeight:700}}>{sig.label}</div>
            <div style={{display:"flex",alignItems:"center",gap:9}}>
              <div style={{textAlign:"right"}}>
                <div style={{color:"#bbb",fontSize:8,fontFamily:"monospace"}}>PROJ / LINE</div>
                <div style={{color:c,fontFamily:"monospace",fontSize:13,fontWeight:900}}>{sig.projection} / {game.total}</div>
              </div>
              <Ring value={sig.confidence} color={c} size={46}/>
            </div>
          </div>
        </>
      )}
      {!game.isLive&&(
        <PreMatchCard game={game} teamStats={teamStats}/>
      )}
    </div>
  );
}
export default function App(){
  const[games,setGames]=useState([]);
  const[teamStats,setTeamStats]=useState(null);
  const[selectedId,setSelectedId]=useState(null);
  const[status,setStatus]=useState("loading");
  const[lastUpdate,setLastUpdate]=useState(null);

  const loadData = async()=>{
    try{
      const[scoresRes,statsRes]=await Promise.all([
        fetch(`${PROXY}/nba/scores`),
        fetch(`${PROXY}/nba/stats`),
      ]);
      const scores=await scoresRes.json();
      const stats=await statsRes.json();
      if(!Array.isArray(scores))throw new Error("bad scores");
      setGames(scores);
      setTeamStats(stats);
      if(!selectedId&&scores.length>0){
        setSelectedId((scores.find(g=>g.isLive)||scores[0]).id);
      }
      setLastUpdate(new Date().toLocaleTimeString("fr-CA"));
      setStatus("ok");
    }catch(e){
      setStatus("error");
    }
  };

  useEffect(()=>{loadData();const iv=setInterval(loadData,30000);return()=>clearInterval(iv);},[]);

  const selected=games.find(g=>g.id===selectedId);
  const sig=selected?getLiveSignal(selected):{type:"SCHEDULED",label:"",edge:0,confidence:0,projection:0};
  const c=COLORS[sig.type];
  const liveGames=games.filter(g=>g.isLive).sort((a,b)=>getLiveSignal(b).confidence-getLiveSignal(a).confidence);
  const scheduledGames=games.filter(g=>!g.isLive&&!g.isFinished);

  return(
    <div style={{minHeight:"100vh",background:"#f5f5f5",color:"#111",fontFamily:"monospace"}}>
      <div style={{borderBottom:"1px solid #e8e8e8",padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",background:"#ffffff",position:"sticky",top:0,zIndex:100,boxShadow:"0 1px 8px #00000008"}}>
        <span style={{background:"linear-gradient(135deg,#7c3aed,#00aa55)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",fontSize:18,fontWeight:900,letterSpacing:2}}>NBA × POLYMARKET</span>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {lastUpdate&&<span style={{color:"#ccc",fontSize:8}}>↻ {lastUpdate}</span>}
          {liveGames.length>0&&<span style={{background:"#ff444415",border:"1px solid #ff444430",borderRadius:4,padding:"3px 9px",color:"#ff4444",fontSize:9}}>● {liveGames.length} LIVE</span>}
        </div>
      </div>

      {status==="loading"&&(
        <div style={{display:"flex",justifyContent:"center",alignItems:"center",height:"70vh",flexDirection:"column",gap:14}}>
          <div style={{color:"#bbb",fontSize:11,letterSpacing:2}}>Chargement des matchs et stats...</div>
          <div style={{display:"flex",gap:6}}>
            {[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:"#7c3aed",opacity:0.3+i*0.3}}/>)}
          </div>
        </div>
      )}

      {status==="error"&&(
        <div style={{margin:20,background:"#fff5f5",border:"1px solid #ff444430",borderRadius:12,padding:"18px 22px"}}>
          <div style={{color:"#ff4444",fontSize:12,marginBottom:8}}>⚠️ Impossible de charger les données</div>
          <button onClick={()=>{setStatus("loading");loadData();}} style={{background:"#7c3aed15",border:"1px solid #7c3aed30",borderRadius:6,color:"#7c3aed",fontFamily:"monospace",fontSize:11,padding:"6px 14px",cursor:"pointer"}}>Réessayer</button>
        </div>
      )}

      {status==="ok"&&(
        <div style={{padding:12,display:"flex",flexDirection:"column",gap:8}}>
          {liveGames.length>0&&(
            <>
              <div style={{color:"#ff4444",fontSize:8,letterSpacing:3,paddingLeft:3}}>● MATCHS EN DIRECT</div>
              {liveGames.map(g=><GameCard key={g.id} game={g} selected={selectedId===g.id} onSelect={setSelectedId} teamStats={teamStats}/>)}
            </>
          )}

          {scheduledGames.length>0&&(
            <>
              <div style={{color:"#bbb",fontSize:8,letterSpacing:3,paddingLeft:3,marginTop:4}}>📊 PRÉDICTIONS PRÉ-MATCH</div>
              {scheduledGames.map(g=><div key={g.id} style={{position:"relative"}} onClick={()=>setSelectedId(g.id)}><PreMatchCard game={g} teamStats={teamStats}/></div>)}
            </>
          )}

          {selected&&selected.isLive&&selected.total&&(
            <div style={{borderTop:"1px solid #e8e8e8",paddingTop:12,marginTop:4}}>
              <div style={{background:`${c}08`,border:`1px solid ${c}20`,borderRadius:15,padding:"16px 18px",display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12,background:"#ffffff",boxShadow:"0 1px 6px #00000008"}}>
                <div>
                  <div style={{color:"#bbb",fontSize:9,letterSpacing:2,marginBottom:4}}>SIGNAL LIVE</div>
                  <div style={{color:c,fontSize:20,fontWeight:900}}>{sig.label}</div>
                  <div style={{color:"#888",fontSize:10,marginTop:2}}>{selected.awayFull} @ {selected.homeFull}</div>
                </div>
                <Ring value={sig.confidence} color={c} size={62}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
                {[{label:"PROJETÉ",val:sig.projection,color:c},{label:"LINE",val:selected.total,color:"#888"},{label:"EDGE",val:`${sig.edge>0?"+":""}${sig.edge}`,color:sig.edge>3?"#00aa55":sig.edge<-3?"#ff2244":"#888"}].map((m,i)=>(
                  <div key={i} style={{background:"#ffffff",border:"1px solid #e8e8e8",borderRadius:10,padding:"12px",boxShadow:"0 1px 4px #00000006"}}>
                    <div style={{color:"#bbb",fontSize:8,marginBottom:3}}>{m.label}</div>
                    <div style={{color:m.color,fontSize:20,fontWeight:900}}>{m.val}</div>
                  </div>
                ))}
              </div>
              <div style={{background:"#ffffff",border:`1px solid ${c}20`,borderRadius:10,padding:"14px",boxShadow:"0 1px 6px #00000008"}}>
                <div style={{color:"#7c3aed",fontSize:12,fontWeight:700,marginBottom:8}}>
                  {sig.type==="STRONG_OVER"&&"→ BET OVER — forte conviction"}
                  {sig.type==="OVER"&&"→ OVER possible — conviction moyenne"}
                  {sig.type==="STRONG_UNDER"&&"→ BET UNDER — forte conviction"}
                  {sig.type==="UNDER"&&"→ UNDER possible — surveiller"}
                  {sig.type==="NEUTRAL"&&"→ Pas d'edge clair — attendre"}
                </div>
                <a href="https://polymarket.com/sports/basketball/nba" target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",gap:6,background:"linear-gradient(135deg,#7c3aed,#5b21b6)",color:"#fff",textDecoration:"none",borderRadius:7,padding:"8px 14px",fontFamily:"monospace",fontSize:11,fontWeight:700}}>🔗 OUVRIR POLYMARKET</a>
              </div>
            </div>
          )}

          {games.length===0&&(
            <div style={{textAlign:"center",color:"#bbb",padding:40,fontSize:12}}>Aucun match NBA aujourd'hui</div>
          )}
        </div>
      )}
    </div>
  );
}

