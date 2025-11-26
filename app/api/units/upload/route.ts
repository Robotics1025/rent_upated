import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { prisma } from '@/lib/prisma'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const unitId = formData.get('unitId') as string
    const files = formData.getAll('images') as File[]

    if (!unitId) {
      return NextResponse.json({ error: 'Unit ID is required' }, { status: 400 })
    }

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 })
    }

    // Verify unit exists
    const unit = await prisma.unit.findUnique({
      where: { id: unitId }
    })

    if (!unit) {
      return NextResponse.json({ error: 'Unit not found' }, { status: 404 })
    }

    const uploadedFiles = []

    // Create upload directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'units')
    try {
      await mkdir(uploadDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }

    // Process each file
    for (const file of files) {
      if (file.size === 0) continue

      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)

      // Generate unique filename
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1E9)}`
      const filename = `${unitId}-${uniqueSuffix}-${file.name.replace(/\s/g, '-')}`
      const filepath = join(uploadDir, filename)

      // Save file
      await writeFile(filepath, buffer)

      // Create database record
      const fileRecord = await prisma.file.create({
        data: {
          unitId: unitId,
          fileName: file.name,
          fileUrl: `/uploads/units/${filename}`,
          fileType: 'IMAGE',
          category: 'UNIT_IMAGE',
          mimeType: file.type,
          fileSize: file.size,
        }
      })

      uploadedFiles.push(fileRecord)
    }

    return NextResponse.json({
      message: 'Images uploaded successfully',
      files: uploadedFiles
    }, { status: 200 })

  } catch (error) {
    console.error('Error uploading images:', error)
    return NextResponse.json(
      { error: 'Failed to upload images' },
      { status: 500 }
    )
  }
}
