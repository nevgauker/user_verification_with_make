// app/api/users/[id]/status/route.ts
import { NextResponse } from 'next/server';

import { generateTokenExpiry } from '@/utils/authHelpers';
import { db } from '@/db/db'

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    const userId = params.id;
    const newTokenExpiresAt = generateTokenExpiry(168)

    try {
        const result = await new Promise((resolve, reject) => {
            db.run(
                `UPDATE users SET status = ?, token_expires_at = ? WHERE id = ?`,
                ['VERIFIED', newTokenExpiresAt, userId],
                function (err) {
                    if (err) reject(err);
                    else resolve(this.changes); // Number of rows affected
                }
            );
        });

        if (result === 0) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        return NextResponse.json({ message: 'User status updated to VERIFIED' });
    } catch (error) {
        console.error('Error updating user status:', error);
        return NextResponse.json({ error: 'Failed to update user status' }, { status: 500 });
    }
}
