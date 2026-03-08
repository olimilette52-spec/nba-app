import { useState, useEffect } from "react";

const PROXY = "https://nba-proxy-v1bi.onrender.com";

const NBA_TEAM_IDS = {
  Hawks:1610612737,Celtics:1610612738,Nets:1610612751,Hornets:1610612766,
  Bulls:1610612741,Cavaliers:1610612739,Mavericks:1610612742,Nuggets:1610612743,
  Pistons:1610612765,Warriors:1610612744,Rockets:1610612745,Pacers:1610612754,
  Clippers:1610612746,Lakers:1610612747,Grizzlies:1610612763,Heat:1610612748,
  Bucks:1610612749,Timberwolves:1610612750,Pelicans:1610612740,Knicks:1610612752,
  Thunder:1610612760,Magic:1610612753,"76ers":1610612755,Suns:1610612756,
  "Trail Blazers":1610612757,Kings:1610612758,Spurs:1610612759,Raptors:1610612761,
  Jazz:1610612762,Wizards:1610612764
};

const NBA_STATS = {
  "Atlanta Hawks":{offRtg:112.4,defRtg:116.2,netRtg:-3.8,pace:100.2,eFG:52.1,tovPct:13.8,orebPct:24.6,ts:56.2,last10:[4,6,5,4,6,5,4,5,4,6],backToBack:false},
  "Boston Celtics":{offRtg:122.8,defRtg:108.4,netRtg:14.4,pace:98.6,eFG:58.9,tovPct:11.2,orebPct:26.8,ts:62.1,last10:[8,7,9,8,7,9,8,9,7,8],backToBack:false},
  "Brooklyn Nets":{offRtg:108.2,defRtg:118.6,netRtg:-10.4,pace:97.8,eFG:49.8,tovPct:14.6,orebPct:22.4,ts:53.8,last10:[3,4,3,4,3,4,3,4,3,4],backToBack:false},
  "Charlotte Hornets":{offRtg:109.6,defRtg:117.4,netRtg:-7.8,pace:101.4,eFG:50.8,tovPct:15.2,orebPct:23.8,ts:54.6,last10:[4,3,4,5,3,4,3,5,4,3],backToBack:false},
  "Chicago Bulls":{offRtg:111.8,defRtg:115.6,netRtg:-3.8,pace:98.4,eFG:51.6,tovPct:13.4,orebPct:23.2,ts:55.8,last10:[5,4,5,4,5,4,5,4,5,4],backToBack:false},
  "Cleveland Cavaliers":{offRtg:120.6,defRtg:108.8,netRtg:11.8,pace:96.8,eFG:57.2,tovPct:11.8,orebPct:25.4,ts:60.8,last10:[8,7,8,9,7,8,7,9,8,7],backToBack:false},
  "Dallas Mavericks":{offRtg:118.4,defRtg:112.6,netRtg:5.8,pace:99.2,eFG:55.8,tovPct:12.6,orebPct:24.8,ts:59.4,last10:[7,6,7,8,6,7,6,8,7,6],backToBack:false},
  "Denver Nuggets":{offRtg:119.2,defRtg:111.4,netRtg:7.8,pace:97.6,eFG:56.4,tovPct:12.2,orebPct:27.2,ts:60.2,last10:[7,8,6,7,8,6,7,8,7,6],backToBack:false},
  "Detroit Pistons":{offRtg:110.4,defRtg:116.8,netRtg:-6.4,pace:100.8,eFG:51.2,tovPct:14.8,orebPct:24.2,ts:54.8,last10:[4,5,4,5,4,5,4,5,4,5],backToBack:false},
  "Golden State Warriors":{offRtg:116.8,defRtg:113.2,netRtg:3.6,pace:100.4,eFG:54.6,tovPct:13.6,orebPct:24.4,ts:58.2,last10:[6,7,6,5,7,6,5,7,6,5],backToBack:false},
  "Houston Rockets":{offRtg:117.6,defRtg:110.8,netRtg:6.8,pace:101.2,eFG:55.2,tovPct:12.8,orebPct:28.4,ts:59.2,last10:[7,6,7,8,6,7,8,6,7,8],backToBack:false},
  "Indiana Pacers":{offRtg:121.4,defRtg:117.2,netRtg:4.2,pace:104.6,eFG:56.8,tovPct:13.2,orebPct:25.6,ts:60.4,last10:[7,8,6,7,8,6,7,6,8,7],backToBack:false},
  "LA Clippers":{offRtg:113.6,defRtg:113.8,netRtg:-0.2,pace:97.4,eFG:52.8,tovPct:12.4,orebPct:23.6,ts:56.8,last10:[5,6,5,6,5,6,5,6,5,6],backToBack:false},
  "Los Angeles Lakers":{offRtg:115.8,defRtg:112.4,netRtg:3.4,pace:99.6,eFG:53.8,tovPct:13.8,orebPct:26.2,ts:57.6,last10:[6,5,6,7,5,6,7,5,6,7],backToBack:false},
  "Memphis Grizzlies":{offRtg:111.2,defRtg:116.4,netRtg:-5.2,pace:99.8,eFG:51.8,tovPct:15.4,orebPct:27.8,ts:55.4,last10:[4,5,4,4,5,4,5,4,4,5],backToBack:false},
  "Miami Heat":{offRtg:112.6,defRtg:113.6,netRtg:-1.0,pace:96.2,eFG:52.4,tovPct:12.6,orebPct:23.4,ts:56.4,last10:[5,4,5,6,4,5,6,4,5,6],backToBack:false},
  "Milwaukee Bucks":{offRtg:116.4,defRtg:114.2,netRtg:2.2,pace:100.6,eFG:54.2,tovPct:13.4,orebPct:25.8,ts:58.4,last10:[6,5,6,7,5,6,5,7,6,5],backToBack:false},
  "Minnesota Timberwolves":{offRtg:114.8,defRtg:108.6,netRtg:6.2,pace:97.2,eFG:53.6,tovPct:12.8,orebPct:24.6,ts:57.8,last10:[6,7,6,5,7,6,7,5,6,7],backToBack:false},
  "New Orleans Pelicans":{offRtg:109.8,defRtg:116.6,netRtg:-6.8,pace:98.8,eFG:50.6,tovPct:14.2,orebPct:25.2,ts:54.2,last10:[4,3,4,5,3,4,3,5,4,3],backToBack:false},
  "New York Knicks":{offRtg:117.2,defRtg:110.6,netRtg:6.6,pace:95.8,eFG:55.4,tovPct:11.6,orebPct:24.8,ts:59.6,last10:[7,6,7,8,6,7,6,8,7,6],backToBack:false},
  "Oklahoma City Thunder":{offRtg:121.8,defRtg:106.4,netRtg:15.4,pace:99.4,eFG:57.6,tovPct:11.4,orebPct:26.4,ts:61.4,last10:[9,8,9,8,9,8,9,8,9,8],backToBack:false},
  "Orlando Magic":{offRtg:111.6,defRtg:108.2,netRtg:3.4,pace:96.4,eFG:52.2,tovPct:12.2,orebPct:26.8,ts:55.8,last10:[6,5,6,5,6,5,6,5,6,5],backToBack:false},
  "Philadelphia 76ers":{offRtg:110.8,defRtg:115.8,netRtg:-5.0,pace:98.2,eFG:51.4,tovPct:14.4,orebPct:24.4,ts:55.2,last10:[4,5,4,3,5,4,3,5,4,3],backToBack:false},
  "Phoenix Suns":{offRtg:113.2,defRtg:115.4,netRtg:-2.2,pace:99.0,eFG:52.6,tovPct:13.6,orebPct:23.8,ts:56.6,last10:[5,4,5,4,5,4,5,4,5,4],backToBack:false},
  "Portland Trail Blazers":{offRtg:108.6,defRtg:119.2,netRtg:-10.6,pace:100.6,eFG:49.4,tovPct:15.6,orebPct:22.8,ts:53.2,last10:[3,4,3,2,4,3,2,4,3,2],backToBack:false},
  "Sacramento Kings":{offRtg:116.2,defRtg:114.8,netRtg:1.4,pace:102.4,eFG:54.4,tovPct:13.0,orebPct:24.2,ts:58.0,last10:[6,5,6,5,6,5,6,5,6,5],backToBack:false},
  "San Antonio Spurs":{offRtg:107.8,defRtg:119.6,netRtg:-11.8,pace:99.6,eFG:49.2,tovPct:15.8,orebPct:23.6,ts:52.8,last10:[3,2,3,4,3,2,3,2,4,3],backToBack:false},
  "Toronto Raptors":{offRtg:109.2,defRtg:117.8,netRtg:-8.6,pace:97.8,eFG:50.4,tovPct:14.6,orebPct:23.4,ts:54.0,last10:[4,3,4,3,4,3,4,3,4,3],backToBack:false},
  "Utah Jazz":{offRtg:108.4,defRtg:120.2,netRtg:-11.8,pace:100.2,eFG:49.8,tovPct:15.2,orebPct:24.8,ts:53.4,last10:[3,4,3,2,4,3,2,3,4,3],backToBack:false},
  "Washington Wizards":{offRtg:106.8,defRtg:121.4,netRtg:-14.6,pace:99.4,eFG:48.6,tovPct:16.2,orebPct:22.6,ts:52.2,last10:[2,3,2,3,2,3,2,3,2,3],backToBack:false}
};
function getNBALogo(n){const k=Object.keys(NBA_TEAM_IDS).find(k=>n&&n.includes(k));const id=k?NBA_TEAM_IDS[k]:null;return id?`https://cdn.nba.com/logos/nba/${id}/global/L/logo.svg`:null;}
function toQcTime(iso){if(!iso)return"";return new Date(iso).toLocaleTimeString("fr-CA",{hour:"2-digit",minute:"2-digit",timeZone:"America/Toronto"});}

