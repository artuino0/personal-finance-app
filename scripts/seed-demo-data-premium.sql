-- Demo Data Population Script for PREMIUM TIER
-- Usage: Replace ALL instances of 'YOUR_USER_ID_HERE' with the actual user UUID
-- Limits: Unlimited accounts, unlimited recurring services, unlimited active credits, unlimited AI analyses
-- 
-- IMPORTANT: Use Find & Replace (Ctrl+H) to replace 'YOUR_USER_ID_HERE' with your actual UUID
-- Example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890'

-- ============================================
-- 1. CREATE ACCOUNTS (Unlimited for premium tier - creating 8 accounts)
-- ============================================

-- Account 1: Main Checking Account
INSERT INTO public.accounts (user_id, name, type, balance, currency, color, icon)
VALUES ('YOUR_USER_ID_HERE', 'Cuenta Corriente Principal', 'checking', 15420.50, 'USD', '#3b82f6', 'wallet');

-- Account 2: Savings Account
INSERT INTO public.accounts (user_id, name, type, balance, currency, color, icon)
VALUES ('YOUR_USER_ID_HERE', 'Ahorros Largo Plazo', 'savings', 45000.00, 'USD', '#10b981', 'piggy-bank');

-- Account 3: Emergency Fund
INSERT INTO public.accounts (user_id, name, type, balance, currency, color, icon)
VALUES ('YOUR_USER_ID_HERE', 'Fondo de Emergencia', 'savings', 18000.00, 'USD', '#14b8a6', 'shield');

-- Account 4: Cash
INSERT INTO public.accounts (user_id, name, type, balance, currency, color, icon)
VALUES ('YOUR_USER_ID_HERE', 'Efectivo', 'cash', 850.00, 'USD', '#f59e0b', 'banknote');

-- Account 5: Credit Card Premium
INSERT INTO public.accounts (user_id, name, type, balance, currency, color, icon)
VALUES ('YOUR_USER_ID_HERE', 'Tarjeta Black BBVA', 'credit_card', -4350.00, 'USD', '#ef4444', 'credit-card');

-- Account 6: Investment Portfolio
INSERT INTO public.accounts (user_id, name, type, balance, currency, color, icon)
VALUES ('YOUR_USER_ID_HERE', 'Portafolio de Inversiones', 'investment', 85000.00, 'USD', '#8b5cf6', 'trending-up');

-- Account 7: Business Checking
INSERT INTO public.accounts (user_id, name, type, balance, currency, color, icon)
VALUES ('YOUR_USER_ID_HERE', 'Cuenta Empresarial', 'checking', 28500.00, 'USD', '#06b6d4', 'building-2');

-- Account 8: Retirement Account
INSERT INTO public.accounts (user_id, name, type, balance, currency, color, icon)
VALUES ('YOUR_USER_ID_HERE', 'Cuenta de Retiro', 'investment', 125000.00, 'USD', '#a855f7', 'landmark');

-- ============================================
-- 2. CREATE TRANSACTIONS (Sample 70 transactions - comprehensive demo)
-- ============================================

WITH user_accounts AS (
  SELECT id, type, name FROM public.accounts WHERE user_id = 'YOUR_USER_ID_HERE'
),
main_checking AS (
  SELECT id FROM user_accounts WHERE name = 'Cuenta Corriente Principal' LIMIT 1
),
business_checking AS (
  SELECT id FROM user_accounts WHERE name = 'Cuenta Empresarial' LIMIT 1
),
savings_account AS (
  SELECT id FROM user_accounts WHERE name = 'Ahorros Largo Plazo' LIMIT 1
),
emergency_fund AS (
  SELECT id FROM user_accounts WHERE name = 'Fondo de Emergencia' LIMIT 1
),
cash_account AS (
  SELECT id FROM user_accounts WHERE type = 'cash' LIMIT 1
),
investment_account AS (
  SELECT id FROM user_accounts WHERE name = 'Portafolio de Inversiones' LIMIT 1
),
retirement_account AS (
  SELECT id FROM user_accounts WHERE name = 'Cuenta de Retiro' LIMIT 1
),
user_categories AS (
  SELECT id, name, type FROM public.categories WHERE user_id = 'YOUR_USER_ID_HERE'
)

