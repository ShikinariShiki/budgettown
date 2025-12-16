import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

// Translations
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
        },
        // Greetings - varied and creative
        greetings: {
            morning: [
                "Good morning, {name}!",
                "Rise and shine, {name}! ☀️",
                "New day, new opportunities, {name}!",
                "Morning, {name}! Ready to crush your goals?",
                "Hello sunshine! Let's make today count, {name}.",
                "Early bird gets the worm, {name}! 🐦",
            ],
            afternoon: [
                "Good afternoon, {name}!",
                "Hey there, {name}! How's the day going?",
                "Afternoon check-in, {name}! 📊",
                "Hope you're having a productive day, {name}!",
                "Halfway through the day, {name}! Keep it up!",
                "Hi {name}! Let's review those numbers.",
            ],
            evening: [
                "Good evening, {name}!",
                "Evening, {name}! Time for a quick review?",
                "Winding down, {name}? Let's check your progress.",
                "Hey {name}! How did your finances do today?",
                "Evening vibes, {name}! 🌆",
            ],
            night: [
                "Working late, {name}? 🦉",
                "Night owl mode activated, {name}!",
                "Burning the midnight oil, {name}?",
                "Still going strong, {name}!",
                "Late night finance review, {name}? 🌙",
            ],
            // Context-aware greetings
            positive: [
                "You're doing amazing, {name}! 🎉",
                "Your wallet is happy, {name}! 💚",
                "Saving goals on track, {name}!",
                "Keep up the great work, {name}!",
            ],
            negative: [
                "Let's turn things around, {name}!",
                "Every step counts, {name}. You got this!",
                "Time to review spending, {name}.",
            ],
            neutral: [
                "Let's check your finances, {name}!",
                "Here's your financial snapshot, {name}.",
                "Ready for a quick overview, {name}?",
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
        },
        // Greetings - varied and creative
        greetings: {
            morning: [
                "Selamat pagi, {name}!",
                "Pagi yang cerah, {name}! ☀️",
                "Hari baru, semangat baru, {name}!",
                "Pagi, {name}! Siap capai target?",
                "Halo {name}! Semangat pagi!",
                "Met pagi, {name}! 🐦",
            ],
            afternoon: [
                "Selamat siang, {name}!",
                "Hai {name}! Gimana harinya?",
                "Check-in siang, {name}! 📊",
                "Semoga hari produktif, {name}!",
                "Sudah setengah hari, {name}! Lanjutkan!",
                "Halo {name}! Yuk cek angkanya.",
            ],
            evening: [
                "Selamat sore, {name}!",
                "Sore, {name}! Mau review singkat?",
                "Sudah sore, {name}. Cek progress yuk!",
                "Hai {name}! Gimana keuangan hari ini?",
                "Sore yang tenang, {name}! 🌆",
            ],
            night: [
                "Masih kerja, {name}? 🦉",
                "Mode begadang aktif, {name}!",
                "Lembur ya, {name}?",
                "Masih semangat, {name}!",
                "Review keuangan malam, {name}? 🌙",
            ],
            positive: [
                "Kamu hebat, {name}! 🎉",
                "Dompet lagi happy, {name}! 💚",
                "Target tabungan on track, {name}!",
                "Pertahankan, {name}!",
            ],
            negative: [
                "Yuk perbaiki bareng, {name}!",
                "Setiap langkah berarti, {name}!",
                "Waktunya review pengeluaran, {name}.",
            ],
            neutral: [
                "Yuk cek keuangan, {name}!",
                "Ini snapshot keuangan kamu, {name}.",
                "Siap untuk overview singkat, {name}?",
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

        // Get random greeting from time period OR context-aware
        const useContextGreeting = Math.random() > 0.5 && hasTransactions;

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

    return (
        <LanguageContext.Provider value={{
            language,
            setLanguage,
            t,
            getGreeting,
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
