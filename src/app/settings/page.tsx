"use client";

import * as React from "react";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6 p-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">الإعدادات والربط</h1>
        <p className="text-muted-foreground">
          إدارة مفاتيح الـ APIs وربط الحسابات الخارجية (Apify, OpenAI, إلخ).
        </p>
      </div>

      <div className="grid gap-6 max-w-2xl">
        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-lg font-medium mb-4">Apify Integration (PREDATOR)</h3>
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium">API Token</label>
            <input 
              type="password" 
              placeholder="apify_api_XXXXX" 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <p className="text-xs text-muted-foreground">
              مطلوب لتشغيل محرك جمع العملاء المحتملين (Lead Hunter).
            </p>
          </div>
        </div>

        <div className="rounded-xl border bg-card text-card-foreground shadow-sm p-6">
          <h3 className="text-lg font-medium mb-4">OpenAI / Claude (FORGE)</h3>
          <div className="flex flex-col gap-3">
            <label className="text-sm font-medium">LLM API Key</label>
            <input 
              type="password" 
              placeholder="sk-XXXXX" 
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
            />
            <p className="text-xs text-muted-foreground">
              الأساس لصناعة المحتوى وتوليد الأفكار في مصنع FORGE.
            </p>
          </div>
        </div>

        <button className="inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-fit">
          حفظ التغييرات
        </button>
      </div>
    </div>
  );
}
