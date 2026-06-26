import React, { useState, useMemo } from 'react';
import { Transaction, BankAccount } from '../types';
import { TRANSACTION_CATEGORIES } from '../initialData';
import { 
  Plus, 
  Search, 
  Filter, 
  Trash2, 
  Edit, 
  CheckCircle, 
  Clock, 
  Calendar, 
  ArrowUpRight, 
  ArrowDownRight,
  TrendingUp,
  TrendingDown,
  Sparkles,
  ChevronDown,
  X
} from 'lucide-react';

interface TransactionsViewProps {
  transactions: Transaction[];
  banks: BankAccount[];
  onAddTransaction: (transaction: Omit<Transaction, 'id'>) => void;
  onEditTransaction: (transaction: Transaction) => void;
  onDeleteTransaction: (id: string) => void;
  onToggleStatus: (id: string) => void;
  initialFilterStatus?: string;
}

export default function TransactionsView({
  transactions,
  banks,
  onAddTransaction,
  onEditTransaction,
  onDeleteTransaction,
  onToggleStatus,
  initialFilterStatus = 'all'
}: TransactionsViewProps) {
  // Filter States
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'receita' | 'despesa'>('all');
  const [filterStatus, setFilterStatus] = useState<string>(initialFilterStatus);
  const [filterBank, setFilterBank] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  
  // Create / Edit Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);

  // Form Fields
  const [formType, setFormType] = useState<'receita' | 'despesa'>('despesa');
  const [formDescription, setFormDescription] = useState('');
  const [formAmount, setFormAmount] = useState<number>(0);
  const [formBank, setFormBank] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formDate, setFormDate] = useState(new Date().toISOString().split('T')[0]);
  const [formStatus, setFormStatus] = useState<'pago' | 'pendente' | 'futuro'>('pago');
  const [formNotes, setFormNotes] = useState('');

  // Preset categories based on form type
  const availableCategories = useMemo(() => {
    return TRANSACTION_CATEGORIES[formType];
  }, [formType]);

  // Handle open form for NEW transaction
  const handleNewTransaction = () => {
    setEditingTransaction(null);
    setFormType('despesa');
    setFormDescription('');
    setFormAmount(0);
    setFormBank(banks[0]?.name || 'Nubank');
    setFormCategory(TRANSACTION_CATEGORIES.despesa[0]);
    setFormDate(new Date().toISOString().split('T')[0]);
    setFormStatus('pago');
    setFormNotes('');
    setIsFormOpen(true);
  };

  // Handle open form for EDITING transaction
  const handleEditClick = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setFormType(transaction.type);
    setFormDescription(transaction.description);
    setFormAmount(transaction.amount);
    setFormBank(transaction.bank);
    setFormCategory(transaction.category);
    setFormDate(transaction.date);
    setFormStatus(transaction.status);
    setFormNotes(transaction.notes || '');
    setIsFormOpen(true);
  };

  // Submit form handler
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formDescription || formAmount <= 0) {
      alert('Por favor, defina um nome e um valor maior que zero!');
      return;
    }

    const transactionData = {
      description: formDescription,
      amount: formAmount,
      type: formType,
      category: formCategory || (formType === 'receita' ? TRANSACTION_CATEGORIES.receita[0] : TRANSACTION_CATEGORIES.despesa[0]),
      bank: formBank || (banks[0]?.name || 'Nubank'),
      status: formStatus,
      date: formDate,
      notes: formNotes || undefined
    };

    if (editingTransaction) {
      onEditTransaction({
        id: editingTransaction.id,
        ...transactionData
      });
    } else {
      onAddTransaction(transactionData);
    }
    setIsFormOpen(false);
  };

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchSearch = t.description.toLowerCase().includes(search.toLowerCase()) || 
                          (t.notes || '').toLowerCase().includes(search.toLowerCase());
      const matchType = filterType === 'all' || t.type === filterType;
      
      let matchStatus = true;
      if (filterStatus !== 'all') {
        matchStatus = t.status === filterStatus;
      }

      const matchBank = filterBank === 'all' || t.bank === filterBank;
      const matchCategory = filterCategory === 'all' || t.category === filterCategory;

      return matchSearch && matchType && matchStatus && matchBank && matchCategory;
    }).sort((a, b) => b.date.localeCompare(a.date)); // descending order
  }, [transactions, search, filterType, filterStatus, filterBank, filterCategory]);

  return (
    <div className="space-y-6" id="transactions-view-container">
      {/* Header com Ação */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-800">Lançamentos Financeiros</h2>
          <p className="text-sm text-slate-500">Controles de despesas pagas, contas a vencer e compras futuras planejadas.</p>
        </div>
        <button 
          onClick={handleNewTransaction}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer transition-all duration-200 self-stretch sm:self-auto text-center justify-center shadow-xs"
          id="btn-new-transaction"
        >
          <Plus className="h-4 w-4" />
          Novo Lançamento
        </button>
      </div>

      {/* Grid de Filtros */}
      <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-xs space-y-4" id="filters-container">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Caixa de Busca */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
            <input 
              type="text"
              placeholder="Pesquisar por transação..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 text-slate-700 bg-slate-50/50 focus:bg-white focus:outline-hidden focus:border-indigo-500 transition-all text-sm"
              id="search-input"
            />
          </div>

          {/* Filtro de Tipo */}
          <div className="flex bg-slate-100/70 p-1 rounded-xl shrink-0" id="filter-type-picker">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${filterType === 'all' ? 'bg-white text-slate-800 shadow-2xs' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterType('receita')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${filterType === 'receita' ? 'bg-emerald-500 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Receitas
            </button>
            <button
              onClick={() => setFilterType('despesa')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${filterType === 'despesa' ? 'bg-rose-500 text-white shadow-2xs' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Despesas
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-3 border-t border-slate-50">
          {/* Filtro de Status */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono font-medium text-slate-500">Status do Pagamento</label>
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="w-full py-2 px-3 rounded-lg border border-slate-200 text-slate-600 bg-slate-50 text-sm focus:outline-hidden focus:border-indigo-500"
            >
              <option value="all">Ver Tudo</option>
              <option value="pago">Pago / Recebido</option>
              <option value="pendente">Pendente (Vou Pagar)</option>
              <option value="futuro">Planejado (Compra Futura)</option>
            </select>
          </div>

          {/* Filtro de Conta/Banco */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono font-medium text-slate-500">Banco / Conta</label>
            <select
              value={filterBank}
              onChange={(e) => setFilterBank(e.target.value)}
              className="w-full py-2 px-3 rounded-lg border border-slate-200 text-slate-600 bg-slate-50 text-sm focus:outline-hidden focus:border-indigo-500"
            >
              <option value="all">Todos os Bancos</option>
              {banks.map(b => (
                <option key={b.id} value={b.name}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Filtro de Categoria */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-mono font-medium text-slate-500">Categoria</label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full py-2 px-3 rounded-lg border border-slate-200 text-slate-600 bg-slate-50 text-sm focus:outline-hidden focus:border-indigo-500"
            >
              <option value="all">Todas as Categorias</option>
              {[...TRANSACTION_CATEGORIES.receita, ...TRANSACTION_CATEGORIES.despesa].map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Lista Principal de Lançamentos */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden" id="transactions-list-container">
        {filteredTransactions.length === 0 ? (
          <div className="py-16 text-center text-slate-400 font-sans flex flex-col items-center justify-center gap-2">
            <X className="h-8 w-8 text-slate-300" />
            <p className="font-semibold text-slate-600">Nenhum lançamento encontrado.</p>
            <p className="text-xs text-slate-400">Verifique os filtros selecionados ou cadastre um novo lançamento.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50/50 border-b border-slate-100 text-[11px] font-mono uppercase tracking-wider text-slate-400 font-bold">
                  <th className="py-3 px-6">Status</th>
                  <th className="py-3 px-4">Análise / Data</th>
                  <th className="py-3 px-4">Descrição</th>
                  <th className="py-3 px-4">Banco</th>
                  <th className="py-3 px-4">Categoria</th>
                  <th className="py-3 px-4 text-right">Valor</th>
                  <th className="py-3 px-6 text-center">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 text-slate-700 text-sm font-sans" id="tbl-transactions-body">
                {filteredTransactions.map(t => {
                  const isExpense = t.type === 'despesa';
                  
                  return (
                    <tr key={t.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Status */}
                      <td className="py-4 px-6">
                        <button
                          onClick={() => onToggleStatus(t.id)}
                          className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold cursor-pointer select-none transition-all duration-200 ${
                            t.status === 'pago' 
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100' 
                              : t.status === 'pendente' 
                                ? 'bg-amber-50 text-amber-700 hover:bg-amber-100' 
                                : 'bg-purple-50 text-purple-700 hover:bg-purple-100'
                          }`}
                          title="Clique para alternar o status do pagamento"
                          id={`status-badge-${t.id}`}
                        >
                          {t.status === 'pago' ? (
                            <>
                              <CheckCircle className="h-3 w-3 text-emerald-500" />
                              <span>Pago</span>
                            </>
                          ) : t.status === 'pendente' ? (
                            <>
                              <Clock className="h-3 w-3 text-amber-500 animate-pulse" />
                              <span>Pendente</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-3 w-3 text-purple-500" />
                              <span>Planejado</span>
                            </>
                          )}
                        </button>
                      </td>

                      {/* data */}
                      <td className="py-4 px-4 font-mono text-xs text-slate-500">
                        <div className="flex items-center gap-1.5">
                          <Calendar className="h-3.5 w-3.5" />
                          {t.date}
                        </div>
                      </td>

                      {/* descrição */}
                      <td className="py-4 px-4 font-medium max-w-[220px]">
                        <div className="truncate text-slate-800" title={t.description}>{t.description}</div>
                        {t.notes && <div className="text-[10px] text-slate-400 font-mono truncate">{t.notes}</div>}
                      </td>

                      {/* banco de onde o dinheiro saiu ou para onde entrou */}
                      <td className="py-4 px-4">
                        <span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 text-xs font-mono font-medium">
                          {t.bank}
                        </span>
                      </td>

                      {/* categoria */}
                      <td className="py-4 px-4">
                        <span className="text-slate-500 text-xs font-medium bg-slate-100 px-2 py-1 rounded-md">
                          {t.category}
                        </span>
                      </td>

                      {/* valor */}
                      <td className="py-4 px-4 text-right">
                        <span className={`font-mono font-bold text-sm ${isExpense ? 'text-rose-600' : 'text-emerald-600'}`}>
                          {isExpense ? '-' : '+'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </span>
                      </td>

                      {/* ações */}
                      <td className="py-4 px-6 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <button
                            onClick={() => handleEditClick(t)}
                            className="p-1 px-1.5 hover:bg-slate-100 rounded-md text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                            title="Editar lançamento"
                            id={`btn-edit-${t.id}`}
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm('Tem certeza de que deseja excluir este lançamento?')) {
                                onDeleteTransaction(t.id);
                              }
                            }}
                            className="p-1 px-1.5 hover:bg-rose-50 rounded-md text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                            title="Excluir lançamento"
                            id={`btn-delete-${t.id}`}
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
        )}
      </div>

      {/* Modal Lateral / Formulário de Cadastro e Edição */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex justify-end z-50 animate-fade-in" id="form-modal-overlay">
          <div className="bg-white w-full max-w-md h-full p-6 overflow-y-auto flex flex-col justify-between shadow-xl" id="form-modal-content">
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <h3 className="text-lg font-bold font-sans text-slate-800">
                  {editingTransaction ? 'Editar Lançamento' : 'Novo Lançamento'}
                </h3>
                <button 
                  onClick={() => setIsFormOpen(false)}
                  className="p-1 px-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4" id="frm-transaction">
                {/* Tipo de Lançamento */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-mono font-medium text-slate-500">Tipo</label>
                  <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-xl">
                    <button
                      type="button"
                      onClick={() => {
                        setFormType('despesa');
                        // Reset category if invalid
                        setFormCategory(TRANSACTION_CATEGORIES.despesa[0]);
                      }}
                      className={`py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${formType === 'despesa' ? 'bg-rose-500 text-white shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <span className="flex items-center justify-center gap-1">
                        <TrendingDown className="h-3 w-3" />
                        Despesa (- OUT)
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setFormType('receita');
                        // Reset category if invalid
                        setFormCategory(TRANSACTION_CATEGORIES.receita[0]);
                      }}
                      className={`py-2 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${formType === 'receita' ? 'bg-emerald-500 text-white shadow-xs' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      <span className="flex items-center justify-center gap-1">
                        <TrendingUp className="h-3 w-3" />
                        Receita (+ IN)
                      </span>
                    </button>
                  </div>
                </div>

                {/* Descrição */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-mono font-medium text-slate-500">Descrição / Título</label>
                  <input 
                    type="text"
                    required
                    maxLength={100}
                    placeholder="Ex: Aluguel mensal, Salário, Compra mercado..."
                    value={formDescription}
                    onChange={(e) => setFormDescription(e.target.value)}
                    className="py-2.5 px-3 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                {/* Valor */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-mono font-medium text-slate-500">Valor (R$)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold font-mono text-slate-400">R$</span>
                    <input 
                      type="number"
                      required
                      step="0.01"
                      min="0.01"
                      placeholder="0.00"
                      value={formAmount || ''}
                      onChange={(e) => setFormAmount(parseFloat(e.target.value) || 0)}
                      className="w-full py-2.5 pl-9 pr-3 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-hidden focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                {/* Dynamic Bank Account selector */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-mono font-medium text-slate-500">
                    {formType === 'receita' ? 'Banco / Conta de Destino (+ entrou)' : 'Banco / Conta de Origem (- saiu)'}
                  </label>
                  <select
                    value={formBank}
                    onChange={(e) => setFormBank(e.target.value)}
                    className="py-2.5 px-3 rounded-lg border border-slate-200 text-slate-800 text-sm bg-white focus:outline-hidden focus:border-indigo-500"
                  >
                    {banks.map(b => (
                      <option key={b.id} value={b.name}>{b.name}</option>
                    ))}
                  </select>
                </div>

                {/* Dynamic Category based on type */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-mono font-medium text-slate-500">Categoria</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="py-2.5 px-3 rounded-lg border border-slate-200 text-slate-800 text-sm bg-white focus:outline-hidden focus:border-indigo-500"
                  >
                    {availableCategories.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>

                {/* Vencimento / Data */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-mono font-medium text-slate-500">Data / Vencimento</label>
                  <input 
                    type="date"
                    required
                    value={formDate}
                    onChange={(e) => setFormDate(e.target.value)}
                    className="py-2.5 px-3 rounded-lg border border-slate-200 text-slate-850 text-sm focus:outline-hidden focus:border-indigo-500 font-mono"
                  />
                </div>

                {/* Status: Pago, Pendente, Futuro */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-mono font-medium text-slate-500">Status Financeiro</label>
                  <select
                    value={formStatus}
                    onChange={(e) => setFormStatus(e.target.value as any)}
                    className="py-2.5 px-3 rounded-lg border border-slate-200 text-slate-800 text-sm bg-white focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="pago">Já Realizado (Paga / Recebida)</option>
                    <option value="pendente">Pendente de Pagamento (Vou Pagar)</option>
                    <option value="futuro">Futura Planejada (Estou pensando em comprar / Lista de Desejos)</option>
                  </select>
                </div>

                {/* Notas / Descrição extra */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-mono font-medium text-slate-500">Observações adicionais (opcional)</label>
                  <textarea 
                    placeholder="Insira notas sobre a compra..."
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    rows={2}
                    className="py-2.5 px-3 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-hidden focus:border-indigo-500"
                  />
                </div>
              </form>
            </div>

            <div className="pt-4 border-t border-slate-100 flex gap-3">
              <button
                type="button"
                onClick={() => setIsFormOpen(false)}
                className="flex-1 py-2.5 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 font-semibold cursor-pointer text-sm text-center"
              >
                Cancelar
              </button>
              <button
                type="submit"
                form="frm-transaction"
                className="flex-1 py-2.5 rounded-lg bg-indigo-650 hover:bg-indigo-700 text-white font-semibold cursor-pointer text-sm text-center shadow-xs"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
