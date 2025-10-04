import { NextRequest, NextResponse } from "next/server"

export const GET = (
  request: NextRequest,
  { params }: { params: { userId: string } }
) => {
  const { userId } = params

  return NextResponse.json({
    message: `User ID is ${userId}`,
  })
}