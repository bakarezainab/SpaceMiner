import { useState, useEffect, useCallback } from 'react'
import { useMiniPay } from './hooks/useMiniPay'
import { 
  Trophy, Users, Calendar, 
  Zap, ShoppingBag, TrendingUp, ChevronRight,
  ShieldCheck, Loader2, Sparkles, RefreshCw, Gem
} from 'lucide-react'
import { CONTRACT_ADDRESS, CELO_SPACE_MINER_ABI, USDM_ADDRESS, USDM_ABI, ACHIEVEMENTS_ADDRESS, ACHIEVEMENTS_ABI } from './constants'
import { parseEther } from 'viem'
import './App.css'

function App() {
  const { 
    address, usdmBalance, isConnecting, 
    connectWallet, walletClient, publicClient, refreshBalance 
  } = useMiniPay()

  const [localScore, setLocalScore] = useState(0)
  const [onChainDust, setOnChainDust] = useState(0)
  const [clicks, setClicks] = useState<{id: number, x: number, y: number}[]>([])
  const [isTxPending, setIsTxPending] = useState(false)
  const [leaderboard, setLeaderboard] = useState<{address: string, dust: number}[]>([])
  const [isLoadingLeaderboard, setIsLoadingLeaderboard] = useState(false)
  const [playerStats, setPlayerStats] = useState<any>(null)
  const [achievements, setAchievements] = useState<string[]>([])
  const [totalPlayers, setTotalPlayers] = useState(0)
  const [ownerAddress, setOwnerAddress] = useState<string | null>(null)
  const [streak, setStreak] = useState(0)
  const [lastClickTime, setLastClickTime] = useState(0)

  // --- DATA FETCHING ---
  const fetchAllData = useCallback(async () => {
    if (!address || CONTRACT_ADDRESS.startsWith("0x0000")) return;
    try {
      // 1. Fetch Player Stats
      const stats = await publicClient.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CELO_SPACE_MINER_ABI,
        functionName: 'players',
        args: [address as `0x${string}`],
      }) as any;
      setPlayerStats(stats);
      setOnChainDust(Number(stats[0]));
      
      // 2. Fetch Achievements
      const hasDustKing = await publicClient.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CELO_SPACE_MINER_ABI,
        functionName: 'hasAchievement',
        args: [address as `0x${string}`, "dust_king"],
      });
      if (hasDustKing) setAchievements(["Dust King"]);

      // 3. Fetch Leaderboard
      setIsLoadingLeaderboard(true);
      const [addrs, scores] = await publicClient.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CELO_SPACE_MINER_ABI,
        functionName: 'getTopMiners',
        args: [BigInt(50)],
      }) as [string[], bigint[]];

      setLeaderboard(addrs.map((addr, i) => ({
        address: addr,
        dust: Number(scores[i])
      })));

      // 4. Fetch Total Players
      const count = await publicClient.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CELO_SPACE_MINER_ABI,
        functionName: 'getPlayerCount',
      }) as bigint;
      setTotalPlayers(Number(count));

      // 5. Fetch Contract Owner
      const owner = await publicClient.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CELO_SPACE_MINER_ABI,
        functionName: 'owner',
      }) as string;
      setOwnerAddress(owner);
    } catch (err) {
      console.error("Fetch Error:", err);
    } finally {
      setIsLoadingLeaderboard(false);
    }
  }, [address, publicClient]);

  useEffect(() => {
    if (address) fetchAllData();
  }, [address, fetchAllData]);

  // --- ACTIONS ---
  const handleMine = (e: React.MouseEvent) => {
    const now = Date.now();
    if (now - lastClickTime < 1000) {
      setStreak(s => s + 1);
    } else {
      setStreak(1);
    }
    setLastClickTime(now);

    setLocalScore(s => s + 1)
    const newClick = { id: Date.now(), x: e.clientX, y: e.clientY };
    setClicks(prev => [...prev, newClick]);
    setTimeout(() => {
      setClicks(prev => prev.filter(c => c.id !== newClick.id));
    }, 800);
  }

  const saveProgress = async () => {
    if (!address || !walletClient || localScore === 0) return;
    try {
      setIsTxPending(true);
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CELO_SPACE_MINER_ABI,
        functionName: 'saveGame',
        args: [BigInt(localScore)],
        account: address as `0x${string}`,
      });
      await publicClient.waitForTransactionReceipt({ hash });
      setLocalScore(0);
      fetchAllData();
    } catch (err: any) {
      alert(`Save failed: ${err.shortMessage || "Check your network"}`);
    } finally {
      setIsTxPending(false);
    }
  }

  const handleCheckIn = async () => {
    if (!address || !walletClient) return;
    try {
      setIsTxPending(true);
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CELO_SPACE_MINER_ABI,
        functionName: 'checkIn',
        account: address as `0x${string}`,
      });
      await publicClient.waitForTransactionReceipt({ hash });
      fetchAllData();
    } catch (err: any) {
      alert(`Already checked in today!`);
    } finally {
      setIsTxPending(false);
    }
  }

  const adminWithdraw = async () => {
    if (!address || !walletClient) return;
    try {
      setIsTxPending(true);
      const hash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CELO_SPACE_MINER_ABI,
        functionName: 'withdrawFunds',
        account: address as `0x${string}`,
      });
      await publicClient.waitForTransactionReceipt({ hash });
      alert("Funds withdrawn successfully!");
      refreshBalance();
    } catch (err: any) {
      alert(`Withdraw failed: ${err.shortMessage || "Check balance"}`);
    } finally {
      setIsTxPending(false);
    }
  }

  const buyUpgrade = async (type: string, usdmCost: string) => {
    if (!address || !walletClient) return;
    try {
      setIsTxPending(true);
      // Approve
      const appHash = await walletClient.writeContract({
        address: USDM_ADDRESS as `0x${string}`,
        abi: USDM_ABI,
        functionName: 'approve',
        args: [CONTRACT_ADDRESS as `0x${string}`, parseEther(usdmCost)],
        account: address as `0x${string}`,
      });
      await publicClient.waitForTransactionReceipt({ hash: appHash });

      // Buy
      const func = type === 'drone' ? 'buyAutoMiner' : 'buyLaserPickaxe';
      const buyHash = await walletClient.writeContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: CELO_SPACE_MINER_ABI,
        functionName: func,
        account: address as `0x${string}`,
      });
      await publicClient.waitForTransactionReceipt({ hash: buyHash });
      refreshBalance();
      fetchAllData();
    } catch (err: any) {
      alert(`Purchase failed: ${err.shortMessage || "Check USDm balance"}`);
    } finally {
      setIsTxPending(false);
    }
  }

  const unlockXAchievement = async () => {
    if (!address || !walletClient) return;
    try {
      setIsTxPending(true);
      // Open Twitter intent
      const text = encodeURIComponent(`I'm mining Cosmic Dust in Space Miner on Celo! 🚀\n\nJoin my fleet and let's conquer the leaderboard together! ✨\n\nPlay here: ${window.location.origin}?ref=${address}`);
      window.open(`https://twitter.com/intent/tweet?text=${text}`, '_blank');

      // 1. Register Player in Achievements contract
      try {
        const regHash = await walletClient.writeContract({
          address: ACHIEVEMENTS_ADDRESS as `0x${string}`,
          abi: ACHIEVEMENTS_ABI,
          functionName: 'registerPlayer',
          account: address as `0x${string}`,
        });
        await publicClient.waitForTransactionReceipt({ hash: regHash });
      } catch (e) {
        // Player might already be registered, continue
      }

      // 2. Unlock Achievement ID 0 (Social Sharer)
      const achHash = await walletClient.writeContract({
        address: ACHIEVEMENTS_ADDRESS as `0x${string}`,
        abi: ACHIEVEMENTS_ABI,
        functionName: 'unlockAchievement',
        args: [BigInt(0)],
        account: address as `0x${string}`,
      });
      await publicClient.waitForTransactionReceipt({ hash: achHash });
      
      setAchievements(prev => [...prev, "Social Sharer"]);
      alert("Achievement Unlocked: Social Sharer!");
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsTxPending(false);
    }
  }

  const formatAddress = (addr: string) => `${addr.slice(0, 6)}...${addr.slice(-4)}`

  return (
    <>
      <div className="stars"></div>
      <div className="twinkling"></div>
      <div className="game-container">
      {/* Top HUD */}
      <header className="hud-top glass-panel">
        <div className="logo-section">
          <Sparkles className="stat-icon" />
          <span style={{fontWeight: 900, fontSize: '1.2rem', marginLeft: '10px'}}>SPACE MINER</span>
        </div>

        <div className="hud-stats">
          <div className="stat-item">
            <div className="stat-content">
              <span className="stat-label">Wallet Balance</span>
              <span className="stat-value">{Number(usdmBalance).toFixed(2)} <small>USDm</small></span>
            </div>
          </div>
          <div className="stat-item">
            <div className="stat-content">
              <span className="stat-label">Cosmic Dust</span>
              <span className="stat-value">{onChainDust + localScore} <small>✨</small></span>
            </div>
          </div>
        </div>

        <div className="wallet-section">
          {address ? (
            <div className="btn-secondary" style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
              <ShieldCheck size={18} color="#4ADE80" />
              <span>{formatAddress(address)}</span>
            </div>
          ) : (
            <button className="btn-primary" onClick={connectWallet} disabled={isConnecting}>
              {isConnecting ? "Connecting..." : "Connect MiniPay"}
            </button>
          )}
        </div>
      </header>

      {/* Main Layout */}
      <main className="main-layout">
        {/* Left Sidebar: Social & Progress */}
        <aside className="sidebar left">
          <div className="sidebar-content glass-panel">
            <h3 className="section-title"><Sparkles size={18} /> Mission Briefing</h3>
            <div className="upgrade-card" style={{flexDirection: 'column', alignItems: 'flex-start', gap: '8px', marginBottom: '20px'}}>
              <p style={{fontSize: '0.8rem', color: 'var(--text-main)', fontWeight: 600}}>1. Tap the Core to gather Dust</p>
              <p style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>2. Save progress to the Celo chain</p>
              <p style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>3. Check-in daily for 10x bonus</p>
              <p style={{fontSize: '0.75rem', color: 'var(--text-muted)'}}>4. Use USDm to buy Auto-Miners</p>
            </div>

            <h3 className="section-title"><Calendar size={18} /> Daily Rewards</h3>
            <button className="btn-secondary" onClick={handleCheckIn} disabled={isTxPending} style={{width: '100%', marginBottom: '20px'}}>
              Claim Daily 10 Dust
            </button>

            <h3 className="section-title"><Users size={18} /> Recruitment</h3>
            <div style={{marginBottom: '20px'}}>
              <div className="card glass-card" style={{padding: '12px', marginBottom: '10px', background: 'rgba(255, 215, 0, 0.05)'}}>
                <div className="flex justify-between items-center">
                  <span style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>Active Recruits:</span>
                  <span style={{fontSize: '1rem', fontWeight: 800, color: 'var(--primary)'}}>{playerStats ? Number(playerStats[4]) : 0}</span>
                </div>
              </div>
              <button className="btn-secondary" style={{width: '100%', marginBottom: '8px'}} onClick={() => {
                navigator.clipboard.writeText(`${window.location.origin}?ref=${address}`);
                alert("Link copied!");
              }}>
                Copy Referral Link
              </button>
              <button 
                className="btn-primary" 
                style={{width: '100%', background: '#000', border: '1px solid #333', color: '#fff'}} 
                onClick={unlockXAchievement}
                disabled={isTxPending}
              >
                {isTxPending ? <Loader2 className="animate-spin" /> : "Share Mission to X"}
              </button>
            </div>

            <h3 className="section-title"><Trophy size={18} /> Achievements</h3>
            <div className="upgrade-list">
              {achievements.length > 0 ? achievements.map(a => (
                <div key={a} className="upgrade-card" style={{borderColor: 'var(--primary)'}}>
                   <div className="upgrade-info">
                    <h4>{a}</h4>
                    <p>On-chain Master</p>
                   </div>
                   <Trophy size={20} color="var(--primary)" />
                </div>
              )) : <p style={{fontSize: '0.8rem', color: 'var(--text-muted)'}}>No achievements yet...</p>}
            </div>
          </div>
        </aside>

        {/* Center: The Crystal */}
        <section className="mining-zone">
          <div className="title-section" style={{textAlign: 'center', marginBottom: '40px'}}>
            <h2 style={{fontSize: '2.5rem', fontWeight: 900}}>CRYSTAL CORE</h2>
            <p style={{color: 'var(--text-muted)'}}>Tap to harvest energy from the cosmos</p>
          </div>

          <div className="crystal-container" onClick={handleMine}>
            <div className="orbital-ring"></div>
            <div className="orbital-ring second"></div>
            <div className="crystal-main">
              <Gem className="crystal-icon" size={140} />
            </div>
            {clicks.map(c => (
              <span key={c.id} className="click-particle" style={{left: c.x, top: c.y}}>+1</span>
            ))}
          </div>

          {streak > 5 && (
            <div className="streak-badge animate-bounce" style={{marginTop: '20px', color: '#ff4500', fontWeight: 900, fontSize: '1.2rem', textShadow: '0 0 10px #ff4500'}}>
              🔥 {streak}x STREAK!
            </div>
          )}

          <div className="tap-label">
            <Zap size={14} className="animate-pulse" />
            <span>TAP TO HARVEST</span>
            <Zap size={14} className="animate-pulse" />
          </div>

          <div style={{marginTop: '20px'}}>
            <button className="btn-primary" style={{padding: '16px 40px'}} onClick={saveProgress} disabled={isTxPending || localScore === 0}>
              {isTxPending ? <Loader2 className="animate-spin" /> : `Save ${localScore} Dust to Chain`}
            </button>
          </div>
        </section>

        {/* Right Sidebar: Leaderboard & Shop */}
        <aside className="sidebar right">
          <div className="sidebar-content glass-panel">
            {/* 🚀 PROJECT GROWTH HUD - NOW GOLD FOR 50+ PLAYERS */}
            <div className="card glass-card stat-card glow-gold animate-pulse" style={{
              marginBottom: '20px', 
              background: 'rgba(255, 215, 0, 0.1)', 
              border: '2px solid #ffd700',
              padding: '20px'
            }}>
              <div className="flex items-center gap-4">
                <div className="p-3 rounded-xl bg-yellow-500/20 text-yellow-400">
                  <Sparkles size={28} />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-yellow-500 uppercase tracking-widest">Global Network</h3>
                  <p className="text-3xl font-black text-white">{totalPlayers} <span style={{fontSize: '1rem', color: '#ffd700'}}>MINERS</span></p>
                </div>
              </div>
            </div>

            <h3 className="section-title">
              <TrendingUp size={18} /> Leaderboard
              <RefreshCw size={14} className={isLoadingLeaderboard ? "animate-spin" : ""} style={{cursor: 'pointer'}} onClick={fetchAllData} />
            </h3>

            {/* 👑 HIDDEN ADMIN CONTROL (Only visible to Owner) */}
            {address?.toLowerCase() === ownerAddress?.toLowerCase() && (
              <div className="card glass-card admin-card glow-gold" style={{marginBottom: '20px', border: '1px solid rgba(255, 215, 0, 0.2)'}}>
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-yellow-500/20 text-yellow-400">
                    <ShieldCheck size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-yellow-400">Admin Control</h3>
                    <p className="text-xs text-gray-400">Owner Access Verified</p>
                  </div>
                </div>
                <button 
                  className="btn-primary" 
                  style={{width: '100%', padding: '10px', background: 'linear-gradient(135deg, #ffd700, #ff8c00)', color: '#000', fontSize: '12px'}}
                  onClick={adminWithdraw}
                  disabled={isTxPending}
                >
                  {isTxPending ? <Loader2 className="animate-spin" /> : "Withdraw All Shop USDm"}
                </button>
              </div>
            )}

            <div className="leaderboard-list" style={{marginBottom: '30px'}}>
              {leaderboard.map((player, i) => (
                <div key={i} className="leaderboard-row">
                  <div className={`rank-badge ${i < 3 ? `rank-${i+1}` : ''}`}>{i + 1}</div>
                  <div style={{flex: 1}}>{formatAddress(player.address)}</div>
                  <div style={{fontWeight: 700}}>{player.dust}</div>
                </div>
              ))}
            </div>

            <h3 className="section-title"><ShoppingBag size={18} /> Upgrade Shop</h3>
            <div className="upgrade-list">
              <div className="upgrade-card">
                <div className="upgrade-info">
                  <h4>Auto-Miner Drone</h4>
                  <p>0.01 USDm • Passive generation</p>
                </div>
                <button className="btn-secondary" onClick={() => buyUpgrade('drone', '0.01')} disabled={isTxPending || (playerStats && playerStats[1])}>
                  {playerStats && playerStats[1] ? "OWNED" : <ChevronRight size={18} />}
                </button>
              </div>


              <div className="upgrade-card">
                <div className="upgrade-info">
                  <h4>Laser Pickaxe</h4>
                  <p>0.05 USDm • 2x Tap power</p>
                </div>
                <button className="btn-secondary" onClick={() => buyUpgrade('laser', '0.05')} disabled={isTxPending || (playerStats && playerStats[2])}>
                   {playerStats && playerStats[2] ? "OWNED" : <ChevronRight size={18} />}
                </button>
              </div>
            </div>
          </div>
        </aside>
      </main>

      {/* Floating Sparkles */}
      <div className="sparkle-overlay" style={{pointerEvents: 'none', position: 'absolute', inset: 0, overflow: 'hidden'}}>
        {/* Ambient animations could go here */}
      </div>
    </div>
    </>
  )
}

export default App
