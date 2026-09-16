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
          <div className="relative overflow-hidden rounded-3xl bg-ink-900 px-6 py-10 text-white md:px-12 md:py-14">
            <div className="absolute -right-24 -top-24 size-72 rounded-full bg-brand-500/30 blur-3xl" aria-hidden="true" />
            <div className="absolute -bottom-32 left-1/3 size-72 rounded-full bg-ink-500/30 blur-3xl" aria-hidden="true" />
            <div className="relative flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
              <div className="max-w-xl">
                <h2 className="text-2xl font-bold text-white md:text-3xl">Besoin d'un coup de main pour votre mission ?</h2>
                <p className="mt-2 text-ink-200">L'équipe Playlife vous aide à trouver une structure, préparer votre pack et lancer votre collecte.</p>
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
              {NAV_ITEMS.map(item => (
                <li key={item.path}><Link to={item.path} className="text-gray-600 hover:text-brand-600">{item.label}</Link></li>
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
