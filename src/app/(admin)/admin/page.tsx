// import { Card, CardHeader, CardTitle, CardDescription } from " ";
import Link from "next/link";

export default function AdminDashboard() {
    const adminActions = [
        { title: "Post Sermon", desc: "Upload Sunday/Weekday notes", link: "/admin/upload-sermon", icon: "✍️" },
        { title: "Event Media", desc: "Add photos & clips to Gallery", link: "/admin/upload-media", icon: "📸" },
        { title: "Parish Shuffle", desc: "Update Pastors or Locations", link: "/admin/manage-parishes", icon: "⛪" },
        { title: "Department Hub", desc: "Edit Youth, Teens, or Kids pages", link: "/admin/departments", icon: "👥" },
        { title: "Live Switch", desc: "Toggle the 'Join Live' banner", link: "/admin/live-control", icon: "🔴" },
    ];

    return (
        <div className="p-8">
            <h1 className="text-3xl font-bold mb-6">MHC Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {adminActions.map((action) => (
                    <Link href={action.link} key={action.title}>
                        {/*<Card className="hover:bg-slate-50 transition-colors cursor-pointer h-full">*/}
                        {/*    <CardHeader>*/}
                        {/*        <div className="text-4xl mb-2">{action.icon}</div>*/}
                        {/*        <CardTitle>{action.title}</CardTitle>*/}
                        {/*        <CardDescription>{action.desc}</CardDescription>*/}
                        {/*    </CardHeader>*/}
                        {/*</Card>*/}
                    </Link>
                ))}
            </div>
        </div>
    );
}