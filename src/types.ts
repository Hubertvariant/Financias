export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: 'receita' | 'despesa';
  category: string;
  bank: string; // ex: "Nubank", "Itaú", "Caixa", "Dinheiro em Espécie"
  status: 'pago' | 'pendente' | 'futuro'; // pago, pendente de pagamento, ou futuro (coisas que planeja comprar)
  date: string; // YYYY-MM-DD
  notes?: string;
}

export interface SavingGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string; // YYYY-MM-DD
  category?: string;
}

export interface BankAccount {
  id: string;
  name: string;
  color: string; // tailwind classes or hex strings
  initialBalance: number;
}
