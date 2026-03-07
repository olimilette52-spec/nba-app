import { useState, useEffect } from "react";

const PROXY = "https://nba-proxy-production.up.railway.app";

const NBA_TEAM_IDS = {
  Hawks:1610612737, Celtics:1610612738, Nets:1610612751, Hornets:1610612766,
  Bulls:1610612741, Cavaliers:1610612739, Mavericks:1610612742, Nuggets:1610612743,
  Pistons:1610612765, Warriors:1610612744, Rockets:1610612745, Pacers:1610612754,
  Clippers:1610612746, Lakers:1610612747, Grizzlies:1610612763, Heat:1610612748,
  Bucks:1610612749, Timberwolves:1610612750, Pelicans:1610612740, Knicks:1610612752,
  Thunder:1610612760, Magic:1610612753, "76ers":1610612755, Suns:1610612756,
  "Trail Blazers":1610612757, Kings:1610612758, Spurs:1610612759, Raptors:1610612761,
  Jazz:1610612762, Wizards:1610612764
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
  "Washington Capitals":"WSH","Winnipeg Jets":"WPG"
};

function getNBALogo(teamName){
  const fullName=Object.keys(NBA_TEAM_IDS).find(k=>teamName.includes(k));
  const id=fullName?NBA_TEAM_IDS[fullName]:null;
  return id?`https://cdn.nba.com/logos/nba/${id}/global/L/logo.svg`:null;
}

function getNHLLogo(teamName){
  const abbr = NHL_ABBRS[teamName] || teamName;
  return `https://assets.nhle.com/logos/nhl/svg/${abbr}_light.svg`;
}

function toQcTime(isoDate){
  if(!isoDate) return "";
  const d = new Date(isoDate);
  return d.toLocaleTimeString("fr-CA",{hour:"2-digit",minute:"2-digit",timeZone:"America/Toronto"});
}

// NBA Signal
const Q=12,TOTAL_MIN=48;
function pt(t){if(!t||t==="0:00")return 0;const[m,s]=String(t).split(":").map(Number);return(m||0)+(s||0)/60;}
function played(q,tl){return(q-1)*Q+(Q-pt(tl));}
function remaining(q,tl){return Math.max(0,TOTAL_MIN-played(q,tl));}
function qMult(q,tl){const r=pt(tl);if(q===4&&r<2)return 0.65;if(q===4&&r<4)return 0.78;if(q===4)return 0.90;return 1.0;}

function getLiveSignalNBA(game){
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
  return{type,label,edge,confidence:conf,projection:proj};
}

// NHL Signal
const PERIOD_MIN=20,TOTAL_PERIODS=3,TOTAL_NHL=60;
function getLiveSignalNHL(game){
  if(!game.isLive||!game.total){
    return{type:"SCHEDULED",label:"🕐 À VENIR",edge:0,confidence:0,projection:0};
  }
  const scored=game.homeScore+game.awayScore;
  const p=((game.period-1)*PERIOD_MIN)+(PERIOD_MIN-pt(game.timeLeft));
  const r=Math.max(0,TOTAL_NHL-p);
  if(p<2)return{type:"NEUTRAL",label:"⚖️ NEUTRE",edge:0,confidence:0,projection:scored};
  const pace=scored/p;
  const avgPace=game.total/TOTAL_NHL;
  const rw=Math.min(0.96,0.50+(p/TOTAL_NHL)*0.48);
  const blended=pace*rw+avgPace*(1-rw);
  const proj=+(scored+blended*r).toFixed(1);
  const edge=+(proj-game.total).toFixed(1);
  const conf=Math.min(100,Math.round(Math.min(35,(p/TOTAL_NHL)*35)+Math.min(28,Math.abs(edge)*4)+20));
  let type,label;
  if(edge>1.5&&conf>=55){type="STRONG_OVER";label="🔥 STRONG OVER";}
  else if(edge>0.7&&conf>=40){type="OVER";label="📈 OVER";}
  else if(edge<-1.5&&conf>=55){type="STRONG_UNDER";label="❄️ STRONG UNDER";}
  else if(edge<-0.7&&conf>=40){type="UNDER";label="📉 UNDER";}
  else{type="NEUTRAL";label="⚖️ NEUTRE";}
  return{type,label,edge,confidence:conf,projection:proj};
}

