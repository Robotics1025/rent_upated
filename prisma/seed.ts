import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create sample properties
  const property1 = await prisma.property.create({
    data: {
      name: 'Modern Downtown Apartments',
      description: 'Luxurious apartments in the heart of Kampala with modern amenities',
      propertyType: 'APARTMENT_BUILDING',
      tenancyType: 'MONTHLY_RENT',
      ownerName: 'Kampala Properties Ltd',
      ownerType: 'COMPANY',
      ownerContact: '+256701234567',
      ownerEmail: 'info@kampalaproperties.com',
      addressLine1: 'Plot 45, Kampala Road',
      city: 'Kampala',
      region: 'Central',
      country: 'Uganda',
      isActive: true,
      isFeatured: true,
    },
  })

  const property2 = await prisma.property.create({
    data: {
      name: 'Garden View Villas',
      description: 'Beautiful villas with garden views and modern facilities',
      propertyType: 'HOUSE',
      tenancyType: 'LONG_TERM_LEASE',
      ownerName: 'Sarah Nakato',
      ownerType: 'INDIVIDUAL',
      ownerContact: '+256702345678',
      ownerEmail: 'sarah.nakato@email.com',
      addressLine1: 'Plot 123, Entebbe Road',
      city: 'Entebbe',
      region: 'Central',
      country: 'Uganda',
      isActive: true,
      isFeatured: false,
    },
  })

  // Create sample units for property 1
  await prisma.unit.create({
    data: {
      propertyId: property1.id,
      unitCode: 'A101',
      name: 'Executive Studio',
      description: 'Modern studio apartment with city views',
      price: 2500000, // UGX
      bedrooms: 0,
      bathrooms: 1,
      squareMeters: 45,
      floor: 1,
      isFurnished: true,
      hasWifi: true,
      hasAC: true,
      hasParking: false,
      status: 'AVAILABLE',
    },
  })

  await prisma.unit.create({
    data: {
      propertyId: property1.id,
      unitCode: 'A102',
      name: 'One Bedroom Deluxe',
      description: 'Spacious one bedroom with modern kitchen',
      price: 3500000, // UGX
      bedrooms: 1,
      bathrooms: 1,
      squareMeters: 65,
      floor: 1,
      isFurnished: true,
      hasWifi: true,
      hasAC: true,
      hasParking: true,
      status: 'AVAILABLE',
    },
  })

  // Create sample units for property 2
  await prisma.unit.create({
    data: {
      propertyId: property2.id,
      unitCode: 'V001',
      name: 'Garden Villa Suite',
      description: 'Beautiful villa with private garden',
      price: 5000000, // UGX
      bedrooms: 3,
      bathrooms: 2,
      squareMeters: 150,
      floor: 1,
      isFurnished: false,
      hasWifi: true,
      hasAC: false,
      hasParking: true,
      status: 'AVAILABLE',
    },
  })

  console.log('✅ Database seeded successfully!')
  console.log(`Created ${await prisma.property.count()} properties`)
  console.log(`Created ${await prisma.unit.count()} units`)
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })