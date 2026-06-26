import React, { useState } from 'react';
import { SavingGoal, BankAccount } from '../types';
import { 
  PiggyBank, 
  Plus, 
  Trash2, 
  Edit, 
  Target, 
  Calendar, 
  TrendingUp, 
  ChevronRight, 
  ArrowRight,
  PlusCircle,
  TrendingDown,
  X 
} from 'lucide-react';

interface GoalsViewProps {
  goals: SavingGoal[];
  banks: BankAccount[];
  onAddGoal: (goal: Omit<SavingGoal, 'id'>) => void;
  onEditGoal: (goal: SavingGoal) => void;
  onDeleteGoal: (id: string) => void;
  onSaveToGoal: (goalId: string, amount: number, bankName: string) => void;
}

export default function GoalsView({
  goals,
  banks,
  onAddGoal,
  onEditGoal,
  onDeleteGoal,
  onSaveToGoal
}: GoalsViewProps) {
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SavingGoal | null>(null);

  // Form Fields
  const [formName, setFormName] = useState('');
  const [formTargetAmount, setFormTargetAmount] = useState<number>(0);
  const [formCurrentAmount, setFormCurrentAmount] = useState<number>(0);
  const [formDeadline, setFormDeadline] = useState(new Date().toISOString().split('T')[0]);
  const [formCategory, setFormCategory] = useState('Geral');

  // Deposit Modal state
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [selectedGoalId, setSelectedGoalId] = useState<string | null>(null);
  const [depositAmount, setDepositAmount] = useState<number>(0);
  const [depositBank, setDepositBank] = useState(banks[0]?.name || 'Nubank');

  // Handle open form for NEW goal
  const handleNewGoal = () => {
    setEditingGoal(null);
    setFormName('');
    setFormTargetAmount(0);
    setFormCurrentAmount(0);
    setFormDeadline(new Date().toISOString().split('T')[0]);
    setFormCategory('Geral');
    setIsFormOpen(true);
  };

  // Handle open form for EDITING goal
  const handleEditClick = (goal: SavingGoal) => {
    setEditingGoal(goal);
    setFormName(goal.name);
    setFormTargetAmount(goal.targetAmount);
    setFormCurrentAmount(goal.currentAmount);
    setFormDeadline(goal.deadline);
    setFormCategory(goal.category || 'Geral');
    setIsFormOpen(true);
  };

  // Handle deposit click
  const handleDepositClick = (goalId: string) => {
    setSelectedGoalId(goalId);
    setDepositAmount(0);
    setDepositBank(banks[0]?.name || 'Nubank');
    setIsDepositOpen(true);
  };

  // Submit Goal Form
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName || formTargetAmount <= 0) {
      alert('Preencha os campos corretamente!');
      return;
    }

    const goalData = {
      name: formName,
      targetAmount: formTargetAmount,
      currentAmount: formCurrentAmount,
      deadline: formDeadline,
      category: formCategory
    };

    if (editingGoal) {
      onEditGoal({
        ...editingGoal,
        ...goalData
      });
    } else {
      onAddGoal(goalData);
    }
    setIsFormOpen(false);
  };

  // Submit Deposit
  const handleDepositSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGoalId || depositAmount <= 0) {
      alert('Insira um valor válido de poupança!');
      return;
    }

    onSaveToGoal(selectedGoalId, depositAmount, depositBank);
    setIsDepositOpen(false);
  };

  return (
    <div className="space-y-6" id="goals-view-container">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold font-sans text-slate-800">Metas de Economia</h2>
          <p className="text-sm text-slate-500">Defina objetivos financeiros de médio/longo prazo e poupe dinheiro de seus bancos de forma integrada.</p>
        </div>
        <button 
          onClick={handleNewGoal}
          className="bg-emerald-650 hover:bg-emerald-700 text-white px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 cursor-pointer transition-all duration-200 self-stretch sm:self-auto text-center justify-center shadow-xs"
          id="btn-new-goal"
        >
          <Plus className="h-4 w-4" />
          Nova Meta
        </button>
      </div>

      {/* Grid de Metas */}
      {goals.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-100 shadow-xs flex flex-col items-center justify-center gap-3">
          <PiggyBank className="h-12 w-12 text-slate-350" />
          <div>
            <h4 className="font-bold text-slate-700 text-base">Você ainda não tem metas de economia ativas</h4>
            <p className="text-sm text-slate-400 mt-1 max-w-sm mx-auto">Definir objetivos é o primeiro passo para o sucesso financeiro. Que tal criar uma meta de Reserva de Emergência hoje?</p>
          </div>
          <button 
            onClick={handleNewGoal}
            className="mt-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs px-4 py-2 rounded-lg cursor-pointer"
          >
            Quero Criar Minha Primeira Meta
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" id="goals-grid">
          {goals.map(goal => {
            const progressPct = Math.min(100, (goal.currentAmount / goal.targetAmount) * 100);
            const remainingVal = Math.max(0, goal.targetAmount - goal.currentAmount);

            return (
              <div 
                key={goal.id} 
                className="bg-white p-6 rounded-2xl border border-slate-100 shadow-xs flex flex-col justify-between hover:border-slate-200 transition-colors"
                id={`goal-item-${goal.id}`}
              >
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 font-mono text-[10px] font-semibold tracking-wide uppercase">
                        {goal.category || 'Geral'}
                      </span>
                      <h4 className="font-bold text-slate-800 text-base mt-2 truncate" title={goal.name}>{goal.name}</h4>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        onClick={() => handleEditClick(goal)}
                        className="p-1 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"
                        title="Modificar Meta"
                      >
                        <Edit className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Tem certeza de que deseja apagar a meta "${goal.name}"?`)) {
                            onDeleteGoal(goal.id);
                          }
                        }}
                        className="p-1 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                        title="Excluir Meta"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Informações de Metas - Valores */}
                  <div className="mt-4 grid grid-cols-2 gap-2 text-slate-600">
                    <div>
                      <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Guardado</p>
                      <p className="font-sans font-bold text-emerald-600 text-lg">
                        R$ {goal.currentAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] uppercase font-mono tracking-wider text-slate-400">Objetivo</p>
                      <p className="font-sans font-semibold text-slate-800 text-lg">
                        R$ {goal.targetAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>

                  {/* Barra de Progresso */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex justify-between items-center text-xs text-slate-500">
                      <span>Progresso acumulado</span>
                      <span className="font-mono font-bold text-slate-700">{progressPct.toFixed(1)}%</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full bg-gradient-to-r duration-300 ${progressPct >= 100 ? 'from-emerald-400 to-emerald-600 animate-pulse' : 'from-emerald-500 to-indigo-500'}`}
                        style={{ width: `${progressPct}%` }}
                      ></div>
                    </div>
                  </div>

                  {/* Detalhes Finais de Prazo */}
                  <div className="mt-4 pt-4 border-t border-slate-50 flex items-center justify-between text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5" />
                      Prazo: {goal.deadline}
                    </span>
                    {remainingVal > 0 ? (
                      <span className="font-medium text-slate-500">Falta R$ {remainingVal.toFixed(2)}</span>
                    ) : (
                      <span className="font-bold text-emerald-600 flex items-center gap-1">🎉 Concluído!</span>
                    )}
                  </div>
                </div>

                {/* Ação para Poupar para essa meta */}
                {remainingVal > 0 && (
                  <button
                    onClick={() => handleDepositClick(goal.id)}
                    className="mt-5 w-full bg-slate-50/70 hover:bg-emerald-50 text-slate-600 hover:text-emerald-700 hover:border-emerald-200 border border-slate-200/60 py-2 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer shadow-2xs"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Poupado / Depositar nesta Meta
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de Meta - Criar / Editar */}
      {isFormOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex justify-end z-50 animate-fade-in">
          <div className="bg-white w-full max-w-md h-full p-6 overflow-y-auto flex flex-col justify-between shadow-xl">
            <div className="space-y-6">
              <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                <h3 className="text-lg font-bold font-sans text-slate-800">
                  {editingGoal ? 'Editar Meta de Economia' : 'Nova Meta de Economia'}
                </h3>
                <button 
                  onClick={() => setIsFormOpen(false)}
                  className="p-1 px-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleFormSubmit} className="space-y-4" id="frm-goal">
                {/* Nome */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-mono font-medium text-slate-500">Objetivo / Nome da Meta</label>
                  <input 
                    type="text"
                    required
                    maxLength={100}
                    placeholder="Ex: Reserva de Emergência, Comprar Carro, Férias..."
                    value={formName}
                    onChange={(e) => setFormName(e.target.value)}
                    className="py-2.5 px-3 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                {/* Categoria */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-mono font-medium text-slate-500">Categoria da Meta</label>
                  <select
                    value={formCategory}
                    onChange={(e) => setFormCategory(e.target.value)}
                    className="py-2.5 px-3 rounded-lg border border-slate-200 text-slate-800 text-sm bg-white focus:outline-hidden focus:border-indigo-500"
                  >
                    <option value="Segurança">Segurança (Reservas, Seguros)</option>
                    <option value="Tecnologia">Tecnologia (Smartphones, Computadores)</option>
                    <option value="Viagem">Viagens e Lazer</option>
                    <option value="Sonhos">Investimentos e Longo Prazo</option>
                    <option value="Outros">Outros Objetivos</option>
                  </select>
                </div>

                {/* Valor Alvo */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-mono font-medium text-slate-500">Valor Alvo (R$)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold font-mono text-slate-400">R$</span>
                    <input 
                      type="number"
                      required
                      step="0.01"
                      min="1"
                      placeholder="0.00"
                      value={formTargetAmount || ''}
                      onChange={(e) => setFormTargetAmount(parseFloat(e.target.value) || 0)}
                      className="w-full py-2.5 pl-9 pr-3 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-hidden focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                {/* Valor Já Guardado */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-mono font-medium text-slate-500">Valor já acumulado de partida (R$)</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-xs font-bold font-mono text-slate-400">R$</span>
                    <input 
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      value={formCurrentAmount || ''}
                      onChange={(e) => setFormCurrentAmount(parseFloat(e.target.value) || 0)}
                      className="w-full py-2.5 pl-9 pr-3 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-hidden focus:border-indigo-500 font-mono"
                    />
                  </div>
                </div>

                {/* Prazo */}
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-mono font-medium text-slate-500">Prazo de conclusão</label>
                  <input 
                    type="date"
                    required
                    value={formDeadline}
                    onChange={(e) => setFormDeadline(e.target.value)}
                    className="py-2.5 px-3 rounded-lg border border-slate-200 text-slate-1000 text-sm focus:outline-hidden focus:border-indigo-500 font-mono"
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
                form="frm-goal"
                className="flex-1 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer text-sm text-center shadow-xs"
              >
                Salvar Meta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Depósito (Guardar para a Meta puxando dinheiro de uma conta) */}
      {isDepositOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-xs flex items-center justify-center z-50 animate-fade-in" id="deposit-modal-overlay">
          <div className="bg-white rounded-2xl p-6 w-full max-w-sm shadow-xl space-y-5 border border-slate-100" id="deposit-modal-content">
            <div className="flex justify-between items-center pb-3 border-b border-indigo-50">
              <h3 className="text-sm font-bold font-sans text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <PiggyBank className="h-5 w-5 text-emerald-500" />
                Depositar na poupança
              </h3>
              <button 
                onClick={() => setIsDepositOpen(false)}
                className="p-1 rounded-lg hover:bg-slate-100 text-slate-450 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleDepositSubmit} className="space-y-4" id="frm-deposit">
              {/* De qual Banco? */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-mono font-medium text-slate-500 flex items-center gap-1">
                  <TrendingDown className="h-3 w-3 text-rose-500" />
                  De qual banco sairá o dinheiro poupado?
                </label>
                <select
                  value={depositBank}
                  onChange={(e) => setDepositBank(e.target.value)}
                  className="py-2 px-3 rounded-lg border border-slate-200 text-slate-800 text-sm bg-white focus:outline-hidden focus:border-indigo-500"
                >
                  {banks.map(b => (
                    <option key={b.id} value={b.name}>{b.name}</option>
                  ))}
                </select>
              </div>

              {/* Quanto poupou? */}
              <div className="flex flex-col gap-1">
                <label className="text-xs font-mono font-medium text-slate-500 flex items-center gap-1">
                  <TrendingUp className="h-3 w-3 text-emerald-500" />
                  Quanto deseja guardar nesta meta?
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs font-bold font-mono text-slate-400">R$</span>
                  <input 
                    type="number"
                    required
                    step="0.01"
                    min="0.01"
                    placeholder="0.00"
                    value={depositAmount || ''}
                    onChange={(e) => setDepositAmount(parseFloat(e.target.value) || 0)}
                    className="w-full py-2 pl-9 pr-3 rounded-lg border border-slate-200 text-slate-800 text-sm focus:outline-hidden focus:border-indigo-500 font-mono font-semibold"
                  />
                </div>
              </div>

              <div className="pt-2 flex gap-3">
                <button
                  type="button"
                  onClick={() => setIsDepositOpen(false)}
                  className="flex-1 py-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 font-semibold cursor-pointer text-xs text-center"
                >
                  Não, Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold cursor-pointer text-xs text-center flex items-center justify-center gap-1 shadow-xs"
                >
                  Poupar Agora
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