function getNBAPreMatch(game, teamStats){
  if(!teamStats) return null;
  const hKey=Object.keys(teamStats).find(k=>game.homeFull.includes(k)||k===game.home);
  const aKey=Object.keys(teamStats).find(k=>game.awayFull.includes(k)||k===game.away);
  const hStats=hKey?teamStats[hKey]:null;
  const aStats=aKey?teamStats[aKey]:null;
  if(!hStats?.ppg||!aStats?.ppg) return null;
  const homeExpected=(hStats.ppg+aStats.oppg)/2+1.6;
  const awayExpected=(aStats.ppg+hStats.oppg)/2;
  let proj=homeExpected+awayExpected;
  if(hStats.pace&&aStats.pace) proj+=(((hStats.pace+aStats.pace)/2)-98.5)*0.8;
  if(hStats.recentPts&&aStats.recentPts) proj=proj*0.65+((hStats.recentPts+aStats.recentPts)/2)*0.35;
  if(hStats.backToBack) proj-=3.5;
  if(aStats.backToBack) proj-=3.5;
  const ratio=homeExpected/(homeExpected+awayExpected);
  const homeProjScore=Math.round(proj*ratio);
  const awayProjScore=Math.round(proj-homeProjScore);
  const projDiff=homeProjScore-awayProjScore;
  let spreadCover=null;
  if(game.spread!==null&&game.spreadTeam){
    const favHome=game.home===game.spreadTeam||game.homeFull.includes(game.spreadTeam);
    if(favHome){
      spreadCover=projDiff>=Math.abs(game.spread)?{team:game.home,covers:true}:{team:game.away,covers:true,isUnderdog:true};
    } else {
      const awayDiff=awayProjScore-homeProjScore;
      spreadCover=awayDiff>=Math.abs(game.spread)?{team:game.away,covers:true}:{team:game.home,covers:true,isUnderdog:true};
    }
  }
  return{proj:+proj.toFixed(1),homeProjScore,awayProjScore,homePpg:hStats.ppg,awayPpg:aStats.ppg,homeOppg:hStats.oppg,awayOppg:aStats.oppg,homeB2B:hStats.backToBack,awayB2B:aStats.backToBack,recentUsed:!!(hStats.recentPts&&aStats.recentPts),paceUsed:!!(hStats.pace&&aStats.pace),projDiff,spreadCover,winner:homeProjScore>=awayProjScore?game.home:game.away};
}

