import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { mkdir } from 'fs/promises'

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData()
    const propertyId = formData.get('propertyId') as string
    const unitId = formData.get('unitId') as string | null
    const images = formData.getAll('images') as File[]

    if (!propertyId && !unitId) {
      return NextResponse.json(
        { error: 'Property ID or Unit ID is required' },
        { status: 400 }
      )
    }

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'properties')
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    const uploadedFiles = []

    for (const image of images) {
      const bytes = await image.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Create unique filename
      const filename = `${Date.now()}-${image.name.replace(/\s/g, '-')}`
      const filepath = join(uploadDir, filename)

      // Save file
      await writeFile(filepath, buffer)

      // Save to database
      const file = await prisma.file.create({
        data: {
          propertyId: propertyId || undefined,
          unitId: unitId || undefined,
          fileName: image.name,
          fileUrl: `/uploads/properties/${filename}`,
          fileType: 'IMAGE',
          category: unitId ? 'UNIT_IMAGE' : 'PROPERTY_IMAGE',
          mimeType: image.type,
          fileSize: image.size,
        },
      })

      uploadedFiles.push(file)
    }

    return NextResponse.json({
      success: true,
      files: uploadedFiles,
    })
  } catch (error) {
    console.error('Error uploading images:', error)
    return NextResponse.json(
      { error: 'Failed to upload images' },
      { status: 500 }
    )
  }
}