-- Income transactions - Multiple sources
INSERT INTO public.transactions (user_id, account_id, category_id, type, amount, description, date)
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM main_checking),
  (SELECT id FROM user_categories WHERE name = 'Salario' AND type = 'income' LIMIT 1),
  'income',
  8500.00,
  'Salario mensual - Empresa principal',
  CURRENT_DATE - INTERVAL '25 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM business_checking),
  (SELECT id FROM user_categories WHERE name = 'Freelance' AND type = 'income' LIMIT 1),
  'income',
  3850.00,
  'Consultoría - Cliente A',
  CURRENT_DATE - INTERVAL '15 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM business_checking),
  (SELECT id FROM user_categories WHERE name = 'Freelance' AND type = 'income' LIMIT 1),
  'income',
  2200.00,
  'Proyecto desarrollo - Cliente B',
  CURRENT_DATE - INTERVAL '8 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM investment_account),
  (SELECT id FROM user_categories WHERE name = 'Inversiones' AND type = 'income' LIMIT 1),
  'income',
  1425.50,
  'Dividendos acciones tech',
  CURRENT_DATE - INTERVAL '10 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM retirement_account),
  (SELECT id FROM user_categories WHERE name = 'Inversiones' AND type = 'income' LIMIT 1),
  'income',
  850.00,
  'Rendimientos fondo de retiro',
  CURRENT_DATE - INTERVAL '12 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM main_checking),
  (SELECT id FROM user_categories WHERE name = 'Bonos' AND type = 'income' LIMIT 1),
  'income',
  1500.00,
  'Bono trimestral',
  CURRENT_DATE - INTERVAL '20 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM business_checking),
  (SELECT id FROM user_categories WHERE name = 'Ventas' AND type = 'income' LIMIT 1),
  'income',
  950.00,
  'Venta de servicios digitales',
  CURRENT_DATE - INTERVAL '5 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM main_checking),
  (SELECT id FROM user_categories WHERE name = 'Otros ingresos' AND type = 'income' LIMIT 1),
  'income',
  450.00,
  'Reembolso de impuestos',
  CURRENT_DATE - INTERVAL '18 days'

-- Expense transactions - Alimentación (10 transactions)
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM main_checking),
  (SELECT id FROM user_categories WHERE name = 'Alimentación' AND type = 'expense' LIMIT 1),
  'expense',
  185.30,
  'Supermercado Costco',
  CURRENT_DATE - INTERVAL '2 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM cash_account),
  (SELECT id FROM user_categories WHERE name = 'Alimentación' AND type = 'expense' LIMIT 1),
  'expense',
  95.00,
  'Restaurante gourmet',
  CURRENT_DATE - INTERVAL '5 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM main_checking),
  (SELECT id FROM user_categories WHERE name = 'Alimentación' AND type = 'expense' LIMIT 1),
  'expense',
  220.50,
  'Supermercado Whole Foods',
  CURRENT_DATE - INTERVAL '12 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM cash_account),
  (SELECT id FROM user_categories WHERE name = 'Alimentación' AND type = 'expense' LIMIT 1),
  'expense',
  45.00,
  'Café Starbucks',
  CURRENT_DATE - INTERVAL '18 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM main_checking),
  (SELECT id FROM user_categories WHERE name = 'Alimentación' AND type = 'expense' LIMIT 1),
  'expense',
  135.00,
  'Restaurante japonés',
  CURRENT_DATE - INTERVAL '8 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM cash_account),
  (SELECT id FROM user_categories WHERE name = 'Alimentación' AND type = 'expense' LIMIT 1),
  'expense',
  65.00,
  'Brunch fin de semana',
  CURRENT_DATE - INTERVAL '14 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM main_checking),
  (SELECT id FROM user_categories WHERE name = 'Alimentación' AND type = 'expense' LIMIT 1),
  'expense',
  150.00,
  'Supermercado semanal',
  CURRENT_DATE - INTERVAL '19 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM cash_account),
  (SELECT id FROM user_categories WHERE name = 'Alimentación' AND type = 'expense' LIMIT 1),
  'expense',
  85.00,
  'Comida delivery',
  CURRENT_DATE - INTERVAL '22 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM main_checking),
  (SELECT id FROM user_categories WHERE name = 'Alimentación' AND type = 'expense' LIMIT 1),
  'expense',
  175.00,
  'Cena romántica',
  CURRENT_DATE - INTERVAL '26 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM cash_account),
  (SELECT id FROM user_categories WHERE name = 'Alimentación' AND type = 'expense' LIMIT 1),
  'expense',
  35.00,
  'Snacks y bebidas',
  CURRENT_DATE - INTERVAL '28 days'

-- Expense transactions - Transporte (8 transactions)
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM main_checking),
  (SELECT id FROM user_categories WHERE name = 'Transporte' AND type = 'expense' LIMIT 1),
  'expense',
  95.00,
  'Gasolina premium',
  CURRENT_DATE - INTERVAL '3 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM cash_account),
  (SELECT id FROM user_categories WHERE name = 'Transporte' AND type = 'expense' LIMIT 1),
  'expense',
  45.00,
  'Uber Premium',
  CURRENT_DATE - INTERVAL '7 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM main_checking),
  (SELECT id FROM user_categories WHERE name = 'Transporte' AND type = 'expense' LIMIT 1),
  'expense',
  90.00,
  'Gasolina',
  CURRENT_DATE - INTERVAL '14 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM main_checking),
  (SELECT id FROM user_categories WHERE name = 'Transporte' AND type = 'expense' LIMIT 1),
  'expense',
  250.00,
  'Servicio completo auto',
  CURRENT_DATE - INTERVAL '21 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM main_checking),
  (SELECT id FROM user_categories WHERE name = 'Transporte' AND type = 'expense' LIMIT 1),
  'expense',
  85.00,
  'Gasolina',
  CURRENT_DATE - INTERVAL '24 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM cash_account),
  (SELECT id FROM user_categories WHERE name = 'Transporte' AND type = 'expense' LIMIT 1),
  'expense',
  35.00,
  'Estacionamiento',
  CURRENT_DATE - INTERVAL '16 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM main_checking),
  (SELECT id FROM user_categories WHERE name = 'Transporte' AND type = 'expense' LIMIT 1),
  'expense',
  120.00,
  'Lavado y detallado auto',
  CURRENT_DATE - INTERVAL '27 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM cash_account),
  (SELECT id FROM user_categories WHERE name = 'Transporte' AND type = 'expense' LIMIT 1),
  'expense',
  25.00,
  'Peaje autopista',
  CURRENT_DATE - INTERVAL '29 days'

-- Expense transactions - Vivienda (6 transactions)
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM main_checking),
  (SELECT id FROM user_categories WHERE name = 'Vivienda' AND type = 'expense' LIMIT 1),
  'expense',
  2200.00,
  'Hipoteca mensual',
  CURRENT_DATE - INTERVAL '1 day'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM main_checking),
  (SELECT id FROM user_categories WHERE name = 'Vivienda' AND type = 'expense' LIMIT 1),
  'expense',
  95.00,
  'Luz',
  CURRENT_DATE - INTERVAL '8 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM main_checking),
  (SELECT id FROM user_categories WHERE name = 'Vivienda' AND type = 'expense' LIMIT 1),
  'expense',
  55.00,
  'Agua',
  CURRENT_DATE - INTERVAL '9 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM main_checking),
  (SELECT id FROM user_categories WHERE name = 'Vivienda' AND type = 'expense' LIMIT 1),
  'expense',
  45.00,
  'Gas',
  CURRENT_DATE - INTERVAL '10 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM main_checking),
  (SELECT id FROM user_categories WHERE name = 'Vivienda' AND type = 'expense' LIMIT 1),
  'expense',
  150.00,
  'Mantenimiento jardín',
  CURRENT_DATE - INTERVAL '15 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM main_checking),
  (SELECT id FROM user_categories WHERE name = 'Vivienda' AND type = 'expense' LIMIT 1),
  'expense',
  85.00,
  'Servicio de limpieza',
  CURRENT_DATE - INTERVAL '23 days'