function getNHLPreMatch(game, nhlStats){
  if(!nhlStats) return null;
  const hAbbr=NHL_ABBRS[game.homeFull]||game.home;
  const aAbbr=NHL_ABBRS[game.awayFull]||game.away;
  const hStats=nhlStats[hAbbr];
  const aStats=nhlStats[aAbbr];
  if(!hStats||!aStats) return null;
  const homeExp=((hStats.gf+aStats.ga)/2)+0.2;
  const awayExp=(aStats.gf+hStats.ga)/2;
  let proj=homeExp+awayExp;
  const homeProjScore=+homeExp.toFixed(1);
  const awayProjScore=+awayExp.toFixed(1);
  const projDiff=+(homeProjScore-awayProjScore).toFixed(1);
  let puckCover=null;
  if(game.puckLine&&game.puckLineTeam){
    const favHome=game.home===game.puckLineTeam||game.homeFull.includes(game.puckLineTeam);
    if(favHome){
      puckCover=projDiff>=1.5?{team:game.home,covers:true}:{team:game.away,covers:true,isUnderdog:true};
    } else {
      const awayDiff=awayProjScore-homeProjScore;
      puckCover=awayDiff>=1.5?{team:game.away,covers:true}:{team:game.home,covers:true,isUnderdog:true};
    }
  }
  return{proj:+proj.toFixed(1),homeProjScore:Math.round(homeExp),awayProjScore:Math.round(awayExp),homeGF:hStats.gf,awayGF:aStats.gf,homeGA:hStats.ga,awayGA:aStats.ga,projDiff,puckCover,winner:homeExp>=awayExp?game.home:game.away};
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
  const url=getNHLLogo(name);
  return<img src={url} alt={name} style={{width:size,height:size,objectFit:"contain"}} onError={e=>{e.target.style.display='none';}}/>;
}
function NBAPreMatchCard({game, teamStats}){
  const pred = getNBAPreMatch(game, teamStats);
  const favoriteIsHome = game.spreadTeam && (game.home === game.spreadTeam || game.homeFull.includes(game.spreadTeam));
  const homeSpread = game.spread ? (favoriteIsHome ? -Math.abs(game.spread) : +Math.abs(game.spread)) : null;
  const awaySpread = game.spread ? (favoriteIsHome ? +Math.abs(game.spread) : -Math.abs(game.spread)) : null;
  return(
    <div style={{background:"#ffffff",border:"1px solid #e0e0e0",borderRadius:13,padding:"15px 17px",boxShadow:"0 1px 6px #00000008"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <NBALogo name={game.awayFull} size={36}/>
          <div>
            <span style={{color:"#111",fontWeight:800,fontSize:15}}>{game.away}</span>
            {pred?.awayB2B&&<div style={{color:"#cc3300",fontSize:8,fontWeight:700}}>😴 B2B</div>}
          </div>
        </div>
        <div style={{textAlign:"center"}}>
          <div style={{color:"#111",fontSize:18,fontWeight:900}}>VS</div>
          <div style={{color:"#888",fontSize:10,fontWeight:700}}>{toQcTime(game.time)} HE</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{textAlign:"right"}}>
            <span style={{color:"#111",fontWeight:800,fontSize:15}}>{game.home}</span>
            {pred?.homeB2B&&<div style={{color:"#cc3300",fontSize:8,fontWeight:700}}>😴 B2B</div>}
          </div>
          <NBALogo name={game.homeFull} size={36}/>
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
                <div style={{color:"#bbb",fontSize:7}}>{pred.paceUsed&&"⚡pace "}{pred.recentUsed&&"📈forme"}</div>
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{color:"#777",fontSize:8}}>MOY {game.home}</div>
                <div style={{color:"#111",fontSize:16,fontWeight:800}}>{pred.homePpg}</div>
                <div style={{color:"#aaa",fontSize:8}}>DEF {pred.homeOppg}</div>
              </div>
            </div>
            <div style={{background:"#ffffff",border:"1px solid #e0e0e0",borderRadius:8,padding:"8px 12px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{color:"#777",fontSize:8,marginBottom:4}}>SCORE PRÉVU</div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{textAlign:"center"}}>
                    <div style={{color:"#888",fontSize:8}}>{game.away}</div>
                    <div style={{color:pred.awayProjScore>pred.homeProjScore?"#007733":"#cc3300",fontSize:24,fontWeight:900,lineHeight:1}}>{pred.awayProjScore}</div>
                  </div>
                  <div style={{color:"#ccc",fontSize:16}}>—</div>
                  <div style={{textAlign:"center"}}>
                    <div style={{color:"#888",fontSize:8}}>{game.home}</div>
                    <div style={{color:pred.homeProjScore>pred.awayProjScore?"#007733":"#cc3300",fontSize:24,fontWeight:900,lineHeight:1}}>{pred.homeProjScore}</div>
                  </div>
                </div>
              </div>
              <div style={{background:"#00aa5515",border:"1px solid #00aa5530",borderRadius:6,padding:"4px 10px",color:"#007733",fontSize:11,fontWeight:900}}>{pred.winner} GAGNE 🏆</div>
            </div>
            {game.total&&(
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div style={{fontSize:10,color:"#555",fontWeight:700}}>TOTAL: {game.total}</div>
                <div style={{background:pred.proj>game.total?"#00aa5515":"#ff330015",border:`1px solid ${pred.proj>game.total?"#00aa5530":"#ff330025"}`,borderRadius:6,padding:"3px 8px",color:pred.proj>game.total?"#007733":"#cc3300",fontSize:10,fontWeight:800}}>
                  {pred.proj>game.total?"📈 OVER PRÉVU":"📉 UNDER PRÉVU"}
                </div>
              </div>
            )}
            {game.spread!==null&&game.spreadTeam&&homeSpread!==null&&(
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",gap:8}}>
                  <div style={{background:awaySpread>0?"#00aa5515":"#ff330015",border:`1px solid ${awaySpread>0?"#00aa5530":"#ff330030"}`,borderRadius:6,padding:"3px 8px",color:awaySpread>0?"#007733":"#cc3300",fontSize:10,fontWeight:800}}>{game.away} {awaySpread>0?"+":""}{awaySpread}</div>
                  <div style={{background:homeSpread>0?"#00aa5515":"#ff330015",border:`1px solid ${homeSpread>0?"#00aa5530":"#ff330030"}`,borderRadius:6,padding:"3px 8px",color:homeSpread>0?"#007733":"#cc3300",fontSize:10,fontWeight:800}}>{game.home} {homeSpread>0?"+":""}{homeSpread}</div>
                </div>
                {pred.spreadCover&&(
                  <div style={{background:pred.spreadCover.covers?"#00aa5515":"#ff330015",border:`1px solid ${pred.spreadCover.covers?"#00aa5530":"#ff330025"}`,borderRadius:6,padding:"3px 8px",color:pred.spreadCover.covers?"#007733":"#cc3300",fontSize:10,fontWeight:800}}>
                    {pred.spreadCover.covers?`${pred.spreadCover.team} COUVRE ✓`:`${pred.spreadCover.team} NE COUVRE ✗`}
                  </div>
                )}
              </div>
            )}
          </>
        ):(
          <div style={{color:"#aaa",fontSize:9,textAlign:"center",padding:"8px 0"}}>Stats en chargement...</div>
        )}
      </div>
    </div>
  );
}

