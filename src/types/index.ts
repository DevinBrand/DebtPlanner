export interface Debt {
  id: string;
  name: string;
  balance: number;
  minimumPayment: number;
  interestRate: number;
  type: 'credit_card' | 'student_loan' | 'auto_loan' | 'mortgage' | 'personal_loan' | 'other';
  priority: 'high' | 'medium' | 'low';
}

export interface BudgetCategory {
  name: string;
  amount: number;
  type: 'fixed' | 'variable';
}

export interface UserData {
  monthlyIncome: number;
  budgetCategories: BudgetCategory[];
  debts: Debt[];
  extraPaymentAmount?: number;
}

export interface PaymentPlan {
  debt: Debt;
  month: number;
  payment: number;
  principalPayment: number;
  interestPayment: number;
  remainingBalance: number;
  isPayoffMonth: boolean;
}

export interface DebtSnowballResult {
  paymentPlans: PaymentPlan[];
  totalInterestSaved: number;
  payoffOrder: Debt[];
  monthsToPayoff: number;
}