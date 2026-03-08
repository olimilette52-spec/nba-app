import { useState, useEffect } from "react";

const PROXY = "https://nba-proxy-production.up.railway.app";

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

const NHL_ABBRS = {
  "Anaheim Ducks":"ANA","Arizona Coyotes":"ARI","Boston Bruins":"BOS","Buffalo Sabres":"BUF",
  "Calgary Flames":"CGY","Carolina Hurricanes":"CAR","Chicago Blackhawks":"CHI","Colorado Avalanche":"COL",
  "Columbus Blue Jackets":"CBJ","Dallas Stars":"DAL","Detroit Red Wings":"DET","Edmonton Oilers":"EDM",
  "Florida Panthers":"FLA","Los Angeles Kings":"LAK","Minnesota Wild":"MIN","Montréal Canadiens":"MTL",
  "Montreal Canadiens":"MTL","Nashville Predators":"NSH","New Jersey Devils":"NJD","New York Islanders":"NYI",
  "New York Rangers":"NYR","Ottawa Senators":"OTT","Philadelphia Flyers":"PHI","Pittsburgh Penguins":"PIT",
  "San Jose Sharks":"SJS","Seattle Kraken":"SEA","St. Louis Blues":"STL","Tampa Bay Lightning":"TBL",
  "Toronto Maple Leafs":"TOR","Vancouver Canucks":"VAN","Vegas Golden Knights":"VGK",
  "Washington Capitals":"WSH","Winnipeg Jets":"WPG",
  "TB":"TBL","NJ":"NJD","LA":"LAK","SJ":"SJS","VGS":"VGK","CLB":"CBJ"
};

const NHL_TEAM_COLORS = {
  ANA:"#F47A38",ARI:"#8C2633",BOS:"#FFB81C",BUF:"#003087",CGY:"#C8102E",
  CAR:"#CC0000",CHI:"#CF0A2C",COL:"#6F263D",CBJ:"#002654",DAL:"#006847",
  DET:"#CE1126",EDM:"#FF4C00",FLA:"#C8102E",LAK:"#111111",MIN:"#154734",
  MTL:"#AF1E2D",NSH:"#FFB81C",NJD:"#CE1126",NYI:"#00539B",NYR:"#0038A8",
  OTT:"#C52032",PHI:"#F74902",PIT:"#FCB514",SJS:"#006D75",SEA:"#99D9D9",
  STL:"#002F87",TBL:"#002868",TOR:"#003E7E",VAN:"#00843D",VGK:"#B4975A",
  WSH:"#C8102E",WPG:"#004C97"
};

