-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends auth.users)
create table profiles (
    id uuid references auth.users on delete cascade primary key,
    name text not null,
    email text not null,
    phone text not null,
    role text not null check (role in ('admin', 'staff', 'customer')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Orders table
create table orders (
    id uuid default uuid_generate_v4() primary key,
    customer_id uuid references profiles(id) on delete cascade not null,
    assigned_to uuid references profiles(id) on delete set null,
    service_type text not null check (service_type in ('wash_fold', 'wash_iron', 'dry_clean', 'iron_only')),
    weight numeric(5,2) not null check (weight > 0),
    pickup_time timestamp with time zone not null,
    instructions text,
    status text not null default 'pending' check (status in ('pending', 'processing', 'completed', 'cancelled')),
    created_at timestamp with time zone default timezone('utc'::text, now()) not null,
    updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Row Level Security Policies

-- Enable RLS
alter table profiles enable row level security;
alter table orders enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone"
    on profiles for select
    using (true);

create policy "Users can insert their own profile"
    on profiles for insert
    with check (auth.uid() = id);

create policy "Users can update own profile"
    on profiles for update
    using (auth.uid() = id);

-- Orders policies - Customers can view their own orders
create policy "Customers can view own orders"
    on orders for select
    using (
        auth.uid() = customer_id
        or exists (
            select 1 from profiles
            where profiles.id = auth.uid()
            and profiles.role in ('admin', 'staff')
        )
    );

-- Customers can insert their own orders
create policy "Customers can create orders"
    on orders for insert
    with check (auth.uid() = customer_id);

-- Staff can view assigned orders
create policy "Staff can view assigned orders"
    on orders for select
    using (
        exists (
            select 1 from profiles
            where profiles.id = auth.uid()
            and profiles.role = 'staff'
            and orders.assigned_to = auth.uid()
        )
    );

-- Staff can update their assigned orders
create policy "Staff can update assigned orders"
    on orders for update
    using (
        exists (
            select 1 from profiles
            where profiles.id = auth.uid()
            and profiles.role = 'staff'
            and orders.assigned_to = auth.uid()
        )
    );

-- Admin can do everything
create policy "Admin full access to orders"
    on orders for all
    using (
        exists (
            select 1 from profiles
            where profiles.id = auth.uid()
            and profiles.role = 'admin'
        )
    );

-- Indexes for performance
create index orders_customer_id_idx on orders(customer_id);
create index orders_assigned_to_idx on orders(assigned_to);
create index orders_status_idx on orders(status);
create index orders_created_at_idx on orders(created_at desc);
create index profiles_role_idx on profiles(role);

-- Function to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
    new.updated_at = timezone('utc'::text, now());
    return new;
end;
$$ language plpgsql;

-- Triggers for updated_at
create trigger update_profiles_updated_at before update on profiles
    for each row execute procedure update_updated_at_column();

create trigger update_orders_updated_at before update on orders
    for each row execute procedure update_updated_at_column();

-- Insert initial admin user (run after first user signs up)
-- Update the UUID below with your first user's ID from auth.users
-- insert into profiles (id, name, email, phone, role)
-- values (
--     'YOUR-USER-UUID-HERE',
--     'Admin User',
--     'admin@example.com',
--     '+1234567890',
--     'admin'
-- );
