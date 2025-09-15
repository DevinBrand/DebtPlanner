# Debt Planner - Your Path to Financial Freedom

A comprehensive React application built with Mantine UI that helps users create and track their debt payoff strategy using the debt snowball method.

## Features

- **CSV Debt Upload**: Upload debt information via CSV template or enter manually
- **Budget Planning**: Set up monthly income and expense categories
- **Debt Snowball Algorithm**: Automatically calculates optimal payment strategy
- **Payment Plan PDF**: Downloadable month-by-month payment schedule
- **Excel Trackers**: Interactive spreadsheets for tracking progress
- **Process Tracker**: Habit and motivation tracking tools
- **Encouragement System**: Positive, non-shaming motivational messaging

## Tech Stack

- React 18 with TypeScript
- Mantine UI for components
- Vite for build tooling
- jsPDF for PDF generation
- XLSX for Excel exports
- Papa Parse for CSV processing

## Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Run development server**:
   ```bash
   npm run dev
   ```

3. **Build for production**:
   ```bash
   npm run build
   ```

## Deployment

This app is configured for easy deployment on Vercel:

1. Push to GitHub
2. Connect repository to Vercel
3. Deploy automatically

## Usage

1. **Upload Debts**: Download the CSV template, fill it out, and upload your debt information
2. **Set Budget**: Enter your monthly income and expense categories
3. **View Plan**: See your optimized debt payoff strategy
4. **Download Tools**: Get PDF payment plan and Excel trackers

## Debt Strategy

The app uses a hybrid approach:
- **Priority-first**: High-priority debts are tackled first
- **Debt Snowball**: Within priority levels, smallest balances are paid first
- **Optimal Allocation**: Extra payments are automatically allocated for maximum impact

## Files Generated

- **Payment Plan PDF**: Comprehensive payment schedule with summary
- **Excel Payment Tracker**: Interactive tracker for actual vs. planned payments
- **Process Tracker**: Habit tracker and motivation journal
- **Goal Tracker**: Visual progress tracking (coming soon)

## License

MIT License - feel free to use and modify for your needs.