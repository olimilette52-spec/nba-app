import { useState, useEffect } from "react";

const PROXY = "https://nba-proxy-v1bi.onrender.com";

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

const TEAM_STATS = {
  "Atlanta Hawks":{ppg:117.7,oppg:117.3,pace:102.1,backToBack:false},
  "Boston Celtics":{ppg:114.5,oppg:107.0,pace:94.8,backToBack:false},
  "Brooklyn Nets":{ppg:106.9,oppg:115.6,pace:96.6,backToBack:false},
  "Charlotte Hornets":{ppg:116.2,oppg:112.5,pace:97.3,backToBack:false},
  "Chicago Bulls":{ppg:115.5,oppg:119.7,pace:101.7,backToBack:false},
  "Cleveland Cavaliers":{ppg:119.1,oppg:114.9,pace:100.2,backToBack:false},
  "Dallas Mavericks":{ppg:113.3,oppg:117.7,pace:101.6,backToBack:false},
  "Denver Nuggets":{ppg:120.2,oppg:116.5,pace:97.9,backToBack:false},
  "Detroit Pistons":{ppg:116.8,oppg:109.6,pace:99.6,backToBack:false},
  "Golden State Warriors":{ppg:115.0,oppg:113.9,pace:99.4,backToBack:false},
  "Houston Rockets":{ppg:114.5,oppg:109.3,pace:96.0,backToBack:false},
  "Indiana Pacers":{ppg:111.4,oppg:119.9,pace:101.0,backToBack:false},
  "LA Clippers":{ppg:113.8,oppg:114.2,pace:98.2,backToBack:false},
  "Los Angeles Lakers":{ppg:116.4,oppg:114.8,pace:99.8,backToBack:false},
  "Memphis Grizzlies":{ppg:117.2,oppg:118.4,pace:101.4,backToBack:false},
  "Miami Heat":{ppg:109.8,oppg:112.4,pace:96.4,backToBack:false},
  "Milwaukee Bucks":{ppg:118.6,oppg:116.2,pace:101.2,backToBack:false},
  "Minnesota Timberwolves":{ppg:112.8,oppg:108.6,pace:97.4,backToBack:false},
  "New Orleans Pelicans":{ppg:109.2,oppg:118.6,pace:98.6,backToBack:false},
  "New York Knicks":{ppg:119.8,oppg:112.4,pace:97.2,backToBack:false},
  "Oklahoma City Thunder":{ppg:119.4,oppg:106.8,pace:99.6,backToBack:false},
  "Orlando Magic":{ppg:108.4,oppg:106.2,pace:95.8,backToBack:false},
  "Philadelphia 76ers":{ppg:107.8,oppg:114.6,pace:97.6,backToBack:false},
  "Phoenix Suns":{ppg:112.6,oppg:116.8,pace:99.2,backToBack:false},
  "Portland Trail Blazers":{ppg:108.2,oppg:119.6,pace:100.4,backToBack:false},
  "Sacramento Kings":{ppg:117.4,oppg:116.2,pace:102.8,backToBack:false},
  "San Antonio Spurs":{ppg:110.4,oppg:120.6,pace:100.2,backToBack:false},
  "Toronto Raptors":{ppg:109.6,oppg:118.2,pace:98.4,backToBack:false},
  "Utah Jazz":{ppg:107.8,oppg:121.4,pace:100.6,backToBack:false},
  "Washington Wizards":{ppg:105.8,oppg:122.6,pace:99.8,backToBack:false}
};

function getLogoUrl(teamName){
  if(!teamName) return null;
  const fullName=Object.keys(TEAM_IDS).find(k=>teamName.includes(k));
  const id=fullName?TEAM_IDS[fullName]:null;
  return id?`https://cdn.nba.com/logos/nba/${id}/global/L/logo.svg`:null;
}

