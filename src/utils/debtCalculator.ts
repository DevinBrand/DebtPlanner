import { Debt, PaymentPlan, DebtSnowballResult, UserData } from '../types'

export function calculateDebtSnowball(userData: UserData): DebtSnowballResult {
  const { debts, monthlyIncome, budgetCategories } = userData
  
  const totalBudgetExpenses = budgetCategories.reduce((sum, cat) => sum + cat.amount, 0)
  const totalMinimumPayments = debts.reduce((sum, debt) => sum + debt.minimumPayment, 0)
  const extraPaymentAmount = Math.max(0, monthlyIncome - totalBudgetExpenses - totalMinimumPayments)

  // Sort debts by priority and balance (snowball method)
  const sortedDebts = [...debts].sort((a, b) => {
    // First sort by priority (high > medium > low)
    const priorityOrder = { high: 3, medium: 2, low: 1 }
    const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority]
    if (priorityDiff !== 0) return priorityDiff
    
    // Then by balance (smallest first for snowball method)
    return a.balance - b.balance
  })

  const paymentPlans: PaymentPlan[] = []
  const debtBalances = debts.map(debt => ({ ...debt, remainingBalance: debt.balance }))
  let month = 1
  let totalInterestPaid = 0
  let availableExtraPayment = extraPaymentAmount
  let completedDebts = new Set<string>()

  while (debtBalances.some(debt => debt.remainingBalance > 0 && !completedDebts.has(debt.id))) {
    // Calculate payments for this month
    for (const debt of debtBalances) {
      if (debt.remainingBalance <= 0 || completedDebts.has(debt.id)) continue

      const monthlyInterestRate = debt.interestRate / 100 / 12
      const interestPayment = debt.remainingBalance * monthlyInterestRate
      
      let totalPayment = debt.minimumPayment
      let principalPayment = debt.minimumPayment - interestPayment

      // Apply extra payment to the first debt in priority order that's not paid off
      const targetDebt = sortedDebts.find(d => 
        !completedDebts.has(d.id) && 
        debtBalances.find(db => db.id === d.id)?.remainingBalance! > 0
      )
      
      if (targetDebt && debt.id === targetDebt.id && availableExtraPayment > 0) {
        const extraForThisDebt = Math.min(availableExtraPayment, debt.remainingBalance - interestPayment)
        totalPayment += extraForThisDebt
        principalPayment += extraForThisDebt
        availableExtraPayment -= extraForThisDebt
      }

      // Ensure we don't pay more than the remaining balance
      if (totalPayment > debt.remainingBalance + interestPayment) {
        totalPayment = debt.remainingBalance + interestPayment
        principalPayment = debt.remainingBalance
      }

      const newBalance = Math.max(0, debt.remainingBalance - principalPayment)
      const isPayoffMonth = newBalance === 0

      paymentPlans.push({
        debt: debt,
        month,
        payment: totalPayment,
        principalPayment,
        interestPayment,
        remainingBalance: newBalance,
        isPayoffMonth
      })

      // Update debt balance
      const debtIndex = debtBalances.findIndex(d => d.id === debt.id)
      debtBalances[debtIndex].remainingBalance = newBalance
      
      if (isPayoffMonth) {
        completedDebts.add(debt.id)
        // Add this debt's minimum payment to available extra payment for next month
        availableExtraPayment += debt.minimumPayment
      }

      totalInterestPaid += interestPayment
    }

    month++
    
    // Safety check to prevent infinite loops
    if (month > 600) break // 50 years max
  }

  // Calculate interest saved compared to minimum payments only
  const interestWithMinimumOnly = calculateInterestWithMinimumPayments(debts)
  const totalInterestSaved = interestWithMinimumOnly - totalInterestPaid

  return {
    paymentPlans,
    totalInterestSaved,
    payoffOrder: sortedDebts,
    monthsToPayoff: month - 1
  }
}

function calculateInterestWithMinimumPayments(debts: Debt[]): number {
  let totalInterest = 0
  
  for (const debt of debts) {
    let balance = debt.balance
    const monthlyRate = debt.interestRate / 100 / 12
    const payment = debt.minimumPayment
    
    while (balance > 0) {
      const interestPayment = balance * monthlyRate
      const principalPayment = Math.min(payment - interestPayment, balance)
      
      if (principalPayment <= 0) break // Can't pay off with minimum payment
      
      totalInterest += interestPayment
      balance -= principalPayment
    }
  }
  
  return totalInterest
}

export function generatePaymentSchedule(result: DebtSnowballResult): any[] {
  const schedule: any[] = []
  
  // Group payment plans by month
  const monthlyPlans = result.paymentPlans.reduce((acc, plan) => {
    if (!acc[plan.month]) {
      acc[plan.month] = []
    }
    acc[plan.month].push(plan)
    return acc
  }, {} as Record<number, PaymentPlan[]>)
  
  for (let month = 1; month <= result.monthsToPayoff; month++) {
    const plans = monthlyPlans[month] || []
    const totalPayment = plans.reduce((sum, plan) => sum + plan.payment, 0)
    const totalPrincipal = plans.reduce((sum, plan) => sum + plan.principalPayment, 0)
    const totalInterest = plans.reduce((sum, plan) => sum + plan.interestPayment, 0)
    const totalRemaining = plans.reduce((sum, plan) => sum + plan.remainingBalance, 0)
    
    schedule.push({
      month,
      totalPayment,
      totalPrincipal,
      totalInterest,
      totalRemaining,
      debts: plans.map(plan => ({
        name: plan.debt.name,
        payment: plan.payment,
        principal: plan.principalPayment,
        interest: plan.interestPayment,
        balance: plan.remainingBalance,
        paidOff: plan.isPayoffMonth
      }))
    })
  }
  
  return schedule
}