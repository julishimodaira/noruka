const fs = require('fs');
const path = '/Users/jshimodaira/Downloads/noruka-pwa/src/App.jsx';
let code = fs.readFileSync(path, 'utf8');

// 1. Add useStationTimetable hook after useTrainInfo
const hook = `
// ── ODPT: station timetable ──────────────────────────────────────────────────
function useStationTimetable(stationId, operatorId) {
  const [departures, setDepartures] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!stationId || !operatorId) return;
    let cancelled = false;
    setLoading(true);

    // Determine if today is a weekday or weekend in Japan
    const now = new Date();
    const japanDay = new Date(now.toLocaleString('en-US', {timeZone: 'Asia/Tokyo'})).getDay();
    const isWeekend = japanDay === 0 || japanDay === 6;
    const calendar = isWeekend ? 'SaturdayHoliday' : 'Weekday';

    fetch(\`/api/odpt?type=StationTimetable&operator=\${operatorId}&station=odpt.Station:\${stationId}&calendar=\${calendar}\`)
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        if (cancelled) return;
        if (!Array.isArray(data)) { setDepartures([]); setLoading(false); return; }

        // Get current Japan time
        const japanNow = new Date(new Date().toLocaleString('en-US', {timeZone: 'Asia/Tokyo'}));
        const nowMinutes = japanNow.getHours() * 60 + japanNow.getMinutes();

        // Process each direction
        const processed = data.map(timetable => {
          const direction = timetable['odpt:railDirection'] || '';
          const dirName = direction.split(':').pop().replace(/.*\\./, '');
          const objects = timetable['odpt:stationTimetableObject'] || [];

          // Find next 4 departures from now
          const upcoming = objects
            .map(obj => {
              const t = obj['odpt:departureTime'] || obj['odpt:arrivalTime'] || '';
              if (!t) return null;
              const [h, m] = t.split(':').map(Number);
              const mins = h * 60 + m;
              return { time: t, mins, trainType: obj['odpt:trainType'] || '', destinationStation: obj['odpt:destinationStation'] || [] };
            })
            .filter(Boolean)
            .filter(obj => obj.mins >= nowMinutes)
            .slice(0, 4);

          return { direction: dirName, upcoming };
        }).filter(d => d.upcoming.length > 0);

        setDepartures(processed);
        setLoading(false);
      })
      .catch(() => { if (!cancelled) { setDepartures([]); setLoading(false); } });

    return () => { cancelled = true; };
  }, [stationId, operatorId]);

  return { departures, loading };
}
`;

code = code.replace('function useWeather()', hook + '\nfunction useWeather()');

// 2. Add calendar param support to api/odpt.js is handled separately
// 3. Add Departures tab to StationDetail tabs
code = code.replace(
  '["overview","📋 Overview"],["elevators","🛗 Elevators"],["cars","🚃 Car & Gap"],["comfort","🪑 Comfort"],["hotels","🏨 Hotels"],["phrases","🗣️ Phrases"],["toilets","🚻 Restrooms"]',
  '["overview","📋 Overview"],["departures","🕐 Departures"],["elevators","🛗 Elevators"],["cars","🚃 Car & Gap"],["comfort","🪑 Comfort"],["hotels","🏨 Hotels"],["phrases","🗣️ Phrases"],["toilets","🚻 Restrooms"]'
);

// 4. Add departures hook call in StationDetail
code = code.replace(
  'const { info: trainInfo } = useTrainInfo(station.lines);',
  `const { info: trainInfo } = useTrainInfo(station.lines);
  const operatorId = station.lines.some(l => ['Ginza','Marunouchi','Hibiya','Tozai','Chiyoda','Yurakucho','Hanzomon','Namboku','Fukutoshin'].includes(l)) ? 'TokyoMetro' : station.lines.some(l => ['Asakusa','Mita','Shinjuku Line','Oedo'].includes(l)) ? 'Toei' : null;
  const stationOdptId = operatorId ? operatorId + '.' + station.name.replace(/\\s+/g,'').replace(/-/g,'') + '.' + station.name.replace(/\\s+/g,'').replace(/-/g,'') : null;
  const { departures, loading: depLoading } = useStationTimetable(stationOdptId, operatorId);`
);

// 5. Add departures tab content before the elevators tab content
const deptabContent = `
      {tab==="departures"&&(
        <div>
          {depLoading && <div style={{textAlign:"center",padding:"24px",color:"rgba(255,255,255,0.4)",fontSize:13}}>Loading departures…</div>}
          {!depLoading && departures.length === 0 && (
            <div style={{textAlign:"center",padding:"24px",color:"rgba(255,255,255,0.35)",fontSize:12}}>
              <div style={{fontSize:28,marginBottom:8}}>🕐</div>
              <div>No upcoming departures found.</div>
              <div style={{fontSize:10,marginTop:6,color:"rgba(255,255,255,0.2)"}}>Timetable data available for Tokyo Metro and Toei lines.</div>
            </div>
          )}
          {departures.map((dir, i) => (
            <div key={i} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:12,padding:"13px 15px",marginBottom:10}}>
              <div style={{fontSize:11,fontWeight:700,color:"#7dd3fc",marginBottom:10,textTransform:"uppercase",letterSpacing:"1px"}}>→ {dir.direction}</div>
              <div style={{display:"flex",gap:8,flexWrap:"wrap"}}>
                {dir.upcoming.map((d, j) => (
                  <div key={j} style={{background:j===0?"rgba(59,130,246,0.2)":"rgba(255,255,255,0.06)",border:\`1px solid \${j===0?"rgba(59,130,246,0.5)":"rgba(255,255,255,0.1)"}\`,borderRadius:10,padding:"8px 14px",textAlign:"center",minWidth:60}}>
                    <div style={{fontSize:16,fontWeight:700,color:j===0?"#fff":"rgba(255,255,255,0.7)",fontFamily:"monospace"}}>{d.time}</div>
                    {j===0&&<div style={{fontSize:9,color:"#7dd3fc",marginTop:2}}>Next</div>}
                  </div>
                ))}
              </div>
            </div>
          ))}
          <div style={{fontSize:10,color:"rgba(255,255,255,0.25)",marginTop:8,lineHeight:1.6,textAlign:"center"}}>
            Scheduled times · Tokyo Metro and Toei lines only · Updated daily
          </div>
        </div>
      )}
`;

code = code.replace('{tab==="elevators"&&(', deptabContent + '\n      {tab==="elevators"&&(');

fs.writeFileSync(path, code);
console.log('Done!');
