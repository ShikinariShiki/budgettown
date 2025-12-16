import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

// Translations with 10+ varied casual greetings per category
const translations = {
    en: {
        // Navigation
        nav: {
            dashboard: 'Dashboard',
            transactions: 'Transactions',
            analytics: 'Analytics',
            budgets: 'Budgets',
            fixedCosts: 'Fixed Costs',
            spreadsheet: 'Spreadsheet',
            profile: 'Profile',
        },
        // Dashboard
        dashboard: {
            subtitle: "Here's how your money is doing.",
            subtitleNoTx: "Ready to start tracking your finances?",
            subtitleGood: "Your finances are looking healthy!",
            subtitleBad: "Let's work on getting back on track.",
            currentBalance: 'Current Balance',
            availableToSpend: 'Available to spend',
            inTheRed: "You're in the red",
            thisMonth: 'This Month',
            netFlow: 'Net Flow',
            income: 'Income',
            expenses: 'Expenses',
            savings: 'Savings',
            recentTransactions: 'Recent Transactions',
            noTransactions: 'No transactions yet',
            addFirst: 'Add your first transaction to get started!',
            addTransaction: 'Add Transaction',
            upload: 'Upload',
            financialTip: 'Financial Tip',
        },
        // Greetings - 10+ varied and casual per category
        greetings: {
            morning: [
                "Good morning, {name}! ☀️",
                "Rise and shine, {name}!",
                "Morning, {name}! Ready to crush today?",
                "Hey {name}! Fresh start, fresh vibes!",
                "Yo {name}! Let's make today count!",
                "GM {name}! Hope you slept well 😴",
                "Top of the morning, {name}!",
                "Wakey wakey, {name}! Time to check those numbers!",
                "Good morning champion! 💪",
                "Hello {name}! Another day, another opportunity!",
                "Morning sunshine! ☀️ Let's get it, {name}!",
                "Hey there early bird! 🐦",
            ],
            afternoon: [
                "Good afternoon, {name}!",
                "Hey {name}! How's your day going?",
                "Afternoon check-in, {name}! 📊",
                "What's up {name}? Time for a quick look!",
                "Hey hey {name}! Midday money check!",
                "Yo {name}! Taking a break to check finances?",
                "Hi {name}! Halfway through the day!",
                "Good afternoon! Let's see those numbers, {name}!",
                "Hey {name}! Quick finance break? 💰",
                "Sup {name}! How's the wallet doing?",
                "Afternoon, money master! 🎯",
                "Hey there {name}! Lunch break review?",
            ],
            evening: [
                "Good evening, {name}!",
                "Hey {name}! Winding down?",
                "Evening, {name}! How'd the day treat your wallet?",
                "What's up {name}? End of day review time!",
                "Hi {name}! Ready to see today's damage? 😅",
                "Evening vibes, {name}! 🌆",
                "Hey there! Checking in before dinner, {name}?",
                "Good evening! Let's recap the day, {name}!",
                "Yo {name}! Evening money check!",
                "Hey {name}! How'd we do today?",
                "Evening, {name}! Time to count those coins! 🪙",
                "Hi {name}! Quick evening review?",
            ],
            night: [
                "Hey night owl! 🦉",
                "Still up, {name}? Let's check those finances!",
                "Working late, {name}? 🌙",
                "Night mode activated, {name}!",
                "Burning the midnight oil, {name}?",
                "Can't sleep without checking the budget, {name}? 😄",
                "Late night money thoughts, {name}?",
                "Hey {name}! Midnight finance review!",
                "Still going strong, {name}! 💪",
                "Night owl mode: ON 🦉",
                "Hey {name}! Insomnia or just checking finances?",
                "Late night, {name}! Don't forget to sleep!",
            ],
            positive: [
                "You're crushing it, {name}! 🎉",
                "Look at you go, {name}! Money's looking good!",
                "Cha-ching! Your wallet's happy, {name}! 💰",
                "Killing it, {name}! Keep this energy!",
                "Money moves, {name}! You're on fire! 🔥",
                "Flex time, {name}! Those numbers are nice!",
                "Baller status, {name}! 💸",
                "Your future self thanks you, {name}!",
                "Smart money moves, {name}! 🧠",
                "Living the dream, {name}!",
            ],
            negative: [
                "We've all been there, {name}. Let's fix this!",
                "Not the best month, {name}, but we got this!",
                "Time to tighten the belt, {name}! 💪",
                "It's okay {name}, every expert was once a beginner!",
                "Challenge accepted, {name}! Let's turn this around!",
                "Rough patch, {name}, but you'll bounce back!",
                "Let's hustle, {name}! Recovery mode: ON",
                "Every storm runs out of rain, {name}! 🌈",
                "Temporary setback, {name}. Big comeback loading!",
                "Time to regroup, {name}! You got this!",
            ],
            neutral: [
                "Let's see what's up, {name}!",
                "Finance check time, {name}! 📊",
                "Here's the rundown, {name}!",
                "Quick peek at the numbers, {name}!",
                "Money status: Loading... ⏳",
                "Let's dive in, {name}!",
                "Financial snapshot for you, {name}!",
                "Numbers don't lie, {name}! Let's look!",
                "Ready for the truth, {name}? 😅",
                "Here's the tea on your finances, {name}! ☕",
            ],
        },
        // Financial Tips based on situation
        financialTips: {
            highSavings: [
                "You're saving more than 30% of income! Consider investing the excess for compound growth.",
                "Great savings rate! Maybe explore index funds or high-yield savings accounts.",
                "Your saving game is strong! Time to make that money work for you with investments.",
                "Amazing discipline! Consider setting up automatic investment contributions.",
                "With savings this good, you could reach financial independence earlier than you think!",
            ],
            goodSavings: [
                "Solid savings rate! Try the 50/30/20 rule - needs/wants/savings.",
                "You're on the right track! Consider automating your savings.",
                "Nice balance! Think about building a 3-6 month emergency fund.",
                "Good progress! Small increases in savings compound over time.",
            ],
            lowSavings: [
                "Try cutting 10% from your largest expense category this month.",
                "Consider the 48-hour rule before any purchase over Rp100k.",
                "Review subscriptions - you might be paying for things you don't use.",
                "Pack lunch twice a week to save on food expenses.",
                "Small daily savings add up - Rp50k/day = Rp1.5M/month!",
            ],
            highExpenses: [
                "Your expenses are high relative to income. Let's identify areas to cut.",
                "Consider tracking every expense for a week to find spending patterns.",
                "Big expense month! Maybe time for a 'no-spend' week?",
                "Review your fixed costs - can you negotiate any bills lower?",
            ],
            noData: [
                "Add your first transactions to get personalized financial insights!",
                "Start tracking to unlock smart money tips tailored for you!",
                "The journey of a thousand miles begins with a single transaction. Log it!",
            ],
            general: [
                "Pay yourself first - save before you spend!",
                "Every rupiah counts. Track everything!",
                "Financial freedom starts with knowing your numbers.",
                "Budget like you mean it, spend like you planned it.",
                "The best investment is in yourself - keep learning!",
            ],
        },
        // Profile
        profile: {
            title: 'Profile Settings',
            subtitle: 'Manage your account and preferences',
            personalInfo: 'Personal Information',
            displayName: 'Display Name',
            currency: 'Currency',
            language: 'Language',
            financialSettings: 'Financial Settings',
            startingBalance: 'Starting Balance',
            startingBalanceHelp: 'This is your initial balance before any transactions',
            themePreference: 'Theme Preference',
            light: 'Light',
            dark: 'Dark',
            system: 'System',
            saveChanges: 'Save Changes',
            saved: 'Saved!',
        },
        // Fixed Costs
        fixedCosts: {
            title: 'Fixed Monthly Costs',
            subtitle: 'Track your recurring expenses',
            addNew: 'Add Fixed Cost',
            name: 'Name',
            amount: 'Amount',
            category: 'Category',
            dueDate: 'Due Date',
            notes: 'Notes',
            total: 'Total Monthly',
            noItems: 'No fixed costs yet',
            addFirst: 'Add your recurring monthly expenses',
            rent: 'Rent/Mortgage',
            utilities: 'Utilities',
            insurance: 'Insurance',
            subscriptions: 'Subscriptions',
            loans: 'Loans/Debt',
            other: 'Other',
            save: 'Save',
            cancel: 'Cancel',
            delete: 'Delete',
            edit: 'Edit',
        },
        common: {
            save: 'Save',
            cancel: 'Cancel',
            delete: 'Delete',
            edit: 'Edit',
            add: 'Add',
            close: 'Close',
        },
    },
    id: {
        // Navigation
        nav: {
            dashboard: 'Beranda',
            transactions: 'Transaksi',
            analytics: 'Analitik',
            budgets: 'Anggaran',
            fixedCosts: 'Biaya Tetap',
            spreadsheet: 'Spreadsheet',
            profile: 'Profil',
        },
        // Dashboard
        dashboard: {
            subtitle: "Ini kondisi keuangan kamu.",
            subtitleNoTx: "Siap mulai tracking keuangan?",
            subtitleGood: "Keuangan kamu terlihat sehat!",
            subtitleBad: "Yuk perbaiki kondisi keuangan.",
            currentBalance: 'Saldo Saat Ini',
            availableToSpend: 'Tersedia untuk dibelanjakan',
            inTheRed: "Saldo negatif",
            thisMonth: 'Bulan Ini',
            netFlow: 'Arus Bersih',
            income: 'Pemasukan',
            expenses: 'Pengeluaran',
            savings: 'Tabungan',
            recentTransactions: 'Transaksi Terbaru',
            noTransactions: 'Belum ada transaksi',
            addFirst: 'Tambahkan transaksi pertama kamu!',
            addTransaction: 'Tambah Transaksi',
            upload: 'Unggah',
            financialTip: 'Tips Keuangan',
        },
        // Greetings - 10+ varied and casual per category
        greetings: {
            morning: [
                "Selamat pagi, {name}! ☀️",
                "Pagi yang cerah, {name}!",
                "Pagi, {name}! Siap produktif hari ini?",
                "Halo {name}! Semangat pagi!",
                "Met pagi, {name}! Gas produktif! 🔥",
                "Udah bangun, {name}? Cek dompet dulu yuk!",
                "Pagi-pagi cek saldo, {name}? Rajin!",
                "Selamat pagi bos! Gimana tidurnya? 😴",
                "Morning {name}! Hari baru, rejeki baru!",
                "Pagi, {name}! Let's make money moves!",
                "Hei {name}! Bangun tidur langsung cek duit? 😂",
                "Pagi cerah, {name}! Semangat nabung!",
            ],
            afternoon: [
                "Selamat siang, {name}!",
                "Hai {name}! Gimana harinya sejauh ini?",
                "Check-in siang, {name}! 📊",
                "Woi {name}! Udah makan siang belum?",
                "Siang, {name}! Istirahat dulu sambil cek keuangan!",
                "Halo bos! Cek saldo siang, {name}?",
                "Hey {name}! Midday money check!",
                "Siang bolong, {name}! Lagi ngapain?",
                "Assalamualaikum, {name}! Cek dompet yuk!",
                "Siang, {name}! Jangan lupa makan!",
                "Hai {name}! Break sebentar cek finansial!",
                "Woy {name}! Siang-siang mampir nih!",
            ],
            evening: [
                "Selamat sore, {name}!",
                "Sore, {name}! Capek ga hari ini?",
                "Hey {name}! Mau review pengeluaran hari ini?",
                "Sore yang tenang, {name}! 🌆",
                "Hai {name}! Gimana hari ini? Boros ga? 😅",
                "Sore, bos! Saatnya cek damage hari ini!",
                "Woi {name}! Udah sore nih, review yuk!",
                "Selamat sore! Capek-capek cek duit, {name}!",
                "Sore, {name}! Makan sore udah? Jangan skip!",
                "Hey {name}! Sore-sore mampir cek saldo!",
                "Sore, {name}! Pulang kerja langsung cek? Rajin!",
                "Halo {name}! Evening finance review!",
            ],
            night: [
                "Masih melek, {name}? 🦉",
                "Wah begadang, {name}? Cek duit dulu!",
                "Malam, {name}! Belum ngantuk? 🌙",
                "Night owl detected! Hai {name}!",
                "Lembur, {name}? Jangan lupa istirahat!",
                "Malam-malam buka BudgeTown, {name}? Dedication! 💪",
                "Hai {name}! Insomnia atau emang rajin? 😄",
                "Tengah malam, {name}! Cek saldo dulu sebelum tidur!",
                "Woy {name}! Jam segini masih on? Mantap!",
                "Malam, {name}! Jangan tidur terlalu larut ya!",
                "Midnight finance review, {name}? Legend!",
                "Ssst {name}! Malam-malam cek duit! 🤫",
            ],
            positive: [
                "Wah keren, {name}! Cuan terus! 🎉",
                "Gimana rasanya tajir, {name}? 💰",
                "Mantap jiwa, {name}! Dompet tebel!",
                "Kamu the real MVP, {name}! 🏆",
                "Gacor abis, {name}! Rejeki lancar!",
                "Sultan vibes, {name}! 💸",
                "Keuangan on point, {name}! Keep it up!",
                "Wah, {name}! Bisa jadi financial advisor nih!",
                "Saldo cakep, {name}! Treat yourself sesekali! 🎁",
                "Keren banget, {name}! Future millionaire!",
            ],
            negative: [
                "Sabar ya, {name}! Bulan depan pasti lebih baik!",
                "Gapapa {name}, kadang emang gini! Semangat! 💪",
                "Waktunya budget ketat, {name}! Bismillah!",
                "Tenang, {name}! Ini cuma temporary!",
                "Jangan sedih, {name}! Kita perbaiki bareng!",
                "Defisit dikit, {name}. Normal kok!",
                "Yuk {name}, diet finansial bulan ini! 😅",
                "Ganbatte {name}! Pasti bisa balik cuan!",
                "Ini ujian, {name}! Yang kuat ya!",
                "No worries, {name}! We'll bounce back!",
            ],
            neutral: [
                "Cek kondisi, {name}! 📊",
                "Gimana kabar dompet, {name}?",
                "Financial snapshot, {name}!",
                "Lihat-lihat dulu, {name}!",
                "Yuk intip angkanya, {name}!",
                "Ready for the numbers, {name}?",
                "Status keuangan, {name}!",
                "Here we go, {name}!",
                "Check this out, {name}! 👀",
                "Siap-siap, {name}! Angka coming!",
            ],
        },
        // Financial Tips based on situation
        financialTips: {
            highSavings: [
                "Kamu nabung lebih dari 30%! Pertimbangkan investasi untuk passive income.",
                "Tabungan mantap! Coba explore reksa dana atau deposito.",
                "Saving game kuat! Saatnya duit kerja buat kamu.",
                "Disiplin banget! Cobain auto-invest tiap bulan.",
                "Dengan saving rate segini, financial freedom makin dekat!",
            ],
            goodSavings: [
                "Lumayan oke! Coba pakai rumus 50/30/20 - kebutuhan/keinginan/tabungan.",
                "Good progress! Pertimbangkan auto-debit ke tabungan.",
                "Nice! Sekarang fokus bangun dana darurat 3-6 bulan pengeluaran.",
                "Keep it up! Naikin dikit-dikit tabungannya tiap bulan.",
            ],
            lowSavings: [
                "Coba potong 10% dari kategori pengeluaran terbesar bulan ini.",
                "Terapkan aturan 48 jam sebelum beli barang di atas Rp100k.",
                "Review subscription - mungkin ada yang ga kepake tapi masih bayar.",
                "Bawa bekal 2x seminggu bisa hemat banyak loh!",
                "Hemat Rp50k/hari = Rp1,5 juta/bulan. Lumayan kan?",
            ],
            highExpenses: [
                "Pengeluaran tinggi nih! Cari tau mana yang bisa dipotong.",
                "Coba track semua pengeluaran seminggu, pasti ketemu polanya.",
                "Bulan mahal nih! Gimana kalau no-spend week?",
                "Review biaya tetap - bisa nego tagihan ga ya?",
            ],
            noData: [
                "Tambah transaksi pertama untuk dapat tips keuangan personal!",
                "Mulai tracking untuk unlock smart money tips!",
                "Perjalanan finansial dimulai dari satu transaksi. Log sekarang!",
            ],
            general: [
                "Bayar diri sendiri dulu - nabung sebelum belanja!",
                "Setiap rupiah berarti. Track semuanya!",
                "Financial freedom dimulai dari kenal angkamu.",
                "Budget serius, belanja terencana.",
                "Investasi terbaik adalah investasi ilmu - terus belajar!",
            ],
        },
        // Profile
        profile: {
            title: 'Pengaturan Profil',
            subtitle: 'Kelola akun dan preferensi kamu',
            personalInfo: 'Informasi Pribadi',
            displayName: 'Nama Tampilan',
            currency: 'Mata Uang',
            language: 'Bahasa',
            financialSettings: 'Pengaturan Keuangan',
            startingBalance: 'Saldo Awal',
            startingBalanceHelp: 'Ini adalah saldo awal sebelum transaksi apapun',
            themePreference: 'Preferensi Tema',
            light: 'Terang',
            dark: 'Gelap',
            system: 'Sistem',
            saveChanges: 'Simpan Perubahan',
            saved: 'Tersimpan!',
        },
        // Fixed Costs
        fixedCosts: {
            title: 'Biaya Tetap Bulanan',
            subtitle: 'Lacak pengeluaran rutin kamu',
            addNew: 'Tambah Biaya Tetap',
            name: 'Nama',
            amount: 'Jumlah',
            category: 'Kategori',
            dueDate: 'Tanggal Jatuh Tempo',
            notes: 'Catatan',
            total: 'Total Bulanan',
            noItems: 'Belum ada biaya tetap',
            addFirst: 'Tambahkan pengeluaran rutin bulanan kamu',
            rent: 'Sewa/Cicilan Rumah',
            utilities: 'Utilitas',
            insurance: 'Asuransi',
            subscriptions: 'Langganan',
            loans: 'Pinjaman/Hutang',
            other: 'Lainnya',
            save: 'Simpan',
            cancel: 'Batal',
            delete: 'Hapus',
            edit: 'Edit',
        },
        common: {
            save: 'Simpan',
            cancel: 'Batal',
            delete: 'Hapus',
            edit: 'Edit',
            add: 'Tambah',
            close: 'Tutup',
        },
    },
};

