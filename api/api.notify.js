export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Method not allowed' });
    }

    const { level, amount, wallet, instruction } = req.body;

    // جلب البيانات من إعدادات Vercel التي أضفتها يدوياً
    const botToken = process.env.TELEGRAM_TOKEN;
    const chatId = process.env.ADMIN_ID;

    const message = `⚠️ *طلب ترقية مستوى جديد*\n\n` +
                    `▫️ المستوى: ${level}\n` +
                    `▫️ المبلغ المدفوع: ${amount} TON\n` +
                    `▫️ محفظة المستلم: \`${wallet}\`\n\n` +
                    `✅ *المطلوب منك:* ${instruction}`;

    try {
        const telegramUrl = `https://api.telegram.org/bot${botToken}/sendMessage`;
        await fetch(telegramUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: chatId,
                text: message,
                parse_mode: 'Markdown'
            })
        });

        return res.status(200).json({ success: true });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}
