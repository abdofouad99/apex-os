import ForgeClient from "./ForgeClient";
import { Suspense } from "react";

export default function ForgePage() {
  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-gray-100 p-4 md:p-8 font-cairo" dir="rtl">
      <div className="w-full max-w-7xl mx-auto mb-6">
         <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-red-500 flex items-center gap-4">
            <span className="text-4xl text-orange-500">🔥</span> مصنع المحتوى (FORGE)
         </h1>
         <p className="text-gray-400 mt-3 max-w-2xl text-sm leading-relaxed">
           قم بتوليد أفكار تسويقية مبتكرة، نصوص إعلانات، ومنشورات لجميع منصات التواصل الاجتماعي بضغطة زر باستخدام محرك الذكاء الاصطناعي الخاص بالوكالة.
         </p>
      </div>

      <Suspense fallback={<div className="text-gray-500 animate-pulse text-center w-full mt-20">جاري تحميل المصنع...</div>}>
        <ForgeClient />
      </Suspense>
    </div>
  );
}
