-- Demo Data Population Script for PRO TIER
-- Usage: Replace ALL instances of 'YOUR_USER_ID_HERE' with the actual user UUID
-- Limits: Unlimited accounts, unlimited recurring services, unlimited active credits
-- 
-- IMPORTANT: Use Find & Replace (Ctrl+H) to replace 'YOUR_USER_ID_HERE' with your actual UUID
-- Example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

-- ============================================
-- 1. CREATE ACCOUNTS (Unlimited for pro tier - creating 6 accounts)
-- ============================================

-- Account 1: Checking Account
INSERT INTO public.accounts (user_id, name, type, balance, currency, color, icon)
VALUES ('YOUR_USER_ID_HERE', 'Cuenta Corriente Principal', 'checking', 8750.50, 'USD', '#3b82f6', 'wallet');

-- Account 2: Savings Account
INSERT INTO public.accounts (user_id, name, type, balance, currency, color, icon)
VALUES ('YOUR_USER_ID_HERE', 'Ahorros', 'savings', 25000.00, 'USD', '#10b981', 'piggy-bank');

-- Account 3: Cash
INSERT INTO public.accounts (user_id, name, type, balance, currency, color, icon)
VALUES ('YOUR_USER_ID_HERE', 'Efectivo', 'cash', 500.00, 'USD', '#f59e0b', 'banknote');

-- Account 4: Credit Card
INSERT INTO public.accounts (user_id, name, type, balance, currency, color, icon)
VALUES ('YOUR_USER_ID_HERE', 'Tarjeta BBVA', 'credit_card', -2350.00, 'USD', '#ef4444', 'credit-card');

-- Account 5: Investment Account
INSERT INTO public.accounts (user_id, name, type, balance, currency, color, icon)
VALUES ('YOUR_USER_ID_HERE', 'Inversiones', 'investment', 45000.00, 'USD', '#8b5cf6', 'trending-up');

-- Account 6: Secondary Checking
INSERT INTO public.accounts (user_id, name, type, balance, currency, color, icon)
VALUES ('YOUR_USER_ID_HERE', 'Cuenta Nómina', 'checking', 3200.00, 'USD', '#06b6d4', 'building-2');

-- ============================================
-- 2. CREATE TRANSACTIONS (Sample 50 transactions)
-- ============================================

WITH user_accounts AS (
  SELECT id, type, name FROM public.accounts WHERE user_id = 'YOUR_USER_ID_HERE'
),
checking_account AS (
  SELECT id FROM user_accounts WHERE type = 'checking' AND name = 'Cuenta Corriente Principal' LIMIT 1
),
savings_account AS (
  SELECT id FROM user_accounts WHERE type = 'savings' LIMIT 1
),
cash_account AS (
  SELECT id FROM user_accounts WHERE type = 'cash' LIMIT 1
),
investment_account AS (
  SELECT id FROM user_accounts WHERE type = 'investment' LIMIT 1
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
  5500.00,
  'Salario mensual',
  CURRENT_DATE - INTERVAL '25 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM checking_account),
  (SELECT id FROM user_categories WHERE name = 'Freelance' AND type = 'income' LIMIT 1),
  'income',
  1850.00,
  'Proyecto freelance - Desarrollo app',
  CURRENT_DATE - INTERVAL '15 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM investment_account),
  (SELECT id FROM user_categories WHERE name = 'Inversiones' AND type = 'income' LIMIT 1),
  'income',
  425.50,
  'Dividendos acciones',
  CURRENT_DATE - INTERVAL '10 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM checking_account),
  (SELECT id FROM user_categories WHERE name = 'Bonos' AND type = 'income' LIMIT 1),
  'income',
  800.00,
  'Bono trimestral',
  CURRENT_DATE - INTERVAL '20 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM checking_account),
  (SELECT id FROM user_categories WHERE name = 'Ventas' AND type = 'income' LIMIT 1),
  'income',
  350.00,
  'Venta de artículos usados',
  CURRENT_DATE - INTERVAL '12 days'

-- Expense transactions - Alimentación
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM checking_account),
  (SELECT id FROM user_categories WHERE name = 'Alimentación' AND type = 'expense' LIMIT 1),
  'expense',
  125.30,
  'Supermercado Walmart',
  CURRENT_DATE - INTERVAL '2 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM cash_account),
  (SELECT id FROM user_categories WHERE name = 'Alimentación' AND type = 'expense' LIMIT 1),
  'expense',
  65.00,
  'Restaurante italiano',
  CURRENT_DATE - INTERVAL '5 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM checking_account),
  (SELECT id FROM user_categories WHERE name = 'Alimentación' AND type = 'expense' LIMIT 1),
  'expense',
  180.50,
  'Supermercado Costco',
  CURRENT_DATE - INTERVAL '12 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM cash_account),
  (SELECT id FROM user_categories WHERE name = 'Alimentación' AND type = 'expense' LIMIT 1),
  'expense',
  35.00,
  'Café Starbucks',
  CURRENT_DATE - INTERVAL '18 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM checking_account),
  (SELECT id FROM user_categories WHERE name = 'Alimentación' AND type = 'expense' LIMIT 1),
  'expense',
  95.00,
  'Restaurante japonés',
  CURRENT_DATE - INTERVAL '8 days'

