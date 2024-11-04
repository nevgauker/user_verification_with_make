// app/api/users/[id]/status/route.ts
import { generateTokenExpiry } from '@/utils/authHelpers';
import { db } from '@/db/db';
import { errorResponse, successResponse } from '@/app/api/responses/responses';

async function updateUserStatus(userId: string, status: string, tokenExpiresAt: string): Promise<number> {
    return new Promise((resolve, reject) => {
        db.run(
            `UPDATE users SET status = ?, token_expires_at = ? WHERE id = ?`,
            [status, tokenExpiresAt, userId],
            function (err) {
                if (err) reject(err);
                else resolve(this.changes); // Number of rows affected
            }
        );
    });
}

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
    const userId = params.id;
    const newTokenExpiresAt = generateTokenExpiry(168);

    try {
        const result = await updateUserStatus(userId, 'VERIFIED', newTokenExpiresAt);

        if (result === 0) {
            return errorResponse('User not found', 404);
        }

        return successResponse({ message: 'User status updated to VERIFIED' });
    } catch (error) {
        console.error('Error updating user status:', error);
        return errorResponse('Failed to update user status', 500);
    }
}
