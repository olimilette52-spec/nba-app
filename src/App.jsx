  <div style={{padding:"12px 12px 0"}}>
    {loading&&<div style={{textAlign:"center",color:"#aaa",padding:40,fontSize:12}}>Chargement...</div>}

    {/* NBA TAB */}
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
                      {sig.projection>0&&<div style={{color:"#888",fontSize:9}}>Proj: {sig.projection} {g.total?`| Ligne: ${g.total}`:""}</div>}
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
              const overUnder=pm.proj>=(g.total||0)?pm.proj>g.total?"OVER":"EQUAL":"UNDER";
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
    {/* NHL TAB */}
    {!loading&&tab==="nhl"&&(
      <>
        {/* LIVE NHL */}
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

        {/* PRÉ-MATCH NHL */}
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
