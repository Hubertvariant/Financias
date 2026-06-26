import React, { useMemo, useState } from 'react';
import { Transaction, BankAccount } from '../types';
import { 
  Sparkles, 
  ShoppingCart, 
  Trash2, 
  Check, 
  HelpCircle, 
  Lightbulb, 
  TrendingUp, 
  TrendingDown, 
  X, 
  Plus, 
  Calendar,
  Layers,
  CheckCircle,
  Clock,
  ArrowRight
} from 'lucide-react';
import { TRANSACTION_CATEGORIES } from '../initialData';

interface WishlistViewProps {
  transactions: Transaction[];
  banks: BankAccount[];
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onConvertWishToExpense: (id: string, bankName: string, status: 'pago' | 'pendente') => void;
}

export default function WishlistView({
  transactions,
  banks,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
  onConvertWishToExpense
}: WishlistViewProps) {
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Form Fields
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState<number>(0);
  const [category, setCategory] = useState(TRANSACTION_CATEGORIES.despesa[0]);
  const [bank, setBank] = useState(banks[0]?.name || 'Nubank');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');

  // Conversion overlay state
  const [isConvertOpen, setIsConvertOpen] = useState(false);
  const [selectedWishId, setSelectedWishId] = useState<string | null>(null);
  const [targetBank, setTargetBank] = useState(banks[0]?.name || 'Nubank');
  const [targetStatus, setTargetStatus] = useState<'pago' | 'pendente'>('pago');

  // Filter transactions with status === 'futuro'
  const wishlist = useMemo(() => {
    return transactions.filter(t => t.status === 'futuro');
  }, [transactions]);

  // Overall statistics for future items
  const totalWishValue = useMemo(() => {
    return wishlist.reduce((sum, item) => sum + item.amount, 0);
  }, [wishlist]);

  // Net general active balance across all accounts
  const netActiveBalance = useMemo(() => {
    const revenuePaid = transactions
      .filter(t => t.type === 'receita' && t.status === 'pago')
      .reduce((sum, t) => sum + t.amount, 0);
      
    const expensePaid = transactions
      .filter(t => t.type === 'despesa' && t.status === 'pago')
      .reduce((sum, t) => sum + t.amount, 0);

    const initialBanksBalance = banks.reduce((sum, b) => sum + b.initialBalance, 0);

    return initialBanksBalance + revenuePaid - expensePaid;
  }, [transactions, banks]);

  const financialAdvice = useMemo(() => {
    if (netActiveBalance <= 0) {
      return {
        level: 'danger',
        message: 'No momento, você está com saldo geral negativo ou zerado. Evite novos gastos futuros até reequilibrar suas contas!'
      };
    } else if (netActiveBalance < totalWishValue) {
      return {
        level: 'warning',
        message: 'Seu saldo consolidado atual é bom, mas é menor do que o total acumulado que você planeja comprar. Priorize o que é essencial.'
      };
    } else {
      return {
        level: 'safe',
        message: 'Parabéns! Suas contas estão equilibradas de forma que seu saldo atual cobre todas as suas futuras compras estimadas nesta lista!'
      };
    }
  }, [netActiveBalance, totalWishValue]);

  const handleCreateWish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!description || amount <= 0) {
      alert('Preencha os campos de forma válida!');
      return;
    }

    onAddTransaction({
      description,
      amount,
      type: 'despesa',
      category,
      bank,
      status: 'futuro',
      date,
      notes: notes || 'Compra futura planejada'
    });

    setDescription('');
    setAmount(0);
    setNotes('');
    setIsAddOpen(false);
  };

  const handleConvertTrigger = (id: string, bankName: string) => {
    setSelectedWishId(id);
    setTargetBank(bankName);
    setTargetStatus('pago');
    setIsConvertOpen(true);
  };

  const handleConvertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedWishId) return;

    onConvertWishToExpense(selectedWishId, targetBank, targetStatus);
    setIsConvertOpen(false);
  };

  return (
    <div className="space-y-6" id="wishlist-view-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-800">Futuras Compras (Desejos & Despesas)</h2>
          <p className="text-sm text-slate-500">Coisas que você está pensando em comprar e está analisando o impacto no seu orçamento.</p>
        </div>
        <button 
          onClick={() => setIsAddOpen(true)}
          className="bg-purple-600 hover:bg-purple-750 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer transition-all duration-200 self-stretch sm:self-auto text-center justify-center shadow-xs"
          id="btn-new-wish"
        >
          <Plus className="h-4 w-4" />
          Planejar Nova Compra
        </button>
      </div>

      {/* Caixa de Conselho Financeiro */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex items-start gap-4 md:col-span-2">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-xl">
            <Lightbulb className="h-6 w-6" id="advisor-lightbulb" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-slate-800 text-sm">Conselho Financeiro do Seu Gestor</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              {financialAdvice.message}
            </p>
            <div className="pt-2 text-[10px] uppercase font-mono tracking-wider font-semibold">
              Status Geral: 
              <span className={`ml-1 ${financialAdvice.level === 'danger' ? 'text-rose-500' : financialAdvice.level === 'warning' ? 'text-amber-500' : 'text-emerald-500'}`}>
                {financialAdvice.level === 'danger' ? 'ALERTA VERMELHO' : financialAdvice.level === 'warning' ? 'COMPRAS SOB ALERTA' : 'COMPLETAMENTE SEGURO'}
              </span>
            </div>
          </div>
        </div>

        {/* Resumo Dinâmico do Planejamento */}
        <div className="bg-gradient-to-br from-purple-50 to-indigo-50/40 p-6 rounded-2xl border border-purple-100/40 shadow-xs flex flex-col justify-between">
          <div>
            <span className="text-[9px] font-mono tracking-wider text-purple-800 font-bold uppercase bg-purple-100 px-2.5 py-0.5 rounded-full select-none">
              Projeção Futura
            </span>
            <div className="mt-3">
              <p className="text-xs text-slate-500">Valor Acumulado de Desejos:</p>
              <h3 className="text-2xl font-bold font-sans text-purple-900 mt-1">
                R$ {totalWishValue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </h3>
            </div>
          </div>
          <div className="text-slate-400 text-xs font-mono pt-3 border-t border-purple-100/50 mt-4 flex justify-between">
            <span>Seu saldo real total:</span>
            <span className="font-bold text-slate-650">R$ {netActiveBalance.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Lista de Compras Planejadas */}
      {wishlist.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-100 shadow-xs flex flex-col items-center justify-center gap-3">
          <ShoppingCart className="h-10 w-10 text-slate-300" />
          <div>
            <h4 className="font-bold text-slate-700 text-base">Nenhuma compra futura planejada no momento</h4>
            <p className="text-xs text-slate-400 mt-1">Se você estiver considerando novas compras mas não quer comprometer o saldo atual, registre-os aqui para simular o financeiro.</p>
          </div>
          <button 
            onClick={() => setIsAddOpen(true)}
            className="mt-2 bg-purple-650 hover:bg-purple-700 text-white font-semibold text-xs px-4 py-2 rounded-lg cursor-pointer"
          >
            Começar a Planejar
          </button>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden" id="wishlist-table-container">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[10px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  <th className="py-3.5 px-6">Futura Compra</th>
                  <th className="py-3.5 px-4">Estimativa</th>
                  <th className="py-3.5 px-4">Simulado em Banco/Conta</th>
                  <th className="py-3.5 px-4">Categoria</th>
                  <th className="py-3.5 px-4 text-right">Valor Planejado</th>
                  <th className="py-3.5 px-6 text-center">Converter / Decidir</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700 text-sm font-sans" id="tbl-wishlist-body">
                {wishlist.map(item => {
                  const canAfford = netActiveBalance >= item.amount;
                  return (
                    <tr key={item.id} className="hover:bg-slate-55/30 transition-colors">
                      {/* item */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-2.5">
                          <div className={`p-1.5 rounded-lg ${canAfford ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50/70 text-rose-500'}`} title={canAfford ? 'Saldo atual cobre esta compra' : 'Atenção: Saldo atual é menor que esta compra'}>
                            <ShoppingCart className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="font-semibold text-slate-800 text-sm block max-w-[200px] truncate">{item.description}</span>
                            {item.notes && <span className="text-[10px] text-slate-400 block font-mono max-w-[200px] truncate">{item.notes}</span>}
                          </div>
                        </div>
                      </td>

                      {/* data */}
                      <td className="py-4 px-4 font-mono text-xs text-slate-500">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5" />
                          {item.date}
                        </div>
                      </td>

                      {/* banco planejado */}
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-0.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 text-xs font-mono font-medium">
                          {item.bank}
                        </span>
                      </td>

                      {/* categoria */}
                      <td className="py-4 px-4">
                        <span className="text-slate-500 text-xs font-medium bg-slate-100 px-2 py-1 rounded-md">
                          {item.category}
                        </span>
                      </td>

                      {/* valor */}
                      <td className="py-4 px-4 text-right font-bold text-slate-800 font-mono text-sm">
                        R$ {item.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </td>

                      {/* converter para despesa real */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            onClick={() => handleConvertTrigger(item.id, item.bank)}
                            className="bg-indigo-50 hover:bg-emerald-50 text-indigo-700 hover:text-emerald-700 border border-indigo-100 hover:border-emerald-200 px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1 transition-colors cursor-pointer shadow-2xs"
                            title="Confirmar compra real deste item!"
                            id={`btn-convert-${item.id}`}
                          >
                            <Check className="h-3 w-3" />
                            Comprar!
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Deseja desistir de simular e excluir esta compra futura?')) {
                                onDeleteTransaction(item.id);
                              }
                            }}
                            className="text-slate-400 hover:text-rose-600 p-1.5 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                            title="Remover planejado"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal - Planejar nova compra futura */}
      {isAddOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex justify-end z-50 animate-fade-in" id="add-wish-overlay">
          <div className="bg-white w-full max-w-md h-full p-6 overflow-y-auto flex flex-col justify-between shadow-xl" id="add-wish-content">
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <h3 className="text-lg font-bold font-sans text-slate-800">
                  Planejar Nova Compra Futura
                </h3>
                <button 
                  onClick={() => setIsAddOpen(false)}
                  className="p-1 px-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateWish} className="space-y-4" id="frm-add-wish">
                {/* Nome do desejo */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-mono font-medium text-slate-500">O que você está pensando em comprar?</label>
                  <input 
                    type="text"
                    required
                    maxLength={100}
                    placeholder="Ex: PlayStation 5, Notebook de Trabalho, Jaqueta de Couro..."
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="py-2.5 px-3 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                {/* Valor Estimado */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-mono font-medium text-slate-500">Valor Estimado (R$)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold font-mono text-slate-400">R$</span>
                    <input 
                      type="number"
                      required
                      step="0.01"
                      min="0.10"
                      placeholder="0.00"
                      value={amount || ''}
                      onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                      className="w-full py-2.5 pl-9 pr-3 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-hidden focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                {/* Qual conta planeja sair? */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-mono font-medium text-slate-500">De qual conta planeja sair o dinheiro?</label>
                  <select
                    value={bank}
                    onChange={(e) => setBank(e.target.value)}
                    className="py-2.5 px-3 rounded-lg border border-slate-200 text-slate-800 text-sm bg-white focus:outline-hidden focus:border-indigo-500"
                  >
                    {banks.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>

                {/* Categoria */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-mono font-medium text-slate-500">Categoria</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="py-2.5 px-3 rounded-lg border border-slate-200 text-slate-800 text-sm bg-white focus:outline-hidden focus:border-indigo-500"
                  >
                    {TRANSACTION_CATEGORIES.despesa.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Data Planejada */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-mono font-medium text-slate-500">Data estimada da compra</label>
                  <input 
                    type="date"
                    required
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="py-2.5 px-3 rounded-lg border border-slate-200 text-slate-1000 text-sm focus:outline-hidden focus:border-indigo-500 font-mono"
                  />
                </div>

                {/* Notas de Priorização */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-mono font-medium text-slate-500">Notas ou motivação da compra (opcional)</label>
                  <textarea 
                    placeholder="Por que quer comprar isso? É urgente ou secundário?"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    rows={3}
                    className="py-2.5 px-3 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </form>
            </div>

            <div className="pt-4 border-t border-slate-100 flex gap-3">
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 font-semibold cursor-pointer text-sm"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="frm-add-wish"
                className="flex-1 py-2.5 rounded-lg bg-purple-650 hover:bg-purple-700 text-white font-semibold cursor-pointer text-sm shadow-xs"
              >
                Planejar Desejo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Conversão - Comprar de fato! */}
      {isConvertOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in" id="convert-wish-overlay">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl space-y-4 border border-slate-100" id="convert-wish-content">
            <div className="flex justify-between items-center pb-2 border-b border-purple-50">
              <h4 className="font-bold font-sans text-slate-800 text-sm uppercase tracking-wider flex items-center gap-1.5">
                <CheckCircle className="h-5 w-5 text-indigo-500 animate-bounce" />
                Confirmar Compra Real!
              </h4>
              <button 
                onClick={() => setIsConvertOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-450 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleConvertSubmit} className="space-y-4" id="frm-convert-submit">
              <p className="text-xs text-slate-500 leading-relaxed">
                Você escolheu converter esta simulação em uma despesa verdadeira. O dinheiro será debitado no banco escolhido abaixo.
              </p>

              {/* Qual Banco pagar? */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-mono font-medium text-slate-500">De qual conta debitar de fato?</label>
                <select
                  value={targetBank}
                  onChange={(e) => setTargetBank(e.target.value)}
                  className="py-2 px-3 rounded-lg border border-slate-200 text-slate-800 text-sm bg-white focus:outline-hidden focus:border-indigo-500"
                >
                  {banks.map(b => (
                    <option key={b.id} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Pagar agora ou agendar (pendente)? */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-mono font-medium text-slate-500">Status do pagamento real</label>
                <select
                  value={targetStatus}
                  onChange={(e) => setTargetStatus(e.target.value as any)}
                  className="py-2 px-3 rounded-lg border border-slate-200 text-slate-800 text-sm bg-white focus:outline-hidden focus:border-indigo-500"
                >
                  <option value="pago">Já Pago (Dedução imediata do saldo)</option>
                  <option value="pendente">A pagar / Agendada (Dedução futura do saldo)</option>
                </select>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsConvertOpen(false)}
                  className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 font-semibold cursor-pointer text-xs text-center"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold cursor-pointer text-xs text-center flex items-center justify-center gap-1 shadow-xs"
                >
                  Confirmar Compra
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