export function LanguageProvider({ children }) {
    const [language, setLanguage] = useState(() => {
        const saved = localStorage.getItem('budgetown-language');
        return saved || 'en';
    });

    useEffect(() => {
        localStorage.setItem('budgetown-language', language);
    }, [language]);

    const t = (key) => {
        const keys = key.split('.');
        let value = translations[language];
        for (const k of keys) {
            value = value?.[k];
        }
        return value || key;
    };

    const getGreeting = (firstName, balance, hasTransactions) => {
        const hour = new Date().getHours();
        const greetings = translations[language].greetings;

        // Determine time period
        let period;
        if (hour >= 5 && hour < 12) period = 'morning';
        else if (hour >= 12 && hour < 17) period = 'afternoon';
        else if (hour >= 17 && hour < 21) period = 'evening';
        else period = 'night';

        // 40% chance to use context-aware greeting if has transactions
        const useContextGreeting = Math.random() > 0.6 && hasTransactions;

        let greetingArray;
        if (useContextGreeting) {
            if (balance > 1000000) greetingArray = greetings.positive;
            else if (balance < 0) greetingArray = greetings.negative;
            else greetingArray = greetings.neutral;
        } else {
            greetingArray = greetings[period];
        }

        const greeting = greetingArray[Math.floor(Math.random() * greetingArray.length)];
        return greeting.replace('{name}', firstName);
    };

    const getFinancialTip = (income, expenses, hasTransactions) => {
        const tips = translations[language].financialTips;

        if (!hasTransactions) {
            return tips.noData[Math.floor(Math.random() * tips.noData.length)];
        }

        const savingsRate = income > 0 ? (income - expenses) / income : 0;
        const expenseRatio = income > 0 ? expenses / income : 1;

        let tipArray;
        if (savingsRate > 0.3) {
            tipArray = tips.highSavings;
        } else if (savingsRate > 0.1) {
            tipArray = tips.goodSavings;
        } else if (expenseRatio > 0.9) {
            tipArray = tips.highExpenses;
        } else if (savingsRate < 0.1) {
            tipArray = tips.lowSavings;
        } else {
            tipArray = tips.general;
        }

        return tipArray[Math.floor(Math.random() * tipArray.length)];
    };

    return (
        <LanguageContext.Provider value={{
            language,
            setLanguage,
            t,
            getGreeting,
            getFinancialTip,
            isIndonesian: language === 'id'
        }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider');
    }
    return context;
}
