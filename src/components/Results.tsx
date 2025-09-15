import { useEffect } from 'react'
import {
  Paper,
  Title,
  Text,
  Grid,
  Card,
  Table,
  Badge,
  Timeline,
  Alert,
  Progress,
  Group,
  Stack,
} from '@mantine/core'
import { IconTrophy, IconCalendar, IconCurrencyDollar, IconChartLine } from '@tabler/icons-react'
import { UserData, DebtSnowballResult } from '../types'
import { calculateDebtSnowball, generatePaymentSchedule } from '../utils/debtCalculator'
import { formatCurrency, formatPercentage } from '../utils/helpers'

interface ResultsProps {
  userData: UserData
  results: DebtSnowballResult | null
  setResults: (results: DebtSnowballResult) => void
}

export function Results({ userData, results, setResults }: ResultsProps) {
  useEffect(() => {
    if (userData.debts.length > 0 && userData.monthlyIncome > 0) {
      const calculatedResults = calculateDebtSnowball(userData)
      setResults(calculatedResults)
    }
  }, [userData, setResults])

  if (!results || userData.debts.length === 0) {
    return (
      <Alert color="blue" title="Ready to Calculate">
        Complete the previous steps to see your personalized debt payoff plan.
      </Alert>
    )
  }

  const totalDebtAmount = userData.debts.reduce((sum, debt) => sum + debt.balance, 0)
  const totalMinimumPayments = userData.debts.reduce((sum, debt) => sum + debt.minimumPayment, 0)
  const totalBudgetExpenses = userData.budgetCategories.reduce((sum, cat) => sum + cat.amount, 0)
  const extraPaymentAmount = Math.max(0, userData.monthlyIncome - totalBudgetExpenses - totalMinimumPayments)
  const paymentSchedule = generatePaymentSchedule(results)

  const yearsToPayoff = Math.floor(results.monthsToPayoff / 12)
  const remainingMonths = results.monthsToPayoff % 12

  return (
    <Stack gap="lg">
      <Paper p="md" withBorder>
        <Group justify="space-between" mb="md">
          <Title order={3}>Your Debt Freedom Plan</Title>
          <Badge size="lg" color="green" leftSection={<IconTrophy size={16} />}>
            Optimized Strategy
          </Badge>
        </Group>
        
        <Grid>
          <Grid.Col span={6}>
            <Card withBorder h="100%">
              <Group gap="xs" mb="xs">
                <IconCalendar size={20} color="var(--mantine-color-blue-6)" />
                <Text size="sm" c="dimmed">Time to Freedom</Text>
              </Group>
              <Text size="xl" fw={700} c="blue">
                {yearsToPayoff > 0 && `${yearsToPayoff} year${yearsToPayoff > 1 ? 's' : ''}`}
                {yearsToPayoff > 0 && remainingMonths > 0 && ', '}
                {remainingMonths > 0 && `${remainingMonths} month${remainingMonths > 1 ? 's' : ''}`}
              </Text>
              <Text size="xs" c="dimmed" mt="xs">
                {results.monthsToPayoff} total months
              </Text>
            </Card>
          </Grid.Col>
          
          <Grid.Col span={6}>
            <Card withBorder h="100%">
              <Group gap="xs" mb="xs">
                <IconCurrencyDollar size={20} color="var(--mantine-color-green-6)" />
                <Text size="sm" c="dimmed">Interest Saved</Text>
              </Group>
              <Text size="xl" fw={700} c="green">
                {formatCurrency(results.totalInterestSaved)}
              </Text>
              <Text size="xs" c="dimmed" mt="xs">
                vs. minimum payments only
              </Text>
            </Card>
          </Grid.Col>
          
          <Grid.Col span={6}>
            <Card withBorder h="100%">
              <Group gap="xs" mb="xs">
                <IconChartLine size={20} color="var(--mantine-color-orange-6)" />
                <Text size="sm" c="dimmed">Total Debt</Text>
              </Group>
              <Text size="xl" fw={700} c="orange">
                {formatCurrency(totalDebtAmount)}
              </Text>
              <Text size="xs" c="dimmed" mt="xs">
                across {userData.debts.length} debts
              </Text>
            </Card>
          </Grid.Col>
          
          <Grid.Col span={6}>
            <Card withBorder h="100%">
              <Group gap="xs" mb="xs">
                <IconCurrencyDollar size={20} color="var(--mantine-color-violet-6)" />
                <Text size="sm" c="dimmed">Extra Payment Power</Text>
              </Group>
              <Text size="xl" fw={700} c="violet">
                {formatCurrency(extraPaymentAmount)}
              </Text>
              <Text size="xs" c="dimmed" mt="xs">
                available monthly
              </Text>
            </Card>
          </Grid.Col>
        </Grid>
      </Paper>

      <Paper p="md" withBorder>
        <Title order={4} mb="md">Debt Payoff Order (Snowball Strategy)</Title>
        <Timeline active={-1} bulletSize={24} lineWidth={2}>
          {results.payoffOrder.map((debt, index) => {
            const debtPayoffMonth = results.paymentPlans
              .filter(plan => plan.debt.id === debt.id && plan.isPayoffMonth)[0]?.month || 0
            
            const progressPercentage = debtPayoffMonth > 0 ? 100 : 0
            
            return (
              <Timeline.Item
                key={debt.id}
                bullet={
                  <Text size="xs" fw={700} c="white">
                    {index + 1}
                  </Text>
                }
                title={debt.name}
              >
                <Text size="sm" c="dimmed" mb="xs">
                  {formatCurrency(debt.balance)} • {formatPercentage(debt.interestRate)} APR
                </Text>
                <Progress value={progressPercentage} size="sm" mb="xs" />
                <Text size="xs">
                  Priority: <Badge size="xs" color={
                    debt.priority === 'high' ? 'red' : 
                    debt.priority === 'medium' ? 'yellow' : 'green'
                  }>
                    {debt.priority}
                  </Badge>
                  {debtPayoffMonth > 0 && (
                    <Text span ml="md" c="green" fw={500}>
                      Paid off in month {debtPayoffMonth}
                    </Text>
                  )}
                </Text>
              </Timeline.Item>
            )
          })}
        </Timeline>
      </Paper>

      <Paper p="md" withBorder>
        <Title order={4} mb="md">Monthly Payment Breakdown</Title>
        <Table>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Month</Table.Th>
              <Table.Th>Total Payment</Table.Th>
              <Table.Th>Principal</Table.Th>
              <Table.Th>Interest</Table.Th>
              <Table.Th>Remaining Balance</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {paymentSchedule.slice(0, 12).map((month) => (
              <Table.Tr key={month.month}>
                <Table.Td>{month.month}</Table.Td>
                <Table.Td fw={500}>{formatCurrency(month.totalPayment)}</Table.Td>
                <Table.Td c="green">{formatCurrency(month.totalPrincipal)}</Table.Td>
                <Table.Td c="red">{formatCurrency(month.totalInterest)}</Table.Td>
                <Table.Td>{formatCurrency(month.totalRemaining)}</Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>
        {paymentSchedule.length > 12 && (
          <Text size="sm" c="dimmed" mt="xs" ta="center">
            Showing first 12 months. Full schedule available in downloads.
          </Text>
        )}
      </Paper>

      <Alert color="green" title="Success Strategy">
        <Text size="sm">
          Your plan prioritizes high-priority debts first, then uses the debt snowball method 
          to build momentum. As each debt is paid off, those payments roll into the next debt, 
          accelerating your progress and saving you <strong>{formatCurrency(results.totalInterestSaved)}</strong> in interest!
        </Text>
      </Alert>
    </Stack>
  )
}