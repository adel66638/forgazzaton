import React, { useState, useEffect } from 'react';
import { TonConnectButton, useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { db } from './firebaseConfig';
import { doc, getDoc, setDoc, collection, query, where, onSnapshot, updateDoc, increment } from "firebase/firestore";

// عنوان محفظتك (تأكد من نسخه كما هو)
const ADMIN_WALLET = "UQBufh6lLHE5H1NDJXQwRIVCX-t4iKHyyoXD0Spm8N9navPx"; 

const Portfolio = () => {
    const [tonConnectUI] = useTonConnectUI();
    const userAddress = useTonAddress();
    const [userLevel, setUserLevel] = useState(1);
    const [totalEarnings, setTotalEarnings] = useState(0);
    const [allTeamData, setAllTeamData] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);

    // 1. التحقق من المستوى والآدمن
    useEffect(() => {
        if (!userAddress) return;
        const addr = userAddress.toLowerCase();
        
        if (addr === ADMIN_WALLET.toLowerCase()) {
            setIsAdmin(true);
            setUserLevel(20);
        } else {
            setIsAdmin(false);
            const unsub = onSnapshot(doc(db, "users", addr), (snap) => {
                if (snap.exists()) setUserLevel(snap.data().level || 1);
            });
            return () => unsub();
        }
    }, [userAddress]);

    // 2. مراقبة الفريق والأرباح
    useEffect(() => {
        if (!userAddress) return;
        const addr = userAddress.toLowerCase();
        const qTotal = query(collection(db, "users"), where("ancestors", "array-contains", addr));
        const unsubTeam = onSnapshot(qTotal, (snap) => {
            setAllTeamData(snap.docs.map(d => d.data()));
        });
        return () => unsubTeam();
    }, [userAddress]);

    // 3. دالة الترقية (هذا ما سيجعل المربعات تعمل)
    const handleUpgrade = async (lvl) => {
        if (!userAddress) return alert("Connect Wallet!");
        if (isAdmin) return alert("Admin Access");
        
        try {
            const amount = "500000000"; // 0.5 TON
            const tx = {
                validUntil: Math.floor(Date.now() / 1000) + 60,
                messages: [{ address: ADMIN_WALLET, amount: amount }]
            };
            const result = await tonConnectUI.sendTransaction(tx);
            if (result) {
                await updateDoc(doc(db, "users", userAddress.toLowerCase()), { level: lvl });
                alert("Success!");
            }
        } catch (e) { console.error(e); }
    };

    const getLevelCount = (lvl) => {
        return allTeamData.filter(m => (m.ancestors.length - m.ancestors.indexOf(userAddress.toLowerCase())) === lvl).length;
    };

    return (
        <div style={{ backgroundColor: '#050a1e', minHeight: '100vh', color: 'white', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}><TonConnectButton /></div>

            {/* بطاقة تعريفية */}
            <div style={{ border: '2px solid #2b62f1', borderRadius: '20px', padding: '20px', textAlign: 'center', background: '#0a1633' }}>
                <p style={{ color: '#4a90e2' }}>{isAdmin ? "⭐ OWNER MODE" : "MY STATUS"}</p>
                <h1 style={{ color: isAdmin ? 'gold' : 'white' }}>LEVEL {userLevel}</h1>
                <p style={{fontSize: '10px'}}>{userAddress}</p>
            </div>

            {/* شبكة المستويات التفاعلية */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px', marginTop: '20px' }}>
                {[...Array(20)].map((_, i) => {
                    const l = i + 1;
                    const isUnlocked = isAdmin || userLevel >= l;
                    const isNext = l === userLevel + 1;
                    
                    return (
                        <div 
                            key={l}
                            onClick={() => !isUnlocked && isNext && handleUpgrade(l)}
                            style={{
                                padding: '15px 5px',
                                background: isUnlocked ? '#00c853' : (isNext ? '#2b62f1' : '#1a2b5a'),
                                borderRadius: '12px',
                                textAlign: 'center',
                                fontSize: '12px',
                                cursor: isNext ? 'pointer' : 'default',
                                border: isUnlocked ? '1px solid gold' : 'none',
                                opacity: (isUnlocked || isNext) ? 1 : 0.4
                            }}
                        >
                            L{l}<br/>
                            {isUnlocked ? "✅" : (isNext ? "🛒" : "🔒")}
                            <div style={{fontSize: '8px', marginTop: '4px'}}>{getLevelCount(l)}</div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Portfolio;
