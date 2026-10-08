export const PERMISSIONS = [
  'products.read',
  'products.write',
  'products.publish',
  'categories.write',
  'orders.read',
  'orders.write',
  'payments.read',
  'payments.refund',
  'inventory.read',
  'inventory.write',
  'customers.read',
  'coupons.write',
  'reviews.moderate',
  'content.write',
  'homepage.write',
  'locations.write',
  'enquiries.manage',
  'newsletter.read',
  'media.write',
  'seo.write',
  'settings.write',
  'admins.manage',
  'notifications.read',
  'audit.read',
  'analytics.read',
] as const;

export type Permission = (typeof PERMISSIONS)[number];

export const ROLES = [
  'super_admin',
  'content_manager',
  'order_manager',
  'inventory_manager',
  'support_manager',
  'seo_manager',
] as const;

export type RoleId = (typeof ROLES)[number];

const content: Permission[] = [
  'products.read',
  'products.write',
  'products.publish',
  'categories.write',
  'content.write',
  'homepage.write',
  'locations.write',
  'media.write',
  'notifications.read',
];

const orders: Permission[] = [
  'orders.read',
  'orders.write',
  'payments.read',
  'customers.read',
  'coupons.write',
  'notifications.read',
  'analytics.read',
];

const inventory: Permission[] = ['products.read', 'inventory.read', 'inventory.write', 'notifications.read'];

const support: Permission[] = [
  'customers.read',
  'orders.read',
  'reviews.moderate',
  'enquiries.manage',
  'newsletter.read',
  'notifications.read',
];

const seo: Permission[] = ['products.read', 'seo.write', 'analytics.read', 'notifications.read'];

export const ROLE_PERMISSIONS: Record<RoleId, readonly Permission[]> = {
  super_admin: PERMISSIONS,
  content_manager: content,
  order_manager: orders,
  inventory_manager: inventory,
  support_manager: support,
  seo_manager: seo,
};

export function hasPermission(roleId: string, permissions: readonly string[], permission: Permission) {
  if (roleId === 'super_admin') return true;
  return permissions.includes(permission);
}
