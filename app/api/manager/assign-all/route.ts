import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all properties
    const properties = await prisma.property.findMany({
      select: { id: true, name: true },
    })

    // Create assignments for all properties
    const assignments = []
    for (const property of properties) {
      // Check if assignment already exists
      const existing = await prisma.adminAssignment.findUnique({
        where: {
          adminId_propertyId: {
            adminId: session.user.id,
            propertyId: property.id,
          },
        },
      })

      if (!existing) {
        const assignment = await prisma.adminAssignment.create({
          data: {
            adminId: session.user.id,
            propertyId: property.id,
            role: 'Property Manager',
            assignedBy: session.user.id,
          },
        })
        assignments.push(assignment)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Assigned to ${assignments.length} new properties`,
      assignments,
      totalProperties: properties.length,
    })
  } catch (error) {
    console.error('Error assigning properties:', error)
    return NextResponse.json(
      { error: 'Failed to assign properties', details: String(error) },
      { status: 500 }
    )
  }
}