-- Expense transactions - Entretenimiento (8 transactions)
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM main_checking),
  (SELECT id FROM user_categories WHERE name = 'Entretenimiento' AND type = 'expense' LIMIT 1),
  'expense',
  65.00,
  'Cine IMAX 3D',
  CURRENT_DATE - INTERVAL '6 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM main_checking),
  (SELECT id FROM user_categories WHERE name = 'Entretenimiento' AND type = 'expense' LIMIT 1),
  'expense',
  350.00,
  'Concierto VIP',
  CURRENT_DATE - INTERVAL '20 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM main_checking),
  (SELECT id FROM user_categories WHERE name = 'Entretenimiento' AND type = 'expense' LIMIT 1),
  'expense',
  125.00,
  'Boliche y arcade',
  CURRENT_DATE - INTERVAL '16 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM main_checking),
  (SELECT id FROM user_categories WHERE name = 'Entretenimiento' AND type = 'expense' LIMIT 1),
  'expense',
  450.00,
  'Evento deportivo premium',
  CURRENT_DATE - INTERVAL '11 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM cash_account),
  (SELECT id FROM user_categories WHERE name = 'Entretenimiento' AND type = 'expense' LIMIT 1),
  'expense',
  75.00,
  'Escape room',
  CURRENT_DATE - INTERVAL '24 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM main_checking),
  (SELECT id FROM user_categories WHERE name = 'Entretenimiento' AND type = 'expense' LIMIT 1),
  'expense',
  200.00,
  'Teatro - Musical',
  CURRENT_DATE - INTERVAL '28 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM cash_account),
  (SELECT id FROM user_categories WHERE name = 'Entretenimiento' AND type = 'expense' LIMIT 1),
  'expense',
  95.00,
  'Bar con amigos',
  CURRENT_DATE - INTERVAL '13 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM main_checking),
  (SELECT id FROM user_categories WHERE name = 'Entretenimiento' AND type = 'expense' LIMIT 1),
  'expense',
  180.00,
  'Spa y masajes',
  CURRENT_DATE - INTERVAL '17 days'

-- Expense transactions - Salud (6 transactions)
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM main_checking),
  (SELECT id FROM user_categories WHERE name = 'Salud' AND type = 'expense' LIMIT 1),
  'expense',
  300.00,
  'Consulta especialista',
  CURRENT_DATE - INTERVAL '11 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM main_checking),
  (SELECT id FROM user_categories WHERE name = 'Salud' AND type = 'expense' LIMIT 1),
  'expense',
  85.50,
  'Farmacia - Medicamentos',
  CURRENT_DATE - INTERVAL '13 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM main_checking),
  (SELECT id FROM user_categories WHERE name = 'Salud' AND type = 'expense' LIMIT 1),
  'expense',
  200.00,
  'Dentista - Limpieza',
  CURRENT_DATE - INTERVAL '19 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM main_checking),
  (SELECT id FROM user_categories WHERE name = 'Salud' AND type = 'expense' LIMIT 1),
  'expense',
  150.00,
  'Exámenes de laboratorio',
  CURRENT_DATE - INTERVAL '25 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM main_checking),
  (SELECT id FROM user_categories WHERE name = 'Salud' AND type = 'expense' LIMIT 1),
  'expense',
  120.00,
  'Nutricionista',
  CURRENT_DATE - INTERVAL '9 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM main_checking),
  (SELECT id FROM user_categories WHERE name = 'Salud' AND type = 'expense' LIMIT 1),
  'expense',
  95.00,
  'Vitaminas y suplementos',
  CURRENT_DATE - INTERVAL '21 days'

