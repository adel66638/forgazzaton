import React, { useState, useEffect } from 'react';
import { TonConnectButton, useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { db } from './firebaseConfig';
import { doc, getDoc, setDoc, collection, query, where, onSnapshot, updateDoc, increment } from "firebase/firestore";

// عنوان محفظتك الشخصية
const ADMIN_WALLET = "UQBufh6lLHE5H1NDJXQwRIVCX-t4iKHyyoXD0Spm8N9navPx"; 

const Portfolio = () => {
    const [tonConnectUI] = useTonConnectUI();
    const userAddress = useTonAddress();
    const [userLevel, setUserLevel] = useState(1);
    const [isAdmin, setIsAdmin] = useState(false);

    // 1. منطق تحديد المستوى والآدمن
    useEffect(() => {
        if (!userAddress) return;
        
        const addr = userAddress.toLowerCase();
        
        // إذا كان المتصل هو أنت
        if (addr === ADMIN_WALLET.toLowerCase()) {
            setIsAdmin(true);
            setUserLevel(20); // تفعيل المستوى 20 لك فوراً
        } else {
            setIsAdmin(false);
            // جلب مستوى المستخدم العادي من Firebase
            const unsub = onSnapshot(doc(db, "users", addr), (snap) => {
                if (snap.exists()) {
                    setUserLevel(snap.data().level || 1);
                }
            });
            return () => unsub();
        }
    }, [userAddress]);

    // 2. دالة الترقية (التي تجعل المربعات تعمل)
    const handleUpgrade = async (lvl) => {
        if (!userAddress) return alert("Please connect wallet!");
        if (isAdmin) return alert("Admin unlocked all levels!");
        
        try {
            // سعر تجريبي (يمكنك تعديله لاحقاً)
            const amount = "500000000"; // 0.5 TON
            const tx = {
                validUntil: Math.floor(Date.now() / 1000) + 60,
                messages: [{ address: ADMIN_WALLET, amount: amount }]
            };
            
            const result = await tonConnectUI.sendTransaction(tx);
            if (result) {
                // تحديث المستوى في Firebase بعد الدفع
                await updateDoc(doc(db, "users", userAddress.toLowerCase()), {
                    level: lvl
                });
                alert("Level Upgraded Successfully!");
            }
        } catch (e) {
            console.error(e);
        }
    };

    return (
        <div style={{ backgroundColor: '#050a1e', minHeight: '100vh', color: 'white', padding: '20px' }}>
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
                <TonConnectButton />
            </div>

            {/* عرض المستوى الحالي بطريقة واضحة */}
            <div style={{ textAlign: 'center', padding: '20px', background: '#0a1633', borderRadius: '15px', border: '1px solid #2b62f1' }}>
                <h2 style={{ color: isAdmin ? 'gold' : 'white' }}>
                    {isAdmin ? "MASTER ADMIN" : `CURRENT LEVEL: ${userLevel}`}
                </h2>
            </div>

            <h3 style={{ marginTop: '30px', textAlign: 'center' }}>CHOOSE YOUR LEVEL</h3>
            
            {/* شبكة المستويات (Grid) - تأكد أن هذا الجزء تم تحديثه */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '15px', marginTop: '20px' }}>
                {[...Array(20)].map((_, i) => {
                    const lvl = i + 1;
                    const isUnlocked = isAdmin || userLevel >= lvl;
                    const isNext = lvl === userLevel + 1;

                    return (
                        <div 
                            key={lvl}
                            onClick={() => !isUnlocked && isNext && handleUpgrade(lvl)}
                            style={{
                                padding: '20px',
                                borderRadius: '12px',
                                textAlign: 'center',
                                background: isUnlocked ? 'linear-gradient(45deg, #00c853, #b2ff59)' : (isNext ? '#2b62f1' : '#1a2b5a'),
                                cursor: (isNext && !isUnlocked) ? 'pointer' : 'default',
                                opacity: isUnlocked || isNext ? 1 : 0.5,
                                border: isUnlocked ? '2px solid gold' : 'none',
                                position: 'relative'
                            }}
                        >
                            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>L{lvl}</div>
                            <div style={{ fontSize: '10px' }}>{isUnlocked ? "ACTIVE" : (isNext ? "UPGRADE" : "LOCKED")}</div>
                            {isUnlocked && <span style={{ position: 'absolute', top: '5px', right: '5px' }}>✅</span>}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default Portfolio;
