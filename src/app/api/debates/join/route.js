import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// POST /api/debates/join - Unirse a un debate por código
export async function POST(request) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { inviteCode } = await request.json();

    if (!inviteCode) {
        return NextResponse.json(
            { error: "El código de invitación es requerido" },
            { status: 400 }
        );
    }

    const debate = await prisma.debate.findUnique({
        where: { inviteCode: inviteCode.trim().toUpperCase() },
    });

    if (!debate) {
        return NextResponse.json(
            { error: "No se encontró un debate con ese código" },
            { status: 404 }
        );
    }

    if (debate.creatorId === session.user.id) {
        return NextResponse.json(
            { error: "No puedes unirte a tu propio debate" },
            { status: 400 }
        );
    }

    if (debate.opponentId && debate.opponentId !== session.user.id) {
        return NextResponse.json(
            { error: "Este debate ya tiene dos participantes" },
            { status: 400 }
        );
    }

    if (debate.opponentId === session.user.id) {
        // Ya está unido
        return NextResponse.json({ debate });
    }

    const updated = await prisma.debate.update({
        where: { id: debate.id },
        data: { opponentId: session.user.id },
    });

    return NextResponse.json({ debate: updated });
}
