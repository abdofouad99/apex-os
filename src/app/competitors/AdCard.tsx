import React from 'react';
import { PlayCircle, Eye, Tag, AlertCircle, ExternalLink, Calendar } from 'lucide-react';

export default function AdCard({ ad, viewMode }: { ad: any, viewMode: 'grid' | 'list' }) {
  const isVideo = !!ad.videoUrl;
  const hasOffer = ad.hasOffer;
  
  return (
    <div className={`bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden hover:border-purple-500/50 transition-colors shadow-lg flex ${viewMode === 'list' ? 'flex-col md:flex-row' : 'flex-col'}`}>
      
      {/* Media Section */}
      <div className={`relative bg-black flex-shrink-0 ${viewMode === 'list' ? 'w-full md:w-64 h-48 md:h-full' : 'w-full h-56'}`}>
        {isVideo ? (
          <div className="w-full h-full flex items-center justify-center relative group">
            {ad.imageUrl ? (
              <img src={ad.imageUrl} alt="Thumbnail" className="w-full h-full object-cover opacity-70 group-hover:opacity-50 transition" />
            ) : (
              <div className="w-full h-full bg-gray-800" />
            )}
            <PlayCircle className="absolute w-12 h-12 text-purple-500 shadow-xl opacity-80 group-hover:opacity-100 group-hover:scale-110 transition-all z-10" />
          </div>
        ) : ad.imageUrl ? (
          <img src={ad.imageUrl} alt="Ad Content" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500">
            لا توجد وسائط
          </div>
        )}
        
        {/* Badges Overlay */}
        <div className="absolute top-3 right-3 flex flex-col gap-2">
          {ad.isActive ? (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-md font-bold shadow-md shadow-green-500/20">نشط الآن</span>
          ) : (
            <span className="bg-gray-700 text-gray-300 text-xs px-2 py-1 rounded-md font-bold">متوقف</span>
          )}
        </div>
        <div className="absolute top-3 left-3 flex gap-2">
          {hasOffer && <span className="bg-yellow-500 text-gray-900 text-xs px-2 py-1 rounded-md font-bold flex items-center gap-1 shadow-md"><Tag className="w-3 h-3"/> عرض</span>}
          {isVideo && <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded-md font-bold shadow-md">فيديو</span>}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-1">
        
        {/* Header / Meta */}
        <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
          <div className="flex items-center gap-1"><Calendar className="w-3 h-3" /> {ad.startDate ? new Date(ad.startDate).toLocaleDateString('ar-SA') : 'غير محدد'}</div>
          <div className="flex bg-gray-800 px-2 py-1 rounded gap-1"><span className="text-gray-300 font-bold">{ad.mainTopic || 'ترويج'}</span></div>
        </div>

        {/* Ad Body Text */}
        <p className="text-gray-200 text-sm mb-4 line-clamp-3 leading-relaxed flex-1" dir="auto">
          {ad.bodyText || "لا يوجد نص مرفق مع الإعلان."}
        </p>

        {/* Hook Score */}
        <div className="mb-4">
          <div className="flex justify-between items-end mb-1">
            <span className="text-xs text-gray-400">قوة الخطاف (Hook)</span>
            <span className="text-xs font-bold text-purple-400">{ad.hookScore}/10</span>
          </div>
          <div className="h-1.5 w-full bg-gray-800 rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all`} 
                 style={{ width: `${(ad.hookScore / 10) * 100}%`, backgroundColor: ad.hookScore > 7 ? '#a855f7' : ad.hookScore > 4 ? '#f59e0b' : '#ef4444' }} />
          </div>
        </div>

        {/* Performance (If available) */}
        {(ad.spendLower || ad.impressionsLower) && (
          <div className="bg-gray-800/50 rounded-lg p-3 text-xs flex justify-between mb-4 border border-gray-800">
            <div>
              <div className="text-gray-500 mb-1">حجم الإنفاق</div>
              <div className="font-bold text-gray-300 text-left" dir="ltr">{ad.spendLower ? `$${ad.spendLower} - $${ad.spendUpper}` : 'غير متاح'}</div>
            </div>
            <div>
              <div className="text-gray-500 mb-1 flex items-center gap-1"><Eye className="w-3 h-3"/> المشاهدات</div>
              <div className="font-bold text-gray-300 text-left" dir="ltr">{ad.impressionsLower ? `${ad.impressionsLower} - ${ad.impressionsUpper}` : 'غير متاح'}</div>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-auto pt-2 flex flex-col gap-2">
            <a href={`/forge?topic=${encodeURIComponent(ad.bodyText || 'إعلان بدون نص')}`} className="w-full text-center bg-gradient-to-r from-orange-500/20 to-red-500/20 border border-orange-500/50 hover:bg-orange-500/30 text-orange-400 py-2 rounded-lg text-sm font-bold transition flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(249,115,22,0.1)] hover:shadow-[0_0_20px_rgba(249,115,22,0.2)]">
              <span className="text-lg">🔥</span> إعادة صياغة الإعلان (لصالحك)
            </a>
            <a href={ad.linkUrl || "#"} target="_blank" rel="noopener noreferrer" className="w-full text-center bg-gray-800 hover:bg-gray-700 text-gray-300 hover:text-white py-2 rounded-lg text-sm font-semibold transition flex items-center justify-center gap-2">
              <ExternalLink className="w-4 h-4"/>
              فتح رابط الصفحة والهبوط
            </a>
        </div>

      </div>
    </div>
  );
}
