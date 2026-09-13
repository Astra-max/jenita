"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import toast from "react-hot-toast";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { logout } from "@/store/features/auth/authSlice";

export default function DashboardPage() {
  const user = useAppSelector((state) => state.auth.user);
  const router = useRouter();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!user) {
      router.replace("/login");
    }
  }, [user, router]);

  if (!user) return null;

  const events = [
    { id: 1, title: "Pay rent", when: "Today", type: "urgent" },
    { id: 2, title: "Project review", when: "Tomorrow", type: "important" },
    { id: 3, title: "Submit taxes", when: "In 3 days", type: "deadline" },
    { id: 4, title: "Call with Sam", when: "Missed", type: "missed" },
    { id: 5, title: "Dentist appointment", when: "Next week", type: "upcoming" },
  ];

  const devices = [
    { id: "phone", name: "Phone", status: "Online", battery: 82 },
    { id: "laptop", name: "Computer", status: "Charging", battery: 64 },
    { id: "tablet", name: "Tablet", status: "Offline", battery: null },
  ];

  return (
    <div className="min-h-screen bg-pink-50">
      <nav className="bg-white border-b border-pink-200">
        <div className="max-w-[1280px] mx-auto px-5 sm:px-8 lg:px-10 flex items-center justify-between h-16 sm:h-[74px]">
          <Link href="/" className="text-2xl font-bold text-black tracking-tight">
            Jenita
          </Link>
          <div className="flex items-center gap-4">
            <p className="text-sm text-[#454545]">{user.email}</p>
            <button
              onClick={() => {
                dispatch(logout());
                toast.success("Signed out. See you soon.");
                router.push("/");
              }}
              className="bg-black text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-pink-600 transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </nav>

      <main className="max-w-[1280px] w-full mx-auto px-5 sm:px-8 lg:px-10 py-12 grid grid-cols-1 md:grid-cols-4 gap-8">
        <aside className="md:col-span-1 bg-white rounded-lg border p-4 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Overview</h2>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center justify-between">
              <span>Events</span>
              <span className="text-pink-600 font-medium">{events.length}</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Expense Tracker</span>
              <span className="text-gray-600">Open</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Phone Status</span>
              <span className="text-green-600">Online</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Computer Status</span>
              <span className="text-amber-600">Charging</span>
            </li>
            <li className="flex items-center justify-between">
              <span>Connected Devices</span>
              <span className="text-gray-600">{devices.length}</span>
            </li>
          </ul>

          <div className="mt-6">
            <h3 className="text-sm font-medium mb-2">Quick actions</h3>
            <div className="flex flex-col gap-2">
              <Link href="#" className="text-sm text-pink-600">Add event</Link>
              <Link href="#" className="text-sm text-pink-600">Log expense</Link>
              <Link href="#" className="text-sm text-pink-600">Scan device</Link>
            </div>
          </div>
        </aside>

        <section className="md:col-span-2 space-y-6">
          <div className="bg-white rounded-lg border p-6 shadow-sm">
            <p className="text-sm font-medium text-pink-600 mb-2">Dashboard</p>
            <h1 className="text-2xl font-bold mb-1">Good to see you, {user.name.split(" ")[0]}.</h1>
            <p className="text-sm text-[#454545]">Your personal assistant overview — events, priorities, and device health.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg border p-4 shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Events</h3>
              <div className="space-y-2">
                <div className="flex items-center gap-3 text-sm">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <strong className="mr-2">Urgent</strong>
                  <span className="text-gray-600">(things needing immediate attention)</span>
                </div>
                <ul className="mt-3 space-y-2">
                  {events.map((e) => (
                    <li key={e.id} className="flex items-center justify-between bg-pink-50 p-3 rounded">
                      <div>
                        <div className="text-sm font-medium">{e.title}</div>
                        <div className="text-xs text-gray-500">{e.when}</div>
                      </div>
                      <div className="text-xs text-gray-600 capitalize">{e.type}</div>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-4 text-xs text-gray-500">
                Categories: urgent, important, deadline, missed, upcoming, follow-ups, reminders, appointments.
              </div>
            </div>

            <div className="bg-white rounded-lg border p-4 shadow-sm">
              <h3 className="text-lg font-semibold mb-3">Expense Tracker</h3>
              <p className="text-sm text-gray-600">Summary of recent expenses and quick add.</p>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>Groceries</span>
                  <span className="font-medium">$84.20</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Utilities</span>
                  <span className="font-medium">$120.50</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Transport</span>
                  <span className="font-medium">$24.00</span>
                </div>
              </div>
              <div className="mt-4">
                <Link href="#" className="text-pink-600 text-sm">Open expense tracker</Link>
              </div>
            </div>
          </div>
        </section>

        <aside className="md:col-span-1 bg-white rounded-lg border p-4 shadow-sm">
          <h3 className="text-lg font-semibold mb-3">Device Status</h3>
          <div className="space-y-3">
            {devices.map((d) => (
              <div key={d.id} className="flex items-center justify-between p-3 bg-pink-50 rounded">
                <div>
                  <div className="text-sm font-medium">{d.name}</div>
                  <div className="text-xs text-gray-500">{d.status}</div>
                </div>
                <div className="text-sm">
                  {d.battery !== null ? <span>{d.battery}%</span> : <span className="text-gray-500">—</span>}
                </div>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <h4 className="text-sm font-medium mb-2">Other suggestions</h4>
            <ul className="text-sm text-gray-600 space-y-2">
              <li>Sync calendar</li>
              <li>Review missed events</li>
              <li>Schedule follow-ups</li>
              <li>Set payment reminders</li>
            </ul>
          </div>
        </aside>
      </main>
    </div>
  );
}
