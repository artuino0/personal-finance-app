-- Add new fields to credits table for better tracking
alter table public.credits 
  add column if not exists payment_day integer check (payment_day >= 1 and payment_day <= 31),
  add column if not exists total_installments integer,
  add column if not exists paid_installments integer default 0;

-- Update existing credits to have paid_installments = 0 if null
update public.credits set paid_installments = 0 where paid_installments is null;
