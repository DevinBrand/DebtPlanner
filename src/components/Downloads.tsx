import { useState } from 'react'
import {
  Paper,
  Title,
  Text,
  Button,
  Group,
  Stack,
  Alert,
  Card,
  Grid,
  Divider,
  Center
} from '@mantine/core'
import { notifications } from '@mantine/notifications'
import {
  IconFileTypePdf,
  IconFileTypeXls,
  IconDownload,
  IconHeart,
  IconStar,
  IconTrophy
} from '@tabler/icons-react'
import { UserData, DebtSnowballResult } from '../types'
import { generatePaymentPlanPDF, generateExcelTracker, generateProcessTracker } from '../utils/exportUtils'
import { formatCurrency } from '../utils/helpers'

interface DownloadsProps {
  userData: UserData
  results: DebtSnowballResult | null
}

export function Downloads({ userData, results }: DownloadsProps) {
  const [downloading, setDownloading] = useState<string | null>(null)
  const [showEncouragement, setShowEncouragement] = useState(false)

  if (!results) {
    return (
      <Alert color="blue" title="Almost There!">
        Complete your debt analysis to access your downloadable materials.
      </Alert>
    )
  }

  const handleDownload = async (type: string, generator: () => Promise<void>) => {
    setDownloading(type)
    try {
      await generator()
      notifications.show({
        title: 'Download Complete!',
        message: `Your ${type} has been downloaded successfully`,
        color: 'green'
      })
      
      // Show encouragement after first download
      if (!showEncouragement) {
        setTimeout(() => setShowEncouragement(true), 1000)
      }
    } catch (error) {
      notifications.show({
        title: 'Download Failed',
        message: 'There was an error generating your file. Please try again.',
        color: 'red'
      })
    } finally {
      setDownloading(null)
    }
  }

  const totalDebt = userData.debts.reduce((sum, debt) => sum + debt.balance, 0)
  const monthsToFreedom = results.monthsToPayoff
  const interestSaved = results.totalInterestSaved

  return (
    <Stack gap="lg">
      <Paper p="md" withBorder>
        <Title order={3} mb="md" ta="center">
          Your Debt Freedom Toolkit
        </Title>
        <Text ta="center" c="dimmed" mb="lg">
          Download these powerful tools to stay on track and motivated throughout your journey
        </Text>

        <Grid>
          <Grid.Col span={6}>
            <Card withBorder p="lg" h="100%">
              <Group justify="center" mb="md">
                <IconFileTypePdf size={48} color="var(--mantine-color-red-6)" />
              </Group>
              <Title order={5} ta="center" mb="xs">
                Payment Plan PDF
              </Title>
              <Text size="sm" c="dimmed" ta="center" mb="md">
                Comprehensive month-by-month payment schedule with progress tracking
              </Text>
              <Button
                fullWidth
                leftSection={<IconDownload size={16} />}
                loading={downloading === 'pdf'}
                onClick={() => handleDownload('Payment Plan PDF', () => 
                  generatePaymentPlanPDF(userData, results)
                )}
              >
                Download PDF
              </Button>
            </Card>
          </Grid.Col>

          <Grid.Col span={6}>
            <Card withBorder p="lg" h="100%">
              <Group justify="center" mb="md">
                <IconFileTypeXls size={48} color="var(--mantine-color-green-6)" />
              </Group>
              <Title order={5} ta="center" mb="xs">
                Excel Payment Tracker
              </Title>
              <Text size="sm" c="dimmed" ta="center" mb="md">
                Interactive spreadsheet to track your actual payments and progress
              </Text>
              <Button
                fullWidth
                leftSection={<IconDownload size={16} />}
                loading={downloading === 'excel'}
                onClick={() => handleDownload('Excel Tracker', () => 
                  generateExcelTracker(userData, results)
                )}
              >
                Download Excel
              </Button>
            </Card>
          </Grid.Col>

          <Grid.Col span={6}>
            <Card withBorder p="lg" h="100%">
              <Group justify="center" mb="md">
                <IconFileTypeXls size={48} color="var(--mantine-color-blue-6)" />
              </Group>
              <Title order={5} ta="center" mb="xs">
                Process Tracker
              </Title>
              <Text size="sm" c="dimmed" ta="center" mb="md">
                Monthly habit tracker and motivation journal to keep you accountable
              </Text>
              <Button
                fullWidth
                leftSection={<IconDownload size={16} />}
                loading={downloading === 'process'}
                onClick={() => handleDownload('Process Tracker', () => 
                  generateProcessTracker(userData, results)
                )}
              >
                Download Tracker
              </Button>
            </Card>
          </Grid.Col>

          <Grid.Col span={6}>
            <Card withBorder p="lg" h="100%" bg="gradient-to-br from-purple-50 to-blue-50">
              <Group justify="center" mb="md">
                <IconTrophy size={48} color="var(--mantine-color-yellow-6)" />
              </Group>
              <Title order={5} ta="center" mb="xs">
                Goal Tracker
              </Title>
              <Text size="sm" c="dimmed" ta="center" mb="md">
                Visual progress tracker with milestones and celebration points
              </Text>
              <Button
                fullWidth
                variant="gradient"
                gradient={{ from: 'purple', to: 'blue' }}
                leftSection={<IconDownload size={16} />}
                onClick={() => notifications.show({
                  title: 'Coming Soon!',
                  message: 'Goal tracker will be available in the next update',
                  color: 'blue'
                })}
              >
                Coming Soon
              </Button>
            </Card>
          </Grid.Col>
        </Grid>
      </Paper>

      {showEncouragement && (
        <Paper p="lg" withBorder bg="gradient-to-r from-green-50 to-blue-50">
          <Center>
            <Stack align="center" gap="md">
              <Group gap="xs">
                <IconHeart size={24} color="var(--mantine-color-red-6)" />
                <IconStar size={24} color="var(--mantine-color-yellow-6)" />
                <IconTrophy size={24} color="var(--mantine-color-green-6)" />
              </Group>
              
              <Title order={3} ta="center" c="green">
                You've Got This! 🎉
              </Title>
              
              <Text ta="center" size="lg" maw={600}>
                Starting your debt-free journey takes courage, and you've already taken the hardest step. 
                You have a clear plan to eliminate <strong>{formatCurrency(totalDebt)}</strong> of debt 
                in just <strong>{monthsToFreedom} months</strong>, saving yourself <strong>{formatCurrency(interestSaved)}</strong> in interest.
              </Text>
              
              <Divider w="100%" />
              
              <Text ta="center" c="dimmed" size="sm" maw={500}>
                Remember: Every payment brings you closer to freedom. Every dollar saved is a victory. 
                You're not just paying off debt—you're building a foundation for the life you deserve.
              </Text>
              
              <Text ta="center" fw={500} c="blue">
                Progress over perfection. You're going to do amazing! 💪
              </Text>
            </Stack>
          </Center>
        </Paper>
      )}

      <Alert color="blue" title="Pro Tips for Success">
        <Stack gap="xs">
          <Text size="sm">• <strong>Automate your payments</strong> - Set up automatic transfers to stay consistent</Text>
          <Text size="sm">• <strong>Track your progress</strong> - Use the Excel tracker to see your victories</Text>
          <Text size="sm">• <strong>Celebrate milestones</strong> - Acknowledge each debt you pay off</Text>
          <Text size="sm">• <strong>Stay flexible</strong> - Life happens, adjust your plan as needed</Text>
          <Text size="sm">• <strong>Find your why</strong> - Remember what debt freedom means to you</Text>
        </Stack>
      </Alert>
    </Stack>
  )
}