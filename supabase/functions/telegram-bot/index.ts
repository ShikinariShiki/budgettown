// Supabase Edge Function: Telegram Bot Webhook
// Deploy with: supabase functions deploy telegram-bot

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const TELEGRAM_BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN') || '8565323595:AAFU_38_6FEPrQKEt9dUBHvfYByyT92Knv8'
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || 'https://tbtnysaxrgfrvguxhzws.supabase.co'
const SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY!)

// Send message via Telegram
async function sendTelegramMessage(chatId: string, text: string) {
    const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`
    await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: 'HTML',
        }),
    })
}

// Format currency
function formatCurrency(amount: number): string {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount)
}

// Get user balance
async function getUserBalance(chatId: string) {
    // Find user by telegram_chat_id
    const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('telegram_chat_id', chatId)
        .single()

    if (!profile) return null

    // Get transactions
    const { data: transactions } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', profile.id)

    const balance = (transactions || []).reduce((acc: number, t: any) => {
        return t.type === 'income' ? acc + Number(t.amount) : acc - Number(t.amount)
    }, Number(profile.starting_balance) || 0)

    return { profile, balance, transactions: transactions || [] }
}

// Handle /start command
async function handleStart(chatId: string, username: string) {
    const message = `🎉 <b>Welcome to BudgeTown Bot!</b>

Hi ${username || 'there'}! Ini Chat ID kamu:
<code>${chatId}</code>

Copy Chat ID di atas dan paste di BudgeTown web app untuk connect akun kamu.

<b>Commands:</b>
/balance - Cek saldo
/recap - Rekap bulan ini
/help - Bantuan`

    await sendTelegramMessage(chatId, message)
}

// Handle /balance command
async function handleBalance(chatId: string) {
    const userData = await getUserBalance(chatId)

    if (!userData) {
        await sendTelegramMessage(chatId, '❌ Akun belum terhubung. Masukkan Chat ID ini di BudgeTown web:\n\n<code>' + chatId + '</code>')
        return
    }

    const { profile, balance } = userData
    const emoji = balance >= 0 ? '💰' : '🔴'

    const message = `${emoji} <b>Saldo Kamu</b>

${formatCurrency(balance)}

${balance >= 0 ? '✅ Keep it up!' : '⚠️ Saldo minus, yuk hemat!'}`

    await sendTelegramMessage(chatId, message)
}

// Handle /recap command
async function handleRecap(chatId: string) {
    const userData = await getUserBalance(chatId)

    if (!userData) {
        await sendTelegramMessage(chatId, '❌ Akun belum terhubung.')
        return
    }

    const { profile, balance, transactions } = userData

    // This month's transactions
    const now = new Date()
    const thisMonth = transactions.filter((t: any) => {
        const tDate = new Date(t.date)
        return tDate.getMonth() === now.getMonth() && tDate.getFullYear() === now.getFullYear()
    })

    const income = thisMonth.filter((t: any) => t.type === 'income').reduce((a: number, t: any) => a + Number(t.amount), 0)
    const expenses = thisMonth.filter((t: any) => t.type === 'expense').reduce((a: number, t: any) => a + Number(t.amount), 0)

    const message = `📊 <b>Rekap Bulan Ini</b>

💰 Saldo: ${formatCurrency(balance)}

📈 Pemasukan: ${formatCurrency(income)}
📉 Pengeluaran: ${formatCurrency(expenses)}
${income - expenses >= 0 ? '✅' : '🔴'} Net: ${formatCurrency(income - expenses)}

📝 Total transaksi: ${thisMonth.length}`

    await sendTelegramMessage(chatId, message)
}

// Handle /help command
async function handleHelp(chatId: string) {
    const message = `ℹ️ <b>BudgeTown Bot Help</b>

<b>Commands:</b>
/start - Mulai dan dapatkan Chat ID
/balance - Cek saldo saat ini
/recap - Rekap keuangan bulan ini
/help - Tampilkan bantuan ini

<b>Notifikasi:</b>
Bot akan kirim saldo harian jam 7 pagi jika akun sudah terhubung.

<b>Connect akun:</b>
1. Copy Chat ID dari /start
2. Paste di BudgeTown web → Profile → Telegram`

    await sendTelegramMessage(chatId, message)
}

serve(async (req) => {
    if (req.method !== 'POST') {
        return new Response('OK', { status: 200 })
    }

    try {
        const update = await req.json()
        const message = update.message

        if (!message?.text) {
            return new Response('OK', { status: 200 })
        }

        const chatId = message.chat.id.toString()
        const text = message.text
        const username = message.from?.first_name || message.from?.username

        if (text === '/start') {
            await handleStart(chatId, username)
        } else if (text === '/balance') {
            await handleBalance(chatId)
        } else if (text === '/recap') {
            await handleRecap(chatId)
        } else if (text === '/help') {
            await handleHelp(chatId)
        }

        return new Response('OK', { status: 200 })
    } catch (error) {
        console.error('Error:', error)
        return new Response('Error', { status: 500 })
    }
})