-- Expense transactions - Compras (8 transactions)
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM main_checking),
  (SELECT id FROM user_categories WHERE name = 'Compras' AND type = 'expense' LIMIT 1),
  'expense',
  1250.00,
  'MacBook Pro',
  CURRENT_DATE - INTERVAL '4 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM main_checking),
  (SELECT id FROM user_categories WHERE name = 'Compras' AND type = 'expense' LIMIT 1),
  'expense',
  325.00,
  'Liverpool - Electrodomésticos',
  CURRENT_DATE - INTERVAL '16 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM main_checking),
  (SELECT id FROM user_categories WHERE name = 'Compras' AND type = 'expense' LIMIT 1),
  'expense',
  185.00,
  'Amazon - Gadgets',
  CURRENT_DATE - INTERVAL '22 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM main_checking),
  (SELECT id FROM user_categories WHERE name = 'Compras' AND type = 'expense' LIMIT 1),
  'expense',
  450.00,
  'Muebles para oficina',
  CURRENT_DATE - INTERVAL '27 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM main_checking),
  (SELECT id FROM user_categories WHERE name = 'Compras' AND type = 'expense' LIMIT 1),
  'expense',
  95.00,
  'Decoración hogar',
  CURRENT_DATE - INTERVAL '10 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM main_checking),
  (SELECT id FROM user_categories WHERE name = 'Compras' AND type = 'expense' LIMIT 1),
  'expense',
  275.00,
  'Best Buy - Electrónicos',
  CURRENT_DATE - INTERVAL '18 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM main_checking),
  (SELECT id FROM user_categories WHERE name = 'Compras' AND type = 'expense' LIMIT 1),
  'expense',
  150.00,
  'Artículos para cocina',
  CURRENT_DATE - INTERVAL '24 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM main_checking),
  (SELECT id FROM user_categories WHERE name = 'Compras' AND type = 'expense' LIMIT 1),
  'expense',
  85.00,
  'Mercado Libre - Varios',
  CURRENT_DATE - INTERVAL '29 days'

-- Expense transactions - Servicios (4 transactions)
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM main_checking),
  (SELECT id FROM user_categories WHERE name = 'Servicios' AND type = 'expense' LIMIT 1),
  'expense',
  100.00,
  'Internet fibra 1GB',
  CURRENT_DATE - INTERVAL '5 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM main_checking),
  (SELECT id FROM user_categories WHERE name = 'Servicios' AND type = 'expense' LIMIT 1),
  'expense',
  65.00,
  'Teléfono móvil premium',
  CURRENT_DATE - INTERVAL '6 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM main_checking),
  (SELECT id FROM user_categories WHERE name = 'Servicios' AND type = 'expense' LIMIT 1),
  'expense',
  45.00,
  'Streaming bundle',
  CURRENT_DATE - INTERVAL '15 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM business_checking),
  (SELECT id FROM user_categories WHERE name = 'Servicios' AND type = 'expense' LIMIT 1),
  'expense',
  150.00,
  'Hosting y dominio web',
  CURRENT_DATE - INTERVAL '20 days'

-- Expense transactions - Ropa (4 transactions)
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM main_checking),
  (SELECT id FROM user_categories WHERE name = 'Ropa' AND type = 'expense' LIMIT 1),
  'expense',
  450.00,
  'Hugo Boss - Traje',
  CURRENT_DATE - INTERVAL '19 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM main_checking),
  (SELECT id FROM user_categories WHERE name = 'Ropa' AND type = 'expense' LIMIT 1),
  'expense',
  250.00,
  'Nike - Ropa deportiva',
  CURRENT_DATE - INTERVAL '24 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM main_checking),
  (SELECT id FROM user_categories WHERE name = 'Ropa' AND type = 'expense' LIMIT 1),
  'expense',
  180.00,
  'Zara - Casual',
  CURRENT_DATE - INTERVAL '12 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM main_checking),
  (SELECT id FROM user_categories WHERE name = 'Ropa' AND type = 'expense' LIMIT 1),
  'expense',
  320.00,
  'Zapatos de diseñador',
  CURRENT_DATE - INTERVAL '26 days'

-- Expense transactions - Educación (4 transactions)
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM main_checking),
  (SELECT id FROM user_categories WHERE name = 'Educación' AND type = 'expense' LIMIT 1),
  'expense',
  395.00,
  'Curso Udemy - Machine Learning',
  CURRENT_DATE - INTERVAL '22 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM main_checking),
  (SELECT id FROM user_categories WHERE name = 'Educación' AND type = 'expense' LIMIT 1),
  'expense',
  185.00,
  'Libros técnicos Amazon',
  CURRENT_DATE - INTERVAL '26 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM business_checking),
  (SELECT id FROM user_categories WHERE name = 'Educación' AND type = 'expense' LIMIT 1),
  'expense',
  500.00,
  'Conferencia tech',
  CURRENT_DATE - INTERVAL '14 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM main_checking),
  (SELECT id FROM user_categories WHERE name = 'Educación' AND type = 'expense' LIMIT 1),
  'expense',
  150.00,
  'Suscripción Coursera',
  CURRENT_DATE - INTERVAL '7 days'

