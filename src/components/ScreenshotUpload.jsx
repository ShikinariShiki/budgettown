import { useState, useCallback } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { addTransaction, getGeminiApiKey, setGeminiApiKey, saveMerchantCategory, getMerchantCategory } from '../utils/storage';
import { EXPENSE_CATEGORIES, INCOME_CATEGORIES } from '../utils/categories';
import { GOOGLE_CONFIG } from '../config/googleConfig';
import { Upload, Image, X, Loader2, Check, Key, AlertCircle } from 'lucide-react';

export default function ScreenshotUpload({ onClose, onSuccess }) {
    const { user } = useAuth();
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [extractedData, setExtractedData] = useState(null);
    // Use stored API key first, fallback to config default
    const [apiKey, setApiKey] = useState(getGeminiApiKey(user.id) || GOOGLE_CONFIG.geminiApiKey);
    const [showApiKeyInput, setShowApiKeyInput] = useState(false);
    const [formData, setFormData] = useState({
        amount: '', merchant: '', date: new Date().toISOString().split('T')[0],
        category: 'other', type: 'expense', description: ''
    });

    const handleDrop = useCallback((e) => {
        e.preventDefault();
        const droppedFile = e.dataTransfer?.files[0] || e.target.files[0];
        if (droppedFile?.type.startsWith('image/')) {
            setFile(droppedFile);
            setPreview(URL.createObjectURL(droppedFile));
            setError('');
            setExtractedData(null);
        } else setError('Please upload an image file');
    }, []);

    const saveApiKeyHandler = () => {
        if (apiKey.trim()) { setGeminiApiKey(user.id, apiKey.trim()); setShowApiKeyInput(false); }
    };

    const processWithGemini = async () => {
        if (!file || !apiKey) { setShowApiKeyInput(true); return; }
        setLoading(true); setError('');
        try {
            const base64 = await new Promise(r => { const reader = new FileReader(); reader.onloadend = () => r(reader.result.split(',')[1]); reader.readAsDataURL(file); });
            const { GoogleGenerativeAI } = await import('@google/generative-ai');
            const model = new GoogleGenerativeAI(apiKey).getGenerativeModel({ model: 'gemini-1.5-flash' });
            const prompt = `Analyze this receipt/transaction screenshot. Extract: amount (number only, no currency symbol), merchant name, date (YYYY-MM-DD format), type (expense/income), category (food/transport/shopping/bills/entertainment/healthcare/education/travel/groceries/other). Reply ONLY with valid JSON, no markdown: {"amount":number,"merchant":"string","date":"YYYY-MM-DD","suggested_category":"id","confidence":"high/medium/low","transaction_type":"expense/income"}`;
            const result = await model.generateContent([prompt, { inlineData: { mimeType: file.type, data: base64 } }]);
            const text = (await result.response).text();
            console.log('Gemini response:', text);

            // Try to extract JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (!jsonMatch) {
                throw new Error('Could not extract data from image. Try a clearer screenshot.');
            }

            const parsed = JSON.parse(jsonMatch[0]);
            setExtractedData(parsed);
            const savedCat = parsed.merchant ? getMerchantCategory(user.id, parsed.merchant) : null;
            setFormData({
                amount: parsed.amount?.toString() || '',
                merchant: parsed.merchant || '',
                date: parsed.date || new Date().toISOString().split('T')[0],
                category: savedCat || parsed.suggested_category || 'other',
                type: parsed.transaction_type || 'expense',
                description: parsed.merchant || ''
            });
        } catch (err) {
            console.error('Gemini error:', err);
            if (err.message?.includes('API_KEY') || err.message?.includes('API key')) {
                setError('Invalid API key. Please check your Gemini API key.');
                setShowApiKeyInput(true);
            } else if (err.message?.includes('Could not extract')) {
                setError(err.message);
            } else if (err.message?.includes('JSON')) {
                setError('Could not parse transaction data. Try a clearer image.');
            } else if (err.message?.includes('network') || err.message?.includes('fetch')) {
                setError('Network error. Check your internet connection.');
            } else {
                setError('Failed to process: ' + (err.message || 'Unknown error'));
            }
        } finally { setLoading(false); }
    };

    const handleConfirm = () => {
        const amount = parseFloat(formData.amount);
        if (isNaN(amount) || amount <= 0) { setError('Enter valid amount'); return; }
        if (formData.merchant) saveMerchantCategory(user.id, formData.merchant, formData.category);
        addTransaction(user.id, { type: formData.type, amount, category: formData.category, description: formData.description || formData.merchant, date: formData.date, source: 'screenshot' });
        onSuccess?.(); onClose();
    };

    const cats = formData.type === 'income' ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white dark:bg-gray-800 rounded-2xl w-full max-w-lg shadow-2xl border border-gray-200 dark:border-gray-700 max-h-[90vh] overflow-y-auto">
                <div className="flex items-center justify-between p-5 border-b border-gray-100 dark:border-gray-700 sticky top-0 bg-white dark:bg-gray-800 z-10">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Upload Screenshot</h2>
                    <button onClick={onClose} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700"><X size={20} className="text-gray-500" /></button>
                </div>
                <div className="p-5 space-y-5">
                    {showApiKeyInput && (
                        <div className="p-4 rounded-xl bg-yellow-50 dark:bg-yellow-500/10 border border-yellow-200 dark:border-yellow-500/30">
                            <div className="flex items-center gap-2 mb-3"><Key size={18} className="text-yellow-600" /><span className="font-medium text-yellow-800 dark:text-yellow-300">Gemini API Key Required</span></div>
                            <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-3">Get key from <a href="https://makersuite.google.com/app/apikey" target="_blank" className="underline">Google AI Studio</a></p>
                            <div className="flex gap-2">
                                <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} placeholder="API key" className="flex-1 px-3 py-2 rounded-lg bg-white dark:bg-gray-700 border border-yellow-300 dark:border-yellow-500/50 text-gray-900 dark:text-white text-sm" />
                                <button onClick={saveApiKeyHandler} className="px-4 py-2 rounded-lg bg-yellow-500 text-white font-medium text-sm">Save</button>
                            </div>
                        </div>
                    )}
                    {error && <div className="p-4 rounded-xl bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 text-sm flex items-center gap-2"><AlertCircle size={18} />{error}</div>}
                    {!preview && (
                        <div onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} onClick={() => document.getElementById('file-input').click()} className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center hover:border-primary-500 cursor-pointer">
                            <input id="file-input" type="file" accept="image/*" onChange={handleDrop} className="hidden" />
                            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mx-auto mb-4"><Upload size={28} className="text-gray-400" /></div>
                            <p className="text-gray-700 dark:text-gray-300 font-medium">Drop screenshot here</p><p className="text-sm text-gray-500">or click to browse</p>
                        </div>
                    )}
                    {preview && !extractedData && (
                        <div className="space-y-4">
                            <div className="relative rounded-xl overflow-hidden bg-gray-100 dark:bg-gray-700"><img src={preview} alt="Preview" className="w-full max-h-64 object-contain" /><button onClick={() => { setFile(null); setPreview(null); }} className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/50 text-white"><X size={16} /></button></div>
                            <button onClick={processWithGemini} disabled={loading} className="w-full py-3 rounded-xl gradient-primary text-white font-medium shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">{loading ? <><Loader2 size={20} className="animate-spin" />Processing...</> : <><Image size={20} />Extract</>}</button>
                        </div>
                    )}
                    {extractedData && (
                        <div className="space-y-4">
                            <div className={`p-3 rounded-xl flex items-center gap-2 ${extractedData.confidence === 'high' ? 'bg-green-100 dark:bg-green-500/20 text-green-700' : 'bg-yellow-100 dark:bg-yellow-500/20 text-yellow-700'}`}><Check size={18} /><span className="text-sm font-medium">Confidence: {extractedData.confidence}</span></div>
                            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-700 rounded-xl">
                                <button onClick={() => setFormData(p => ({ ...p, type: 'expense' }))} className={`flex-1 py-2 rounded-lg font-medium ${formData.type === 'expense' ? 'bg-red-500 text-white' : 'text-gray-600 dark:text-gray-300'}`}>Expense</button>
                                <button onClick={() => setFormData(p => ({ ...p, type: 'income' }))} className={`flex-1 py-2 rounded-lg font-medium ${formData.type === 'income' ? 'bg-green-500 text-white' : 'text-gray-600 dark:text-gray-300'}`}>Income</button>
                            </div>
                            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Amount</label><div className="relative"><span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500">Rp</span><input type="number" value={formData.amount} onChange={(e) => setFormData(p => ({ ...p, amount: e.target.value }))} onWheel={(e) => e.target.blur()} className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" /></div></div>
                            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label><input type="text" value={formData.description} onChange={(e) => setFormData(p => ({ ...p, description: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" /></div>
                            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category</label><select value={formData.category} onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white">{cats.map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}</select></div>
                            <div><label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label><input type="date" value={formData.date} onChange={(e) => setFormData(p => ({ ...p, date: e.target.value }))} className="w-full px-4 py-3 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-900 dark:text-white" /></div>
                            <div className="flex gap-3"><button onClick={() => { setExtractedData(null); setPreview(null); setFile(null); }} className="flex-1 py-3 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-medium">Cancel</button><button onClick={handleConfirm} className="flex-1 py-3 rounded-xl gradient-primary text-white font-medium flex items-center justify-center gap-2"><Check size={20} />Confirm</button></div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
