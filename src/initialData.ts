import { Transaction, SavingGoal, BankAccount } from './types';

export const INITIAL_BANKS: BankAccount[] = [
  { id: '1', name: 'Nubank', color: 'from-purple-600 to-purple-800 text-white', initialBalance: 1250.00 },
  { id: '2', name: 'Itaú', color: 'from-orange-500 to-blue-800 text-white', initialBalance: 2800.00 },
  { id: '3', name: 'Inter', color: 'from-amber-500 to-amber-600 text-white', initialBalance: 640.00 },
  { id: '4', name: 'Carteira (Efetivo)', color: 'from-emerald-600 to-emerald-700 text-white', initialBalance: 150.00 }
];

export const INITIAL_TRANSACTIONS: Transaction[] = [
  {
    id: 't1',
    description: 'Salário Mensal',
    amount: 40500.00,
    type: 'receita',
    category: 'Salário',
    bank: 'Itaú',
    status: 'pago',
    date: '2026-06-05',
    notes: 'Salário líquido mensal'
  },
  {
    id: 't2',
    description: 'Projeto Freelance UX',
    amount: 1200.00,
    type: 'receita',
    category: 'Freelance',
    bank: 'Inter',
    status: 'pago',
    date: '2026-06-12',
    notes: 'Desenho de interfaces para aplicativo'
  },
  {
    id: 't3',
    description: 'Rendimento CDB',
    amount: 45.50,
    type: 'receita',
    category: 'Investimentos',
    bank: 'Nubank',
    status: 'pago',
    date: '2026-06-15'
  },
  {
    id: 't4',
    description: 'Aluguel do Apartamento',
    amount: 1500.00,
    type: 'despesa',
    category: 'Moradia',
    bank: 'Itaú',
    status: 'pago',
    date: '2026-06-06'
  },
  {
    id: 't5',
    description: 'Supermercado Mensal',
    amount: 680.40,
    type: 'despesa',
    category: 'Alimentação',
    bank: 'Itaú',
    status: 'pago',
    date: '2026-06-07'
  },
  {
    id: 't6',
    description: 'Assinatura Netflix',
    amount: 55.90,
    type: 'despesa',
    category: 'Assinaturas',
    bank: 'Nubank',
    status: 'pago',
    date: '2026-06-10'
  },
  {
    id: 't7',
    description: 'Gasolina Semanal',
    amount: 180.00,
    type: 'despesa',
    category: 'Transporte',
    bank: 'Nubank',
    status: 'pago',
    date: '2026-06-11'
  },
  {
    id: 't8',
    description: 'Jantar em Restaurante Japonez',
    amount: 154.00,
    type: 'despesa',
    category: 'Lazer',
    bank: 'Carteira (Efetivo)',
    status: 'pago',
    date: '2026-06-14'
  },
  {
    id: 't9',
    description: 'Conta de Energia (Celpe)',
    amount: 220.00,
    type: 'despesa',
    category: 'Moradia',
    bank: 'Itaú',
    status: 'pendente',
    date: '2026-06-25',
    notes: 'Vencerá no final do mês'
  },
  {
    id: 't10',
    description: 'Curso de Finanças Pessoais',
    amount: 350.00,
    type: 'despesa',
    category: 'Educação',
    bank: 'Nubank',
    status: 'pendente',
    date: '2026-06-28',
    notes: 'Acesso vitalício à plataforma'
  },
  {
    id: 't11',
    description: 'Novo Smartwatch Pro',
    amount: 899.00,
    type: 'despesa',
    category: 'Lazer',
    bank: 'Nubank',
    status: 'futuro',
    date: '2026-07-15',
    notes: 'Estou pensando em comprar se sobrar orçamento neste mês'
  },
  {
    id: 't12',
    description: 'Viagem de Fim de Semana (Praia)',
    amount: 600.00,
    type: 'despesa',
    category: 'Lazer',
    bank: 'Inter',
    status: 'futuro',
    date: '2026-07-20',
    notes: 'Depende de conseguir poupar a meta planejada'
  }
];

export const INITIAL_GOALS: SavingGoal[] = [
  {
    id: 'g1',
    name: 'Reserva de Emergência',
    targetAmount: 10000.00,
    currentAmount: 4200.00,
    deadline: '2026-12-31',
    category: 'Segurança'
  },
  {
    id: 'g2',
    name: 'Troca de Smartphone',
    targetAmount: 3000.00,
    currentAmount: 1500.00,
    deadline: '2026-09-30',
    category: 'Tecnologia'
  },
  {
    id: 'g3',
    name: 'Viagem de Férias',
    targetAmount: 5000.00,
    currentAmount: 800.00,
    deadline: '2026-11-20',
    category: 'Viagem'
  }
];

export const TRANSACTION_CATEGORIES = {
  receita: ['Salário', 'Freelance', 'Investimentos', 'Premios', 'Outros'],
  despesa: ['Moradia', 'Alimentação', 'Transporte', 'Saúde', 'Educação', 'Lazer', 'Assinaturas', 'Seguros', 'Doações', 'Outros']
};
