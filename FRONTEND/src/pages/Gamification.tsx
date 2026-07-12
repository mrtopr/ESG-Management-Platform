import React, { useState } from 'react';
import { 
  Award, Trophy, Leaf, Store, CheckCircle, Flame, ArrowUpRight, 
  HelpCircle, ChevronRight, Lock, Gift, Star, RefreshCcw
} from 'lucide-react';
import { 
  useChallenges, useChallengeParticipations, useParticipateInChallenge, 
  useUpdateChallengeProgress, useBadges, useEmployeeBadges, 
  useLeaderboard, useRewards, useRedeemReward 
} from '../api/queries';
import { useAuth } from '../hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '../components/Card';
import { Dialog } from '../components/Dialog';
import { db } from '../api/client';

export const Gamification: React.FC = () => {
  const { user } = useAuth();

  // Queries
  const { data: challenges = [] } = useChallenges();
  const { data: participations = [] } = useChallengeParticipations();
  const { data: badges = [] } = useBadges();
  const { data: employeeBadges = [] } = useEmployeeBadges();
  const { data: leaderboard = [], refetch: refetchLeaderboard } = useLeaderboard();
  const { data: rewards = [] } = useRewards();

  // Mutations
  const joinChallenge = useParticipateInChallenge();
  const updateProgress = useUpdateChallengeProgress();
  const redeemReward = useRedeemReward();

  // Dialog State
  const [redeemModalOpen, setRedeemModalOpen] = useState(false);
  const [selectedReward, setSelectedReward] = useState<any>(null);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Challenge Input Modal
  const [progressModalOpen, setProgressModalOpen] = useState(false);
  const [selectedPartId, setSelectedPartId] = useState('');
  const [sliderProgress, setSliderProgress] = useState(50);
  const [challengeProof, setChallengeProof] = useState('');

  // Computations
  const userParticipations = participations.filter(p => p.employeeId === user?.id);
  const userBadges = employeeBadges.filter(eb => eb.employeeId === user?.id);

  // Compute user current points balance
  const currentPoints = db.pointsTransactions
    .filter(tx => tx.employeeId === user?.id)
    .reduce((sum, tx) => sum + tx.amount, 0);

  const handleJoinChallenge = (challengeId: string) => {
    joinChallenge.mutate(challengeId);
  };

  const handleUpdateProgressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartId) return;

    updateProgress.mutate({
      participationId: selectedPartId,
      progress: Number(sliderProgress),
      proofUrl: challengeProof || null
    }, {
      onSuccess: () => {
        setProgressModalOpen(false);
        setChallengeProof('');
        refetchLeaderboard();
      }
    });
  };

  const handleRedeemClick = (reward: any) => {
    setSelectedReward(reward);
    setErrorMsg('');
    setSuccessMsg('');
    setRedeemModalOpen(true);
  };

  const handleRedeemConfirm = () => {
    if (!selectedReward) return;

    redeemReward.mutate(selectedReward.id, {
      onSuccess: () => {
        setSuccessMsg(`Successfully redeemed! You earned "${selectedReward.name}".`);
        refetchLeaderboard();
      },
      onError: (err: any) => {
        setErrorMsg(err.message || 'Redemption failed.');
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center space-y-4 md:space-y-0">
        <div>
          <h1 className="font-display font-extrabold text-3xl tracking-tight text-foreground flex items-center">
            <Award className="w-8 h-8 text-esg-points mr-2.5" />
            EcoSphere Gamification
          </h1>
          <p className="text-muted-foreground text-sm">
            Participate in environmental challenges, acquire badges, and spend accrued points on eco-incentives.
          </p>
        </div>

        {/* Dynamic Points Indicator */}
        <div className="flex items-center space-x-3 bg-esg-points/10 border border-esg-points/30 rounded-2xl px-4 py-2">
          <Star className="w-5 h-5 text-esg-points fill-esg-points animate-spin-slow" />
          <div>
            <p className="text-[10px] text-esg-points font-bold uppercase tracking-wider">Points Ledger</p>
            <p className="text-lg font-extrabold text-foreground">{currentPoints} Points</p>
          </div>
        </div>
      </div>

      {/* Main Layout Split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Columns - Challenges & Rewards */}
        <div className="lg:col-span-2 space-y-6">
          {/* Challenges List */}
          <Card className="bg-card/40">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Flame className="w-5 h-5 text-red-400 mr-2" />
                Active Corporate Challenges
              </CardTitle>
              <CardDescription>Join eco-challenges, log progress, and claim points & XP bonuses</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {challenges.map(ch => {
                const participation = userParticipations.find(p => p.challengeId === ch.id);
                
                return (
                  <div key={ch.id} className="p-4 border border-border/50 bg-muted/15 rounded-2xl space-y-3 hover:border-primary/20 transition-all">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className={`px-2 py-0.25 rounded text-[9px] font-bold ${
                            ch.difficulty === 'Easy' ? 'bg-emerald-500/10 text-emerald-400' :
                            ch.difficulty === 'Medium' ? 'bg-blue-500/10 text-blue-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {ch.difficulty}
                          </span>
                          <span className="text-[10px] text-muted-foreground">Deadline: {ch.deadline}</span>
                        </div>
                        <h4 className="font-semibold text-foreground text-sm mt-1">{ch.title}</h4>
                        <p className="text-xs text-muted-foreground mt-0.5">{ch.description}</p>
                      </div>

                      <div className="text-right flex-shrink-0">
                        <span className="text-xs font-bold text-esg-points flex items-center justify-end">
                          <Star className="w-3.5 h-3.5 mr-0.5 fill-esg-points text-esg-points" /> +{ch.xp} XP
                        </span>
                        
                        {/* Dynamic Actions */}
                        <div className="mt-2">
                          {!participation ? (
                            <button 
                              onClick={() => handleJoinChallenge(ch.id)}
                              className="text-xs bg-primary text-primary-foreground font-bold px-3 py-1.5 rounded-xl hover:bg-primary/95 transition-all"
                            >
                              Join Challenge
                            </button>
                          ) : (
                            <div className="flex items-center space-x-2">
                              {participation.approvalStatus === 'APPROVED' ? (
                                <span className="text-xs text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-lg flex items-center">
                                  <CheckCircle className="w-3.5 h-3.5 mr-0.5" /> Completed
                                </span>
                              ) : (
                                <button 
                                  onClick={() => {
                                    setSelectedPartId(participation.id);
                                    setSliderProgress(participation.progress);
                                    setProgressModalOpen(true);
                                  }}
                                  className="text-xs bg-muted text-foreground border border-border hover:bg-border font-bold px-3 py-1.5 rounded-xl transition-all"
                                >
                                  Update ({participation.progress}%)
                                </button>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Progress slider representation */}
                    {participation && (
                      <div className="space-y-1">
                        <div className="w-full bg-muted/60 rounded-full h-1.5">
                          <div 
                            className="bg-primary h-1.5 rounded-full transition-all duration-300"
                            style={{ width: `${participation.progress}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[9px] text-muted-foreground">
                          <span>Status: {participation.approvalStatus}</span>
                          <span>Progress: {participation.progress}%</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </CardContent>
          </Card>

          {/* Rewards Store */}
          <Card className="bg-card/40">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Store className="w-5 h-5 text-esg-social mr-2" />
                Sustainable Incentives Store
              </CardTitle>
              <CardDescription>Redeem accumulated points for eco-goods, gear, and reforestation funds</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rewards.map(rwd => (
                <div key={rwd.id} className="p-3 border border-border/40 bg-card rounded-2xl flex flex-col justify-between space-y-4 hover:border-primary/10 transition-colors">
                  <div className="space-y-1">
                    <h4 className="font-bold text-foreground text-sm flex items-center justify-between">
                      {rwd.name}
                      <span className="text-[10px] text-muted-foreground font-medium">Stock: {rwd.stock} left</span>
                    </h4>
                    <p className="text-xs text-muted-foreground leading-snug">{rwd.description}</p>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-border/30">
                    <span className="text-xs font-extrabold text-esg-points">{rwd.pointsRequired} pts</span>
                    
                    <button 
                      onClick={() => handleRedeemClick(rwd)}
                      disabled={rwd.stock < 1 || currentPoints < rwd.pointsRequired}
                      className="text-xs bg-primary text-primary-foreground font-bold px-3 py-1.5 rounded-xl hover:bg-primary/95 disabled:bg-muted disabled:text-muted-foreground transition-all duration-200"
                    >
                      {rwd.stock < 1 ? 'Out of Stock' : 'Redeem Spend'}
                    </button>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Columns - Leaderboard & Badges */}
        <div className="space-y-6">
          {/* Leaderboard Card */}
          <Card className="bg-card/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Trophy className="w-5 h-5 text-yellow-400 mr-2" />
                XP Leaderboard
              </CardTitle>
              <CardDescription>Top employee sustainability rankings</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {leaderboard.slice(0, 5).map((row) => (
                <div 
                  key={row.id} 
                  className={`flex items-center justify-between p-2.5 rounded-xl border ${
                    row.id === user?.id 
                      ? 'bg-primary/10 border-primary text-primary font-bold' 
                      : 'bg-card/50 border-border/40 text-foreground'
                  }`}
                >
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <span className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs flex-shrink-0 ${
                      row.rank === 1 ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30' :
                      row.rank === 2 ? 'bg-slate-400/20 text-slate-300 border border-slate-400/30' :
                      row.rank === 3 ? 'bg-amber-600/20 text-amber-500 border border-amber-600/30' : 'bg-muted text-muted-foreground'
                    }`}>
                      {row.rank}
                    </span>
                    <div className="overflow-hidden">
                      <p className="text-xs truncate">{row.name}</p>
                      <p className="text-[10px] text-muted-foreground truncate">{row.department}</p>
                    </div>
                  </div>
                  <span className="text-xs font-extrabold flex-shrink-0">{row.xp} XP</span>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Unlocked Badges Drawer */}
          <Card className="bg-card/30">
            <CardHeader>
              <CardTitle className="text-lg flex items-center">
                <Gift className="w-5 h-5 text-esg-gov mr-2" />
                Unlocked Badges
              </CardTitle>
              <CardDescription>Badges earned across operational activities</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {userBadges.length === 0 ? (
                <div className="text-center py-6 text-xs text-muted-foreground flex flex-col items-center justify-center space-y-1">
                  <Lock className="w-6 h-6 text-muted-foreground/30 mb-1" />
                  <span>No badges unlocked yet. Keep logging!</span>
                </div>
              ) : (
                userBadges.map(eb => (
                  <div key={eb.id} className="p-3 border border-border/40 bg-card rounded-xl flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-esg-gov/10 text-esg-gov border border-esg-gov/20 flex items-center justify-center flex-shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-foreground leading-snug">{eb.badge?.name}</p>
                      <p className="text-[10px] text-muted-foreground mt-0.5">{eb.badge?.description}</p>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Update Progress Modal */}
      <Dialog 
        isOpen={progressModalOpen} 
        onClose={() => setProgressModalOpen(false)} 
        title="Update Challenge Progress"
      >
        <form onSubmit={handleUpdateProgressSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
              Challenge Completion Rate ({sliderProgress}%)
            </label>
            <input 
              type="range" 
              min="0" 
              max="100" 
              value={sliderProgress}
              onChange={(e) => setSliderProgress(Number(e.target.value))}
              className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer accent-primary"
            />
            <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
              <span>0% (Not Started)</span>
              <span>50% (Midway)</span>
              <span>100% (Completed)</span>
            </div>
          </div>

          {sliderProgress === 100 && (
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-1.5">
                Upload Verification Evidence (Proof Image URL)
              </label>
              <input 
                type="url" 
                placeholder="e.g. https://images.unsplash.com/... tracker photo link"
                value={challengeProof}
                onChange={(e) => setChallengeProof(e.target.value)}
                className="w-full bg-muted border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                required
              />
              <p className="text-[10px] text-muted-foreground mt-1">
                This challenge requires compliance verification. Provide a valid proof link to be approved by admins.
              </p>
            </div>
          )}

          <div className="flex justify-end space-x-3 pt-4 border-t border-border/50">
            <button 
              type="button" 
              onClick={() => setProgressModalOpen(false)}
              className="px-4 py-2 border border-border text-muted-foreground text-sm font-semibold rounded-xl hover:bg-muted transition-colors"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={updateProgress.isPending}
              className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors"
            >
              Save Progress
            </button>
          </div>
        </form>
      </Dialog>

      {/* Redeem Store Modal */}
      <Dialog 
        isOpen={redeemModalOpen} 
        onClose={() => setRedeemModalOpen(false)} 
        title="Redeem Reward Voucher"
      >
        <div className="space-y-4">
          {successMsg ? (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl text-xs space-y-2 text-center">
              <CheckCircle className="w-8 h-8 mx-auto animate-bounce" />
              <p className="font-bold">{successMsg}</p>
              <p className="text-muted-foreground">Your voucher is available for collection. Deducted points have been recorded.</p>
              <button 
                onClick={() => setRedeemModalOpen(false)}
                className="mt-3 bg-emerald-500 text-white font-bold px-4 py-2 rounded-xl text-xs"
              >
                Done
              </button>
            </div>
          ) : (
            <>
              <div>
                <h4 className="font-bold text-foreground text-sm">{selectedReward?.name}</h4>
                <p className="text-xs text-muted-foreground mt-1">{selectedReward?.description}</p>
                <div className="mt-4 p-3 bg-muted rounded-xl border border-border/50 text-xs flex justify-between">
                  <span className="text-muted-foreground">Points Cost:</span>
                  <span className="font-bold text-esg-points">{selectedReward?.pointsRequired} Points</span>
                </div>
                <div className="mt-2 p-3 bg-muted rounded-xl border border-border/50 text-xs flex justify-between">
                  <span className="text-muted-foreground">Your Balance:</span>
                  <span className="font-bold text-foreground">{currentPoints} Points</span>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl font-medium">
                  {errorMsg}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-border/50">
                <button 
                  type="button" 
                  onClick={() => setRedeemModalOpen(false)}
                  className="px-4 py-2 border border-border text-muted-foreground text-sm font-semibold rounded-xl hover:bg-muted transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleRedeemConfirm}
                  disabled={redeemReward.isPending}
                  className="px-4 py-2 bg-primary text-primary-foreground text-sm font-semibold rounded-xl hover:bg-primary/90 transition-colors"
                >
                  {redeemReward.isPending ? 'Confirming...' : 'Redeem Voucher'}
                </button>
              </div>
            </>
          )}
        </div>
      </Dialog>
    </div>
  );
};
