'use client';

import { AnimatedSection } from './AnimatedSection';
import { Brain } from 'lucide-react';

export function FooterSection() {
  return (
    <footer className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-20 overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-4 gap-12">
          <AnimatedSection delay={0}>
            <div className="md:col-span-1">
              <div className="flex items-center space-x-3 mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center">
                  <Brain className="w-7 h-7 text-white" />
                </div>
                <span className="text-3xl font-bold text-white">MailQuill</span>
              </div>
              <p className="text-white/70 leading-relaxed text-lg">
                The AI-powered email marketing platform that helps businesses create, automate, and optimize campaigns.
              </p>
            </div>
          </AnimatedSection>
          
          <AnimatedSection delay={100}>
            <div>
              <h3 className="font-semibold text-xl mb-8 text-white">Product</h3>
              <ul className="space-y-4 text-white/70">
                <li><a href="#" className="hover:text-white transition-colors text-lg">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-lg">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-lg">Integrations</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-lg">API Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-lg">Security</a></li>
              </ul>
            </div>
          </AnimatedSection>
          
          <AnimatedSection delay={200}>
            <div>
              <h3 className="font-semibold text-xl mb-8 text-white">Company</h3>
              <ul className="space-y-4 text-white/70">
                <li><a href="#" className="hover:text-white transition-colors text-lg">About Us</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-lg">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-lg">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-lg">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-lg">Press Kit</a></li>
              </ul>
            </div>
          </AnimatedSection>
          
          <AnimatedSection delay={300}>
            <div>
              <h3 className="font-semibold text-xl mb-8 text-white">Support</h3>
              <ul className="space-y-4 text-white/70">
                <li><a href="#" className="hover:text-white transition-colors text-lg">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-lg">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-lg">Community</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-lg">System Status</a></li>
                <li><a href="#" className="hover:text-white transition-colors text-lg">Training</a></li>
              </ul>
            </div>
          </AnimatedSection>
        </div>
        
        <AnimatedSection delay={400}>
          <div className="border-t border-white/20 mt-16 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-white/60 mb-4 md:mb-0 text-lg">&copy; 2024 MailQuill. All rights reserved.</p>
            <div className="flex space-x-8 text-sm text-white/60">
              <a href="#" className="hover:text-white transition-colors text-lg">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors text-lg">Terms of Service</a>
              <a href="#" className="hover:text-white transition-colors text-lg">Cookie Policy</a>
            </div>
          </div>
        </AnimatedSection>
      </div>
    </footer>
  );
}
