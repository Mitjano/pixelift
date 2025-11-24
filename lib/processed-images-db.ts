import fs from 'fs/promises'
import path from 'path'

const DB_PATH = path.join(process.cwd(), 'data', 'processed-images.json')

export interface ProcessedImage {
  id: string
  userId: string
  originalPath: string
  processedPath: string | null
  originalFilename: string
  fileSize: number
  width: number
  height: number
  isProcessed: boolean
  processingError?: string
  createdAt: string
  processedAt?: string
}

interface Database {
  images: ProcessedImage[]
}

export class ProcessedImagesDB {
  /**
   * Read database from JSON file
   */
  private static async readDB(): Promise<Database> {
    try {
      const data = await fs.readFile(DB_PATH, 'utf-8')
      return JSON.parse(data)
    } catch (error) {
      // If file doesn't exist, return empty database
      return { images: [] }
    }
  }

  /**
   * Write database to JSON file
   */
  private static async writeDB(data: Database): Promise<void> {
    // Ensure data directory exists
    const dataDir = path.dirname(DB_PATH)
    try {
      await fs.access(dataDir)
    } catch {
      await fs.mkdir(dataDir, { recursive: true })
    }

    await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2))
  }

  /**
   * Create new processed image record
   */
  static async create(image: Omit<ProcessedImage, 'id' | 'createdAt'>): Promise<ProcessedImage> {
    const db = await this.readDB()
    const newImage: ProcessedImage = {
      ...image,
      id: `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString()
    }
    db.images.push(newImage)
    await this.writeDB(db)
    return newImage
  }

  /**
   * Update existing processed image record
   */
  static async update(id: string, updates: Partial<ProcessedImage>): Promise<void> {
    const db = await this.readDB()
    const index = db.images.findIndex(img => img.id === id)
    if (index !== -1) {
      db.images[index] = { ...db.images[index], ...updates }
      await this.writeDB(db)
    }
  }

  /**
   * Get all processed images for a user
   */
  static async getByUserId(userId: string): Promise<ProcessedImage[]> {
    const db = await this.readDB()
    return db.images
      .filter(img => img.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }

  /**
   * Get single processed image by ID
   */
  static async getById(id: string): Promise<ProcessedImage | null> {
    const db = await this.readDB()
    return db.images.find(img => img.id === id) || null
  }

  /**
   * Delete processed image record
   */
  static async delete(id: string): Promise<void> {
    const db = await this.readDB()
    db.images = db.images.filter(img => img.id !== id)
    await this.writeDB(db)
  }

  /**
   * Get total count of processed images for a user
   */
  static async getCountByUserId(userId: string): Promise<number> {
    const db = await this.readDB()
    return db.images.filter(img => img.userId === userId).length
  }
}
