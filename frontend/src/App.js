import logo from './assets/logo.jpg';
import { useState, useEffect, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, PieChart, Pie, Legend } from "recharts";
import { jsPDF } from "jspdf";
import CameraTab from "./CameraTab";

const T = {
  en: {
    title: "Detect Fake Content", subtitle: "Paste a URL or text to analyze",
    btn: "🔍 ANALYZE NOW", loading: "⏳ Analyzing...",
    fake: "FAKE CONTENT DETECTED", real: "GENUINE CONTENT",
    category: "CATEGORY", score: "SCORE",
    copy: "📋 Copy", copied: "✅ Copied!", share: "📤 Share",
    aiTitle: "🤖 AI Analysis", placeholder: "Enter URL or paste suspicious text...",
    detect: "🔍 Detect", whatsapp: "💬 WhatsApp", camera: "📸 Camera",
    history: "📋 History", stats: "📊 Stats", bulk: "📋 Bulk",
    about: "ℹ️ About", settings: "⚙️ Settings", profile: "👤 Profile",
    light: "☀️", dark: "🌙", lang: "🌐 தமிழ்",
    noScans: "No scans yet!", recentScans: "Recent Scans",
    fakeDetected: "Fake", genuine: "Genuine", totalScans: "Total",
    detectionStats: "📊 Detection Statistics",
    waTitle: "WhatsApp Scanner", waSubtitle: "Paste WhatsApp message to check",
    waBtn: "💬 CHECK MESSAGE", waChecking: "⏳ Checking...",
    waPatterns: "Quick test samples:",
    scamEx: "Classic scam pattern — free offers and prize claims are tactics to deceive users.",
    fraudEx: "Fraud indicators found — OTP and account detail requests are red flags.",
    rumorEx: "This appears to be a rumor — unverified claims without credible sources.",
    fakeEx: "Matches fake content patterns. Verify from official sources before sharing.",
    realEx: "Content appears genuine — matches verified official source patterns.",
    login: "Login", signup: "Sign Up", logout: "Logout",
    email: "Email", password: "Password", name: "Full Name",
    loginBtn: "🔐 Login", signupBtn: "✅ Create Account",
    noAccount: "No account? Sign up", hasAccount: "Have account? Login",
    welcome: "Welcome",
    voiceBtn: "🎤 Voice Input", voiceStop: "⏹ Stop",
    voiceListening: "🎤 Listening...",
    pdfBtn: "📄 Download PDF",
    bulkTitle: "Bulk Scanner", bulkSubtitle: "Scan multiple URLs at once",
    bulkPlaceholder: "Enter one URL or text per line...",
    bulkBtn: "🔍 Scan All", bulkScanning: "⏳ Scanning...",
  },
  ta: {
    title: "போலி உள்ளடக்கத்தை கண்டறி", subtitle: "URL அல்லது உரையை பகுப்பாய்வு செய்ய ஒட்டவும்",
    btn: "🔍 இப்போதே பகுப்பாய்வு செய்", loading: "⏳ பகுப்பாய்வு...",
    fake: "போலி உள்ளடக்கம் கண்டறியப்பட்டது", real: "உண்மையான உள்ளடக்கம்",
    category: "வகை", score: "மதிப்பெண்",
    copy: "📋 நகலெடு", copied: "✅ நகலெடுக்கப்பட்டது!", share: "📤 பகிர்",
    aiTitle: "🤖 AI பகுப்பாய்வு", placeholder: "URL அல்லது சந்தேகமான உரையை உள்ளிடுக...",
    detect: "🔍 கண்டறி", whatsapp: "💬 வாட்ஸ்அப்", camera: "📸 கேமரா",
    history: "📋 வரலாறு", stats: "📊 புள்ளிவிவரம்", bulk: "📋 மொத்தம்",
    about: "ℹ️ பற்றி", settings: "⚙️ அமைப்புகள்", profile: "👤 சுயவிவரம்",
    light: "☀️", dark: "🌙", lang: "🌐 English",
    noScans: "இன்னும் ஸ்கான் இல்லை!", recentScans: "சமீபத்திய ஸ்கான்கள்",
    fakeDetected: "போலி", genuine: "உண்மையான", totalScans: "மொத்தம்",
    detectionStats: "📊 கண்டறிதல் புள்ளிவிவரங்கள்",
    waTitle: "வாட்ஸ்அப் ஸ்கேனர்", waSubtitle: "வாட்ஸ்அப் செய்தியை ஒட்டி சரிபார்க்கவும்",
    waBtn: "💬 செய்தியை சரிபார்", waChecking: "⏳ சரிபார்க்கிறது...",
    waPatterns: "விரைவு சோதனை மாதிரிகள்:",
    scamEx: "பொதுவான மோசடி வடிவம் — இலவச சலுகைகள் மற்றும் பரிசு கோரிக்கைகள் ஏமாற்றும் தந்திரங்கள்.",
    fraudEx: "மோசடி அறிகுறிகள் — OTP மற்றும் கணக்கு விவரங்களுக்கான கோரிக்கைகள் ஆபத்தானவை.",
    rumorEx: "இது வதந்தியாக தெரிகிறது — நம்பகமான ஆதாரங்கள் இல்லாத கூற்றுகள்.",
    fakeEx: "போலி உள்ளடக்க வடிவங்களுடன் பொருந்துகிறது. பகிர்வதற்கு முன் சரிபார்க்கவும்.",
    realEx: "உள்ளடக்கம் உண்மையானதாக தெரிகிறது — சரிபார்க்கப்பட்ட ஆதாரங்களுடன் பொருந்துகிறது.",
    login: "உள்நுழைவு", signup: "பதிவு செய்", logout: "வெளியேறு",
    email: "மின்னஞ்சல்", password: "கடவுச்சொல்", name: "பெயர்",
    loginBtn: "🔐 உள்நுழைவு", signupBtn: "✅ கணக்கு உருவாக்கு",
    noAccount: "கணக்கு இல்லையா? பதிவு செய்", hasAccount: "கணக்கு இருக்கா? உள்நுழைவு",
    welcome: "வரவேற்கிறோம்",
    voiceBtn: "🎤 குரல் உள்ளீடு", voiceStop: "⏹ நிறுத்து",
    voiceListening: "🎤 கேட்கிறது...",
    pdfBtn: "📄 PDF பதிவிறக்கம்",
    bulkTitle: "மொத்த ஸ்கேனர்", bulkSubtitle: "பல URL ஒரே நேரத்தில் சரிபார்க்கவும்",
    bulkPlaceholder: "ஒவ்வொரு வரியிலும் ஒரு URL அல்லது உரை...",
    bulkBtn: "🔍 அனைத்தும் சரிபார்", bulkScanning: "⏳ சரிபார்க்கிறது...",
  }
};

