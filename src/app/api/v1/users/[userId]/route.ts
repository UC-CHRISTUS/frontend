import { NextRequest, NextResponse } from "next/server"

export const GET = async (
  request: NextRequest,
  { params }: { params: Promise<{ userId: string }> }
) => {
  const { userId } = await params

  return NextResponse.json({
    message: `User ID is ${userId}`,
  })
}