-- Demo Data Population Script for FREE TIER
-- Usage: Replace ALL instances of 'YOUR_USER_ID_HERE' with the actual user UUID
-- Limits: 3 accounts, 5 recurring services, 2 active credits
-- 
-- IMPORTANT: Use Find & Replace (Ctrl+H) to replace 'YOUR_USER_ID_HERE' with your actual UUID
-- Example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

-- ============================================
-- 1. CREATE ACCOUNTS (3 max for free tier)
-- ============================================

-- Account 1: Checking Account
INSERT INTO public.accounts (user_id, name, type, balance, currency, color, icon)
VALUES ('YOUR_USER_ID_HERE', 'Cuenta Corriente Principal', 'checking', 5420.50, 'USD', '#3b82f6', 'wallet');

-- Account 2: Savings Account
INSERT INTO public.accounts (user_id, name, type, balance, currency, color, icon)
VALUES ('YOUR_USER_ID_HERE', 'Ahorros', 'savings', 12500.00, 'USD', '#10b981', 'piggy-bank');

-- Account 3: Cash
INSERT INTO public.accounts (user_id, name, type, balance, currency, color, icon)
VALUES ('YOUR_USER_ID_HERE', 'Efectivo', 'cash', 350.00, 'USD', '#f59e0b', 'banknote');

-- ============================================
-- 2. CREATE TRANSACTIONS (Sample 30 transactions)
-- ============================================

-- Get account IDs for reference
WITH user_accounts AS (
  SELECT id, type FROM public.accounts WHERE user_id = 'YOUR_USER_ID_HERE'
),
checking_account AS (
  SELECT id FROM user_accounts WHERE type = 'checking' LIMIT 1
),
savings_account AS (
  SELECT id FROM user_accounts WHERE type = 'savings' LIMIT 1
),
cash_account AS (
  SELECT id FROM user_accounts WHERE type = 'cash' LIMIT 1
),
user_categories AS (
  SELECT id, name, type FROM public.categories WHERE user_id = 'YOUR_USER_ID_HERE'
)

-- Income transactions
INSERT INTO public.transactions (user_id, account_id, category_id, type, amount, description, date)
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM checking_account),
  (SELECT id FROM user_categories WHERE name = 'Salario' AND type = 'income' LIMIT 1),
  'income',
  3500.00,
  'Salario mensual',
  CURRENT_DATE - INTERVAL '25 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM checking_account),
  (SELECT id FROM user_categories WHERE name = 'Freelance' AND type = 'income' LIMIT 1),
  'income',
  850.00,
  'Proyecto freelance - Diseño web',
  CURRENT_DATE - INTERVAL '15 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM savings_account),
  (SELECT id FROM user_categories WHERE name = 'Inversiones' AND type = 'income' LIMIT 1),
  'income',
  125.50,
  'Rendimientos de inversión',
  CURRENT_DATE - INTERVAL '10 days'

-- Expense transactions - Alimentación
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM checking_account),
  (SELECT id FROM user_categories WHERE name = 'Alimentación' AND type = 'expense' LIMIT 1),
  'expense',
  85.30,
  'Supermercado Walmart',
  CURRENT_DATE - INTERVAL '2 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM cash_account),
  (SELECT id FROM user_categories WHERE name = 'Alimentación' AND type = 'expense' LIMIT 1),
  'expense',
  45.00,
  'Restaurante',
  CURRENT_DATE - INTERVAL '5 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM checking_account),
  (SELECT id FROM user_categories WHERE name = 'Alimentación' AND type = 'expense' LIMIT 1),
  'expense',
  120.50,
  'Supermercado Soriana',
  CURRENT_DATE - INTERVAL '12 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM cash_account),
  (SELECT id FROM user_categories WHERE name = 'Alimentación' AND type = 'expense' LIMIT 1),
  'expense',
  25.00,
  'Café Starbucks',
  CURRENT_DATE - INTERVAL '18 days'

-- Expense transactions - Transporte
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM checking_account),
  (SELECT id FROM user_categories WHERE name = 'Transporte' AND type = 'expense' LIMIT 1),
  'expense',
  60.00,
  'Gasolina',
  CURRENT_DATE - INTERVAL '3 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM cash_account),
  (SELECT id FROM user_categories WHERE name = 'Transporte' AND type = 'expense' LIMIT 1),
  'expense',
  15.00,
  'Uber',
  CURRENT_DATE - INTERVAL '7 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM checking_account),
  (SELECT id FROM user_categories WHERE name = 'Transporte' AND type = 'expense' LIMIT 1),
  'expense',
  55.00,
  'Gasolina',
  CURRENT_DATE - INTERVAL '14 days'

