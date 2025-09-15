import { useState } from 'react'
import {
  Paper,
  Title,
  Text,
  NumberInput,
  TextInput,
  Button,
  Group,
  Table,
  ActionIcon,
  Select,
  Alert,
  Stack,
  Grid,
  Card,
  Badge
} from '@mantine/core'
import { IconPlus, IconTrash, IconCalculator } from '@tabler/icons-react'
import { UserData, BudgetCategory } from '../types'
import { formatCurrency } from '../utils/helpers'

interface BudgetFormProps {
  userData: UserData
  setUserData: (data: UserData) => void
}

const defaultCategories: BudgetCategory[] = [
  { name: 'Housing (Rent/Mortgage)', amount: 0, type: 'fixed' },
  { name: 'Utilities', amount: 0, type: 'fixed' },
  { name: 'Insurance', amount: 0, type: 'fixed' },
  { name: 'Transportation', amount: 0, type: 'variable' },
  { name: 'Groceries', amount: 0, type: 'variable' },
  { name: 'Dining Out', amount: 0, type: 'variable' },
  { name: 'Entertainment', amount: 0, type: 'variable' },
  { name: 'Personal Care', amount: 0, type: 'variable' },
  { name: 'Emergency Fund', amount: 0, type: 'fixed' }
]

export function BudgetForm({ userData, setUserData }: BudgetFormProps) {
  const [customCategory, setCustomCategory] = useState<{ name: string; amount: number; type: 'fixed' | 'variable' }>({ name: '', amount: 0, type: 'variable' })

  const initializeDefaultCategories = () => {
    setUserData({
      ...userData,
      budgetCategories: defaultCategories
    })
  }

  const updateCategory = (index: number, field: keyof BudgetCategory, value: any) => {
    const updated = [...userData.budgetCategories]
    updated[index] = { ...updated[index], [field]: value }
    setUserData({
      ...userData,
      budgetCategories: updated
    })
  }

  const addCustomCategory = () => {
    if (customCategory.name && customCategory.amount > 0) {
      setUserData({
        ...userData,
        budgetCategories: [...userData.budgetCategories, customCategory]
      })
      setCustomCategory({ name: '', amount: 0, type: 'variable' })
    }
  }

  const removeCategory = (index: number) => {
    const updated = userData.budgetCategories.filter((_, i) => i !== index)
    setUserData({
      ...userData,
      budgetCategories: updated
    })
  }

  const totalExpenses = userData.budgetCategories.reduce((sum, cat) => sum + cat.amount, 0)
  const totalDebtPayments = userData.debts.reduce((sum, debt) => sum + debt.minimumPayment, 0)
  const totalCommitted = totalExpenses + totalDebtPayments
  const remainingIncome = userData.monthlyIncome - totalCommitted

  return (
    <Stack gap="lg">
      <Paper p="md" withBorder>
        <Title order={3} mb="md">Monthly Income</Title>
        <NumberInput
          label="Take-home monthly income (after taxes)"
          value={userData.monthlyIncome}
          onChange={(value) => setUserData({ ...userData, monthlyIncome: Number(value) || 0 })}
          prefix="$"
          thousandSeparator=","
          size="lg"
          description="Enter your average monthly take-home pay"
        />
      </Paper>

      <Paper p="md" withBorder>
        <Group justify="space-between" mb="md">
          <Title order={3}>Budget Categories</Title>
          {userData.budgetCategories.length === 0 && (
            <Button 
              variant="outline" 
              onClick={initializeDefaultCategories}
              leftSection={<IconCalculator size={16} />}
            >
              Load Common Categories
            </Button>
          )}
        </Group>

        {userData.budgetCategories.length > 0 && (
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Category</Table.Th>
                <Table.Th>Amount</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {userData.budgetCategories.map((category, index) => (
                <Table.Tr key={index}>
                  <Table.Td>
                    <TextInput
                      value={category.name}
                      onChange={(e) => updateCategory(index, 'name', e.target.value)}
                    />
                  </Table.Td>
                  <Table.Td>
                    <NumberInput
                      value={category.amount}
                      onChange={(value) => updateCategory(index, 'amount', Number(value) || 0)}
                      prefix="$"
                      thousandSeparator=","
                    />
                  </Table.Td>
                  <Table.Td>
                    <Select
                      value={category.type}
                      onChange={(value) => updateCategory(index, 'type', value)}
                      data={[
                        { value: 'fixed', label: 'Fixed' },
                        { value: 'variable', label: 'Variable' }
                      ]}
                    />
                  </Table.Td>
                  <Table.Td>
                    <ActionIcon
                      color="red"
                      onClick={() => removeCategory(index)}
                      variant="outline"
                    >
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        )}

        <Paper p="md" mt="md" bg="gray.0">
          <Title order={5} mb="md">Add Custom Category</Title>
          <Grid>
            <Grid.Col span={4}>
              <TextInput
                placeholder="Category name"
                value={customCategory.name}
                onChange={(e) => setCustomCategory({ ...customCategory, name: e.target.value })}
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <NumberInput
                placeholder="Amount"
                value={customCategory.amount}
                onChange={(value) => setCustomCategory({ ...customCategory, amount: Number(value) || 0 })}
                prefix="$"
                thousandSeparator=","
              />
            </Grid.Col>
            <Grid.Col span={3}>
              <Select
                value={customCategory.type}
                onChange={(value) => setCustomCategory({ ...customCategory, type: (value || 'variable') as 'fixed' | 'variable' })}
                data={[
                  { value: 'fixed', label: 'Fixed' },
                  { value: 'variable', label: 'Variable' }
                ]}
              />
            </Grid.Col>
            <Grid.Col span={2}>
              <Button
                fullWidth
                leftSection={<IconPlus size={16} />}
                onClick={addCustomCategory}
                disabled={!customCategory.name || customCategory.amount <= 0}
              >
                Add
              </Button>
            </Grid.Col>
          </Grid>
        </Paper>
      </Paper>

      <Grid>
        <Grid.Col span={6}>
          <Card withBorder>
            <Text size="sm" c="dimmed">Monthly Income</Text>
            <Text size="xl" fw={700} c="green">
              {formatCurrency(userData.monthlyIncome)}
            </Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={6}>
          <Card withBorder>
            <Text size="sm" c="dimmed">Total Budget Expenses</Text>
            <Text size="xl" fw={700} c="blue">
              {formatCurrency(totalExpenses)}
            </Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={6}>
          <Card withBorder>
            <Text size="sm" c="dimmed">Minimum Debt Payments</Text>
            <Text size="xl" fw={700} c="orange">
              {formatCurrency(totalDebtPayments)}
            </Text>
          </Card>
        </Grid.Col>
        <Grid.Col span={6}>
          <Card withBorder>
            <Text size="sm" c="dimmed">Available for Extra Debt Payment</Text>
            <Text 
              size="xl" 
              fw={700} 
              c={remainingIncome >= 0 ? "green" : "red"}
            >
              {formatCurrency(remainingIncome)}
            </Text>
            {remainingIncome < 0 && (
              <Badge color="red" size="sm" mt="xs">
                Budget Deficit
              </Badge>
            )}
          </Card>
        </Grid.Col>
      </Grid>

      {remainingIncome < 0 && (
        <Alert color="red" title="Budget Alert">
          Your expenses exceed your income by {formatCurrency(Math.abs(remainingIncome))}. 
          Consider reducing variable expenses or increasing income before proceeding.
        </Alert>
      )}

      {remainingIncome > 0 && (
        <Alert color="green" title="Great Progress!">
          You have {formatCurrency(remainingIncome)} available for extra debt payments each month. 
          This will significantly accelerate your debt payoff!
        </Alert>
      )}
    </Stack>
  )
}