-- Expense transactions - Transporte
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM checking_account),
  (SELECT id FROM user_categories WHERE name = 'Transporte' AND type = 'expense' LIMIT 1),
  'expense',
  75.00,
  'Gasolina',
  CURRENT_DATE - INTERVAL '3 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM cash_account),
  (SELECT id FROM user_categories WHERE name = 'Transporte' AND type = 'expense' LIMIT 1),
  'expense',
  25.00,
  'Uber',
  CURRENT_DATE - INTERVAL '7 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM checking_account),
  (SELECT id FROM user_categories WHERE name = 'Transporte' AND type = 'expense' LIMIT 1),
  'expense',
  70.00,
  'Gasolina',
  CURRENT_DATE - INTERVAL '14 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM checking_account),
  (SELECT id FROM user_categories WHERE name = 'Transporte' AND type = 'expense' LIMIT 1),
  'expense',
  45.00,
  'Mantenimiento auto',
  CURRENT_DATE - INTERVAL '21 days'

-- Expense transactions - Vivienda
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM checking_account),
  (SELECT id FROM user_categories WHERE name = 'Vivienda' AND type = 'expense' LIMIT 1),
  'expense',
  1200.00,
  'Renta mensual',
  CURRENT_DATE - INTERVAL '1 day'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM checking_account),
  (SELECT id FROM user_categories WHERE name = 'Vivienda' AND type = 'expense' LIMIT 1),
  'expense',
  65.00,
  'Luz',
  CURRENT_DATE - INTERVAL '8 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM checking_account),
  (SELECT id FROM user_categories WHERE name = 'Vivienda' AND type = 'expense' LIMIT 1),
  'expense',
  45.00,
  'Agua',
  CURRENT_DATE - INTERVAL '9 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM checking_account),
  (SELECT id FROM user_categories WHERE name = 'Vivienda' AND type = 'expense' LIMIT 1),
  'expense',
  35.00,
  'Gas',
  CURRENT_DATE - INTERVAL '10 days'

-- Expense transactions - Entretenimiento
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM checking_account),
  (SELECT id FROM user_categories WHERE name = 'Entretenimiento' AND type = 'expense' LIMIT 1),
  'expense',
  45.00,
  'Cine IMAX',
  CURRENT_DATE - INTERVAL '6 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM checking_account),
  (SELECT id FROM user_categories WHERE name = 'Entretenimiento' AND type = 'expense' LIMIT 1),
  'expense',
  220.00,
  'Concierto VIP',
  CURRENT_DATE - INTERVAL '20 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM checking_account),
  (SELECT id FROM user_categories WHERE name = 'Entretenimiento' AND type = 'expense' LIMIT 1),
  'expense',
  85.00,
  'Boliche con amigos',
  CURRENT_DATE - INTERVAL '16 days'

