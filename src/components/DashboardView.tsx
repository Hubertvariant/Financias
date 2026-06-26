import React, { useMemo } from 'react';
import { Transaction, BankAccount, SavingGoal } from '../types';
import { 
  TrendingUp, 
  TrendingDown, 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  AlertCircle, 
  Clock, 
  CheckCircle,
  HelpCircle
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell,
  CartesianGrid
} from 'recharts';

interface DashboardViewProps {
  transactions: Transaction[];
  banks: BankAccount[];
  goals: SavingGoal[];
  setViewList: (view: 'dashboard' | 'transactions' | 'goals' | 'wishlist') => void;
  setTransactionFilter: (filter: string) => void;
}

export default function DashboardView({ 
  transactions, 
  banks, 
  goals, 
  setViewList,
  setTransactionFilter
}: DashboardViewProps) {
  
  // Calculate dynamic bank balances
  const bankBalances = useMemo(() => {
    return banks.map(bank => {
      const bankTrans = transactions.filter(t => t.bank.toLowerCase() === bank.name.toLowerCase());
      
      const revenuePaid = bankTrans
        .filter(t => t.type === 'receita' && t.status === 'pago')
        .reduce((sum, t) => sum + t.amount, 0);
        
      const expensePaid = bankTrans
        .filter(t => t.type === 'despesa' && t.status === 'pago')
        .reduce((sum, t) => sum + t.amount, 0);
        
      const revenuePending = bankTrans
        .filter(t => t.type === 'receita' && t.status === 'pendente')
        .reduce((sum, t) => sum + t.amount, 0);
        
      const expensePending = bankTrans
        .filter(t => t.type === 'despesa' && t.status === 'pendente')
        .reduce((sum, t) => sum + t.amount, 0);

      const currentBalance = bank.initialBalance + revenuePaid - expensePaid;
      const projectedBalance = currentBalance + revenuePending - expensePending;

      return {
        ...bank,
        currentBalance,
        projectedBalance
      };
    });
  }, [banks, transactions]);

  const stats = useMemo(() => {
    const paidRevenues = transactions
      .filter(t => t.type === 'receita' && t.status === 'pago')
      .reduce((sum, t) => sum + t.amount, 0);

    const paidExpenses = transactions
      .filter(t => t.type === 'despesa' && t.status === 'pago')
      .reduce((sum, t) => sum + t.amount, 0);

    const pendingRevenues = transactions
      .filter(t => t.type === 'receita' && t.status === 'pendente')
      .reduce((sum, t) => sum + t.amount, 0);

    const pendingExpenses = transactions
      .filter(t => t.type === 'despesa' && t.status === 'pendente')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalRealBalance = bankBalances.reduce((sum, b) => sum + b.currentBalance, 0);
    const totalProjectedBalance = bankBalances.reduce((sum, b) => sum + b.projectedBalance, 0);

    return {
      paidRevenues,
      paidExpenses,
      pendingRevenues,
      pendingExpenses,
      totalRealBalance,
      totalProjectedBalance,
      savedThisMonth: paidRevenues - paidExpenses
    };
  }, [transactions, bankBalances]);

  // Chart data: Monthly comparison
  const financialFlowData = useMemo(() => {
    // Group transactions by category for charts
    const categoryTotals: { [key: string]: { name: string; value: number } } = {};
    
    transactions
      .filter(t => t.type === 'despesa' && t.status !== 'futuro')
      .forEach(t => {
        if (!categoryTotals[t.category]) {
          categoryTotals[t.category] = { name: t.category, value: 0 };
        }
        categoryTotals[t.category].value += t.amount;
      });

    const categoriesList = Object.values(categoryTotals).sort((a, b) => b.value - a.value);

    // Group by status
    const statusData = [
      { name: 'Pago', valor: stats.paidExpenses, color: '#F43F5E' },
      { name: 'A Pagar', valor: stats.pendingExpenses, color: '#F59E0B' },
      { name: 'Planejado (Futuro)', valor: transactions.filter(t => t.status === 'futuro').reduce((s, t) => s + t.amount, 0), color: '#8B5CF6' }
    ];

    // Cash flow trend - comparing Nubank, Itaú, Inter balances
    return {
      categories: categoriesList,
      status: statusData
    };
  }, [transactions, stats]);

  // Aggregate monthly flow
  const cashFlowBarData = useMemo(() => {
    return [
      {
        name: 'Realizado (Pago)',
        Receitas: stats.paidRevenues,
        Despesas: stats.paidExpenses,
      },
      {
        name: 'Previsto (Total)',
        Receitas: stats.paidRevenues + stats.pendingRevenues,
        Despesas: stats.paidExpenses + stats.pendingExpenses,
      }
    ];
  }, [stats]);

  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6', '#6B7280'];

  const alertItems = useMemo(() => {
    const list: string[] = [];
    if (stats.pendingExpenses > 0) {
      list.push(`Você possui R$ ${stats.pendingExpenses.toFixed(2)} em contas pendentes (vou pagar).`);
    }
    const targetWish = transactions.filter(t => t.status === 'futuro');
    if (targetWish.length > 0) {
      list.push(`Existem ${targetWish.length} compras futuras planejadas na sua lista de desejos.`);
    }
    return list;
  }, [stats, transactions]);

  return (
    <div className="space-y-6" id="dashboard-container">
      {/* Primeiras Métricas de Resumo */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card Saldo Geral */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between" id="card-saldo-geral">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-slate-400">Saldo Consolidado Neto</p>
              <h3 className="text-2xl font-bold font-sans text-slate-800 mt-1">
                R$ {stats.totalRealBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
              <Wallet className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center text-xs text-slate-500">
            <span>Previsão (incl. Pendentes):</span>
            <span className={`font-semibold ${stats.totalProjectedBalance >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
              R$ {stats.totalProjectedBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Card Receitas */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between hover:border-slate-200 transition-colors" id="card-receitas-resumo">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-slate-400">Receitas Recebidas</p>
              <h3 className="text-2xl font-bold font-sans text-emerald-600 mt-1">
                + R$ {stats.paidRevenues.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
              <TrendingUp className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center text-xs text-slate-400">
            <span>A receber (previsto):</span>
            <span className="font-semibold text-slate-600">
              + R$ {stats.pendingRevenues.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>

        {/* Card Despesas */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between hover:border-slate-200 transition-colors" id="card-despesas-resumo">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-mono uppercase tracking-wider text-slate-400">Despesas Pagas</p>
              <h3 className="text-2xl font-bold font-sans text-rose-600 mt-1">
                - R$ {stats.paidExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </h3>
            </div>
            <div className="p-3 bg-rose-50 text-rose-600 rounded-xl">
              <TrendingDown className="h-6 w-6" />
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-50 flex justify-between items-center text-xs text-slate-400">
            <span>A pagar (pendente):</span>
            <span className="font-semibold text-amber-600">
              - R$ {stats.pendingExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Alertas */}
      {alertItems.length > 0 && (
        <div className="bg-amber-50/70 border border-amber-100 rounded-2xl p-4 flex items-start gap-3 text-amber-800" id="alerts-banner">
          <AlertCircle className="h-5 w-5 mt-0.5 text-amber-600 shrink-0" />
          <div className="text-sm space-y-1">
            <h4 className="font-semibold text-amber-900">Avisos Importantes:</h4>
            <ul className="list-disc pl-4 space-y-0.5 text-amber-800">
              {alertItems.map((alert, index) => (
                <li key={index}>{alert}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* Bancos Cadastrados (Fluxo Dinâmico - Quem saiu / quem entrou) */}
      <div id="bancos-fluxo-container">
        <h3 className="text-lg font-bold font-sans text-slate-800 mb-4 flex items-center gap-2">
          <Wallet className="h-5 w-5 text-indigo-500" />
          Saldos por Banco / Conta
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {bankBalances.map(bank => (
            <div 
              key={bank.id} 
              className={`p-5 rounded-2xl bg-gradient-to-br ${bank.color} shadow-sm border border-black/5 hover:scale-[1.01] transition-transform flex flex-col justify-between h-36`}
              id={`bank-card-${bank.id}`}
            >
              <div>
                <div className="flex justify-between items-center">
                  <span className="font-mono text-xs font-medium tracking-wider opacity-90">{bank.name}</span>
                  <div className="w-8 h-5 bg-white/20 rounded-md backdrop-blur-xs flex items-center justify-center text-[8px] font-bold">
                    DEBIT
                  </div>
                </div>
                <div className="mt-2 text-xl font-bold font-sans tracking-tight">
                  R$ {bank.currentBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </div>
              </div>

              <div>
                <div className="flex justify-between items-center text-xs opacity-80 pt-2 border-t border-white/10 mt-2">
                  <span>Previsto:</span>
                  <span className="font-semibold text-white">
                    R$ {bank.projectedBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Gráficos Interativos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6" id="charts-container">
        {/* Gráfico 1: Fluxo de Caixa */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col" id="chart-fluxo-caixa">
          <h4 className="text-sm font-bold font-sans text-slate-700 uppercase tracking-wider mb-4">
            Comparativo Receitas vs Despesas (R$)
          </h4>
          <div className="h-64 mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={cashFlowBarData} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip formatter={(value: any) => [`R$ ${Number(value).toFixed(2)}`]} />
                <Legend />
                <Bar dataKey="Receitas" fill="#10B981" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Despesas" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="text-xs text-slate-400 mt-2 font-mono text-center">
            Inclui lançamentos pagos e pendentes para melhor visualização.
          </div>
        </div>

        {/* Gráfico 2: Despesas por Categoria */}
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col" id="chart-despesas-categoria">
          <h4 className="text-sm font-bold font-sans text-slate-700 uppercase tracking-wider mb-4">
            Distribuição de Despesas por Categoria
          </h4>
          
          {financialFlowData.categories.length === 0 ? (
            <div className="flex-1 flex flex-col justify-center items-center py-10 text-slate-400 text-sm">
              <HelpCircle className="h-10 w-10 text-slate-300 mb-2" />
              Nenhuma despesa ativa lançada
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-center flex-1">
              {/* Pie chart */}
              <div className="h-48 md:col-span-3">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={financialFlowData.categories}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={70}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {financialFlowData.categories.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: any) => [`R$ ${Number(value).toFixed(2)}`]} />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Legend with percentages */}
              <div className="space-y-1.5 max-h-48 overflow-y-auto md:col-span-2 text-xs" id="legend-chart-categories">
                {financialFlowData.categories.slice(0, 5).map((category, index) => {
                  const totalExpense = financialFlowData.categories.reduce((acc, curr) => acc + curr.value, 0);
                  const pct = totalExpense > 0 ? ((category.value / totalExpense) * 100).toFixed(1) : 0;
                  return (
                    <div key={category.name} className="flex justify-between items-center" id={`legend-cat-${category.name}`}>
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                        <span className="text-slate-600 font-medium truncate">{category.name}</span>
                      </div>
                      <span className="text-slate-400 font-mono text-[10px] pl-1 font-semibold">{pct}%</span>
                    </div>
                  );
                })}
                {financialFlowData.categories.length > 5 && (
                  <div className="text-[10px] text-slate-400 text-center font-mono italic">
                    + {financialFlowData.categories.length - 5} outras categorias
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Próximas Contas a Vencer */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs" id="proximas-contas-container">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-md font-bold font-sans text-slate-700 flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" />
            Contas Futuras & Pendentes a Vencer
          </h3>
          <button 
            onClick={() => { setTransactionFilter('pendente'); setViewList('transactions'); }}
            className="text-xs font-mono font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1 cursor-pointer"
            id="view-all-p-button"
          >
            Ver Todas as Pendentes
            <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>

        {transactions.filter(t => t.status === 'pendente').length === 0 ? (
          <div className="py-6 text-center text-sm text-slate-400 bg-slate-50/50 rounded-xl flex flex-col items-center justify-center gap-1.5">
            <CheckCircle className="h-6 w-6 text-emerald-500" />
            Que ótimo! Todas as suas contas cadastradas já estão pagas.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-xs font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  <th className="py-3 px-4">Vencimento</th>
                  <th className="py-3 px-4">Descrição</th>
                  <th className="py-3 px-4">Banco Destino</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4 text-right">Valor</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700 text-sm">
                {transactions
                  .filter(t => t.status === 'pendente')
                  .sort((a, b) => a.date.localeCompare(b.date))
                  .slice(0, 3)
                  .map(t => (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-xs text-rose-500 font-semibold">{t.date}</td>
                      <td className="py-3 px-4 font-medium max-w-[200px] truncate">{t.description}</td>
                      <td className="py-3 px-4">
                        <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-600 text-xs font-mono font-medium">
                          {t.bank}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-slate-500 text-xs font-medium">{t.category}</td>
                      <td className="py-3 px-4 text-right font-bold text-slate-800">
                        R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
