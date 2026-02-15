import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// GET /api/debates/[id]/definitions - Obtener definiciones
export async function GET(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;

    const definitions = await prisma.definition.findMany({
        where: { debateId: id },
        include: { proposedBy: { select: { id: true, username: true } } },
        orderBy: { createdAt: "asc" },
    });

    return NextResponse.json({ definitions });
}

// POST /api/debates/[id]/definitions - Proponer definición
export async function POST(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { id } = await params;
    const { term, definition } = await request.json();

    if (!term || !definition) {
        return NextResponse.json(
            { error: "Término y definición son requeridos" },
            { status: 400 }
        );
    }

    const debate = await prisma.debate.findUnique({ where: { id } });
    if (!debate) {
        return NextResponse.json({ error: "Debate no encontrado" }, { status: 404 });
    }

    if (debate.creatorId !== session.user.id && debate.opponentId !== session.user.id) {
        return NextResponse.json({ error: "No autorizado" }, { status: 403 });
    }

    const newDef = await prisma.definition.create({
        data: {
            term: term.trim(),
            definition: definition.trim(),
            debateId: id,
            proposedById: session.user.id,
        },
        include: { proposedBy: { select: { id: true, username: true } } },
    });

    return NextResponse.json({ definition: newDef }, { status: 201 });
}

// PATCH /api/debates/[id]/definitions - Aceptar/disputar definición
export async function PATCH(request, { params }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const { definitionId, status } = await request.json();

    if (!definitionId || !["accepted", "disputed"].includes(status)) {
        return NextResponse.json({ error: "Datos inválidos" }, { status: 400 });
    }

    const updated = await prisma.definition.update({
        where: { id: definitionId },
        data: { status },
        include: { proposedBy: { select: { id: true, username: true } } },
    });

    return NextResponse.json({ definition: updated });
}
