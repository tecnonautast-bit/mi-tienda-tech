-- ============================================================
-- Esquema de base de datos para la tienda
-- Pegá este archivo completo en: Supabase -> SQL Editor -> New query -> Run
-- ============================================================

-- Perfil extendido de cada usuario (Supabase Auth ya crea la tabla "auth.users")
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  nombre text,
  telefono text,
  -- rol: 'cliente' (por defecto), 'tecnico' (ve precios mayoristas), 'admin'
  rol text not null default 'cliente',
  -- un técnico recién registrado queda "pendiente" hasta que el admin lo aprueba
  tecnico_aprobado boolean not null default false,
  created_at timestamp with time zone default now()
);

-- Categorías (ej: Módulos, Baterías, Herramientas)
create table if not exists public.categorias (
  id serial primary key,
  nombre text not null,
  slug text not null unique,
  solo_tecnicos boolean not null default false, -- si es true, solo la ven los técnicos aprobados
  orden int default 0
);

-- Productos
create table if not exists public.productos (
  id serial primary key,
  categoria_id int references public.categorias(id),
  nombre text not null,
  slug text not null unique,
  descripcion text,
  imagen_url text,
  precio_minorista numeric(10,2) not null default 0,
  precio_mayorista numeric(10,2), -- solo se muestra a técnicos aprobados
  stock int not null default 0,
  destacado boolean default false,
  oferta boolean default false,
  nuevo boolean default false,
  created_at timestamp with time zone default now()
);

-- Pedidos
create table if not exists public.pedidos (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id),
  total numeric(10,2) not null,
  metodo_pago text not null, -- 'mercadopago' | 'transferencia' | 'efectivo'
  estado text not null default 'pendiente', -- 'pendiente' | 'pagado' | 'entregado' | 'cancelado'
  mp_preference_id text,
  mp_payment_id text,
  created_at timestamp with time zone default now()
);

-- Items de cada pedido
create table if not exists public.pedido_items (
  id serial primary key,
  pedido_id uuid references public.pedidos(id) on delete cascade,
  producto_id int references public.productos(id),
  cantidad int not null,
  precio_unitario numeric(10,2) not null
);

-- ============================================================
-- Seguridad: Row Level Security (RLS)
-- ============================================================
alter table public.profiles enable row level security;
alter table public.pedidos enable row level security;
alter table public.pedido_items enable row level security;
alter table public.productos enable row level security;
alter table public.categorias enable row level security;

-- Cualquiera puede LEER productos y categorías (es una tienda pública)
create policy "productos_lectura_publica" on public.productos for select using (true);
create policy "categorias_lectura_publica" on public.categorias for select using (true);

-- Cada usuario ve y edita solo su propio perfil
create policy "perfil_propio_select" on public.profiles for select using (auth.uid() = id);
create policy "perfil_propio_update" on public.profiles for update using (auth.uid() = id);
create policy "perfil_propio_insert" on public.profiles for insert with check (auth.uid() = id);

-- Cada usuario ve solo sus propios pedidos
create policy "pedidos_propios_select" on public.pedidos for select using (auth.uid() = user_id);
create policy "pedidos_propios_insert" on public.pedidos for insert with check (auth.uid() = user_id);

create policy "items_propios_select" on public.pedido_items for select using (
  exists (select 1 from public.pedidos p where p.id = pedido_id and p.user_id = auth.uid())
);

-- ============================================================
-- Trigger: al registrarse un usuario, se crea su perfil automáticamente
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nombre, rol)
  values (new.id, new.raw_user_meta_data->>'nombre', 'cliente');
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================
-- Datos de ejemplo (podés borrar esto después)
-- ============================================================
insert into public.categorias (nombre, slug, solo_tecnicos, orden) values
  ('Baterías', 'baterias', false, 1),
  ('Herramientas', 'herramientas', false, 2),
  ('Módulos', 'modulos', true, 3)
on conflict (slug) do nothing;

insert into public.productos (categoria_id, nombre, slug, descripcion, precio_minorista, precio_mayorista, stock, destacado, nuevo)
values
  (1, 'Batería iPhone 12', 'bateria-iphone-12', 'Batería de reemplazo compatible con iPhone 12', 15000, 9000, 25, true, false),
  (2, 'Kit de herramientas apertura', 'kit-herramientas', 'Set completo de herramientas para reparación de celulares', 8000, 5500, 40, false, true),
  (3, 'Módulo iPhone 13 Pro (calidad OLED)', 'modulo-iphone-13-pro', 'Módulo de pantalla completo, calidad OLED', 55000, 38000, 10, true, true)
on conflict (slug) do nothing;
