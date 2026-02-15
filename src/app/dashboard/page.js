import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { redirect } from "next/navigation";
import prisma from "@/lib/prisma";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
    const session = await getServerSession(authOptions);

    if (!session) {
        redirect("/login");
    }

    const debates = await prisma.debate.findMany({
        where: {
            OR: [
                { creatorId: session.user.id },
                { opponentId: session.user.id },
            ],
        },
        include: {
            creator: { select: { id: true, username: true } },
            opponent: { select: { id: true, username: true } },
            _count: { select: { messages: true } },
        },
        orderBy: { updatedAt: "desc" },
    });

    return <DashboardClient debates={debates} userId={session.user.id} userName={session.user.name} />;
}
