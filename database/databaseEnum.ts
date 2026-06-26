const schema = {
    platform: 'plataform'
} as const;

const tables = {
    users: `${schema.platform}.users`,
    tenants: `${schema.platform}.tenants`,
    tenant_settings: `${schema.platform}.tenant_settings`,
    tenant_users: `${schema.platform}.tenant_users`,
    products: `${schema.platform}.products`,
} as const;

export { tables };

interface tenants {
    id: string,
    owner_id: string,
    name: string,
    slug: string,
    created_at: Date,
    updated_at: Date
};

interface tenant_users {
    id: number,
    tenant_id: string,
    user_id: string,
    role: string,
    status: string,
    created_at: Date
}

export { tenants, tenant_users };