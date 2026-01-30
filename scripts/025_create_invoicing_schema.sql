-- Facturacion Module Schema
-- Tables for invoice management with Facturapi integration

-- Table to store Facturapi configuration per user
create table if not exists public.facturapi_config (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  api_key text, -- Encrypted Facturapi API key
  certificate_file_url text, -- URL to stored .cer file in Supabase Storage
  key_file_url text, -- URL to stored .key file in Supabase Storage
  certificate_password_encrypted text, -- Encrypted password
  rfc text,
  razon_social text,
  regimen_fiscal text,
  codigo_postal text,
  is_active boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table to store invoice clients
create table if not exists public.invoice_clients (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  rfc text not null,
  nombre text not null,
  razon_social text,
  regimen_fiscal text not null, -- Clave del catálogo SAT
  codigo_postal text not null,
  uso_cfdi text not null, -- G03, I01, etc.
  email text,
  telefono text,
  calle text,
  numero_exterior text,
  numero_interior text,
  colonia text,
  municipio text,
  estado text,
  pais text default 'MEX',
  facturapi_customer_id text, -- ID del cliente en Facturapi
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  constraint unique_client_per_user unique(user_id, rfc)
);

-- Table to store products/concepts catalog
create table if not exists public.invoice_products (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  clave_prod_serv text not null, -- Catálogo SAT de productos/servicios
  clave_unidad text not null default 'E48', -- Catálogo SAT de unidades (E48=Unidad de servicio)
  descripcion text not null,
  precio_unitario numeric(15, 2) not null,
  objeto_impuesto text not null default '02', -- 01=No objeto, 02=Si objeto, 03=Si objeto no obligado
  -- Para IVA
  tiene_iva boolean default true,
  tasa_iva numeric(5, 4) default 0.16, -- 16% IVA estándar
  -- Para IEPS (opcional)
  tiene_ieps boolean default false,
  tasa_ieps numeric(5, 4) default 0,
  -- Para retenciones
  tiene_retencion_iva boolean default false,
  tasa_retencion_iva numeric(5, 4) default 0,
  tiene_retencion_isr boolean default false,
  tasa_retencion_isr numeric(5, 4) default 0,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table to store invoices
create table if not exists public.invoices (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users(id) on delete cascade,
  client_id uuid not null references public.invoice_clients(id) on delete restrict,
  
  -- Invoice details
  tipo_comprobante text not null default 'I', -- I=Ingreso, E=Egreso, T=Traslado, N=Nómina, P=Pago
  serie text,
  folio text,
  fecha timestamp with time zone default timezone('utc'::text, now()) not null,
  
  -- Payment terms
  forma_pago text not null, -- 01=Efectivo, 03=Transferencia, 04=Tarjeta, etc.
  metodo_pago text not null, -- PUE=Pago en una sola exhibición, PPD=Pago en parcialidades
  moneda text not null default 'MXN',
  tipo_cambio numeric(10, 4) default 1,
  
  -- Amounts
  subtotal numeric(15, 2) not null,
  total_impuestos_trasladados numeric(15, 2) default 0,
  total_impuestos_retenidos numeric(15, 2) default 0,
  total numeric(15, 2) not null,
  
  -- Facturapi integration
  facturapi_invoice_id text, -- ID de la factura en Facturapi
  uuid text, -- UUID del SAT (Folio Fiscal)
  pdf_url text,
  xml_url text,
  zip_url text,
  
  -- Status
  status text not null default 'draft', -- draft, pending, stamped, canceled, error
  error_message text,
  cancelation_reason text,
  cancelation_date timestamp with time zone,
  
  -- Metadata
  notas text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Table to store invoice line items (conceptos)
create table if not exists public.invoice_items (
  id uuid primary key default uuid_generate_v4(),
  invoice_id uuid not null references public.invoices(id) on delete cascade,
  product_id uuid references public.invoice_products(id) on delete set null,
  
  -- Item details
  cantidad numeric(15, 4) not null,
  clave_prod_serv text not null,
  clave_unidad text not null,
  unidad text, -- Descripción de la unidad
  descripcion text not null,
  precio_unitario numeric(15, 2) not null,
  importe numeric(15, 2) not null,
  descuento numeric(15, 2) default 0,
  objeto_impuesto text not null default '02',
  
  -- Impuestos del concepto
  iva numeric(15, 2) default 0,
  ieps numeric(15, 2) default 0,
  retencion_iva numeric(15, 2) default 0,
  retencion_isr numeric(15, 2) default 0,
  
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.facturapi_config enable row level security;
alter table public.invoice_clients enable row level security;
alter table public.invoice_products enable row level security;
alter table public.invoices enable row level security;
alter table public.invoice_items enable row level security;

-- RLS Policies for facturapi_config
create policy "Users can view own facturapi config"
  on public.facturapi_config for select
  using (auth.uid() = user_id);

create policy "Users can insert own facturapi config"
  on public.facturapi_config for insert
  with check (auth.uid() = user_id);

create policy "Users can update own facturapi config"
  on public.facturapi_config for update
  using (auth.uid() = user_id);

-- RLS Policies for invoice_clients
create policy "Users can view own clients"
  on public.invoice_clients for select
  using (auth.uid() = user_id);

create policy "Users can insert own clients"
  on public.invoice_clients for insert
  with check (auth.uid() = user_id);

create policy "Users can update own clients"
  on public.invoice_clients for update
  using (auth.uid() = user_id);

create policy "Users can delete own clients"
  on public.invoice_clients for delete
  using (auth.uid() = user_id);

-- RLS Policies for invoice_products
create policy "Users can view own products"
  on public.invoice_products for select
  using (auth.uid() = user_id);

create policy "Users can insert own products"
  on public.invoice_products for insert
  with check (auth.uid() = user_id);

create policy "Users can update own products"
  on public.invoice_products for update
  using (auth.uid() = user_id);

create policy "Users can delete own products"
  on public.invoice_products for delete
  using (auth.uid() = user_id);

-- RLS Policies for invoices
create policy "Users can view own invoices"
  on public.invoices for select
  using (auth.uid() = user_id);

create policy "Users can insert own invoices"
  on public.invoices for insert
  with check (auth.uid() = user_id);

create policy "Users can update own invoices"
  on public.invoices for update
  using (auth.uid() = user_id);

create policy "Users can delete own invoices"
  on public.invoices for delete
  using (auth.uid() = user_id);

-- RLS Policies for invoice_items
create policy "Users can view own invoice items"
  on public.invoice_items for select
  using (exists (
    select 1 from public.invoices
    where invoices.id = invoice_items.invoice_id
    and invoices.user_id = auth.uid()
  ));

create policy "Users can insert own invoice items"
  on public.invoice_items for insert
  with check (exists (
    select 1 from public.invoices
    where invoices.id = invoice_items.invoice_id
    and invoices.user_id = auth.uid()
  ));

create policy "Users can update own invoice items"
  on public.invoice_items for update
  using (exists (
    select 1 from public.invoices
    where invoices.id = invoice_items.invoice_id
    and invoices.user_id = auth.uid()
  ));

create policy "Users can delete own invoice items"
  on public.invoice_items for delete
  using (exists (
    select 1 from public.invoices
    where invoices.id = invoice_items.invoice_id
    and invoices.user_id = auth.uid()
  ));

-- Create indexes for better performance
create index if not exists facturapi_config_user_id_idx on public.facturapi_config(user_id);
create index if not exists invoice_clients_user_id_idx on public.invoice_clients(user_id);
create index if not exists invoice_clients_rfc_idx on public.invoice_clients(rfc);
create index if not exists invoice_products_user_id_idx on public.invoice_products(user_id);
create index if not exists invoices_user_id_idx on public.invoices(user_id);
create index if not exists invoices_client_id_idx on public.invoices(client_id);
create index if not exists invoices_status_idx on public.invoices(status);
create index if not exists invoices_fecha_idx on public.invoices(fecha);
create index if not exists invoice_items_invoice_id_idx on public.invoice_items(invoice_id);

-- Create storage bucket for certificates
insert into storage.buckets (id, name, public)
values ('invoice-certificates', 'invoice-certificates', false)
on conflict (id) do nothing;

-- Storage policies for invoice-certificates bucket
create policy "Users can upload own certificates"
on storage.objects for insert
to authenticated
with check (
  bucket_id = 'invoice-certificates' and
  (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can view own certificates"
on storage.objects for select
to authenticated
using (
  bucket_id = 'invoice-certificates' and
  (storage.foldername(name))[1] = auth.uid()::text
);

create policy "Users can delete own certificates"
on storage.objects for delete
to authenticated
using (
  bucket_id = 'invoice-certificates' and
  (storage.foldername(name))[1] = auth.uid()::text
);
