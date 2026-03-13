require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// systemInstruction বাদ দিয়ে রেগুলার মডেলেই কড়া প্রম্পট দেব
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const PORT = process.env.PORT || 3000;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const WEBHOOK_VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

app.get('/webhook', (req, res) => {
    const mode = req.query['hub.mode'];
    const token = req.query['hub.verify_token'];
    const challenge = req.query['hub.challenge'];

    if (mode === 'subscribe' && token === WEBHOOK_VERIFY_TOKEN) {
        res.status(200).send(challenge);
    } else {
        res.sendStatus(403);
    }
});

app.post('/webhook', async (req, res) => {
    const body = req.body;

    if (body.object && body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages && body.entry[0].changes[0].value.messages[0]) {
            
        const message = body.entry[0].changes[0].value.messages[0];
        const senderPhone = message.from; 
            
        if (message.type === 'text') {
            const customerMessage = message.text.body;
            console.log(`\n[+] কাস্টমার বলেছে: ${customerMessage}`);

            try {
                // বটের পালানোর সব রাস্তা বন্ধ করে ডাইরেক্ট প্রম্পট
                const strictPrompt = `ROLE: তুমি BDT কোম্পানির AI বট। 
RULES: 
1. উত্তরের শুরুতে অবশ্যই "আস সালামু আলাইকুম" বলতে হবে। 
2. "সম্মানিত গ্রাহক", "ধন্যবাদান্তে", "আমাদের প্রতিনিধি কল করবে" বা কোনো ব্র্যাকেট [লিংক] - এসব বলা সম্পূর্ণ নিষেধ। 
3. কাস্টমার যা জানতে চেয়েছে, সরাসরি নিচের তথ্য থেকে উত্তর দেবে। কোনো ভূমিকা করবে না।

INFO:
- bdtpos (POS & Inventory): বারকোড স্ক্যানিং, এক্সপেন্স ট্র্যাকিং, সাপ্লায়ার বকেয়া, ওয়েস্টেজ হিসাব। এটি সম্পূর্ণ অটোমেটেড।
- bdtpos দাম: ফ্রি প্যাকেজ (শুধু মাসিক চার্জ)। মাল্টিস্টোর ১০০০০ টাকা + মাসিক চার্জ।
- bdtestate (Real Estate): ক্লায়েন্ট ডিপোজিট, খরচ, অডিট, মানি রিসিট। এক ক্লিকে কয়েক শ নোটিশ ও লিডস বিজ্ঞাপন সেন্ড । দাম ৩৯৯০০ টাকা।
- real estate প্রজেক্ট: ৩টি চলমান। 
১ম প্রজেক্ট - নাম- পদ্মা রেসিডেন্স । প্রজেক্টির দক্ষিনে ৫০ ফিট ও পশ্চিমে ৩০ ফিট রাস্তা বিদ্যমান।  ৬ কাঠা জমির উপর b+g+9 বিল্ডিং তৈরি হবে। প্রতি ফ্লোরে ৩টি করে ফ্ল্যাট থাকবে। ফ্ল্যাটের সাইজ ১২৫০+- স্কয়ার ফিট । টোটাল ২৭ টি ফ্ল্যাট হবে । সব ফ্ল্যাট দক্ষিন মুখি । লটারির মাধ্যমে ফ্ল্যাট বন্টন করা হবে।  একটি ফ্ল্যাটের শেয়ার বিক্রি হবে। শেয়ার মুল্য ১৩ লক্ষ টাকা। পারকিং মুল্য আলাদা ভাবে পরিশোধ যোগ্য । পারকিং এর জন্য ৩ লক্ষ টাকা । রেজিস্ট্রেশনের জন্য শেয়ার মুল্য + কন্সট্রাকশন খরচ পরিশোধ করতে হবে।   
২য় প্রজেক্ট - নাম- Green Oassis by Bdt . এটি ও ৬ কাঠার উপর প্রতি ফ্লোরে ৩ টি করে ২৭ টি ফ্ল্যাট নিরমান করা হবে । প্রতিটি ফ্ল্যাটের সাইজ হবে ১২৫০ +- স্কয়ার ফিট । প্রজেক্ট টি দক্ষিন মুখি । এর দক্ষিনে ২৫ ফিট রাস্তা আছে । এই প্রজেক্ট টে ৪ টি ফ্ল্যাট শেয়ার বিক্রি হবে।
৩য় প্রজেক্ট - নাম - Flora garder .  এই প্রজেক্ট এ ৫ কাঠার উপর প্রতি ফ্লোরে ২ টি করে ১৮ টি ফ্ল্যাট নিরমান করা হবে । প্রতি ফ্ল্যাটের সাইজ ১৫০০+- স্কয়ার ফিট হবে । চমৎকার সাইজের এই ফ্ল্যাত গুলিতে আলো ও বাতাসের পর্যাপ্ত সমারোহ থাকবে ।
আমরা ইন্টেরিয়র ডিজাইনের কাজও করি।
- হেল্পলাইন: 01633334466.

CUSTOMER MESSAGE: "${customerMessage}"
YOUR REPLY (সালাম দিয়ে শুরু করো এবং সরাসরি উত্তর দাও):`; 

                const result = await model.generateContent(strictPrompt);
                const aiReply = result.response.text();
                    
                console.log(`🤖 বটের উত্তর: ${aiReply}`);

                await axios({
                    method: 'POST',
                    url: `https://graph.facebook.com/v18.0/${PHONE_NUMBER_ID}/messages`,
                    headers: {
                        Authorization: `Bearer ${WHATSAPP_TOKEN}`,
                        'Content-Type': 'application/json',
                    },
                    data: {
                        messaging_product: 'whatsapp',
                        to: senderPhone,
                        type: 'text',
                        text: { body: aiReply },
                    },
                });

            } catch (error) {
                console.error('AI Error:', error.message);
            }
        }
    }
    res.sendStatus(200);
});

app.listen(PORT, () => {
    console.log(`\n=========================================`);
    console.log(`🚀 সার্ভার চালু হয়েছে পোর্ট: ${PORT} তে!`);
    console.log(`✅ বটের নতুন মগজ (Brain 2.0) সফলভাবে লোড হয়েছে!`);
    console.log(`=========================================\n`);
});