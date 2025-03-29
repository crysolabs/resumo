import { Clodynix } from "clodynix"

// Initialize Clodynix client with proper configuration
export const clodynixClient = new Clodynix({
  apiKey: process.env.ClodynixToken || "",
  secret: process.env.ClodynixSecret || "",
  origin: process.env.CDN_ORIGIN_LINK || "",
})

// Type definitions for Clodynix responses
export type cdnToken = {
  token: string
  name: string
  extention: string
  size: number
  totalChunks: number
  id: string
  createdAt: Date
  uses: Date[]
  finished: boolean
}

export type cdnFileType = {
  uploadToken: cdnToken
  id: string
  registerdAt: Date | null
  uploadedAt: number | undefined
  createdAt: number
  name: string | null
  extension: string | null
  updatedAt: number
  size: number | null
}

// Export helper functions that use the Clodynix client
export const checkFileInfo = async (fileId?: string, token?: string): Promise<cdnFileType | null> => {
  try {
    const res = await clodynixClient.checkFileInfo(fileId, token)
    if (!res) {
      throw new Error("Check file info error!")
    }
    return res
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const registerFile = async (token: string): Promise<cdnFileType | null> => {
  try {
    const res = await clodynixClient.registerFile(token)
    if (!res) {
      throw new Error("Register file error!")
    }
    return res
  } catch (error: any) {
    console.log(error)
    throw new Error(error.message)
  }
}

export const uploadByLink = async (link: string): Promise<cdnFileType | null> => {
  try {
    const res = await clodynixClient.uploadByLink(link)
    if (!res) {
      throw new Error("Upload by link error!")
    }
    return res
  } catch (error: any) {
    console.log(error)
    throw new Error(error.message)
  }
}

export const createUploadToken = async (
  totalChunks: number,
  fileData: { name: string; size: number; extension: string },
): Promise<cdnToken> => {
  try {
    const res = await clodynixClient.createUploadToken(totalChunks, fileData)
    if (!res) {
      throw new Error("Create upload token error!")
    }
    return res
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const deleteFile = async (fileId: string): Promise<string> => {
  try {
    const res = await clodynixClient.deleteFile(fileId)
    if (!res) {
      throw new Error("Delete file error!")
    }
    return res
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const generateLink = async (fileId: string): Promise<string> => {
  try {
    const res = await clodynixClient.generateLink(fileId)
    if (!res) {
      throw new Error("Generate link error!")
    }
    return res
  } catch (error: any) {
    throw new Error(error.message)
  }
}

export const generateLinksBatch = async (fileIds: string[]): Promise<{ id: string; link: string }[]> => {
  try {
    const res = await clodynixClient.generateLinksBatch(fileIds)
    if (!res) {
      throw new Error("Generate links batch error!")
    }
    return res
  } catch (error: any) {
    console.log(error)
    throw new Error(error.message)
  }
}

export const uploadDirect = async (formdata: FormData): Promise<cdnFileType | null> => {
  try {
    const res = await clodynixClient.uploadDirect(formdata)
    if (!res) {
      throw new Error("Upload direct error!")
    }
    return res
  } catch (error: any) {
    console.error("Upload error:", error)
    throw new Error(error.message)
  }
}