function NHLPreMatchCard({game, nhlStats}){
  const pred = getNHLPreMatch(game, nhlStats);
  const favHome = game.puckLineTeam && (game.home === game.puckLineTeam || game.homeFull.includes(game.puckLineTeam));
  const homeSpread = game.puckLine ? (favHome ? -1.5 : +1.5) : null;
  const awaySpread = game.puckLine ? (favHome ? +1.5 : -1.5) : null;
  return(
    <div style={{background:"#ffffff",border:"1px solid #e0e0e0",borderRadius:13,padding:"15px 17px",boxShadow:"0 1px 6px #00000008"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <NHLLogo name={game.awayFull} size={36}/>
          <span style={{color:"#111",fontWeight:800,fontSize:15}}>{game.away}</span>
        </div>
        <div style={{textAlign:"center"}}>
          <div style={{color:"#111",fontSize:18,fontWeight:900}}>VS</div>
          <div style={{color:"#888",fontSize:10,fontWeight:700}}>{toQcTime(game.time)} HE</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{color:"#111",fontWeight:800,fontSize:15}}>{game.home}</span>
          <NHLLogo name={game.homeFull} size={36}/>
        </div>
      </div>
      <div style={{background:"#f4f4f4",borderRadius:10,padding:"10px 12px"}}>
        {pred?(
          <>
            <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:6,marginBottom:10}}>
              <div style={{textAlign:"center"}}>
                <div style={{color:"#777",fontSize:8}}>MOY {game.away}</div>
                <div style={{color:"#111",fontSize:16,fontWeight:800}}>{pred.awayGF}</div>
                <div style={{color:"#aaa",fontSize:8}}>DEF {pred.awayGA}</div>
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{color:"#777",fontSize:8}}>PROJECTION</div>
                <div style={{color:"#0066cc",fontSize:20,fontWeight:900}}>{pred.proj}</div>
                <div style={{color:"#bbb",fontSize:7}}>🏒 buts</div>
              </div>
              <div style={{textAlign:"center"}}>
                <div style={{color:"#777",fontSize:8}}>MOY {game.home}</div>
                <div style={{color:"#111",fontSize:16,fontWeight:800}}>{pred.homeGF}</div>
                <div style={{color:"#aaa",fontSize:8}}>DEF {pred.homeGA}</div>
              </div>
            </div>
            <div style={{background:"#ffffff",border:"1px solid #e0e0e0",borderRadius:8,padding:"8px 12px",marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div>
                <div style={{color:"#777",fontSize:8,marginBottom:4}}>SCORE PRÉVU</div>
                <div style={{display:"flex",alignItems:"center",gap:10}}>
                  <div style={{textAlign:"center"}}>
                    <div style={{color:"#888",fontSize:8}}>{game.away}</div>
                    <div style={{color:pred.awayProjScore>pred.homeProjScore?"#007733":"#cc3300",fontSize:24,fontWeight:900,lineHeight:1}}>{pred.awayProjScore}</div>
                  </div>
                  <div style={{color:"#ccc",fontSize:16}}>—</div>
                  <div style={{textAlign:"center"}}>
                    <div style={{color:"#888",fontSize:8}}>{game.home}</div>
                    <div style={{color:pred.homeProjScore>pred.awayProjScore?"#007733":"#cc3300",fontSize:24,fontWeight:900,lineHeight:1}}>{pred.homeProjScore}</div>
                  </div>
                </div>
              </div>
              <div style={{background:"#00aa5515",border:"1px solid #00aa5530",borderRadius:6,padding:"4px 10px",color:"#007733",fontSize:11,fontWeight:900}}>{pred.winner} GAGNE 🏆</div>
            </div>
            {game.total&&(
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
                <div style={{fontSize:10,color:"#555",fontWeight:700}}>TOTAL: {game.total}</div>
                <div style={{background:pred.proj>game.total?"#00aa5515":"#ff330015",border:`1px solid ${pred.proj>game.total?"#00aa5530":"#ff330025"}`,borderRadius:6,padding:"3px 8px",color:pred.proj>game.total?"#007733":"#cc3300",fontSize:10,fontWeight:800}}>
                  {pred.proj>game.total?"📈 OVER PRÉVU":"📉 UNDER PRÉVU"}
                </div>
              </div>
            )}
            {homeSpread!==null&&(
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div style={{display:"flex",gap:8}}>
                  <div style={{background:awaySpread>0?"#00aa5515":"#ff330015",border:`1px solid ${awaySpread>0?"#00aa5530":"#ff330030"}`,borderRadius:6,padding:"3px 8px",color:awaySpread>0?"#007733":"#cc3300",fontSize:10,fontWeight:800}}>{game.away} {awaySpread>0?"+":""}{awaySpread}</div>
                  <div style={{background:homeSpread>0?"#00aa5515":"#ff330015",border:`1px solid ${homeSpread>0?"#00aa5530":"#ff330030"}`,borderRadius:6,padding:"3px 8px",color:homeSpread>0?"#007733":"#cc3300",fontSize:10,fontWeight:800}}>{game.home} {homeSpread>0?"+":""}{homeSpread}</div>
                </div>
                {pred.puckCover&&(
                  <div style={{background:pred.puckCover.covers?"#00aa5515":"#ff330015",border:`1px solid ${pred.puckCover.covers?"#00aa5530":"#ff330025"}`,borderRadius:6,padding:"3px 8px",color:pred.puckCover.covers?"#007733":"#cc3300",fontSize:10,fontWeight:800}}>
                    {pred.puckCover.covers?`${pred.puckCover.team} COUVRE ✓`:`${pred.puckCover.team} NE COUVRE ✗`}
                  </div>
                )}
              </div>
            )}
          </>
        ):(
          <div style={{color:"#aaa",fontSize:9,textAlign:"center",padding:"8px 0"}}>Stats en chargement...</div>
        )}
      </div>
    </div>
  );
}

