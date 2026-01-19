import React, { useState, useEffect } from 'react';
import { TonConnectButton, useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { db } from './firebaseConfig';
import { doc, getDoc, setDoc, collection, query, where, onSnapshot, updateDoc, increment } from "firebase/firestore";

const Portfolio = () => {
    const [tonConnectUI] = useTonConnectUI();
    const userAddress = useTonAddress();
    const [directCount, setDirectCount] = useState(0);
    const [totalSquad, setTotalSquad] = useState(0);
    const [totalEarnings, setTotalEarnings] = useState(0);
    const [allTeamData, setAllTeamData] = useState([]);

    // --- التعديل المضاف للتعرف عليك كآدمن ---
    const ADMIN_WALLET = "UQBufh6lLHE5H1NDJXQwRIVCX-t4iKHyyoXD0Spm8N9navPx";

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
        
        // إذا كنت أنت الآدمن، تفعيل فوري بدون دفع
        if (userAddress.toLowerCase() === ADMIN_WALLET.toLowerCase()) {
             const myAddr = userAddress.toLowerCase();
             await setDoc(doc(db, "users", myAddr), {
                address: myAddr, referredBy: null, ancestors: [], totalEarnings: 0, timestamp: new Date(), level: 20
             }, { merge: true });
             alert("Admin Level 20 Activated!");
             return;
        }

        try {
            const tx = {
                validUntil: Math.floor(Date.now() / 1000) + 60,
                messages: [{ address: ADMIN_WALLET, amount: "50000000" }]
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
                        ancestors: ancestors, totalEarnings: 0, timestamp: new Date(), level: 1
                    });
                    if (ancestors.length > 0) await distributeEarnings(ancestors);
                    localStorage.removeItem('pending_referrer');
                }
            }
        } catch (e) { console.error(e); }
    };

    // تحديد المستوى للعرض فقط
    const displayLevel = (userAddress && userAddress.toLowerCase() === ADMIN_WALLET.toLowerCase()) ? 20 : 1;

    return (
        <div style={{ backgroundColor: '#050a1e', minHeight: '100vh', color: 'white', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}><TonConnectButton /></div>

            <div style={{ border: '2px solid #1a2b5a', borderRadius: '20px', padding: '20px', textAlign: 'center', marginBottom: '15px' }}>
                <p style={{ color: '#4a90e2' }}>YOUR DIGITAL ID</p>
                <h1>#{userAddress ? userAddress.slice(-6).toUpperCase() : "000000"}</h1>
                <p style={{color: 'gold'}}>CURRENT LEVEL: {displayLevel}</p>
                <div style={{ display: 'flex', background: '#0a1633', padding: '5px', borderRadius: '10px', marginTop: '10px' }}>
                    <input readOnly value={`https://forgazzaton.vercel.app/?ref=${userAddress}`} style={{ background: 'none', border: 'none', color: '#4a90e2', width: '100%' }} />
                    <button onClick={() => navigator.clipboard.writeText(`https://forgazzaton.vercel.app/?ref=${userAddress}`)} style={{ background: '#2b62f1', color: 'white', border: 'none', padding: '5px 10px', borderRadius: '5px' }}>COPY</button>
                </div>
            </div>

            <button onClick={handleRegister} style={{ width: '100%', margin: '20px 0', padding: '15px', borderRadius: '15px', background: '#2b62f1', border: 'none', color: 'white', fontWeight: 'bold' }}>
                {displayLevel === 20 ? "ADMIN VERIFIED" : "REGISTER / UPGRADE"}
            </button>
        </div>
    );
};

export default Portfolio;