-- Expense transactions - Vivienda
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM checking_account),
  (SELECT id FROM user_categories WHERE name = 'Vivienda' AND type = 'expense' LIMIT 1),
  'expense',
  800.00,
  'Renta mensual',
  CURRENT_DATE - INTERVAL '1 day'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM checking_account),
  (SELECT id FROM user_categories WHERE name = 'Vivienda' AND type = 'expense' LIMIT 1),
  'expense',
  45.00,
  'Luz',
  CURRENT_DATE - INTERVAL '8 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM checking_account),
  (SELECT id FROM user_categories WHERE name = 'Vivienda' AND type = 'expense' LIMIT 1),
  'expense',
  35.00,
  'Agua',
  CURRENT_DATE - INTERVAL '9 days'

-- Expense transactions - Entretenimiento
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM checking_account),
  (SELECT id FROM user_categories WHERE name = 'Entretenimiento' AND type = 'expense' LIMIT 1),
  'expense',
  25.00,
  'Cine',
  CURRENT_DATE - INTERVAL '6 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM checking_account),
  (SELECT id FROM user_categories WHERE name = 'Entretenimiento' AND type = 'expense' LIMIT 1),
  'expense',
  120.00,
  'Concierto',
  CURRENT_DATE - INTERVAL '20 days'

-- Expense transactions - Salud
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM checking_account),
  (SELECT id FROM user_categories WHERE name = 'Salud' AND type = 'expense' LIMIT 1),
  'expense',
  150.00,
  'Consulta médica',
  CURRENT_DATE - INTERVAL '11 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM checking_account),
  (SELECT id FROM user_categories WHERE name = 'Salud' AND type = 'expense' LIMIT 1),
  'expense',
  45.50,
  'Farmacia',
  CURRENT_DATE - INTERVAL '13 days'

-- Expense transactions - Compras
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM checking_account),
  (SELECT id FROM user_categories WHERE name = 'Compras' AND type = 'expense' LIMIT 1),
  'expense',
  200.00,
  'Amazon - Electrónicos',
  CURRENT_DATE - INTERVAL '4 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM checking_account),
  (SELECT id FROM user_categories WHERE name = 'Compras' AND type = 'expense' LIMIT 1),
  'expense',
  75.00,
  'Tienda departamental',
  CURRENT_DATE - INTERVAL '16 days'

-- Expense transactions - Servicios
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM checking_account),
  (SELECT id FROM user_categories WHERE name = 'Servicios' AND type = 'expense' LIMIT 1),
  'expense',
  50.00,
  'Internet',
  CURRENT_DATE - INTERVAL '5 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM checking_account),
  (SELECT id FROM user_categories WHERE name = 'Servicios' AND type = 'expense' LIMIT 1),
  'expense',
  30.00,
  'Teléfono móvil',
  CURRENT_DATE - INTERVAL '6 days'

-- Expense transactions - Ropa
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM checking_account),
  (SELECT id FROM user_categories WHERE name = 'Ropa' AND type = 'expense' LIMIT 1),
  'expense',
  180.00,
  'Zara - Ropa',
  CURRENT_DATE - INTERVAL '19 days'

-- Expense transactions - Educación
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM checking_account),
  (SELECT id FROM user_categories WHERE name = 'Educación' AND type = 'expense' LIMIT 1),
  'expense',
  95.00,
  'Curso online Udemy',
  CURRENT_DATE - INTERVAL '22 days'

-- Expense transactions - Regalos
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM checking_account),
  (SELECT id FROM user_categories WHERE name = 'Regalos' AND type = 'expense' LIMIT 1),
  'expense',
  65.00,
  'Regalo cumpleaños',
  CURRENT_DATE - INTERVAL '17 days';

-- ============================================
-- 3. CREATE RECURRING SERVICES (5 max for free tier)
-- ============================================

WITH checking_account AS (
  SELECT id FROM public.accounts WHERE user_id = 'YOUR_USER_ID_HERE' AND type = 'checking' LIMIT 1
)

