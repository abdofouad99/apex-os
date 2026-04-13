'use client'

import { createClient } from '@/lib/supabase/client'

export function FacebookLoginButton() {
  const supabase = createClient()

  const handleLogin = async () => {
    // Scopes enable us to read ads and pages without Apify later!
    await supabase.auth.signInWithOAuth({
      provider: 'facebook',
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=/`,
        scopes: 'public_profile,email,ads_read,pages_show_list,pages_read_engagement'
      },
    })
  }

  return (
    <button 
      onClick={handleLogin} 
      className="flex items-center gap-3 bg-[#1877F2] hover:bg-[#166fe5] text-white px-6 py-3 rounded-lg font-bold transition-all shadow-lg hover:shadow-blue-500/30"
    >
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
        <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z"/>
      </svg>
      <span>ربط الحساب مع فيسبوك (Facebook Sync)</span>
    </button>
  )
}
