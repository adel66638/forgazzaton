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
    const [totalEarnings, setTotalEarnings] = useState(0);
    const [allTeamData, setAllTeamData] = useState([]);
    const [isAdmin, setIsAdmin] = useState(false);

    // مصفوفة أسعار المستويات (بالنانو-تون) - هنا جعلت كل مستوى يكلف (المستوى * 1 TON)
    const levelPrices = [0, 1000000000, 2000000000, 3000000000, 4000000000, 5000000000, 6000000000, 7000000000, 8000000000, 9000000000, 10000000000, 11000000000, 12000000000, 13000000000, 14000000000, 15000000000, 16000000000, 17000000000, 18000000000, 19000000000, 20000000000];

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
            setAllTeamData(snap.docs.map(d => d.data()));
        });
        return () => { unsubProfile(); unsubTeam(); };
    }, [userAddress, isAdmin]);

    // --- دالة الترقية التي ستجعل المربع يعمل ---
    const handleUpgrade = async (targetLevel) => {
        if (!userAddress) return alert("Please connect your wallet first!");
        if (isAdmin) return alert("Admin has all levels unlocked!");
        if (targetLevel <= userLevel) return alert("Level already unlocked!");
        if (targetLevel > userLevel + 1) return alert(`You must unlock Level ${userLevel + 1} first!`);

        try {
            const price = levelPrices[targetLevel]; // جلب السعر من المصفوفة
            const tx = {
                validUntil: Math.floor(Date.now() / 1000) + 60,
                messages: [{
                    address: "UQBufh6lLHE5H1NDJXQwRIVCX-t4iKHyyoXD0Spm8N9navPx", // الأموال تذهب لمحفظتك
                    amount: price.toString()
                }]
            };

            const result = await tonConnectUI.sendTransaction(tx);
            if (result) {
                // تحديث قاعدة البيانات بعد نجاح الدفع
                await updateDoc(doc(db, "users", userAddress.toLowerCase()), {
                    level: targetLevel
                });
                alert(`Success! You are now Level ${targetLevel}`);
            }
        } catch (e) {
            console.error(e);
            alert("Transaction failed or cancelled.");
        }
    };

    const getLevelCount = (lvl) => {
        return allTeamData.filter(m => (m.ancestors.length - m.ancestors.indexOf(userAddress.toLowerCase())) === lvl).length;
    };

    return (
        <div style={{ backgroundColor: '#050a1e', minHeight: '100vh', color: 'white', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}><TonConnectButton /></div>

            <div style={{ border: '2px solid #1a2b5a', borderRadius: '20px', padding: '20px', textAlign: 'center', marginBottom: '15px' }}>
                <p style={{ color: '#4a90e2' }}>{isAdmin ? "OWNER MODE" : "USER DASHBOARD"}</p>
                <h1 style={{ color: isAdmin ? 'gold' : 'white' }}>LEVEL {userLevel}</h1>
            </div>

            {/* جدول المستويات التفاعلي */}
            <div style={{ background: '#0a1633', borderRadius: '15px', padding: '15px' }}>
                <h3 style={{textAlign: 'center', color: '#4a90e2'}}>LEVELS STATUS</h3>
                <table style={{ width: '100%', textAlign: 'center' }}>
                    <thead>
                        <tr style={{ color: '#4a90e2', fontSize: '12px' }}>
                            <th>LEVEL</th>
                            <th>MEMBERS</th>
                            <th>ACTION</th>
                        </tr>
                    </thead>
                    <tbody>
                        {[...Array(20)].map((_, i) => {
                            const lvl = i + 1;
                            const isUnlocked = isAdmin || userLevel >= lvl;
                            const isNext = lvl === userLevel + 1;

                            return (
                                <tr key={lvl} style={{ borderTop: '1px solid #1a2b5a' }}>
                                    <td style={{ padding: '10px' }}>L{lvl}</td>
                                    <td>{getLevelCount(lvl)}</td>
                                    <td>
                                        <button 
                                            onClick={() => !isUnlocked && isNext && handleUpgrade(lvl)}
                                            style={{
                                                background: isUnlocked ? '#00c853' : (isNext ? '#2b62f1' : '#333'),
                                                color: 'white',
                                                border: 'none',
                                                padding: '5px 10px',
                                                borderRadius: '5px',
                                                cursor: (isUnlocked || !isNext) ? 'default' : 'pointer',
                                                fontSize: '10px'
                                            }}>
                                            {isUnlocked ? "UNLOCKED" : (isNext ? "UPGRADE" : "LOCKED")}
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
