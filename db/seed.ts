import { db } from '.'
import { users, clients, vehicles, orders, orderParts, orderServices } from './schema'
import { hashPassword } from '@/lib/auth'

const statuses = ['pending', 'in_progress', 'completed', 'on_hold']

async function seed() {
  console.log('🌱 Starting database seed...')

  console.log('  → Creating admin and mechanic users...')
  const adminPassword = await hashPassword('admin123')
  const mechanicPassword = await hashPassword('mechanic123')

  const adminUser = await db
    .insert(users)
    .values({
      name: 'Admin User',
      email: 'admin@autoops.test',
      passwordHash: adminPassword,
      role: 'admin',
      status: 'active',
    })
    .returning()

  const mechanicUsers = await db
    .insert(users)
    .values(
      Array.from({ length: 9 }, (_, i) => ({
        name: `Mechanic ${i + 1}`,
        email: `mechanic${i + 1}@autoops.test`,
        passwordHash: mechanicPassword,
        role: 'mechanic',
        status: 'active',
      }))
    )
    .returning()

  const allMechanics = [adminUser[0], ...mechanicUsers]

  console.log('  → Creating 500 clients...')
  const clientData = Array.from({ length: 500 }, (_, i) => ({
    name: `Client ${i + 1}`,
    phone: `+1${Math.random().toString().slice(2, 12)}`,
    email: `client${i + 1}@autoops.test`,
    notes: `Client ${i + 1}`,
  }))

  const batchSize = 100
  const createdClients: (typeof clients.$inferSelect)[] = []
  for (let i = 0; i < clientData.length; i += batchSize) {
    const batch = clientData.slice(i, i + batchSize)
    const inserted = await db.insert(clients).values(batch).returning()
    createdClients.push(...inserted)
  }

  console.log('  → Creating 800 vehicles...')
  const makes = ['Toyota', 'Honda', 'Ford', 'Chevrolet', 'BMW', 'Mercedes', 'Audi', 'Volkswagen']
  const models = ['Sedan', 'SUV', 'Truck', 'Van', 'Coupe', 'Hatchback']

  const vehicleData = Array.from({ length: 800 }, (_, i) => ({
    clientId: createdClients[i % createdClients.length].id,
    make: makes[i % makes.length],
    model: models[i % models.length],
    year: 2015 + (i % 10),
    licensePlate: `PL${String(i).padStart(5, '0')}`,
    vin: `VIN${String(i).padStart(14, '0')}`,
    notes: `Vehicle ${i + 1}`,
  }))

  const createdVehicles: (typeof vehicles.$inferSelect)[] = []
  for (let i = 0; i < vehicleData.length; i += batchSize) {
    const batch = vehicleData.slice(i, i + batchSize)
    const inserted = await db.insert(vehicles).values(batch).returning()
    createdVehicles.push(...inserted)
  }

  console.log('  → Creating 10,000+ orders with parts and services...')
  const orderData = Array.from({ length: 10000 }, (_, i) => {
    const vehicle = createdVehicles[i % createdVehicles.length]
    const deadline = new Date()
    deadline.setDate(deadline.getDate() + (Math.random() * 60 - 30))

    return {
      vehicleId: vehicle.id,
      clientId: vehicle.clientId,
      mechanicId: allMechanics[i % allMechanics.length].id,
      status: statuses[i % statuses.length],
      deadline,
      notes: `Order ${i + 1}`,
    }
  })

  const createdOrders: (typeof orders.$inferSelect)[] = []
  for (let i = 0; i < orderData.length; i += batchSize) {
    const batch = orderData.slice(i, i + batchSize)
    const inserted = await db.insert(orders).values(batch).returning()
    createdOrders.push(...inserted)
  }

  console.log('  → Creating order parts...')
  const partNames = [
    'Oil Filter',
    'Air Filter',
    'Brake Pads',
    'Battery',
    'Spark Plug',
    'Tire',
    'Wiper Blade',
    'Coolant',
  ]
  const partsData: Array<typeof orderParts.$inferInsert> = []

  createdOrders.forEach((order, i) => {
    const partCount = 3 + Math.floor(Math.random() * 6)
    for (let j = 0; j < partCount; j++) {
      partsData.push({
        orderId: order.id,
        partName: partNames[Math.floor(Math.random() * partNames.length)],
        quantity: 1 + Math.floor(Math.random() * 3),
        unitPrice: String((10 + Math.random() * 200).toFixed(2)),
      })
    }
  })

  for (let i = 0; i < partsData.length; i += batchSize) {
    const batch = partsData.slice(i, i + batchSize)
    await db.insert(orderParts).values(batch)
  }

  console.log('  → Creating order services...')
  const serviceDescriptions = [
    'Oil Change',
    'Tire Rotation',
    'Brake Inspection',
    'Battery Replacement',
    'Engine Diagnostic',
    'Suspension Check',
    'Cooling System Flush',
    'Transmission Service',
  ]
  const servicesData: Array<typeof orderServices.$inferInsert> = []

  createdOrders.forEach((order, i) => {
    const serviceCount = 2 + Math.floor(Math.random() * 4)
    for (let j = 0; j < serviceCount; j++) {
      const costType = Math.random() > 0.5 ? 'hourly' : 'fixed'
      servicesData.push({
        orderId: order.id,
        description: serviceDescriptions[Math.floor(Math.random() * serviceDescriptions.length)],
        costType,
        hours: costType === 'hourly' ? String((0.5 + Math.random() * 4).toFixed(1)) : null,
        hourlyRate: costType === 'hourly' ? String((50 + Math.random() * 100).toFixed(2)) : null,
        fixedCost: costType === 'fixed' ? String((30 + Math.random() * 300).toFixed(2)) : null,
      })
    }
  })

  for (let i = 0; i < servicesData.length; i += batchSize) {
    const batch = servicesData.slice(i, i + batchSize)
    await db.insert(orderServices).values(batch)
  }

  console.log('✅ Seed completed successfully!')
  console.log(`  ✓ 10 users (1 admin, 9 mechanics)`)
  console.log(`  ✓ 500 clients`)
  console.log(`  ✓ 800 vehicles`)
  console.log(`  ✓ 10,000 orders`)
  console.log(`  ✓ ~${partsData.length} parts`)
  console.log(`  ✓ ~${servicesData.length} services`)
}

seed().catch((error) => {
  console.error('❌ Seed failed:', error)
  process.exit(1)
})