function NBALiveCard({game,selected,onSelect}){
  const sig=getLiveSignalNBA(game);
  const c=COLORS[sig.type],bg=BGCOLORS[sig.type],border=BORDERCOLORS[sig.type];
  const scored=(game.homeScore||0)+(game.awayScore||0);
  const progress=game.total?Math.min((scored/game.total)*100,100):0;
  const[pulse,setPulse]=useState(false);
  useEffect(()=>{const t=setInterval(()=>setPulse(p=>!p),1600);return()=>clearInterval(t);},[]);
  return(
    <div onClick={()=>onSelect(game.id)} style={{background:selected?"#f8fff8":"#ffffff",border:`1px solid ${selected?c+"66":"#e0e0e0"}`,borderRadius:13,padding:"15px 17px",cursor:"pointer",boxShadow:selected?`0 0 18px ${c}20`:"0 1px 6px #00000008",position:"relative"}}>
      <div style={{position:"absolute",top:11,right:12,display:"flex",alignItems:"center",gap:5}}>
        <div style={{width:6,height:6,borderRadius:"50%",background:"#cc0000",boxShadow:pulse?"0 0 8px #cc0000":"none",transition:"box-shadow 0.4s"}}/>
        <span style={{color:"#cc0000",fontSize:8,fontWeight:700}}>LIVE</span>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}><NBALogo name={game.awayFull} size={36}/><span style={{color:"#111",fontWeight:800,fontSize:15}}>{game.away}</span></div>
        <div style={{textAlign:"center"}}>
          <div style={{color:"#111",fontSize:22,fontWeight:900}}>{game.awayScore}–{game.homeScore}</div>
          <div style={{color:"#e67e00",fontSize:9,fontWeight:700}}>Q{game.quarter} {game.timeLeft}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{color:"#111",fontWeight:800,fontSize:15}}>{game.home}</span><NBALogo name={game.homeFull} size={36}/></div>
      </div>
      {game.total&&(<>
        <div style={{height:3,background:"#e0e0e0",borderRadius:2,overflow:"hidden",marginBottom:9}}><div style={{height:"100%",width:`${progress}%`,background:c,transition:"width 1s"}}/></div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{background:bg,border:`1px solid ${border}`,borderRadius:6,padding:"4px 9px",color:c,fontSize:11,fontWeight:800}}>{sig.label}</div>
          <div style={{display:"flex",alignItems:"center",gap:9}}>
            <div style={{textAlign:"right"}}>
              <div style={{color:"#aaa",fontSize:8}}>PROJ / LINE</div>
              <div style={{color:c,fontSize:14,fontWeight:900}}>{sig.projection} / {game.total}</div>
            </div>
            <Ring value={sig.confidence} color={c} size={46}/>
          </div>
        </div>
      </>)}
    </div>
  );
}

