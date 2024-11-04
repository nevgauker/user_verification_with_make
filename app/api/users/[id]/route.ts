// app/api/users/[id]/route.ts
import { db } from '@/db/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request, { params }: { params: { id: string } }) {
    const userId = params.id;

    return new Promise((resolve) => {
        db.get(`SELECT * FROM users WHERE id = ?`, [userId], (err, row) => {
            if (err) {
                resolve(NextResponse.json({ message: 'Error fetching user', error: err }, { status: 500 }));
            } else if (!row) {
                resolve(NextResponse.json({ message: 'User not found' }, { status: 404 }));
            } else {
                resolve(NextResponse.json(row, { status: 200 }));
            }
        });
    });
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
    const userId = params.id;

    return new Promise((resolve) => {
        db.run(`DELETE FROM users WHERE id = ?`, [userId], function (err) {
            if (err) {
                resolve(NextResponse.json({ message: 'Error deleting user', error: err }, { status: 500 }));
            } else if (this.changes === 0) {
                resolve(NextResponse.json({ message: 'User not found' }, { status: 404 }));
            } else {
                resolve(NextResponse.json({ message: 'User deleted successfully' }, { status: 200 }));
            }
        });
    });
}
