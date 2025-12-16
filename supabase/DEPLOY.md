# Supabase Edge Functions Deployment Guide

## Prerequisites
1. Install Supabase CLI: `npm install -g supabase`
2. Login: `supabase login`
3. Link project: `supabase link --project-ref tbtnysaxrgfrvguxhzws`

## Deploy Functions

### 1. Telegram Bot Webhook
```bash
supabase functions deploy telegram-bot
```

### 2. Daily Notification (Cron Job)
```bash
supabase functions deploy daily-notification
```

## Set Environment Variables
In Supabase Dashboard → Settings → Edge Functions:
- `TELEGRAM_BOT_TOKEN`: 8565323595:AAFU_38_6FEPrQKEt9dUBHvfYByyT92Knv8

## Setup Telegram Webhook
After deploying, set the webhook URL:
```
https://api.telegram.org/bot8565323595:AAFU_38_6FEPrQKEt9dUBHvfYByyT92Knv8/setWebhook?url=https://tbtnysaxrgfrvguxhzws.supabase.co/functions/v1/telegram-bot
```

## Setup Daily Cron (7 AM WIB = 00:00 UTC)
In Supabase Dashboard → Database → Cron Jobs, add:
```sql
SELECT cron.schedule(
  'daily-balance-notification',
  '0 0 * * *',  -- 00:00 UTC = 07:00 WIB
  $$
  SELECT net.http_post(
    'https://tbtnysaxrgfrvguxhzws.supabase.co/functions/v1/daily-notification',
    '{}',
    '{"Content-Type": "application/json", "Authorization": "Bearer YOUR_SERVICE_ROLE_KEY"}'
  )
  $$
);
```

## Bot Commands
- `/start` - Get Chat ID untuk connect
- `/balance` - Cek saldo
- `/recap` - Rekap bulan ini
- `/help` - Bantuan
