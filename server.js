require('dotenv').config();
const express = require('express');
const axios = require('axios');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(express.json());

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const PORT = process.env.PORT || 3000;
const WHATSAPP_TOKEN = process.env.WHATSAPP_TOKEN;
const PHONE_NUMBER_ID = process.env.PHONE_NUMBER_ID;
const WEBHOOK_VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN;

const userSessions = {};

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
    // 🚀 ম্যাজিক ট্রিক: মেটাকে প্রথমেই বলে দেওয়া যে মেসেজ রিসিভ হয়েছে, যাতে সে আর ডিস্টার্ব বা টাইমআউট না করে!
    res.sendStatus(200);

    const body = req.body;

    // মেসেজ কি না তা চেক করা
    if (body.object && body.entry && body.entry[0].changes && body.entry[0].changes[0].value.messages && body.entry[0].changes[0].value.messages[0]) {
            
        const message = body.entry[0].changes[0].value.messages[0];
        const senderPhone = message.from; 
            
        if (message.type === 'text') {
            const customerMessage = message.text.body;
            console.log(`\n[+] কাস্টমার বলেছে: ${customerMessage}`);

            if (!userSessions[senderPhone]) {
                userSessions[senderPhone] = [];
            }
            userSessions[senderPhone].push(`Customer: ${customerMessage}`);

            if (userSessions[senderPhone].length > 10) {
                userSessions[senderPhone].shift();
            }

            const chatHistory = userSessions[senderPhone].join('\n');

            try {
                const strictPrompt = `ROLE: তুমি হলে "Developments & Technologies" এর স্বত্বাধিকারী জনাব অশোক সোনালীর অত্যন্ত স্মার্ট, মানবিক এবং প্রফেশনাল পার্সোনাল অ্যাসিস্ট্যান্ট। 

RULES:
১. মেমোরি চেক করো: নিচে 'CONVERSATION HISTORY' তে দেখো কাস্টমারের সাথে আগে কী কথা হয়েছে। আগের কথার রেশ ধরে মানুষের মতো উত্তর দাও।
২. সালাম ও স্বাগতম: হিস্ট্রিতে যদি আগে সালাম দিয়ে থাকো, তবে নতুন করে আর দেবে না।
৩. মানবিক আচরণ: তুমি কোনো রোবট নও। কেউ কেমন আছেন জিজ্ঞেস করলে মানুষের মতো উত্তর দেবে।
৪. বসের কাছে মেসেজ দেওয়া: কেউ বসকে কল দিতে বললে বলবে, "জি অবশ্যই, আমি স্যারকে জানিয়ে রাখছি। তবে জরুরি প্রয়োজনে আপনি আমাদের হেল্পলাইন 01633334466 নম্বরে কল করতে পারেন।"
৫. খুব ছোট, মিষ্টি এবং টু-দ্য-পয়েন্ট উত্তর দেবে।

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

CONVERSATION HISTORY:
${chatHistory}

YOUR REPLY (শুধুমাত্র তোমার উত্তরটুকু দাও):`;

                const result = await model.generateContent(strictPrompt);
                const aiReply = result.response.text();
                
                userSessions[senderPhone].push(`Assistant: ${aiReply}`);
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
});

app.listen(PORT, () => {
    console.log(`\n🚀 সার্ভার চালু হয়েছে! বটের মেমোরি (Brain 4.1 - Anti-Timeout) লোড হয়েছে!`);
});
