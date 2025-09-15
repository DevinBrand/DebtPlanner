import { useState } from 'react'
import { Container, Title, Stepper, Group, Button, Text } from '@mantine/core'
import { IconUpload, IconCalculator, IconFileDownload, IconTrophy } from '@tabler/icons-react'
import { DebtUpload } from './components/DebtUpload'
import { BudgetForm } from './components/BudgetForm'
import { Results } from './components/Results'
import { Downloads } from './components/Downloads'
import { UserData, DebtSnowballResult } from './types'

function App() {
  const [active, setActive] = useState(0)
  const [userData, setUserData] = useState<UserData>({
    monthlyIncome: 0,
    budgetCategories: [],
    debts: []
  })
  const [results, setResults] = useState<DebtSnowballResult | null>(null)

  const nextStep = () => setActive((current) => (current < 3 ? current + 1 : current))
  const prevStep = () => setActive((current) => (current > 0 ? current - 1 : current))

  return (
    <Container size="lg" py="xl">
      <Title order={1} ta="center" mb="xl">
        Debt Planner - Your Path to Financial Freedom
      </Title>
      
      <Text ta="center" size="lg" mb="xl" c="dimmed">
        Upload your debts, set your budget, and get a personalized payment plan
      </Text>

      <Stepper active={active} onStepClick={setActive}>
        <Stepper.Step 
          label="Upload Debts" 
          description="Import your debt schedule"
          icon={<IconUpload size={18} />}
        >
          <DebtUpload 
            userData={userData} 
            setUserData={setUserData}
          />
        </Stepper.Step>

        <Stepper.Step 
          label="Budget Setup" 
          description="Enter your income and expenses"
          icon={<IconCalculator size={18} />}
        >
          <BudgetForm 
            userData={userData} 
            setUserData={setUserData}
          />
        </Stepper.Step>

        <Stepper.Step 
          label="Payment Plan" 
          description="View your optimized strategy"
          icon={<IconTrophy size={18} />}
        >
          <Results 
            userData={userData}
            results={results}
            setResults={setResults}
          />
        </Stepper.Step>

        <Stepper.Step 
          label="Download Tools" 
          description="Get your tracking materials"
          icon={<IconFileDownload size={18} />}
        >
          <Downloads 
            userData={userData}
            results={results}
          />
        </Stepper.Step>
      </Stepper>

      <Group justify="center" mt="xl">
        <Button variant="default" onClick={prevStep} disabled={active === 0}>
          Back
        </Button>
        <Button onClick={nextStep} disabled={active === 3}>
          Next step
        </Button>
      </Group>
    </Container>
  )
}

export default App