function getPreMatch(game){
  const hKey=Object.keys(TEAM_STATS).find(k=>game.homeFull&&game.homeFull.includes(k.split(" ").pop()));
  const aKey=Object.keys(TEAM_STATS).find(k=>game.awayFull&&game.awayFull.includes(k.split(" ").pop()));
  const h=hKey?TEAM_STATS[hKey]:null;
  const a=aKey?TEAM_STATS[aKey]:null;
  if(!h||!a) return null;
  const homeExp=(h.ppg+a.oppg)/2+1.6;
  const awayExp=(a.ppg+h.oppg)/2;
  let proj=homeExp+awayExp;
  proj+=(((h.pace+a.pace)/2)-98.5)*0.8;
  if(h.backToBack) proj-=3.5;
  if(a.backToBack) proj-=3.5;
  const ratio=homeExp/(homeExp+awayExp);
  const homeProjScore=Math.round(proj*ratio);
  const awayProjScore=Math.round(proj-homeProjScore);
  const winner=homeProjScore>=awayProjScore?game.home:game.away;
  return{
    proj:+proj.toFixed(1),
    homeProjScore,awayProjScore,
    homePpg:h.ppg,awayPpg:a.ppg,
    homeOppg:h.oppg,awayOppg:a.oppg,
    homeB2B:h.backToBack,awayB2B:a.backToBack,
    winner
  };
}

const Q=12,TOTAL_MIN=48;
function pt(t){if(!t||t==="0:00")return 0;const[m,s]=String(t).split(":").map(Number);return(m||0)+(s||0)/60;}
function played(q,tl){return(q-1)*Q+(Q-pt(tl));}
function remaining(q,tl){return Math.max(0,TOTAL_MIN-played(q,tl));}
function qMult(q,tl){const r=pt(tl);if(q===4&&r<2)return 0.65;if(q===4&&r<4)return 0.78;if(q===4)return 0.90;return 1.0;}

function getSignal(game){
  if(!game.isLive||!game.total||(!game.homeScore&&!game.awayScore)){
    return{type:"SCHEDULED",label:"A VENIR",edge:0,confidence:0,projection:0};
  }
  const scored=game.homeScore+game.awayScore;
  const p=played(game.quarter,game.timeLeft);
  const r=remaining(game.quarter,game.timeLeft);
  if(p<0.5)return{type:"NEUTRAL",label:"NEUTRE",edge:0,confidence:0,projection:scored};
  const pace=scored/p;
  const avgPace=game.total/TOTAL_MIN;
  const rw=Math.min(0.96,0.50+(p/TOTAL_MIN)*0.48);
  const blended=pace*rw+avgPace*(1-rw);
  const proj=+(scored+blended*qMult(game.quarter,game.timeLeft)*r).toFixed(1);
  const edge=+(proj-game.total).toFixed(1);
  const conf=Math.min(100,Math.round(Math.min(35,(p/TOTAL_MIN)*35)+Math.min(28,Math.abs(edge)*1.6)+20));
  let type,label;
  if(edge>12&&conf>=55){type="STRONG_OVER";label="STRONG OVER";}
  else if(edge>5&&conf>=40){type="OVER";label="OVER";}
  else if(edge<-12&&conf>=55){type="STRONG_UNDER";label="STRONG UNDER";}
  else if(edge<-5&&conf>=40){type="UNDER";label="UNDER";}
  else{type="NEUTRAL";label="NEUTRE";}
  return{type,label,edge,confidence:conf,projection:proj};
}

const COLORS={STRONG_OVER:"#007733",OVER:"#009944",NEUTRAL:"#888",UNDER:"#cc3300",STRONG_UNDER:"#aa0022",SCHEDULED:"#aaa"};
const BGCOLORS={STRONG_OVER:"#00aa5515",OVER:"#00aa5510",NEUTRAL:"#88888810",UNDER:"#ff330015",STRONG_UNDER:"#cc000015",SCHEDULED:"#f4f4f4"};
const BORDERCOLORS={STRONG_OVER:"#00aa5530",OVER:"#00aa5520",NEUTRAL:"#ddd",UNDER:"#ff330025",STRONG_UNDER:"#cc000025",SCHEDULED:"#e0e0e0"};

