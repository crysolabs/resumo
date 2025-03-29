import { NextResponse } from "next/server"
import { getAvailableProviders } from "@/lib/ai-providers"

export async function GET() {
    try {
        const providers = getAvailableProviders()
        return NextResponse.json(providers)
    } catch (error) {
        console.error("Error fetching AI providers:", error)
        return NextResponse.json({ error: "Failed to fetch AI providers" }, { status: 500 })
    }
}

