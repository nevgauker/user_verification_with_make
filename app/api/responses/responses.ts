import { NextResponse } from "next/server";

export function errorResponse(message: string, status: number, error?: unknown) {
    return NextResponse.json({ message, error }, { status });
}

export function successResponse(data: unknown, status = 200) {
    return NextResponse.json(data, { status });
}