-- Expense transactions - Salud
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM checking_account),
  (SELECT id FROM user_categories WHERE name = 'Salud' AND type = 'expense' LIMIT 1),
  'expense',
  200.00,
  'Consulta especialista',
  CURRENT_DATE - INTERVAL '11 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM checking_account),
  (SELECT id FROM user_categories WHERE name = 'Salud' AND type = 'expense' LIMIT 1),
  'expense',
  65.50,
  'Farmacia',
  CURRENT_DATE - INTERVAL '13 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM checking_account),
  (SELECT id FROM user_categories WHERE name = 'Salud' AND type = 'expense' LIMIT 1),
  'expense',
  120.00,
  'Dentista',
  CURRENT_DATE - INTERVAL '19 days'

-- Expense transactions - Compras
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM checking_account),
  (SELECT id FROM user_categories WHERE name = 'Compras' AND type = 'expense' LIMIT 1),
  'expense',
  450.00,
  'Amazon - Laptop nueva',
  CURRENT_DATE - INTERVAL '4 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM checking_account),
  (SELECT id FROM user_categories WHERE name = 'Compras' AND type = 'expense' LIMIT 1),
  'expense',
  125.00,
  'Liverpool - Hogar',
  CURRENT_DATE - INTERVAL '16 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM checking_account),
  (SELECT id FROM user_categories WHERE name = 'Compras' AND type = 'expense' LIMIT 1),
  'expense',
  85.00,
  'Mercado Libre',
  CURRENT_DATE - INTERVAL '22 days'

-- Expense transactions - Servicios
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM checking_account),
  (SELECT id FROM user_categories WHERE name = 'Servicios' AND type = 'expense' LIMIT 1),
  'expense',
  70.00,
  'Internet fibra 500MB',
  CURRENT_DATE - INTERVAL '5 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM checking_account),
  (SELECT id FROM user_categories WHERE name = 'Servicios' AND type = 'expense' LIMIT 1),
  'expense',
  45.00,
  'Teléfono móvil',
  CURRENT_DATE - INTERVAL '6 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM checking_account),
  (SELECT id FROM user_categories WHERE name = 'Servicios' AND type = 'expense' LIMIT 1),
  'expense',
  35.00,
  'Streaming TV',
  CURRENT_DATE - INTERVAL '15 days'

-- Expense transactions - Ropa
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM checking_account),
  (SELECT id FROM user_categories WHERE name = 'Ropa' AND type = 'expense' LIMIT 1),
  'expense',
  280.00,
  'Zara - Ropa formal',
  CURRENT_DATE - INTERVAL '19 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM checking_account),
  (SELECT id FROM user_categories WHERE name = 'Ropa' AND type = 'expense' LIMIT 1),
  'expense',
  150.00,
  'Nike - Deportiva',
  CURRENT_DATE - INTERVAL '24 days'

-- Expense transactions - Educación
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM checking_account),
  (SELECT id FROM user_categories WHERE name = 'Educación' AND type = 'expense' LIMIT 1),
  'expense',
  195.00,
  'Curso Udemy - AWS',
  CURRENT_DATE - INTERVAL '22 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM checking_account),
  (SELECT id FROM user_categories WHERE name = 'Educación' AND type = 'expense' LIMIT 1),
  'expense',
  85.00,
  'Libros técnicos',
  CURRENT_DATE - INTERVAL '26 days'

-- Expense transactions - Regalos
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM checking_account),
  (SELECT id FROM user_categories WHERE name = 'Regalos' AND type = 'expense' LIMIT 1),
  'expense',
  125.00,
  'Regalo aniversario',
  CURRENT_DATE - INTERVAL '17 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM checking_account),
  (SELECT id FROM user_categories WHERE name = 'Regalos' AND type = 'expense' LIMIT 1),
  'expense',
  75.00,
  'Regalo cumpleaños',
  CURRENT_DATE - INTERVAL '28 days'

