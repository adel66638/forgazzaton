import React, { useState, useEffect } from 'react';
import { TonConnectButton, useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { db } from './firebaseConfig';
import { doc, getDoc, setDoc, collection, query, where, onSnapshot, updateDoc, increment } from "firebase/firestore";

// عنوان محفظتك كمسؤول (المستوى 20 مفتوح دائماً)
const ADMIN_WALLET = "UQBufh6lLHE5H1NDJXQwRIVCX-t4iKHyyoXD0Spm8N9navPx"; 

const Portfolio = () => {
    const [tonConnectUI] = useTonConnectUI();
    const userAddress = useTonAddress();
    const [userLevel, setUserLevel] = useState(1);
    const [directCount, setDirectCount] = useState(0);
    const [totalSquad, setTotalSquad] = useState(0);
    const [totalEarnings, setTotalEarnings] = useState(0);
    const [allTeamData, setAllTeamData] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        if (userAddress && userAddress.toLowerCase() === ADMIN_WALLET.toLowerCase()) {
            setIsAdmin(true);
            setUserLevel(20);
        } else {
            setIsAdmin(false);
        }
    }, [userAddress]);

    useEffect(() => {
        if (!userAddress) return;
        const addr = userAddress.toLowerCase();

        const unsubProfile = onSnapshot(doc(db, "users", addr), (snap) => {
            if (snap.exists()) {
                setTotalEarnings(snap.data().totalEarnings || 0);
                if (!isAdmin) setUserLevel(snap.data().level || 1);
            }
        });

        const qTotal = query(collection(db, "users"), where("ancestors", "array-contains", addr));
        const unsubTeam = onSnapshot(qTotal, (snap) => {
            const team = snap.docs.map(d => d.data());
            setAllTeamData(team);
            setTotalSquad(snap.size);
            setDirectCount(team.filter(m => m.referredBy === addr).length);
        });

        return () => { unsubProfile(); unsubTeam(); };
    }, [userAddress, isAdmin]);

    // دالة الترقية للمستخدمين العاديين
    const handleUpgrade = async (nextLevel) => {
        if (!userAddress) return alert("Connect Wallet First!");
        if (isAdmin) return alert("You are Admin - All levels are open!");
        if (nextLevel <= userLevel) return alert("You already unlocked this level!");

        try {
            // سعر افتراضي للترقية (0.5 TON كمثال) - يمكنك تعديله
            const upgradeAmount = "500000000"; 
            
            const tx = {
                validUntil: Math.floor(Date.now() / 1000) + 60,
                messages: [{ address: "YOUR_CONTRACT_ADDRESS", amount: upgradeAmount }]
            };
            
            const result = await tonConnectUI.sendTransaction(tx);
            if (result) {
                await updateDoc(doc(db, "users", userAddress.toLowerCase()), {
                    level: nextLevel
                });
                alert(`Success! Level ${nextLevel} Unlocked.`);
            }
        } catch (e) { console.error("Upgrade failed", e); }
    };

    const getLevelCount = (lvl) => {
        return allTeamData.filter(m => (m.ancestors.length - m.ancestors.indexOf(userAddress.toLowerCase())) === lvl).length;
    };

    return (
        <div style={{ backgroundColor: '#050a1e', minHeight: '100vh', color: 'white', padding: '20px', fontFamily: 'Arial' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}><TonConnectButton /></div>

            {/* بطاقة المستخدم */}
            <div style={{ border: '2px solid #1a2b5a', borderRadius: '20px', padding: '20px', textAlign: 'center', marginBottom: '15px', background: '#0a1633' }}>
                <p style={{ color: '#4a90e2', fontSize: '12px' }}>{isAdmin ? "👑 PROJECT OWNER" : "USER DASHBOARD"}</p>
                <h1 style={{ color: isAdmin ? 'gold' : 'white', margin: '10px 0' }}>
                    #{userAddress ? userAddress.slice(-6).toUpperCase() : "000000"}
                </h1>
                <div style={{ background: '#2b62f1', display: 'inline-block', padding: '5px 15px', borderRadius: '10px', fontSize: '14px' }}>
                    LEVEL {userLevel}
                </div>
            </div>

            {/* الأرباح والفريق */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '10px', marginBottom: '20px' }}>
                <div style={{ border: '1px solid #2b62f1', borderRadius: '15px', padding: '15px', textAlign: 'center', background: '#0a1633' }}>
                    <p style={{ fontSize: '12px', color: '#4a90e2' }}>TOTAL EARNINGS</p>
                    <h2 style={{ color: '#00c853' }}>{totalEarnings.toFixed(2)} TON</h2>
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div style={{ background: '#0a1633', padding: '15px', borderRadius: '15px', textAlign: 'center', border: '1px solid #1a2b5a' }}>
                        <p style={{ fontSize: '10px' }}>DIRECT</p>
                        <h3>{directCount}</h3>
                    </div>
                    <div style={{ background: '#0a1633', padding: '15px', borderRadius: '15px', textAlign: 'center', border: '1px solid #1a2b5a' }}>
                        <p style={{ fontSize: '10px' }}>SQUAD</p>
                        <h3>{totalSquad}</h3>
                    </div>
                </div>
            </div>

            {/* جدول المستويات التفاعلي */}
            <div style={{ background: '#0a1633', borderRadius: '20px', padding: '15px', border: '1px solid #1a2b5a' }}>
                <h3 style={{ textAlign: 'center', marginBottom: '15px', color: '#4a90e2' }}>UPGRADE LEVELS</h3>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                        <tr style={{ color: '#4a90e2', fontSize: '12px' }}>
                            <th style={{ paddingBottom: '10px' }}>LVL</th>
                            <th style={{ paddingBottom: '10px' }}>MEMBERS</th>
                            <th style={{ paddingBottom: '10px' }}>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...Array(20)].map((_, i) => {
                            const lvl = i + 1;
                            const isUnlocked = isAdmin || userLevel >= lvl;
                            return (
                                <tr key={lvl} style={{ borderTop: '1px solid #1a2b5a' }}>
                                    <td style={{ padding: '12px 5px', textAlign: 'center' }}>L{lvl}</td>
                                    <td style={{ textAlign: 'center' }}>{getLevelCount(lvl)}</td>
                                    <td style={{ textAlign: 'center' }}>
                                        <button 
                                            onClick={() => !isUnlocked && handleUpgrade(lvl)}
                                            style={{
                                                background: isUnlocked ? 'rgba(0, 200, 83, 0.1)' : '#2b62f1',
                                                color: isUnlocked ? '#00c853' : 'white',
                                                border: isUnlocked ? '1px solid #00c853' : 'none',
                                                padding: '5px 10px',
                                                borderRadius: '8px',
                                                fontSize: '11px',
                                                cursor: isUnlocked ? 'default' : 'pointer',
                                                width: '80px'
                                            }}>
                                            {isUnlocked ? "UNLOCKED" : "UPGRADE"}
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default Portfolio;