-- Expense transactions - Regalos (3 transactions)
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM main_checking),
  (SELECT id FROM user_categories WHERE name = 'Regalos' AND type = 'expense' LIMIT 1),
  'expense',
  250.00,
  'Regalo aniversario',
  CURRENT_DATE - INTERVAL '17 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM main_checking),
  (SELECT id FROM user_categories WHERE name = 'Regalos' AND type = 'expense' LIMIT 1),
  'expense',
  125.00,
  'Regalo cumpleaños',
  CURRENT_DATE - INTERVAL '28 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM main_checking),
  (SELECT id FROM user_categories WHERE name = 'Regalos' AND type = 'expense' LIMIT 1),
  'expense',
  95.00,
  'Regalo navidad',
  CURRENT_DATE - INTERVAL '23 days'

-- Expense transactions - Mascotas (2 transactions)
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM main_checking),
  (SELECT id FROM user_categories WHERE name = 'Mascotas' AND type = 'expense' LIMIT 1),
  'expense',
  150.00,
  'Veterinario - Chequeo',
  CURRENT_DATE - INTERVAL '23 days'
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM main_checking),
  (SELECT id FROM user_categories WHERE name = 'Mascotas' AND type = 'expense' LIMIT 1),
  'expense',
  75.00,
  'Comida premium para perro',
  CURRENT_DATE - INTERVAL '27 days'

-- Expense transactions - Impuestos (1 transaction)
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  (SELECT id FROM business_checking),
  (SELECT id FROM user_categories WHERE name = 'Impuestos' AND type = 'expense' LIMIT 1),
  'expense',
  850.00,
  'Pago de impuestos trimestrales',
  CURRENT_DATE - INTERVAL '29 days';

-- ============================================
-- 3. CREATE RECURRING SERVICES (Unlimited for premium tier - creating 15 services)
-- ============================================

WITH main_checking AS (
  SELECT id FROM public.accounts WHERE user_id = 'YOUR_USER_ID_HERE' AND name = 'Cuenta Corriente Principal' LIMIT 1
),
business_checking AS (
  SELECT id FROM public.accounts WHERE user_id = 'YOUR_USER_ID_HERE' AND name = 'Cuenta Empresarial' LIMIT 1
)

INSERT INTO public.recurring_services (user_id, name, category, amount, frequency, payment_day, next_payment_date, account_id, is_active)
SELECT 
  'YOUR_USER_ID_HERE',
  'Netflix Premium 4K',
  'subscriptions',
  22.99,
  'monthly',
  15,
  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '14 days',
  (SELECT id FROM main_checking),
  true
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  'Spotify Family',
  'subscriptions',
  16.99,
  'monthly',
  10,
  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '9 days',
  (SELECT id FROM main_checking),
  true
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  'Gimnasio Premium + Spa',
  'subscriptions',
  125.00,
  'monthly',
  1,
  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month',
  (SELECT id FROM main_checking),
  true
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  'Seguro de Auto Premium',
  'insurance',
  250.00,
  'monthly',
  5,
  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '4 days',
  (SELECT id FROM main_checking),
  true
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  'Internet Fibra Óptica 1GB',
  'utilities',
  100.00,
  'monthly',
  20,
  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '19 days',
  (SELECT id FROM main_checking),
  true
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  'Adobe Creative Cloud All Apps',
  'subscriptions',
  79.99,
  'monthly',
  12,
  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '11 days',
  (SELECT id FROM business_checking),
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
  (SELECT id FROM main_checking),
  true
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  'Disney+ Premium',
  'subscriptions',
  13.99,
  'monthly',
  18,
  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '17 days',
  (SELECT id FROM main_checking),
  true
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  'Seguro de Vida',
  'insurance',
  150.00,
  'monthly',
  25,
  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '24 days',
  (SELECT id FROM main_checking),
  true
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  'Cloud Storage (Dropbox Business)',
  'subscriptions',
  19.99,
  'monthly',
  22,
  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '21 days',
  (SELECT id FROM business_checking),
  true
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  'HBO Max',
  'subscriptions',
  15.99,
  'monthly',
  14,
  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '13 days',
  (SELECT id FROM main_checking),
  true
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  'Apple One Premium',
  'subscriptions',
  32.95,
  'monthly',
  7,
  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '6 days',
  (SELECT id FROM main_checking),
  true
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  'LinkedIn Premium',
  'subscriptions',
  39.99,
  'monthly',
  3,
  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '2 days',
  (SELECT id FROM business_checking),
  true
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  'Seguro Médico Privado',
  'insurance',
  450.00,
  'monthly',
  1,
  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month',
  (SELECT id FROM main_checking),
  true
