import { useState } from 'react'
import { 
  Paper, 
  Title, 
  Text, 
  Button, 
  Group, 
  Alert,
  Table,
  NumberInput,
  TextInput,
  Select,
  ActionIcon,
  Stack
} from '@mantine/core'
import { Dropzone, FileWithPath } from '@mantine/dropzone'
import { notifications } from '@mantine/notifications'
import { IconUpload, IconFileTypeCsv, IconDownload, IconTrash, IconPlus } from '@tabler/icons-react'
import Papa from 'papaparse'
import { UserData, Debt } from '../types'
import { generateId } from '../utils/helpers'

interface DebtUploadProps {
  userData: UserData
  setUserData: (data: UserData) => void
}

export function DebtUpload({ userData, setUserData }: DebtUploadProps) {
  const [manualDebts, setManualDebts] = useState<Partial<Debt>[]>([])

  const downloadTemplate = () => {
    const link = document.createElement('a')
    link.href = '/debt-template.csv'
    link.download = 'debt-template.csv'
    link.click()
  }

  const handleFileUpload = (files: FileWithPath[]) => {
    const file = files[0]
    if (!file) return

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        try {
          const debts: Debt[] = results.data
            .filter((row: any) => row['name'] && row['current_amount'])
            .map((row: any) => {
              // Map your priority numbers to priority levels
              const priorityMap: Record<string, 'high' | 'medium' | 'low'> = {
                '1': 'high',
                '2': 'high', 
                '3': 'medium',
                '4': 'medium',
                '5': 'low',
                '6': 'low'
              }
              
              // Map your types to our type system
              const typeMap: Record<string, Debt['type']> = {
                'credit_card': 'credit_card',
                'student_loan': 'student_loan',
                'auto_loan': 'auto_loan',
                'mortgage': 'mortgage',
                'personal_loan': 'personal_loan',
                'overdue bill': 'other',
                'overdue bill for services': 'other',
                'short term financing': 'personal_loan',
                'intermediate loan': 'auto_loan',
                'short term loan': 'personal_loan',
                'long term loan': 'student_loan'
              }
              
              return {
                id: row['id'] || generateId(),
                name: `${row['debtor']}: ${row['name']}`,
                balance: parseFloat(row['current_amount']) || 0,
                minimumPayment: parseFloat(row['minimum_monthly_payment']) || 0,
                interestRate: parseFloat(row['interest_rate']?.replace('%', '')) || 0,
                type: typeMap[row['type']] || 'other',
                priority: priorityMap[row['snowball_priority']] || 'medium'
              }
            })

          setUserData({
            ...userData,
            debts
          })

          notifications.show({
            title: 'Success!',
            message: `Imported ${debts.length} debts successfully`,
            color: 'green'
          })
        } catch (error) {
          notifications.show({
            title: 'Error',
            message: 'Failed to parse CSV file. Please check the format.',
            color: 'red'
          })
        }
      },
      error: () => {
        notifications.show({
          title: 'Error',
          message: 'Failed to read CSV file',
          color: 'red'
        })
      }
    })
  }

  const addManualDebt = () => {
    setManualDebts([...manualDebts, {
      name: '',
      balance: 0,
      minimumPayment: 0,
      interestRate: 0,
      type: 'credit_card',
      priority: 'medium'
    }])
  }

  const updateManualDebt = (index: number, field: keyof Debt, value: any) => {
    const updated = [...manualDebts]
    updated[index] = { ...updated[index], [field]: value }
    setManualDebts(updated)
  }

  const removeManualDebt = (index: number) => {
    setManualDebts(manualDebts.filter((_, i) => i !== index))
  }

  const saveManualDebts = () => {
    const validDebts: Debt[] = manualDebts
      .filter(debt => debt.name && debt.balance && debt.minimumPayment)
      .map(debt => ({
        id: generateId(),
        name: debt.name!,
        balance: debt.balance!,
        minimumPayment: debt.minimumPayment!,
        interestRate: debt.interestRate!,
        type: debt.type!,
        priority: debt.priority!
      }))

    setUserData({
      ...userData,
      debts: [...userData.debts, ...validDebts]
    })

    setManualDebts([])
    
    notifications.show({
      title: 'Success!',
      message: `Added ${validDebts.length} debts`,
      color: 'green'
    })
  }

  const debtTypeOptions = [
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'student_loan', label: 'Student Loan' },
    { value: 'auto_loan', label: 'Auto Loan' },
    { value: 'mortgage', label: 'Mortgage' },
    { value: 'personal_loan', label: 'Personal Loan' },
    { value: 'other', label: 'Other' }
  ]

  const priorityOptions = [
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' }
  ]

  return (
    <Stack gap="lg">
      <Paper p="md" withBorder>
        <Title order={3} mb="md">Upload Your Debt Schedule</Title>
        
        <Alert mb="md" color="blue">
          <Text size="sm">
            Download our CSV template, fill it out with your debt information, then upload it here.
          </Text>
        </Alert>

        <Group mb="md">
          <Button 
            leftSection={<IconDownload size={16} />}
            variant="outline"
            onClick={downloadTemplate}
          >
            Download CSV Template
          </Button>
        </Group>

        <Dropzone
          onDrop={handleFileUpload}
          accept={['text/csv']}
          maxFiles={1}
        >
          <Group justify="center" gap="xl" mih={220} style={{ pointerEvents: 'none' }}>
            <Dropzone.Accept>
              <IconUpload size={52} stroke={1.5} />
            </Dropzone.Accept>
            <Dropzone.Reject>
              <IconFileTypeCsv size={52} stroke={1.5} />
            </Dropzone.Reject>
            <Dropzone.Idle>
              <IconFileTypeCsv size={52} stroke={1.5} />
            </Dropzone.Idle>

            <div>
              <Text size="xl" inline>
                Drag CSV file here or click to select
              </Text>
              <Text size="sm" c="dimmed" inline mt={7}>
                Upload your completed debt schedule CSV file
              </Text>
            </div>
          </Group>
        </Dropzone>
      </Paper>

      <Paper p="md" withBorder>
        <Title order={3} mb="md">Or Add Debts Manually</Title>
        
        <Button 
          leftSection={<IconPlus size={16} />}
          onClick={addManualDebt}
          mb="md"
        >
          Add Debt
        </Button>

        {manualDebts.length > 0 && (
          <>
            <Table>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Balance</Table.Th>
                  <Table.Th>Min Payment</Table.Th>
                  <Table.Th>Interest Rate</Table.Th>
                  <Table.Th>Type</Table.Th>
                  <Table.Th>Priority</Table.Th>
                  <Table.Th>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {manualDebts.map((debt, index) => (
                  <Table.Tr key={index}>
                    <Table.Td>
                      <TextInput
                        value={debt.name || ''}
                        onChange={(e) => updateManualDebt(index, 'name', e.target.value)}
                        placeholder="Debt name"
                      />
                    </Table.Td>
                    <Table.Td>
                      <NumberInput
                        value={debt.balance || 0}
                        onChange={(value) => updateManualDebt(index, 'balance', value)}
                        prefix="$"
                        thousandSeparator=","
                      />
                    </Table.Td>
                    <Table.Td>
                      <NumberInput
                        value={debt.minimumPayment || 0}
                        onChange={(value) => updateManualDebt(index, 'minimumPayment', value)}
                        prefix="$"
                        thousandSeparator=","
                      />
                    </Table.Td>
                    <Table.Td>
                      <NumberInput
                        value={debt.interestRate || 0}
                        onChange={(value) => updateManualDebt(index, 'interestRate', value)}
                        suffix="%"
                        decimalScale={2}
                      />
                    </Table.Td>
                    <Table.Td>
                      <Select
                        value={debt.type}
                        onChange={(value) => updateManualDebt(index, 'type', value)}
                        data={debtTypeOptions}
                      />
                    </Table.Td>
                    <Table.Td>
                      <Select
                        value={debt.priority}
                        onChange={(value) => updateManualDebt(index, 'priority', value)}
                        data={priorityOptions}
                      />
                    </Table.Td>
                    <Table.Td>
                      <ActionIcon
                        color="red"
                        onClick={() => removeManualDebt(index)}
                        variant="outline"
                      >
                        <IconTrash size={16} />
                      </ActionIcon>
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
            
            <Button onClick={saveManualDebts} mt="md">
              Save Debts
            </Button>
          </>
        )}
      </Paper>

      {userData.debts.length > 0 && (
        <Paper p="md" withBorder>
          <Title order={4} mb="md">Current Debts ({userData.debts.length})</Title>
          <Table>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Balance</Table.Th>
                <Table.Th>Min Payment</Table.Th>
                <Table.Th>Interest Rate</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Priority</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {userData.debts.map((debt) => (
                <Table.Tr key={debt.id}>
                  <Table.Td>{debt.name}</Table.Td>
                  <Table.Td>${debt.balance.toLocaleString()}</Table.Td>
                  <Table.Td>${debt.minimumPayment.toLocaleString()}</Table.Td>
                  <Table.Td>{debt.interestRate}%</Table.Td>
                  <Table.Td>{debt.type.replace('_', ' ')}</Table.Td>
                  <Table.Td>{debt.priority}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      )}
    </Stack>
  )
}