function NHLLiveCard({game,selected,onSelect}){
  const sig=getLiveSignalNHL(game);
  const c=COLORS[sig.type],bg=BGCOLORS[sig.type],border=BORDERCOLORS[sig.type];
  const scored=(game.homeScore||0)+(game.awayScore||0);
  const progress=game.total?Math.min((scored/game.total)*100,100):0;
  const[pulse,setPulse]=useState(false);
  useEffect(()=>{const t=setInterval(()=>setPulse(p=>!p),1600);return()=>clearInterval(t);},[]);
  return(
    <div onClick={()=>onSelect(game.id)} style={{background:selected?"#f0f8ff":"#ffffff",border:`1px solid ${selected?c+"66":"#e0e0e0"}`,borderRadius:13,padding:"15px 17px",cursor:"pointer",boxShadow:selected?`0 0 18px ${c}20`:"0 1px 6px #00000008",position:"relative"}}>
      <div style={{position:"absolute",top:11,right:12,display:"flex",alignItems:"center",gap:5}}>
        <div style={{width:6,height:6,borderRadius:"50%",background:"#cc0000",boxShadow:pulse?"0 0 8px #cc0000":"none",transition:"box-shadow 0.4s"}}/>
        <span style={{color:"#cc0000",fontSize:8,fontWeight:700}}>LIVE</span>
      </div>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:9}}>
        <div style={{display:"flex",alignItems:"center",gap:8}}><NHLLogo name={game.awayFull} size={36}/><span style={{color:"#111",fontWeight:800,fontSize:15}}>{game.away}</span></div>
        <div style={{textAlign:"center"}}>
          <div style={{color:"#111",fontSize:22,fontWeight:900}}>{game.awayScore}–{game.homeScore}</div>
          <div style={{color:"#e67e00",fontSize:9,fontWeight:700}}>P{game.period} {game.timeLeft}</div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}><span style={{color:"#111",fontWeight:800,fontSize:15}}>{game.home}</span><NHLLogo name={game.homeFull} size={36}/></div>
      </div>
      {game.total&&(<>
        <div style={{height:3,background:"#e0e0e0",borderRadius:2,overflow:"hidden",marginBottom:9}}><div style={{height:"100%",width:`${progress}%`,background:c,transition:"width 1s"}}/></div>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
          <div style={{background:bg,border:`1px solid ${border}`,borderRadius:6,padding:"4px 9px",color:c,fontSize:11,fontWeight:800}}>{sig.label}</div>
          <div style={{display:"flex",alignItems:"center",gap:9}}>
            <div style={{textAlign:"right"}}>
              <div style={{color:"#aaa",fontSize:8}}>PROJ / LINE</div>
              <div style={{color:c,fontSize:14,fontWeight:900}}>{sig.projection} / {game.total}</div>
            </div>
            <Ring value={sig.confidence} color={c} size={46}/>
          </div>
        </div>
      </>)}
    </div>
  );
}
export default function App(){
  const[tab,setTab]=useState("nba");
  const[nbaGames,setNbaGames]=useState([]);
  const[nhlGames,setNhlGames]=useState([]);
  const[teamStats,setTeamStats]=useState(null);
  const[nhlStats,setNhlStats]=useState(null);
  const[selectedNBAId,setSelectedNBAId]=useState(null);
  const[selectedNHLId,setSelectedNHLId]=useState(null);
  const[status,setStatus]=useState("loading");
  const[lastUpdate,setLastUpdate]=useState(null);

  const loadData = async()=>{
    try{
      const[nbaRes,nhlRes,statsRes,nhlStatsRes]=await Promise.all([
        fetch(`${PROXY}/nba/scores`),
        fetch(`${PROXY}/nhl/scores`),
        fetch(`${PROXY}/nba/stats`),
        fetch(`${PROXY}/nhl/stats`),
      ]);
      const[nba,nhl,stats,nhlS]=await Promise.all([nbaRes.json(),nhlRes.json(),statsRes.json(),nhlStatsRes.json()]);
      if(Array.isArray(nba)){
        setNbaGames(nba);
        if(!selectedNBAId&&nba.length>0) setSelectedNBAId((nba.find(g=>g.isLive)||nba[0]).id);
      }
      if(Array.isArray(nhl)){
        setNhlGames(nhl);
        if(!selectedNHLId&&nhl.length>0) setSelectedNHLId((nhl.find(g=>g.isLive)||nhl[0]).id);
      }
      setTeamStats(stats);
      setNhlStats(nhlS);
      setLastUpdate(new Date().toLocaleTimeString("fr-CA",{timeZone:"America/Toronto"}));
      setStatus("ok");
    }catch(e){
      setStatus("error");
    }
  };

  useEffect(()=>{loadData();const iv=setInterval(loadData,30000);return()=>clearInterval(iv);},[]);

  const nbaLive=nbaGames.filter(g=>g.isLive);
  const nbaScheduled=nbaGames.filter(g=>!g.isLive&&!g.isFinished);
  const nhlLive=nhlGames.filter(g=>g.isLive);
  const nhlScheduled=nhlGames.filter(g=>!g.isLive&&!g.isFinished);
  const selectedNBA=nbaGames.find(g=>g.id===selectedNBAId);
  const selectedNHL=nhlGames.find(g=>g.id===selectedNHLId);
  const nbaSig=selectedNBA?getLiveSignalNBA(selectedNBA):{type:"SCHEDULED",label:"",edge:0,confidence:0,projection:0};
  const nhlSig=selectedNHL?getLiveSignalNHL(selectedNHL):{type:"SCHEDULED",label:"",edge:0,confidence:0,projection:0};
  const c=tab==="nba"?COLORS[nbaSig.type]:COLORS[nhlSig.type];
  const totalLive=nbaLive.length+nhlLive.length;

  return(
    <div style={{minHeight:"100vh",background:"#f5f5f5",color:"#111",fontFamily:"monospace"}}>
      <div style={{borderBottom:"1px solid #e0e0e0",padding:"14px 20px",display:"flex",justifyContent:"space-between",alignItems:"center",background:"#ffffff",position:"sticky",top:0,zIndex:100,boxShadow:"0 1px 8px #00000010"}}>
        <span style={{background:"linear-gradient(135deg,#7c3aed,#00aa55)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",fontSize:15,fontWeight:900,letterSpacing:2}}>NBA × NHL SIGNALS</span>
        <div style={{display:"flex",gap:8,alignItems:"center"}}>
          {lastUpdate&&<span style={{color:"#aaa",fontSize:8}}>↻ {lastUpdate}</span>}
          {totalLive>0&&<span style={{background:"#cc000015",border:"1px solid #cc000030",borderRadius:4,padding:"3px 9px",color:"#cc0000",fontSize:9,fontWeight:700}}>● {totalLive} LIVE</span>}
        </div>
      </div>

      {/* TABS */}
      <div style={{padding:"10px 12px 0",display:"flex",gap:8}}>
        <button onClick={()=>setTab("nba")} style={{flex:1,padding:"9px 0",borderRadius:9,border:"none",cursor:"pointer",fontFamily:"monospace",fontSize:12,fontWeight:900,background:tab==="nba"?"linear-gradient(135deg,#7c3aed,#5b21b6)":"#ffffff",color:tab==="nba"?"#fff":"#888",boxShadow:tab==="nba"?"0 2px 12px #7c3aed30":"0 1px 4px #00000010"}}>🏀 NBA {nbaLive.length>0&&`● ${nbaLive.length}`}</button>
        <button onClick={()=>setTab("nhl")} style={{flex:1,padding:"9px 0",borderRadius:9,border:"none",cursor:"pointer",fontFamily:"monospace",fontSize:12,fontWeight:900,background:tab==="nhl"?"linear-gradient(135deg,#0066cc,#003399)":"#ffffff",color:tab==="nhl"?"#fff":"#888",boxShadow:tab==="nhl"?"0 2px 12px #0066cc30":"0 1px 4px #00000010"}}>🏒 NHL {nhlLive.length>0&&`● ${nhlLive.length}`}</button>
      </div>

      {status==="loading"&&(
        <div style={{display:"flex",justifyContent:"center",alignItems:"center",height:"60vh",flexDirection:"column",gap:14}}>
          <div style={{color:"#aaa",fontSize:11,letterSpacing:2}}>Chargement...</div>
          <div style={{display:"flex",gap:6}}>{[0,1,2].map(i=><div key={i} style={{width:8,height:8,borderRadius:"50%",background:"#7c3aed",opacity:0.3+i*0.3}}/>)}</div>
        </div>
      )}

      {status==="error"&&(
        <div style={{margin:20,background:"#fff5f5",border:"1px solid #cc000030",borderRadius:12,padding:"18px 22px"}}>
          <div style={{color:"#cc0000",fontSize:12,marginBottom:8,fontWeight:700}}>⚠️ Impossible de charger les données</div>
          <button onClick={()=>{setStatus("loading");loadData();}} style={{background:"#7c3aed15",border:"1px solid #7c3aed30",borderRadius:6,color:"#7c3aed",fontFamily:"monospace",fontSize:11,padding:"6px 14px",cursor:"pointer",fontWeight:700}}>Réessayer</button>
        </div>
      )}

      {status==="ok"&&(
        <div style={{padding:12,display:"flex",flexDirection:"column",gap:8}}>

          {/* NBA TAB */}
          {tab==="nba"&&(<>
            {nbaLive.length>0&&(<>
              <div style={{color:"#cc0000",fontSize:8,letterSpacing:3,paddingLeft:3,fontWeight:700}}>● MATCHS EN DIRECT NBA</div>
              {nbaLive.map(g=><NBALiveCard key={g.id} game={g} selected={selectedNBAId===g.id} onSelect={setSelectedNBAId}/>)}
            </>)}
            {selectedNBA&&selectedNBA.isLive&&selectedNBA.total&&(
              <div style={{background:"#ffffff",border:`1px solid ${BORDERCOLORS[nbaSig.type]}`,borderRadius:15,padding:"16px 18px",boxShadow:"0 1px 8px #00000010"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                  <div>
                    <div style={{color:"#aaa",fontSize:9,letterSpacing:2,marginBottom:4}}>SIGNAL LIVE NBA</div>
                    <div style={{color:COLORS[nbaSig.type],fontSize:22,fontWeight:900}}>{nbaSig.label}</div>
                    <div style={{color:"#555",fontSize:10,marginTop:2,fontWeight:700}}>{selectedNBA.awayFull} @ {selectedNBA.homeFull}</div>
                  </div>
                  <Ring value={nbaSig.confidence} color={COLORS[nbaSig.type]} size={62}/>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
                  {[{label:"PROJETÉ",val:nbaSig.projection,color:COLORS[nbaSig.type]},{label:"LINE",val:selectedNBA.total,color:"#555"},{label:"EDGE",val:`${nbaSig.edge>0?"+":""}${nbaSig.edge}`,color:nbaSig.edge>3?"#007733":nbaSig.edge<-3?"#cc3300":"#888"}].map((m,i)=>(
                    <div key={i} style={{background:"#f4f4f4",border:"1px solid #e0e0e0",borderRadius:10,padding:"12px"}}>
                      <div style={{color:"#aaa",fontSize:8,marginBottom:3}}>{m.label}</div>
                      <div style={{color:m.color,fontSize:20,fontWeight:900}}>{m.val}</div>
                    </div>
                  ))}
                </div>
                <div style={{background:"#f4f4f4",borderRadius:10,padding:"14px"}}>
                  <div style={{color:"#7c3aed",fontSize:12,fontWeight:800,marginBottom:8}}>
                    {nbaSig.type==="STRONG_OVER"&&"→ BET OVER — forte conviction"}
                    {nbaSig.type==="OVER"&&"→ OVER possible — conviction moyenne"}
                    {nbaSig.type==="STRONG_UNDER"&&"→ BET UNDER — forte conviction"}
                    {nbaSig.type==="UNDER"&&"→ UNDER possible — surveiller"}
                    {nbaSig.type==="NEUTRAL"&&"→ Pas d'edge clair — attendre"}
                  </div>
                  <a href="https://polymarket.com/sports/basketball/nba" target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",gap:6,background:"linear-gradient(135deg,#7c3aed,#5b21b6)",color:"#fff",textDecoration:"none",borderRadius:7,padding:"8px 14px",fontSize:11,fontWeight:700}}>🔗 OUVRIR POLYMARKET</a>
                </div>
              </div>
            )}
            {nbaScheduled.length>0&&(<>
              <div style={{color:"#555",fontSize:8,letterSpacing:3,paddingLeft:3,fontWeight:700,marginTop:4}}>📊 PRÉDICTIONS PRÉ-MATCH NBA</div>
              {nbaScheduled.map(g=><NBAPreMatchCard key={g.id} game={g} teamStats={teamStats}/>)}
            </>)}
            {nbaGames.length===0&&<div style={{textAlign:"center",color:"#aaa",padding:40,fontSize:12}}>Aucun match NBA aujourd'hui</div>}
          </>)}

          {/* NHL TAB */}
          {tab==="nhl"&&(<>
            {nhlLive.length>0&&(<>
              <div style={{color:"#cc0000",fontSize:8,letterSpacing:3,paddingLeft:3,fontWeight:700}}>● MATCHS EN DIRECT NHL</div>
              {nhlLive.map(g=><NHLLiveCard key={g.id} game={g} selected={selectedNHLId===g.id} onSelect={setSelectedNHLId}/>)}
            </>)}
            {selectedNHL&&selectedNHL.isLive&&selectedNHL.total&&(
              <div style={{background:"#ffffff",border:`1px solid ${BORDERCOLORS[nhlSig.type]}`,borderRadius:15,padding:"16px 18px",boxShadow:"0 1px 8px #00000010"}}>
                <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
                  <div>
                    <div style={{color:"#aaa",fontSize:9,letterSpacing:2,marginBottom:4}}>SIGNAL LIVE NHL</div>
                    <div style={{color:COLORS[nhlSig.type],fontSize:22,fontWeight:900}}>{nhlSig.label}</div>
                    <div style={{color:"#555",fontSize:10,marginTop:2,fontWeight:700}}>{selectedNHL.awayFull} @ {selectedNHL.homeFull}</div>
                  </div>
                  <Ring value={nhlSig.confidence} color={COLORS[nhlSig.type]} size={62}/>
                </div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8,marginBottom:10}}>
                  {[{label:"PROJETÉ",val:nhlSig.projection,color:COLORS[nhlSig.type]},{label:"LINE",val:selectedNHL.total,color:"#555"},{label:"EDGE",val:`${nhlSig.edge>0?"+":""}${nhlSig.edge}`,color:nhlSig.edge>0.5?"#007733":nhlSig.edge<-0.5?"#cc3300":"#888"}].map((m,i)=>(
                    <div key={i} style={{background:"#f4f4f4",border:"1px solid #e0e0e0",borderRadius:10,padding:"12px"}}>
                      <div style={{color:"#aaa",fontSize:8,marginBottom:3}}>{m.label}</div>
                      <div style={{color:m.color,fontSize:20,fontWeight:900}}>{m.val}</div>
                    </div>
                  ))}
                </div>
                <div style={{background:"#f4f4f4",borderRadius:10,padding:"14px"}}>
                  <div style={{color:"#0066cc",fontSize:12,fontWeight:800,marginBottom:8}}>
                    {nhlSig.type==="STRONG_OVER"&&"→ BET OVER — forte conviction"}
                    {nhlSig.type==="OVER"&&"→ OVER possible — conviction moyenne"}
                    {nhlSig.type==="STRONG_UNDER"&&"→ BET UNDER — forte conviction"}
                    {nhlSig.type==="UNDER"&&"→ UNDER possible — surveiller"}
                    {nhlSig.type==="NEUTRAL"&&"→ Pas d'edge clair — attendre"}
                  </div>
                  <a href="https://www.betway.com/sports/hockey" target="_blank" rel="noopener noreferrer" style={{display:"inline-flex",alignItems:"center",gap:6,background:"linear-gradient(135deg,#0066cc,#003399)",color:"#fff",textDecoration:"none",borderRadius:7,padding:"8px 14px",fontSize:11,fontWeight:700}}>🔗 OUVRIR SPORTSBOOK</a>
                </div>
              </div>
            )}
            {nhlScheduled.length>0&&(<>
              <div style={{color:"#555",fontSize:8,letterSpacing:3,paddingLeft:3,fontWeight:700,marginTop:4}}>📊 PRÉDICTIONS PRÉ-MATCH NHL</div>
              {nhlScheduled.map(g=><NHLPreMatchCard key={g.id} game={g} nhlStats={nhlStats}/>)}
            </>)}
            {nhlGames.length===0&&<div style={{textAlign:"center",color:"#aaa",padding:40,fontSize:12}}>Aucun match NHL aujourd'hui</div>}
          </>)}

        </div>
      )}
    </div>
  );
}
