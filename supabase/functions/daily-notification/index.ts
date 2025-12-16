// Supabase Edge Function: Daily Balance Notification (Cron Job)
// Deploy with: supabase functions deploy daily-notification
// Set secrets: supabase secrets set TELEGRAM_BOT_TOKEN=your_token_here

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

// Get secrets from environment - NEVER hardcode tokens!
const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN')
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

if (!TELEGRAM_BOT_TOKEN) {
    console.error('TELEGRAM_BOT_TOKEN not set!')
}

const supabase = createClient(SUPABASE_URL!, SUPABASE_SERVICE_KEY!)

// Send message via Telegram
async function sendTelegramMessage(chatId: string, text: string) {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
    const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: 'HTML',
        }),
    })
    return response.ok
}

// Format currency
function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount)
}

// Get random morning greeting
function getMorningGreeting(name: string, balance: number): string {
    const positiveGreetings = [
        `☀️ Selamat pagi, ${name}! Saldo kamu hari ini:`,
        `🌅 Good morning ${name}! Here's your balance:`,
        `🌞 Pagi cerah, ${name}! Cek saldo:`,
        `☕ Morning ${name}! Coffee time + money check:`,
    ]

    const negativeGreetings = [
        `☀️ Selamat pagi, ${name}. Saldo perlu perhatian:`,
        `🌅 Morning ${name}. Let's check your balance:`,
        `☕ Pagi ${name}! Yuk lihat kondisi keuangan:`,
    ]

    const greetings = balance >= 0 ? positiveGreetings : negativeGreetings
    return greetings[Math.floor(Math.random() * greetings.length)]
}

serve(async (req) => {
    const authHeader = req.headers.get('Authorization')
    if (!authHeader && req.method !== 'POST') {
        return new Response('Unauthorized', { status: 401 })
    }

    try {
        const { data: profiles, error } = await supabase
            .from('profiles')
            .select('*')
            .not('telegram_chat_id', 'is', null)

        if (error) {
            console.error('Error fetching profiles:', error)
            return new Response(JSON.stringify({ error: error.message }), { status: 500 })
        }

        let sentCount = 0
        let errorCount = 0

        for (const profile of profiles || []) {
            try {
                const { data: transactions } = await supabase
                    .from('transactions')
                    .select('*')
                    .eq('user_id', profile.id)

                const balance = (transactions || []).reduce((acc: number, t: any) => {
                    return t.type === 'income' ? acc + Number(t.amount) : acc - Number(t.amount)
                }, Number(profile.starting_balance) || 0)

                const now = new Date()
                const thisMonth = (transactions || []).filter((t: any) => {
                    const tDate = new Date(t.date)
                    return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear()
                })

                const income = thisMonth.filter((t: any) => t.type === 'income').reduce((a: number, t: any) => a + Number(t.amount), 0)
                const expenses = thisMonth.filter((t: any) => t.type === 'expense').reduce((a: number, t: any) => a + Number(t.amount), 0)

                const name = profile.username?.split(' ')[0] || 'there'
                const greeting = getMorningGreeting(name, balance)
                const emoji = balance >= 0 ? '💰' : '🔴'
                const tip = balance >= 0
                    ? '✨ Keep up the great work!'
                    : '💡 Tip: Coba track semua pengeluaran hari ini!'

                const message = `${greeting}

${emoji} <b>${formatCurrency(balance)}</b>

📊 <b>Bulan ini:</b>
📈 Income: ${formatCurrency(income)}
📉 Expense: ${formatCurrency(expenses)}

${tip}

─────────────
<i>BudgeTown Daily Report</i>`

                const sent = await sendTelegramMessage(profile.telegram_chat_id, message)
                if (sent) sentCount++
                else errorCount++

            } catch (err) {
                console.error(`Error sending to ${profile.id}:`, err)
                errorCount++
            }
        }

        return new Response(JSON.stringify({
            success: true,
            sent: sentCount,
            errors: errorCount,
            total: profiles?.length || 0,
        }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' },
        })

    } catch (error) {
        console.error('Cron error:', error)
        return new Response(JSON.stringify({ error: String(error) }), { status: 500 })
    }
})
