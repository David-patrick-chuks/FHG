'use client';

import Image from 'next/image';
import Link from 'next/link';
import { AnimatedSection } from './AnimatedSection';

export function FooterSection() {
  return (
    <footer className="relative bg-gradient-to-b from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 py-16 overflow-hidden">
      {/* Subtle background pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,rgba(59,130,246,0.15)_1px,transparent_0)] bg-[length:24px_24px]"></div>
      </div>
      
      {/* Floating glass elements */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-32 h-32 bg-blue-500/10 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-32 w-24 h-24 bg-cyan-500/10 rounded-full blur-lg"></div>
        <div className="absolute bottom-32 left-1/3 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl"></div>
      </div>
      
      <div className="relative max-w-5xl mx-auto px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-8">
          <AnimatedSection delay={0}>
            <div className="md:col-span-1">
              <div className="flex items-center space-x-3 mb-6">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center p-2">
                  <Image 
                    src="/MailQuill.svg" 
                    alt="MailQuill Logo" 
                    width={24} 
                    height={24}
                    className="w-6 h-6 text-white filter brightness-0 invert"
                  />
                </div>
                <span className="text-2xl font-bold text-slate-900 dark:text-white">MailQuill</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300 leading-relaxed text-sm">
                Finally, an email platform that helps you connect with your audience instead of annoying them.
              </p>
            </div>
          </AnimatedSection>
          
          <AnimatedSection delay={100}>
            <div>
              <h3 className="font-semibold text-lg mb-6 text-slate-900 dark:text-white">Product</h3>
              <ul className="space-y-3 text-slate-600 dark:text-slate-300">
                <li><Link href="/features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm">Features</Link></li>
                <li><Link href="/pricing" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm">Pricing</Link></li>
                <li><Link href="/api-docs" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm">API Docs</Link></li>
              </ul>
            </div>
          </AnimatedSection>
          
          <AnimatedSection delay={200}>
            <div>
              <h3 className="font-semibold text-lg mb-6 text-slate-900 dark:text-white">Company</h3>
              <ul className="space-y-3 text-slate-600 dark:text-slate-300">
                <li><Link href="/about" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm">About</Link></li>
                <li><Link href="/contact" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm">Contact</Link></li>
                <li><Link href="/features" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm">Features</Link></li>
              </ul>
            </div>
          </AnimatedSection>
          
          <AnimatedSection delay={300}>
            <div>
              <h3 className="font-semibold text-lg mb-6 text-slate-900 dark:text-white">Support</h3>
              <ul className="space-y-3 text-slate-600 dark:text-slate-300">
                <li><Link href="/help-center" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm">Help Center</Link></li>
                <li><Link href="/system-status" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm">Status</Link></li>
                <li><Link href="/app-password-guide" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm">App Password Guide</Link></li>
              </ul>
            </div>
          </AnimatedSection>
        </div>
        
        <AnimatedSection delay={400}>
          <div className="border-t border-slate-200/50 dark:border-slate-700/50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-slate-500 dark:text-slate-400 mb-4 md:mb-0 text-sm">
              &copy; 2024 MailQuill. Made with for better emails.
            </p>
            <div className="flex space-x-6 text-sm text-slate-500 dark:text-slate-400">
              <Link href="/privacy" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm">Privacy</Link>
              <Link href="/terms" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm">Terms</Link>
              <Link href="/cookies" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors text-sm">Cookies</Link>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </footer>
  );
}