INSERT INTO public.recurring_services (user_id, name, category, amount, frequency, payment_day, next_payment_date, account_id, is_active)
SELECT 
  'YOUR_USER_ID_HERE',
  'Netflix',
  'subscriptions',
  15.99,
  'monthly',
  15,
  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '14 days',
  (SELECT id FROM checking_account),
  true
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  'Spotify Premium',
  'subscriptions',
  9.99,
  'monthly',
  10,
  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '9 days',
  (SELECT id FROM checking_account),
  true
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  'Gimnasio',
  'subscriptions',
  45.00,
  'monthly',
  1,
  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month',
  (SELECT id FROM checking_account),
  true
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  'Seguro de Auto',
  'insurance',
  120.00,
  'monthly',
  5,
  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '4 days',
  (SELECT id FROM checking_account),
  true
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  'Internet Fibra Óptica',
  'utilities',
  50.00,
  'monthly',
  20,
  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '19 days',
  (SELECT id FROM checking_account),
  true;

-- ============================================
-- 4. CREATE CREDITS (2 max for free tier)
-- ============================================

-- Credit 1: Credit Card
INSERT INTO public.credits (user_id, name, type, total_amount, remaining_amount, interest_rate, monthly_payment, due_date, start_date, end_date, status)
VALUES (
  'YOUR_USER_ID_HERE',
  'Tarjeta de Crédito BBVA',
  'credit_card',
  5000.00,
  2350.00,
  24.99,
  150.00,
  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '14 days',
  CURRENT_DATE - INTERVAL '8 months',
  CURRENT_DATE + INTERVAL '16 months',
  'active'
);

-- Credit 2: Personal Loan
INSERT INTO public.credits (user_id, name, type, total_amount, remaining_amount, interest_rate, monthly_payment, due_date, start_date, end_date, status)
VALUES (
  'YOUR_USER_ID_HERE',
  'Préstamo Personal Santander',
  'personal_loan',
  15000.00,
  8500.00,
  12.50,
  450.00,
  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '9 days',
  CURRENT_DATE - INTERVAL '14 months',
  CURRENT_DATE + INTERVAL '22 months',
  'active'
);

-- ============================================
-- 5. CREATE CREDIT PAYMENTS (Sample history)
-- ============================================

WITH credit_card AS (
  SELECT id FROM public.credits WHERE user_id = 'YOUR_USER_ID_HERE' AND type = 'credit_card' LIMIT 1
),
personal_loan AS (
  SELECT id FROM public.credits WHERE user_id = 'YOUR_USER_ID_HERE' AND type = 'personal_loan' LIMIT 1
)

-- Credit card payments
INSERT INTO public.credit_payments (credit_id, user_id, amount, payment_date)
SELECT 
  (SELECT id FROM credit_card),
  'YOUR_USER_ID_HERE',
  150.00,
  CURRENT_DATE - INTERVAL '30 days'
UNION ALL
SELECT 
  (SELECT id FROM credit_card),
  'YOUR_USER_ID_HERE',
  150.00,
  CURRENT_DATE - INTERVAL '60 days'
UNION ALL
SELECT 
  (SELECT id FROM credit_card),
  'YOUR_USER_ID_HERE',
  200.00,
  CURRENT_DATE - INTERVAL '90 days'

-- Personal loan payments
UNION ALL
SELECT 
  (SELECT id FROM personal_loan),
  'YOUR_USER_ID_HERE',
  450.00,
  CURRENT_DATE - INTERVAL '30 days'
UNION ALL
SELECT 
  (SELECT id FROM personal_loan),
  'YOUR_USER_ID_HERE',
  450.00,
  CURRENT_DATE - INTERVAL '60 days'
UNION ALL
SELECT 
  (SELECT id FROM personal_loan),
  'YOUR_USER_ID_HERE',
  450.00,
  CURRENT_DATE - INTERVAL '90 days';

-- ============================================
-- DONE! Summary of created data:
-- ============================================
-- ✓ 3 Accounts (checking, savings, cash)
-- ✓ 30 Transactions (income and expenses across categories)
-- ✓ 5 Recurring Services (Netflix, Spotify, Gym, Insurance, Internet)
-- ✓ 2 Active Credits (Credit Card, Personal Loan)
-- ✓ 6 Credit Payments (payment history)
