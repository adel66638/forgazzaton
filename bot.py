import asyncio
import os
import time
from TonTools import Wallet, TonCenterClient

# --- ضع عنوان محفظتك الشخصية بين علامتي التنصيص بالأسفل ---
MY_WALLET = "UQCynb1kgftPUU-52BHZZMSKZu-TgXaPgjqXVVNOXqX0Fcau"

BOT_SEED = os.getenv('BOT_SEED') 
API_KEY = os.getenv('TON_API_KEY') 

client = TonCenterClient(base_url='https://toncenter.com/api/v2/', api_key=API_KEY)
wallet = Wallet(provider=client, mnemonics=BOT_SEED)

PRICES = {1: 1, 2: 2, 3: 4, 4: 8, 5: 10, 6: 12, 7: 21, 8: 24, 9: 30, 10: 40}

async def distribute():
    try:
        txs = await wallet.get_transactions(limit=5)
        for tx in txs:
            if tx.type == 'in':
                try:
                    level = int(tx.message.strip())
                    if level == 1 and tx.amount >= 1:
                        await wallet.transfer(destination=MY_WALLET, amount=0.8)
                        await wallet.transfer(destination=tx.sender, amount=0.2)
                except: continue
    except Exception as e: print(f"Error: {e}")

if __name__ == "__main__":
    # تشغيل وفحص لمدة 4 دقائق ونصف
    for _ in range(18):
        asyncio.run(distribute())
        time.sleep(15)