const NHL_STATS = {
  ANA:{gf:2.4,ga:3.5,pp:17.2,pk:76.4,cf:47.2,xgf:46.8,pdo:97.2,hdcf:47.1,svPct:89.2,last10:[3,4,3,5,2,4,3,2,4,3]},
  BOS:{gf:3.4,ga:2.6,pp:22.4,pk:82.1,cf:54.1,xgf:55.2,pdo:101.8,hdcf:55.8,svPct:91.8,last10:[7,6,6,8,5,7,6,7,5,8]},
  BUF:{gf:2.9,ga:3.1,pp:19.8,pk:78.6,cf:49.4,xgf:48.9,pdo:99.1,hdcf:49.2,svPct:90.1,last10:[5,4,5,6,4,5,4,5,6,4]},
  CGY:{gf:2.8,ga:3.0,pp:20.1,pk:79.2,cf:50.2,xgf:49.8,pdo:99.4,hdcf:50.1,svPct:90.4,last10:[5,4,5,4,5,4,5,4,5,4]},
  CAR:{gf:3.2,ga:2.5,pp:21.8,pk:83.4,cf:55.6,xgf:56.1,pdo:102.4,hdcf:56.2,svPct:92.4,last10:[7,6,7,8,6,7,6,8,7,6]},
  CHI:{gf:2.3,ga:3.6,pp:16.8,pk:75.2,cf:45.8,xgf:44.9,pdo:96.8,hdcf:45.2,svPct:88.8,last10:[3,2,3,4,3,2,3,2,4,3]},
  COL:{gf:3.6,ga:2.8,pp:24.2,pk:81.6,cf:53.8,xgf:54.4,pdo:101.2,hdcf:54.6,svPct:91.2,last10:[7,8,6,7,8,6,7,8,7,6]},
  CBJ:{gf:2.5,ga:3.4,pp:18.4,pk:77.1,cf:46.9,xgf:46.2,pdo:97.6,hdcf:46.8,svPct:89.6,last10:[4,3,4,3,4,3,4,3,4,3]},
  DAL:{gf:3.3,ga:2.4,pp:23.1,pk:84.2,cf:56.2,xgf:57.0,pdo:103.1,hdcf:57.1,svPct:92.1,last10:[7,8,7,6,8,7,8,7,6,8]},
  DET:{gf:2.7,ga:3.2,pp:19.2,pk:78.0,cf:48.6,xgf:48.1,pdo:98.4,hdcf:48.4,svPct:90.4,last10:[4,5,4,5,4,5,4,5,4,5]},
  EDM:{gf:3.5,ga:3.1,pp:26.4,pk:79.2,cf:52.4,xgf:53.1,pdo:100.6,hdcf:53.2,svPct:90.6,last10:[6,7,6,8,6,7,6,7,6,7]},
  FLA:{gf:3.4,ga:2.7,pp:22.8,pk:82.6,cf:54.8,xgf:55.6,pdo:102.1,hdcf:55.9,svPct:92.1,last10:[7,6,7,8,6,7,8,6,7,8]},
  LAK:{gf:3.1,ga:2.6,pp:20.4,pk:81.8,cf:53.2,xgf:53.8,pdo:101.4,hdcf:54.0,svPct:91.4,last10:[6,5,6,7,5,6,7,5,6,7]},
  MIN:{gf:3.0,ga:2.8,pp:20.8,pk:80.4,cf:51.6,xgf:51.2,pdo:100.2,hdcf:51.4,svPct:90.2,last10:[5,6,5,6,5,6,5,6,5,6]},
  MTL:{gf:2.6,ga:3.3,pp:18.8,pk:77.8,cf:47.4,xgf:47.0,pdo:98.0,hdcf:47.2,svPct:89.0,last10:[4,3,4,5,3,4,3,5,4,3]},
  NSH:{gf:2.7,ga:3.1,pp:19.4,pk:78.4,cf:48.8,xgf:48.4,pdo:98.6,hdcf:48.6,svPct:90.6,last10:[4,5,4,4,5,4,5,4,4,5]},
  NJD:{gf:2.8,ga:2.9,pp:20.2,pk:80.2,cf:50.8,xgf:50.4,pdo:99.8,hdcf:50.6,svPct:90.8,last10:[5,4,5,6,4,5,6,4,5,6]},
  NYI:{gf:2.6,ga:2.9,pp:18.6,pk:80.8,cf:49.8,xgf:49.4,pdo:99.2,hdcf:49.6,svPct:90.2,last10:[4,5,4,5,4,5,4,5,4,5]},
  NYR:{gf:3.3,ga:2.6,pp:22.6,pk:82.6,cf:54.4,xgf:55.0,pdo:102.2,hdcf:55.2,svPct:92.2,last10:[7,6,7,8,6,7,6,8,7,6]},
  OTT:{gf:3.0,ga:3.0,pp:21.2,pk:79.8,cf:50.6,xgf:50.2,pdo:100.0,hdcf:50.4,svPct:90.0,last10:[5,6,5,4,6,5,4,6,5,4]},
  PHI:{gf:2.8,ga:3.2,pp:19.6,pk:78.2,cf:48.2,xgf:47.8,pdo:98.2,hdcf:48.0,svPct:89.2,last10:[4,5,4,3,5,4,3,5,4,3]},
  PIT:{gf:2.9,ga:3.1,pp:20.6,pk:79.4,cf:49.6,xgf:49.2,pdo:99.0,hdcf:49.4,svPct:90.0,last10:[5,4,5,6,4,5,4,6,5,4]},
  SJS:{gf:2.2,ga:3.8,pp:15.8,pk:74.4,cf:44.6,xgf:43.8,pdo:96.2,hdcf:44.0,svPct:88.2,last10:[3,2,3,2,3,2,3,2,3,2]},
  SEA:{gf:2.8,ga:2.9,pp:20.0,pk:80.6,cf:51.0,xgf:50.8,pdo:99.6,hdcf:51.0,svPct:90.6,last10:[5,4,5,6,4,5,6,4,5,6]},
  STL:{gf:2.9,ga:2.9,pp:20.4,pk:80.0,cf:50.4,xgf:50.0,pdo:99.8,hdcf:50.2,svPct:90.8,last10:[5,4,5,4,6,5,4,5,6,5]},
  TBL:{gf:3.2,ga:2.7,pp:22.0,pk:81.4,cf:53.6,xgf:54.2,pdo:101.6,hdcf:54.4,svPct:91.6,last10:[6,7,6,7,6,7,6,7,6,7]},
  TOR:{gf:3.3,ga:3.0,pp:22.0,pk:80.4,cf:52.8,xgf:53.4,pdo:100.8,hdcf:53.6,svPct:90.8,last10:[6,7,6,5,7,6,5,7,6,5]},
  VAN:{gf:3.1,ga:2.8,pp:21.6,pk:81.2,cf:52.6,xgf:52.2,pdo:100.4,hdcf:52.4,svPct:91.4,last10:[5,6,7,5,6,7,5,6,7,5]},
  VGK:{gf:3.2,ga:2.6,pp:22.2,pk:82.4,cf:54.2,xgf:54.8,pdo:101.8,hdcf:55.0,svPct:91.8,last10:[7,6,7,6,7,6,7,6,7,6]},
  WSH:{gf:3.0,ga:2.9,pp:21.0,pk:80.8,cf:51.4,xgf:51.0,pdo:100.2,hdcf:51.2,svPct:90.2,last10:[6,5,6,5,6,5,6,5,6,5]},
  WPG:{gf:3.2,ga:2.7,pp:22.4,pk:82.0,cf:53.4,xgf:53.6,pdo:101.4,hdcf:53.8,svPct:91.4,last10:[6,7,6,7,6,7,6,7,6,7]},
  ARI:{gf:2.4,ga:3.4,pp:17.8,pk:76.8,cf:46.4,xgf:45.8,pdo:97.4,hdcf:46.2,svPct:89.4,last10:[3,4,3,4,3,4,3,4,3,4]}
};
function getNBALogo(n){const k=Object.keys(NBA_TEAM_IDS).find(k=>n&&n.includes(k));const id=k?NBA_TEAM_IDS[k]:null;return id?`https://cdn.nba.com/logos/nba/${id}/global/L/logo.svg`:null;}
function getNHLAbbr(name){if(!name)return"???";if(name.length<=3)return name.toUpperCase();return NHL_ABBRS[name]||name.split(" ").pop().substring(0,3).toUpperCase();}
function getNHLLogo(name){const abbr=getNHLAbbr(name);return`https://assets.nhle.com/logos/nhl/svg/${abbr}_light.svg`;}
function getNHLColor(abbr){return NHL_TEAM_COLORS[abbr]||"#0066cc";}
function toQcTime(iso){if(!iso)return"";return new Date(iso).toLocaleTimeString("fr-CA",{hour:"2-digit",minute:"2-digit",timeZone:"America/Toronto"});}