-- Expense transactions - Mascotas
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM checking_account),
  (SELECT id FROM user_categories WHERE name = 'Mascotas' AND type = 'expense' LIMIT 1),
  'expense',
  95.00,
  'Veterinario',
  CURRENT_DATE - INTERVAL '23 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM checking_account),
  (SELECT id FROM user_categories WHERE name = 'Mascotas' AND type = 'expense' LIMIT 1),
  'expense',
  45.00,
  'Comida para perro',
  CURRENT_DATE - INTERVAL '27 days'

-- Expense transactions - Impuestos
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM checking_account),
  (SELECT id FROM user_categories WHERE name = 'Impuestos' AND type = 'expense' LIMIT 1),
  'expense',
  350.00,
  'Pago de impuestos trimestrales',
  CURRENT_DATE - INTERVAL '29 days';

-- ============================================
-- 3. CREATE RECURRING SERVICES (Unlimited for pro tier - creating 10 services)
-- ============================================

WITH checking_account AS (
  SELECT id FROM public.accounts WHERE user_id = 'YOUR_USER_ID_HERE' AND type = 'checking' LIMIT 1
)

INSERT INTO public.recurring_services (user_id, name, category, amount, frequency, payment_day, next_payment_date, account_id, is_active)
SELECT 
  'YOUR_USER_ID_HERE',
  'Netflix Premium',
  'subscriptions',
  19.99,
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
  'Gimnasio Premium',
  'subscriptions',
  75.00,
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
  180.00,
  'monthly',
  5,
  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '4 days',
  (SELECT id FROM checking_account),
  true
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  'Internet Fibra Óptica 500MB',
  'utilities',
  70.00,
  'monthly',
  20,
  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '19 days',
  (SELECT id FROM checking_account),
  true
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  'Adobe Creative Cloud',
  'subscriptions',
  54.99,
  'monthly',
  12,
  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '11 days',
  (SELECT id FROM checking_account),
  true
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  'Amazon Prime',
  'subscriptions',
  14.99,
  'monthly',
  8,
  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '7 days',
  (SELECT id FROM checking_account),
  true
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  'Disney+',
  'subscriptions',
  10.99,
  'monthly',
  18,
  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '17 days',
  (SELECT id FROM checking_account),
  true
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  'Seguro de Vida',
  'insurance',
  85.00,
  'monthly',
  25,
  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '24 days',
  (SELECT id FROM checking_account),
  true
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  'Cloud Storage (Dropbox)',
  'subscriptions',
  11.99,
  'monthly',
  22,
  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '21 days',
  (SELECT id FROM checking_account),
  true;

-- ============================================
-- 4. CREATE CREDITS (Unlimited for pro tier - creating 4 credits)
-- ============================================

-- Credit 1: Credit Card
INSERT INTO public.credits (user_id, name, type, total_amount, remaining_amount, interest_rate, monthly_payment, due_date, start_date, end_date, status)
VALUES (
  'YOUR_USER_ID_HERE',
  'Tarjeta de Crédito BBVA Platinum',
  'credit_card',
  10000.00,
  3850.00,
  22.99,
  250.00,
  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '14 days',
  CURRENT_DATE - INTERVAL '12 months',
  CURRENT_DATE + INTERVAL '24 months',
  'active'
);

-- Credit 2: Personal Loan
INSERT INTO public.credits (user_id, name, type, total_amount, remaining_amount, interest_rate, monthly_payment, due_date, start_date, end_date, status)
VALUES (
  'YOUR_USER_ID_HERE',
  'Préstamo Personal Santander',
  'personal_loan',
  25000.00,
  15500.00,
  11.50,
  650.00,
  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '9 days',
  CURRENT_DATE - INTERVAL '18 months',
  CURRENT_DATE + INTERVAL '30 months',
  'active'
);

-- Credit 3: Mortgage
INSERT INTO public.credits (user_id, name, type, total_amount, remaining_amount, interest_rate, monthly_payment, due_date, start_date, end_date, status)
VALUES (
  'YOUR_USER_ID_HERE',
  'Hipoteca HSBC',
  'mortgage',
  250000.00,
  235000.00,
  8.75,
  1850.00,
  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '4 days',
  CURRENT_DATE - INTERVAL '24 months',
  CURRENT_DATE + INTERVAL '336 months',
  'active'
);

