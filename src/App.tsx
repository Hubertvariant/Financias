import React, { useState, useEffect } from 'react';
import { Transaction, BankAccount, SavingGoal } from './types';
import { 
  INITIAL_BANKS, 
  INITIAL_TRANSACTIONS, 
  INITIAL_GOALS 
} from './initialData';
import DashboardView from './components/DashboardView';
import TransactionsView from './components/TransactionsView';
import GoalsView from './components/GoalsView';
import WishlistView from './components/WishlistView';
import { 
  LayoutDashboard, 
  Receipt, 
  Target, 
  Sparkles, 
  TrendingUp, 
  TrendingDown, 
  RotateCcw, 
  User,
  Activity,
  DollarSign
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function App() {
  // Navigation State
  const [activeTab, setActiveTab] = useState<'dashboard' | 'transactions' | 'goals' | 'wishlist'>('dashboard');
  const [transactionFilter, setTransactionFilter] = useState<string>('all');

  // Persistence States
  const [banks, setBanks] = useState<BankAccount[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<SavingGoal[]>([]);

  // Load from LocalStorage
  useEffect(() => {
    const savedBanks = localStorage.getItem('fin_banks');
    const savedTransactions = localStorage.getItem('fin_transactions');
    const savedGoals = localStorage.getItem('fin_goals');

    if (savedBanks && savedTransactions && savedGoals) {
      setBanks(JSON.parse(savedBanks));
      setTransactions(JSON.parse(savedTransactions));
      setGoals(JSON.parse(savedGoals));
    } else {
      // Default initial templates
      setBanks(INITIAL_BANKS);
      setTransactions(INITIAL_TRANSACTIONS);
      setGoals(INITIAL_GOALS);
      
      localStorage.setItem('fin_banks', JSON.stringify(INITIAL_BANKS));
      localStorage.setItem('fin_transactions', JSON.stringify(INITIAL_TRANSACTIONS));
      localStorage.setItem('fin_goals', JSON.stringify(INITIAL_GOALS));
    }
  }, []);

  // Save to LocalStorage helper
  const saveState = (updatedBanks: BankAccount[], updatedTransactions: Transaction[], updatedGoals: SavingGoal[]) => {
    setBanks(updatedBanks);
    setTransactions(updatedTransactions);
    setGoals(updatedGoals);
    
    localStorage.setItem('fin_banks', JSON.stringify(updatedBanks));
    localStorage.setItem('fin_transactions', JSON.stringify(updatedTransactions));
    localStorage.setItem('fin_goals', JSON.stringify(updatedGoals));
  };

  // Reset database state to mock defaults
  const handleResetData = () => {
    if (confirm('Deseja redefinir os dados para o modelo original de demonstração? Isso substituirá suas modificações atuais.')) {
      saveState(INITIAL_BANKS, INITIAL_TRANSACTIONS, INITIAL_GOALS);
      setActiveTab('dashboard');
    }
  };

  // TRANSACTION CRUD
  const handleAddTransaction = (newTrans: Omit<Transaction, 'id'>) => {
    const transWithId: Transaction = {
      ...newTrans,
      id: 't_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5)
    };
    const updatedTransactions = [transWithId, ...transactions];
    saveState(banks, updatedTransactions, goals);
  };

  const handleEditTransaction = (editedTrans: Transaction) => {
    const updatedTransactions = transactions.map(t => t.id === editedTrans.id ? editedTrans : t);
    saveState(banks, updatedTransactions, goals);
  };

  const handleDeleteTransaction = (id: string) => {
    const updatedTransactions = transactions.filter(t => t.id !== id);
    saveState(banks, updatedTransactions, goals);
  };

  // Toggle transaction paid/pending status
  const handleToggleStatus = (id: string) => {
    const updatedTransactions = transactions.map(t => {
      if (t.id === id) {
        let nextStatus: 'pago' | 'pendente' | 'futuro' = t.status;
        if (t.status === 'pago') nextStatus = 'pendente';
        else if (t.status === 'pendente') nextStatus = 'pago';
        return { ...t, status: nextStatus };
      }
      return t;
    });
    saveState(banks, updatedTransactions, goals);
  };

  // GOALS CRUD & SAVINGS FLUX
  const handleAddGoal = (newGoal: Omit<SavingGoal, 'id'>) => {
    const goalWithId: SavingGoal = {
      ...newGoal,
      id: 'g_' + Date.now().toString(36)
    };
    const updatedGoals = [...goals, goalWithId];
    saveState(banks, updatedTransactions(transactions), updatedGoals);
  };

  const handleEditGoal = (editedGoal: SavingGoal) => {
    const updatedGoals = goals.map(g => g.id === editedGoal.id ? editedGoal : g);
    saveState(banks, transactions, updatedGoals);
  };

  const handleDeleteGoal = (id: string) => {
    const updatedGoals = goals.filter(g => g.id !== id);
    saveState(banks, transactions, updatedGoals);
  };

  // Deposit into saving goals
  const handleSaveToGoal = (goalId: string, amount: number, bankName: string) => {
    // 1. Update goals current savings amount
    let targetGoalName = '';
    const updatedGoals = goals.map(g => {
      if (g.id === goalId) {
        targetGoalName = g.name;
        return {
          ...g,
          currentAmount: g.currentAmount + amount
        };
      }
      return g;
    });

    // 2. Automatically generate a dynamic 'despesa' transaction reflecting the savings deduction (de qual banco saiu)
    const txDeduction: Transaction = {
      id: 't_savings_' + Date.now().toString(36),
      description: `Poupado para Meta: ${targetGoalName}`,
      amount: amount,
      type: 'despesa',
      category: 'Investimentos',
      bank: bankName,
      status: 'pago',
      date: new Date().toISOString().split('T')[0],
      notes: `Transferido automaticamente do saldo da conta ${bankName} para a poupança.`
    };

    const updatedTransactions = [txDeduction, ...transactions];
    saveState(banks, updatedTransactions, updatedGoals);
  };

  const updatedTransactions = (currTrans: Transaction[]) => currTrans;

  // Convert wishlist (futuro) into active expense (pago or pendente)
  const handleConvertWishToExpense = (wishId: string, bankName: string, status: 'pago' | 'pendente') => {
    const updatedTransactions = transactions.map(t => {
      if (t.id === wishId) {
        return {
          ...t,
          bank: bankName,
          status: status,
          date: new Date().toISOString().split('T')[0],
          notes: `Convertido de simulação da Lista de Desejos em despesa ${status === 'pago' ? 'paga' : 'agendada/pendente'}.`
        };
      }
      return t;
    });

    saveState(banks, updatedTransactions, goals);
  };

  return (
    <div className="flex h-screen bg-slate-50/65 font-sans overflow-hidden" id="app-root">
      {/* Sidebar - Desktop Layout */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-slate-100 p-6 shrink-0 justify-between">
        <div className="space-y-8">
          {/* Logo / Brand */}
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-mono font-bold text-lg">
              F
            </div>
            <div>
              <span className="font-semibold text-slate-800 text-sm tracking-tight block">FiançaPro</span>
              <span className="text-[10px] font-medium font-mono text-slate-400 uppercase tracking-widest block">Inteligente</span>
            </div>
          </div>

          {/* User profile segment */}
          <div className="p-3.5 bg-slate-50/70 rounded-xl flex items-center gap-3">
            <div className="h-9 w-9 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold shrink-0 text-sm">
              HA
            </div>
            <div className="truncate">
              <span className="text-xs font-bold text-slate-700 block truncate">hubertadulto@gmail.com</span>
              <span className="text-[10px] text-emerald-500 font-semibold flex items-center gap-1">
                <Activity className="h-2.5 w-2.5" /> Ativo
              </span>
            </div>
          </div>

          {/* Menu Items */}
          <nav className="space-y-1" id="desktop-nav">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer select-none transition-colors ${
                activeTab === 'dashboard' 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
              }`}
            >
              <LayoutDashboard className="h-4.5 w-4.5 shrink-0" />
              Painel Geral
            </button>

            <button
              onClick={() => { setTransactionFilter('all'); setActiveTab('transactions'); }}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer select-none transition-colors ${
                activeTab === 'transactions' 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
              }`}
            >
              <Receipt className="h-4.5 w-4.5 shrink-0" />
              Lançamentos (Fluxo)
            </button>

            <button
              onClick={() => setActiveTab('goals')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer select-none transition-colors ${
                activeTab === 'goals' 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
              }`}
            >
              <Target className="h-4.5 w-4.5 shrink-0" />
              Metas de Economia
            </button>

            <button
              onClick={() => setActiveTab('wishlist')}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold cursor-pointer select-none transition-colors ${
                activeTab === 'wishlist' 
                  ? 'bg-indigo-50 text-indigo-700' 
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50/50'
              }`}
            >
              <Sparkles className="h-4.5 w-4.5 shrink-0" />
              Lista de Desejos
            </button>
          </nav>
        </div>

        {/* Bottom Section inside Sidebar */}
        <div className="pt-4 border-t border-slate-50 space-y-3">
          <button
            onClick={handleResetData}
            className="w-full flex items-center justify-center gap-2 text-[10px] font-mono text-slate-400 hover:text-indigo-650 p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
            title="Redefine o saldo e as compras para demonstração inicial."
            id="reset-state-desktop"
          >
            <RotateCcw className="h-3 w-3" />
            Redefinir Demonstração
          </button>
        </div>
      </aside>

      {/* Main Workspace Frame */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        {/* Top Header navbar (Mobile and General) */}
        <header className="bg-white border-b border-slate-100 py-4 px-6 shrink-0 flex justify-between items-center z-10">
          <div className="flex items-center gap-2 md:hidden">
            <div className="h-8 w-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-mono font-bold text-sm">
              F
            </div>
            <span className="font-bold text-slate-800 text-sm tracking-tight">FiançaPro</span>
          </div>

          <div className="hidden md:flex items-center gap-2 text-slate-400 text-xs font-mono font-medium">
            <span>Home</span>
            <span>/</span>
            <span className="text-slate-600 font-semibold capitalize">{activeTab === 'goals' ? 'Metas' : activeTab === 'wishlist' ? 'Desejos' : activeTab}</span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={handleResetData}
              className="md:hidden p-2 text-slate-400 hover:text-indigo-600 hover:bg-slate-50 rounded-lg cursor-pointer transition-colors"
              title="Redefinir Demonstração"
              id="reset-state-mobile"
            >
              <RotateCcw className="h-4.5 w-4.5" />
            </button>
            <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 text-xs font-bold font-mono">
              US
            </div>
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 pb-24 md:pb-8 bg-slate-50/30">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.18 }}
              className="max-w-7xl mx-auto"
            >
              {activeTab === 'dashboard' && (
                <DashboardView 
                  transactions={transactions} 
                  banks={banks} 
                  goals={goals} 
                  setViewList={setActiveTab}
                  setTransactionFilter={setTransactionFilter}
                />
              )}

              {activeTab === 'transactions' && (
                <TransactionsView 
                  transactions={transactions} 
                  banks={banks} 
                  onAddTransaction={handleAddTransaction}
                  onEditTransaction={handleEditTransaction}
                  onDeleteTransaction={handleDeleteTransaction}
                  onToggleStatus={handleToggleStatus}
                  initialFilterStatus={transactionFilter}
                />
              )}

              {activeTab === 'goals' && (
                <GoalsView 
                  goals={goals} 
                  banks={banks} 
                  onAddGoal={handleAddGoal}
                  onEditGoal={handleEditGoal}
                  onDeleteGoal={handleDeleteGoal}
                  onSaveToGoal={handleSaveToGoal}
                />
              )}

              {activeTab === 'wishlist' && (
                <WishlistView 
                  transactions={transactions} 
                  banks={banks} 
                  onAddTransaction={handleAddTransaction}
                  onEditTransaction={handleEditTransaction}
                  onDeleteTransaction={handleDeleteTransaction}
                  onConvertWishToExpense={handleConvertWishToExpense}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        {/* Bottom Tab Bar navigation - Mobile Only */}
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100/90 py-2.5 px-4 md:hidden flex justify-around items-center z-10 shadow-lg" id="mobile-nav">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex flex-col items-center gap-1 font-sans cursor-pointer transition-colors ${activeTab === 'dashboard' ? 'text-indigo-650' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <LayoutDashboard className="h-5 w-5" />
            <span className="text-[10px] font-bold">Painel</span>
          </button>

          <button
            onClick={() => { setTransactionFilter('all'); setActiveTab('transactions'); }}
            className={`flex flex-col items-center gap-1 font-sans cursor-pointer transition-colors ${activeTab === 'transactions' ? 'text-indigo-650' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Receipt className="h-5 w-5" />
            <span className="text-[10px] font-bold">Fluxo</span>
          </button>

          <button
            onClick={() => setActiveTab('goals')}
            className={`flex flex-col items-center gap-1 font-sans cursor-pointer transition-colors ${activeTab === 'goals' ? 'text-indigo-650' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Target className="h-5 w-5" />
            <span className="text-[10px] font-bold">Metas</span>
          </button>

          <button
            onClick={() => setActiveTab('wishlist')}
            className={`flex flex-col items-center gap-1 font-sans cursor-pointer transition-colors ${activeTab === 'wishlist' ? 'text-indigo-650' : 'text-slate-400 hover:text-slate-600'}`}
          >
            <Sparkles className="h-5 w-5" />
            <span className="text-[10px] font-bold">Desejos</span>
          </button>
        </nav>
      </div>
    </div>
  );
}