function getNHLWinner(awayAbbr,homeAbbr,awayB2B=false,homeB2B=false){
  const a=NHL_STATS[awayAbbr],h=NHL_STATS[homeAbbr];
  if(!a||!h)return null;
  const LEAGUE=3.05;
  const hGF=h.gf*0.7+LEAGUE*0.3,hGA=h.ga*0.7+LEAGUE*0.3;
  const aGF=a.gf*0.7+LEAGUE*0.3,aGA=a.ga*0.7+LEAGUE*0.3;
  let hs=0,as=0;
  hs+=h.cf*0.25;as+=a.cf*0.25;
  hs+=h.xgf*0.30;as+=a.xgf*0.30;
  hs+=h.hdcf*0.15;as+=a.hdcf*0.15;
  hs+=(h.pdo-97)*0.10;as+=(a.pdo-97)*0.10;
  hs+=(h.pp*0.5+(100-a.pk)*0.5)*0.10;as+=(a.pp*0.5+(100-h.pk)*0.5)*0.10;
  hs+=(hGF/hGA)*5*0.05;as+=(aGF/aGA)*5*0.05;
  const hr=h.last10.reduce((a,b)=>a+b,0)/h.last10.length;
  const ar=a.last10.reduce((a,b)=>a+b,0)/a.last10.length;
  hs+=hr*0.10;as+=ar*0.10;
  hs+=h.svPct*0.05;as+=a.svPct*0.05;
  hs+=1.5;
  if(homeB2B)hs-=2.0;
  if(awayB2B)as-=2.0;
  const total=hs+as;
  const homePct=Math.round((hs/total)*100);
  const awayPct=100-homePct;
  return{homePct,awayPct,winner:homePct>=awayPct?homeAbbr:awayAbbr};
}

function getLiveWinProb(homeScore,awayScore,period,timeLeft,baseHomePct){
  const TOTAL=60,PM=20;
  const[m,s]=(timeLeft||"20:00").split(":").map(Number);
  const minLeft=m+s/60;
  const played=(period-1)*PM+(PM-minLeft);
  const pctPlayed=Math.min(1,played/TOTAL);
  const scoreDiff=homeScore-awayScore;
  const scoreWeight=pctPlayed*0.85;
  const baseWeight=1-scoreWeight;
  let scoreProb=50;
  if(scoreDiff>0)scoreProb=50+Math.min(45,scoreDiff*15*pctPlayed);
  if(scoreDiff<0)scoreProb=50+Math.max(-45,scoreDiff*15*pctPlayed);
  const blended=scoreProb*scoreWeight+baseHomePct*baseWeight;
  return Math.min(97,Math.max(3,Math.round(blended)));
}