function getNBAAdvancedMatch(game){
  const hKey=Object.keys(NBA_STATS).find(k=>game.homeFull&&game.homeFull.includes(k.split(" ").pop()));
  const aKey=Object.keys(NBA_STATS).find(k=>game.awayFull&&game.awayFull.includes(k.split(" ").pop()));
  const h=hKey?NBA_STATS[hKey]:null;
  const a=aKey?NBA_STATS[aKey]:null;
  if(!h||!a)return null;

  const avgPace=(h.pace+a.pace)/2;

  // Calcul correct — OffRtg = points par 100 possessions
  // possessions par équipe = pace/2, score = offRtg * (pace/2) / 100
  let homeExp=h.offRtg*(avgPace/2)/100;
  let awayExp=a.offRtg*(avgPace/2)/100;

  // Ajustement défensif adversaire
  const LEAGUE_DEF=114.0;
  homeExp*=(LEAGUE_DEF/a.defRtg);
  awayExp*=(LEAGUE_DEF/h.defRtg);

  // Ajustement eFG%
  homeExp*=(1+(h.eFG-53.5)*0.004);
  awayExp*=(1+(a.eFG-53.5)*0.004);

  // Ajustement TOV%
  homeExp*=(1-(h.tovPct-13)*0.006);
  awayExp*=(1-(a.tovPct-13)*0.006);

  // Ajustement OREB%
  homeExp*=(1+(h.orebPct-25)*0.003);
  awayExp*=(1+(a.orebPct-25)*0.003);

  // Last 10 — forme récente
  const hRecent=h.last10.reduce((a,b)=>a+b,0)/h.last10.length;
  const aRecent=a.last10.reduce((a,b)=>a+b,0)/a.last10.length;
  const hRecentFactor=0.85+(hRecent/10)*0.30;
  const aRecentFactor=0.85+(aRecent/10)*0.30;
  homeExp=homeExp*0.80+homeExp*hRecentFactor*0.20;
  awayExp=awayExp*0.80+awayExp*aRecentFactor*0.20;

  // Avantage domicile
  homeExp+=2.4;

  // Back-to-back
  if(h.backToBack)homeExp-=3.5;
  if(a.backToBack)awayExp-=3.5;

  const proj=+(homeExp+awayExp).toFixed(1);
  const ratio=homeExp/(homeExp+awayExp);
  const homeProjScore=Math.round(homeExp);
  const awayProjScore=Math.round(awayExp);
  const homePct=Math.round(ratio*100);
  const awayPct=100-homePct;
  const winner=homeProjScore>=awayProjScore?game.home:game.away;

  let spreadCover=null;
  if(game.spread!=null&&game.spreadTeam){
    const favHome=game.home===game.spreadTeam||(game.homeFull&&game.homeFull.includes(game.spreadTeam));
    const diff=homeProjScore-awayProjScore;
    if(favHome){spreadCover=diff>=Math.abs(game.spread)?{team:game.home,spread:-Math.abs(game.spread)}:{team:game.away,spread:+Math.abs(game.spread)};}
    else{spreadCover=(-diff)>=Math.abs(game.spread)?{team:game.away,spread:-Math.abs(game.spread)}:{team:game.home,spread:+Math.abs(game.spread)};}
  }

  let ouSignal=null;
  if(game.total){
    const edge=+(proj-game.total).toFixed(1);
    const absEdge=Math.abs(edge);
    let type,label;
    if(edge>8){type="STRONG_OVER";label="STRONG OVER";}
    else if(edge>3){type="OVER";label="OVER";}
    else if(edge<-8){type="STRONG_UNDER";label="STRONG UNDER";}
    else if(edge<-3){type="UNDER";label="UNDER";}
    else{type="NEUTRAL";label="NEUTRE";}
    const conf=Math.min(92,Math.round(45+absEdge*3.2+(Math.abs(h.netRtg-a.netRtg)*0.8)));
    ouSignal={type,label,edge,proj,conf};
  }

  return{proj,homeProjScore,awayProjScore,homePct,awayPct,winner,spreadCover,ouSignal,
    homeB2B:h.backToBack,awayB2B:a.backToBack,
    homePace:h.pace,awayPace:a.pace,avgPace,
    homeNetRtg:h.netRtg,awayNetRtg:a.netRtg,
    homeEfg:h.eFG,awayEfg:a.eFG,
    homeTs:h.ts,awayTs:a.ts,
    homeTov:h.tovPct,awayTov:a.tovPct};
}

