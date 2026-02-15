import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import DebateClient from "./DebateClient";

export default async function DebatePage({ params }) {
    const session = await getServerSession(authOptions);
    if (!session) {
        redirect("/login");
    }

    const { id } = await params;

    const debate = await prisma.debate.findUnique({
        where: { id },
        include: {
            creator: { select: { id: true, username: true } },
            opponent: { select: { id: true, username: true } },
            definitions: {
                include: { proposedBy: { select: { id: true, username: true } } },
                orderBy: { createdAt: "asc" },
            },
            intentions: {
                include: { user: { select: { id: true, username: true } } },
                orderBy: { createdAt: "asc" },
            },
        },
    });

    if (!debate) {
        redirect("/dashboard");
    }

    if (debate.creatorId !== session.user.id && debate.opponentId !== session.user.id) {
        redirect("/dashboard");
    }

    const messages = await prisma.message.findMany({
        where: { debateId: id },
        include: {
            sender: { select: { id: true, username: true } },
            aiAnalysis: true,
        },
        orderBy: { createdAt: "asc" },
    });

    return (
        <DebateClient
            debate={JSON.parse(JSON.stringify(debate))}
            initialMessages={JSON.parse(JSON.stringify(messages))}
            userId={session.user.id}
            userName={session.user.name}
        />
    );
}