-- Credit 4: Car Loan
INSERT INTO public.credits (user_id, name, type, total_amount, remaining_amount, interest_rate, monthly_payment, due_date, start_date, end_date, status)
VALUES (
  'YOUR_USER_ID_HERE',
  'Crédito Automotriz Banamex',
  'personal_loan',
  35000.00,
  22000.00,
  9.99,
  580.00,
  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '19 days',
  CURRENT_DATE - INTERVAL '20 months',
  CURRENT_DATE + INTERVAL '40 months',
  'active'
);

-- ============================================
-- 5. CREATE CREDIT PAYMENTS (Sample history)
-- ============================================

WITH credit_card AS (
  SELECT id FROM public.credits WHERE user_id = 'YOUR_USER_ID_HERE' AND type = 'credit_card' LIMIT 1
),
personal_loan AS (
  SELECT id FROM public.credits WHERE user_id = 'YOUR_USER_ID_HERE' AND name = 'Préstamo Personal Santander' LIMIT 1
),
mortgage AS (
  SELECT id FROM public.credits WHERE user_id = 'YOUR_USER_ID_HERE' AND type = 'mortgage' LIMIT 1
),
car_loan AS (
  SELECT id FROM public.credits WHERE user_id = 'YOUR_USER_ID_HERE' AND name = 'Crédito Automotriz Banamex' LIMIT 1
)

-- Credit card payments
INSERT INTO public.credit_payments (credit_id, user_id, amount, payment_date)
SELECT 
  (SELECT id FROM credit_card),
  'YOUR_USER_ID_HERE',
  250.00,
  CURRENT_DATE - INTERVAL '30 days'
UNION ALL
SELECT 
  (SELECT id FROM credit_card),
  'YOUR_USER_ID_HERE',
  250.00,
  CURRENT_DATE - INTERVAL '60 days'
UNION ALL
SELECT 
  (SELECT id FROM credit_card),
  'YOUR_USER_ID_HERE',
  300.00,
  CURRENT_DATE - INTERVAL '90 days'

-- Personal loan payments
UNION ALL
SELECT 
  (SELECT id FROM personal_loan),
  'YOUR_USER_ID_HERE',
  650.00,
  CURRENT_DATE - INTERVAL '30 days'
UNION ALL
SELECT 
  (SELECT id FROM personal_loan),
  'YOUR_USER_ID_HERE',
  650.00,
  CURRENT_DATE - INTERVAL '60 days'
UNION ALL
SELECT 
  (SELECT id FROM personal_loan),
  'YOUR_USER_ID_HERE',
  650.00,
  CURRENT_DATE - INTERVAL '90 days'

-- Mortgage payments
UNION ALL
SELECT 
  (SELECT id FROM mortgage),
  'YOUR_USER_ID_HERE',
  1850.00,
  CURRENT_DATE - INTERVAL '30 days'
UNION ALL
SELECT 
  (SELECT id FROM mortgage),
  'YOUR_USER_ID_HERE',
  1850.00,
  CURRENT_DATE - INTERVAL '60 days'

-- Car loan payments
UNION ALL
SELECT 
  (SELECT id FROM car_loan),
  'YOUR_USER_ID_HERE',
  580.00,
  CURRENT_DATE - INTERVAL '30 days'
UNION ALL
SELECT 
  (SELECT id FROM car_loan),
  'YOUR_USER_ID_HERE',
  580.00,
  CURRENT_DATE - INTERVAL '60 days';

-- ============================================
-- DONE! Summary of created data:
-- ============================================
-- ✓ 6 Accounts (checking x2, savings, cash, credit card, investment)
-- ✓ 50 Transactions (income and expenses across all categories)
-- ✓ 10 Recurring Services (Netflix, Spotify, Gym, Insurance, Internet, Adobe, Prime, Disney+, Life Insurance, Dropbox)
-- ✓ 4 Active Credits (Credit Card, Personal Loan, Mortgage, Car Loan)
-- ✓ 11 Credit Payments (payment history)
