import { db } from '@/db/db';
import { User } from '@/model/user';
import { errorResponse, successResponse } from '@/app/api/responses/responses';

async function getUserById(userId: string): Promise<User | null> {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM users WHERE id = ?`, [userId], (err, row) => {
            if (err) {
                reject(err);
            } else {
                resolve(row ? (row as User) : null);
            }
        });
    });
}

async function deleteUserById(userId: string): Promise<number> {
    return new Promise((resolve, reject) => {
        db.run(`DELETE FROM users WHERE id = ?`, [userId], function (err) {
            if (err) reject(err);
            else resolve(this.changes);
        });
    });
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const userId = params.id;

    try {
        const user = await getUserById(userId);
        if (!user) {
            return errorResponse('User not found', 404);
        }
        return successResponse(user);
    } catch (error) {
        return errorResponse('Error fetching user', 500, error);
    }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const userId = params.id;

    try {
        const changes = await deleteUserById(userId);
        if (changes === 0) {
            return errorResponse('User not found', 404);
        }
        return successResponse({ message: 'User deleted successfully' });
    } catch (error) {
        return errorResponse('Error deleting user', 500, error);
    }
}
