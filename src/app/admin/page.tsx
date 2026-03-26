"use client";

import Link from "next/link";
import { PencilSimple, ChartBar, Gear, Calculator } from "@phosphor-icons/react";

export default function AdminDashboard() {
  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Dashboard</h1>

      <div className="grid gap-4">
        <Link
          href="/admin/spellings"
          className="bg-white rounded-xl p-6 shadow-sm border border-stone-200 hover:border-green-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="text-3xl text-green-700"><PencilSimple weight="duotone" size={36} /></div>
            <div>
              <h2 className="text-lg font-semibold text-stone-800 group-hover:text-green-700 transition-colors">
                Manage Spellings
              </h2>
              <p className="text-sm text-stone-500">
                Create and manage spelling lists and words
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/progress"
          className="bg-white rounded-xl p-6 shadow-sm border border-stone-200 hover:border-green-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="text-3xl text-green-700"><ChartBar weight="duotone" size={36} /></div>
            <div>
              <h2 className="text-lg font-semibold text-stone-800 group-hover:text-green-700 transition-colors">
                View Progress
              </h2>
              <p className="text-sm text-stone-500">
                Track learning progress and achievements
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/tables"
          className="bg-white rounded-xl p-6 shadow-sm border border-stone-200 hover:border-green-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="text-3xl text-green-700"><Calculator weight="duotone" size={36} /></div>
            <div>
              <h2 className="text-lg font-semibold text-stone-800 group-hover:text-green-700 transition-colors">
                Times Tables
              </h2>
              <p className="text-sm text-stone-500">
                Choose which times tables to practise
              </p>
            </div>
          </div>
        </Link>

        <Link
          href="/admin/settings"
          className="bg-white rounded-xl p-6 shadow-sm border border-stone-200 hover:border-green-300 hover:shadow-md transition-all group"
        >
          <div className="flex items-center gap-4">
            <div className="text-3xl text-green-700"><Gear weight="duotone" size={36} /></div>
            <div>
              <h2 className="text-lg font-semibold text-stone-800 group-hover:text-green-700 transition-colors">
                Settings
              </h2>
              <p className="text-sm text-stone-500">
                Admin password, sounds, and reset options
              </p>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
