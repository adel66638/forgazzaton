import React, { useState, useEffect } from 'react';
import { TonConnectButton, useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { db } from './firebaseConfig';
import { doc, getDoc, setDoc, collection, query, where, onSnapshot } from "firebase/firestore";

const Portfolio = () => {
    const [tonConnectUI] = useTonConnectUI();
    const userAddress = useTonAddress();
    const [directCount, setDirectCount] = useState(0);
    const [totalSquad, setTotalSquad] = useState(0);

    // 1. التقاط رابط الإحالة من الـ URL
    useEffect(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const ref = urlParams.get('ref');
        if (ref) {
            localStorage.setItem('pending_referrer', ref.toLowerCase());
        }
    }, []);

    // 2. تحديث العدادات بشكل حي (Real-time) من Firebase
    useEffect(() => {
        if (!userAddress) return;

        const addr = userAddress.toLowerCase();
        const usersRef = collection(db, "users");

        // عد المباشرين (اللون الأخضر)
        const unsubDirect = onSnapshot(query(usersRef, where("referredBy", "==", addr)), (snap) => {
            setDirectCount(snap.size);
        });

        // عد الفريق كاملاً 20 مستوى (اللون الأصفر)
        const unsubTotal = onSnapshot(query(usersRef, where("ancestors", "array-contains", addr)), (snap) => {
            setTotalSquad(snap.size);
        });

        return () => { unsubDirect(); unsubTotal(); };
    }, [userAddress]);

    // 3. دالة التسجيل التي "تُشغل" العداد
    const handleRegister = async () => {
        if (!userAddress) return alert("Connect Wallet First!");

        try {
            // تنفيذ معاملة العقد الذكي
            const transaction = {
                validUntil: Math.floor(Date.now() / 1000) + 60,
                messages: [{
                    address: "EQ........................................", // ضع عنوان عقدك هنا
                    amount: "50000000", // 0.05 TON
                }]
            };

            const result = await tonConnectUI.sendTransaction(transaction);

            if (result) {
                const myAddr = userAddress.toLowerCase();
                const referrerAddr = localStorage.getItem('pending_referrer');
                
                const userRef = doc(db, "users", myAddr);
                const userSnap = await getDoc(userRef);

                // إذا كان مستخدم جديد، نقوم ببناء شجرة الـ 20 مستوى
                if (!userSnap.exists()) {
                    let ancestors = [];
                    if (referrerAddr && referrerAddr !== myAddr) {
                        const refDoc = await getDoc(doc(db, "users", referrerAddr));
                        if (refDoc.exists()) {
                            // دمج أسلاف المحيل مع المحيل نفسه (بحد أقصى 20)
                            ancestors = [...(refDoc.data().ancestors || []), referrerAddr].slice(-20);
                        }
                    }

                    await setDoc(userRef, {
                        address: myAddr,
                        referredBy: referrerAddr || null,
                        ancestors: ancestors,
                        timestamp: new Date()
                    });
                }
            }
        } catch (e) { console.error("Error:", e); }
    };

    return (
        <div style={{ backgroundColor: '#050a1e', minHeight: '100vh', color: 'white', padding: '20px', fontFamily: 'sans-serif' }}>
            
            {/* القائمة العلوية والاتصال */}
            <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '30px' }}>
                <TonConnectButton />
            </div>

            {/* الهوية الرقمية ورابط الإحالة */}
            <div style={{ border: '2px solid #1a2b5a', borderRadius: '20px', padding: '20px', textAlign: 'center', marginBottom: '15px' }}>
                <p style={{ color: '#4a90e2', fontSize: '14px' }}>YOUR DIGITAL ID</p>
                <h1 style={{ fontSize: '32px', fontStyle: 'italic' }}>#{userAddress ? userAddress.slice(-6) : "000000"}</h1>
                
                <div style={{ marginTop: '20px' }}>
                    <p style={{ fontSize: '12px', color: '#888' }}>REFERRAL LINK</p>
                    <div style={{ display: 'flex', backgroundColor: '#0a1633', padding: '10px', borderRadius: '10px', marginTop: '5px' }}>
                        <input 
                            readOnly 
                            value={`https://forgazzaton.vercel.app/?ref=${userAddress || ''}`}
                            style={{ background: 'none', border: 'none', color: '#4a90e2', width: '100%', fontSize: '12px' }}
                        />
                        <button onClick={() => navigator.clipboard.writeText(`https://forgazzaton.vercel.app/?ref=${userAddress}`)} style={{ backgroundColor: '#2b62f1', border: 'none', color: 'white', padding: '5px 15px', borderRadius: '8px', cursor: 'pointer' }}>COPY</button>
                    </div>
                </div>
            </div>

            {/* الإحصائيات (الأرباح والعدادات) */}
            <div style={{ border: '2px solid #2b62f1', borderRadius: '20px', padding: '20px', textAlign: 'center', marginBottom: '15px' }}>
                <p style={{ color: '#888', fontSize: '12px' }}>TOTAL EARNINGS</p>
                <h2 style={{ fontSize: '28px', fontStyle: 'italic' }}>0.00 TON</h2>
            </div>

            <div style={{ border: '2px solid #00c853', borderRadius: '20px', padding: '20px', textAlign: 'center', marginBottom: '15px' }}>
                <p style={{ color: '#888', fontSize: '12px' }}>DIRECT SQUAD</p>
                <h2 style={{ fontSize: '36px', color: '#00c853' }}>{directCount}</h2>
            </div>

            <div style={{ border: '2px solid #ffab00', borderRadius: '20px', padding: '20px', textAlign: 'center', marginBottom: '15px' }}>
                <p style={{ color: '#888', fontSize: '12px' }}>TOTAL SQUAD SIZE</p>
                <h2 style={{ fontSize: '36px', color: '#ffab00' }}>{totalSquad}</h2>
            </div>

            {/* زر التشغيل (لأغراض التجربة) */}
            <button 
                onClick={handleRegister}
                style={{ width: '100%', padding: '15px', borderRadius: '15px', backgroundColor: '#2b62f1', color: 'white', border: 'none', fontWeight: 'bold', fontSize: '18px' }}
            >
                REGISTER NOW
            </button>

        </div>
    );
};

export default Portfolio;
