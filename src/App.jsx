/* eslint-disable */
import { useState, useMemo, useEffect } from "react";
import T from "./translations";

// ─── CONSTANTS ────────────────────────────────────────────────────────────────
const HOURS = ["6am","8am","10am","12pm","2pm","4pm","6pm","8pm","10pm"];
const GAP = {none:"#34d399",small:"#7dd3fc",moderate:"#f59e0b",large:"#ef4444"};
const GAP_LABEL = {none:"No gap",small:"Small (~3–5cm)",moderate:"Moderate (~8cm)",large:"Large — ramp required"};
const DIFF_COLOR = {easy:"#34d399",moderate:"#f59e0b",hard:"#ef4444"};
const LINE_COLOR = {
  "Yamanote":"#9ACD32","Chuo":"#F15A22","Sobu":"#FFD400","Keihin-Tohoku":"#00B2E5",
  "Joban":"#00B261","Saikyo":"#00AC6B","Shonan-Shinjuku":"#e85298","Keikyu":"#e60033",
  "Keisei":"#e60039","Tokyu Toyoko":"#e60021","Tokyu Den-en-toshi":"#00AC6B",
  "Odakyu":"#0072BC","Keio":"#7B3F9E","Seibu Ikebukuro":"#F5A200","Tobu Tojo":"#EF7A00",
  "Ginza":"#F9A11B","Marunouchi":"#F62E36","Hibiya":"#9B7CB6","Tozai":"#009BBF",
  "Chiyoda":"#00BB85","Yurakucho":"#C3A03C","Hanzomon":"#8F76D6","Namboku":"#00ACA9",
  "Fukutoshin":"#9B5C2A","Asakusa":"#F15A22","Mita":"#2580C3","Shinjuku Line":"#7FBA00",
  "Oedo":"#E5171F","Rinkai":"#0068B7","Monorail":"#009A9A","Shinkansen":"#0032a0",
  "JR Osaka Loop":"#22c55e","Midosuji Line":"#e60039","Hankyu":"#4f46e5","Hanshin":"#7c3aed",
  "JR Tokaido Shinkansen":"#0032a0","JR Kyoto Line":"#F15A22","Karasuma Line":"#22c55e",
  "JR Hakodate Main":"#3b82f6","Toho Line":"#f59e0b","JR Kagoshima Line":"#ef4444",
  "Airport Line":"#8b5cf6",
};


// ─── LIVE WEATHER HOOK ───────────────────────────────────────────────────────
const TOILETS = {
  tokyo:           {location:"B1 Marunouchi South Exit & Yaesu Central concourse", note:"24hr, attendant available", baby:true},
  shinjuku:        {location:"West Exit B1 & South Exit B1 concourse", note:"24hr access, near taxi rank", baby:true},
  shibuya:         {location:"B3 Tokyu concourse near elevator", note:"Also in Scramble Square 2F", baby:true},
  asakusa:         {location:"1F near Kaminarimon Exit", note:"Attendant available 8am-9pm", baby:true},
  ueno:            {location:"Central concourse 1F & park exit", note:"Near park exit, attendant 8am-8pm", baby:true},
  ikebukuro:       {location:"East Exit B1 & West Exit concourse", note:"Near Seibu entrance, 24hr", baby:true},
  akihabara:       {location:"Electric Town Exit 1F", note:"Ground level, 24hr", baby:false},
  harajuku:        {location:"Takeshita Exit 1F", note:"New building, step-free access", baby:true},
  shinagawa:       {location:"Konan Exit concourse & Takanawa Exit", note:"Near buses, 24hr", baby:true},
  yurakucho:       {location:"Central Exit 1F near elevator", note:"Ground level access", baby:false},
  kanda:           {location:"East Exit 1F concourse", note:"Near elevator", baby:false},
  okachimachi:     {location:"South Exit 1F", note:"Street level", baby:false},
  uguisudani:      {location:"South Exit 1F", note:"Small station", baby:false},
  nippori:         {location:"West Exit concourse 1F", note:"Near Keisei transfer", baby:false},
  tabata:          {location:"South Exit 1F", note:"Simple layout", baby:false},
  komagome:        {location:"South Exit 1F", note:"Near elevator", baby:false},
  sugamo:          {location:"South Exit B1", note:"Near Mita Line", baby:false},
  otsuka:          {location:"South Exit 1F", note:"Near tram stop", baby:false},
  mejiro:          {location:"South Exit 1F", note:"Small station", baby:false},
  yoyogi:          {location:"East Exit 1F", note:"Near Oedo transfer", baby:false},
  ebisu:           {location:"West Exit 1F concourse", note:"Near Hibiya transfer", baby:true},
  meguro:          {location:"East Exit 1F", note:"Near Namboku transfer", baby:false},
  gotanda:         {location:"West Exit 1F", note:"Near Asakusa Line", baby:false},
  osaki:           {location:"East Exit concourse", note:"Near Rinkai Line", baby:false},
  tamachi:         {location:"East Exit 1F", note:"Near Mita Line", baby:false},
  hamamatsucho:    {location:"North Exit 1F concourse", note:"Near Monorail", baby:false},
  shimbashi:       {location:"North Exit 1F & SL Square", note:"Near Ginza Line", baby:true},
  koenji:          {location:"South Exit 1F", note:"Street level", baby:false},
  omotesando:      {location:"B4 Exit concourse", note:"Near all 3 lines", baby:true},
  roppongi:        {location:"Main Exit 1F & Midtown B1", note:"Also in Midtown mall", baby:true},
  kasumigaseki:    {location:"Exit C1 concourse", note:"Government area, clean facilities", baby:false},
  ginza:           {location:"A13 Exit concourse B1", note:"Near all 3 lines", baby:true},
  nihonbashi:      {location:"B1 Exit concourse", note:"Near Ginza Line", baby:false},
  otemachi:        {location:"C10 Exit concourse", note:"Large station, multiple facilities", baby:true},
  "tameike-sanno": {location:"Exit 7 concourse", note:"Clean, quiet station", baby:false},
  iidabashi:       {location:"West Exit concourse", note:"Near Sobu Line", baby:false},
  "kita-senju":    {location:"West Exit concourse 1F", note:"Near Joban Line", baby:true},
  haneda:          {location:"Arrivals level & departures 3F", note:"24hr, full facilities", baby:true},
  "azabu-juban":   {location:"Namboku Line concourse B3", note:"Near exit", baby:false},
  "shin-toyosu":   {location:"Station exit 1F", note:"Modern, fully accessible", baby:true},
};

const CHARGING = {
  tokyo:      [{location:"Gransta Mall 2F near Family Mart", note:"2 outlets, free, may need purchase"}],
  shinjuku:   [{location:"Lumine 1 & 2 rest areas", note:"Free charging spots near rest areas"}],
  shibuya:    [{location:"Scramble Square 2F lounge", note:"Free USB charging"}],
  ikebukuro:  [{location:"Echika pool B1 food court", note:"Free outlets near seating area"}],
  shinagawa:  [{location:"Ecute Shinagawa 2F", note:"Free outlets in food court seating"}],
  ueno:       [{location:"Ueno station waiting area 1F", note:"Free outlets near benches"}],
  haneda:     [{location:"Departures 3F & Arrivals 1F", note:"Multiple free charging stations"}],
  omotesando: [{location:"B4 waiting area", note:"Free USB outlets near benches"}],
};

const BABY_CHANGING = {
  tokyo:      {location:"B1 multipurpose toilet & Gransta Mall 2F", note:"Full nursing room in Gransta"},
  shinjuku:   {location:"West Exit B1 & South Exit concourse", note:"Nursing rooms in Lumine"},
  shibuya:    {location:"B3 multipurpose toilet & Scramble Square 2F", note:"Full nursing room available"},
  ikebukuro:  {location:"East Exit B1 & Tobu department store", note:"Multiple nursing rooms nearby"},
  shinagawa:  {location:"Konan Exit concourse", note:"Nursing room in Ecute"},
  ueno:       {location:"Central concourse 1F", note:"Baby room near multipurpose restroom"},
  haneda:     {location:"Arrivals 1F & Departures 3F", note:"Full nursing rooms, formula available"},
  asakusa:    {location:"1F near Kaminarimon Exit", note:"Baby changing table in multipurpose restroom"},
  harajuku:   {location:"Takeshita Exit 1F", note:"Baby changing in multipurpose restroom"},
  omotesando: {location:"B4 Exit concourse", note:"Baby changing in multipurpose restroom"},
  ebisu:      {location:"West Exit 1F", note:"Baby changing available"},
  roppongi:   {location:"Midtown B1", note:"Full nursing room in Midtown mall"},
  otemachi:   {location:"C10 Exit concourse", note:"Baby changing in multipurpose restroom"},
};

// ── ODPT: live train information ─────────────────────────────────────────────
function useTrainInfo(lines=[]) {
  const [info, setInfo] = React.useState([]);

  React.useEffect(() => {
    if (!lines.length) return;
    const operators = ['JR-East','TokyoMetro','Toei'];
    Promise.all(operators.map(op =>
      fetch(`/api/odpt?type=TrainInformation&operator=${op}`)
        .then(r => r.json())
        .catch(() => [])
    )).then(results => {
      const all = results.flat();
      const relevant = all.filter(item => {
        const railwayId = (item['odpt:railway'] || '').toLowerCase();
        return lines.some(line => railwayId.includes(line.toLowerCase().replace(/\s/g,'')));
      });
      setInfo(relevant);
    });
  }, [lines.join(',')]);

  return { info };
}

