import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useDepartments } from '../api/queries';
import { useToast } from '../hooks/useToast';
import { Leaf, ArrowRight, ShieldCheck, Users, ShieldAlert, Key } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/Card';

export const Login = () => {
  const { login, register, isLoggingIn, isRegistering } = useAuth();
  const { data: depts = [] } = useDepartments();
  const { toast } = useToast();

  const [activeTab, setActiveTab] = useState('login');
  
  // Login fields
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('pass123');

  // Register fields
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regRole, setRegRole] = useState('EMPLOYEE');
  const [regDept, setRegDept] = useState('');
  const [regPassword, setRegPassword] = useState('');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    if (!loginEmail) return;

    login({ email: loginEmail, password: loginPassword }, {
      onSuccess: () => {
        toast(`Signed in successfully as ${loginEmail}`, 'success');
      },
      onError: (err) => {
        toast(err.message || 'Login failed. Try a seeded email like "alice@company.com"', 'error');
      }
    });
  };

  const handleRegisterSubmit = (e) => {
    e.preventDefault();
    if (!regName || !regEmail || !regDept) return;

    register({
      name: regName,
      email: regEmail,
      role: regRole,
      departmentId: regDept,
      password: regPassword
    }, {
      onSuccess: () => {
        toast(`Account registered successfully for ${regName}`, 'success');
      },
      onError: (err) => {
        toast(err.message || 'Registration failed.', 'error');
      }
    });
  };

  const seedAccounts = [
    { name: 'Alice Smith', email: 'alice@company.com', role: 'ESG Admin', desc: 'Manage config, schedule audits' },
    { name: 'Bob Johnson', email: 'bob@company.com', role: 'Dept Head', desc: 'Approve CSR/challenges for ENG department' },
    { name: 'Charlie Brown', email: 'charlie@company.com', role: 'Employee', desc: 'Log CSR activities, earn XP/badges' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-background relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-72 h-72 rounded-full bg-primary/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full bg-esg-social/10 blur-[130px] pointer-events-none" />

      <div className="w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 gap-8 z-10">
        <div className="flex flex-col justify-center space-y-6 text-left pr-4">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-primary to-teal-400 flex items-center justify-center shadow-lg shadow-primary/20">
              <Leaf className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-display font-extrabold text-2xl tracking-wide bg-gradient-to-r from-primary to-teal-300 bg-clip-text text-transparent">
              EcoSphere
            </span>
          </div>

          <div className="space-y-3">
            <h1 className="font-display font-extrabold text-3xl leading-tight text-foreground">
              Embed Sustainability into Corporate Workflows.
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              EcoSphere connects raw enterprise operational data directly to ESG scoring indicators, utilizing structured points ledgers and challenge badges to empower employees.
            </p>
          </div>

          <div className="space-y-4 pt-2">
            <div className="flex items-start space-x-3">
              <div className="p-1.5 rounded-lg bg-primary/15 mt-0.5 text-primary">
                <Leaf className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Verified Carbon Ledger</p>
                <p className="text-[11px] text-muted-foreground">Transform ERP transactions automatically into Scope 1 & 2 equivalents.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="p-1.5 rounded-lg bg-esg-social/15 mt-0.5 text-esg-social">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Incentivized CSR Engagement</p>
                <p className="text-[11px] text-muted-foreground">Log participations, request XP checks, and rank on company scoreboards.</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="p-1.5 rounded-lg bg-esg-gov/15 mt-0.5 text-esg-gov">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Governance Integrity Audit</p>
                <p className="text-[11px] text-muted-foreground">Configure custom E, S, G coefficient configurations based on weights.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center">
          <Card glass className="border border-border/80 shadow-2xl">
            <CardHeader className="pb-4">
              <div className="flex bg-muted p-1 rounded-xl w-full mb-4">
                <button
                  onClick={() => setActiveTab('login')}
                  className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'login' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setActiveTab('register')}
                  className={`flex-1 text-center py-2 text-xs font-bold rounded-lg transition-all ${activeTab === 'register' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
                >
                  Create Account
                </button>
              </div>

              <CardTitle className="text-xl">
                {activeTab === 'login' ? 'Enterprise Sign In' : 'Join EcoSphere'}
              </CardTitle>
              <CardDescription>
                {activeTab === 'login' 
                  ? 'Access your corporate ESG scoreboard profile.' 
                  : 'Register a new employee persona.'}
              </CardDescription>
            </CardHeader>

            <CardContent>
              {activeTab === 'login' ? (
                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Email Address</label>
                    <input
                      type="email"
                      placeholder="name@company.com"
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      required
                    />
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1.5">
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground">Password</label>
                      <a href="#" className="text-[10px] text-primary hover:underline">Forgot password?</a>
                    </div>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="w-full flex items-center justify-center space-x-2 bg-primary text-primary-foreground font-semibold py-2.5 rounded-xl hover:bg-primary/95 transition-all duration-200 active:scale-98 mt-2"
                  >
                    <span>{isLoggingIn ? 'Authenticating...' : 'Sign In'}</span>
                    <ArrowRight className="w-4.5 h-4.5" />
                  </button>

                  <div className="pt-4 border-t border-border/50 space-y-2">
                    <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider flex items-center">
                      <Key className="w-3.5 h-3.5 mr-1 text-primary" /> Test Simulation Quick-Fill
                    </p>
                    <div className="grid grid-cols-1 gap-1.5">
                      {seedAccounts.map((acc) => (
                        <button
                          key={acc.email}
                          type="button"
                          onClick={() => setLoginEmail(acc.email)}
                          className="w-full text-left p-2 rounded-xl bg-muted/40 hover:bg-muted border border-border/40 hover:border-primary/20 transition-all flex justify-between items-center text-xs group"
                        >
                          <div>
                            <span className="font-bold text-foreground">{acc.name}</span>
                            <span className="text-muted-foreground text-[10px] ml-2">• {acc.role}</span>
                            <p className="text-[10px] text-muted-foreground/80 line-clamp-1">{acc.desc}</p>
                          </div>
                          <span className="text-[10px] text-primary group-hover:translate-x-0.5 transition-transform">Fill ➔</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </form>
              ) : (
                <form onSubmit={handleRegisterSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Full Name</label>
                      <input
                        type="text"
                        placeholder="John Doe"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Email Address</label>
                      <input
                        type="email"
                        placeholder="john@company.com"
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Role Persona</label>
                      <select
                        value={regRole}
                        onChange={(e) => setRegRole(e.target.value)}
                        className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none"
                        required
                      >
                        <option value="EMPLOYEE">Standard Employee</option>
                        <option value="DEPT_HEAD">Department Head</option>
                        <option value="ESG_ADMIN">ESG Administrator</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Department</label>
                      <select
                        value={regDept}
                        onChange={(e) => setRegDept(e.target.value)}
                        className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none"
                        required
                      >
                        <option value="">Select Department...</option>
                        {depts.map((d) => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">Password</label>
                    <input
                      type="password"
                      placeholder="••••••••"
                      value={regPassword}
                      onChange={(e) => setRegPassword(e.target.value)}
                      className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none"
                      required
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isRegistering}
                    className="w-full flex items-center justify-center space-x-2 bg-primary text-primary-foreground font-semibold py-2.5 rounded-xl hover:bg-primary/95 transition-all duration-200 active:scale-98 mt-2"
                  >
                    <span>{isRegistering ? 'Registering...' : 'Register Profile'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