const Q=12,TOTAL_MIN=48;
function pt(t){if(!t||t==="0:00")return 0;const[m,s]=String(t).split(":").map(Number);return(m||0)+(s||0)/60;}
function played(q,tl){return(q-1)*Q+(Q-pt(tl));}
function remaining(q,tl){return Math.max(0,TOTAL_MIN-played(q,tl));}
function qMult(q,tl){const r=pt(tl);if(q===4&&r<2)return 0.65;if(q===4&&r<4)return 0.78;if(q===4)return 0.90;return 1.0;}

function getLiveSignalNBA(game){
  if(!game.isLive||!game.total||(!game.homeScore&&!game.awayScore))return{type:"SCHEDULED",label:"🕐 À VENIR",edge:0,confidence:0,projection:0};
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
  else{type="NEUTRAL";label:"⚖️ NEUTRE";}
  return{type,label,edge,confidence:conf,projection:proj};
}

function getNBAPreMatch(game,teamStats){
  if(!teamStats)return null;
  const hKey=Object.keys(teamStats).find(k=>game.homeFull&&(game.homeFull.includes(k)||k===game.home));
  const aKey=Object.keys(teamStats).find(k=>game.awayFull&&(game.awayFull.includes(k)||k===game.away));
  const hS=hKey?teamStats[hKey]:null;
  const aS=aKey?teamStats[aKey]:null;
  if(!hS?.ppg||!aS?.ppg)return null;
  let homeExp=(hS.ppg+aS.oppg)/2+1.6;
  let awayExp=(aS.ppg+hS.oppg)/2;
  if(hS.pace&&aS.pace){const avg=(hS.pace+aS.pace)/2;homeExp+=(avg-98.5)*0.4;awayExp+=(avg-98.5)*0.4;}
  if(hS.recentPts&&aS.recentPts){homeExp=homeExp*0.65+(hS.recentPts)*0.35;awayExp=awayExp*0.65+(aS.recentPts)*0.35;}
  if(hS.backToBack)homeExp-=3.5;
  if(aS.backToBack)awayExp-=3.5;
  const proj=+(homeExp+awayExp).toFixed(1);
  const ratio=homeExp/(homeExp+awayExp);
  const homeProjScore=Math.round(proj*ratio);
  const awayProjScore=Math.round(proj-homeProjScore);
  const homePct=Math.round(ratio*100);
  const awayPct=100-homePct;
  const winner=homeProjScore>awayProjScore?game.home:awayProjScore>homeProjScore?game.away:null;
  let spreadCover=null;
  if(game.spread!=null&&game.spreadTeam){
    const favHome=game.home===game.spreadTeam||game.homeFull.includes(game.spreadTeam);
    const diff=homeProjScore-awayProjScore;
    if(favHome){spreadCover=diff>=Math.abs(game.spread)?{team:game.home,spread:-Math.abs(game.spread)}:{team:game.away,spread:+Math.abs(game.spread)};}
    else{spreadCover=(-diff)>=Math.abs(game.spread)?{team:game.away,spread:-Math.abs(game.spread)}:{team:game.home,spread:+Math.abs(game.spread)};}
  }
  return{proj,homeProjScore,awayProjScore,homeB2B:hS.backToBack,awayB2B:aS.backToBack,spreadCover,winner,homePct,awayPct};
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
      <text x={size/2} y={size/2} textAnchor="middle" dominantBaseline="central" fill={color} fontSize={size<60?11:13} fontWeight={900} fontFamily="monospace" style={{transform:"rotate(90deg)",transformOrigin:`${size/2}px ${size/2}px`}}>{value>0?`${value}%`:"—"}</text>
    </svg>
  );
}

