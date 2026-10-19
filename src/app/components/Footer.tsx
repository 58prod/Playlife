import { Link } from 'react-router-dom';
import { ArrowRight, Mail, Phone } from 'lucide-react';
import logo from '@/assets/logo-playlife-connect.png';
import { ButtonLink } from './ui/Button';
import { NAV_ITEMS } from './Header';

export function Footer({ showCta = true }: { showCta?: boolean }) {
  return (
    <footer className="mt-24">
      {showCta && (
        <div className="container-page">
          <div className="relative overflow-hidden rounded-[2.5rem] bg-ink-950 px-6 py-14 text-white ring-1 ring-white/10 md:px-14 md:py-18">
            <div className="absolute -right-24 -top-28 size-96 rounded-full bg-brand-500/18 blur-3xl" aria-hidden="true" />
            <div className="absolute -bottom-40 left-1/4 size-96 rounded-full bg-ink-500/35 blur-3xl" aria-hidden="true" />
            <div className="relative flex flex-col gap-8 md:flex-row md:items-end md:justify-between">
              <div className="max-w-xl">
                <p className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-ink-300">
                  <span className="h-px w-8 bg-ink-300/40" aria-hidden="true" />
                  Un coup de main
                </p>
                <h2 className="mt-4 text-section text-white">Besoin d'aide pour votre mission ?</h2>
                <p className="mt-4 text-lead text-ink-200">L'équipe Playlife vous aide à trouver une structure, préparer votre pack et lancer votre collecte.</p>
              </div>
              <ButtonLink to="/contact" size="lg" iconRight={ArrowRight} className="shrink-0">Nous contacter</ButtonLink>
            </div>
          </div>
        </div>
      )}

      <div className="container-page mt-16 border-t border-ink-900/[0.08] pb-10 pt-12">
        <div className="grid gap-10 md:grid-cols-[1.5fr_1fr_1fr]">
          <div className="max-w-sm">
            <img src={logo} alt="Playlife Connect" className="h-9 w-auto" width={800} height={229} loading="lazy" />
            <p className="mt-4 text-sm text-gray-600">Le sport au cœur de la solidarité : des packs de matériel sportif remis à des enfants, partout dans le monde, par des voyageurs et des éducateurs engagés.</p>
          </div>
          <nav aria-label="Liens du pied de page">
            <p className="text-sm font-semibold text-ink-900">Explorer</p>
            <ul className="mt-4 space-y-2.5 text-sm">
              {[...NAV_ITEMS, { label: 'Ressources', path: '/comment-ca-marche#ressources' }].map(item => (
                <li key={item.path}><Link to={item.path} className="text-gray-600 transition-colors hover:text-brand-600">{item.label}</Link></li>
              ))}
            </ul>
          </nav>
          <div>
            <p className="text-sm font-semibold text-ink-900">Nous joindre</p>
            <ul className="mt-4 space-y-2.5 text-sm text-gray-600">
              <li><a href="mailto:playlife-connect@playlife.today" className="inline-flex items-center gap-2 hover:text-brand-600"><Mail className="size-4" aria-hidden="true" />playlife-connect@playlife.today</a></li>
              <li><a href="tel:+33663070435" className="inline-flex items-center gap-2 hover:text-brand-600"><Phone className="size-4" aria-hidden="true" />+33 6 63 07 04 35</a></li>
            </ul>
          </div>
        </div>
        <p className="mt-12 text-xs text-gray-500">© {new Date().getFullYear()} Playlife Connect · Association loi 1901 · SIRET 991 252 909 00015</p>
      </div>
    </footer>
  );
}
