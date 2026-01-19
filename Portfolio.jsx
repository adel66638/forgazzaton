// تأكد من مسح كل شيء في Portfolio.jsx ووضع هذا مكانه
import React, { useState, useEffect } from 'react';
import { TonConnectButton, useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';

const ADMIN_WALLET = "UQBufh6lLHE5H1NDJXQwRIVCX-t4iKHyyoXD0Spm8N9navPx"; 

const Portfolio = () => {
    const [tonConnectUI] = useTonConnectUI();
    const userAddress = useTonAddress();
    const [userLevel, setUserLevel] = useState(1);

    useEffect(() => {
        if (userAddress && userAddress.toLowerCase() === ADMIN_WALLET.toLowerCase()) {
            setUserLevel(20);
        }
    }, [userAddress]);

    const buyLevel = async (n) => {
        try {
            const tx = {
                validUntil: Math.floor(Date.now() / 1000) + 60,
                messages: [{ address: ADMIN_WALLET, amount: "500000000" }]
            };
            await tonConnectUI.sendTransaction(tx);
            alert("تم إرسال الطلب!");
        } catch (e) { alert("خطأ في الاتصال بالمحفظة"); }
    };

    return (
        <div style={{ padding: '20px', background: '#050a1e', color: 'white', minHeight: '100vh' }}>
            <center><TonConnectButton /></center>
            <h1 style={{textAlign:'center'}}>TEST VERSION 1.1</h1>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                {[...Array(20)].map((_, i) => {
                    const l = i + 1;
                    const active = userLevel >= l;
                    return (
                        <button 
                            key={l}
                            onClick={() => !active && buyLevel(l)}
                            style={{
                                padding: '15px',
                                background: active ? '#00c853' : '#2b62f1',
                                color: 'white',
                                border: 'none',
                                borderRadius: '10px',
                                fontSize: '16px',
                                fontWeight: 'bold'
                            }}
                        >
                            Level {l} {active ? "✅" : "🛒"}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};
export default Portfolio;