function NBALogo({name,size=32}){
  const url=getNBALogo(name);
  if(!url)return<span style={{fontSize:size*0.7}}>🏀</span>;
  return<img src={url} alt={name} style={{width:size,height:size,objectFit:"contain"}} onError={e=>e.target.style.display='none'}/>;
}
function NHLLogo({name,size=32}){
  return<img src={getNHLLogo(name)} alt={name} style={{width:size,height:size,objectFit:"contain"}} onError={e=>e.target.style.display='none'}/>;
}
export default function App(){
  const[tab,setTab]=useState("nba");
  const[nbaGames,setNbaGames]=useState([]);
  const[nhlGames,setNhlGames]=useState([]);
  const[teamStats,setTeamStats]=useState(null);
  const[now,setNow]=useState(new Date());
  const[loading,setLoading]=useState(true);

  useEffect(()=>{
    const t=setInterval(()=>setNow(new Date()),1000);
    return()=>clearInterval(t);
  },[]);

  async function fetchAll(){
    try{
      const[scoresRes,statsRes,nhlRes]=await Promise.all([
        fetch(`${PROXY}/nba/scores`),
        fetch(`${PROXY}/nba/stats`),
        fetch(`${PROXY}/nhl/scores`)
      ]);
      const scores=await scoresRes.json();
      const stats=await statsRes.json();
      const nhl=await nhlRes.json();
      setNbaGames(Array.isArray(scores)?scores:[]);
      setTeamStats(stats||null);
      setNhlGames(Array.isArray(nhl)?nhl:[]);
    }catch(e){console.error(e);}
    finally{setLoading(false);}
  }

  useEffect(()=>{fetchAll();const t=setInterval(fetchAll,30000);return()=>clearInterval(t);},[]);

  const liveNBA=nbaGames.filter(g=>g.isLive);
  const upcomingNBA=nbaGames.filter(g=>!g.isLive&&!g.isFinished);
  const liveNHL=nhlGames.filter(g=>g.isLive);
  const upcomingNHL=nhlGames.filter(g=>!g.isLive&&!g.isFinished);
  const timeStr=now.toLocaleTimeString("fr-CA",{hour:"2-digit",minute:"2-digit",second:"2-digit",timeZone:"America/Toronto"});

  return(
    <div style={{background:"#f5f5f5",minHeight:"100vh",fontFamily:"monospace",maxWidth:430,margin:"0 auto",paddingBottom:40}}>
      <div style={{background:"#fff",borderBottom:"1px solid #e0e0e0",padding:"14px 16px 10px",position:"sticky",top:0,zIndex:100}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
          <div style={{fontSize:15,fontWeight:900,letterSpacing:2}}>
            <span style={{color:"#e87722"}}>NBA</span>
            <span style={{color:"#ccc"}}> × </span>
            <span style={{color:"#0066cc"}}>NHL</span>
            <span style={{color:"#333"}}> SIGNALS</span>
          </div>
          <div style={{color:"#aaa",fontSize:10}}>⏱ {timeStr}</div>
        </div>
        <div style={{display:"flex",gap:8}}>
          {[{id:"nba",label:"🏀 NBA"},{id:"nhl",label:"🏒 NHL"}].map(t=>(
            <button key={t.id} onClick={()=>setTab(t.id)} style={{flex:1,padding:"8px 0",borderRadius:8,border:"none",fontFamily:"monospace",fontWeight:700,fontSize:13,cursor:"pointer",background:tab===t.id?(t.id==="nba"?"#e87722":"#0066cc"):"#f0f0f0",color:tab===t.id?"#fff":"#666",transition:"all 0.2s"}}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div style={{padding:"12px 12px 0"}}>
        {loading&&<div style={{textAlign:"center",color:"#aaa",padding:40,fontSize:12}}>Chargement...</div>}
        {!loading&&tab==="nba"&&(
          <>
            {liveNBA.length>0&&(
              <>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
                  <div style={{width:7,height:7,borderRadius:"50%",background:"#cc0000",animation:"pulse 1.2s infinite"}}/>
                  <span style={{color:"#cc0000",fontSize:10,letterSpacing:2,fontWeight:700}}>MATCHS EN DIRECT NBA</span>
                </div>
                {liveNBA.map((g,i)=>{
                  const sig=getLiveSignalNBA(g);
                  const color=COLORS[sig.type];
                  const bg=BGCOLORS[sig.type];
                  const border=BORDERCOLORS[sig.type];
                  const progPct=Math.min(100,(played(g.quarter,g.timeLeft)/TOTAL_MIN)*100);
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
                          <div style={{color:"#111",fontSize:26,fontWeight:900,letterSpacing:2}}>{g.awayScore} – {g.homeScore}</div>
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
                  <span style={{color:"#e87722",fontSize:10,letterSpacing:2,fontWeight:700}}>PRÉDICTIONS PRÉ-MATCH NBA</span>
                </div>
                {upcomingNBA.map((g,i)=>{
                  const pm=getNBAPreMatch(g,teamStats);
                  if(!pm)return null;
                  const ouColor=pm.proj>(g.total||0)?"#009944":"#cc3300";
                  return(
                    <div key={i} style={{background:"#fff",border:"1px solid #e0e0e0",borderRadius:13,padding:"14px 15px",marginBottom:10,boxShadow:"0 1px 6px #00000008"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <NBALogo name={g.awayFull||g.away} size={34}/>
                          <div>
                            <span style={{color:"#111",fontWeight:800,fontSize:14}}>{g.away}</span>
                            {pm.awayB2B&&<div style={{color:"#cc3300",fontSize:8,fontWeight:700}}>😴 B2B</div>}
                          </div>
                        </div>
                        <div style={{textAlign:"center"}}>
                          <div style={{color:"#111",fontSize:13,fontWeight:900}}>VS</div>
                          <div style={{color:"#888",fontSize:9}}>{toQcTime(g.time)+" HE"}</div>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <div style={{textAlign:"right"}}>
                            <span style={{color:"#111",fontWeight:800,fontSize:14}}>{g.home}</span>
                            {pm.homeB2B&&<div style={{color:"#cc3300",fontSize:8,fontWeight:700}}>😴 B2B</div>}
                          </div>
                          <NBALogo name={g.homeFull||g.home} size={34}/>
                        </div>
                      </div>
                      <div style={{background:"#f4f4f4",borderRadius:10,padding:"11px 12px"}}>
                        <div style={{color:"#aaa",fontSize:8,letterSpacing:1,marginBottom:8,fontWeight:700}}>SCORE PRÉDIT / CHANCE DE VICTOIRE</div>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
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
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
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
                        <div style={{display:"flex",gap:8}}>
                          {pm.spreadCover&&<div style={{flex:1,background:"#00aa5510",border:"1px solid #00aa5525",borderRadius:8,padding:"6px 8px",textAlign:"center"}}>
                            <div style={{color:"#aaa",fontSize:7,marginBottom:2}}>SPREAD PICK</div>
                            <div style={{color:"#007733",fontSize:12,fontWeight:900}}>{pm.spreadCover.team} {pm.spreadCover.spread>0?"+":""}{pm.spreadCover.spread}</div>
                          </div>}
                          {g.total&&<div style={{flex:1,background:`${ouColor}10`,border:`1px solid ${ouColor}25`,borderRadius:8,padding:"6px 8px",textAlign:"center"}}>
                            <div style={{color:"#aaa",fontSize:7,marginBottom:2}}>TOTAL PICK</div>
                            <div style={{color:ouColor,fontSize:12,fontWeight:900}}>{pm.proj>(g.total||0)?"O":"U"} {g.total} ⚡</div>
                          </div>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
            {!loading&&liveNBA.length===0&&upcomingNBA.length===0&&<div style={{textAlign:"center",color:"#aaa",padding:40,fontSize:12}}>Aucun match NBA aujourd'hui</div>}
          </>
        )}
        {!loading&&tab==="nhl"&&(
          <>
            {liveNHL.length>0&&(
              <>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8}}>
                  <div style={{width:7,height:7,borderRadius:"50%",background:"#cc0000",animation:"pulse 1.2s infinite"}}/>
                  <span style={{color:"#cc0000",fontSize:10,letterSpacing:2,fontWeight:700}}>MATCHS EN DIRECT NHL</span>
                </div>
                {liveNHL.map((g,i)=>{
                  const homeAbbr=getNHLAbbr(g.homeFull||g.home);
                  const awayAbbr=getNHLAbbr(g.awayFull||g.away);
                  const pred=getNHLWinner(awayAbbr,homeAbbr);
                  const baseHomePct=pred?pred.homePct:50;
                  const homeWinProb=getLiveWinProb(g.homeScore||0,g.awayScore||0,g.period||1,g.timeLeft||"20:00",baseHomePct);
                  const awayWinProb=100-homeWinProb;
                  const homeLeading=(g.homeScore||0)>(g.awayScore||0);
                  const awayLeading=(g.awayScore||0)>(g.homeScore||0);
                  const baseAwayPct=pred?pred.awayPct:50;
                  const homeTrend=homeWinProb>baseHomePct?"↑":homeWinProb<baseHomePct?"↓":"→";
                  const awayTrend=awayWinProb>baseAwayPct?"↑":awayWinProb<baseAwayPct?"↓":"→";
                  const PM=20,TOTAL=60;
                  const tParts=(g.timeLeft||"20:00").split(":").map(Number);
                  const minLeft=tParts[0]+tParts[1]/60;
                  const playedMin=((g.period||1)-1)*PM+(PM-minLeft);
                  const progress=Math.min(100,(playedMin/TOTAL)*100);
                  const predictedWinner=pred?pred.winner:homeAbbr;
                  const predictedPct=pred?(predictedWinner===homeAbbr?pred.homePct:pred.awayPct):50;
                  const winnerColor=getNHLColor(predictedWinner);
                  return(
                    <div key={i} style={{background:"#fff",border:"1px solid #e0e0e0",borderRadius:13,padding:"14px 15px",marginBottom:10,boxShadow:"0 1px 6px #00000008"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                        <div style={{display:"flex",alignItems:"center",gap:5}}>
                          <div style={{width:6,height:6,borderRadius:"50%",background:"#cc0000"}}/>
                          <span style={{color:"#cc0000",fontSize:8,fontWeight:700}}>LIVE</span>
                        </div>
                        <span style={{color:"#e67e00",fontSize:9,fontWeight:700}}>P{g.period||1} {g.timeLeft||"20:00"}</span>
                      </div>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <NHLLogo name={g.awayFull||g.away} size={32}/>
                          <span style={{color:"#111",fontWeight:800,fontSize:14}}>{awayAbbr}</span>
                        </div>
                        <div style={{textAlign:"center"}}>
                          <div style={{color:"#111",fontSize:26,fontWeight:900,letterSpacing:2}}>
                            <span style={{color:awayLeading?"#007733":"#111"}}>{g.awayScore||0}</span>
                            <span style={{color:"#ccc"}}> – </span>
                            <span style={{color:homeLeading?"#007733":"#111"}}>{g.homeScore||0}</span>
                          </div>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <span style={{color:"#111",fontWeight:800,fontSize:14}}>{homeAbbr}</span>
                          <NHLLogo name={g.homeFull||g.home} size={32}/>
                        </div>
                      </div>
                      <div style={{height:3,background:"#e0e0e0",borderRadius:2,overflow:"hidden",marginBottom:10}}>
                        <div style={{height:"100%",width:`${progress}%`,background:"#0066cc",transition:"width 1s"}}/>
                      </div>
                      <div style={{background:"#f4f4f4",borderRadius:10,padding:"12px"}}>
                        <div style={{color:"#aaa",fontSize:8,letterSpacing:1,marginBottom:8,fontWeight:700}}>WIN PROBABILITY LIVE</div>
                        <div style={{height:10,borderRadius:5,overflow:"hidden",display:"flex",marginBottom:10}}>
                          <div style={{width:`${awayWinProb}%`,background:awayWinProb>homeWinProb?"#007733":"#cc3300",borderRadius:"5px 0 0 5px",transition:"width 0.8s"}}/>
                          <div style={{width:`${homeWinProb}%`,background:homeWinProb>awayWinProb?"#007733":"#cc3300",borderRadius:"0 5px 5px 0",transition:"width 0.8s"}}/>
                        </div>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                          <div style={{textAlign:"center"}}>
                            <div style={{color:"#888",fontSize:8}}>{awayAbbr}</div>
                            <div style={{display:"flex",alignItems:"baseline",gap:3}}>
                              <span style={{color:awayWinProb>homeWinProb?"#007733":"#cc3300",fontSize:26,fontWeight:900}}>{awayWinProb}%</span>
                              <span style={{color:awayTrend==="↑"?"#007733":awayTrend==="↓"?"#cc3300":"#888",fontSize:14,fontWeight:700}}>{awayTrend}</span>
                            </div>
                          </div>
                          <div style={{color:"#ddd",fontSize:18}}>|</div>
                          <div style={{textAlign:"center"}}>
                            <div style={{color:"#888",fontSize:8}}>{homeAbbr}</div>
                            <div style={{display:"flex",alignItems:"baseline",gap:3}}>
                              <span style={{color:homeWinProb>awayWinProb?"#007733":"#cc3300",fontSize:26,fontWeight:900}}>{homeWinProb}%</span>
                              <span style={{color:homeTrend==="↑"?"#007733":homeTrend==="↓"?"#cc3300":"#888",fontSize:14,fontWeight:700}}>{homeTrend}</span>
                            </div>
                          </div>
                        </div>
                        <div style={{background:"#fff",border:"1px solid #e0e0e0",borderRadius:8,padding:"6px 10px",display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                          <div style={{color:"#aaa",fontSize:8}}>MODÈLE PRÉ-MATCH</div>
                          <div style={{color:winnerColor,fontSize:10,fontWeight:800}}>{predictedWinner} {predictedPct}% prédit</div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
            {upcomingNHL.length>0&&(
              <>
                <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:8,marginTop:liveNHL.length>0?12:0}}>
                  <span style={{fontSize:10}}>📊</span>
                  <span style={{color:"#0066cc",fontSize:10,letterSpacing:2,fontWeight:700}}>PRÉDICTIONS NHL — GAGNANT</span>
                </div>
                {upcomingNHL.map((g,i)=>{
                  const homeAbbr=getNHLAbbr(g.homeFull||g.home);
                  const awayAbbr=getNHLAbbr(g.awayFull||g.away);
                  const pred=getNHLWinner(awayAbbr,homeAbbr);
                  if(!pred)return null;
                  const homeWins=pred.homePct>=pred.awayPct;
                  const s=NHL_STATS;
                  return(
                    <div key={i} style={{background:"#fff",border:"1px solid #e0e0e0",borderRadius:13,padding:"14px 15px",marginBottom:10,boxShadow:"0 1px 6px #00000008"}}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <NHLLogo name={g.awayFull||g.away} size={34}/>
                          <span style={{color:"#111",fontWeight:800,fontSize:14}}>{awayAbbr}</span>
                        </div>
                        <div style={{textAlign:"center"}}>
                          <div style={{color:"#111",fontSize:13,fontWeight:900}}>VS</div>
                          <div style={{color:"#888",fontSize:9}}>{toQcTime(g.time)+" HE"}</div>
                        </div>
                        <div style={{display:"flex",alignItems:"center",gap:8}}>
                          <span style={{color:"#111",fontWeight:800,fontSize:14}}>{homeAbbr}</span>
                          <NHLLogo name={g.homeFull||g.home} size={34}/>
                        </div>
                      </div>
                      <div style={{background:"#f4f4f4",borderRadius:10,padding:"12px"}}>
                        <div style={{height:8,borderRadius:4,overflow:"hidden",display:"flex",marginBottom:10}}>
                          <div style={{width:`${pred.awayPct}%`,background:!homeWins?"#0066cc":"#cc3300",borderRadius:"4px 0 0 4px"}}/>
                          <div style={{width:`${pred.homePct}%`,background:homeWins?"#0066cc":"#cc3300",borderRadius:"0 4px 4px 0"}}/>
                        </div>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
                          <div style={{textAlign:"center"}}>
                            <div style={{color:"#888",fontSize:8,marginBottom:2}}>{awayAbbr}</div>
                            <div style={{color:!homeWins?"#0066cc":"#cc3300",fontSize:28,fontWeight:900,lineHeight:1}}>{pred.awayPct}%</div>
                          </div>
                          <div style={{color:"#ddd",fontSize:20}}>|</div>
                          <div style={{textAlign:"center"}}>
                            <div style={{color:"#888",fontSize:8,marginBottom:2}}>{homeAbbr}</div>
                            <div style={{color:homeWins?"#0066cc":"#cc3300",fontSize:28,fontWeight:900,lineHeight:1}}>{pred.homePct}%</div>
                          </div>
                        </div>
                        <div style={{display:"flex",justifyContent:"space-around",marginBottom:12,background:"#fff",borderRadius:8,padding:"8px 4px"}}>
                          {[{label:"CF%",away:s[awayAbbr]?.cf,home:s[homeAbbr]?.cf},{label:"xGF%",away:s[awayAbbr]?.xgf,home:s[homeAbbr]?.xgf},{label:"HDCF%",away:s[awayAbbr]?.hdcf,home:s[homeAbbr]?.hdcf},{label:"SV%",away:s[awayAbbr]?.svPct,home:s[homeAbbr]?.svPct},{label:"PP%",away:s[awayAbbr]?.pp,home:s[homeAbbr]?.pp}].map((stat,j)=>(
                            <div key={j} style={{textAlign:"center"}}>
                              <div style={{color:"#aaa",fontSize:7,marginBottom:3}}>{stat.label}</div>
                              <div style={{color:(stat.away||0)>(stat.home||0)?"#0066cc":"#cc3300",fontSize:9,fontWeight:800}}>{stat.away}</div>
                              <div style={{color:"#ccc",fontSize:7}}>vs</div>
                              <div style={{color:(stat.home||0)>(stat.away||0)?"#0066cc":"#cc3300",fontSize:9,fontWeight:800}}>{stat.home}</div>
                            </div>
                          ))}
                        </div>
                        <div style={{display:"flex",justifyContent:"center"}}>
                          <div style={{background:"#0066cc15",border:"1px solid #0066cc30",borderRadius:8,padding:"8px 20px",color:"#0066cc",fontSize:13,fontWeight:900}}>
                            {pred.winner} GAGNE 🏆
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
            {!loading&&liveNHL.length===0&&upcomingNHL.length===0&&<div style={{textAlign:"center",color:"#aaa",padding:40,fontSize:12}}>Aucun match NHL aujourd'hui</div>}
          </>
        )}
      </div>
      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:0.3}}`}</style>
    </div>
  );
}
