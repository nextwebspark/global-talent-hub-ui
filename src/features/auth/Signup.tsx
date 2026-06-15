import { useState } from "react";
import { useLocation } from "wouter";
import { Check, ArrowLeft, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Brandmark, BrandPanel, PasswordField } from "./components";
import "./auth.css";

const slugFrom = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const STEPS = ["Account", "Organization", "Invite team"];

export default function Signup() {
  const [, navigate] = useLocation();
  const { signUpWithOrg } = useAuth();

  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [org, setOrg] = useState("");
  const [slug, setSlug] = useState("");
  const [size, setSize] = useState("2–10");
  const [region, setRegion] = useState("Middle East (GCC)");
  const [invites, setInvites] = useState(["", "", ""]);
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // Step 0 → validate account inputs locally, then advance to org setup.
  // The account is created atomically at the final step, together with the org.
  const continueToOrg = () => {
    setError(null);
    if (!slug) setSlug(slugFrom(name || "workspace"));
    setStep(1);
  };

  // Final → create the account AND the organization in one atomic call, then enter.
  const createWorkspace = async () => {
    setError(null);
    setBusy(true);
    try {
      await signUpWithOrg(email, pw, name, { name: org, slug, teamSize: size, region });
      // Team invites are deferred this release — ignored for now.
      navigate("/");
    } catch (e: any) {
      setError(e?.message || "Could not create workspace");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="tm-auth">
      <div className="tm-auth__form">
        <div className="tm-auth__card">
          <Brandmark />
          <div className="tm-steps">
            {STEPS.map((s, i) => (
              <div key={s} style={{ display: "contents" }}>
                <div className={`tm-step${i === step ? " is-on" : ""}${i < step ? " is-done" : ""}`}>
                  <span className="tm-step__n">{i < step ? <Check size={13} /> : i + 1}</span>
                  <span className="tm-step__l">{s}</span>
                </div>
                {i < STEPS.length - 1 && <span className="tm-step__bar" />}
              </div>
            ))}
          </div>

          {error && <div className="tm-auth__error">{error}</div>}

          {step === 0 && (
            <>
              <h1 className="tm-auth__title">Create your account</h1>
              <p className="tm-auth__sub">Start your 14-day trial. No card required.</p>
              <div className="tm-afield">
                <div className="tm-alabel"><span>Full name</span></div>
                <input className="tm-ainput" value={name} onChange={(e) => setName(e.target.value)} placeholder="Yara Mansour" />
              </div>
              <div className="tm-afield">
                <div className="tm-alabel"><span>Work email</span></div>
                <input className="tm-ainput" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@company.com" />
              </div>
              <PasswordField label="Password" value={pw} onChange={(e) => setPw(e.target.value)} placeholder="At least 8 characters" />
              <button className="tm-auth__btn" disabled={!email.includes("@") || pw.length < 8} onClick={continueToOrg}>
                Continue
              </button>
              <p className="tm-auth__foot">
                Already have an account? <span className="tm-link-inline" onClick={() => navigate("/login")}>Sign in</span>
              </p>
            </>
          )}

          {step === 1 && (
            <>
              <h1 className="tm-auth__title">Set up your organization</h1>
              <p className="tm-auth__sub">This is the shared workspace your team will join.</p>
              <div className="tm-afield">
                <div className="tm-alabel"><span>Organization name</span></div>
                <input className="tm-ainput" value={org} onChange={(e) => { setOrg(e.target.value); setSlug(slugFrom(e.target.value)); }} placeholder="ALAC Partners" />
              </div>
              <div className="tm-afield">
                <div className="tm-alabel"><span>Workspace URL</span></div>
                <div className="tm-prefix">
                  <input value={slug} onChange={(e) => setSlug(slugFrom(e.target.value))} placeholder="alac-partners" />
                  <span className="sfx">.talentmap.app</span>
                </div>
              </div>
              <div className="tm-afield">
                <div className="tm-alabel"><span>Team size</span></div>
                <select className="tm-ainput" value={size} onChange={(e) => setSize(e.target.value)} style={{ cursor: "pointer" }}>
                  <option>Just me</option><option>2–10</option><option>11–50</option><option>51–200</option><option>200+</option>
                </select>
              </div>
              <div className="tm-afield">
                <div className="tm-alabel"><span>Primary region</span></div>
                <select className="tm-ainput" value={region} onChange={(e) => setRegion(e.target.value)} style={{ cursor: "pointer" }}>
                  <option>Middle East (GCC)</option><option>North Africa</option><option>Europe</option><option>Global</option>
                </select>
              </div>
              <div className="tm-step-row">
                <button className="tm-auth__btn tm-auth__btn--outline tm-auth__btn--icon" onClick={() => setStep(0)}>
                  <ArrowLeft size={16} />
                </button>
                <button className="tm-auth__btn" style={{ flex: 1 }} disabled={!org.trim()} onClick={() => setStep(2)}>Continue</button>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="tm-auth__title">Invite your team</h1>
              <p className="tm-auth__sub">Add colleagues now, or do it later from Settings.</p>
              {invites.map((v, i) => (
                <div className="tm-afield" key={i} style={{ marginBottom: 10 }}>
                  <input
                    className="tm-ainput"
                    type="email"
                    value={v}
                    placeholder="name@company.com"
                    onChange={(e) => setInvites((arr) => arr.map((x, j) => (j === i ? e.target.value : x)))}
                  />
                </div>
              ))}
              <button className="tm-link-inline" style={{ fontSize: 13, background: "none", border: "none", cursor: "pointer" }} onClick={() => setInvites((a) => [...a, ""])}>
                + Add another
              </button>
              <label className={`tm-check${agree ? " on" : ""}`} style={{ margin: "18px 0 16px" }} onClick={() => setAgree((a) => !a)}>
                <span className="tm-check__box">{agree && <Check size={12} />}</span>
                <span>I agree to the Terms of Service and Privacy Policy.</span>
              </label>
              {/* Team invites are deferred this release — creating the workspace ignores them for now. */}
              <button className="tm-auth__btn" disabled={busy || !agree} onClick={createWorkspace}>
                <Sparkles size={16} />{busy ? "Creating…" : "Create workspace"}
              </button>
            </>
          )}
        </div>
      </div>
      <BrandPanel variant="signup" />
    </div>
  );
}