const Q=12,TOTAL_MIN=48;
function pt(t){if(!t||t==="0:00")return 0;const[m,s]=String(t).split(":").map(Number);return(m||0)+(s||0)/60;}
function playedMin(q,tl){return(q-1)*Q+(Q-pt(tl));}
function remainingMin(q,tl){return Math.max(0,TOTAL_MIN-playedMin(q,tl));}
function qMult(q,tl){const r=pt(tl);if(q===4&&r<2)return 0.65;if(q===4&&r<4)return 0.78;if(q===4)return 0.90;return 1.0;}

function getLiveSignalNBA(game){
  if(!game.isLive||!game.total||(!game.homeScore&&!game.awayScore))return{type:"SCHEDULED",label:"A VENIR",edge:0,confidence:0,projection:0};
  const scored=game.homeScore+game.awayScore;
  const p=playedMin(game.quarter,game.timeLeft);
  const r=remainingMin(game.quarter,game.timeLeft);
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

function NBALogo({name,size=32}){
  const url=getNBALogo(name);
  if(!url)return <span style={{fontSize:size*0.7}}>🏀</span>;
  return <img src={url} alt={name} style={{width:size,height:size,objectFit:"contain"}} onError={e=>e.target.style.display="none"}/>;
}
export default function App(){
  const[nbaGames,setNbaGames]=useState([]);
  const[now,setNow]=useState(new Date());
  const[loading,setLoading]=useState(true);

  useEffect(()=>{
    const t=setInterval(()=>setNow(new Date()),1000);
    return()=>clearInterval(t);
  },[]);

  async function fetchAll(){
    try{
      const res=await fetch(`${PROXY}/nba/scores`);
      const scores=await res.json();
      setNbaGames(Array.isArray(scores)?scores:[]);
    }catch(e){console.error(e);}
    finally{setLoading(false);}
  }

  useEffect(()=>{fetchAll();const t=setInterval(fetchAll,30000);return()=>clearInterval(t);},[]);

  const liveNBA=nbaGames.filter(g=>g.isLive);
  const upcomingNBA=nbaGames.filter(g=>!g.isLive&&!g.isFinished);
  const timeStr=now.toLocaleTimeString("fr-CA",{hour:"2-digit",minute:"2-digit",second:"2-digit",timeZone:"America/Toronto"});

  return(
    <div style={{background:"#f5f5f5",minHeight:"100vh",fontFamily:"monospace",maxWidth:430,margin:"0 auto",paddingBottom:40}}>
      <div style={{background:"#fff",borderBottom:"1px solid #e0e0e0",padding:"14px 16px 10px",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{fontSize:16,fontWeight:900,letterSpacing:2}}>
            <span style={{color:"#e87722"}}>NBA</span>
            <span style={{color:"#333"}}> SIGNALS</span>
          </div>
          <div style={{color:"#aaa",fontSize:10}}>⏱ {timeStr}</div>
        </div>
      </div>
      <div style={{padding:"12px 12px 0"}}>
        {loading&&<div style={{textAlign:"center",color:"#aaa",padding:40,fontSize:12}}>Chargement...</div>}
        {!loading&&(
          <>
            {liveNBA.length>0&&(
              <>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
                  <div style={{width:7,height:7,borderRadius:"50%",background:"#cc0000"}}/>
                  <span style={{color:"#cc0000",fontSize:10,letterSpacing:2,fontWeight:700}}>MATCHS EN DIRECT</span>
                </div>
                {liveNBA.map((g,i)=>{
                  const sig=getLiveSignalNBA(g);
                  const color=COLORS[sig.type];
                  const bg=BGCOLORS[sig.type];
                  const border=BORDERCOLORS[sig.type];
                  const progPct=Math.min(100,(playedMin(g.quarter,g.timeLeft)/TOTAL_MIN)*100);
                  return(
                    <div key={i} style={{background:"#fff",border:"1px solid #e0e0e0",borderRadius:13,padding:"14px 15px",marginBottom:10,boxShadow:"0 1px 6px #00000008"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                        <div style={{display:"flex",alignItems:"center",gap:5}}>
                          <div style={{width:6,height:6,borderRadius:"50%",background:"#cc0000"}}/>
                          <span style={{color:"#cc0000",fontSize:8,fontWeight:700}}>LIVE</span>
                        </div>
                        <span style={{color:"#e87722",fontSize:9,fontWeight:700}}>Q{g.quarter} {g.timeLeft}</span>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <NBALogo name={g.awayFull||g.away} size={32}/>
                          <span style={{color:"#111",fontWeight:800,fontSize:14}}>{g.away}</span>
                        </div>
                        <div style={{textAlign:"center"}}>
                          <div style={{color:"#111",fontSize:26,fontWeight:900,letterSpacing:2}}>{g.awayScore} - {g.homeScore}</div>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <span style={{color:"#111",fontWeight:800,fontSize:14}}>{g.home}</span>
                          <NBALogo name={g.homeFull||g.home} size={32}/>
                        </div>
                      </div>
                      <div style={{height:3,background:"#e0e0e0",borderRadius:2,overflow:"hidden",marginBottom:10}}>
                        <div style={{height:"100%",width:`${progPct}%`,background:"#e87722",transition:"width 1s"}}/>
                      </div>
                      <div style={{background:bg,border:`1px solid ${border}`,borderRadius:10,padding:"10px 12px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                        <div>
                          <div style={{color:color,fontSize:13,fontWeight:900,marginBottom:2}}>{sig.label}</div>
                          {sig.projection>0&&<div style={{color:"#888",fontSize:9}}>Proj: {sig.projection} | Ligne: {g.total} | Edge: {sig.edge>0?"+":""}{sig.edge}</div>}
                        </div>
                        <Ring value={sig.confidence} color={color} size={52}/>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
            {upcomingNBA.length>0&&(
              <>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8,marginTop:liveNBA.length>0?12:0}}>
                  <span style={{fontSize:10}}>📊</span>
                  <span style={{color:"#e87722",fontSize:10,letterSpacing:2,fontWeight:700}}>PREDICTIONS PRE-MATCH</span>
                </div>
                {upcomingNBA.map((g,i)=>{
                  const pm=getNBAAdvancedMatch(g);
                  if(!pm)return null;
                  const ouColor=pm.ouSignal?(pm.ouSignal.type==="STRONG_OVER"||pm.ouSignal.type==="OVER")?"#009944":"#cc3300":"#888";
                  return(
                    <div key={i} style={{background:"#fff",border:"1px solid #e0e0e0",borderRadius:13,padding:"14px 15px",marginBottom:10,boxShadow:"0 1px 6px #00000008"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <NBALogo name={g.awayFull||g.away} size={34}/>
                          <div>
                            <div style={{color:"#111",fontWeight:800,fontSize:14}}>{g.away}</div>
                            {pm.awayB2B&&<div style={{color:"#cc3300",fontSize:8,fontWeight:700}}>B2B</div>}
                          </div>
                        </div>
                        <div style={{textAlign:"center"}}>
                          <div style={{color:"#111",fontSize:13,fontWeight:900}}>VS</div>
                          <div style={{color:"#888",fontSize:9}}>{toQcTime(g.time)+" HE"}</div>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:8,flexDirection:"row-reverse"}}>
                          <NBALogo name={g.homeFull||g.home} size={34}/>
                          <div style={{textAlign:"right"}}>
                            <div style={{color:"#111",fontWeight:800,fontSize:14}}>{g.home}</div>
                            {pm.homeB2B&&<div style={{color:"#cc3300",fontSize:8,fontWeight:700}}>B2B</div>}
                          </div>
                        </div>
                      </div>
                      <div style={{background:"#f4f4f4",borderRadius:10,padding:"11px 12px",marginBottom:8}}>
                        <div style={{color:"#aaa",fontSize:8,letterSpacing:1,marginBottom:8,fontWeight:700}}>SCORE PRÉDIT / VICTOIRE</div>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                          <div>
                            <div style={{color:"#888",fontSize:9,marginBottom:2}}>{g.away}</div>
                            <div style={{color:"#e87722",fontSize:28,fontWeight:900,lineHeight:1}}>{pm.awayProjScore}</div>
                          </div>
                          <div style={{height:8,flex:1,margin:"0 10px",borderRadius:4,overflow:"hidden",display:"flex",alignSelf:"center"}}>
                            <div style={{width:`${pm.awayPct}%`,background:pm.awayPct>pm.homePct?"#e87722":"#cc3300",borderRadius:"4px 0 0 4px"}}/>
                            <div style={{width:`${pm.homePct}%`,background:pm.homePct>pm.awayPct?"#e87722":"#cc3300",borderRadius:"0 4px 4px 0"}}/>
                          </div>
                          <div style={{textAlign:"right"}}>
                            <div style={{color:"#888",fontSize:9,marginBottom:2}}>{g.home}</div>
                            <div style={{color:"#e87722",fontSize:28,fontWeight:900,lineHeight:1}}>{pm.homeProjScore}</div>
                          </div>
                        </div>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                          <div style={{background:"#fff",borderRadius:8,padding:"4px 10px",border:"1px solid #e0e0e0"}}>
                            <div style={{color:"#aaa",fontSize:7}}>CHANCE</div>
                            <div style={{color:pm.awayPct>pm.homePct?"#e87722":"#cc3300",fontSize:13,fontWeight:900}}>{pm.awayPct}%</div>
                          </div>
                          {pm.winner&&<div style={{background:"#e8730015",border:"1px solid #e8730030",borderRadius:8,padding:"4px 10px"}}>
                            <div style={{color:"#e87722",fontSize:11,fontWeight:900}}>🏆 {pm.winner}</div>
                          </div>}
                          <div style={{background:"#fff",borderRadius:8,padding:"4px 10px",border:"1px solid #e0e0e0"}}>
                            <div style={{color:"#aaa",fontSize:7}}>CHANCE</div>
                            <div style={{color:pm.homePct>pm.awayPct?"#e87722":"#cc3300",fontSize:13,fontWeight:900}}>{pm.homePct}%</div>
                          </div>
                        </div>
                      </div>
                      <div style={{background:"#f4f4f4",borderRadius:10,padding:"10px 12px",marginBottom:8}}>
                        <div style={{color:"#aaa",fontSize:8,letterSpacing:1,marginBottom:8,fontWeight:700}}>STATS AVANCÉES</div>
                        <div style={{display:"flex",justifyContent:"space-between",gap:4}}>
                          {[
                            {label:"NET RTG",away:pm.awayNetRtg,home:pm.homeNetRtg,fmt:v=>v>0?`+${v}`:v,good:"high"},
                            {label:"PACE",away:pm.awayPace,home:pm.homePace,fmt:v=>v,good:"high"},
                            {label:"eFG%",away:pm.awayEfg,home:pm.homeEfg,fmt:v=>v,good:"high"},
                            {label:"TS%",away:pm.awayTs,home:pm.homeTs,fmt:v=>v,good:"high"},
                            {label:"TOV%",away:pm.awayTov,home:pm.homeTov,fmt:v=>v,good:"low"},
                          ].map((s,j)=>(
                            <div key={j} style={{flex:1,background:"#fff",borderRadius:7,padding:"5px 3px",textAlign:"center",border:"1px solid #e0e0e0"}}>
                              <div style={{color:"#aaa",fontSize:6,marginBottom:3,fontWeight:700}}>{s.label}</div>
                              <div style={{color:s.good==="high"?(s.away>s.home?"#007733":"#cc3300"):(s.away<s.home?"#007733":"#cc3300"),fontSize:9,fontWeight:800}}>{s.fmt(s.away)}</div>
                              <div style={{color:"#ddd",fontSize:7}}>vs</div>
                              <div style={{color:s.good==="high"?(s.home>s.away?"#007733":"#cc3300"):(s.home<s.away?"#007733":"#cc3300"),fontSize:9,fontWeight:800}}>{s.fmt(s.home)}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div style={{display:"flex",gap:8}}>
                        {pm.spreadCover&&<div style={{flex:1,background:"#00aa5510",border:"1px solid #00aa5525",borderRadius:8,padding:"6px 8px",textAlign:"center"}}>
                          <div style={{color:"#aaa",fontSize:7,marginBottom:2}}>SPREAD PICK</div>
                          <div style={{color:"#007733",fontSize:12,fontWeight:900}}>{pm.spreadCover.team} {pm.spreadCover.spread>0?"+":""}{pm.spreadCover.spread}</div>
                        </div>}
                        {pm.ouSignal&&g.total&&<div style={{flex:1,background:`${ouColor}10`,border:`1px solid ${ouColor}25`,borderRadius:8,padding:"6px 8px",textAlign:"center"}}>
                          <div style={{color:"#aaa",fontSize:7,marginBottom:2}}>TOTAL PICK</div>
                          <div style={{color:ouColor,fontSize:12,fontWeight:900}}>{pm.ouSignal.label} {g.total}</div>
                          <div style={{color:"#aaa",fontSize:7}}>Proj {pm.ouSignal.proj}</div>
                        </div>}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
            {!loading&&liveNBA.length===0&&upcomingNBA.length===0&&<div style={{textAlign:"center",color:"#aaa",padding:40,fontSize:12}}>Aucun match NBA aujourd'hui</div>}
          </>
        )}
      </div>
    </div>
  );
}
