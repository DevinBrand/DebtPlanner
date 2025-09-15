export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9)
}

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

export const formatPercentage = (rate: number): string => {
  return `${rate.toFixed(2)}%`
}