UNION ALL
SELECT 
  'YOUR_USER_ID_HERE',
  'Coursera Plus',
  'subscriptions',
  59.00,
  'monthly',
  16,
  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '15 days',
  (SELECT id FROM main_checking),
  true;

-- ============================================
-- 4. CREATE CREDITS (Unlimited for premium tier - creating 5 credits)
-- ============================================

-- Credit 1: Premium Credit Card
INSERT INTO public.credits (user_id, name, type, total_amount, remaining_amount, interest_rate, monthly_payment, due_date, start_date, end_date, status)
VALUES (
  'YOUR_USER_ID_HERE',
  'Tarjeta Black BBVA Infinite',
  'credit_card',
  20000.00,
  6850.00,
  19.99,
  450.00,
  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '14 days',
  CURRENT_DATE - INTERVAL '18 months',
  CURRENT_DATE + INTERVAL '30 months',
  'active'
);

-- Credit 2: Personal Loan
INSERT INTO public.credits (user_id, name, type, total_amount, remaining_amount, interest_rate, monthly_payment, due_date, start_date, end_date, status)
VALUES (
  'YOUR_USER_ID_HERE',
  'Préstamo Personal Santander Select',
  'personal_loan',
  40000.00,
  25500.00,
  10.50,
  850.00,
  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '9 days',
  CURRENT_DATE - INTERVAL '20 months',
  CURRENT_DATE + INTERVAL '40 months',
  'active'
);

-- Credit 3: Mortgage
INSERT INTO public.credits (user_id, name, type, total_amount, remaining_amount, interest_rate, monthly_payment, due_date, start_date, end_date, status)
VALUES (
  'YOUR_USER_ID_HERE',
  'Hipoteca HSBC Premier',
  'mortgage',
  450000.00,
  425000.00,
  7.75,
  2850.00,
  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '4 days',
  CURRENT_DATE - INTERVAL '36 months',
  CURRENT_DATE + INTERVAL '324 months',
  'active'
);

-- Credit 4: Car Loan
INSERT INTO public.credits (user_id, name, type, total_amount, remaining_amount, interest_rate, monthly_payment, due_date, start_date, end_date, status)
VALUES (
  'YOUR_USER_ID_HERE',
  'Crédito Automotriz BMW',
  'personal_loan',
  55000.00,
  38000.00,
  8.99,
  950.00,
  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '19 days',
  CURRENT_DATE - INTERVAL '24 months',
  CURRENT_DATE + INTERVAL '36 months',
  'active'
);

-- Credit 5: Business Line of Credit
INSERT INTO public.credits (user_id, name, type, total_amount, remaining_amount, interest_rate, monthly_payment, due_date, start_date, end_date, status)
VALUES (
  'YOUR_USER_ID_HERE',
  'Línea de Crédito Empresarial',
  'personal_loan',
  100000.00,
  45000.00,
  12.00,
  1200.00,
  DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month' + INTERVAL '24 days',
  CURRENT_DATE - INTERVAL '10 months',
  CURRENT_DATE + INTERVAL '50 months',
  'active'
);

-- ============================================
-- 5. CREATE CREDIT PAYMENTS (Sample history)
-- ============================================

