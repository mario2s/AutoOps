import {
  pgTable,
  text,
  integer,
  decimal,
  timestamp,
  varchar,
  serial,
  index,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

export const users = pgTable(
  'users',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    email: varchar('email', { length: 255 }).notNull().unique(),
    passwordHash: varchar('password_hash', { length: 255 }).notNull(),
    role: varchar('role', { length: 50 }).notNull().default('mechanic'),
    status: varchar('status', { length: 50 }).notNull().default('pending'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    idxUsersEmail: index('idx_users_email').on(table.email),
  })
)

export const clients = pgTable(
  'clients',
  {
    id: serial('id').primaryKey(),
    name: varchar('name', { length: 255 }).notNull(),
    phone: varchar('phone', { length: 20 }),
    email: varchar('email', { length: 255 }),
    notes: text('notes'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
  },
  (table) => ({
    idxClientsName: index('idx_clients_name').on(table.name),
  })
)

export const vehicles = pgTable(
  'vehicles',
  {
    id: serial('id').primaryKey(),
    clientId: integer('client_id')
      .notNull()
      .references(() => clients.id, { onDelete: 'cascade' }),
    make: varchar('make', { length: 100 }).notNull(),
    model: varchar('model', { length: 100 }).notNull(),
    year: integer('year'),
    licensePlate: varchar('license_plate', { length: 20 }),
    vin: varchar('vin', { length: 17 }),
    notes: text('notes'),
  },
  (table) => ({
    idxVehiclesClientId: index('idx_vehicles_client_id').on(table.clientId),
  })
)

export const orders = pgTable(
  'orders',
  {
    id: serial('id').primaryKey(),
    vehicleId: integer('vehicle_id')
      .notNull()
      .references(() => vehicles.id, { onDelete: 'cascade' }),
    clientId: integer('client_id')
      .notNull()
      .references(() => clients.id, { onDelete: 'cascade' }),
    mechanicId: integer('mechanic_id')
      .notNull()
      .references(() => users.id, { onDelete: 'restrict' }),
    status: varchar('status', { length: 50 }).notNull().default('pending'),
    deadline: timestamp('deadline'),
    notes: text('notes'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
  },
  (table) => ({
    idxOrdersStatus: index('idx_orders_status').on(table.status),
    idxOrdersDeadline: index('idx_orders_deadline').on(table.deadline),
    idxOrdersMechanicId: index('idx_orders_mechanic_id').on(table.mechanicId),
    idxOrdersClientId: index('idx_orders_client_id').on(table.clientId),
  })
)

export const orderParts = pgTable(
  'order_parts',
  {
    id: serial('id').primaryKey(),
    orderId: integer('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    partName: varchar('part_name', { length: 255 }).notNull(),
    quantity: integer('quantity').notNull().default(1),
    unitPrice: decimal('unit_price', { precision: 10, scale: 2 }).notNull(),
  },
  (table) => ({
    idxOrderPartsOrderId: index('idx_order_parts_order_id').on(table.orderId),
  })
)

export const orderServices = pgTable(
  'order_services',
  {
    id: serial('id').primaryKey(),
    orderId: integer('order_id')
      .notNull()
      .references(() => orders.id, { onDelete: 'cascade' }),
    description: varchar('description', { length: 255 }).notNull(),
    costType: varchar('cost_type', { length: 50 }).notNull(),
    hours: decimal('hours', { precision: 8, scale: 2 }),
    hourlyRate: decimal('hourly_rate', { precision: 10, scale: 2 }),
    fixedCost: decimal('fixed_cost', { precision: 10, scale: 2 }),
  },
  (table) => ({
    idxOrderServicesOrderId: index('idx_order_services_order_id').on(table.orderId),
  })
)

export const usersRelations = relations(users, ({ many }) => ({
  orders: many(orders),
}))

export const clientsRelations = relations(clients, ({ many }) => ({
  vehicles: many(vehicles),
  orders: many(orders),
}))

export const vehiclesRelations = relations(vehicles, ({ one, many }) => ({
  client: one(clients, { fields: [vehicles.clientId], references: [clients.id] }),
  orders: many(orders),
}))

export const ordersRelations = relations(orders, ({ one, many }) => ({
  vehicle: one(vehicles, { fields: [orders.vehicleId], references: [vehicles.id] }),
  client: one(clients, { fields: [orders.clientId], references: [clients.id] }),
  mechanic: one(users, { fields: [orders.mechanicId], references: [users.id] }),
  parts: many(orderParts),
  services: many(orderServices),
}))

export const orderPartsRelations = relations(orderParts, ({ one }) => ({
  order: one(orders, { fields: [orderParts.orderId], references: [orders.id] }),
}))

export const orderServicesRelations = relations(orderServices, ({ one }) => ({
  order: one(orders, { fields: [orderServices.orderId], references: [orders.id] }),
}))
