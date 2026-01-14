import Link from "next/link";
import { Github, Twitter, Linkedin, Youtube } from "lucide-react";

export default function SiteFooter() {
  return (
    <footer
  className="bg-cover bg-bottom h-[530px] flex flex-col justify-end pb-12 relative"
  style={{ backgroundImage: "url('/footer.webp')" }}
>
  <div className="absolute top-0 left-0 w-full h-12 bg-gradient-to-b from-[#0a0a0a] to-transparent pointer-events-none" />
    <div className="w-full max-w-[1400px] mx-auto px-6 flex flex-col items-center gap-4 relative z-10">
      <div className="flex items-center gap-4 text-sm text-white/40">
        <Link href="#" className="hover:text-white transition-colors" aria-label="Twitter">
          <Twitter size={18} />
        </Link>
        <span>|</span>
        <Link href="#" className="hover:text-white transition-colors" aria-label="LinkedIn">
          <Linkedin size={18} />
        </Link>
        <span>|</span>
        <Link href="#" className="hover:text-white transition-colors" aria-label="YouTube">
          <Youtube size={18} />
        </Link>
        <span>|</span>
        <Link href="#" className="hover:text-white transition-colors" aria-label="GitHub">
          <Github size={18} />
        </Link>
        <span>|</span>
        <Link href="#" className="hover:text-white transition-colors">Privacy</Link>
        <span>|</span>
        <Link href="#" className="hover:text-white transition-colors">Terms</Link>
        <span>|</span>
        <Link href="#" className="hover:text-white transition-colors">Status</Link>
      </div>
      <span className="text-sm text-white/40">© 2026 Orlume Inc.</span>
    </div>
</footer>


  );
}
