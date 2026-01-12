import Link from "next/link";
import { Github, Twitter } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer className="w-full border-t border-white/5 py-12 bg-[#0a0a0a]">
      <div className="w-full max-w-[1400px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-6 text-sm text-white/40">
          <span>© 2026 Orlume Inc.</span>
          <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
          <Link href="#" className="hover:text-white transition-colors">Terms</Link>
          <Link href="#" className="hover:text-white transition-colors">Status</Link>
        </div>

        <div className="flex items-center gap-4 text-white/40">
          <Link href="#" className="hover:text-white transition-colors">
            <Twitter size={20} />
          </Link>
          <Link href="#" className="hover:text-white transition-colors">
            <Github size={20} />
          </Link>
        </div>
      </div>
    </footer>
  );
}