function Ring({value,color,size=56}){
  const r=size/2-6,circ=2*Math.PI*r;
  return(
    <svg width={size} height={size} style={{transform:"rotate(-90deg)",flexShrink:0}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#e8e8e8" strokeWidth={5}/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={5} strokeDasharray={circ} strokeDashoffset={circ*(1-Math.max(0,value)/100)} strokeLinecap="round" style={{transition:"stroke-dashoffset 0.7s"}}/>
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central" fill={color} fontSize={size<60?11:13} fontWeight={900} fontFamily="monospace" style={{transform:"rotate(90deg)",transformOrigin:`${size/2}px ${size/2}px`}}>{value>0?`${value}%`:"--"}</text>
    </svg>
  );
}

function TeamLogo({name,size=36}){
  const url=getLogoUrl(name);
  if(!url)return<span style={{fontSize:size*0.7}}>🏀</span>;
  return<img src={url} alt={name} style={{width:size,height:size,objectFit:"contain"}} onError={e=>e.target.style.display="none"}/>;
}

function LiveCard({game,selected,onSelect}){
  const sig=getSignal(game);
  const c=COLORS[sig.type];
  const scored=(game.homeScore||0)+(game.awayScore||0);
  const progress=game.total?Math.min((scored/game.total)*100,100):0;
  const[pulse,setPulse]=useState(false);
  useEffect(()=>{const t=setInterval(()=>setPulse(p=>!p),1600);return()=>clearInterval(t);},[]);
  return(
    <div onClick={()=>onSelect(game.id)} style={{background:selected?"#f8fff8":"#ffffff",border:`1px solid ${selected?c+"66":"#e0e0e0"}`,borderRadius:13,padding:"15px 17px",cursor:"pointer",transition:"all 0.2s",boxShadow:selected?`0 0 18px ${c}20`:"0 1px 6px #00000008",position:"relative"}}>
      <div style={{position:"absolute",top:11,right:12,display:"flex",alignItems:"center",gap:5}}>
        <div style={{width:6,height:6,borderRadius:"50%",background:"#cc0000",boxShadow:pulse?"0 0 8px #cc0000":"none",transition:"box-shadow 0.4s"}}/>
        <span style={{color:"#cc0000",fontSize:8,fontWeight:700}}>LIVE</span>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <TeamLogo name={game.awayFull} size={36}/>
          <span style={{color:"#111",fontWeight:800,fontSize:15}}>{game.away}</span>
        </div>
        <div style={{textAlign:"center"}}>
          <div style={{color:"#111",fontSize:22,fontWeight:900}}>{game.awayScore}-{game.homeScore}</div>
          <div style={{color:"#e67e00",fontSize:9,fontWeight:700}}>Q{game.quarter} {game.timeLeft}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{color:"#111",fontWeight:800,fontSize:15}}>{game.home}</span>
          <TeamLogo name={game.homeFull} size={36}/>
        </div>
      </div>
      {game.total&&(
        <>
          <div style={{height:3,background:"#e0e0e0",borderRadius:2,overflow:"hidden",marginBottom:9}}>
            <div style={{height:"100%",width:`${progress}%`,background:c,transition:"width 1s"}}/>
          </div>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
            <div style={{background:BGCOLORS[sig.type],border:`1px solid ${BORDERCOLORS[sig.type]}`,borderRadius:6,padding:"4px 9px",color:c,fontSize:11,fontWeight:800}}>{sig.label}</div>
            <div style={{display:"flex",alignItems:"center",gap:9}}>
              <div style={{textAlign:"right"}}>
                <div style={{color:"#aaa",fontSize:8}}>PROJ / LINE</div>
                <div style={{color:c,fontSize:14,fontWeight:900}}>{sig.projection} / {game.total}</div>
              </div>
              <Ring value={sig.confidence} color={c} size={46}/>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

function PreMatchCard({game}){
  const pred=getPreMatch(game);
  return(
    <div style={{background:"#ffffff",border:"1px solid #e0e0e0",borderRadius:13,padding:"15px 17px",boxShadow:"0 1px 6px #00000008"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <TeamLogo name={game.awayFull} size={36}/>
          <div>
            <div style={{color:"#111",fontWeight:800,fontSize:15}}>{game.away}</div>
            {pred?.awayB2B&&<div style={{color:"#cc3300",fontSize:8,fontWeight:700}}>B2B</div>}
          </div>
        </div>
        <div style={{textAlign:"center"}}>
          <div style={{color:"#111",fontSize:18,fontWeight:900}}>VS</div>
          <div style={{color:"#888",fontSize:10,fontWeight:700}}>{game.time}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{textAlign:"right"}}>
            <div style={{color:"#111",fontWeight:800,fontSize:15}}>{game.home}</div>
            {pred?.homeB2B&&<div style={{color:"#cc3300",fontSize:8,fontWeight:700}}>B2B</div>}
          </div>
          <TeamLogo name={game.homeFull} size={36}/>
        </div>
      </div>
      <div style={{background:"#f4f4f4",borderRadius:10,padding:"10px 12px"}}>
        {pred?(
          <>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:10}}>
              <div style={{textAlign:"center"}}>
                <div style={{color:"#777",fontSize:8}}>MOY {game.away}</div>
                <div style={{color:"#111",fontSize:16,fontWeight:800}}>{pred.awayPpg}</div>
                <div style={{color:"#aaa",fontSize:8}}>DEF {pred.awayOppg}</div>
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{color:"#777",fontSize:8}}>PROJECTION</div>
                <div style={{color:"#7c3aed",fontSize:20,fontWeight:900}}>{pred.proj}</div>
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{color:"#777",fontSize:8}}>MOY {game.home}</div>
                <div style={{color:"#111",fontSize:16,fontWeight:800}}>{pred.homePpg}</div>
                <div style={{color:"#aaa",fontSize:8}}>DEF {pred.homeOppg}</div>
              </div>
            </div>
            <div style={{background:"#ffffff",border:"1px solid #e0e0e0",borderRadius:8,padding:"8px 12px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{color:"#777",fontSize:8,marginBottom:4}}>SCORE PREVU</div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{textAlign:"center"}}>
                    <div style={{color:"#888",fontSize:8}}>{game.away}</div>
                    <div style={{color:pred.awayProjScore>pred.homeProjScore?"#007733":"#cc3300",fontSize:24,fontWeight:900,lineHeight:1}}>{pred.awayProjScore}</div>
                  </div>
                  <div style={{color:"#ccc",fontSize:16}}>-</div>
                  <div style={{textAlign:"center"}}>
                    <div style={{color:"#888",fontSize:8}}>{game.home}</div>
                    <div style={{color:pred.homeProjScore>pred.awayProjScore?"#007733":"#cc3300",fontSize:24,fontWeight:900,lineHeight:1}}>{pred.homeProjScore}</div>
                  </div>
                </div>
              </div>
              <div style={{background:"#00aa5515",border:"1px solid #00aa5530",borderRadius:6,padding:"4px 10px",color:"#007733",fontSize:11,fontWeight:900}}>
                {pred.winner} GAGNE
              </div>
            </div>
            {game.total&&(
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{fontSize:10,color:"#555",fontWeight:700}}>TOTAL: {game.total}</div>
                <div style={{background:pred.proj>game.total?"#00aa5515":"#ff330015",border:`1px solid ${pred.proj>game.total?"#00aa5530":"#ff330025"}`,borderRadius:6,padding:"3px 8px",color:pred.proj>game.total?"#007733":"#cc3300",fontSize:10,fontWeight:800}}>
                  {pred.proj>game.total?"OVER PREVU":"UNDER PREVU"}
                </div>
              </div>
            )}
          </>
        ):(
          <div style={{color:"#aaa",fontSize:9,textAlign:"center",padding:"8px 0"}}>Stats non disponibles</div>
        )}
      </div>
    </div>
  );
}

export default function App(){
  const[games,setGames]=useState([]);
  const[selectedId,setSelectedId]=useState(null);
  const[status,setStatus]=useState("loading");
  const[lastUpdate,setLastUpdate]=useState(null);

  const loadGames=async()=>{
    try{
      const res=await fetch(`${PROXY}/nba/scores`);
      const data=await res.json();
      if(!Array.isArray(data)) throw new Error("bad data");
      setGames(data);
      if(!selectedId&&data.length>0){
        setSelectedId((data.find(g=>g.isLive)||data[0]).id);
      }
      setLastUpdate(new Date().toLocaleTimeString("fr-CA",{timeZone:"America/Toronto"}));
      setStatus("ok");
    }catch(e){
      setStatus("error");
    }
  };

  useEffect(()=>{loadGames();const iv=setInterval(loadGames,30000);return()=>clearInterval(iv);},[]);

  const liveGames=games.filter(g=>g.isLive).sort((a,b)=>getSignal(b).confidence-getSignal(a).confidence);
  const scheduledGames=games.filter(g=>!g.isLive&&!g.isFinished);
  const selected=games.find(g=>g.id===selectedId);
  const sig=selected&&selected.isLive?getSignal(selected):{type:"SCHEDULED",label:"",edge:0,confidence:0,projection:0};
  const c=COLORS[sig.type];

  return(
    <div style={{minHeight:"100vh",background:"#f5f5f5",color:"#111",fontFamily:"monospace"}}>
      <div style={{borderBottom:"1px solid #e0e0e0",padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",background:"#ffffff",position:"sticky",top:0,zIndex:100,boxShadow:"0 1px 8px #00000010"}}>
        <span style={{background:"linear-gradient(135deg,#7c3aed,#00aa55)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",fontSize:16,fontWeight:900,letterSpacing:2}}>NBA BETTING SIGNALS</span>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {lastUpdate&&<span style={{color:"#aaa",fontSize:8}}>↻ {lastUpdate}</span>}
          {liveGames.length>0&&<span style={{background:"#cc000015",border:"1px solid #cc000030",borderRadius:4,padding:"3px 9px",color:"#cc0000",fontSize:9,fontWeight:700}}>{liveGames.length} LIVE</span>}
        </div>
      </div>

      {status==="loading"&&(
        <div style={{display:"flex",justifyContent:"center",alignItems:"center",height:"70vh",flexDirection:"column",gap:14}}>
          <div style={{color:"#aaa",fontSize:11,letterSpacing:2}}>Chargement des matchs...</div>
        </div>
      )}

      {status==="error"&&(
        <div style={{margin:20,background:"#fff5f5",border:"1px solid #cc000030",borderRadius:12,padding:"18px 22px"}}>
          <div style={{color:"#cc0000",fontSize:12,marginBottom:8,fontWeight:700}}>Impossible de charger les donnees</div>
          <button onClick={()=>{setStatus("loading");loadGames();}} style={{background:"#7c3aed15",border:"1px solid #7c3aed30",borderRadius:6,color:"#7c3aed",fontFamily:"monospace",fontSize:11,padding:"6px 14px",cursor:"pointer",fontWeight:700}}>Reessayer</button>
        </div>
      )}

      {status==="ok"&&(
        <div style={{padding:12,display:"flex",flexDirection:"column",gap:8}}>
          {liveGames.length>0&&(
            <>
              <div style={{color:"#cc0000",fontSize:8,letterSpacing:3,paddingLeft:3,fontWeight:700}}>MATCHS EN DIRECT</div>
              {liveGames.map(g=><LiveCard key={g.id} game={g} selected={selectedId===g.id} onSelect={setSelectedId}/>)}
            </>
          )}
          {selected&&selected.isLive&&selected.total&&(
            <div style={{background:"#ffffff",border:`1px solid ${BORDERCOLORS[sig.type]}`,borderRadius:15,padding:"16px 18px",boxShadow:"0 1px 8px #00000010"}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                <div>
                  <div style={{color:"#aaa",fontSize:9,letterSpacing:2,marginBottom:4}}>SIGNAL LIVE</div>
                  <div style={{color:c,fontSize:22,fontWeight:900}}>{sig.label}</div>
                  <div style={{color:"#555",fontSize:10,marginTop:2,fontWeight:700}}>{selected.awayFull} @ {selected.homeFull}</div>
                </div>
                <Ring value={sig.confidence} color={c} size={62}/>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
                {[
                  {label:"PROJETE",val:sig.projection,color:c},
                  {label:"LINE",val:selected.total,color:"#555"},
                  {label:"EDGE",val:`${sig.edge>0?"+":""}${sig.edge}`,color:sig.edge>3?"#007733":sig.edge<-3?"#cc3300":"#888"}
                ].map((m,i)=>(
                  <div key={i} style={{background:"#f4f4f4",border:"1px solid #e0e0e0",borderRadius:10,padding:"12px"}}>
                    <div style={{color:"#aaa",fontSize:8,marginBottom:3}}>{m.label}</div>
                    <div style={{color:m.color,fontSize:20,fontWeight:900}}>{m.val}</div>
                  </div>
                ))}
              </div>
              <div style={{background:"#f4f4f4",border:`1px solid ${BORDERCOLORS[sig.type]}`,borderRadius:10,padding:"14px"}}>
                <div style={{color:"#7c3aed",fontSize:12,fontWeight:800}}>
                  {sig.type==="STRONG_OVER"&&"BET OVER — forte conviction"}
                  {sig.type==="OVER"&&"OVER possible — conviction moyenne"}
                  {sig.type==="STRONG_UNDER"&&"BET UNDER — forte conviction"}
                  {sig.type==="UNDER"&&"UNDER possible — surveiller"}
                  {sig.type==="NEUTRAL"&&"Pas d'edge clair — attendre"}
                </div>
              </div>
            </div>
          )}
          {scheduledGames.length>0&&(
            <>
              <div style={{color:"#555",fontSize:8,letterSpacing:3,paddingLeft:3,fontWeight:700,marginTop:4}}>PREDICTIONS PRE-MATCH</div>
              {scheduledGames.map(g=><PreMatchCard key={g.id} game={g}/>)}
            </>
          )}
          {games.length===0&&<div style={{textAlign:"center",color:"#aaa",padding:40,fontSize:12}}>Aucun match NBA aujourd'hui</div>}
        </div>
      )}
    </div>
  );
}