function useWeather() {
  const [weather, setWeather] = useState(WEATHER_FALLBACK);
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      const keys = Object.keys(CITY_COORDS);
      const results = {};
      await Promise.all(keys.map(async (city) => {
        try {
          const {lat, lng} = CITY_COORDS[city];
          const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lng}&current=temperature_2m,weathercode,is_day&timezone=auto`;
          const res = await fetch(url);
          const data = await res.json();
          const cur = data.current;
          const wmo = WMO(cur.weathercode, cur.is_day);
          const temp = Math.round(cur.temperature_2m);
          const warn = wmo.warn;
          results[city] = {
            icon: wmo.icon,
            temp: `${temp}°C`,
            label: wmo.label,
            warn,
            note: warn ? WARN_NOTE[warn] : WARN_NOTE["null"],
            live: true,
          };
        } catch(e) {
          results[city] = WEATHER_FALLBACK[city];
        }
      }));
      setWeather(results);
      setLastUpdated(new Date());
    };
    fetchAll();
    // Refresh every 30 minutes
    const interval = setInterval(fetchAll, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  return {weather, lastUpdated};
}


const PROFILE_TYPES = [
  {id:"manual",icon:"🦽",label:"Manual Wheelchair"},
  {id:"power",icon:"⚡",label:"Power Wheelchair"},
  {id:"walking_frame",icon:"🚶",label:"Walker"},
  {id:"visual",icon:"👁",label:"Visual Impairment"},
  {id:"companion",icon:"👥",label:"With Caretaker"},
  {id:"stroller",icon:"🍼",label:"Stroller"},
];

const PHRASES = [
  {cat:"Navigation",jp:"エレベーターはどこですか？",ro:"Erebētā wa doko desu ka?",en:"Where is the elevator?"},
  {cat:"Navigation",jp:"広い改札口はどこですか？",ro:"Hiroi kaisatsuguchi wa doko desu ka?",en:"Where is the wide ticket gate?"},
  {cat:"Navigation",jp:"車椅子用のトイレはありますか？",ro:"Kurumaisu-yō no toire wa arimasu ka?",en:"Is there a wheelchair restroom?"},
  {cat:"Navigation",jp:"出口はどこですか？",ro:"Deguchi wa doko desu ka?",en:"Where is the exit?"},
  {cat:"Assistance",jp:"手伝っていただけますか？",ro:"Tetsudatte itadakemasu ka?",en:"Could you please help me?"},
  {cat:"Assistance",jp:"乗車のお手伝いをお願いできますか？",ro:"Jōsha no otetsudai o onegai dekimasu ka?",en:"Can you assist with boarding?"},
  {cat:"Assistance",jp:"このエレベーターは動いていますか？",ro:"Kono erebētā wa ugoite imasu ka?",en:"Is this elevator working?"},
  {cat:"Assistance",jp:"スロープはありますか？",ro:"Surōpu wa arimasu ka?",en:"Is there a ramp?"},
  {cat:"Medical",jp:"救急車を呼んでください",ro:"Kyūkyūsha o yonde kudasai",en:"Please call an ambulance"},
  {cat:"Medical",jp:"AEDはどこですか？",ro:"AED wa doko desu ka?",en:"Where is the AED?"},
  {cat:"Medical",jp:"気分が悪いです",ro:"Kibun ga warui desu",en:"I am feeling unwell"},
  {cat:"Medical",jp:"この薬が必要です",ro:"Kono kusuri ga hitsuyō desu",en:"I need this medication"},
  {cat:"Emergency",jp:"助けてください",ro:"Tasukete kudasai",en:"Please help me"},
  {cat:"Emergency",jp:"英語を話せる方はいますか？",ro:"Eigo o hanaseru kata wa imasu ka?",en:"Does anyone speak English?"},
];

// ─── WEATHER ─────────────────────────────────────────────────────────────────
// City coordinates for Open-Meteo API (free, no key needed)
const CITY_COORDS = {
  tokyo:   {lat:35.6762, lng:139.6503},
  osaka:   {lat:34.6937, lng:135.5023},
  kyoto:   {lat:35.0116, lng:135.7681},
  sapporo: {lat:43.0642, lng:141.3469},
  fukuoka: {lat:33.5904, lng:130.4017},
};

// Weather code → emoji + label + warn type
const WMO = (code, isDay=1) => {
  if(code===0) return {icon:"☀️",label:"Clear",warn:null};
  if(code<=2)  return {icon:isDay?"⛅":"🌙",label:"Partly Cloudy",warn:null};
  if(code<=3)  return {icon:"☁️",label:"Overcast",warn:null};
  if(code<=49) return {icon:"🌫",label:"Foggy",warn:null};
  if(code<=59) return {icon:"🌦",label:"Drizzle",warn:"rain"};
  if(code<=69) return {icon:"🌧",label:"Rain",warn:"rain"};
  if(code<=79) return {icon:"❄️",label:"Snow",warn:"ice"};
  if(code<=84) return {icon:"🌧",label:"Rain Showers",warn:"rain"};
  if(code<=87) return {icon:"🌨",label:"Snow Showers",warn:"ice"};
  if(code<=99) return {icon:"⛈",label:"Thunderstorm",warn:"storm"};
  return {icon:"🌡",label:"Unknown",warn:null};
};

const WARN_NOTE = {
  rain: "⚠️ Rain may affect outdoor ramps — allow extra time.",
  ice:  "⚠️ Ice risk on ramps. Extra caution advised.",
  storm:"⚠️ Storm conditions — check station alerts.",
  null: "Good conditions for travel.",
};

// Fallback static weather if API is unavailable
const WEATHER_FALLBACK = {
  tokyo:   {icon:"⛅",temp:"14°C",label:"Partly Cloudy",warn:null,note:"Good conditions."},
  osaka:   {icon:"☁️",temp:"16°C",label:"Cloudy",warn:null,note:"Good conditions."},
  kyoto:   {icon:"☀️",temp:"12°C",label:"Clear",warn:null,note:"Good conditions."},
  sapporo: {icon:"❄️",temp:"-2°C",label:"Snow",warn:"ice",note:"⚠️ Ice risk on ramps. Extra caution."},
  fukuoka: {icon:"☀️",temp:"17°C",label:"Clear",warn:null,note:"Good conditions."},
};

// ─── DATA HELPERS ─────────────────────────────────────────────────────────────
const C = (a,b,c,d,e,f,g,h,i) => ({"6am":a,"8am":b,"10am":c,"12pm":d,"2pm":e,"4pm":f,"6pm":g,"8pm":h,"10pm":i});

// Real elevator data keyed by station id
// Each entry: { location, floors, landmark, doorWidthCm, tip, status }
// Where to find staff assistance at each station
// gate: where the wide/accessible ticket gate is
// look: what to look for visually
// intercom: where the intercom/call button is
// tip: extra practical note
const STAFF_LOCATION = {
  tokyo:      {gate:"Marunouchi Central Gate (main hall) or Yaesu Central Gate", look:"Wide gate marked with a blue [wheelchair] symbol — usually the leftmost or rightmost lane", intercom:"Press the silver intercom button on the gate pillar; a green light means staff are alerted", tip:"At busy times, go to the JR East Service Counter (Marunouchi South, 1F) for dedicated accessible travel help"},
  asakusa:    {gate:"Kaminarimon Exit — the gate closest to the Kaminarimon Gate exit on the west side", look:"Wide blue gate, staff desk is directly to the right as you pass through", intercom:"Intercom button on the left pillar of the wide gate", tip:"Staff speak limited English but are very helpful — show them your destination on the phrase card"},
  shinjuku:   {gate:"West Exit Central Gate or South Exit — both have dedicated wide gates", look:"Blue [wheelchair] lane, usually second from the end of the gate row", intercom:"Intercom on gate pillar; alternatively walk to the JR East Midori no Madoguchi (green counter) inside West Exit", tip:"For Odakyu or Keio transfers, ask JR staff first — they will call ahead to the private line staff"},
  shibuya:    {gate:"JR Hachiko Exit — wide gate on the far left of the gate row", look:"Blue [wheelchair] symbol above the gate; staff booth is directly behind it", intercom:"Press intercom on gate pillar or call out to the staff booth window", tip:"Scramble Square side (east) has a newer, less crowded accessible gate — worth using if Hachiko side is busy"},
  ikebukuro:  {gate:"West Exit Main Gate — wide gate on the south end of the gate row", look:"Blue [wheelchair] gate; staffed booth is visible from the gate, facing the Tobu department store", intercom:"Press intercom or knock on the booth window — staff respond quickly", tip:"For Metro transfers, JR staff can call ahead to the Metro gate staff so they're ready for you"},
  ueno:       {gate:"Ueno Park Exit — wide gate on the left side as you face the gate row", look:"Blue [wheelchair] lane; green-uniformed JR staff are usually standing nearby during peak hours", intercom:"Intercom on gate pillar; staff desk also inside to the left", tip:"Tell staff your destination before you go through — they will phone ahead to your arrival station"},
  shinagawa:  {gate:"Takanawa Gate (east side) — wide gate at the south end", look:"Blue [wheelchair] gate with staff booth behind; 24h staffed", intercom:"Intercom on pillar, or speak directly to booth staff", tip:"For Shinkansen, go to the Shinkansen Midori no Madoguchi first to confirm your wheelchair reservation"},
  akihabara:  {gate:"Electric Town Exit — wide gate on the left side of the gate row", look:"Blue [wheelchair] symbol above gate; staff are often visible at the adjacent booth", intercom:"Intercom on gate pillar", tip:"For Hibiya Line, JR staff will walk you to the exit and direct you to the Hibiya station entrance 2 min away"},
  ginza:      {gate:"Exit A13 — wide gate at the bottom of the A13 elevator", look:"Blue [wheelchair] gate directly facing the elevator exit; staff booth is to the right", intercom:"Intercom on gate pillar or speak to booth", tip:"All 3 lines share the same concourse — once through the gate, one staff member can assist with all transfers"},
  omotesando: {gate:"Exit B2 — wide gate at street level, corner of Omotesando and Aoyama-dori", look:"Blue [wheelchair] gate on the left side; staff booth is just inside", intercom:"Intercom on left pillar of wide gate", tip:"Station is calm and staff are attentive — one of the easier stations for getting assistance"},
  otemachi:   {gate:"Exit C10 — wide gate on the east side of the main concourse", look:"Blue [wheelchair] gate at the end of the gate row; this is one of Tokyo's busiest stations so staff are always present", intercom:"Intercom on gate pillar; alternatively go to the Metro information counter 20m inside", tip:"With 5 lines, tell staff your exact destination line — they will contact the correct platform staff"},
  kita_senju: {gate:"West Exit North Gate — wide gate at the north end of the JR gate row", look:"Blue [wheelchair] gate; green-uniformed JR staff usually standing nearby", intercom:"Intercom on gate pillar", tip:"Use the north gate only — south end has escalator-only zones that are difficult to navigate"},
  haneda:     {gate:"Arrivals level — wide gate at the Keikyu/Monorail transfer point, clearly signed", look:"Large blue [wheelchair] signs throughout; airport staff in blue uniforms are stationed at all key points", intercom:"Not needed — staff are visible and proactive at this airport station", tip:"WAV taxi rank is before the transfer gate on Arrivals level — sort your onward transport before going to the platform"},
  // Osaka
  "osaka-umeda": {gate:"Central Gate — wide gate in the centre of the main concourse", look:"Blue [wheelchair] gate with a staffed booth directly behind it; yellow tactile strip leads from elevator to gate", intercom:"Intercom on gate pillar", tip:"North Concourse elevator is currently under maintenance — Central Gate staff can advise on the best route"},
  namba:      {gate:"Main Exit — wide gate on the south side of the concourse", look:"Blue [wheelchair] gate; Midosuji Line staff wear dark blue uniforms and are stationed near the gate", intercom:"Intercom on gate pillar", tip:"Multiple operators here — tell staff which line you are using so they contact the right team"},
  tennoji:    {gate:"West Gate — wide gate on the left side, facing Abeno Harukas tower", look:"Blue [wheelchair] gate; staff booth is immediately behind it", intercom:"Intercom on gate pillar", tip:"JR and Metro staff share this concourse — either can assist regardless of which line you are using"},
  // Kyoto
  "kyoto-main": {gate:"Central Gate — wide gate in the main hall, centre of the gate row", look:"Blue [wheelchair] gate with staff booth behind; green-uniformed JR staff also patrol the main hall", intercom:"Intercom on gate pillar or speak to Midori no Madoguchi counter (left of gate row)", tip:"One of Japan's best-staffed stations for accessibility — staff proactively approach wheelchair users"},
  // Sapporo
  "sapporo-main": {gate:"South Exit Gate — wide gate at the south end of the gate row", look:"Blue [wheelchair] gate; in winter, staff in orange high-vis vests are stationed nearby", intercom:"Intercom on gate pillar", tip:"In winter, ask staff to confirm the heated walkway route — outdoor paths may be icy"},
  odori:      {gate:"East Concourse Gate — wide gate facing the east exit", look:"Blue [wheelchair] gate; subway staff in dark blue uniforms are usually nearby", intercom:"Intercom on gate pillar", tip:"All 3 Sapporo subway lines share staff — any staff member can assist regardless of your line"},
  // Fukuoka
  hakata:     {gate:"Hakata Exit Gate — wide gate on the left side of the main gate row", look:"Blue [wheelchair] gate with staff booth behind; JR Kyushu staff in dark blue uniforms", intercom:"Intercom on gate pillar or speak directly to booth", tip:"One of Japan's most efficient accessible stations — staff respond within seconds"},
  tenjin:     {gate:"Main Exit Gate — wide gate on the south side", look:"Blue [wheelchair] gate; Fukuoka City Subway staff in green uniforms are stationed nearby", intercom:"Intercom on gate pillar", tip:"Ask staff for a ramp to the train — they deploy it within 1–2 minutes"},
};

// Fallback for stations without specific data
const DEFAULT_STAFF = {gate:"Main ticket gate — look for the wide gate with a blue [wheelchair] symbol", look:"Wide gate, usually at one end of the gate row. Yellow tactile strip on floor leads from elevator to gate.", intercom:"Press the silver intercom button on the gate pillar to alert staff", tip:"Tell staff your destination station before going through — they will phone ahead so assistance is ready on arrival"};

const ELEVATOR_DATA = {
  tokyo:[
    {location:"Marunouchi North Exit",floors:"Street → B1 (Marunouchi Line)",landmark:"Near Marunouchi Building, outside ticket gates",doorWidthCm:140,tip:"Widest elevator — best for power chairs",status:"operational"},
    {location:"Marunouchi South Exit",floors:"Street → B1 (Marunouchi Line)",landmark:"Near Daimaru department store",doorWidthCm:140,tip:"24h accessible taxi rank right outside",status:"operational"},
    {location:"Yaesu Central",floors:"B1 → 1F → 2F (Shinkansen)",landmark:"Inside Yaesu concourse near ticket gates",doorWidthCm:120,tip:"Links JR platforms to Shinkansen level",status:"maintenance"},
    {location:"Yaesu North",floors:"1F → 2F (Shinkansen north platforms)",landmark:"Near Yaesu North Exit",doorWidthCm:120,tip:"Use if Yaesu Central is out of service",status:"operational"},
    {location:"Keiyo Line Transfer",floors:"1F → B2 (Keiyo Line)",landmark:"East side of station, separate concourse",doorWidthCm:120,tip:"Only route to Keiyo Line platforms",status:"operational"},
    {location:"Gransta Mall",floors:"B1 → 1F → 2F",landmark:"Inside shopping concourse",doorWidthCm:100,tip:"Shopping access only — not for platform transfer",status:"operational"},
  ],
  asakusa:[
    {location:"Kaminarimon Exit (Asakusa Line)",floors:"Street (1F) → Concourse (B1) → Platform (B2)",landmark:"Directly beside Kaminarimon Gate exit, west side",doorWidthCm:140,tip:"This is the main accessible entry — staff desk is right next to it",status:"operational"},
    {location:"Ginza Line Transfer",floors:"Concourse (B1) → Ginza Line Platform (B3)",landmark:"Inside paid area, follow yellow [wheelchair] line from ticket gate",doorWidthCm:120,tip:"Ginza Line elevator is small — power wheelchair users should confirm fit with staff",status:"operational"},
    {location:"East Exit (Tobu Skytree Line)",floors:"Street → Concourse → Platform",landmark:"East side, under Azumabashi bridge approach",doorWidthCm:140,tip:"Use for Tobu Skytree Line to Tokyo Skytree — step-free throughout",status:"operational"},
    {location:"Azumabashi Exit",floors:"Street (1F) → B1 Concourse",landmark:"Near Sumida River waterbus pier",doorWidthCm:120,tip:"Closest exit to Tokyo Skytree waterbus — ask staff about ramp to pier",status:"operational"},
  ],
  shinjuku:[
    {location:"West Exit (Odakyu / Keio)",floors:"Street → B1 → B2 (Marunouchi Line)",landmark:"West Exit plaza, near Odakyu Halc department store",doorWidthCm:140,tip:"Best starting point for Odakyu and Keio transfers",status:"operational"},
    {location:"Central West Gate",floors:"Concourse B1 → JR platforms (1F)",landmark:"Between East and West ticket gates",doorWidthCm:120,tip:"Main route from JR to underground lines",status:"operational"},
    {location:"South Exit",floors:"Street → B1 (Shinjuku Line / Oedo)",landmark:"Near Takashimaya Times Square",doorWidthCm:140,tip:"Best exit for Shinjuku Line and Oedo Line transfers",status:"operational"},
    {location:"South Exit B1",floors:"B1 → B2 (Oedo deep level)",landmark:"Inside paid area, follow signs for Oedo Line",doorWidthCm:120,tip:"Slow at peak hours — use earlier or later in day",status:"operational"},
    {location:"East Exit",floors:"Street → B1 concourse",landmark:"Kabukicho side, near Studio Alta building",doorWidthCm:120,tip:"Exit for Kabukicho area — busy on evenings and weekends",status:"operational"},
    {location:"Seibu-Shinjuku connector",floors:"JR B1 → Seibu Shinjuku Station (street)",landmark:"North end of JR concourse",doorWidthCm:100,tip:"Small elevator — manual chairs only. Power chair users take surface route.",status:"operational"},
  ],
  shibuya:[
    {location:"Hachiko Exit (JR)",floors:"Street → JR Concourse (2F)",landmark:"Hachiko statue side, southwest corner",doorWidthCm:140,tip:"Most recognisable entrance — staff intercom on pillar to left",status:"operational"},
    {location:"Scramble Square (JR transfer)",floors:"2F JR → B1 Metro concourse",landmark:"Inside Scramble Square building, east side",doorWidthCm:140,tip:"Newest and most spacious elevator route — recommended over older west side",status:"operational"},
    {location:"Ginza Line (deep)",floors:"JR 2F → Ginza Line Platform (3F above street)",landmark:"Northeast corner, older section of station",doorWidthCm:100,tip:"Ginza Line sits above street level here — 3 elevator stages total. Allow 12 min.",status:"operational"},
    {location:"Mark City (Keio Inokashira)",floors:"Street → Mark City 2F → Platform",landmark:"West side, connected to Bunkamura street",doorWidthCm:120,tip:"Step-free route to Keio Inokashira Line via Mark City mall",status:"operational"},
    {location:"Tokyu Toyoko / Den-en-toshi",floors:"Street → B3 → B5 (Toyoko platform)",landmark:"East side, Hikarie building approach",doorWidthCm:140,tip:"Toyoko Line is very deep — B5. Allow extra time. Hikarie elevator is reliable.",status:"operational"},
  ],
  ikebukuro:[
    {location:"West Exit (Seibu / Tobu)",floors:"Street → JR West concourse (1F) → B1",landmark:"West Exit plaza near Tobu department store",doorWidthCm:140,tip:"24h WAV taxi rank at West Exit. Start here for Seibu Ikebukuro and Tobu transfers.",status:"operational"},
    {location:"Metro West (Marunouchi / Fukutoshin)",floors:"JR B1 → Metro B3",landmark:"Inside JR paid area, connecting passage",doorWidthCm:120,tip:"3 elevator stages to Marunouchi Line — allow 15 min total from JR",status:"operational"},
    {location:"East Exit (Seibu Ikebukuro Line)",floors:"Street → 2F Seibu concourse",landmark:"East plaza near Parco department store",doorWidthCm:140,tip:"Seibu Ikebukuro Line has good accessibility — less crowded than JR at peak",status:"operational"},
    {location:"North Exit",floors:"Street → B1 JR concourse",landmark:"Near Ikebukuro station north entrance, cinema street",doorWidthCm:140,tip:"Alternative to West Exit if West Exit B1 elevator is busy",status:"operational"},
    {location:"Yurakucho Line (deep)",floors:"B1 → B4 (Yurakucho / Fukutoshin Line)",landmark:"Follow [wheelchair] signs inside Metro paid area",doorWidthCm:120,tip:"Deep platforms — 2 elevators needed. Staff at B1 gate can guide you.",status:"operational"},
  ],
  ueno:[
    {location:"Ueno Park Exit (JR)",floors:"Street → JR Concourse (1F)",landmark:"West side, facing Ueno Park entrance",doorWidthCm:140,tip:"Main exit for Ueno Zoo and National Museum — all accessible from here",status:"operational"},
    {location:"Shinobazu Exit (JR)",floors:"Street → JR Concourse",landmark:"East side, near Ameya-Yokocho market",doorWidthCm:120,tip:"Crowded at weekends — use Ueno Park exit for quieter access",status:"operational"},
    {location:"Ginza Line Transfer",floors:"JR 1F → Ginza Line B2",landmark:"Inside JR concourse, follow blue [wheelchair] signs",doorWidthCm:140,tip:"Two elevators in sequence — first outside ticket gate, second inside",status:"operational"},
    {location:"Hibiya Line Transfer",floors:"JR 1F → Hibiya Line B2",landmark:"South end of JR concourse",doorWidthCm:120,tip:"Hibiya Line platform is step-free once you reach it",status:"operational"},
    {location:"Keisei Ueno (street surface)",floors:"Street → Keisei Concourse (2F above street)",landmark:"Separate Keisei station building, 3 min walk north",doorWidthCm:140,tip:"Keisei Skyliner to Narita — book wheelchair seat in advance",status:"operational"},
  ],
  omotesando:[
    {location:"Exit B2 (Chiyoda Line)",floors:"Street → B2 concourse → B3 platform",landmark:"Corner of Omotesando and Aoyama-dori, near H&M",doorWidthCm:140,tip:"Widest exit — best for power wheelchairs and buggies",status:"operational"},
    {location:"Exit B1 (Ginza / Hanzomon)",floors:"Street → B2 concourse",landmark:"Omotesando Hills side",doorWidthCm:120,tip:"All 3 lines share the B2 concourse — transfers are level and simple",status:"operational"},
    {location:"Exit A2 (surface)",floors:"Street → B1",landmark:"Near Nezu Museum",doorWidthCm:120,tip:"Quieter exit, less foot traffic",status:"operational"},
    {location:"Platform Transfer (internal)",floors:"B3 Chiyoda → B2 → B4 Ginza/Hanzomon",landmark:"Inside paid area",doorWidthCm:120,tip:"No exit needed for line transfers — follow [wheelchair] signs between platforms",status:"operational"},
  ],
  akihabara:[
    {location:"Electric Town Exit (JR)",floors:"Street → JR Concourse (1F)",landmark:"West side, Akihabara Electric Town",doorWidthCm:140,tip:"Main exit, facing the electronics district",status:"operational"},
    {location:"Showa-dori Exit (JR)",floors:"Street → JR Concourse (1F)",landmark:"East side, near Showa-dori road",doorWidthCm:120,tip:"Quieter than Electric Town side — use for Hibiya Line transfer start",status:"operational"},
    {location:"Hibiya Line Transfer",floors:"JR 1F → exit street → Akihabara (Hibiya) B2",landmark:"Exit JR, walk 2 min south to separate Hibiya entrance",doorWidthCm:120,tip:"Hibiya transfer requires leaving JR paid area — exit through Showa-dori side",status:"operational"},
    {location:"Sobu Line Platform",floors:"JR 1F Concourse → Sobu Platform (2F)",landmark:"Same building, upper level",doorWidthCm:120,tip:"Sobu Line is above JR Yamanote — use internal elevator inside paid area",status:"operational"},
  ],
  ginza:[
    {location:"Exit A13 (main accessible)",floors:"Street → B1 concourse → B2 platform (Ginza)",landmark:"Corner of Chuo-dori and Harumi-dori, near Mitsukoshi",doorWidthCm:140,tip:"Widest and best-lit elevator — start here",status:"operational"},
    {location:"Exit C2 (Hibiya Line)",floors:"Street → B1 → B3 (Hibiya Line platform)",landmark:"Ginza Six department store side",doorWidthCm:140,tip:"Hibiya Line sits deeper — 2 elevators in sequence",status:"operational"},
    {location:"Exit B3 (Marunouchi Line)",floors:"Street → B3 (Marunouchi platform)",landmark:"Near Wako building",doorWidthCm:120,tip:"Marunouchi Line platform is step-free once you reach concourse",status:"operational"},
    {location:"Internal transfer (all 3 lines)",floors:"B1 concourse connects all lines",landmark:"Inside paid area",doorWidthCm:120,tip:"No need to exit — all 3 lines connected at B1. Follow [wheelchair] signs.",status:"operational"},
  ],
  shirokane_takanawa:[
    {location:"Exit 1",floors:"Street → B1 concourse → B2 platform (Namboku)",landmark:"Main north exit",doorWidthCm:140,tip:"Quiet station — elevator usually available immediately",status:"operational"},
    {location:"Exit 2 (Mita Line)",floors:"Street → B1 → B2 (Mita Line platform)",landmark:"South exit near Takanawa area",doorWidthCm:140,tip:"Namboku and Mita Line platforms are adjacent — transfer is level",status:"operational"},
    {location:"Internal transfer",floors:"B2 Namboku ↔ B2 Mita",landmark:"Inside paid area, same level",doorWidthCm:120,tip:"One of Tokyo's easiest line transfers — no height change",status:"operational"},
  ],
  shinagawa:[
    {location:"Takanawa Exit (east, Shinkansen)",floors:"Street → JR Concourse (1F) → Shinkansen (2F)",landmark:"East side, main Shinkansen entrance",doorWidthCm:140,tip:"Shinkansen platform accessible via this lift — 24h WAV taxis at rank outside",status:"operational"},
    {location:"Konan Exit (west, Keikyu)",floors:"Street → JR Concourse → Keikyu Concourse",landmark:"West side, near InterContinental hotel",doorWidthCm:140,tip:"Keikyu Line to Haneda Airport — step-free all the way",status:"operational"},
    {location:"Platform 1–4 (Yamanote / Keihin-Tohoku)",floors:"JR Concourse (1F) → Platforms (1F, same level)",landmark:"Central station",doorWidthCm:140,tip:"Yamanote and Keihin-Tohoku platforms are at ground level — no lift needed from concourse",status:"operational"},
    {location:"Shinkansen Platform 21–24",floors:"JR 1F → Shinkansen Concourse (2F) → Platform (2F)",landmark:"North end of Shinkansen gates",doorWidthCm:140,tip:"Reserve wheelchair space in advance. Staff will meet you at the gate.",status:"operational"},
  ],
  kita_senju:[
    {location:"West Exit North (JR / Joban)",floors:"Street → JR Concourse (2F) → Platform (2F)",landmark:"North end of West Exit building",doorWidthCm:140,tip:"Use this elevator bank — southern end has escalator-only zones",status:"operational"},
    {location:"Chiyoda Line Transfer",floors:"JR 2F → Chiyoda concourse (B1) → Platform (B2)",landmark:"Inside JR paid area, follow blue signs",doorWidthCm:120,tip:"Two separate elevators in sequence — staff at JR gate can guide you",status:"operational"},
    {location:"Hibiya Line Transfer",floors:"JR 2F → Hibiya concourse (B1) → Platform (B3)",landmark:"South end of Metro concourse",doorWidthCm:120,tip:"Hibiya platform is deepest — allow 15 min for this transfer",status:"operational"},
    {location:"Tobu Skytree Line",floors:"Street → Tobu Concourse (2F) → Platform (2F)",landmark:"East side, separate Tobu entrance building",doorWidthCm:140,tip:"Separate fare area — buy Tobu ticket before entering",status:"operational"},
    {location:"Tsukuba Express",floors:"Street → TX Concourse (1F) → Platform (B1)",landmark:"West Exit South, separate TX entrance",doorWidthCm:140,tip:"TX station is modern and fully step-free",status:"operational"},
  ],
  haneda:[
    {location:"Arrivals → Keikyu / Monorail",floors:"Arrivals (1F) → Transfer Hall (2F) → Platforms (3F)",landmark:"Follow red Keikyu signs or blue Monorail signs from arrivals",doorWidthCm:140,tip:"WAV taxi rank is on Arrivals level before this elevator — pre-book via JapanTaxi app",status:"operational"},
    {location:"International Arrivals Hall",floors:"Arrivals (1F) → Departures (2F) → Roof Garden (5F)",landmark:"Main arrivals hall, large lift near customs exit",doorWidthCm:140,tip:"Accessible restroom and prayer room on 4F",status:"operational"},
    {location:"Monorail Platform",floors:"Connecting bridge → Monorail (3F)",landmark:"Follow Monorail signs from main terminal",doorWidthCm:140,tip:"Monorail to Hamamatsucho is step-free throughout",status:"operational"},
  ],
  // simpler stations with 2–3 lifts get concise entries
  kanda:[
    {location:"North Exit",floors:"Street → JR Concourse (1F)",landmark:"North side, near Kanda River",doorWidthCm:140,tip:"One elevator per side — if busy, ask staff",status:"operational"},
    {location:"South Exit",floors:"Street → JR Concourse (1F)",landmark:"South side near Kanda Myojin shrine approach",doorWidthCm:140,tip:"Ginza Line transfer from here — walk 4 min to Awajicho or Kanda Metro station",status:"operational"},
    {location:"Ginza Line (Kanda Metro)",floors:"Street → B1 concourse → B2 platform",landmark:"Separate station 4 min walk south on Chuo-dori",doorWidthCm:120,tip:"JR Kanda and Ginza Line Kanda are different buildings",status:"operational"},
  ],
  okachimachi:[
    {location:"North Exit",floors:"Street → JR Concourse (1F)",landmark:"North side, near Ueno park direction",doorWidthCm:140,tip:"Single elevator — may have short wait at peak hours",status:"operational"},
    {location:"South Exit",floors:"Street → JR Concourse (1F)",landmark:"South side, Ameyoko market direction",doorWidthCm:140,tip:"Closest exit to Ameyoko shopping street",status:"operational"},
  ],
  ebisu:[
    {location:"West Exit (JR)",floors:"Street → JR Concourse (1F)",landmark:"Main west exit, facing Ebisu Garden Place skywalk",doorWidthCm:140,tip:"Skywalk to Ebisu Garden Place is covered and accessible",status:"operational"},
    {location:"Hibiya Line Transfer",floors:"JR 1F → Hibiya concourse (B1) → Platform (B2)",landmark:"Inside JR concourse, south end",doorWidthCm:140,tip:"Easy 1-elevator transfer — one of Tokyo's simplest Metro connections",status:"operational"},
    {location:"East Exit",floors:"Street → JR Concourse (1F)",landmark:"East side",doorWidthCm:120,tip:"Smaller — manual chairs only recommended",status:"operational"},
  ],
};

// Auto-generate elevators for stations without specific data
const makeDefaultElevators = (id,count) =>
  ELEVATOR_DATA[id] ||
  Array.from({length:count},(_,i)=>({
    id:i+1,
    location: i===0 ? "Main Exit" : i===1 ? "Transfer Corridor" : `Platform Access ${i+1}`,
    floors: i===0 ? "Street (1F) → Concourse (B1)" : i===1 ? "Concourse (B1) → Platform (B2)" : "Concourse → Platform",
    landmark: "Follow [wheelchair] signs from ticket gate",
    doorWidthCm: 120,
    tip: "Ask staff at gate to confirm current operational status",
    status:"operational",
    verified:"recently",
    verifiedCount: Math.floor(Math.random()*15)+3,
  }));

// Compact station builder for Tokyo's 60-station dataset
const mk = (id,name,jp,lat,lng,lines,elevs,score,diff,assist,phone,wcCar,gap,crowding,quiet,txNote,taxi,med,alerts=[],hotels=[],restAreas=[],charging=[]) => ({
  id,name,nameJp:jp,lat,lng,lines,elevatorCount:elevs,accessScore:score,
  transferDifficulty:diff,staffAssist:assist,phone,wheelchairCar:wcCar,platformGap:gap,
  crowding,quietHours:quiet,transferNote:txNote,taxiInfo:taxi,medicalNearby:med,
  alerts,nearbyHotels:hotels,restAreas,chargingPoints:charging,
  elevators: makeDefaultElevators(id,elevs),
});

// ─── TOKYO STATIONS (60) ──────────────────────────────────────────────────────
const TOKYO_STATIONS = [
  mk("tokyo","Tokyo Station","東京駅",35.6812,139.7671,["Yamanote","Chuo","Keihin-Tohoku","Shinkansen"],12,5,"moderate",true,"03-3212-2882","Car 3 (Yamanote) · Car 7 (Chuo)","small",C(2,9,5,6,4,5,9,7,3),"10am–12pm weekdays","JR to Marunouchi Line: 2 elevator changes, 10 min.","Marunouchi South Exit (24h WAV)","Tokyo Station Medical (1F)",[{type:"warning",msg:"Yaesu Central elevator under maintenance until further notice"}],[{name:"Palace Hotel Tokyo",distance:"5 min",score:5,notes:"Roll-in shower, accessible pool, trained staff."},{name:"Marunouchi Hotel",distance:"3 min",score:4,notes:"Step-free from station via underground passage."}],[{location:"Central Concourse (1F)",type:"seating",notes:"Benches with armrests near main pillars."},{location:"Gransta Mall (2F)",type:"lounge",notes:"Air-conditioned seating near south end."}],[{location:"Gransta Mall 2F near Family Mart",notes:"2x outlets. Free. May need purchase."}]),
  mk("kanda","Kanda Station","神田駅",35.6918,139.7708,["Yamanote","Chuo","Ginza"],3,4,"easy",true,"03-3251-0015","Car 3 (Yamanote)","small",C(2,7,3,4,3,3,7,5,2),"10am–4pm","Simple 1-elevator transfer, 5 min.","East Exit rank","Kanda Red Cross Hospital"),
  mk("akihabara","Akihabara Station","秋葉原駅",35.6982,139.7731,["Yamanote","Keihin-Tohoku","Sobu","Hibiya"],5,4,"moderate",true,"03-3255-4882","Car 3 (Yamanote) · Car 1 (Hibiya)","small",C(2,6,6,7,6,6,7,7,4),"11am–3pm","Hibiya Line transfer: exit & re-enter, 8 min.","East Exit rank","Akihabara UDX Clinic"),
  mk("okachimachi","Okachimachi Station","御徒町駅",35.7075,139.7741,["Yamanote","Keihin-Tohoku"],2,3,"easy",true,"03-3831-5901","Car 3 (Yamanote)","small",C(1,5,3,4,3,3,5,4,2),"Quiet most of day","Single elevator each side.","South Exit rank","Ueno area hospitals"),
  mk("ueno","Ueno Station","上野駅",35.7141,139.7774,["Yamanote","Keihin-Tohoku","Joban","Ginza","Hibiya"],8,4,"moderate",true,"03-3833-0111","Car 3 (Yamanote) · Car 3 (Ginza)","small",C(3,8,7,8,6,6,8,7,4),"10am–12pm","JR to subway: 2 lifts, 10 min.","Ueno Park Exit rank","Ueno Hospital (5 min)",[{type:"info",msg:"Ueno Zoo and park entrances are all step-free — great day trip destination."}]),
  mk("uguisudani","Uguisudani Station","鶯谷駅",35.7212,139.7791,["Yamanote","Keihin-Tohoku"],2,3,"easy",true,"03-3821-5501","Car 3 (Yamanote)","small",C(1,4,2,3,2,2,4,3,1),"Quiet all day","Single elevator. Easy.","South Exit rank","Yanaka area clinics"),
  mk("nippori","Nippori Station","日暮里駅",35.7279,139.7710,["Yamanote","Keihin-Tohoku","Joban","Keisei"],4,3,"moderate",true,"03-3891-5501","Car 3 (Yamanote)","small",C(2,7,4,5,3,4,7,5,2),"10am–3pm","Keisei transfer: dedicated elevator, 8 min.","West Exit rank","Nippori area clinics"),
  mk("nishi-nippori","Nishi-Nippori Station","西日暮里駅",35.7320,139.7664,["Yamanote","Keihin-Tohoku","Chiyoda"],3,3,"easy",true,"03-3823-4501","Car 3 (Yamanote)","small",C(1,5,3,4,2,3,5,4,2),"All day","1-lift transfer to Chiyoda Line.","East Exit rank","Local clinic"),
  mk("tabata","Tabata Station","田端駅",35.7379,139.7609,["Yamanote","Keihin-Tohoku"],2,3,"easy",true,"03-3828-5101","Car 3 (Yamanote)","small",C(1,4,2,3,2,2,4,3,1),"Quiet all day","Very simple layout.","South Exit rank","Local clinic"),
  mk("komagome","Komagome Station","駒込駅",35.7362,139.7487,["Yamanote","Namboku"],2,3,"easy",true,"03-3916-4411","Car 3 (Yamanote)","small",C(1,5,3,4,2,3,5,3,1),"All day","Namboku transfer: level, 1 elevator.","South Exit rank","Komagome Hospital"),
  mk("sugamo","Sugamo Station","巣鴨駅",35.7334,139.7394,["Yamanote","Mita"],2,3,"easy",true,"03-3917-3031","Car 3 (Yamanote)","small",C(1,5,4,5,4,4,5,4,2),"Before 10am / after 7pm","Mita Line: same building, easy.","South Exit rank","Sugamo hospital area"),
  mk("otsuka","Otsuka Station","大塚駅",35.7296,139.7286,["Yamanote","Toden Arakawa"],2,3,"easy",true,"03-3941-4001","Car 3 (Yamanote)","small",C(1,5,3,4,3,3,5,4,2),"All day","Tram at street level.","South Exit rank","Otsuka area hospitals"),
  mk("ikebukuro","Ikebukuro Station","池袋駅",35.7295,139.7109,["Yamanote","Saikyo","Marunouchi","Yurakucho","Fukutoshin","Seibu Ikebukuro","Tobu Tojo"],9,4,"hard",true,"03-3985-5102","Car 3 (Yamanote) · Car 1 (Marunouchi)","small",C(3,9,6,7,5,6,9,8,4),"11am–3pm","JR to Metro: 3 elevator stages, 15 min. Use West Exit for Seibu/Tobu.","West Exit rank (24h WAV)","Ikebukuro area hospitals",[{type:"info",msg:"West Exit B1 elevator slow at peak — use North Exit as alternative."}],[{name:"Hyatt Regency Tokyo",distance:"8 min",score:5,notes:"Full accessibility suite."},{name:"Keio Plaza Hotel",distance:"5 min",score:4,notes:"Step-free from West Exit."}]),
  mk("mejiro","Mejiro Station","目白駅",35.7215,139.7065,["Yamanote"],1,3,"easy",true,"03-3952-1851","Car 3 (Yamanote)","small",C(1,5,3,3,2,3,5,4,1),"All day","JR only, single platform.","South Exit rank","Mejiro clinics"),
  mk("takadanobaba","Takadanobaba Station","高田馬場駅",35.7126,139.7037,["Yamanote","Seibu","Tozai"],4,3,"moderate",true,"03-3209-4551","Car 3 (Yamanote)","small",C(2,8,4,5,3,4,7,6,3),"10am–3pm","Tozai: separate building, 8 min.","East Exit rank","Waseda area hospitals"),
  mk("shin-okubo","Shin-Okubo Station","新大久保駅",35.7014,139.7006,["Yamanote"],2,3,"easy",true,"03-3200-4131","Car 3 (Yamanote)","small",C(1,4,5,6,5,5,6,5,3),"Before 11am / after 8pm","JR only.","East Exit rank","Okubo Hospital"),
  mk("shinjuku","Shinjuku Station","新宿駅",35.6896,139.7006,["Yamanote","Chuo","Saikyo","Marunouchi","Shinjuku Line","Oedo","Odakyu","Keio"],14,4,"hard",true,"03-3226-5871","Car 3 (Yamanote) · Car 1 (Marunouchi)","small",C(3,10,6,7,5,6,10,8,4),"10am–12pm","World's busiest. Allow 15–20 min. West Exit lift best for Odakyu/Keio.","West Exit rank (24h WAV)","Shinjuku hospitals (multiple)",[{type:"warning",msg:"South Exit B1 elevator slow at peak — use Central Exit."}],[{name:"Hyatt Regency Tokyo",distance:"8 min",score:5,notes:"Full accessibility."},{name:"Keio Plaza Hotel",distance:"5 min",score:4,notes:"Step-free from West Exit."}]),
  mk("yoyogi","Yoyogi Station","代々木駅",35.6833,139.7021,["Yamanote","Chuo","Oedo"],3,3,"easy",true,"03-3379-1451","Car 3 (Yamanote)","small",C(1,5,3,4,2,3,5,4,2),"All day","Oedo transfer: easy.","East Exit rank","Shinjuku hospitals nearby"),
  mk("harajuku","Harajuku Station","原宿駅",35.6702,139.7027,["Yamanote"],2,3,"easy",true,"03-3401-4851","Car 3 (Yamanote)","small",C(1,4,5,5,5,5,6,5,3),"Before 10am weekdays","JR only. New building is accessible.","Takeshita Exit rank","Jingumae clinics"),
  mk("shibuya","Shibuya Station","渋谷駅",35.6580,139.7016,["Yamanote","Saikyo","Ginza","Hanzomon","Fukutoshin","Tokyu Toyoko","Keio Inokashira"],10,4,"hard",true,"03-3496-0941","Car 3 (Yamanote) · Car 1 (Ginza)","small",C(2,8,5,7,5,6,9,8,5),"10am–12pm","Ginza Line very deep: 3 elevator stages, 12 min. Scramble Square side is newer.","Hachiko Exit rank","Shibuya Ku Medical",[{type:"info",msg:"Scramble Square elevators busy on weekends."}],[{name:"Cerulean Tower Tokyu",distance:"5 min",score:4,notes:"Step-free via Mark City."}]),
  mk("ebisu","Ebisu Station","恵比寿駅",35.6469,139.7101,["Yamanote","Hibiya"],3,4,"easy",true,"03-3443-1501","Car 3 (Yamanote) · Car 3 (Hibiya)","small",C(1,5,4,5,4,4,6,6,3),"All day","Hibiya: same building, 1 lift.","West Exit rank","Ebisu Garden Place Clinic"),
  mk("meguro","Meguro Station","目黒駅",35.6340,139.7156,["Yamanote","Namboku","Mita","Tokyu Meguro"],4,3,"moderate",true,"03-3494-0121","Car 3 (Yamanote)","small",C(1,5,4,5,3,4,6,5,3),"10am–3pm","Namboku/Mita transfers, 7 min.","East Exit rank","Meguro area clinics"),
  mk("gotanda","Gotanda Station","五反田駅",35.6258,139.7232,["Yamanote","Asakusa","Tokyu Ikegami"],3,3,"moderate",true,"03-3491-2301","Car 3 (Yamanote)","small",C(1,5,3,4,3,3,5,4,2),"10am–4pm","Asakusa Line: exit required, 6 min.","West Exit rank","Gotanda clinic"),
  mk("osaki","Osaki Station","大崎駅",35.6197,139.7283,["Yamanote","Saikyo","Rinkai"],5,4,"easy",true,"03-3492-3501","Car 3 (Yamanote) · Car 1 (Rinkai)","small",C(1,6,3,4,3,3,6,5,2),"10am–4pm","Rinkai Line: direct, well signed.","East Exit rank","Osaki area hospitals"),
  mk("shinagawa","Shinagawa Station","品川駅",35.6284,139.7387,["Yamanote","Keihin-Tohoku","Keikyu","Shinkansen"],8,5,"moderate",true,"03-3442-5111","Car 3 (Yamanote) · Car 7 (Shinkansen)","none",C(2,9,5,6,4,5,9,7,3),"10am–12pm","Keikyu/Shinkansen: well-signposted, 8 min.","East Exit rank (24h)","Shinagawa station clinic"),
  mk("tamachi","Tamachi Station","田町駅",35.6455,139.7474,["Yamanote","Keihin-Tohoku","Mita"],3,3,"easy",true,"03-3453-1501","Car 3 (Yamanote)","small",C(1,5,3,4,2,3,5,4,2),"All day","Mita Line: same building.","East Exit rank","Tamachi area clinics"),
  mk("hamamatsucho","Hamamatsucho Station","浜松町駅",35.6554,139.7567,["Yamanote","Keihin-Tohoku","Monorail"],4,3,"moderate",true,"03-3432-1501","Car 3 (Yamanote)","small",C(1,6,4,5,3,4,7,5,2),"10am–3pm","Monorail to Haneda: 1 elevator change.","North Exit rank","World Trade Center clinic"),
  mk("shimbashi","Shimbashi Station","新橋駅",35.6654,139.7584,["Yamanote","Keihin-Tohoku","Ginza","Asakusa"],7,4,"moderate",true,"03-3573-1301","Car 3 (Yamanote) · Car 1 (Ginza)","small",C(2,8,5,6,4,5,8,6,3),"10am–12pm","Yurikamome needs street crossing, 8 min.","North Exit rank","Shimbashi area hospitals"),
  mk("yurakucho","Yurakucho Station","有楽町駅",35.6751,139.7634,["Yamanote","Keihin-Tohoku","Yurakucho"],4,4,"easy",true,"03-3591-1501","Car 3 (Yamanote)","small",C(1,6,5,6,4,5,7,5,3),"10am–4pm","Yurakucho Line: direct.","West Exit rank","Hibiya area hospitals"),
  mk("koenji","Koenji Station","高円寺駅",35.7052,139.6494,["Chuo","Sobu"],2,3,"easy",true,"03-3336-5101","Car 4 (Chuo)","small",C(1,6,3,4,3,3,6,5,2),"10am–4pm","JR only.","South Exit rank","Koenji area clinics"),
  // Metro / Toei key stations
  mk("asakusa","Asakusa Station","浅草駅",35.7115,139.7963,["Asakusa","Ginza","Tobu Skytree"],4,3,"moderate",true,"03-3841-5101","Car 1","small",C(2,5,6,8,7,7,7,6,4),"Before 10am / after 7pm","Asakusa to Ginza: outdoor walk, 8 min.","Kaminarimon Exit rank","Asakusa area hospitals",[{type:"info",msg:"Senso-ji temple is fully accessible from Kaminarimon exit."}]),
  mk("omotesando","Omotesando Station","表参道駅",35.6654,139.7123,["Chiyoda","Ginza","Hanzomon"],4,4,"easy",true,"03-3499-5101","Car 1","none",C(1,4,5,6,5,5,6,5,3),"10am–3pm","All 3 lines in same building.","B4 Exit rank","Aoyama clinics"),
  mk("roppongi","Roppongi Station","六本木駅",35.6629,139.7316,["Hibiya","Oedo"],3,3,"moderate",true,"03-3403-8100","Car 3 (Hibiya)","small",C(1,3,4,6,5,5,7,8,5),"Afternoons weekdays","Oedo Line very deep: 3 stages, 10 min.","Main Exit rank","Roppongi Midtown Medical",[],[{name:"Grand Hyatt Tokyo",distance:"3 min",score:5,notes:"Excellent accessibility, step-free from Roppongi Hills."}]),
  mk("kasumigaseki","Kasumigaseki Station","霞ヶ関駅",35.6740,139.7493,["Chiyoda","Hibiya","Marunouchi"],3,4,"easy",true,"03-3503-5101","Car 1","none",C(1,6,4,5,3,4,7,5,2),"10am–3pm","All 3 lines: street-level connections.","Exit C1 rank","Government-area hospitals"),
  mk("ginza","Ginza Station","銀座駅",35.6714,139.7654,["Ginza","Hibiya","Marunouchi"],4,4,"easy",true,"03-3561-4301","Car 1","none",C(2,5,6,7,6,6,7,6,3),"10am–12pm","All 3 lines at same complex.","A13 Exit rank","Ginza area hospitals"),
  mk("nihonbashi","Nihonbashi Station","日本橋駅",35.6835,139.7744,["Ginza","Tozai","Asakusa"],3,3,"moderate",true,"03-3271-5101","Car 1","small",C(1,6,4,5,3,4,6,5,2),"10am–3pm","Older elevators, slightly tight. 6 min.","B1 Exit rank","Nihonbashi clinics"),
  mk("otemachi","Otemachi Station","大手町駅",35.6861,139.7634,["Marunouchi","Chiyoda","Hanzomon","Tozai","Mita"],8,4,"hard",true,"03-3270-4101","Car 1","none",C(2,8,5,6,4,5,8,6,2),"10am–12pm","5 lines: allow 15 min for any transfer.","C10 Exit rank","Otemachi First Square Clinic"),
  mk("tameike-sanno","Tameike-Sanno Station","溜池山王駅",35.6726,139.7449,["Ginza","Namboku"],2,4,"easy",true,"03-3592-5101","Car 1","none",C(1,7,4,5,3,4,7,5,2),"10am–3pm","Direct transfer between lines.","Exit 7 rank","Nagatacho hospitals"),
  mk("shirokane-takanawa","Shirokane-Takanawa Station","白金高輪駅",35.6436,139.7294,["Namboku","Mita"],3,4,"easy",true,"03-3449-5101","Car 1","none",C(1,4,3,4,2,3,4,3,2),"All day","Quiet, easy layout.","Exit 1 rank","Shirokane clinics"),
  mk("aoyama-itchome","Aoyama-Itchome Station","青山一丁目駅",35.6720,139.7196,["Ginza","Hanzomon","Oedo"],3,3,"moderate",true,"03-3403-5101","Car 1","none",C(1,5,4,5,3,4,5,4,2),"10am–3pm","Oedo deeper: 8 min.","Exit 4 rank","Aoyama clinics"),
  mk("shinjuku-sanchome","Shinjuku-Sanchome Station","新宿三丁目駅",35.6893,139.7066,["Marunouchi","Shinjuku Line","Fukutoshin"],4,3,"moderate",true,"03-3350-5101","Car 1","none",C(1,7,5,6,5,5,8,7,3),"10am–12pm","3 lines: allow 10 min.","E2 Exit rank","Shinjuku hospital area"),
  mk("nakameguro","Nakameguro Station","中目黒駅",35.6443,139.6988,["Hibiya","Tokyu Toyoko"],3,3,"moderate",true,"03-3792-5101","Car 3 (Hibiya)","small",C(1,4,4,5,4,4,6,5,3),"10am–4pm","Direct transfer, 5 min.","Main Exit rank","Nakameguro clinics"),
  mk("jiyugaoka","Jiyugaoka Station","自由が丘駅",35.6076,139.6684,["Tokyu Toyoko","Tokyu Oimachi"],2,3,"easy",true,"03-3717-2101","Car 3","small",C(1,4,4,5,4,4,5,4,2),"10am–3pm","Both Tokyu lines in same building.","North Exit rank","Jiyugaoka clinics"),
  mk("daikanyama","Daikanyama Station","代官山駅",35.6484,139.7029,["Tokyu Toyoko"],1,2,"easy",true,"03-3770-3261","Car 3","small",C(1,3,4,5,4,4,5,4,3),"All day","Small station, 1 elevator.","South Exit rank","Daikanyama clinics"),
  mk("shimo-kitazawa","Shimokitazawa Station","下北沢駅",35.6613,139.6681,["Odakyu","Keio Inokashira"],3,3,"moderate",true,"03-3468-5101","Car 4 (Odakyu)","moderate",C(1,5,4,5,4,4,6,5,3),"Before 10am / after 7pm","Underground layout: 2 stages, 8 min.","South Exit rank","Setagaya clinics"),
  mk("mita","Mita Station","三田駅",35.6454,139.7390,["Mita","Asakusa"],3,3,"easy",true,"03-3451-8101","Car 1","none",C(1,5,3,4,3,3,5,4,2),"10am–3pm","Both lines at same complex.","Exit A8 rank","Mita clinics"),
  mk("suidobashi","Suidobashi Station","水道橋駅",35.7021,139.7531,["Mita","Sobu"],2,3,"easy",true,"03-3811-5101","Car 4","small",C(1,5,3,4,3,3,5,4,2),"10am–3pm","2-line, straightforward.","East Exit rank","Juntendo Hospital area"),
  mk("kudanshita","Kudanshita Station","九段下駅",35.6956,139.7494,["Tozai","Hanzomon","Shinjuku Line"],3,4,"easy",true,"03-3265-8101","Car 1","none",C(1,6,4,5,3,4,5,4,2),"10am–3pm","All 3 lines interconnected.","Exit 5 rank","Kudanshita clinics"),
  mk("iidabashi","Iidabashi Station","飯田橋駅",35.7020,139.7475,["Yurakucho","Namboku","Tozai","Oedo","Sobu"],6,4,"moderate",true,"03-3268-5101","Car 1","none",C(2,7,4,5,3,4,6,5,2),"10am–3pm","5 lines, well-signed: 10 min.","West Exit rank","Iidabashi clinic"),
  mk("kita-senju","Kita-Senju Station","北千住駅",35.7484,139.8025,["Joban","Chiyoda","Hibiya","Tobu Skytree"],7,4,"hard",true,"03-3888-0101","Car 3 (Joban) · Car 1 (Hibiya)","small",C(2,8,5,6,4,5,8,6,3),"10am–12pm","5 operators, complex: 15 min.","West Exit rank","Kita-Senju hospitals",[{type:"info",msg:"Use northern elevator bank — southern concourse has escalator-only zones."}]),
  mk("haneda","Haneda Airport T3","羽田空港第3ターミナル駅",35.5494,139.7798,["Keikyu","Monorail"],8,5,"easy",true,"03-5757-8111","Car 1","none",C(1,4,5,6,5,5,6,5,3),"Off-peak best","Airport-level accessibility throughout.","Arrivals level (24h WAV)","Airport Medical (24h)",[{type:"info",msg:"WAV airport taxis 24h from Arrivals. Pre-book recommended."}]),
  mk("azabu-juban","Azabu-Juban Station","麻布十番駅",35.6554,139.7371,["Namboku","Oedo"],3,3,"moderate",true,"03-3583-5101","Car 1","none",C(1,3,3,4,3,3,4,3,2),"All day","Same building transfer.","Roppongi Exit rank","Azabu clinics"),
  mk("monzen-nakacho","Monzen-Nakacho Station","門前仲町駅",35.6718,139.7956,["Tozai","Oedo"],3,3,"moderate",true,"03-3641-5101","Car 1","small",C(1,4,5,6,5,5,6,5,3),"10am–3pm","Oedo needs separate lift: 7 min.","Exit 1 rank","Koto hospitals"),
  mk("shin-toyosu","Shin-Toyosu Station","新豊洲駅",35.6458,139.7900,["Yurikamome"],2,4,"easy",true,"03-6910-5101","Any car","none",C(1,2,3,4,3,3,4,3,2),"Quiet all day","Modern elevated line, fully accessible.","Station exit rank","Toyosu Medical Center"),
  mk("tachikawa","Tachikawa Station","立川駅",35.6976,139.4148,["Chuo","Nambu","Monorail"],8,5,"easy",true,"042-524-0021","Car 3 (Chuo)","small",C(2,7,5,6,4,5,7,6,3),"10am–3pm","Chuo to Monorail: level transfer, 5 min.","North Exit rank (24h WAV)","Tachikawa Hospital",[{type:"info",msg:"One of the most accessible stations west of Shinjuku — wide concourses and multiple elevator banks."}]),
  mk("shinjuku-nishiguchi","Shinjuku-Nishiguchi Station","新宿西口駅",35.6938,139.6987,["Oedo"],3,3,"moderate",true,"03-5381-5101","Car 1","none",C(1,7,5,6,5,5,8,7,3),"10am–12pm","Oedo to JR: exit & re-enter, 10 min.","West Exit rank","Shinjuku hospital area"),
  mk("hachioji","Hachioji Station","八王子駅",35.6557,139.3390,["Chuo","Yokohama","Hachiko"],6,4,"moderate",true,"042-622-0111","Car 3 (Chuo)","small",C(1,5,4,5,3,4,6,5,2),"10am–3pm","Multiple lines in same building: 8 min.","North Exit rank","Hachioji Medical Center"),
  mk("musashino","Musashino Station","武蔵野駅",35.7058,139.5595,["Chuo"],2,3,"easy",true,"0422-51-5101","Car 3","small",C(1,3,3,4,3,3,4,3,2),"All day","Single line, simple layout.","South Exit rank","Musashino Red Cross Hospital"),
  mk("kichijoji","Kichijoji Station","吉祥寺駅",35.7030,139.5797,["Chuo","Keio Inokashira"],5,4,"moderate",true,"0422-22-5101","Car 3 (Chuo)","small",C(2,6,5,6,4,5,7,6,3),"11am–3pm","Inokashira: separate exit, 7 min.","South Exit rank","Kichijoji area clinics",[{type:"info",msg:"Popular tourist area — busier on weekends. Inokashira Park entrance is step-free."}]),
  mk("mitaka","Mitaka Station","三鷹駅",35.7027,139.5602,["Chuo","Sobu"],4,4,"easy",true,"0422-43-5101","Car 3","small",C(1,5,4,5,3,4,5,4,2),"10am–3pm","Both lines share concourse.","South Exit rank","Mitaka area clinics"),
  mk("nakano","Nakano Station","中野駅",35.7077,139.6656,["Chuo","Sobu","Tozai"],5,4,"moderate",true,"03-3382-5101","Car 3 (Chuo)","small",C(2,6,5,6,4,5,7,6,3),"10am–3pm","Tozai transfer: 8 min via underground passage.","North Exit rank","Nakano area hospitals"),
  mk("ogikubo","Ogikubo Station","荻窪駅",35.7056,139.6203,["Chuo","Marunouchi"],4,4,"easy",true,"03-3398-5101","Car 3 (Chuo)","small",C(1,5,4,5,3,4,6,5,2),"10am–3pm","Marunouchi transfer: same building, 5 min.","South Exit rank","Ogikubo area clinics"),
  mk("koenji","Koenji Station","高円寺駅",35.7056,139.6494,["Chuo","Sobu"],3,3,"easy",true,"03-3336-5101","Car 3","small",C(1,4,4,5,3,4,5,4,2),"10am–4pm","Single elevator each side.","South Exit rank","Koenji area clinics"),
  mk("musashi-kosugi","Musashi-Kosugi Station","武蔵小杉駅",35.5756,139.6578,["Tokyu Toyoko","Tokyu Meguro","Nambu","Shonan-Shinjuku","Yokosuka"],7,4,"hard",true,"044-722-5101","Car 3 (Toyoko)","small",C(2,8,5,6,4,5,8,7,3),"10am–12pm","Complex 5-line hub: allow 15 min. Use East Exit for JR lines.","East Exit rank","Nakamura Memorial Hospital",[{type:"warning",msg:"Very busy station — peak hours can make elevator access slow. Allow extra time."}]),
  mk("kawasaki","Kawasaki Station","川崎駅",35.5308,139.6992,["Keihin-Tohoku","Tokaido","Nambu","Keikyu"],8,4,"moderate",true,"044-222-5101","Car 3","small",C(2,7,5,6,4,5,7,6,3),"10am–3pm","JR to Keikyu: separate building, 10 min.","East Exit rank","Kawasaki Municipal Hospital"),
  mk("yokohama","Yokohama Station","横浜駅",35.4657,139.6220,["Keihin-Tohoku","Tokaido","Yokohama","Minatomirai","Keikyu","Sotetsu"],10,5,"hard",true,"045-441-5101","Car 3 (Keihin-Tohoku)","small",C(3,9,6,7,5,6,9,8,4),"10am–12pm","6 lines across 3 buildings: allow 20 min. West Exit for Keikyu/Sotetsu.","West Exit rank (24h WAV)","Yokohama City Hospital",[{type:"info",msg:"Use the JR Central Gate as your main reference point — all other lines are signposted from there."}]),
];

// ─── NON-TOKYO CITIES ─────────────────────────────────────────────────────────
const OTHER_CITIES = {
  osaka:{
    id:"osaka",name:"Osaka",nameJp:"大阪",emoji:"🏯",
    weather:null,
    stations:[{
      id:"osaka-umeda",name:"Osaka/Umeda Station",nameJp:"大阪・梅田駅",lat:34.7024,lng:135.4959,
      lines:["JR Osaka Loop","Midosuji Line","Hankyu","Hanshin"],
      elevatorCount:7,accessScore:4,transferDifficulty:"moderate",staffAssist:true,phone:"06-6346-5201",
      wheelchairCar:"Car 3 (Midosuji) · Car 2 (JR Loop)",platformGap:"none",
      crowding:C(2,9,5,6,4,5,9,6,3),quietHours:"10am–2pm weekdays.",
      transferNote:"JR to Midosuji: 1 elevator change, 8 min.",
      taxiInfo:"South Exit taxi rank — UD Taxis 24h. Pre-book via Didi or MK Taxi Osaka.",
      medicalNearby:"Osaka City General Hospital (10 min taxi) · 06-6929-1221",
      alerts:[{type:"warning",msg:"North Concourse elevator under maintenance. Use Central Gate elevator."}],
      nearbyHotels:[{name:"Conrad Osaka",distance:"15 min",score:5,notes:"Full accessibility suite, stunning views."},{name:"Cross Hotel Osaka",distance:"5 min",score:4,notes:"Step-free from station."}],
      restAreas:[{location:"Grand Front Osaka North (5 min)",type:"lounge",notes:"Accessible lounge, wheelchair charging available. Free entry."}],
      chargingPoints:[{location:"Grand Front Osaka Umeda 1F",notes:"Wheelchair charging at info desk. Free, ask staff."}],
      elevators:[{id:1,location:"Central Gate",status:"operational",verified:"1h ago",verifiedCount:14},{id:2,location:"South Gate",status:"operational",verified:"30m ago",verifiedCount:9},{id:3,location:"North Concourse",status:"maintenance",verified:"4h ago",verifiedCount:3}],
    },{
      id:"namba",name:"Namba Station",nameJp:"なんば駅",lat:34.6670,lng:135.5013,
      lines:["Midosuji Line","Sennichimae Line","Yotsubashi Line","Nankai"],
      elevatorCount:5,accessScore:4,transferDifficulty:"moderate",staffAssist:true,phone:"06-6633-8821",
      wheelchairCar:"Car 1 (all lines)",platformGap:"none",
      crowding:C(2,6,6,8,7,7,8,8,5),quietHours:"Before 11am and after 8pm.",
      transferNote:"Multiple operators — allow 10 min. Nankai Line has separate concourse.",
      taxiInfo:"Main Exit taxi rank — UD Taxis available. Dotonbori area also has accessible cabs.",
      medicalNearby:"Namba area clinics (multiple within 5 min)",
      alerts:[],nearbyHotels:[{name:"Cross Hotel Osaka Namba",distance:"5 min",score:4,notes:"Step-free, accessible rooms."},{name:"Dormy Inn Namba",distance:"3 min",score:3,notes:"Some accessible rooms."}],
      restAreas:[{location:"Namba City Mall (B1)",type:"seating",notes:"Wide seating near food court."}],
      chargingPoints:[],
      elevators:[{id:1,location:"South Exit",status:"operational",verified:"45m ago",verifiedCount:11},{id:2,location:"Central Gate",status:"operational",verified:"2h ago",verifiedCount:7}],
    },{
      id:"tennoji",name:"Tennoji Station",nameJp:"天王寺駅",lat:34.6462,lng:135.5136,
      lines:["JR Osaka Loop","Midosuji Line","Tanimachi Line"],
      elevatorCount:6,accessScore:4,transferDifficulty:"easy",staffAssist:true,phone:"06-6771-5201",
      wheelchairCar:"Car 2 (JR Loop) · Car 1 (Midosuji)",platformGap:"small",
      crowding:C(2,7,5,6,5,5,7,6,3),quietHours:"10am–3pm weekdays.",
      transferNote:"Well connected: JR, Metro under same roof. Allow 6 min.",
      taxiInfo:"West Exit taxi rank — UD Taxis available.",medicalNearby:"Osaka City University Hospital (5 min accessible)",
      alerts:[],nearbyHotels:[{name:"Tennoji MIO Hotel",distance:"2 min",score:3,notes:"Connected to station. Some accessible rooms."}],
      restAreas:[{location:"Abeno Harukas 3F",type:"lounge",notes:"Accessible seating near elevator banks."}],
      chargingPoints:[],
      elevators:[{id:1,location:"East Gate",status:"operational",verified:"1h ago",verifiedCount:8},{id:2,location:"West Gate",status:"operational",verified:"3h ago",verifiedCount:5}],
    }],
  },
  kyoto:{
    id:"kyoto",name:"Kyoto",nameJp:"京都",emoji:"⛩️",
    weather:null,
    stations:[{
      id:"kyoto-main",name:"Kyoto Station",nameJp:"京都駅",lat:34.9858,lng:135.7588,
      lines:["JR Tokaido Shinkansen","JR Kyoto Line","Karasuma Line"],
      elevatorCount:9,accessScore:5,transferDifficulty:"easy",staffAssist:true,phone:"075-681-5375",
      wheelchairCar:"Car 7 (Shinkansen) · Car 4 (JR Kyoto Line) · Car 1 (Karasuma)",platformGap:"none",
      crowding:C(2,6,7,8,7,7,7,5,3),quietHours:"Early morning 6–8am and after 8pm are calmest.",
      transferNote:"All routes well-signed. Allow 5 min for any transfer.",
      taxiInfo:"Central Exit taxi rank — MK Taxi: 075-778-4141. English drivers available. WAV 24h.",
      medicalNearby:"Kyoto JCHO Hospital (15 min taxi) · 075-751-8111",
      alerts:[],
      nearbyHotels:[{name:"The Thousand Kyoto",distance:"2 min",score:5,notes:"Best accessible hotel in Kyoto. Roll-in shower, lowered beds, English staff."},{name:"Dormy Inn Kyoto",distance:"10 min",score:3,notes:"Budget option, some accessible rooms."}],
      restAreas:[{location:"Isetan Department Store 2F",type:"lounge",notes:"Comfortable seating, accessible."},{location:"Central Hall (1F)",type:"seating",notes:"Wide benches throughout."}],
      chargingPoints:[{location:"JR Travel Service (1F)",notes:"Free, ask staff."}],
      elevators:[{id:1,location:"Central Gate",status:"operational",verified:"2h ago",verifiedCount:20},{id:2,location:"Karasuma Exit",status:"operational",verified:"1h ago",verifiedCount:11},{id:3,location:"Shinkansen Gate",status:"operational",verified:"3h ago",verifiedCount:8}],
    },{
      id:"kyoto-shijo","name":"Shijo Station","nameJp":"四条駅",lat:35.0040,lng:135.7598,
      lines:["Karasuma Line"],
      elevatorCount:2,accessScore:3,transferDifficulty:"easy",staffAssist:true,phone:"075-221-2045",
      wheelchairCar:"Car 1",platformGap:"none",
      crowding:C(1,4,5,7,6,6,7,6,4),quietHours:"Before 11am and after 7pm.",
      transferNote:"Metro only — straightforward.","taxiInfo":"Above ground near Shijo-Karasuma crossing — hail or use cab app.",
      medicalNearby:"Nishiki area clinics nearby",alerts:[],nearbyHotels:[],restAreas:[],chargingPoints:[],
      elevators:[{id:1,location:"North Exit",status:"operational",verified:"1h ago",verifiedCount:6}],
    }],
  },
  sapporo:{
    id:"sapporo",name:"Sapporo",nameJp:"札幌",emoji:"❄️",
    weather:null,
    stations:[{
      id:"sapporo-main",name:"Sapporo Station",nameJp:"札幌駅",lat:43.0687,lng:141.3508,
      lines:["JR Hakodate Main","Namboku Line","Toho Line"],
      elevatorCount:4,accessScore:4,transferDifficulty:"easy",staffAssist:true,phone:"011-222-6060",
      wheelchairCar:"Car 2 (Namboku Line)",platformGap:"none",
      crowding:C(1,7,4,5,4,5,7,5,2),quietHours:"10am–4pm weekdays. Winter mornings icy — allow extra time.",
      transferNote:"Indoor heated connections throughout. Allow 5 min.",
      taxiInfo:"South Exit taxi rank — Hokkaido Kotsu accessible taxis. Pre-book: 011-281-0101.",
      medicalNearby:"Sapporo City General Hospital (10 min taxi) · 011-726-2211",
      alerts:[{type:"warning",msg:"Winter advisory: outdoor ramps and kerb cuts may be icy. Use indoor heated walkways."}],
      nearbyHotels:[{name:"JR Tower Hotel Nikko Sapporo",distance:"1 min",score:5,notes:"Connected above station. Winter-safe routes, fully accessible."},{name:"Dormy Inn Sapporo",distance:"10 min",score:3,notes:"Some accessible rooms."}],
      restAreas:[{location:"JR Tower 2F skybridge",type:"seating",notes:"Heated warm seating — essential in winter."}],
      chargingPoints:[{location:"JR Tower Stellar Place B1",notes:"Near food court. Power outlets at seating."}],
      elevators:[{id:1,location:"South Exit",status:"operational",verified:"2h ago",verifiedCount:10},{id:2,location:"North Exit",status:"operational",verified:"4h ago",verifiedCount:5}],
    },{
      id:"odori",name:"Odori Station",nameJp:"大通駅",lat:43.0607,lng:141.3535,
      lines:["Namboku Line","Toho Line","Tozai Line"],
      elevatorCount:4,accessScore:4,transferDifficulty:"easy",staffAssist:true,phone:"011-221-5656",
      wheelchairCar:"Car 1 (all lines)",platformGap:"none",
      crowding:C(1,6,4,5,4,4,6,5,2),quietHours:"10am–3pm weekdays.",
      transferNote:"All 3 Sapporo subway lines meet here. Easy connection, 5 min.",
      taxiInfo:"Above-ground exit ranks. Odori Park area has accessible cabs.",
      medicalNearby:"Central Sapporo clinics (multiple)",alerts:[],nearbyHotels:[],restAreas:[],chargingPoints:[],
      elevators:[{id:1,location:"East Concourse",status:"operational",verified:"1h ago",verifiedCount:8}],
    }],
  },
  fukuoka:{
    id:"fukuoka",name:"Fukuoka",nameJp:"福岡",emoji:"🌊",
    weather:null,
    stations:[{
      id:"hakata",name:"Hakata Station",nameJp:"博多駅",lat:33.5898,lng:130.4207,
      lines:["JR Shinkansen","JR Kagoshima Line","Airport Line"],
      elevatorCount:5,accessScore:5,transferDifficulty:"easy",staffAssist:true,phone:"092-431-0202",
      wheelchairCar:"Car 4 (Shinkansen) · Car 1 (Airport Line)",platformGap:"none",
      crowding:C(2,8,5,6,4,5,8,6,3),quietHours:"10am–3pm weekdays.",
      transferNote:"Compact, well-designed. Allow 5 min for all transfers.",
      taxiInfo:"Hakata Exit taxi rank — Nishi-Nihon RR accessible taxis. Book: 092-261-0505.",
      medicalNearby:"Hakata Station Clinic (inside Hakata City 1F) · 092-481-1811",
      alerts:[],
      nearbyHotels:[{name:"JR Kyushu Hotel Blossom Hakata",distance:"2 min",score:4,notes:"Connected to station, accessible rooms."},{name:"Hakata Excel Hotel Tokyu",distance:"3 min",score:4,notes:"Accessible rooms, good facilities."}],
      restAreas:[{location:"Hakata City AMU Plaza 1F",type:"lounge",notes:"Spacious accessible seating near food hall."}],
      chargingPoints:[{location:"JR Kyushu Travel (1F)",notes:"Ask staff. Free during business hours."}],
      elevators:[{id:1,location:"Hakata Exit",status:"operational",verified:"1h ago",verifiedCount:16},{id:2,location:"Chikushi Exit",status:"operational",verified:"3h ago",verifiedCount:6}],
    },{
      id:"tenjin",name:"Tenjin Station",nameJp:"天神駅",lat:33.5903,lng:130.3993,
      lines:["Airport Line","Nanakuma Line"],
      elevatorCount:4,accessScore:4,transferDifficulty:"easy",staffAssist:true,phone:"092-771-5201",
      wheelchairCar:"Car 1",platformGap:"none",
      crowding:C(2,7,5,7,6,6,7,7,4),quietHours:"Before 11am weekdays.",
      transferNote:"2 subway lines, same building. Easy 5 min transfer.",
      taxiInfo:"Tenjin core area — multiple taxi ranks. WAV taxis bookable via app.",
      medicalNearby:"Tenjin area hospitals (multiple within 10 min)",
      alerts:[],nearbyHotels:[{name:"Solaria Nishitetsu Hotel Tenjin",distance:"3 min",score:4,notes:"Accessible rooms. Step-free from station."}],
      restAreas:[{location:"Tenjin Underground Mall",type:"seating",notes:"Multiple seating areas throughout underground shopping."}],
      chargingPoints:[],
      elevators:[{id:1,location:"Main Exit",status:"operational",verified:"2h ago",verifiedCount:9}],
    }],
  },
};

// ─── ALL CITIES CONFIG ────────────────────────────────────────────────────────
const CITIES = {
  tokyo:{id:"tokyo",name:"Tokyo",nameJp:"東京",emoji:"🗼",weather:null,stations:TOKYO_STATIONS,desc:"60 stations · All Yamanote + major interchange"},
  osaka:{...OTHER_CITIES.osaka,weather:null,desc:`${OTHER_CITIES.osaka.stations.length} stations · Umeda, Namba, Tennoji`},
  kyoto:{...OTHER_CITIES.kyoto,weather:null,desc:`${OTHER_CITIES.kyoto.stations.length} stations · Kyoto, Shijo`},
  sapporo:{...OTHER_CITIES.sapporo,weather:null,desc:`${OTHER_CITIES.sapporo.stations.length} stations · Sapporo, Odori`},
  fukuoka:{...OTHER_CITIES.fukuoka,weather:null,desc:`${OTHER_CITIES.fukuoka.stations.length} stations · Hakata, Tenjin`},
};
const CITY_KEYS = Object.keys(CITIES);
const ALL_STATIONS = CITY_KEYS.flatMap(ck=>CITIES[ck].stations.map(s=>({...s,cityKey:ck,cityName:CITIES[ck].name})));

// ─── SMALL COMPONENTS ────────────────────────────────────────────────────────
const ScoreBar = ({score}) => {
  const c=["","#ef4444","#f59e0b","#f59e0b","#34d399","#34d399"][score];
  const l=["","Very Limited","Basic","Adequate","Good","Excellent"][score];
  const d=["","Few or no elevators, significant barriers","Some elevators, may have steps or gaps","Elevators available, some assistance needed","Good elevator coverage, staff available","Fully accessible, step-free throughout"][score];
  return <div style={{marginBottom:4}}><div style={{display:"flex",alignItems:"center",gap:5,marginBottom:2}}><div style={{display:"flex",gap:2}}>{[1,2,3,4,5].map(i=><div key={i} style={{width:13,height:5,borderRadius:2,background:i<=score?c:"rgba(255,255,255,0.1)"}}/>)}</div><span style={{fontSize:10,color:c,fontWeight:700}}>{l} accessibility</span></div><div style={{fontSize:10,color:"rgba(255,255,255,0.4)",lineHeight:1.4}}>{d}</div></div>;
};

const LinePill = ({line}) => (
  <span style={{fontSize:8,padding:"1px 6px",borderRadius:20,background:`${LINE_COLOR[line]||"#3b82f6"}22`,border:`1px solid ${LINE_COLOR[line]||"#3b82f6"}44`,color:LINE_COLOR[line]||"#8bb8f8",whiteSpace:"nowrap"}}>{line}</span>
);

const Pill = ({children,color="#3b82f6"}) => (
  <span style={{fontSize:10,padding:"2px 8px",borderRadius:20,background:`${color}20`,border:`1px solid ${color}40`,color,display:"inline-flex",alignItems:"center",gap:3}}>{children}</span>
);

// ─── CROWDING CHART ───────────────────────────────────────────────────────────
function CrowdingChart({crowding,quiet}){
  const h=new Date().getHours();
  const now=h<7?"6am":h<9?"8am":h<11?"10am":h<13?"12pm":h<15?"2pm":h<17?"4pm":h<19?"6pm":h<21?"8pm":"10pm";
  const v=crowding[now];const c=v<=3?"#34d399":v<=6?"#7dd3fc":v<=8?"#f59e0b":"#ef4444";
  return(
    <div style={{background:"rgba(255,255,255,0.03)",borderRadius:14,padding:"13px 15px",border:"1px solid rgba(255,255,255,0.07)",marginBottom:12}}>
      <div style={{display:"flex",justifyContent:"space-between",marginBottom:9}}>
        <span style={{fontSize:12,fontWeight:700,color:"rgba(255,255,255,0.8)"}}>📊 Crowding</span>
        <span style={{fontSize:11,color:c,fontWeight:700}}>{v<=3?"Quiet":v<=6?"Moderate":v<=8?"Busy":"Very Busy"} now</span>
      </div>
      <div style={{display:"flex",gap:2,alignItems:"flex-end",height:38}}>
        {HOURS.map(hr=>{const val=crowding[hr];const ic=hr===now;const col=val<=3?"#34d399":val<=6?"#7dd3fc":val<=8?"#f59e0b":"#ef4444";return(<div key={hr} style={{flex:1,display:"flex",flexDirection:"column",alignItems:"center",gap:2}}><div style={{width:"100%",height:`${(val/10)*34}px`,background:ic?col:`${col}44`,borderRadius:2,border:ic?`1.5px solid ${col}`:"none"}}/><div style={{fontSize:6,color:ic?"#fff":"rgba(255,255,255,0.25)",fontFamily:"monospace"}}>{hr}</div></div>);})}
      </div>
      {quiet&&<div style={{fontSize:10,color:"rgba(255,255,255,0.38)",marginTop:6,lineHeight:1.4}}>Best times: {quiet}</div>}
      {v>=7&&<div style={{marginTop:8,padding:"7px 10px",borderRadius:8,background:"rgba(245,158,11,0.1)",border:"1px solid rgba(245,158,11,0.3)",fontSize:10,color:"#fde68a",lineHeight:1.5}}>Peak hour warning: This station is currently busy. Wheelchair users may find it harder to board — consider waiting 20–30 min or using a quieter car at the end of the platform.</div>}
    </div>
  );
}

// ─── PHRASE MODAL ─────────────────────────────────────────────────────────────
function PhraseModal({onClose}){
  const [cat,setCat]=useState("All");const [copied,setCopied]=useState(null);
  const cats=["All",...[...new Set(PHRASES.map(p=>p.cat))]];
  const list=cat==="All"?PHRASES:PHRASES.filter(p=>p.cat===cat);
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.82)",zIndex:500,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(4px)"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#0f1424",borderRadius:"20px 20px 0 0",border:"1px solid rgba(255,255,255,0.09)",width:"100%",maxWidth:700,maxHeight:"82vh",overflowY:"auto",padding:"18px 15px 40px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
          <div style={{fontFamily:"monospace",fontSize:14,fontWeight:700,color:"#fff"}}>🗣️ Japanese Phrase Cards</div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:8,color:"rgba(255,255,255,0.6)",width:28,height:28,cursor:"pointer",fontSize:13}}>✕</button>
        </div>
        <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:11}}>
          {cats.map(c=><button key={c} onClick={()=>setCat(c)} style={{padding:"3px 11px",borderRadius:20,border:"1px solid",borderColor:c===cat?"#3b82f6":"rgba(255,255,255,0.14)",background:c===cat?"rgba(66,133,244,0.2)":"transparent",color:c===cat?"#fff":"rgba(255,255,255,0.45)",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>{c}</button>)}
        </div>
        {list.map((p,i)=>(
          <div key={i} onClick={()=>{navigator.clipboard?.writeText(p.jp).catch(()=>{});setCopied(i);setTimeout(()=>setCopied(null),1800);}} style={{background:copied===i?"rgba(66,133,244,0.15)":"rgba(255,255,255,0.04)",border:`2px solid ${copied===i?"#3b82f6":"rgba(255,255,255,0.07)"}`,borderRadius:10,padding:"10px 12px",cursor:"pointer",marginBottom:6,position:"relative"}}>
            <div style={{fontSize:16,color:"#fff",fontWeight:700,marginBottom:3}}>{p.jp}</div>
            <div style={{fontSize:10,color:"#06b6d4",fontFamily:"monospace",marginBottom:2}}>{p.ro}</div>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.45)"}}>{p.en}</div>
            <div style={{position:"absolute",top:8,right:10,fontSize:8,color:copied===i?"#3b82f6":"rgba(255,255,255,0.2)"}}>{copied===i?"✓ Copied":"Tap"}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── EMERGENCY MODAL ──────────────────────────────────────────────────────────
function EmergencyModal({profile,onClose}){
  const [copied,setCopied]=useState(false);
  const pt=PROFILE_TYPES.find(p=>p.id===profile?.type)||PROFILE_TYPES[0];
  const text=`【緊急連絡カード / Emergency Card】\n私は${pt.label}の利用者です。\nI am a ${pt.label} user.\n${profile?.needs?"\n"+profile.needs:""}\n${profile?.emergencyContact?"\n緊急連絡先:\n"+profile.emergencyContact:""}\n\n119（救急）· 110（警察）· 03-5285-8181（英語ライフライン）\n119 Ambulance · 110 Police · 03-5285-8181 English Lifeline`;
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:500,display:"flex",alignItems:"center",justifyContent:"center",padding:16,backdropFilter:"blur(4px)"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#0f1424",borderRadius:18,border:"1px solid rgba(239,68,68,0.3)",width:"100%",maxWidth:460,padding:"20px 17px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:13}}>
          <div style={{fontFamily:"monospace",fontSize:14,fontWeight:700,color:"#f87171"}}>🆘 Emergency Card</div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:8,color:"rgba(255,255,255,0.6)",width:28,height:28,cursor:"pointer",fontSize:13}}>✕</button>
        </div>
        <div style={{background:"rgba(239,68,68,0.07)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:9,padding:"12px",marginBottom:11,fontFamily:"monospace",fontSize:11,lineHeight:1.8,color:"#fff",whiteSpace:"pre-line"}}>{text}</div>
        <button onClick={()=>{navigator.clipboard?.writeText(text).catch(()=>{});setCopied(true);setTimeout(()=>setCopied(false),2000);}} style={{width:"100%",padding:"10px",borderRadius:9,border:"none",background:copied?"#34d399":"#3b82f6",color:"#fff",fontWeight:700,cursor:"pointer",fontFamily:"inherit",fontSize:12}}>{copied?"✓ Copied":"📋 Copy Card Text"}</button>
        <div style={{fontSize:9,color:"rgba(255,255,255,0.3)",marginTop:7,textAlign:"center"}}>Show to station staff or emergency services</div>
      </div>
    </div>
  );
}

// ─── PROFILE MODAL ────────────────────────────────────────────────────────────
function ProfileModal({profile,onSave,onClose,savedRoutes=[],onDeleteRoute,onOpenJourney}){
  const [types,setTypes]=useState(profile?.types||[profile?.type||"manual"]);
  const [needs,setNeeds]=useState(profile?.needs||"");
  const [contact,setContact]=useState(profile?.emergencyContact||"");
  return(
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.82)",zIndex:500,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(4px)"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#0f1424",borderRadius:"20px 20px 0 0",border:"1px solid rgba(255,255,255,0.09)",width:"100%",maxWidth:700,maxHeight:"85vh",overflowY:"auto",padding:"20px 16px 40px"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:15}}>
          <div>
            <div style={{fontFamily:"monospace",fontSize:14,fontWeight:700,color:"#fff",marginBottom:4}}>👤 My Accessibility Profile</div>
            <div style={{display:"flex",alignItems:"center",gap:7}}>
              <div style={{width:28,height:28,background:"#0d0d1a",border:"1.5px solid rgba(59,130,246,0.5)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"0 0 10px rgba(59,130,246,0.3)"}}>
                <svg width="18" height="18" viewBox="0 0 84 84" fill="none">
                  <line x1="22" y1="64" x2="22" y2="24" stroke="#3b82f6" strokeWidth="10" strokeLinecap="round"/>
                  <path d="M22 36 Q22 16 42 16 Q62 16 62 36 L62 64" stroke="#8b5cf6" strokeWidth="10" strokeLinecap="round" fill="none"/>
                  <circle cx="22" cy="24" r="9" fill="#3b82f6"/>
                  <circle cx="22" cy="64" r="9" fill="#1d4ed8"/>
                  <circle cx="42" cy="16" r="7" fill="#8b5cf6"/>
                  <circle cx="62" cy="64" r="9" fill="#06b6d4"/>
                </svg>
              </div>
              <span style={{fontSize:12,fontWeight:700,color:"rgba(255,255,255,0.4)",letterSpacing:"1.5px",textTransform:"uppercase"}}>noruka</span>
            </div>
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:8,color:"rgba(255,255,255,0.6)",width:28,height:28,cursor:"pointer",fontSize:13}}>✕</button>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:8,marginBottom:17}}>
          {PROFILE_TYPES.map(pt=>(
            <button key={pt.id} onClick={()=>setTypes(tt=>tt.includes(pt.id)?tt.filter(x=>x!==pt.id):[...tt,pt.id])} style={{padding:"11px 7px",borderRadius:10,border:`2px solid ${types.includes(pt.id)?"#3b82f6":"rgba(255,255,255,0.1)"}`,background:types.includes(pt.id)?"rgba(66,133,244,0.2)":"rgba(255,255,255,0.04)",cursor:"pointer",textAlign:"center",fontFamily:"inherit"}}>
              <div style={{fontSize:20,marginBottom:4}}>{pt.icon}</div>
              <div style={{fontSize:11,color:types.includes(pt.id)?"#fff":"rgba(255,255,255,0.55)",fontWeight:types.includes(pt.id)?700:400,lineHeight:1.3}}>{pt.label}</div>
            </button>
          ))}
        </div>
        <div style={{fontSize:9,letterSpacing:"2px",textTransform:"uppercase",color:"rgba(255,255,255,0.35)",fontFamily:"'Space Grotesk',sans-serif",fontWeight:600,marginBottom:6}}>Special needs / notes (for emergency card)</div>
        <textarea value={needs} onChange={e=>setNeeds(e.target.value)} placeholder="e.g. Power wheelchair, requires ramp, hearing impaired" style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.14)",borderRadius:9,padding:"9px 11px",color:"#fff",fontSize:12,fontFamily:"inherit",resize:"vertical",minHeight:60,outline:"none",marginBottom:13,boxSizing:"border-box"}}/>
        <div style={{fontSize:9,letterSpacing:"2px",textTransform:"uppercase",color:"rgba(255,255,255,0.35)",fontFamily:"'Space Grotesk',sans-serif",fontWeight:600,marginBottom:6}}>Emergency contact</div>
        <input value={contact} onChange={e=>setContact(e.target.value)} placeholder="e.g. Call John: +81-90-1234-5678" style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"1px solid rgba(255,255,255,0.14)",borderRadius:9,padding:"9px 11px",color:"#fff",fontSize:12,fontFamily:"inherit",outline:"none",marginBottom:17,boxSizing:"border-box"}}/>
        {savedRoutes.length>0&&(
          <div style={{marginBottom:17}}>
            <div style={{fontSize:9,letterSpacing:"2px",textTransform:"uppercase",color:"rgba(255,255,255,0.35)",fontFamily:"'Space Grotesk',sans-serif",fontWeight:600,marginBottom:8}}>Saved Routes</div>
            <div style={{display:"flex",flexDirection:"column",gap:7}}>
              {savedRoutes.map(r=>(
                <div key={r.id} style={{background:"rgba(59,130,246,0.06)",border:"1px solid rgba(59,130,246,0.18)",borderRadius:10,padding:"10px 12px"}}>
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
                    <div>
                      <div style={{fontWeight:700,fontSize:12,color:"#fff",marginBottom:1}}>{r.from} to {r.to}</div>
                      <div style={{fontSize:10,color:"rgba(255,255,255,0.3)"}}>{r.date}</div>
                    </div>
                    <div style={{display:"flex",gap:8,alignItems:"center"}}>
                      <button onClick={()=>{
                        const text = `Accessible route: ${r.from} to ${r.to} via Noruka

${r.plan}

Planned with Noruka · Japan Rail Access · noruka.vercel.app`;
                        if(navigator.share){navigator.share({title:`${r.from} to ${r.to} - Noruka Route`,text}).catch(()=>{});}
                        else{navigator.clipboard?.writeText(text).catch(()=>{});alert("Route copied to clipboard!");}
                      }} style={{background:"none",border:"none",color:"#7dd3fc",fontSize:11,cursor:"pointer",padding:0,fontFamily:"inherit"}}>Share</button>
                      <button onClick={()=>onDeleteRoute(r.id)} style={{background:"none",border:"none",color:"rgba(255,255,255,0.25)",fontSize:16,cursor:"pointer",padding:0,lineHeight:1}}>x</button>
                    </div>
                  </div>
                  <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",marginTop:5,lineHeight:1.5,maxHeight:36,overflow:"hidden"}}>{r.plan.slice(0,100)}...</div>
                </div>
              ))}
            </div>
          </div>
        )}
        {savedRoutes.length===0&&(
          <div style={{marginBottom:17,padding:"12px",background:"rgba(255,255,255,0.03)",borderRadius:10,textAlign:"center"}}>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.25)",marginBottom:6}}>No saved routes yet</div>
            <button onClick={onOpenJourney} style={{background:"rgba(59,130,246,0.1)",border:"1px solid rgba(59,130,246,0.25)",borderRadius:8,color:"#7dd3fc",padding:"5px 12px",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>Plan a Journey</button>
          </div>
        )}
        <button onClick={()=>{onSave({type:types[0],types,needs,emergencyContact:contact});onClose();}} style={{width:"100%",padding:"12px",borderRadius:10,border:"none",background:"linear-gradient(135deg,#3b82f6,#06b6d4)",color:"#fff",fontWeight:700,cursor:"pointer",fontSize:14,fontFamily:"inherit"}}>Save Profile</button>
      </div>
    </div>
  );
}

// ─── STATION DETAIL ───────────────────────────────────────────────────────────
function StationDetail({station,cityKey,onBack,isFav,onToggleFav,profile,weather,lastUpdated}){
  const [tab,setTab]=useState("overview");
  const [verified,setVerified]=useState({});
  const [copied,setCopied]=useState(null);
  const [nearestElev,setNearestElev]=useState(null);
  const [locLoading,setLocLoading]=useState(false);
  const [locError,setLocError]=useState(null);
  const {info:trainInfo}=useTrainInfo(station.lines||[]);
  const city=CITIES[cityKey];

  return(
    <div>
      <div style={{display:"flex",alignItems:"center",justifyContent:"space-between",marginBottom:14}}>
        <button onClick={onBack} style={{display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:10,color:"rgba(255,255,255,0.55)",padding:"7px 14px",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>← Back to {city.name}</button>
        <div style={{display:"flex",alignItems:"center",gap:6}}>
          <div style={{width:22,height:22,background:"#0d0d1a",border:"1.5px solid rgba(59,130,246,0.4)",borderRadius:6,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0}}>
            <svg width="14" height="14" viewBox="0 0 84 84" fill="none">
              <line x1="22" y1="64" x2="22" y2="24" stroke="#3b82f6" strokeWidth="10" strokeLinecap="round"/>
              <path d="M22 36 Q22 16 42 16 Q62 16 62 36 L62 64" stroke="#8b5cf6" strokeWidth="10" strokeLinecap="round" fill="none"/>
              <circle cx="22" cy="24" r="9" fill="#3b82f6"/>
              <circle cx="22" cy="64" r="9" fill="#1d4ed8"/>
              <circle cx="42" cy="16" r="7" fill="#8b5cf6"/>
              <circle cx="62" cy="64" r="9" fill="#06b6d4"/>
            </svg>
          </div>
          <span style={{fontSize:11,fontWeight:700,color:"rgba(255,255,255,0.25)",letterSpacing:"1.5px",textTransform:"uppercase"}}>noruka</span>
        </div>
      </div>

      {/* Live disruption banner */}
      {trainInfo.filter(i=>i["odpt:trainInformationText"]?.en||i["odpt:trainInformationText"]?.ja).map((item,i)=>(
        <div key={i} style={{background:"rgba(245,158,11,0.1)",border:"1px solid rgba(245,158,11,0.35)",borderRadius:9,padding:"9px 12px",marginBottom:8,display:"flex",gap:8,alignItems:"flex-start"}}>
          <span style={{fontSize:14,flexShrink:0}}>🚨</span>
          <div>
            <div style={{fontSize:10,fontWeight:700,color:"#fbbf24",marginBottom:2}}>LIVE SERVICE UPDATE</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.8)",lineHeight:1.4}}>{item["odpt:trainInformationText"]?.en||item["odpt:trainInformationText"]?.ja}</div>
          </div>
        </div>
      ))}

      {/* Header */}
      <div style={{marginBottom:11}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
          <div>
            <div style={{fontSize:"clamp(18px,4vw,24px)",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,color:"#fff",lineHeight:1.2,letterSpacing:"-0.3px"}}>{station.name}</div>
            <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:5}}>
            <div style={{fontSize:15,color:"rgba(255,255,255,0.28)"}}>{station.nameJp}</div>
            {(()=>{const cw=weather[cityKey]||WEATHER_FALLBACK[cityKey];return cw?(<span style={{fontSize:10,color:cw.warn?"#fde68a":"rgba(255,255,255,0.35)"}}>{cw.icon} {cw.temp} · {cw.label}</span>):null;})()}
          </div>
          </div>
          <div style={{display:"flex",gap:4,alignItems:"center"}}>
            <button onClick={()=>{
              const text = `${station.name} (${station.nameJp}) - Accessibility info on Noruka`;
              const url = `https://noruka.vercel.app`;
              if(navigator.share){navigator.share({title:station.name,text,url}).catch(()=>{});}
              else{navigator.clipboard?.writeText(`${text}: ${url}`).catch(()=>{});alert("Link copied to clipboard!");}
            }} style={{background:"none",border:"none",fontSize:16,cursor:"pointer",color:"rgba(255,255,255,0.3)",padding:"0 4px"}}>Share</button>
            <button onClick={()=>onToggleFav(station.id)} style={{background:"none",border:"none",fontSize:20,cursor:"pointer",color:isFav?"#fbbf24":"rgba(255,255,255,0.2)",padding:"0 0 0 4px"}}>★</button>
          </div>
        </div>
        <ScoreBar score={station.accessScore}/>
        <div style={{display:"flex",gap:6,flexWrap:"wrap",alignItems:"center",marginTop:8}}>
          {station.staffAssist&&<span style={{display:"inline-flex",alignItems:"center",gap:4,background:"rgba(52,211,153,0.1)",border:"1px solid rgba(52,211,153,0.22)",borderRadius:20,padding:"3px 9px",fontSize:10,color:"#34d399"}}>Staff assistance available</span>}
          <button onClick={()=>window.open(`tel:${station.phone}`)} style={{display:"inline-flex",alignItems:"center",gap:4,background:"rgba(66,133,244,0.1)",border:"1px solid rgba(66,133,244,0.25)",borderRadius:20,padding:"3px 9px",fontSize:10,color:"#7dd3fc",cursor:"pointer",fontFamily:"inherit"}}>📞 {station.phone}</button>
        </div>
      </div>



      {/* Profile tip */}
      {profile?.type==="power"&&<div style={{background:"rgba(251,191,36,0.08)",border:"1px solid rgba(251,191,36,0.2)",borderRadius:9,padding:"8px 11px",fontSize:11,color:"#fde68a",marginBottom:9}}>⚡ Power wheelchair: Check elevator door widths. Charging may be available — ask staff.</div>}
      {profile?.type==="visual"&&<div style={{background:"rgba(99,102,241,0.1)",border:"1px solid rgba(99,102,241,0.25)",borderRadius:9,padding:"8px 11px",fontSize:11,color:"#c7d2fe",marginBottom:9}}>👁 Visual impairment: Tactile paving at all exits. Yellow guide strip leads to elevator.</div>}

      {/* Alerts */}
      {(station.elevators||[]).some(e=>e.status==="maintenance")&&(
        <div style={{display:"flex",gap:7,padding:"8px 11px",borderRadius:9,marginBottom:8,fontSize:11,lineHeight:1.4,background:"rgba(245,158,11,0.1)",border:"1px solid rgba(245,158,11,0.28)",color:"#fde68a"}}>
          <span>Elevator out of service:</span>
          <span>{(station.elevators||[]).filter(e=>e.status==="maintenance").map(e=>e.location).join(", ")} — tap Elevators tab for alternatives</span>
        </div>
      )}
      {station.alerts?.map((a,i)=>(
        <div key={i} style={{display:"flex",gap:7,padding:"8px 11px",borderRadius:9,marginBottom:8,fontSize:11,lineHeight:1.4,background:a.type==="warning"?"rgba(245,158,11,0.1)":"rgba(66,133,244,0.08)",border:`1px solid ${a.type==="warning"?"rgba(245,158,11,0.28)":"rgba(66,133,244,0.22)"}`,color:a.type==="warning"?"#fde68a":"#93c5fd"}}>
          <span>{a.type==="warning"?"⚠️":"ℹ️"}</span><span>{a.msg}</span>
        </div>
      ))}

      <CrowdingChart crowding={station.crowding} quiet={station.quietHours}/>

      {/* Tabs */}
      <div style={{display:"flex",borderBottom:"1px solid rgba(255,255,255,0.08)",marginBottom:13,overflowX:"auto",scrollbarWidth:"none",gap:2}}>
        {[["overview","📋 Overview"],["elevators","🛗 Elevators"],["cars","🚃 Car & Gap"],["comfort","🪑 Comfort"],["hotels","🏨 Hotels"],["phrases","🗣️ Phrases"],["toilets","🚻 Restrooms"]].map(([v,l])=>(
          <button key={v} onClick={()=>setTab(v)} style={{padding:"7px 10px",fontSize:10,fontWeight:700,fontFamily:"inherit",cursor:"pointer",background:"none",border:"none",borderBottom:`2px solid ${tab===v?"#3b82f6":"transparent"}`,marginBottom:-2,color:tab===v?"#3b82f6":"rgba(255,255,255,0.35)",whiteSpace:"nowrap"}}>{l}</button>
        ))}
      </div>

      {tab==="overview"&&(
        <div>
          <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,padding:"11px 13px",marginBottom:9}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:5}}>
              <span style={{fontWeight:700,fontSize:12,color:"#fff"}}>[wheelchair] Transfer</span>
              <Pill color={DIFF_COLOR[station.transferDifficulty]}>{station.transferDifficulty==="easy"?"Easy":station.transferDifficulty==="moderate"?"Moderate":"Challenging"}</Pill>
            </div>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.6)",lineHeight:1.5}}>{station.transferNote}</div>
          </div>
          <div style={{background:`${GAP[station.platformGap]||"#7dd3fc"}14`,border:`1px solid ${GAP[station.platformGap]||"#7dd3fc"}38`,borderRadius:10,padding:"10px 12px",marginBottom:9,display:"flex",gap:7,alignItems:"flex-start"}}>
            <div style={{width:7,height:7,borderRadius:"50%",background:GAP[station.platformGap]||"#7dd3fc",marginTop:3,flexShrink:0}}/>
            <div><div style={{fontWeight:700,fontSize:11,color:GAP[station.platformGap]||"#7dd3fc",marginBottom:2}}>Platform Gap: {GAP_LABEL[station.platformGap]||"Unknown"}</div><div style={{fontSize:10,color:"rgba(255,255,255,0.45)"}}>Boarding ramp available on request at all stations — ask at the gate.</div></div>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,marginBottom:9}}>
            <div onClick={()=>setTab("elevators")} style={{background:"rgba(66,133,244,0.08)",border:"2px solid rgba(66,133,244,0.25)",borderRadius:9,padding:"10px 12px",textAlign:"center",cursor:"pointer",transition:"border-color 0.15s"}} onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(66,133,244,0.55)"} onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(66,133,244,0.25)"}>
              <div style={{fontSize:22,fontWeight:700,color:"#3b82f6",fontFamily:"monospace"}}>{station.elevatorCount}</div>
              <div style={{fontSize:9,color:"#7dd3fc"}}>🛗 Elevators</div>
              <div style={{fontSize:8,color:"rgba(66,133,244,0.7)",marginTop:2}}>Tap for details</div>
            </div>
            <div onClick={()=>setTab("toilets")} style={{background:"rgba(6,182,212,0.08)",border:"2px solid rgba(6,182,212,0.25)",borderRadius:9,padding:"10px 12px",textAlign:"center",cursor:"pointer",transition:"border-color 0.15s"}} onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(6,182,212,0.55)"} onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(6,182,212,0.25)"}>
              <div style={{fontSize:22,fontWeight:700,color:"#06b6d4",fontFamily:"monospace"}}>{TOILETS[station.id]?"1":"—"}</div>
              <div style={{fontSize:9,color:"#67e8f9"}}>🚻 Accessible Restroom</div>
              <div style={{fontSize:8,color:"rgba(6,182,212,0.7)",marginTop:2}}>{TOILETS[station.id]?"Tap for info":"No data yet"}</div>
            </div>
            <div onClick={()=>setTab("toilets")} style={{background:"rgba(249,168,212,0.08)",border:"2px solid rgba(249,168,212,0.25)",borderRadius:9,padding:"10px 12px",textAlign:"center",cursor:"pointer",transition:"border-color 0.15s"}} onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(249,168,212,0.55)"} onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(249,168,212,0.25)"}>
              <div style={{fontSize:22,fontWeight:700,color:"#f9a8d4",fontFamily:"monospace"}}>{BABY_CHANGING[station.id]?"1":"—"}</div>
              <div style={{fontSize:9,color:"#f9a8d4"}}>👶 Baby Changing</div>
              <div style={{fontSize:8,color:"rgba(249,168,212,0.7)",marginTop:2}}>{BABY_CHANGING[station.id]?"Tap for info":"No data yet"}</div>
            </div>
            <div onClick={()=>setTab("toilets")} style={{background:"rgba(251,191,36,0.08)",border:"2px solid rgba(251,191,36,0.25)",borderRadius:9,padding:"10px 12px",textAlign:"center",cursor:"pointer",transition:"border-color 0.15s"}} onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(251,191,36,0.55)"} onMouseLeave={e=>e.currentTarget.style.borderColor="rgba(251,191,36,0.25)"}>
              <div style={{fontSize:22,fontWeight:700,color:"#fbbf24",fontFamily:"monospace"}}>{CHARGING[station.id]?CHARGING[station.id].length:"—"}</div>
              <div style={{fontSize:9,color:"#fbbf24"}}>🔋 Charging Station</div>
              <div style={{fontSize:8,color:"rgba(251,191,36,0.7)",marginTop:2}}>{CHARGING[station.id]?"Tap for info":"No data yet"}</div>
            </div>
          </div>
          <div style={{background:"rgba(251,191,36,0.07)",border:"1px solid rgba(251,191,36,0.2)",borderRadius:9,padding:"10px 12px",marginBottom:9}}>
            <div style={{fontSize:10,fontWeight:700,color:"#fbbf24",marginBottom:3}}>🚕 Accessible Taxi (WAV)</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.65)",lineHeight:1.4}}>{Array.isArray(station.taxiInfo)?station.taxiInfo.join(" · "):station.taxiInfo}</div>
          </div>
          {station.staffAssist&&(()=>{const s=STAFF_LOCATION[station.id]||DEFAULT_STAFF;return(
            <div style={{background:"rgba(99,102,241,0.07)",border:"1px solid rgba(99,102,241,0.2)",borderRadius:9,padding:"11px 13px",marginBottom:9}}>
              <div style={{fontSize:10,fontWeight:700,color:"#818cf8",marginBottom:8}}>👨‍💼 Finding Staff Assistance</div>
              <div style={{display:"flex",flexDirection:"column",gap:7}}>
                <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                  <span style={{fontSize:13,flexShrink:0}}>🚪</span>
                  <div><div style={{fontSize:9,color:"rgba(255,255,255,0.3)",textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>Which gate</div><div style={{fontSize:11,color:"rgba(255,255,255,0.75)",lineHeight:1.5}}>{s.gate}</div></div>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                  <span style={{fontSize:13,flexShrink:0}}>👀</span>
                  <div><div style={{fontSize:9,color:"rgba(255,255,255,0.3)",textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>What to look for</div><div style={{fontSize:11,color:"rgba(255,255,255,0.75)",lineHeight:1.5}}>{s.look}</div></div>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                  <span style={{fontSize:13,flexShrink:0}}>🔔</span>
                  <div><div style={{fontSize:9,color:"rgba(255,255,255,0.3)",textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>Getting attention</div><div style={{fontSize:11,color:"rgba(255,255,255,0.75)",lineHeight:1.5}}>{s.intercom}</div></div>
                </div>
                <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                  <span style={{fontSize:13,flexShrink:0}}>💡</span>
                  <div><div style={{fontSize:9,color:"rgba(255,255,255,0.3)",textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>Tip</div><div style={{fontSize:11,color:"rgba(255,255,255,0.75)",lineHeight:1.5}}>{s.tip}</div></div>
                </div>
              </div>
            </div>
          );})()}
          <div style={{background:"rgba(52,211,153,0.06)",border:"1px solid rgba(52,211,153,0.17)",borderRadius:9,padding:"10px 12px"}}>
            <div style={{fontSize:10,fontWeight:700,color:"#34d399",marginBottom:3}}>🏥 Nearest Medical</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.65)",lineHeight:1.4}}>{station.medicalNearby}</div>
            <div style={{fontSize:10,color:"#f87171",marginTop:5,fontWeight:700}}>119 Ambulance · 110 Police · 03-5285-8181 English Lifeline</div>
          </div>
        </div>
      )}

      {tab==="elevators"&&(
        <div>

          <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginBottom:9,lineHeight:1.5}}>
            Tap any elevator to see floor details, location landmark, and door width. Tap <strong style={{color:"#34d399"}}>Verify</strong> to confirm it's working.
          </div>

          {/* Find nearest elevator button */}
          <button onClick={()=>{
            if(!navigator.geolocation){setLocError("Location not supported on this device");return;}
            setLocLoading(true);setLocError(null);setNearestElev(null);
            navigator.geolocation.getCurrentPosition(
              (pos)=>{
                const userLat=pos.coords.latitude;
                const userLng=pos.coords.longitude;
                let best=0,bestDist=Infinity;
                (station.elevators||[]).forEach((e,i)=>{
                  const angle=(i/Math.max(station.elevators.length,1))*2*Math.PI;
                  const offset=0.0002;
                  const eLat=station.lat+Math.sin(angle)*offset;
                  const eLng=station.lng+Math.cos(angle)*offset;
                  const dist=Math.sqrt(Math.pow(userLat-eLat,2)+Math.pow(userLng-eLng,2));
                  if(dist<bestDist){bestDist=dist;best=i;}
                });
                setNearestElev(best);setLocLoading(false);
              },
              ()=>{setLocError("Could not get your location. Please enable location access.");setLocLoading(false);}
            );
          }} style={{width:"100%",padding:"10px",borderRadius:9,border:"1px solid rgba(59,130,246,0.35)",background:"rgba(59,130,246,0.08)",color:"#7dd3fc",fontSize:12,fontWeight:700,cursor:"pointer",fontFamily:"inherit",marginBottom:10,display:"flex",alignItems:"center",justifyContent:"center",gap:6}}>
            {locLoading?"🔍 Locating you…":"📍 Find nearest elevator"}
          </button>
          {locError&&<div style={{fontSize:11,color:"#f87171",marginBottom:8,padding:"7px 10px",background:"rgba(248,113,113,0.08)",borderRadius:7,border:"1px solid rgba(248,113,113,0.2)"}}>{locError}</div>}
          {nearestElev!==null&&<div style={{fontSize:11,color:"#34d399",marginBottom:8,padding:"7px 10px",background:"rgba(52,211,153,0.08)",borderRadius:7,border:"1px solid rgba(52,211,153,0.2)"}}>📍 Nearest elevator highlighted below</div>}

          {station.elevators?.map((e,i)=>{
            const key=`${station.id}-${e.id||i}`;
            const v=verified[key];
            const isOpen=verified[`open-${key}`];
            const maintenance=e.status==="maintenance";
            const borderCol=maintenance?"rgba(245,158,11,0.4)":v?"rgba(52,211,153,0.4)":"rgba(66,133,244,0.14)";
            return(
              <div key={i} style={{background:"rgba(255,255,255,0.04)",border:`2px solid ${borderCol}`,borderRadius:11,marginBottom:8,overflow:"hidden",transition:"border-color 0.2s"}}>
                {/* ── Card header — always visible, tappable ── */}
                <div onClick={()=>setVerified(vv=>({...vv,[`open-${key}`]:!isOpen}))} style={{padding:"11px 13px",display:"grid",gridTemplateColumns:"36px 1fr auto",gap:10,alignItems:"center",cursor:"pointer"}}>
                  <div style={{width:36,height:36,background:maintenance?"rgba(245,158,11,0.12)":"rgba(66,133,244,0.12)",border:`2px solid ${maintenance?"rgba(245,158,11,0.3)":"rgba(66,133,244,0.25)"}`,borderRadius:9,display:"flex",alignItems:"center",justifyContent:"center",fontSize:16,flexShrink:0}}>🛗</div>
                  <div>
                    <div style={{fontWeight:700,fontSize:12,color:"#fff",marginBottom:2}}>{e.location}{nearestElev===i&&<span style={{marginLeft:7,fontSize:9,padding:"2px 7px",borderRadius:20,background:"rgba(52,211,153,0.15)",border:"1px solid rgba(52,211,153,0.4)",color:"#34d399",fontWeight:700}}>📍 Nearest to you</span>}</div>
                    <div style={{fontSize:10,color:"rgba(255,255,255,0.45)",fontFamily:"monospace"}}>{e.floors||"Floors not specified"}</div>
                    <div style={{fontSize:9,marginTop:2,color:maintenance?"#fbbf24":v?"#34d399":"rgba(255,255,255,0.3)"}}>{maintenance?"⚠ Under maintenance":v?"✓ Verified working by you":`✓ Verified by ${e.verifiedCount||"—"} recent users`}</div>
                  </div>
                  <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:4}}>
                    <span style={{fontSize:10,color:"rgba(255,255,255,0.3)",transform:isOpen?"rotate(180deg)":"rotate(0deg)",transition:"transform 0.2s",display:"inline-block"}}>▼</span>
                    {e.doorWidthCm&&<span style={{fontSize:9,padding:"1px 6px",borderRadius:20,background:"rgba(96,165,250,0.12)",border:"1px solid rgba(96,165,250,0.25)",color:"#7dd3fc",whiteSpace:"nowrap"}}>{e.doorWidthCm}cm</span>}
                  </div>
                </div>

                {/* ── Expanded detail ── */}
                {isOpen&&(
                  <div style={{borderTop:"1px solid rgba(255,255,255,0.07)",padding:"11px 13px",display:"flex",flexDirection:"column",gap:8}}>
                    {/* Floor diagram */}
                    <div style={{background:"rgba(66,133,244,0.07)",border:"1px solid rgba(66,133,244,0.18)",borderRadius:9,padding:"10px 12px"}}>
                      <div style={{fontSize:9,letterSpacing:1,textTransform:"uppercase",color:"rgba(255,255,255,0.3)",marginBottom:6}}>Floor Route</div>
                      <div style={{fontFamily:"monospace",fontSize:12,color:"#7dd3fc",lineHeight:1.8}}>
                        {(e.floors||"Street → Platform").split("→").map((f,fi,arr)=>(
                          <div key={fi} style={{display:"flex",alignItems:"center",gap:6}}>
                            <span style={{color:fi===0?"#34d399":fi===arr.length-1?"#818cf8":"#7dd3fc"}}>●</span>
                            <span style={{color:"#e8f0fe"}}>{f.trim()}</span>
                            {fi<arr.length-1&&<span style={{color:"rgba(255,255,255,0.2)",marginLeft:18,display:"block",fontSize:10}}>↑</span>}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* How to find */}
                    {e.landmark&&(
                      <div style={{background:"rgba(59,130,246,0.07)",border:"1px solid rgba(59,130,246,0.2)",borderRadius:9,padding:"10px 12px"}}>
                        <div style={{fontSize:9,color:"#7dd3fc",textTransform:"uppercase",letterSpacing:1,fontWeight:700,marginBottom:8}}>🧭 How to find this elevator</div>
                        <div style={{display:"flex",flexDirection:"column",gap:6}}>
                          <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                            <div style={{width:18,height:18,borderRadius:"50%",background:"#3b82f6",color:"#fff",fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>1</div>
                            <div style={{fontSize:11,color:"rgba(255,255,255,0.75)",lineHeight:1.4}}>Head to <strong style={{color:"#fff"}}>{e.location}</strong></div>
                          </div>
                          <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                            <div style={{width:18,height:18,borderRadius:"50%",background:"#3b82f6",color:"#fff",fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>2</div>
                            <div style={{fontSize:11,color:"rgba(255,255,255,0.75)",lineHeight:1.4}}>Look for: <span style={{color:"rgba(255,255,255,0.9)"}}>{e.landmark}</span></div>
                          </div>
                          <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                            <div style={{width:18,height:18,borderRadius:"50%",background:"#3b82f6",color:"#fff",fontSize:9,fontWeight:700,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,marginTop:1}}>3</div>
                            <div style={{fontSize:11,color:"rgba(255,255,255,0.75)",lineHeight:1.4}}>Follow blue <strong style={{color:"#7dd3fc"}}>[wheelchair] signs</strong> — floors: <span style={{fontFamily:"monospace",color:"rgba(255,255,255,0.9)"}}>{e.floors}</span></div>
                          </div>
                          {e.tip&&(
                            <div style={{display:"flex",gap:8,alignItems:"flex-start",marginTop:2,paddingTop:8,borderTop:"1px solid rgba(255,255,255,0.07)"}}>
                              <span style={{fontSize:12,flexShrink:0}}>💡</span>
                              <div style={{fontSize:11,color:"rgba(255,255,255,0.55)",lineHeight:1.4,fontStyle:"italic"}}>{e.tip}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Door width */}
                    {e.doorWidthCm&&(
                      <div style={{display:"flex",gap:8,alignItems:"flex-start"}}>
                        <span style={{fontSize:14,flexShrink:0}}>↔️</span>
                        <div>
                          <div style={{fontSize:9,color:"rgba(255,255,255,0.3)",textTransform:"uppercase",letterSpacing:1,marginBottom:2}}>Door Width</div>
                          <div style={{fontSize:11,color:e.doorWidthCm>=140?"#34d399":e.doorWidthCm>=120?"#7dd3fc":"#f59e0b",fontWeight:700}}>{e.doorWidthCm} cm
                            <span style={{fontWeight:400,color:"rgba(255,255,255,0.4)",marginLeft:6,fontSize:10}}>
                              {e.doorWidthCm>=140?"Wide — suits power chairs":e.doorWidthCm>=120?"Standard — most wheelchairs":"Narrow — manual chairs only"}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}



                    {/* Verify button */}
                    <button onClick={e2=>{e2.stopPropagation();setVerified(vv=>({...vv,[key]:true}));}} style={{alignSelf:"flex-start",fontSize:11,padding:"6px 14px",borderRadius:20,border:`1px solid ${v?"rgba(52,211,153,0.45)":"rgba(255,255,255,0.18)"}`,background:v?"rgba(52,211,153,0.12)":"rgba(255,255,255,0.06)",color:v?"#34d399":"rgba(255,255,255,0.6)",cursor:"pointer",fontFamily:"inherit",fontWeight:700}}>
                      {v?"✓ Confirmed working":"Confirm this elevator is working"}
                    </button>
                  </div>
                )}
              </div>
            );
          })}
          <div style={{background:"rgba(66,133,244,0.06)",border:"1px solid rgba(66,133,244,0.15)",borderRadius:9,padding:"9px 11px",fontSize:10,color:"rgba(255,255,255,0.4)",lineHeight:1.5,marginTop:4}}>
            📞 Live status: call {station.phone} · JR East English line <strong style={{color:"#7dd3fc"}}>050-2016-1603</strong> · Tokyo Metro <strong style={{color:"#7dd3fc"}}>03-3941-2004</strong>
          </div>
        </div>
      )}

      {tab==="cars"&&(
        <div>
          <div style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,padding:"12px 13px",marginBottom:9}}>
            <div style={{fontWeight:700,fontSize:12,color:"#fff",marginBottom:6}}>🚃 Wheelchair Boarding Car</div>
            <div style={{fontSize:13,color:"#7dd3fc",fontFamily:"monospace",marginBottom:6}}>{station.wheelchairCar}</div>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.6)",lineHeight:1.5,marginBottom:7}}>Look for the blue [wheelchair] symbol on the platform floor. Staff can deploy a ramp on request — press the intercom on the platform or ask at the ticket gate.</div>
            <div style={{background:`${GAP[station.platformGap]||"#7dd3fc"}14`,border:`1px solid ${GAP[station.platformGap]||"#7dd3fc"}38`,borderRadius:8,padding:"8px 10px",display:"flex",gap:6,alignItems:"flex-start"}}>
              <div style={{width:6,height:6,borderRadius:"50%",background:GAP[station.platformGap]||"#7dd3fc",marginTop:3,flexShrink:0}}/>
              <div><div style={{fontSize:10,fontWeight:700,color:GAP[station.platformGap]||"#7dd3fc",marginBottom:1}}>Gap: {GAP_LABEL[station.platformGap]||"Variable"}</div><div style={{fontSize:10,color:"rgba(255,255,255,0.45)"}}>Tell gate staff your destination — they phone ahead so a ramp is waiting at your arrival station.</div></div>
            </div>
          </div>
          <div style={{background:"rgba(66,133,244,0.07)",border:"1px solid rgba(66,133,244,0.18)",borderRadius:9,padding:"9px 12px",fontSize:11,color:"rgba(255,255,255,0.5)",lineHeight:1.5}}>
            💡 <strong style={{color:"#7dd3fc"}}>Shinkansen:</strong> Must reserve wheelchair space in advance. Call JR English: <strong style={{color:"#7dd3fc"}}>050-3772-3910</strong>
          </div>
        </div>
      )}

      {tab==="comfort"&&(
        <div>
          {station.restAreas?.length>0&&<>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:7}}><span style={{fontSize:16}}>🪑</span><span style={{fontSize:10,fontWeight:700,color:"#818cf8",textTransform:"uppercase",letterSpacing:1}}>Rest Areas</span></div>
            {station.restAreas.map((r,i)=><div key={i} style={{background:"rgba(99,102,241,0.07)",border:"1px solid rgba(99,102,241,0.18)",borderRadius:9,padding:"10px 12px",marginBottom:7}}><div style={{fontWeight:700,fontSize:12,color:"#fff",marginBottom:2}}>{r.location}</div><div style={{fontSize:10,color:"rgba(255,255,255,0.38)",marginBottom:4,textTransform:"capitalize"}}>Type: {r.type}</div><div style={{fontSize:11,color:"rgba(255,255,255,0.65)",lineHeight:1.4}}>{r.notes}</div></div>)}
          </>}
          {station.chargingPoints?.length>0&&<>
            <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:7,marginTop:13}}><span style={{fontSize:16}}>⚡</span><span style={{fontSize:10,fontWeight:700,color:"#fbbf24",textTransform:"uppercase",letterSpacing:1}}>Wheelchair Charging</span></div>
            {station.chargingPoints.map((c,i)=><div key={i} style={{background:"rgba(251,191,36,0.07)",border:"1px solid rgba(251,191,36,0.18)",borderRadius:9,padding:"10px 12px",marginBottom:7}}><div style={{fontWeight:700,fontSize:12,color:"#fff",marginBottom:3}}>{c.location}</div><div style={{fontSize:11,color:"rgba(255,255,255,0.65)",lineHeight:1.4}}>{c.notes}</div></div>)}
          </>}
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:7,marginTop:station.restAreas?.length||station.chargingPoints?.length?13:0}}><span style={{fontSize:10,fontWeight:700,color:"#10b981",textTransform:"uppercase",letterSpacing:1}}>🚻 Accessible Restrooms</span></div>
          <div style={{background:"rgba(16,185,129,0.07)",border:"1px solid rgba(16,185,129,0.18)",borderRadius:9,padding:"10px 12px",marginBottom:13}}>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.65)",lineHeight:1.5}}>Multi-function restrooms (多機能トイレ) with grab bars, wide doors, and ostomate facilities are available at all stations scoring 3+. Follow [wheelchair] signs from concourse.</div>
          </div>
          <div style={{display:"flex",alignItems:"center",gap:6,marginBottom:7}}><span style={{fontSize:16}}>❤️</span><span style={{fontSize:10,fontWeight:700,color:"#f87171",textTransform:"uppercase",letterSpacing:1}}>AED & Emergency</span></div>
          <div style={{background:"rgba(239,68,68,0.07)",border:"1px solid rgba(239,68,68,0.18)",borderRadius:9,padding:"10px 12px"}}>
            <div style={{fontSize:11,color:"rgba(255,255,255,0.65)",lineHeight:1.5}}>AED at staffed ticket gates. All staff are trained in first aid. Station: <strong style={{color:"#f87171"}}>{station.phone}</strong></div>
            <div style={{fontSize:10,color:"#f87171",fontWeight:700,marginTop:5}}>119 Ambulance · 110 Police · 03-5285-8181 English Lifeline</div>
          </div>
        </div>
      )}

      {tab==="hotels"&&(
        <div>
          {(!station.nearbyHotels||station.nearbyHotels.length===0)?(
            <div style={{color:"rgba(255,255,255,0.35)",fontSize:12,padding:"20px 0",textAlign:"center"}}>No hotel data yet for this station.</div>
          ):station.nearbyHotels.map((h,i)=>(
            <div key={i} style={{background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:10,padding:"11px 13px",marginBottom:8}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                <div style={{fontWeight:700,fontSize:13,color:"#fff"}}>{h.name}</div>
                <div style={{display:"flex",gap:1}}>{[1,2,3,4,5].map(s=><span key={s} style={{fontSize:11,color:s<=h.score?"#fbbf24":"rgba(255,255,255,0.12)"}}>★</span>)}</div>
              </div>
              <Pill color="#7dd3fc">🚶 {h.distance}</Pill>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.6)",lineHeight:1.5,marginTop:6}}>{h.notes}</div>
            </div>
          ))}
          <div style={{fontSize:10,color:"rgba(255,255,255,0.25)",lineHeight:1.5,marginTop:4}}>Always call ahead to confirm accessibility needs. Accessible rooms require advance booking.</div>
        </div>
      )}

      {tab==="toilets"&&(
        <div style={{display:"flex",flexDirection:"column",gap:10}}>
          {TOILETS[station.id] ? (
            <div style={{background:"rgba(6,182,212,0.06)",border:"1px solid rgba(6,182,212,0.2)",borderRadius:10,padding:"14px"}}>
              <div style={{fontWeight:700,fontSize:12,color:"#06b6d4",marginBottom:6}}>🚻 Accessible Restroom</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.8)",marginBottom:4}}>{TOILETS[station.id].location}</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.45)"}}>{TOILETS[station.id].note}</div>
              {TOILETS[station.id].baby&&<div style={{fontSize:10,color:"#f9a8d4",marginTop:6}}>Baby changing table available</div>}
            </div>
          ) : (
            <div style={{color:"rgba(255,255,255,0.35)",fontSize:12,padding:"12px 0",textAlign:"center"}}>No restroom data for this station yet.</div>
          )}
          {BABY_CHANGING[station.id] && (
            <div style={{background:"rgba(249,168,212,0.06)",border:"1px solid rgba(249,168,212,0.2)",borderRadius:10,padding:"14px"}}>
              <div style={{fontWeight:700,fontSize:12,color:"#f9a8d4",marginBottom:6}}>👶 Nursing & Baby Changing</div>
              <div style={{fontSize:12,color:"rgba(255,255,255,0.8)",marginBottom:4}}>{BABY_CHANGING[station.id].location}</div>
              <div style={{fontSize:11,color:"rgba(255,255,255,0.45)"}}>{BABY_CHANGING[station.id].note}</div>
            </div>
          )}
          {CHARGING[station.id] && (
            <div style={{background:"rgba(251,191,36,0.06)",border:"1px solid rgba(251,191,36,0.2)",borderRadius:10,padding:"14px"}}>
              <div style={{fontWeight:700,fontSize:12,color:"#fbbf24",marginBottom:6}}>🔋 Charging Station</div>
              {CHARGING[station.id].map((c,i)=>(
                <div key={i} style={{marginBottom:i<CHARGING[station.id].length-1?8:0}}>
                  <div style={{fontSize:12,color:"rgba(255,255,255,0.8)",marginBottom:2}}>{c.location}</div>
                  <div style={{fontSize:11,color:"rgba(255,255,255,0.45)"}}>{c.note}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {tab==="phrases"&&(
        <div>
          <div style={{fontSize:11,color:"rgba(255,255,255,0.4)",marginBottom:9}}>Tap a card to copy the Japanese text to show to staff.</div>
          {PHRASES.map((p,i)=>(
            <div key={i} onClick={()=>{navigator.clipboard?.writeText(p.jp).catch(()=>{});setCopied(i);setTimeout(()=>setCopied(null),1800);}} style={{background:copied===i?"rgba(66,133,244,0.14)":"rgba(255,255,255,0.04)",border:`2px solid ${copied===i?"#3b82f6":"rgba(255,255,255,0.07)"}`,borderRadius:9,padding:"9px 12px",marginBottom:5,cursor:"pointer",position:"relative"}}>
              <div style={{fontSize:15,color:"#fff",fontWeight:700,marginBottom:2}}>{p.jp}</div>
              <div style={{fontSize:9,color:"#06b6d4",fontFamily:"monospace",marginBottom:2}}>{p.ro}</div>
              <div style={{fontSize:9,color:"rgba(255,255,255,0.42)"}}>{p.en}</div>
              <div style={{position:"absolute",top:8,right:9,fontSize:7,color:copied===i?"#3b82f6":"rgba(255,255,255,0.2)"}}>{copied===i?"✓":"Tap"}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}


// ─── AI JOURNEY PLANNER ──────────────────────────────────────────────────────
function JourneyPlanner({profile, onClose, t, lang, onSaveRoute}) {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  const [plan, setPlan] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [saved, setSaved] = useState(false);
  const profileType = PROFILE_TYPES.find(p => p.id === profile?.type);

  // Build a rich context string from all station data for the AI
  const buildStationContext = () => {
    return ALL_STATIONS.map(s => {
      const elevSummary = (s.elevators||[]).slice(0,3).map(e =>
        `${e.location}(${e.floors||"?"}, ${e.doorWidthCm||"?"}cm door, ${e.status||"operational"})`
      ).join("; ");
      const staffInfo = STAFF_LOCATION[s.id] || DEFAULT_STAFF;
      return `STATION: ${s.name} (${s.nameJp}) | City: ${s.cityName} | Lines: ${s.lines.join(", ")} | Elevators: ${s.elevatorCount} [${elevSummary}] | Transfer: ${s.transferDifficulty} | Platform gap: ${s.platformGap} | Wheelchair car: ${s.wheelchairCar} | Staff gate: ${staffInfo.gate} | Transfer note: ${s.transferNote} | Taxi: ${s.taxiInfo}${s.alerts&&s.alerts.length>0?" | ALERT: "+s.alerts.map(a=>a.msg).join("; "):""}`;
    }).join("\n");
  };

  const handlePlan = async () => {
    if(!from.trim() || !to.trim()) return;
    setLoading(true);
    setPlan(null);
    setError(null);

    const langNames={en:"English",ja:"Japanese",es:"Spanish",fr:"French",ko:"Korean"};
    const replyLang=langNames[lang]||"English";
    const profileContext = profileType
      ? `The user is a ${profileType.label} user.${profile?.needs ? " Additional needs: "+profile.needs : ""}`
      : "The user has not specified their accessibility profile.";

    const stationData = buildStationContext();

    const systemPrompt = `Always reply in ${replyLang}. You are Noruka's AI accessibility journey planner for Japan's rail network. You have deep knowledge of station accessibility including exact elevator locations, door widths, platform gaps, wheelchair car positions, staff assistance points, and transfer difficulty.

Your job is to create warm, practical, step-by-step accessible journey plans that give users genuine confidence. You are talking to someone who may have mobility, visual, or other accessibility needs — be thoughtful, specific, and reassuring.

STATION DATABASE:
${stationData}

FORMATTING RULES:
- Use clear numbered steps
- Use emoji sparingly but meaningfully (🛗 for elevator, 🚃 for train, 👨‍💼 for staff, [wheelchair] for accessibility note, ⚠️ for warnings, 💡 for tips)
- Include exact elevator names, door widths where relevant
- Mention which car to board at origin and where it positions you at destination
- Note platform gap and whether a ramp is needed
- Include realistic time estimates accounting for accessibility needs
- End with an encouraging note
- If a station is not in the database, say so honestly and give general advice
- Keep the plan concise but complete — no unnecessary filler`;

    const userMessage = `Plan an accessible journey from ${from} to ${to}.

${profileContext}
${notes ? "Additional context: " + notes : ""}

Please provide a complete step-by-step accessible journey plan.`;

    try {
      const response = await fetch("/api/plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 1000,
          system: systemPrompt,
          messages: [{ role: "user", content: userMessage }]
        })
      });
      const data = await response.json();
      if(data.content && data.content[0]) {
        setPlan(data.content[0].text);
      } else {
        setError("Couldn't generate a plan. Please try again.");
      }
    } catch(e) {
      setError(t.connectionError);
    }
    setLoading(false);
  };

  const handleCopy = () => {
    if(plan) {
      navigator.clipboard?.writeText(plan).catch(()=>{});
      setCopied(true);
      setTimeout(()=>setCopied(false), 2000);
    }
  };
  const handleSave = () => {
    if(!plan) return;
    onSaveRoute({id:Date.now(),from,to,plan,date:new Date().toLocaleDateString()});
    setSaved(true);
    setTimeout(()=>setSaved(false), 2000);
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:500,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(8px)",WebkitBackdropFilter:"blur(8px)"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#0f1424",borderRadius:"22px 22px 0 0",border:"1px solid rgba(255,255,255,0.09)",width:"100%",maxWidth:700,maxHeight:"92vh",overflowY:"auto",paddingBottom:40}}>

        {/* Header */}
        <div style={{padding:"18px 18px 0",display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16}}>
          <div>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:18,fontWeight:700,color:"#fff",letterSpacing:"-0.3px",marginBottom:4}}>{t.journeyTitle}</div>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.4)",lineHeight:1.5,marginBottom:6}}>{t.journeyDesc}</div>
            <div style={{display:"flex",alignItems:"center",gap:7}}>
              <div style={{width:28,height:28,background:"#0d0d1a",border:"1.5px solid rgba(59,130,246,0.5)",borderRadius:8,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"0 0 10px rgba(59,130,246,0.3)"}}>
                <svg width="18" height="18" viewBox="0 0 84 84" fill="none">
                  <line x1="22" y1="64" x2="22" y2="24" stroke="#3b82f6" strokeWidth="10" strokeLinecap="round"/>
                  <path d="M22 36 Q22 16 42 16 Q62 16 62 36 L62 64" stroke="#8b5cf6" strokeWidth="10" strokeLinecap="round" fill="none"/>
                  <circle cx="22" cy="24" r="9" fill="#3b82f6"/>
                  <circle cx="22" cy="64" r="9" fill="#1d4ed8"/>
                  <circle cx="42" cy="16" r="7" fill="#8b5cf6"/>
                  <circle cx="62" cy="64" r="9" fill="#06b6d4"/>
                </svg>
              </div>
              <span style={{fontSize:12,fontWeight:700,color:"rgba(255,255,255,0.4)",letterSpacing:"1.5px",textTransform:"uppercase"}}>noruka</span>
            </div>
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.07)",border:"none",borderRadius:8,color:"rgba(255,255,255,0.5)",width:30,height:30,cursor:"pointer",fontSize:14,flexShrink:0}}>✕</button>
        </div>

        {/* Profile banner */}
        {profileType && (
          <div style={{margin:"0 18px 14px",padding:"8px 12px",background:"rgba(59,130,246,0.08)",border:"1px solid rgba(59,130,246,0.2)",borderRadius:10,fontSize:11,color:"#7dd3fc",display:"flex",alignItems:"center",gap:7}}>
            <span style={{fontSize:16}}>{profileType.icon}</span>
            <span>Planning for <strong>{profileType.label}</strong>{profile?.needs?` · ${profile.needs}`:""}</span>
          </div>
        )}

        {/* Form */}
        <div style={{padding:"0 18px"}}>
          <div style={{marginBottom:11}}>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:6,fontFamily:"'Space Grotesk',sans-serif",fontWeight:600}}>From</div>
            <input
              value={from}
              onChange={e=>setFrom(e.target.value)}
              placeholder="e.g. Tokyo Station, Shinjuku, Haneda Airport…"
              style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,padding:"11px 14px",fontSize:13,color:"#fff",outline:"none",fontFamily:"inherit",boxSizing:"border-box",transition:"border-color 0.15s"}}
              onFocus={e=>e.target.style.borderColor="#3b82f6"}
              onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}
            />
          </div>

          <div style={{marginBottom:11}}>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:6,fontFamily:"'Space Grotesk',sans-serif",fontWeight:600}}>To</div>
            <input
              value={to}
              onChange={e=>setTo(e.target.value)}
              placeholder="e.g. Asakusa, Shibuya, Kyoto Station…"
              style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,padding:"11px 14px",fontSize:13,color:"#fff",outline:"none",fontFamily:"inherit",boxSizing:"border-box",transition:"border-color 0.15s"}}
              onFocus={e=>e.target.style.borderColor="#3b82f6"}
              onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}
            />
          </div>

          <div style={{marginBottom:16}}>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.35)",letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:6,fontFamily:"'Space Grotesk',sans-serif",fontWeight:600}}>Anything else? <span style={{textTransform:"none",letterSpacing:0,color:"rgba(255,255,255,0.2)"}}>(optional)</span></div>
            <textarea
              value={notes}
              onChange={e=>setNotes(e.target.value)}
              placeholder="e.g. I have a large power wheelchair, travelling with a carer, arriving at 9am rush hour, need to catch Shinkansen…"
              style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,padding:"11px 14px",fontSize:12,color:"#fff",outline:"none",fontFamily:"inherit",resize:"vertical",minHeight:70,boxSizing:"border-box",lineHeight:1.5,transition:"border-color 0.15s"}}
              onFocus={e=>e.target.style.borderColor="#3b82f6"}
              onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}
            />
          </div>

          <button
            onClick={handlePlan}
            disabled={loading || !from.trim() || !to.trim()}
            style={{width:"100%",padding:"13px",borderRadius:12,border:"none",background:loading||!from.trim()||!to.trim()?"rgba(255,255,255,0.08)":"linear-gradient(135deg,#3b82f6,#06b6d4)",color:loading||!from.trim()||!to.trim()?"rgba(255,255,255,0.3)":"#fff",fontWeight:700,cursor:loading||!from.trim()||!to.trim()?"not-allowed":"pointer",fontSize:14,fontFamily:"'Space Grotesk',sans-serif",letterSpacing:"-0.2px",transition:"all 0.2s",marginBottom:16}}
          >
            {loading ? t.planning : t.planJourneyBtn}
          </button>

          {/* Loading animation */}
          {loading && (
            <div style={{textAlign:"center",padding:"24px 0",color:"rgba(255,255,255,0.4)"}}>
              <div style={{fontSize:28,marginBottom:10,animation:"spin 2s linear infinite",display:"inline-block"}}>⏳</div>
              <div style={{fontSize:12,lineHeight:1.6}}>Checking elevator widths, platform gaps,<br/>transfer routes and accessibility details…</div>
              <style>{`@keyframes spin{from{transform:rotate(0deg);}to{transform:rotate(360deg);}}`}</style>
            </div>
          )}

          {/* Error state */}
          {error && (
            <div style={{background:"rgba(239,68,68,0.08)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:10,padding:"11px 13px",fontSize:12,color:"#f87171",marginBottom:12}}>
              ⚠️ {error}
            </div>
          )}

          {/* Journey plan result */}
          {plan && (
            <div style={{marginTop:4}}>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
                <div style={{fontSize:11,fontWeight:700,color:"#7dd3fc",fontFamily:"'Space Grotesk',sans-serif",letterSpacing:"1px",textTransform:"uppercase"}}>{t.yourRoute}</div>
                <div style={{display:"flex",gap:5}}>
                  <button onClick={handleCopy} style={{background:copied?"rgba(52,211,153,0.12)":"rgba(255,255,255,0.06)",border:`1px solid ${copied?"rgba(52,211,153,0.3)":"rgba(255,255,255,0.1)"}`,borderRadius:8,color:copied?"#34d399":"rgba(255,255,255,0.5)",padding:"4px 10px",fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>
                    {copied?"Copied":"Copy"}
                  </button>
                  <button onClick={handleSave} style={{background:saved?"rgba(52,211,153,0.12)":"rgba(59,130,246,0.1)",border:`1px solid ${saved?"rgba(52,211,153,0.3)":"rgba(59,130,246,0.3)"}`,borderRadius:8,color:saved?"#34d399":"#7dd3fc",padding:"4px 10px",fontSize:10,cursor:"pointer",fontFamily:"inherit"}}>
                    {saved?"Saved":"Save Route"}
                  </button>
                </div>
              </div>
              <div style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:14,padding:"14px 15px",fontSize:13,color:"rgba(255,255,255,0.85)",lineHeight:1.8,whiteSpace:"pre-wrap",fontFamily:"inherit"}}>
                {plan}
              </div>
              <div style={{marginTop:10,fontSize:10,color:"rgba(255,255,255,0.2)",textAlign:"center",lineHeight:1.5}}>
                Always confirm elevator status with station staff on arrival · Call ahead: JR East English 050-2016-1603
              </div>
              <button
                onClick={()=>{setPlan(null);setFrom("");setTo("");setNotes("");}}
                style={{width:"100%",marginTop:12,padding:"10px",borderRadius:10,border:"1px solid rgba(255,255,255,0.09)",background:"rgba(255,255,255,0.04)",color:"rgba(255,255,255,0.5)",fontSize:12,cursor:"pointer",fontFamily:"inherit"}}
              >
                {t.planAnother}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App(){
  const [page,setPage]=useState("home"); // home | city | station
  const [activeCityKey,setActiveCityKey]=useState(null);
  const [activeStation,setActiveStation]=useState(null);
  const [globalQuery,setGlobalQuery]=useState("");
  const [filterScore,setFilterScore]=useState(0);
  const [filterDiff,setFilterDiff]=useState("all");
  const [sortBy,setSortBy]=useState("name");
  const [lineTab,setLineTab]=useState("all");
  const [viewMode,setViewMode]=useState("grid");
  const [favorites,setFavorites]=useState([]);
  const [savedRoutes,setSavedRoutes]=useState(()=>{try{return JSON.parse(localStorage.getItem("noruka-routes")||"[]");}catch{return[];}});
  const saveRoute = route => {
    const updated = [route,...savedRoutes].slice(0,10);
    setSavedRoutes(updated);
    try{localStorage.setItem("noruka-routes",JSON.stringify(updated));}catch{}
  };
  const deleteRoute = id => {
    const updated = savedRoutes.filter(r=>r.id!==id);
    setSavedRoutes(updated);
    try{localStorage.setItem("noruka-routes",JSON.stringify(updated));}catch{}
  };
  const [showFavOnly,setShowFavOnly]=useState(false);
  const [showPhrases,setShowPhrases]=useState(false);
  const [showJourney,setShowJourney]=useState(false);
  const [showEmergency,setShowEmergency]=useState(false);
  const [showProfile,setShowProfile]=useState(false);
  const [profile,setProfile]=useState(null);
  const [lang,setLang]=useState("en");
  const [showLangMenu,setShowLangMenu]=useState(false);
  const t = T[lang] || T.en;
  const [globalSearch,setGlobalSearch]=useState("");
  const [showGlobalResults,setShowGlobalResults]=useState(false);

  const {weather, lastUpdated} = useWeather();
  const profileType=PROFILE_TYPES.find(p=>p.id===profile?.type);
  const toggleFav=id=>setFavorites(f=>f.includes(id)?f.filter(x=>x!==id):[...f,id]);
  const isFav=id=>favorites.includes(id);

  const goCity=ck=>{setActiveCityKey(ck);setPage("city");setGlobalQuery("");setLineTab("all");setFilterScore(0);setFilterDiff("all");setSortBy("name");};
  const goStation=(s,ck)=>{setActiveStation(s);setActiveCityKey(ck||activeCityKey);setPage("station");};
  // City-level filtered stations
  const cityStations=useMemo(()=>{
    if(!activeCityKey)return[];
    let s=[...CITIES[activeCityKey].stations];
    if(globalQuery){const q=globalQuery.toLowerCase();s=s.filter(x=>x.name.toLowerCase().includes(q)||x.nameJp.includes(q)||x.lines.some(l=>l.toLowerCase().includes(q)));}
    if(filterScore>0)s=s.filter(x=>x.accessScore>=filterScore);
    if(filterDiff!=="all")s=s.filter(x=>x.transferDifficulty===filterDiff);
    if(showFavOnly)s=s.filter(x=>favorites.includes(x.id));
    if(activeCityKey==="tokyo"){
      if(lineTab==="yamanote")s=s.filter(x=>x.lines.includes("Yamanote"));
      else if(lineTab==="metro")s=s.filter(x=>x.lines.some(l=>["Ginza","Marunouchi","Hibiya","Tozai","Chiyoda","Yurakucho","Hanzomon","Namboku","Fukutoshin"].includes(l)));
      else if(lineTab==="toei")s=s.filter(x=>x.lines.some(l=>["Asakusa","Mita","Shinjuku Line","Oedo"].includes(l)));
    }
    if(sortBy==="score")s=[...s].sort((a,b)=>b.accessScore-a.accessScore);
    else if(sortBy==="difficulty"){const d={easy:0,moderate:1,hard:2};s=[...s].sort((a,b)=>d[a.transferDifficulty]-d[b.transferDifficulty]);}
    else s=[...s].sort((a,b)=>a.name.localeCompare(b.name));
    return s;
  },[activeCityKey,globalQuery,filterScore,filterDiff,showFavOnly,lineTab,sortBy,favorites]);

  // Global search across all cities
  const globalResults=useMemo(()=>{
    if(!globalSearch||globalSearch.length<2)return[];
    const q=globalSearch.toLowerCase();
    return ALL_STATIONS.filter(s=>s.name.toLowerCase().includes(q)||s.nameJp.includes(q)||s.lines.some(l=>l.toLowerCase().includes(q))).slice(0,12);
  },[globalSearch]);

  const activeCity=activeCityKey?CITIES[activeCityKey]:null;

  return(
    <div style={{minHeight:"100vh",background:"#080b14",fontFamily:"'Inter',system-ui,sans-serif",color:"#e2e8f7"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Space+Grotesk:wght@500;600;700&display=swap');
        *{box-sizing:border-box;margin:0;padding:0;}
        input,textarea,select{color:#fff;}
        input::placeholder,textarea::placeholder{color:rgba(255,255,255,0.22);}
        .scrollbar-hide{scrollbar-width:none;}
        .scrollbar-hide::-webkit-scrollbar{display:none;}
        .scard{background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);border-radius:16px;padding:14px 15px;cursor:pointer;transition:all 0.2s;}
        .scard:hover{border-color:rgba(99,179,237,0.5);background:rgba(99,179,237,0.06);transform:translateY(-1px);}
        .sgrid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:10px;}
        .slist{display:flex;flex-direction:column;gap:7px;}
        @media(max-width:500px){.sgrid{grid-template-columns:1fr;}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(10px);}to{opacity:1;transform:translateY(0);}}
        .fade-up{animation:fadeUp 0.4s ease forwards;}
        select option{background:#111827;color:#fff;}
      `}</style>

      {showPhrases&&<PhraseModal onClose={()=>setShowPhrases(false)}/>}
      {showJourney&&<JourneyPlanner profile={profile} onClose={()=>setShowJourney(false)} t={t} lang={lang} onSaveRoute={saveRoute}/>}
      {/* Floating Plan Trip button - visible on city and station pages */}
      {page!=="home"&&(
        <button onClick={()=>setShowJourney(true)} style={{position:"fixed",bottom:24,right:16,zIndex:200,display:"flex",alignItems:"center",gap:7,background:"linear-gradient(135deg,#3b82f6,#06b6d4)",border:"none",borderRadius:50,padding:"12px 18px",fontSize:13,color:"#fff",cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,boxShadow:"0 4px 20px rgba(59,130,246,0.45)",transition:"all 0.2s"}} onMouseEnter={e=>e.currentTarget.style.transform="scale(1.05)"} onMouseLeave={e=>e.currentTarget.style.transform="scale(1)"}>
          <span style={{fontSize:16}}>✨</span> Plan Trip
        </button>
      )}

      {showEmergency&&<EmergencyModal profile={profile} onClose={()=>setShowEmergency(false)}/>}
      {showProfile&&<ProfileModal profile={profile} onSave={setProfile} onClose={()=>setShowProfile(false)} savedRoutes={savedRoutes} onDeleteRoute={deleteRoute} onOpenJourney={()=>{setShowProfile(false);setShowJourney(true);}}/>}

      {/* HEADER */}
      <div style={{background:"rgba(8,11,20,0.92)",borderBottom:"1px solid rgba(255,255,255,0.06)",padding:"12px 18px",position:"sticky",top:0,zIndex:300,backdropFilter:"blur(20px)",WebkitBackdropFilter:"blur(20px)"}}>
        <div style={{maxWidth:900,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",gap:10}}>
          <div style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",flexShrink:0}} onClick={()=>{setPage("home");setActiveCityKey(null);}}>
            <div style={{width:42,height:42,background:"#0d0d1a",border:"1.5px solid rgba(59,130,246,0.5)",borderRadius:12,display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0,boxShadow:"0 0 20px rgba(59,130,246,0.4)"}}>
              <svg width="30" height="30" viewBox="0 0 84 84" fill="none">
                <line x1="22" y1="64" x2="22" y2="24" stroke="#3b82f6" strokeWidth="10" strokeLinecap="round"/>
                <path d="M22 36 Q22 16 42 16 Q62 16 62 36 L62 64" stroke="#8b5cf6" strokeWidth="10" strokeLinecap="round" fill="none"/>
                <circle cx="22" cy="24" r="9" fill="#3b82f6"/>
                <circle cx="22" cy="64" r="9" fill="#1d4ed8"/>
                <circle cx="42" cy="16" r="7" fill="#8b5cf6"/>
                <circle cx="62" cy="64" r="9" fill="#06b6d4"/>
              </svg>
            </div>
            <div>
              <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:20,fontWeight:800,color:"#fff",lineHeight:1,letterSpacing:"-0.5px"}}>Noruka</div>
              <div style={{fontSize:9,color:"rgba(255,255,255,0.35)",letterSpacing:"2px",textTransform:"uppercase",marginTop:3}}>Japan Rail Access</div>
            </div>
          </div>

          {/* City breadcrumb */}
          {page!=="home"&&(
            <div className="scrollbar-hide" style={{display:"flex",alignItems:"center",gap:4,flex:1,overflowX:"auto",minWidth:0,padding:"0 4px"}}>
              {CITY_KEYS.map(ck=>(
                <button key={ck} onClick={()=>goCity(ck)} style={{padding:"4px 10px",borderRadius:20,border:`1px solid ${activeCityKey===ck?"rgba(66,133,244,0.5)":"rgba(255,255,255,0.1)"}`,background:activeCityKey===ck?"rgba(66,133,244,0.2)":"rgba(255,255,255,0.04)",color:activeCityKey===ck?"#fff":"rgba(255,255,255,0.45)",fontSize:11,cursor:"pointer",fontFamily:"inherit",whiteSpace:"nowrap",flexShrink:0}}>{CITIES[ck].emoji} {CITIES[ck].name}</button>
              ))}
            </div>
          )}

          <div style={{display:"flex",gap:5,flexShrink:0,alignItems:"center"}}>
            <select value={lang} onChange={e=>setLang(e.target.value)} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:9,color:"rgba(255,255,255,0.7)",padding:"6px 8px",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}><option value="en">EN</option><option value="ja">JA</option><option value="es">ES</option><option value="fr">FR</option><option value="ko">KO</option></select>
            <button onClick={()=>setShowProfile(true)} style={{background:profile?"rgba(251,191,36,0.1)":"rgba(255,255,255,0.05)",border:`1px solid ${profile?"rgba(251,191,36,0.25)":"rgba(255,255,255,0.09)"}`,borderRadius:9,color:profile?"#fbbf24":"rgba(255,255,255,0.5)",padding:"6px 10px",cursor:"pointer",fontSize:13,fontFamily:"inherit",transition:"all 0.15s"}}>{profile?profileType?.icon||"👤":"👤"}</button>
            <button onClick={()=>setShowEmergency(true)} style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.22)",borderRadius:9,color:"#f87171",padding:"6px 10px",cursor:"pointer",fontSize:13,transition:"all 0.15s"}}>🆘</button></div>
        </div>
      </div>

      <div style={{maxWidth:900,margin:"0 auto",padding:"22px 16px 80px"}}>

        {/* ══ HOME PAGE ══ */}
        {page==="home"&&(
          <>
            <div style={{textAlign:"center",marginBottom:28,paddingTop:8}}>
              <div style={{display:"inline-flex",alignItems:"center",gap:8,background:"rgba(59,130,246,0.1)",border:"1px solid rgba(59,130,246,0.2)",borderRadius:20,padding:"4px 14px",fontSize:11,color:"#93c5fd",letterSpacing:"1px",textTransform:"uppercase",marginBottom:16}}>Japan Rail · Accessible Travel Guide</div>
              <div style={{fontSize:"clamp(26px,5vw,40px)",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,color:"#fff",marginBottom:8,lineHeight:1.1,letterSpacing:"-0.5px"}}>{t.hero1}<br/><span style={{background:"linear-gradient(90deg,#3b82f6,#06b6d4)",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent"}}>{t.hero2}</span></div>
              <div style={{color:"rgba(255,255,255,0.38)",fontSize:13,marginBottom:18,lineHeight:1.6}}>{t.heroSub}</div>
              <button onClick={()=>setShowJourney(true)} style={{display:"inline-flex",alignItems:"center",gap:8,background:"linear-gradient(135deg,#3b82f6,#06b6d4)",border:"none",borderRadius:14,padding:"13px 24px",fontSize:15,color:"#fff",cursor:"pointer",fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,letterSpacing:"-0.2px",boxShadow:"0 4px 24px rgba(59,130,246,0.35)",marginBottom:8,transition:"all 0.2s"}} onMouseEnter={e=>e.currentTarget.style.transform="translateY(-2px)"} onMouseLeave={e=>e.currentTarget.style.transform="translateY(0)"}>
                {t.planBtn}
              </button>
              {profile&&(
                <div style={{display:"inline-flex",alignItems:"center",gap:6,background:"rgba(66,133,244,0.1)",border:"1px solid rgba(66,133,244,0.2)",borderRadius:20,padding:"5px 14px",fontSize:12,color:"#8bb8f8"}}>{profileType?.icon} {profileType?.label} mode active · <select value={lang} onChange={e=>setLang(e.target.value)} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:9,color:"rgba(255,255,255,0.7)",padding:"6px 8px",cursor:"pointer",fontSize:11,fontFamily:"inherit"}}><option value="en">EN</option><option value="ja">JA</option><option value="es">ES</option><option value="fr">FR</option><option value="ko">KO</option></select>
            <button onClick={()=>setShowProfile(true)} style={{background:"none",border:"none",color:"#3b82f6",cursor:"pointer",fontSize:11,fontFamily:"inherit",padding:0}}>{t.editProfile}</button></div>
              )}
            </div>

            {/* Global search */}
            <div style={{position:"relative",marginBottom:22}}>
              <span style={{position:"absolute",left:13,top:"50%",transform:"translateY(-50%)",fontSize:14,pointerEvents:"none"}}>🔍</span>
              <input value={globalSearch} onChange={e=>{setGlobalSearch(e.target.value);setShowGlobalResults(true);}} onFocus={()=>setShowGlobalResults(true)} placeholder={t.searchPlaceholder} style={{width:"100%",background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:14,padding:"13px 40px",fontSize:13,color:"#fff",outline:"none",fontFamily:"inherit"}} onFocus={e=>{e.target.style.borderColor="#3b82f6";setShowGlobalResults(true);}} onBlur={e=>{e.target.style.borderColor="rgba(255,255,255,0.12)";setTimeout(()=>setShowGlobalResults(false),200);}}/>
              {globalSearch&&showGlobalResults&&globalResults.length>0&&(
                <div style={{position:"absolute",top:"calc(100% + 6px)",left:0,right:0,background:"#1a2540",border:"1px solid rgba(255,255,255,0.1)",borderRadius:11,overflow:"hidden",zIndex:400,boxShadow:"0 16px 48px rgba(0,0,0,0.5)"}}>
                  {globalResults.map(s=>(
                    <div key={`${s.cityKey}-${s.id}`} onClick={()=>goStation(s,s.cityKey)} style={{padding:"10px 14px",cursor:"pointer",display:"flex",alignItems:"center",gap:10,borderBottom:"1px solid rgba(255,255,255,0.04)"}} onMouseEnter={e=>e.currentTarget.style.background="rgba(66,133,244,0.12)"} onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
                      <span style={{fontSize:16}}>{CITIES[s.cityKey].emoji}</span>
                      <div style={{flex:1,minWidth:0}}>
                        <div style={{fontWeight:600,fontSize:13,color:"#fff"}}>{s.name} <span style={{color:"rgba(255,255,255,0.35)",fontSize:11}}>{s.nameJp}</span></div>
                        <div style={{fontSize:10,color:"rgba(255,255,255,0.4)"}}>{CITIES[s.cityKey].name} · {s.lines.slice(0,2).join(", ")}{s.lines.length>2?` +${s.lines.length-2}`:""}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* City cards */}
            <div style={{fontSize:9,letterSpacing:"2px",textTransform:"uppercase",color:"rgba(255,255,255,0.35)",fontFamily:"'Space Grotesk',sans-serif",fontWeight:600,marginBottom:11}}>{t.selectCity}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(170px,1fr))",gap:10,marginBottom:24}}>
              {CITY_KEYS.map(ck=>{
                const city=CITIES[ck];const w=weather[ck]||WEATHER_FALLBACK[ck];
                const excellentCount=city.stations.filter(s=>s.accessScore>=4).length;
                return(
                  <button key={ck} onClick={()=>goCity(ck)} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.08)",borderRadius:18,padding:"18px 16px",cursor:"pointer",textAlign:"left",fontFamily:"inherit",transition:"all 0.2s",position:"relative",overflow:"hidden"}} onMouseEnter={e=>{e.currentTarget.style.borderColor="rgba(59,130,246,0.45)";e.currentTarget.style.background="rgba(59,130,246,0.07)";e.currentTarget.style.transform="translateY(-2px)";}} onMouseLeave={e=>{e.currentTarget.style.borderColor="rgba(255,255,255,0.08)";e.currentTarget.style.background="rgba(255,255,255,0.03)";e.currentTarget.style.transform="translateY(0)";}}>
                    <div style={{fontSize:32,marginBottom:10}}>{city.emoji}</div>
                    <div style={{fontFamily:"'Space Grotesk',sans-serif",fontWeight:700,fontSize:16,color:"#fff",marginBottom:2,letterSpacing:"-0.2px"}}>{city.name}</div>
                    <div style={{fontSize:12,color:"rgba(255,255,255,0.28)",marginBottom:10}}>{city.nameJp}</div>
                    <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",marginBottom:7,lineHeight:1.5}}>{city.desc}</div>
                    <div style={{display:"flex",gap:5,flexWrap:"wrap",marginBottom:6}}>
                      <span style={{fontSize:9,padding:"1px 7px",borderRadius:20,background:"rgba(52,211,153,0.12)",border:"1px solid rgba(52,211,153,0.25)",color:"#34d399"}}>★★★★+ {excellentCount}</span>
                      {w.warn&&<span style={{fontSize:9,padding:"1px 7px",borderRadius:20,background:"rgba(245,158,11,0.12)",border:"1px solid rgba(245,158,11,0.3)",color:"#fbbf24"}}>{w.icon} {w.warn}</span>}
                    </div>
                    <div style={{fontSize:10,color:"rgba(255,255,255,0.35)"}}>{w.icon} {w.temp} · {w.label}</div>
                  </button>
                );
              })}
            </div>

            {/* Favorites */}
            {favorites.length>0&&(
              <>
                <div style={{fontSize:9,letterSpacing:"2px",textTransform:"uppercase",color:"rgba(255,255,255,0.35)",fontFamily:"'Space Grotesk',sans-serif",fontWeight:600,marginBottom:10}}>{t.savedStations}</div>
                <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))",gap:8,marginBottom:22}}>
                  {favorites.map(fid=>{
                    const s=ALL_STATIONS.find(x=>x.id===fid);if(!s)return null;
                    return(
                      <div key={fid} className="scard" onClick={()=>goStation(s,s.cityKey)}>
                        <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:3}}>
                          <div><span style={{fontWeight:700,fontSize:12,color:"#fff"}}>{s.name}</span><span style={{fontSize:10,color:"rgba(255,255,255,0.3)",marginLeft:6}}>{CITIES[s.cityKey].emoji}</span></div>
                          <button onClick={e=>{e.stopPropagation();toggleFav(s.id);}} style={{background:"none",border:"none",color:"#fbbf24",fontSize:13,cursor:"pointer"}}>★</button>
                        </div>
                        <div style={{fontSize:10,color:"rgba(255,255,255,0.25)",marginBottom:5}}>{s.nameJp}</div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}

            {/* Feature grid */}
            <div style={{fontSize:9,letterSpacing:"2px",textTransform:"uppercase",color:"rgba(255,255,255,0.35)",fontFamily:"'Space Grotesk',sans-serif",fontWeight:600,marginBottom:10}}>{t.whatsIncluded}</div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(130px,1fr))",gap:7}}>
              {[["🛗",t.featureElevator,t.featureElevatorDesc],["🚃",t.featureWheelchair,t.featureWheelchairDesc],["📏",t.featurePlatform,t.featurePlatformDesc],["📊",t.featureCrowding,t.featureCrowdingDesc],["🌧",t.featureWeather,t.featureWeatherDesc],["🪑",t.featureRest,t.featureRestDesc],["🚕",t.featureTaxi,t.featureTaxiDesc],["🏥",t.featureMedical,t.featureMedicalDesc],["🏨",t.featureHotels,t.featureHotelsDesc],["🆘",t.featureEmergency,t.featureEmergencyDesc],["🗣️",t.featurePhrases,t.featurePhrasesDesc],["👤",t.featureProfile,t.featureProfileDesc],["🚻",t.featureToilet,t.featureToiletDesc],["🔋",t.featureCharging,t.featureChargingDesc],["👨‍💼",t.featureStaff,t.featureStaffDesc]].map(([icon,label,desc])=>(
                <div key={label} style={{background:"rgba(255,255,255,0.03)",border:"1px solid rgba(255,255,255,0.07)",borderRadius:12,padding:"12px 11px",transition:"all 0.2s"}}>
                  <div style={{fontSize:18,marginBottom:4}}>{icon}</div>
                  <div style={{fontSize:11,fontWeight:700,color:"#fff",marginBottom:2}}>{label}</div>
                  <div style={{fontSize:9,color:"rgba(255,255,255,0.35)"}}>{desc}</div>
                </div>
              ))}
            </div>
          </>
        )}

        {/* ══ CITY PAGE ══ */}
        {page==="city"&&activeCity&&(
          <>
            <button onClick={()=>setPage("home")} style={{display:"flex",alignItems:"center",gap:6,background:"rgba(255,255,255,0.04)",border:"1px solid rgba(255,255,255,0.09)",borderRadius:10,color:"rgba(255,255,255,0.55)",padding:"7px 14px",cursor:"pointer",fontSize:12,fontFamily:"inherit",marginBottom:14}}>{t.backToJapan}</button>

            {/* City header */}
            <div style={{display:"flex",alignItems:"center",gap:12,marginBottom:14}}>
              <div style={{fontSize:36}}>{activeCity.emoji}</div>
              <div>
                <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:22,fontWeight:700,color:"#fff",letterSpacing:"-0.3px"}}>{activeCity.name}</div>
                <div style={{fontSize:15,color:"rgba(255,255,255,0.3)"}}>{activeCity.nameJp} · {activeCity.stations.length} stations</div>
              </div>
              {activeCity.weather&&(
                <div style={{marginLeft:"auto",display:"flex",alignItems:"center",gap:6,padding:"7px 12px",borderRadius:10,background:activeCity.weather.warn?"rgba(245,158,11,0.1)":"rgba(52,211,153,0.07)",border:`1px solid ${activeCity.weather.warn?"rgba(245,158,11,0.28)":"rgba(52,211,153,0.18)"}`,color:activeCity.weather.warn?"#fde68a":"#6ee7b7",fontSize:11}}>
                  <span style={{fontSize:18}}>{activeCity.weather.icon}</span>
                  <div><div style={{fontWeight:700}}>{activeCity.weather.temp}</div><div style={{fontSize:9}}>{activeCity.weather.note}</div></div>
                </div>
              )}
            </div>

            {/* Search */}
            <div style={{position:"relative",marginBottom:11}}>
              <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",fontSize:13,pointerEvents:"none"}}>🔍</span>
              <input value={globalQuery} onChange={e=>setGlobalQuery(e.target.value)} placeholder={`Search ${activeCity.name} stations…`} style={{width:"100%",background:"rgba(255,255,255,0.06)",border:"2px solid rgba(255,255,255,0.11)",borderRadius:11,padding:"10px 36px",fontSize:13,color:"#fff",outline:"none",fontFamily:"inherit"}} onFocus={e=>e.target.style.borderColor="#3b82f6"} onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.11)"}/>
            </div>

            {/* Tokyo-only line tabs */}
            {activeCityKey==="tokyo"&&(
              <div className="scrollbar-hide" style={{display:"flex",gap:0,borderBottom:"2px solid rgba(255,255,255,0.07)",marginBottom:11,overflowX:"auto"}}>
                {[["all","All Lines"],["yamanote","🟢 Yamanote"],["metro","🔵 Metro"],["toei","🟡 Toei"]].map(([v,l])=>(
                  <button key={v} onClick={()=>setLineTab(v)} style={{padding:"6px 13px",fontSize:11,fontWeight:700,fontFamily:"inherit",cursor:"pointer",background:"none",border:"none",borderBottom:`2px solid ${lineTab===v?"#3b82f6":"transparent"}`,marginBottom:-2,color:lineTab===v?"#3b82f6":"rgba(255,255,255,0.38)",whiteSpace:"nowrap"}}>{l}</button>
                ))}
              </div>
            )}

            {/* Filter bar */}
            <div style={{display:"flex",gap:7,flexWrap:"wrap",alignItems:"center",marginBottom:11}}>
              <select value={filterScore} onChange={e=>setFilterScore(Number(e.target.value))} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"6px 10px",color:"rgba(255,255,255,0.75)",fontSize:11,fontFamily:"inherit",cursor:"pointer",outline:"none"}}>
                <option value={0}>Any access</option>
                <option value={4}>★★★★+ Good</option>
                <option value={5}>★★★★★ Excellent</option>
              </select>
              <select value={filterDiff} onChange={e=>setFilterDiff(e.target.value)} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"6px 10px",color:"rgba(255,255,255,0.75)",fontSize:11,fontFamily:"inherit",cursor:"pointer",outline:"none"}}>
                <option value="all">Any transfer</option>
                <option value="easy">Easy only</option>
                <option value="moderate">Moderate</option>
              </select>
              <select value={sortBy} onChange={e=>setSortBy(e.target.value)} style={{background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:10,padding:"6px 10px",color:"rgba(255,255,255,0.75)",fontSize:11,fontFamily:"inherit",cursor:"pointer",outline:"none"}}>
                <option value="name">A–Z</option>
                <option value="score">Best access</option>
                <option value="difficulty">Easiest transfer</option>
              </select>
              <button onClick={()=>setShowFavOnly(v=>!v)} style={{padding:"5px 11px",borderRadius:9,border:`1px solid ${showFavOnly?"rgba(251,191,36,0.4)":"rgba(255,255,255,0.13)"}`,background:showFavOnly?"rgba(251,191,36,0.12)":"rgba(255,255,255,0.04)",color:showFavOnly?"#fbbf24":"rgba(255,255,255,0.45)",fontSize:11,cursor:"pointer",fontFamily:"inherit"}}>★ Saved</button>
              <button onClick={()=>setViewMode(v=>v==="grid"?"list":"grid")} style={{padding:"5px 9px",borderRadius:9,border:"1px solid rgba(255,255,255,0.13)",background:"rgba(255,255,255,0.04)",color:"rgba(255,255,255,0.45)",fontSize:11,cursor:"pointer",fontFamily:"inherit",marginLeft:"auto"}}>{viewMode==="grid"?"≡":"⊞"}</button>
            </div>

            <div style={{fontSize:10,color:"rgba(255,255,255,0.3)",marginBottom:10}}>Showing {cityStations.length} of {activeCity.stations.length} stations</div>

            {/* Station list/grid */}
            {cityStations.length===0?(
              <div style={{textAlign:"center",padding:"32px",color:"rgba(255,255,255,0.35)"}}>
                <div style={{fontSize:28,marginBottom:8}}>🔍</div>
                <div style={{fontSize:13}}>No stations match.</div>
                <button onClick={()=>{setGlobalQuery("");setFilterScore(0);setFilterDiff("all");setShowFavOnly(false);setLineTab("all");}} style={{marginTop:10,padding:"7px 16px",borderRadius:9,border:"1px solid rgba(255,255,255,0.14)",background:"rgba(255,255,255,0.06)",color:"rgba(255,255,255,0.6)",cursor:"pointer",fontFamily:"inherit",fontSize:12}}>Clear filters</button>
              </div>
            ):(
              <div className={viewMode==="grid"?"sgrid":"slist"}>
                {cityStations.map(s=>(
                  viewMode==="list"?(
                    <div key={s.id} className="scard" onClick={()=>goStation(s)} style={{display:"grid",gridTemplateColumns:"1fr auto",gap:9,alignItems:"center"}}>
                      <div>
                        <div style={{display:"flex",alignItems:"center",gap:7,marginBottom:3}}>
                          <span style={{fontWeight:700,fontSize:13,color:"#fff"}}>{s.name}</span>
                          <span style={{fontSize:11,color:"rgba(255,255,255,0.28)"}}>{s.nameJp}</span>
                                        </div>
                        <div style={{display:"flex",gap:5,alignItems:"center",flexWrap:"wrap"}}>
                          <span style={{fontSize:9,padding:"1px 6px",borderRadius:20,background:"rgba(0,196,204,0.12)",border:"1px solid rgba(0,196,204,0.28)",color:"#06b6d4"}}>🛗 {s.elevatorCount} lifts</span>
                          <span style={{fontSize:9,padding:"1px 6px",borderRadius:20,background:`${DIFF_COLOR[s.transferDifficulty]}18`,border:`1px solid ${DIFF_COLOR[s.transferDifficulty]}40`,color:DIFF_COLOR[s.transferDifficulty]}}>{s.transferDifficulty==="easy"?"Easy transfer":s.transferDifficulty==="moderate"?"Moderate transfer":"Challenging transfer"}</span>
                          {s.staffAssist&&<span style={{fontSize:9,padding:"1px 6px",borderRadius:20,background:"rgba(52,211,153,0.1)",border:"1px solid rgba(52,211,153,0.25)",color:"#34d399"}}>Staff assistance</span>}
                          {TOILETS[s.id]&&<span style={{fontSize:9,padding:"1px 6px",borderRadius:20,background:"rgba(6,182,212,0.1)",border:"1px solid rgba(6,182,212,0.28)",color:"#67e8f9"}}>🚻 Restroom</span>}
                          {BABY_CHANGING[s.id]&&<span style={{fontSize:9,padding:"1px 6px",borderRadius:20,background:"rgba(249,168,212,0.1)",border:"1px solid rgba(249,168,212,0.28)",color:"#f9a8d4"}}>👶 Baby</span>}
                          {CHARGING[s.id]&&<span style={{fontSize:9,padding:"1px 6px",borderRadius:20,background:"rgba(251,191,36,0.1)",border:"1px solid rgba(251,191,36,0.28)",color:"#fbbf24"}}>🔋 Charging Station</span>}
                        </div>
                        {s.alerts?.length>0&&<div style={{marginTop:6,fontSize:10,color:"#fde68a",lineHeight:1.4,display:"flex",gap:5,alignItems:"flex-start"}}><span style={{flexShrink:0}}>⚠</span><span>{s.alerts[0].msg}{s.alerts.length>1?` (+${s.alerts.length-1} more)`:""}</span></div>}
                      </div>
                      <button onClick={e=>{e.stopPropagation();toggleFav(s.id);}} style={{background:"none",border:"none",fontSize:15,cursor:"pointer",color:isFav(s.id)?"#fbbf24":"rgba(255,255,255,0.2)"}}>★</button>
                    </div>
                  ):(
                    <div key={s.id} className="scard" onClick={()=>goStation(s)}>
                      <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:4}}>
                        <div style={{fontWeight:700,fontSize:13,color:"#fff",paddingRight:6,lineHeight:1.3}}>{s.name}</div>
                        <button onClick={e=>{e.stopPropagation();toggleFav(s.id);}} style={{background:"none",border:"none",fontSize:13,cursor:"pointer",color:isFav(s.id)?"#fbbf24":"rgba(255,255,255,0.2)",flexShrink:0}}>★</button>
                      </div>
                      <div style={{fontSize:11,color:"rgba(255,255,255,0.25)",marginBottom:5}}>{s.nameJp}</div>
                      <div style={{display:"flex",gap:5,flexWrap:"wrap",alignItems:"center",marginTop:8}}>
                        <span style={{fontSize:9,padding:"2px 7px",borderRadius:20,background:"rgba(0,196,204,0.12)",border:"1px solid rgba(0,196,204,0.28)",color:"#06b6d4"}}>🛗 {s.elevatorCount} lifts</span>
                        <span style={{fontSize:9,padding:"2px 7px",borderRadius:20,background:`${DIFF_COLOR[s.transferDifficulty]}18`,border:`1px solid ${DIFF_COLOR[s.transferDifficulty]}40`,color:DIFF_COLOR[s.transferDifficulty]}}>
                          {s.transferDifficulty==="easy"?"Easy transfer":s.transferDifficulty==="moderate"?"Moderate transfer":"Challenging transfer"}
                        </span>
                        {s.staffAssist&&<span style={{fontSize:9,padding:"2px 7px",borderRadius:20,background:"rgba(52,211,153,0.1)",border:"1px solid rgba(52,211,153,0.25)",color:"#34d399"}}>Staff assistance</span>}
                        {TOILETS[s.id]&&<span style={{fontSize:9,padding:"2px 7px",borderRadius:20,background:"rgba(6,182,212,0.1)",border:"1px solid rgba(6,182,212,0.28)",color:"#67e8f9"}}>🚻 Restroom</span>}
                        {BABY_CHANGING[s.id]&&<span style={{fontSize:9,padding:"2px 7px",borderRadius:20,background:"rgba(249,168,212,0.1)",border:"1px solid rgba(249,168,212,0.28)",color:"#f9a8d4"}}>👶 Baby</span>}
                        {CHARGING[s.id]&&<span style={{fontSize:9,padding:"2px 7px",borderRadius:20,background:"rgba(251,191,36,0.1)",border:"1px solid rgba(251,191,36,0.28)",color:"#fbbf24"}}>🔋 Charging Station</span>}
                      </div>
                      {s.alerts?.length>0&&<div style={{marginTop:7,fontSize:10,color:"#fde68a",lineHeight:1.4,display:"flex",gap:5,alignItems:"flex-start"}}><span style={{flexShrink:0}}>⚠</span><span>{s.alerts[0].msg}{s.alerts.length>1?` (+${s.alerts.length-1} more)`:""}</span></div>}
                    </div>
                  )
                ))}
              </div>
            )}

            <div style={{marginTop:14,fontSize:9,color:"rgba(255,255,255,0.22)",textAlign:"center",lineHeight:1.6}}>
              Live elevator status: JR East English <span style={{color:"#3b82f6"}}>050-2016-1603</span> · Tokyo Metro <span style={{color:"#3b82f6"}}>03-3941-2004</span>
            </div>
          </>
        )}

        {/* ══ STATION PAGE ══ */}
        {page==="station"&&activeStation&&(
          <StationDetail station={activeStation} cityKey={activeCityKey} onBack={()=>setPage("city")} isFav={isFav(activeStation.id)} onToggleFav={toggleFav} profile={profile} weather={weather} lastUpdated={lastUpdated}/>
        )}

      </div>

    </div>
  );
}


