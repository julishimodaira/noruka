import { useState } from "react";
import { supabase } from "./supabase";

export default function AuthModal({ onClose, onSuccess }) {
  const [mode, setMode] = useState("signin"); // signin | signup | reset
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setMessage(null);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setMessage("Check your email to confirm your account!");
      } else if (mode === "signin") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onSuccess();
        onClose();
      } else if (mode === "reset") {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: "https://www.noruka.app/#recovery"
        });
        if (error) throw error;
        setMessage("Password reset email sent!");
      }
    } catch (e) {
      setError(e.message);
    }
    setLoading(false);
  };

  return (
    <div style={{position:"fixed",inset:0,background:"rgba(0,0,0,0.85)",zIndex:500,display:"flex",alignItems:"flex-end",justifyContent:"center",backdropFilter:"blur(8px)"}} onClick={onClose}>
      <div onClick={e=>e.stopPropagation()} style={{background:"#0f1424",borderRadius:"22px 22px 0 0",border:"1px solid rgba(255,255,255,0.09)",width:"100%",maxWidth:480,padding:"28px 20px 48px"}}>
        
        {/* Header */}
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:24}}>
          <div>
            <div style={{fontFamily:"'Space Grotesk',sans-serif",fontSize:20,fontWeight:700,color:"#fff",marginBottom:4}}>
              {mode === "signin" ? "Sign in to Noruka" : mode === "signup" ? "Create your account" : "Reset password"}
            </div>
            <div style={{fontSize:12,color:"rgba(255,255,255,0.4)"}}>
              {mode === "signin" ? "Access your profile and saved routes" : mode === "signup" ? "Save your accessibility profile across devices" : "We'll send you a reset link"}
            </div>
          </div>
          <button onClick={onClose} style={{background:"rgba(255,255,255,0.08)",border:"none",borderRadius:8,color:"rgba(255,255,255,0.6)",width:30,height:30,cursor:"pointer",fontSize:14}}>✕</button>
        </div>

        {/* Email field */}
        <div style={{marginBottom:12}}>
          <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:6}}>Email</div>
          <input
            type="email"
            value={email}
            onChange={e=>setEmail(e.target.value)}
            placeholder="you@example.com"
            style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,padding:"12px 14px",fontSize:13,color:"#fff",outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}
            onFocus={e=>e.target.style.borderColor="#3b82f6"}
            onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}
          />
        </div>

        {/* Password field */}
        {mode !== "reset" && (
          <div style={{marginBottom:20}}>
            <div style={{fontSize:10,color:"rgba(255,255,255,0.4)",letterSpacing:"1.5px",textTransform:"uppercase",marginBottom:6}}>Password</div>
            <input
              type="password"
              value={password}
              onChange={e=>setPassword(e.target.value)}
              placeholder={mode === "signup" ? "Min 6 characters" : "Your password"}
              style={{width:"100%",background:"rgba(255,255,255,0.05)",border:"1px solid rgba(255,255,255,0.1)",borderRadius:12,padding:"12px 14px",fontSize:13,color:"#fff",outline:"none",fontFamily:"inherit",boxSizing:"border-box"}}
              onFocus={e=>e.target.style.borderColor="#3b82f6"}
              onBlur={e=>e.target.style.borderColor="rgba(255,255,255,0.1)"}
            />
          </div>
        )}

        {/* Error/Success messages */}
        {error && <div style={{background:"rgba(239,68,68,0.1)",border:"1px solid rgba(239,68,68,0.2)",borderRadius:9,padding:"10px 12px",fontSize:12,color:"#f87171",marginBottom:12}}>{error}</div>}
        {message && <div style={{background:"rgba(52,211,153,0.1)",border:"1px solid rgba(52,211,153,0.2)",borderRadius:9,padding:"10px 12px",fontSize:12,color:"#34d399",marginBottom:12}}>{message}</div>}

        {/* Submit button */}
        <button
          onClick={handleSubmit}
          disabled={loading || !email}
          style={{width:"100%",padding:"13px",borderRadius:12,border:"none",background:loading||!email?"rgba(255,255,255,0.08)":"linear-gradient(135deg,#3b82f6,#06b6d4)",color:loading||!email?"rgba(255,255,255,0.3)":"#fff",fontWeight:700,cursor:loading||!email?"not-allowed":"pointer",fontSize:14,fontFamily:"'Space Grotesk',sans-serif",marginBottom:16}}
        >
          {loading ? "Please wait…" : mode === "signin" ? "Sign In" : mode === "signup" ? "Create Account" : "Send Reset Email"}
        </button>

        {/* Mode switchers */}
        <div style={{textAlign:"center",fontSize:12,color:"rgba(255,255,255,0.4)"}}>
          {mode === "signin" && <>
            <span>Don't have an account? </span>
            <button onClick={()=>{setMode("signup");setError(null);setMessage(null);}} style={{background:"none",border:"none",color:"#7dd3fc",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>Sign up</button>
            <span> · </span>
            <button onClick={()=>{setMode("reset");setError(null);setMessage(null);}} style={{background:"none",border:"none",color:"#7dd3fc",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>Forgot password?</button>
          </>}
          {mode === "signup" && <>
            <span>Already have an account? </span>
            <button onClick={()=>{setMode("signin");setError(null);setMessage(null);}} style={{background:"none",border:"none",color:"#7dd3fc",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>Sign in</button>
          </>}
          {mode === "reset" && <>
            <button onClick={()=>{setMode("signin");setError(null);setMessage(null);}} style={{background:"none",border:"none",color:"#7dd3fc",cursor:"pointer",fontSize:12,fontFamily:"inherit"}}>Back to sign in</button>
          </>}
        </div>
      </div>
    </div>
  );
}