WITH credit_card AS (
  SELECT id FROM public.credits WHERE user_id = 'YOUR_USER_ID_HERE' AND type = 'credit_card' LIMIT 1
),
personal_loan AS (
  SELECT id FROM public.credits WHERE user_id = 'YOUR_USER_ID_HERE' AND name = 'Préstamo Personal Santander Select' LIMIT 1
),
mortgage AS (
  SELECT id FROM public.credits WHERE user_id = 'YOUR_USER_ID_HERE' AND type = 'mortgage' LIMIT 1
),
car_loan AS (
  SELECT id FROM public.credits WHERE user_id = 'YOUR_USER_ID_HERE' AND name = 'Crédito Automotriz BMW' LIMIT 1
),
business_credit AS (
  SELECT id FROM public.credits WHERE user_id = 'YOUR_USER_ID_HERE' AND name = 'Línea de Crédito Empresarial' LIMIT 1
)

-- Credit card payments
INSERT INTO public.credit_payments (credit_id, user_id, amount, payment_date)
SELECT 
  (SELECT id FROM credit_card),
  'YOUR_USER_ID_HERE',
  450.00,
  CURRENT_DATE - INTERVAL '30 days'
UNION ALL
SELECT 
  (SELECT id FROM credit_card),
  'YOUR_USER_ID_HERE',
  450.00,
  CURRENT_DATE - INTERVAL '60 days'
UNION ALL
SELECT 
  (SELECT id FROM credit_card),
  'YOUR_USER_ID_HERE',
  500.00,
  CURRENT_DATE - INTERVAL '90 days'

-- Personal loan payments
UNION ALL
SELECT 
  (SELECT id FROM personal_loan),
  'YOUR_USER_ID_HERE',
  850.00,
  CURRENT_DATE - INTERVAL '30 days'
UNION ALL
SELECT 
  (SELECT id FROM personal_loan),
  'YOUR_USER_ID_HERE',
  850.00,
  CURRENT_DATE - INTERVAL '60 days'
UNION ALL
SELECT 
  (SELECT id FROM personal_loan),
  'YOUR_USER_ID_HERE',
  850.00,
  CURRENT_DATE - INTERVAL '90 days'

-- Mortgage payments
UNION ALL
SELECT 
  (SELECT id FROM mortgage),
  'YOUR_USER_ID_HERE',
  2850.00,
  CURRENT_DATE - INTERVAL '30 days'
UNION ALL
SELECT 
  (SELECT id FROM mortgage),
  'YOUR_USER_ID_HERE',
  2850.00,
  CURRENT_DATE - INTERVAL '60 days'
UNION ALL
SELECT 
  (SELECT id FROM mortgage),
  'YOUR_USER_ID_HERE',
  2850.00,
  CURRENT_DATE - INTERVAL '90 days'

-- Car loan payments
UNION ALL
SELECT 
  (SELECT id FROM car_loan),
  'YOUR_USER_ID_HERE',
  950.00,
  CURRENT_DATE - INTERVAL '30 days'
UNION ALL
SELECT 
  (SELECT id FROM car_loan),
  'YOUR_USER_ID_HERE',
  950.00,
  CURRENT_DATE - INTERVAL '60 days'

-- Business credit payments
UNION ALL
SELECT 
  (SELECT id FROM business_credit),
  'YOUR_USER_ID_HERE',
  1200.00,
  CURRENT_DATE - INTERVAL '30 days'
UNION ALL
SELECT 
  (SELECT id FROM business_credit),
  'YOUR_USER_ID_HERE',
  1200.00,
  CURRENT_DATE - INTERVAL '60 days';

-- ============================================
-- DONE! Summary of created data:
-- ============================================
-- ✓ 8 Accounts (checking x2, savings x2, cash, credit card, investment x2)
-- ✓ 70 Transactions (comprehensive income and expenses across all categories)
-- ✓ 15 Recurring Services (All major subscriptions, insurances, and utilities)
-- ✓ 5 Active Credits (Credit Card, Personal Loan, Mortgage, Car Loan, Business Credit)
-- ✓ 14 Credit Payments (comprehensive payment history)
