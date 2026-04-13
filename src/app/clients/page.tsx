import { cookies } from "next/headers";
import { FacebookLoginButton } from "@/components/auth/FacebookLoginButton";
import { LayoutGrid, AlertCircle, BarChart3, Users, Fingerprint } from "lucide-react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default async function ClientsPage() {
  const cookieStore = await cookies();
  const fbToken = cookieStore.get("fb_access_token")?.value;

  let pages: any[] = [];
  let adAccounts: any[] = [];
  let fbError = null;

  if (fbToken) {
    try {
      // Fetch Facebook Pages that the user manages
      const [pagesRes, adRes] = await Promise.all([
        fetch(`https://graph.facebook.com/v19.0/me/accounts?fields=id,name,category,followers_count,fan_count,picture&access_token=${fbToken}`),
        fetch(`https://graph.facebook.com/v19.0/me/adaccounts?fields=id,name,account_status,amount_spent,currency&access_token=${fbToken}`)
      ]);
      
      const pagesData = await pagesRes.json();
      const adData = await adRes.json();
      
      if (pagesData.error) fbError = pagesData.error.message;
      else pages = pagesData.data || [];

      if (!adData.error) adAccounts = adData.data || [];

    } catch (err: any) {
      fbError = err.message;
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-950 text-gray-100 p-4 md:p-8 font-cairo" dir="rtl">
      
      {/* Header */}
      <div className="w-full max-w-7xl mx-auto mb-10">
        <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-6 text-sm">
           <ArrowRight className="w-4 h-4" /> العودة للرئيسية
        </Link>
        <div className="flex flex-col md:flex-row items-start justify-between gap-6">
          <div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white flex items-center gap-4 mb-2">
                لوحة تحكم الوكالة <span className="text-xl px-3 py-1 bg-blue-500/10 text-blue-400 rounded-full border border-blue-500/20 font-bold">Graph API</span>
            </h1>
            <p className="text-gray-400 max-w-lg text-sm leading-relaxed">
              هنا يمكنك مراقبة صفحات عملائك وحساباتهم الإعلانية الحقيقية المسحوبة مباشرة من قواعد بيانات فيسبوك (بدون أدوات خارجية).
            </p>
          </div>
          {!fbToken && (
            <div className="mt-4 md:mt-0">
               <FacebookLoginButton />
            </div>
          )}
        </div>
      </div>

      <div className="w-full max-w-7xl mx-auto space-y-8">
        
        {!fbToken ? (
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-3xl p-10 flex flex-col items-center justify-center text-center">
             <AlertCircle className="w-16 h-16 text-blue-500 mb-4" />
             <h2 className="text-2xl font-bold text-white mb-2">تحديث توكن الجلسة مطلوب!</h2>
             <p className="text-gray-400 mb-6 max-w-md">
               لقد قمنا للتو بتعديل نظام المصادقة لاختطاف مفتاح (Access Token) الخاص بفيسبوك وحفظه في النظام.<br/> 
               يُرجى الضغط على زر تسجيل الدخول مرة أخرى لتحديث الصلاحية.
             </p>
             <FacebookLoginButton />
          </div>
        ) : fbError ? (
          <div className="bg-red-500/10 border border-red-500/20 rounded-3xl p-6">
             <h2 className="text-xl font-bold text-red-500 mb-2">خطأ في جلب البيانات من Meta</h2>
             <p className="text-red-400/80 font-mono text-sm">{fbError}</p>
          </div>
        ) : (
          <div>
             {adAccounts.length > 0 && (
               <div className="mb-12">
                 <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                   <BarChart3 className="text-green-500" />
                   المحافظ الإعلانية النشطة ({adAccounts.length})
                 </h3>
                 <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                   {adAccounts.map((account) => (
                     <div key={account.id} className="bg-gray-900 border border-green-500/20 rounded-3xl p-6 relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-400"></div>
                        <h4 className="text-lg font-bold text-white mb-1">{account.name || 'حساب إعلاني'}</h4>
                        <p className="text-gray-500 text-xs font-mono mb-4">{account.id}</p>
                        
                        <div className="bg-gray-950 rounded-xl p-4 border border-gray-800">
                          <p className="text-gray-400 text-sm mb-1">المبلغ المصروف المجمّع</p>
                          <div className="text-2xl font-black text-green-400 flex items-end gap-1">
                            {account.amount_spent ? (parseInt(account.amount_spent)/100).toLocaleString() : '0'} 
                            <span className="text-sm text-gray-500 mb-1">{account.currency || 'USD'}</span>
                          </div>
                        </div>
                        
                        <div className="mt-4 flex justify-between items-center text-xs font-bold px-1">
                          <span className={account.account_status === 1 ? "text-green-500" : "text-red-500"}>
                            {account.account_status === 1 ? '🟢 نشط (Active)' : '🔴 موقوف أو مقيد'}
                          </span>
                        </div>
                     </div>
                   ))}
                 </div>
               </div>
             )}

             <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
               <LayoutGrid className="text-blue-500" />
               الصفحات الإعلانية المتاحة للمراقبة ({pages.length})
             </h3>
             
             {pages.length === 0 ? (
                <div className="bg-gray-900 border border-gray-800 rounded-3xl p-8 text-center">
                  <p className="text-gray-500">لا توجد أي صفحات تجارية مربوطة بحسابك في فيسبوك!</p>
                </div>
             ) : (
               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                 {pages.map((page) => (
                   <div key={page.id} className="bg-gray-900 border border-gray-800 rounded-3xl p-6 hover:border-blue-500/50 transition-all group relative overflow-hidden">
                      <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/10 rounded-bl-full -z-0"></div>
                      
                      <div className="flex items-center gap-4 mb-6 relative z-10">
                        {page.picture?.data?.url ? (
                          <img src={page.picture.data.url} alt={page.name} className="w-16 h-16 rounded-2xl border border-gray-700 shadow-lg" />
                        ) : (
                          <div className="w-16 h-16 bg-gray-800 rounded-2xl flex items-center justify-center border border-gray-700">
                             <Fingerprint className="text-gray-500" />
                          </div>
                        )}
                        <div>
                          <h4 className="text-lg font-bold text-white">{page.name}</h4>
                          <p className="text-blue-400 text-xs font-bold">{page.category}</p>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4 mb-6 relative z-10">
                         <div className="bg-gray-950 rounded-xl p-3 border border-gray-800">
                           <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                             <Users className="w-4 h-4" /> المتابعين
                           </div>
                           <div className="text-lg font-bold text-white">{page.followers_count?.toLocaleString() || "0"}</div>
                         </div>
                         <div className="bg-gray-950 rounded-xl p-3 border border-gray-800">
                           <div className="flex items-center gap-2 text-gray-500 text-xs mb-1">
                             <BarChart3 className="w-4 h-4" /> الإعجابات
                           </div>
                           <div className="text-lg font-bold text-white">{page.fan_count?.toLocaleString() || "0"}</div>
                         </div>
                      </div>
                      
                      <button className="w-full bg-blue-600 hover:bg-blue-500 text-white py-3 rounded-xl font-bold transition-colors relative z-10 shadow-lg shadow-blue-500/20">
                         السحب الذكي والتحليل
                      </button>
                   </div>
                 ))}
               </div>
             )}
          </div>
        )}

      </div>
    </div>
  );
}