function App() {
  const [input, setInput] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const [tab, setTab] = useState("detect");
  const [aiExplain, setAiExplain] = useState("");
  const [darkMode, setDarkMode] = useState(true);
  const [copied, setCopied] = useState(false);
  const [lang, setLang] = useState("en");
  const [user, setUser] = useState(null);
  const [authTab, setAuthTab] = useState("login");
  const [authForm, setAuthForm] = useState({name: "", email: "", password: ""});
  const [authMsg, setAuthMsg] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [notifEnabled, setNotifEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const [bulkInput, setBulkInput] = useState("");
  const [bulkResults, setBulkResults] = useState([]);
  const [bulkLoading, setBulkLoading] = useState(false);

  const API = "https://truthshield-ai-fake-content-detection.onrender.com/api";
  const txt = T[lang];

  const theme = {
    bg: darkMode ? "linear-gradient(135deg, #1a1a2e, #16213e, #0f3460)" : "linear-gradient(135deg, #f0f4f8, #e2e8f0)",
    card: darkMode ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)",
    border: darkMode ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.15)",
    text: darkMode ? "#fff" : "#1a1a2e",
    sub: darkMode ? "#aaa" : "#555",
    header: darkMode ? "rgba(0,0,0,0.4)" : "rgba(255,255,255,0.8)",
    inputBg: darkMode ? "rgba(255,255,255,0.08)" : "#fff",
    inputBorder: darkMode ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
  };

  const playSound = (isFake) => {
    if (!soundEnabled) return;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain); gain.connect(ctx.destination);
      osc.frequency.value = isFake ? 300 : 600;
      osc.type = isFake ? "sawtooth" : "sine";
      gain.gain.setValueAtTime(0.3, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
      osc.start(); osc.stop(ctx.currentTime + 0.8);
    } catch (e) {}
  };

  const startVoice = () => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert("Voice not supported!"); return; }
    const r = new SR();
    r.lang = lang === "ta" ? "ta-IN" : "en-US";
    r.onresult = (e) => { setInput(e.results[0][0].transcript); setIsListening(false); };
    r.onerror = r.onend = () => setIsListening(false);
    recognitionRef.current = r;
    r.start(); setIsListening(true);
  };

  const stopVoice = () => { if (recognitionRef.current) recognitionRef.current.stop(); setIsListening(false); };

  const downloadPDF = () => {
    if (!result) return;
    const doc = new jsPDF();
    doc.setFontSize(20); doc.setTextColor(233, 69, 96);
    doc.text("TruthShield Report", 20, 20);
    doc.setFontSize(12); doc.setTextColor(0,0,0);
    doc.text("Date: " + new Date().toLocaleString(), 20, 35);
    doc.text("User: " + (user?.name || "Unknown"), 20, 45);
    doc.line(20, 50, 190, 50);
    doc.text("Status: " + result.status, 20, 62);
    doc.text("Category: " + result.category, 20, 72);
    doc.text("Score: " + (result.score?.toFixed(1)||0) + "%", 20, 82);
    const lines = doc.splitTextToSize(input||"N/A", 170);
    doc.text("Input:", 20, 96); doc.text(lines, 20, 106);
    if (aiExplain) { const al = doc.splitTextToSize(aiExplain, 170); doc.text("AI:", 20, 130); doc.text(al, 20, 140); }
    doc.setFontSize(9); doc.setTextColor(150);
    doc.text("Generated by TruthShield — Fake Content Detection System", 20, 280);
    doc.save("TruthShield-" + Date.now() + ".pdf");
  };

  const bulkScan = async () => {
    const lines = bulkInput.split("\n").filter(l => l.trim());
    if (!lines.length) return;
    setBulkLoading(true); setBulkResults([]);
    const results = [];
    for (const line of lines) {
      try {
        const isUrl = line.startsWith("http");
        const res = await fetch(API + "/detect", {
          method: "POST",
          headers: {"Content-Type": "application/json", "Authorization": "Bearer " + user?.token},
          body: JSON.stringify({url: isUrl ? line : null, text: isUrl ? null : line, userEmail: user?.email}),
        });
        results.push({input: line, ...await res.json()});
      } catch (e) { results.push({input: line, status: "ERROR", category: "NONE", score: 0}); }
      setBulkResults([...results]);
    }
    setBulkLoading(false);
  };

  const handleAuth = async () => {
    setAuthLoading(true); setAuthMsg("");
    try {
      const res = await fetch(API + (authTab === "login" ? "/auth/login" : "/auth/signup"), {
        method: "POST", headers: {"Content-Type": "application/json"},
        body: JSON.stringify(authForm),
      });
      const data = await res.json();
      if (data.status === "success") setUser({name: data.name, email: data.email, token: data.token});
      else setAuthMsg(data.message);
    } catch (e) { setAuthMsg("Connection error!"); }
    setAuthLoading(false);
  };

  const detect = async () => {
    if (!input.trim()) return;
    setLoading(true); setResult(null); setAiExplain("");
    try {
      const isUrl = input.startsWith("http");
      const res = await fetch(API + "/detect", {
        method: "POST",
        headers: {"Content-Type": "application/json", "Authorization": "Bearer " + user?.token},
        body: JSON.stringify({url: isUrl ? input : null, text: isUrl ? null : input, userEmail: user?.email}),
      });
      const data = await res.json();
      setResult(data); fetchHistory(); playSound(data.status === "FAKE");
      if (data.status === "FAKE") {
        if (data.category === "SCAM") setAiExplain(txt.scamEx);
        else if (data.category === "FRAUD") setAiExplain(txt.fraudEx);
        else if (data.category === "RUMOR") setAiExplain(txt.rumorEx);
        else setAiExplain(txt.fakeEx);
      } else setAiExplain(txt.realEx);
      if (notifEnabled && data.status === "FAKE" && Notification.permission === "granted") {
        new Notification("⚠️ TruthShield Alert!", {body: "FAKE content detected: " + data.category});
      }
    } catch (e) { setResult({status: "ERROR", category: "NONE", score: 0}); }
    setLoading(false);
  };

  const fetchHistory = async () => {
    // History is now a protected, per-user endpoint — skip the call
    // entirely when not logged in (previously fired on every mount
    // regardless of auth state, and would 401 under the new backend).
    if (!user?.token) return;
    try {
      const res = await fetch(API + "/history", {
        headers: {"Authorization": "Bearer " + user.token},
      });
      const data = await res.json();
      if (Array.isArray(data)) setHistory(data.slice(0, 10));
    } catch (e) {}
  };

  const copyResult = () => {
    if (!result) return;
    navigator.clipboard.writeText("TruthShield: " + result.status + " | " + result.category + " | " + (result.score?.toFixed(1)||0) + "%");
    setCopied(true); setTimeout(() => setCopied(false), 2000);
  };

  const shareResult = () => {
    if (!result) return;
    const text = "🛡️ TruthShield: " + (result.status === "FAKE" ? "⚠️ FAKE" : "✅ GENUINE") + " | " + result.category;
    if (navigator.share) navigator.share({title: "TruthShield", text});
    else { navigator.clipboard.writeText(text); alert("Copied!"); }
  };

  useEffect(() => {
    // Re-fetch whenever login state changes, since history is now a
    // protected per-user endpoint (fetchHistory no-ops if not logged in).
    fetchHistory();
    if (Notification.permission === "default") Notification.requestPermission();
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/service-worker.js').catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const fakeCount = history.filter(h => h.status === "FAKE").length;
  const realCount = history.filter(h => h.status !== "FAKE").length;
  const chartData = [{name: "FAKE", count: fakeCount, color: "#e94560"}, {name: "REAL", count: realCount, color: "#00b894"}];
  const pieData = [{name: "Fake", value: fakeCount||1, color: "#e94560"}, {name: "Genuine", value: realCount||1, color: "#00b894"}];
  const btnStyle = (active) => ({padding: "7px 12px", background: active ? "#e94560" : theme.card, color: theme.text, border: "1px solid " + theme.border, borderRadius: 20, cursor: "pointer", fontSize: 11});
  const inputStyle = {width: "100%", padding: 12, fontSize: 14, background: theme.inputBg, border: "1px solid " + theme.inputBorder, borderRadius: 10, color: theme.text, boxSizing: "border-box", marginBottom: 10};

  // LOGIN PAGE
  if (!user) {
    return (
      <div style={{minHeight: "100vh", background: theme.bg, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Arial, sans-serif"}}>
        <div style={{background: theme.card, borderRadius: 20, padding: 32, width: "100%", maxWidth: 400, border: "1px solid " + theme.border, backdropFilter: "blur(10px)"}}>
          <div style={{textAlign: "center", marginBottom: 24}}>
            <img src={logo} alt="TruthShield" style={{width: 80, height: 80, objectFit: "contain", borderRadius: 16, marginBottom: 10}} />
            <div style={{fontSize: 22, fontWeight: "bold", color: "#fff"}}>TRUTH<span style={{color: "#e94560"}}>SHIELD</span></div>
            <div style={{fontSize: 11, color: "#aaa"}}>FAKE CONTENT DETECTION SYSTEM</div>
          </div>
          <div style={{display: "flex", gap: 8, marginBottom: 20}}>
            {["login", "signup"].map(t => (
              <button key={t} onClick={() => setAuthTab(t)}
                style={{flex: 1, padding: 10, background: authTab === t ? "#e94560" : "rgba(255,255,255,0.1)", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: "bold"}}>
                {t === "login" ? txt.login : txt.signup}
              </button>
            ))}
          </div>
          {authTab === "signup" && <input type="text" placeholder={txt.name} value={authForm.name} onChange={(e) => setAuthForm({...authForm, name: e.target.value})} style={{...inputStyle, color: "#fff"}} />}
          <input type="email" placeholder={txt.email} value={authForm.email} onChange={(e) => setAuthForm({...authForm, email: e.target.value})} style={{...inputStyle, color: "#fff"}} />
          <input type="password" placeholder={txt.password} value={authForm.password} onChange={(e) => setAuthForm({...authForm, password: e.target.value})} style={{...inputStyle, color: "#fff"}} />
          {authMsg && <div style={{color: "#e94560", fontSize: 13, marginBottom: 10, textAlign: "center"}}>{authMsg}</div>}
          <button onClick={handleAuth} disabled={authLoading}
            style={{width: "100%", padding: 12, fontSize: 15, fontWeight: "bold", background: authLoading ? "#555" : "#e94560", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer"}}>
            {authLoading ? "⏳..." : authTab === "login" ? txt.loginBtn : txt.signupBtn}
          </button>
          <div style={{textAlign: "center", marginTop: 14}}>
            <button onClick={() => setAuthTab(authTab === "login" ? "signup" : "login")}
              style={{background: "none", border: "none", color: "#aaa", cursor: "pointer", fontSize: 12}}>
              {authTab === "login" ? txt.noAccount : txt.hasAccount}
            </button>
          </div>
          <div style={{textAlign: "center", marginTop: 12}}>
            <button onClick={() => setLang(lang === "en" ? "ta" : "en")}
              style={{padding: "6px 14px", background: "#6c63ff", color: "#fff", border: "none", borderRadius: 20, cursor: "pointer", fontSize: 12}}>
              {txt.lang}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{minHeight: "100vh", background: theme.bg, fontFamily: "Arial, sans-serif", color: theme.text}}>
      
      {/* HEADER */}
      <div style={{background: theme.header, padding: "12px 20px", backdropFilter: "blur(10px)"}}>
        <div style={{display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 8}}>
          <div style={{display: "flex", alignItems: "center", gap: 10}}>
            <img src={logo} alt="TruthShield" style={{width: 40, height: 40, objectFit: "contain", borderRadius: 8}} />
            <div>
              <div style={{fontSize: 18, fontWeight: "bold"}}>TRUTH<span style={{color: "#e94560"}}>SHIELD</span></div>
              <div style={{fontSize: 10, color: theme.sub}}>{txt.welcome}, {user.name}! 👋</div>
            </div>
          </div>
          <div style={{display: "flex", gap: 5, flexWrap: "wrap", alignItems: "center"}}>
            {["detect","whatsapp","camera","bulk","history","stats","about","settings","profile"].map(t => (
              <button key={t} onClick={() => {setTab(t); if(t==="history"||t==="stats") fetchHistory();}} style={btnStyle(tab===t)}>
                {t==="detect"?txt.detect:t==="whatsapp"?txt.whatsapp:t==="camera"?txt.camera:t==="bulk"?txt.bulk:t==="history"?txt.history:t==="stats"?txt.stats:t==="about"?txt.about:t==="settings"?txt.settings:txt.profile}
              </button>
            ))}
            <button onClick={() => setDarkMode(!darkMode)} style={{...btnStyle(false), background: darkMode?"#ffd700":"#333", color: darkMode?"#333":"#fff"}}>
              {darkMode ? txt.light : txt.dark}
            </button>
            <button onClick={() => setLang(lang==="en"?"ta":"en")} style={{...btnStyle(false), background: "#6c63ff", color: "#fff", border: "none"}}>
              {txt.lang}
            </button>
            <button onClick={() => setUser(null)} style={{...btnStyle(false), background: "#e94560", color: "#fff", border: "none"}}>
              {txt.logout}
            </button>
          </div>
        </div>
      </div>

      <div style={{maxWidth: 750, margin: "0 auto", padding: "30px 15px"}}>

        {/* DETECT TAB */}
        {tab === "detect" && (
          <div>
            <div style={{textAlign: "center", marginBottom: 20}}>
              <h2 style={{fontSize: 24, margin: 0}}>{txt.title}</h2>
              <p style={{color: theme.sub, margin: "6px 0 0"}}>{txt.subtitle}</p>
            </div>
            <div style={{background: theme.card, borderRadius: 16, padding: 20, border: "1px solid " + theme.border}}>
              <textarea rows={4} value={input} onChange={(e) => setInput(e.target.value)} placeholder={txt.placeholder}
                style={{width: "100%", padding: 12, fontSize: 14, background: theme.inputBg, border: "1px solid " + theme.inputBorder, borderRadius: 10, color: theme.text, resize: "none", boxSizing: "border-box"}} />
              <div style={{display: "flex", gap: 8, marginBottom: 8}}>
                <button onClick={isListening ? stopVoice : startVoice}
                  style={{flex: 1, padding: 10, background: isListening ? "#ff5722" : "#6c63ff", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontWeight: "bold"}}>
                  {isListening ? txt.voiceListening : txt.voiceBtn}
                </button>
              </div>
              <button onClick={detect} disabled={loading}
                style={{width: "100%", padding: 12, fontSize: 15, fontWeight: "bold", background: loading ? "#555" : "#e94560", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer"}}>
                {loading ? txt.loading : txt.btn}
              </button>
            </div>
            {result && (
              <div style={{marginTop: 16}}>
                <div style={{padding: 20, borderRadius: 16, background: result.status==="FAKE"?"rgba(233,69,96,0.15)":"rgba(0,184,148,0.15)", border: "1px solid "+(result.status==="FAKE"?"#e94560":"#00b894"), textAlign: "center"}}>
                  <div style={{fontSize: 44}}>{result.status==="FAKE"?"⚠️":"✅"}</div>
                  <h2 style={{color: result.status==="FAKE"?"#e94560":"#00b894", margin: "8px 0"}}>
                    {result.status==="FAKE"?txt.fake:txt.real}
                  </h2>
                  <div style={{display: "flex", justifyContent: "center", gap: 12, marginTop: 10}}>
                    <div style={{background: "rgba(255,255,255,0.1)", padding: "8px 16px", borderRadius: 10}}>
                      <div style={{fontSize: 10, color: "#aaa"}}>{txt.category}</div>
                      <div style={{fontSize: 16, fontWeight: "bold"}}>{result.category}</div>
                    </div>
                    <div style={{background: "rgba(255,255,255,0.1)", padding: "8px 16px", borderRadius: 10}}>
                      <div style={{fontSize: 10, color: "#aaa"}}>{txt.score}</div>
                      <div style={{fontSize: 16, fontWeight: "bold"}}>{result.score?.toFixed(1)}%</div>
                    </div>
                  </div>
                  <div style={{display: "flex", gap: 8, justifyContent: "center", marginTop: 12, flexWrap: "wrap"}}>
                    <button onClick={copyResult} style={{padding: "7px 14px", background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 20, cursor: "pointer", fontSize: 12}}>
                      {copied ? txt.copied : txt.copy}
                    </button>
                    <button onClick={shareResult} style={{padding: "7px 14px", background: "rgba(255,255,255,0.15)", color: "#fff", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 20, cursor: "pointer", fontSize: 12}}>
                      {txt.share}
                    </button>
                    <button onClick={downloadPDF} style={{padding: "7px 14px", background: "#00b894", color: "#fff", border: "none", borderRadius: 20, cursor: "pointer", fontSize: 12}}>
                      {txt.pdfBtn}
                    </button>
                  </div>
                </div>
                {aiExplain && (
                  <div style={{marginTop: 10, padding: 14, borderRadius: 12, background: theme.card, border: "1px solid " + theme.border}}>
                    <div style={{fontSize: 12, color: theme.sub, marginBottom: 4}}>{txt.aiTitle}</div>
                    <div style={{fontSize: 13, lineHeight: 1.6}}>{aiExplain}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* WHATSAPP TAB */}
        {tab === "whatsapp" && (
          <div>
            <div style={{textAlign: "center", marginBottom: 20}}>
              <h2>💬 <span style={{color: "#e94560"}}>{txt.waTitle}</span></h2>
              <p style={{color: theme.sub}}>{txt.waSubtitle}</p>
            </div>
            <div style={{background: "rgba(37,211,102,0.1)", borderRadius: 16, padding: 20, border: "1px solid rgba(37,211,102,0.3)"}}>
              <textarea rows={5} value={input} onChange={(e) => setInput(e.target.value)} placeholder={txt.placeholder}
                style={{width: "100%", padding: 12, fontSize: 14, background: theme.inputBg, border: "1px solid rgba(37,211,102,0.3)", borderRadius: 10, color: theme.text, resize: "none", boxSizing: "border-box"}} />
              <button onClick={() => {setTab("detect"); setTimeout(detect, 50);}} disabled={loading}
                style={{width: "100%", marginTop: 10, padding: 12, fontSize: 15, fontWeight: "bold", background: "#25d366", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer"}}>
                {loading ? txt.waChecking : txt.waBtn}
              </button>
            </div>
            <div style={{marginTop: 14, padding: 14, borderRadius: 12, background: theme.card}}>
              <div style={{fontSize: 12, color: theme.sub, marginBottom: 8}}>{txt.waPatterns}</div>
              {["free iphone lottery winner claim now","otp account suspended verify identity","government of india official statement","share this going viral secret cure"].map(s => (
                <div key={s} onClick={() => setInput(s)} style={{padding: "7px 10px", margin: "4px 0", background: theme.card, borderRadius: 8, cursor: "pointer", fontSize: 12, border: "1px solid " + theme.border}}>
                  ▶ {s}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CAMERA TAB */}
        {tab === "camera" && <CameraTab theme={theme} API={API} user={user} txt={txt} />}

        {/* BULK TAB */}
        {tab === "bulk" && (
          <div>
            <div style={{textAlign: "center", marginBottom: 20}}>
              <h2>📋 <span style={{color: "#e94560"}}>{txt.bulkTitle}</span></h2>
              <p style={{color: theme.sub}}>{txt.bulkSubtitle}</p>
            </div>
            <div style={{background: theme.card, borderRadius: 16, padding: 20, border: "1px solid " + theme.border}}>
              <textarea rows={6} value={bulkInput} onChange={(e) => setBulkInput(e.target.value)} placeholder={txt.bulkPlaceholder}
                style={{width: "100%", padding: 12, fontSize: 13, background: theme.inputBg, border: "1px solid " + theme.inputBorder, borderRadius: 10, color: theme.text, resize: "none", boxSizing: "border-box"}} />
              <button onClick={bulkScan} disabled={bulkLoading}
                style={{width: "100%", marginTop: 10, padding: 12, fontSize: 15, fontWeight: "bold", background: bulkLoading?"#555":"#e94560", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer"}}>
                {bulkLoading ? txt.bulkScanning : txt.bulkBtn}
              </button>
            </div>
            {bulkResults.length > 0 && (
              <div style={{marginTop: 16}}>
                {bulkResults.map((r, i) => (
                  <div key={i} style={{padding: "12px 16px", marginBottom: 8, borderRadius: 12, background: r.status==="FAKE"?"rgba(233,69,96,0.15)":"rgba(0,184,148,0.15)", border: "1px solid "+(r.status==="FAKE"?"#e94560":"#00b894"), display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                    <div>
                      <div style={{fontSize: 12, color: theme.sub, marginBottom: 4}}>{r.input.slice(0,50)}...</div>
                      <div style={{fontWeight: "bold", color: r.status==="FAKE"?"#e94560":"#00b894"}}>{r.status==="FAKE"?"⚠️ FAKE":"✅ GENUINE"} — {r.category}</div>
                    </div>
                    <div style={{fontSize: 18, fontWeight: "bold", color: r.status==="FAKE"?"#e94560":"#00b894"}}>{r.score?.toFixed(1)||0}%</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* HISTORY TAB */}
        {tab === "history" && (
          <div>
            <h3>{txt.recentScans} ({history.length})</h3>
            {history.length === 0 ? <p style={{color: theme.sub}}>{txt.noScans}</p> : (
              <div style={{display: "flex", flexDirection: "column", gap: 8, marginTop: 12}}>
                {history.map((h) => (
                  <div key={h.id} style={{background: theme.card, borderRadius: 12, padding: "12px 16px", border: "1px solid "+(h.status==="FAKE"?"rgba(233,69,96,0.3)":"rgba(0,184,148,0.3)"), display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                    <div style={{display: "flex", alignItems: "center", gap: 10}}>
                      <span style={{fontSize: 20}}>{h.status==="FAKE"?"⚠️":"✅"}</span>
                      <div>
                        <div style={{fontWeight: "bold", fontSize: 13, color: h.status==="FAKE"?"#e94560":"#00b894"}}>{h.status}</div>
                        <div style={{fontSize: 11, color: theme.sub}}>{h.category} • {h.score?.toFixed(1)}%</div>
                      </div>
                    </div>
                    <div style={{fontSize: 11, color: theme.sub}}>{new Date(h.scannedAt).toLocaleTimeString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* STATS TAB */}
        {tab === "stats" && (
          <div>
            <h3>{txt.detectionStats}</h3>
            <div style={{display: "flex", gap: 10, marginBottom: 16, marginTop: 12}}>
              {[{label: txt.fakeDetected, val: fakeCount, color: "#e94560", bg: "rgba(233,69,96,0.15)", border: "rgba(233,69,96,0.3)"},
                {label: txt.genuine, val: realCount, color: "#00b894", bg: "rgba(0,184,148,0.15)", border: "rgba(0,184,148,0.3)"},
                {label: txt.totalScans, val: history.length, color: theme.text, bg: theme.card, border: theme.border}
              ].map(s => (
                <div key={s.label} style={{flex: 1, background: s.bg, borderRadius: 12, padding: 14, textAlign: "center", border: "1px solid " + s.border}}>
                  <div style={{fontSize: 30, fontWeight: "bold", color: s.color}}>{s.val}</div>
                  <div style={{color: theme.sub, fontSize: 11}}>{s.label}</div>
                </div>
              ))}
            </div>
            <div style={{background: theme.card, borderRadius: 16, padding: 16, marginBottom: 14, border: "1px solid " + theme.border}}>
              <h4 style={{margin: "0 0 10px"}}>📊 Bar Chart</h4>
              <ResponsiveContainer width="100%" height={160}>
                <BarChart data={chartData}>
                  <XAxis dataKey="name" stroke={theme.text} />
                  <YAxis stroke={theme.text} />
                  <Tooltip contentStyle={{background: "#1a1a2e", border: "none"}} />
                  <Bar dataKey="count" radius={[6,6,0,0]}>
                    {chartData.map((e,i) => <Cell key={i} fill={e.color} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div style={{background: theme.card, borderRadius: 16, padding: 16, border: "1px solid " + theme.border}}>
              <h4 style={{margin: "0 0 10px"}}>🥧 Pie Chart</h4>
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" outerRadius={75} dataKey="value" label>
                    {pieData.map((e,i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Legend /><Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* ABOUT TAB */}
        {tab === "about" && (
          <div>
            <div style={{textAlign: "center", marginBottom: 24}}>
              <img src={logo} alt="TruthShield" style={{width: 80, height: 80, objectFit: "contain", borderRadius: 16}} />
              <h2 style={{margin: "12px 0 4px"}}>TRUTH<span style={{color: "#e94560"}}>SHIELD</span></h2>
              <div style={{color: theme.sub, fontSize: 13}}>Fake Content Detection Platform v1.0</div>
            </div>

            <div style={{background: theme.card, borderRadius: 16, padding: 20, border: "1px solid " + theme.border, marginBottom: 14}}>
              <h4 style={{color: "#e94560", marginBottom: 12}}>🎯 Project Purpose</h4>
              <p style={{fontSize: 13, color: theme.sub, lineHeight: 1.7}}>
                TruthShield is an AI-powered fake content detection system that helps users identify scams, fraud, rumors, and plagiarized content in real-time using advanced keyword analysis, machine learning, and web scraping technology.
              </p>
            </div>

            <div style={{background: theme.card, borderRadius: 16, padding: 20, border: "1px solid " + theme.border, marginBottom: 14}}>
              <h4 style={{color: "#e94560", marginBottom: 12}}>⚡ Features</h4>
              {["🔍 Real-time URL & text analysis","🤖 AI-powered explanation engine","💬 WhatsApp message scanner","📸 Camera & image detection","📋 Bulk URL scanning","🌐 Tamil & English support","🌙 Dark / Light theme","📄 PDF report download","🔔 Email & sound alerts","📊 Statistics dashboard","👤 User authentication (JWT)","🐍 Python ML model integration"].map(f => (
                <div key={f} style={{padding: "6px 0", fontSize: 13, color: theme.sub, borderBottom: "1px solid " + theme.border}}>
                  {f}
                </div>
              ))}
            </div>

            <div style={{background: theme.card, borderRadius: 16, padding: 20, border: "1px solid " + theme.border, marginBottom: 14}}>
              <h4 style={{color: "#e94560", marginBottom: 12}}>🛠️ Tech Stack</h4>
              <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8}}>
                {[["⚛️ React.js","Frontend"],["☕ Java + Jsoup","Scraping"],["🍃 Spring Boot","REST API"],["🍃 MongoDB","Database"],["🐍 Python + Flask","ML Server"],["🤖 Scikit-learn","ML Model"],["🔐 JWT","Authentication"],["📧 JavaMail","Email Alerts"]].map(([tech, role]) => (
                  <div key={tech} style={{background: theme.inputBg, borderRadius: 8, padding: "8px 12px", fontSize: 12}}>
                    <div style={{fontWeight: "bold"}}>{tech}</div>
                    <div style={{color: theme.sub, fontSize: 11}}>{role}</div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{background: theme.card, borderRadius: 16, padding: 20, border: "1px solid " + theme.border}}>
              <h4 style={{color: "#e94560", marginBottom: 8}}>👩‍💻 Developer</h4>
              <div style={{fontSize: 13, color: theme.sub}}>
                <div> Name: Sarsika Sri K </div>
                <div>Project: TruthShield 
                    AI-Powered Fake Content Detection Platform
                </div>
                <div style={{marginTop: 8, color: "#e94560"}}>Version: v1.0 | 2025</div>
              </div>
            </div>
          </div>
        )}

        {/* SETTINGS TAB */}
        {tab === "settings" && (
          <div>
            <h3>⚙️ {lang === "en" ? "Settings" : "அமைப்புகள்"}</h3>
            <div style={{marginTop: 16, display: "flex", flexDirection: "column", gap: 12}}>

              {/* Theme */}
              <div style={{background: theme.card, borderRadius: 16, padding: 20, border: "1px solid " + theme.border, display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                <div>
                  <div style={{fontWeight: "bold", fontSize: 14}}>{lang === "en" ? "🌙 Theme" : "🌙 தீம்"}</div>
                  <div style={{color: theme.sub, fontSize: 12}}>{darkMode ? (lang==="en"?"Dark Mode":"இருண்ட பயன்முறை") : (lang==="en"?"Light Mode":"ஒளி பயன்முறை")}</div>
                </div>
                <button onClick={() => setDarkMode(!darkMode)}
                  style={{padding: "8px 20px", background: darkMode ? "#ffd700" : "#333", color: darkMode ? "#333" : "#fff", border: "none", borderRadius: 20, cursor: "pointer", fontWeight: "bold"}}>
                  {darkMode ? "☀️ Light" : "🌙 Dark"}
                </button>
              </div>

              {/* Language */}
              <div style={{background: theme.card, borderRadius: 16, padding: 20, border: "1px solid " + theme.border, display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                <div>
                  <div style={{fontWeight: "bold", fontSize: 14}}>🌐 {lang==="en"?"Language":"மொழி"}</div>
                  <div style={{color: theme.sub, fontSize: 12}}>{lang==="en"?"English":"தமிழ்"}</div>
                </div>
                <button onClick={() => setLang(lang==="en"?"ta":"en")}
                  style={{padding: "8px 20px", background: "#6c63ff", color: "#fff", border: "none", borderRadius: 20, cursor: "pointer", fontWeight: "bold"}}>
                  {lang==="en"?"🌐 தமிழ்":"🌐 English"}
                </button>
              </div>

              {/* Sound */}
              <div style={{background: theme.card, borderRadius: 16, padding: 20, border: "1px solid " + theme.border, display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                <div>
                  <div style={{fontWeight: "bold", fontSize: 14}}>🔔 {lang==="en"?"Sound Alert":"ஒலி எச்சரிக்கை"}</div>
                  <div style={{color: theme.sub, fontSize: 12}}>{soundEnabled?(lang==="en"?"ON":"இயக்கு"):(lang==="en"?"OFF":"முடக்கு")}</div>
                </div>
                <button onClick={() => setSoundEnabled(!soundEnabled)}
                  style={{padding: "8px 20px", background: soundEnabled?"#00b894":"#555", color: "#fff", border: "none", borderRadius: 20, cursor: "pointer", fontWeight: "bold"}}>
                  {soundEnabled?"ON":"OFF"}
                </button>
              </div>

              {/* Notifications */}
              <div style={{background: theme.card, borderRadius: 16, padding: 20, border: "1px solid " + theme.border, display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                <div>
                  <div style={{fontWeight: "bold", fontSize: 14}}>🔔 {lang==="en"?"Notifications":"அறிவிப்புகள்"}</div>
                  <div style={{color: theme.sub, fontSize: 12}}>{notifEnabled?(lang==="en"?"ON":"இயக்கு"):(lang==="en"?"OFF":"முடக்கு")}</div>
                </div>
                <button onClick={() => setNotifEnabled(!notifEnabled)}
                  style={{padding: "8px 20px", background: notifEnabled?"#00b894":"#555", color: "#fff", border: "none", borderRadius: 20, cursor: "pointer", fontWeight: "bold"}}>
                  {notifEnabled?"ON":"OFF"}
                </button>
              </div>

            </div>
          </div>
        )}

        {/* PROFILE TAB */}
        {tab === "profile" && (
          <div>
            <h3>👤 {lang==="en"?"Profile":"சுயவிவரம்"}</h3>
            <div style={{marginTop: 16}}>

              <div style={{background: theme.card, borderRadius: 16, padding: 24, border: "1px solid " + theme.border, textAlign: "center", marginBottom: 14}}>
                <div style={{width: 70, height: 70, borderRadius: "50%", background: "linear-gradient(135deg, #e94560, #6c63ff)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 28, margin: "0 auto 12px"}}>
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div style={{fontSize: 18, fontWeight: "bold"}}>{user.name}</div>
                <div style={{color: theme.sub, fontSize: 13, marginTop: 4}}>{user.email}</div>
                <div style={{marginTop: 8, padding: "4px 12px", background: "#e94560", borderRadius: 20, display: "inline-block", fontSize: 11, color: "#fff"}}>
                  ✅ Verified User
                </div>
              </div>

              <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 10, marginBottom: 14}}>
                {[{label: lang==="en"?"Total Scans":"மொத்த ஸ்கான்", val: history.length, color: "#6c63ff"},
                  {label: lang==="en"?"Fake Found":"போலி கண்டறிந்தது", val: fakeCount, color: "#e94560"},
                  {label: lang==="en"?"Safe Content":"பாதுகாப்பான", val: realCount, color: "#00b894"}
                ].map(s => (
                  <div key={s.label} style={{background: theme.card, borderRadius: 12, padding: 14, textAlign: "center", border: "1px solid " + theme.border}}>
                    <div style={{fontSize: 26, fontWeight: "bold", color: s.color}}>{s.val}</div>
                    <div style={{color: theme.sub, fontSize: 10, marginTop: 4}}>{s.label}</div>
                  </div>
                ))}
              </div>

              <div style={{background: theme.card, borderRadius: 16, padding: 20, border: "1px solid " + theme.border}}>
                <h4 style={{marginBottom: 12, color: "#e94560"}}>{lang==="en"?"Account Info":"கணக்கு தகவல்"}</h4>
                {[["👤 Name", user.name], ["📧 Email", user.email], ["🔐 Status", "Active"], ["📅 Version", "v1.0"]].map(([k,v]) => (
                  <div key={k} style={{display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: "1px solid " + theme.border, fontSize: 13}}>
                    <span style={{color: theme.sub}}>{k}</span>
                    <span style={{fontWeight: "bold"}}>{v}</span>
                  </div>
                ))}
              </div>

              <button onClick={() => setUser(null)}
                style={{width: "100%", marginTop: 14, padding: 12, background: "#e94560", color: "#fff", border: "none", borderRadius: 10, cursor: "pointer", fontSize: 14, fontWeight: "bold"}}>
                🚪 {txt.logout}
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

export default App;