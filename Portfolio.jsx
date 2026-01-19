import React, { useState, useEffect } from 'react';
import { TonConnectButton, useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { db } from './firebaseConfig';
import { doc, getDoc, setDoc, collection, query, where, onSnapshot, updateDoc, increment } from "firebase/firestore";

// --- أضف عنوان محفظتك هنا لفتح كل الصلاحيات ---
const ADMIN_WALLET = "ضع_عنوان_محفظتك_هنا_بالكامل"; 

const Portfolio = () => {
    const [tonConnectUI] = useTonConnectUI();
    const userAddress = useTonAddress();
    const [directCount, setDirectCount] = useState(0);
    const [totalSquad, setTotalSquad] = useState(0);
    const [totalEarnings, setTotalEarnings] = useState(0);
    const [allTeamData, setAllTeamData] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);

    // التحقق من هوية الآدمن
    useEffect(() => {
        if (userAddress && userAddress.toLowerCase() === ADMIN_WALLET.toLowerCase()) {
            setIsAdmin(true);
        } else {
            setIsAdmin(false);
        }
    }, [userAddress]);

    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const ref = urlParams.get('ref');
        if (ref) {
            localStorage.setItem('pending_referrer', ref.toLowerCase());
        }
    }, []);

    useEffect(() => {
        if (!userAddress) return;
        const addr = userAddress.toLowerCase();

        const unsubProfile = onSnapshot(doc(db, "users", addr), (snap) => {
            if (snap.exists()) setTotalEarnings(snap.data().totalEarnings || 0);
        });

        const qTotal = query(collection(db, "users"), where("ancestors", "array-contains", addr));
        const unsubTeam = onSnapshot(qTotal, (snap) => {
            const team = snap.docs.map(d => d.data());
            setAllTeamData(team);
            setTotalSquad(snap.size);
            const directs = team.filter(m => m.referredBy === addr).length;
            setDirectCount(directs);
        });

        return () => { unsubProfile(); unsubTeam(); };
    }, [userAddress]);

    const distributeEarnings = async (ancestorsArray) => {
        const rates = [10, 5, 3, 2, 1, 0.5, 0.5, 0.5, 0.2, 0.2, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1];
        const reversedAncestors = [...ancestorsArray].reverse();

        const updates = reversedAncestors.map((refAddr, index) => {
            if (index >= rates.length) return null;
            return updateDoc(doc(db, "users", refAddr), {
                totalEarnings: increment(rates[index])
            });
        });
        await Promise.all(updates.filter(p => p !== null));
    };

    const handleRegister = async () => {
        if (!userAddress) return alert("Connect Wallet First!");
        if (isAdmin) return alert("You are the Admin - Level 20 is already active!");

        try {
            const tx = {
                validUntil: Math.floor(Date.now() / 1000) + 60,
                messages: [{ address: "YOUR_CONTRACT_ADDRESS", amount: "50000000" }]
            };
            const result = await tonConnectUI.sendTransaction(tx);
            if (result) {
                const myAddr = userAddress.toLowerCase();
                const refAddr = localStorage.getItem('pending_referrer');
                const userRef = doc(db, "users", myAddr);
                const userSnap = await getDoc(userRef);

                if (!userSnap.exists()) {
                    let ancestors = [];
                    if (refAddr && refAddr !== myAddr) {
                        const refDoc = await getDoc(doc(db, "users", refAddr));
                        if (refDoc.exists()) {
                            ancestors = [...(refDoc.data().ancestors || []), refAddr].slice(-20);
                        }
                    }
                    await setDoc(userRef, {
                        address: myAddr, referredBy: refAddr || null,
                        ancestors: ancestors, totalEarnings: 0, timestamp: new Date()
                    });
                    if (ancestors.length > 0) await distributeEarnings(ancestors);
                    localStorage.removeItem('pending_referrer');
                }
            }
        } catch (e) { console.error(e); }
    };

    const getLevelCount = (lvl) => {
        return allTeamData.filter(m => (m.ancestors.length - m.ancestors.indexOf(userAddress.toLowerCase())) === lvl).length;
    };

    return (
        <div style={{ backgroundColor: '#050a1e', minHeight: '100vh', color: 'white', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}><TonConnectButton /></div>

            <div style={{ border: '2px solid #1a2b5a', borderRadius: '20px', padding: '20px', textAlign: 'center', marginBottom: '15px' }}>
                <p style={{ color: '#4a90e2' }}>{isAdmin ? "PROJECT OWNER ID" : "YOUR DIGITAL ID"}</p>
                <h1 style={{ color: isAdmin ? 'gold' : 'white' }}>#{userAddress ? userAddress.slice(-6).toUpperCase() : "000000"}</h1>
                {isAdmin && <span style={{fontSize: '12px', background: 'gold', color: 'black', padding: '2px 8px', borderRadius: '10px'}}>LEVEL 20 UNLOCKED</span>}
                
                <p style={{ fontSize: '10px', marginTop: '10px' }}>REFERRAL LINK</p>
                <div style={{ display: 'flex', background: '#0a1633', padding: '5px', borderRadius: '10px' }}>
                    <input readOnly value={`https://forgazzaton.vercel.app/?ref=${userAddress}`} style={{ background: 'none', border: 'none', color: '#4a90e2', width: '100%' }} />
                    <button onClick={() => navigator.clipboard.writeText(`https://forgazzaton.vercel.app/?ref=${userAddress}`)} style={{ background: '#2b62f1', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px' }}>COPY</button>
                </div>
            </div>

            <div style={{ border: '2px solid #2b62f1', borderRadius: '15px', padding: '15px', textAlign: 'center', marginBottom: '10px' }}>
                <p>TOTAL EARNINGS</p>
                <h2 style={{ color: '#4a90e2' }}>{totalEarnings.toFixed(2)} TON</h2>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div style={{ border: '2px solid #00c853', borderRadius: '15px', padding: '15px', textAlign: 'center' }}>
                    <p style={{ fontSize: '12px' }}>DIRECT SQUAD</p>
                    <h2 style={{ color: '#00c853' }}>{directCount}</h2>
                </div>
                <div style={{ border: '2px solid #ffab00', borderRadius: '15px', padding: '15px', textAlign: 'center' }}>
                    <p style={{ fontSize: '12px' }}>TOTAL SQUAD</p>
                    <h2 style={{ color: '#ffab00' }}>{totalSquad}</h2>
                </div>
            </div>

            <button 
                onClick={handleRegister} 
                style={{ 
                    width: '100%', margin: '20px 0', padding: '15px', borderRadius: '15px', 
                    background: isAdmin ? '#00c853' : '#2b62f1', 
                    border: 'none', color: 'white', fontWeight: 'bold', cursor: isAdmin ? 'default' : 'pointer' 
                }}>
                {isAdmin ? "ADMIN ACCESS VERIFIED" : "REGISTER VIA CONTRACT"}
            </button>

            <div style={{ background: '#0a1633', borderRadius: '15px', padding: '10px' }}>
                <h4 style={{textAlign: 'center', color: '#4a90e2'}}>LEVELS BREAKDOWN</h4>
                <table style={{ width: '100%', textAlign: 'center', fontSize: '12px' }}>
                    <thead><tr style={{ color: '#4a90e2' }}><th>LEVEL</th><th>MEMBERS</th><th>BONUS</th></tr></thead>
                    <tbody>
                        {[...Array(20)].map((_, i) => {
                            const lvl = i + 1;
                            const rates = [10, 5, 3, 2, 1, 0.5, 0.5, 0.5, 0.2, 0.2, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1, 0.1];
                            return (
                                <tr key={lvl} style={{ borderTop: '1px solid #1a2b5a' }}>
                                    <td style={{ padding: '8px', color: isAdmin ? 'gold' : 'white' }}>L{lvl}</td>
                                    <td>{getLevelCount(lvl)}</td>
                                    <td>{rates[i]}%</td>
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
