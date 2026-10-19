import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useEmblaCarousel from 'embla-carousel-react';
import { ArrowRight, Camera, Check, GraduationCap, HandCoins, Package, Plane, Send, Target } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { cn } from '@/lib/cn';
import { useImpactMetrics, useSlideshowPhotos } from '@/hooks/useSiteConfig';
import type { Mission, UserType } from '@/types/database.types';
import photo1 from '@/assets/accueil-1.jpg';
import photo2 from '@/assets/accueil-2.jpg';
import photo3 from '@/assets/accueil-3.jpg';
import heart from '@/assets/coeur-playlife.png';
import { MissionCard } from '../components/MissionCard';
import { MissionForm } from '../components/MissionForm';
import { MissionQuiz } from '../components/interactive/MissionQuiz';
import { Button, ButtonLink } from '../components/ui/Button';
import { Eyebrow } from '../components/ui/Eyebrow';
import { Reveal } from '../components/ui/Reveal';
import { CardGridSkeleton } from '../components/ui/Skeleton';

const DEFAULT_PHOTOS = [photo1, photo2, photo3];

const PACK = ['8 à 12 ballons', 'Chasubles & plots', 'Pompe & aiguilles'];

const STEPS = [
  { icon: Target, title: 'Créer la mission', text: 'Définissez le lieu, la structure et vos dates.' },
  { icon: HandCoins, title: 'Lancer la collecte', text: 'Une cagnotte liée à Playlife, reçus fiscaux automatiques.' },
  { icon: Package, title: 'Préparer le pack', text: 'Ballons, chasubles, plots et kit de gonflage.' },
  { icon: Send, title: 'Remettre le pack', text: 'En main propre ou via une structure partenaire.' },
  { icon: Camera, title: 'Partager l\'impact', text: 'Photos et souvenirs pour inspirer d\'autres missions.' },
];

const WAYS: Array<{ type: UserType; icon: typeof Plane; title: string; text: string; points: string[]; dark?: boolean }> = [
  {
    type: 'voyageur',
    icon: Plane,
    title: 'Voyageur solidaire',
    text: 'Vous partez en voyage, pour le travail ou en vacances ? Glissez un pack Playlife dans vos bagages.',
    points: ['Vous transportez un pack Playlife', 'Vous le remettez à une structure locale', 'Vous vivez une vraie rencontre humaine'],
  },
  {
    type: 'animateur',
    icon: GraduationCap,
    title: 'Animateur / Enseignant',
    text: 'Vous encadrez un groupe d\'enfants ? Faites-en les acteurs d\'un projet solidaire concret.',
    points: ['Les enfants construisent le projet', 'Ils préparent un pack pour d\'autres enfants', 'Livraison via une structure partenaire'],
    dark: true,
  },
];

function useRecentMissions() {
  const [missions, setMissions] = useState<Mission[] | null>(null);
  useEffect(() => {
    supabase.from('missions').select('*').eq('visible', true).order('created_at', { ascending: false }).limit(3)
      .then(({ data }) => setMissions(data ?? []));
  }, []);
  return missions;
}

function HeroCarousel() {
  const slideshow = useSlideshowPhotos();
  const photos = slideshow.length > 0 ? slideshow : DEFAULT_PHOTOS;
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => { if (emblaApi) setSelected(emblaApi.selectedScrollSnap()); }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on('select', onSelect).on('reInit', onSelect);
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const timer = reduceMotion ? undefined : setInterval(() => emblaApi.scrollNext(), 5000);
    return () => { clearInterval(timer); emblaApi.off('select', onSelect).off('reInit', onSelect); };
  }, [emblaApi, onSelect]);

  return (
    <div className="relative animate-fade-up [animation-delay:150ms] lg:absolute lg:inset-y-0 lg:right-0 lg:left-[51.5%] lg:animate-none">
      <div
        className="h-full overflow-hidden shadow-float ring-1 ring-ink-900/10 lg:ring-0"
        ref={emblaRef}
        role="region"
        aria-roledescription="carrousel"
        aria-label="Photos de missions Playlife"
      >
        {/* Hauteur imposée plutôt qu'un ratio : au-delà de lg le diaporama
            remplit toute la hauteur du hero, bord droit de l'écran compris. */}
        <div className="flex h-[26rem] sm:h-[32rem] lg:h-full">
          {photos.map((photo, index) => (
            <div key={photo} className="min-w-0 flex-[0_0_100%]" aria-hidden={index !== selected}>
              <img
                src={photo}
                alt={`Mission Playlife, photo ${index + 1}`}
                loading={index === 0 ? 'eager' : 'lazy'}
                className="size-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Un seul bandeau en verre posé au bas de la photo : le contenu du pack
          à gauche, la navigation du diaporama à droite. */}
      <div className="absolute inset-x-3 bottom-3 rounded-[1.25rem] bg-white/80 px-5 py-4 shadow-lift ring-1 ring-ink-900/[0.06] backdrop-blur-xl sm:inset-x-5 sm:bottom-5 sm:px-6">
        <div>
          <p className="text-[0.7rem] font-semibold uppercase tracking-[0.18em] text-gray-500">Le pack Playlife</p>
          <ul className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm font-medium text-ink-900">
            {PACK.map(item => (
              <li key={item} className="flex items-center gap-1.5">
                <Check className="size-3.5 shrink-0 text-ink-900/40" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="absolute left-3 top-3 flex gap-1.5 rounded-full bg-ink-950/30 px-2.5 py-2 backdrop-blur-md sm:left-5 sm:top-5 lg:left-auto lg:right-5">
        {photos.map((photo, index) => (
          <button
            key={photo}
            type="button"
            onClick={() => emblaApi?.scrollTo(index)}
            aria-label={`Afficher la photo ${index + 1}`}
            aria-current={index === selected}
            className={cn(
              'h-1.5 rounded-full transition-all duration-500 ease-[var(--ease-out-expo)]',
              index === selected ? 'w-7 bg-white' : 'w-1.5 bg-white/55 hover:bg-white/85',
            )}
          />
        ))}
      </div>

      <img src={heart} alt="" aria-hidden="true" className="absolute hidden w-24 -rotate-6 drop-shadow-xl lg:block lg:-left-9 lg:top-[60%] lg:w-28 animate-float-slow" />
    </div>
  );
}

export default function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const metrics = useImpactMetrics();
  const missions = useRecentMissions();
  const [showForm, setShowForm] = useState(false);

  const startMission = () => (user ? setShowForm(true) : navigate('/login?create=true'));

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden grain">
        <div className="absolute inset-x-0 top-0 -z-10 h-[46rem] mesh-soft" aria-hidden="true" />
        <div className="container-page grid items-center gap-14 pb-20 pt-10 lg:min-h-[calc(100dvh-5rem)] lg:grid-cols-[1fr_1.08fr] lg:gap-20 lg:py-8">
          <div className="animate-fade-up">
            <p className="inline-flex items-center gap-2.5 rounded-full bg-white/70 px-3.5 py-1.5 text-xs font-semibold text-ink-800 ring-1 ring-ink-900/[0.07] backdrop-blur-xl">
              <span className="relative flex size-1.5" aria-hidden="true">
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-brand-500/70" />
                <span className="relative inline-flex size-1.5 rounded-full bg-brand-500" />
              </span>
              Association loi 1901 · Sport &amp; solidarité
            </p>
            <h1 className="mt-7 text-hero">
              Le sport au cœur de la{' '}
              <span className="text-brand-600">solidarité</span>
            </h1>
            <p className="mt-7 max-w-xl text-lead text-gray-600">
              Organisez une mission Playlife et offrez du matériel sportif à des enfants, partout dans le monde. En voyage ou avec votre groupe, on vous accompagne à chaque étape.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" onClick={startMission} iconRight={ArrowRight}>Créer une mission</Button>
              <ButtonLink to="/missions" size="lg" variant="secondary">Voir les missions</ButtonLink>
            </div>
            <dl className="mt-14 grid max-w-md grid-cols-2 divide-x divide-ink-900/[0.08] border-t border-ink-900/[0.08] pt-9">
              {[[metrics.value1, metrics.label1], [metrics.value2, metrics.label2]].map(([value, label], index) => (
                <div key={label} className={index === 1 ? 'pl-8' : 'pr-8'}>
                  <dt className="sr-only">{label}</dt>
                  <dd>
                    <span className="block font-display text-5xl font-semibold tabular-nums tracking-[-0.04em] text-ink-900 lg:text-6xl">{value}</span>
                    <span className="mt-2 block text-sm text-gray-600">{label}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <HeroCarousel />
        </div>
      </section>

      {/* Deux façons d'agir */}
      <section className="container-page py-20 lg:py-28" aria-labelledby="ways-title">
        <Reveal className="max-w-2xl">
          <Eyebrow>Deux façons d'agir</Eyebrow>
          <h2 id="ways-title" className="mt-4 text-section">Choisissez votre mission</h2>
        </Reveal>
        <div className="mt-12 grid gap-6 md:grid-cols-2">
          {WAYS.map((way, index) => (
            <Reveal
              key={way.type}
              as="article"
              delay={index * 110}
              className={cn(
                'group relative flex flex-col overflow-hidden rounded-[2rem] p-8 transition-all duration-500 ease-[var(--ease-out-expo)] hover:-translate-y-1.5 md:p-10',
                way.dark ? 'bg-ink-900 text-white shadow-lift hover:shadow-float' : 'bg-white shadow-card ring-1 ring-ink-900/[0.07] hover:shadow-card-hover',
              )}
            >
              <div className={cn('absolute -right-20 -top-20 size-64 rounded-full blur-3xl transition-opacity duration-500 group-hover:opacity-100', way.dark ? 'bg-brand-500/15 opacity-80' : 'bg-ink-900/[0.05] opacity-70')} aria-hidden="true" />
              <span className={cn('relative flex size-15 items-center justify-center rounded-2xl ring-1 transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-105', way.dark ? 'bg-white/10 text-white ring-white/15' : 'bg-ink-900/[0.04] text-ink-900 ring-ink-900/[0.07]')}>
                <way.icon className="size-7" aria-hidden="true" />
              </span>
              <h3 className={cn('relative mt-7 text-title', way.dark && 'text-white')}>{way.title}</h3>
              <p className={cn('relative mt-3', way.dark ? 'text-ink-200' : 'text-gray-600')}>{way.text}</p>
              <ul className="relative mt-7 space-y-3">
                {way.points.map(point => (
                  <li key={point} className="flex items-start gap-3 text-sm">
                    <span className={cn('mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full', way.dark ? 'bg-white/15 text-white' : 'bg-ink-900 text-white')}>
                      <Check className="size-3" aria-hidden="true" />
                    </span>
                    <span className={way.dark ? 'text-ink-100' : 'text-ink-800'}>{point}</span>
                  </li>
                ))}
              </ul>
              <div className="relative mt-auto pt-9">
                <Button variant={way.dark ? 'primary' : 'dark'} onClick={startMission} iconRight={ArrowRight}>Je me lance</Button>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      {/* Quiz d'orientation */}
      <section className="container-page pb-20 lg:pb-28" aria-label="Quiz : quelle mission est faite pour vous ?">
        <Reveal>
          <MissionQuiz onStartMission={startMission} />
        </Reveal>
      </section>

      {/* Comment ça marche */}
      <section className="relative overflow-hidden bg-white py-20 lg:py-28" aria-labelledby="steps-title">
        <div className="container-page">
          <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <Eyebrow>Comment ça marche</Eyebrow>
              <h2 id="steps-title" className="mt-4 text-section">Cinq étapes, accompagnées par Playlife</h2>
            </div>
            <ButtonLink to="/comment-ca-marche" variant="ghost" iconRight={ArrowRight} className="self-start md:self-auto">En savoir plus</ButtonLink>
          </Reveal>
          <ol className="relative mt-14 grid gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
            <div className="absolute left-[10%] right-[10%] top-7.5 hidden h-px bg-linear-to-r from-transparent via-gray-300 to-transparent lg:block" aria-hidden="true" />
            {STEPS.map((step, index) => (
              <Reveal as="li" key={step.title} delay={index * 90} className="group relative">
                <span className="relative flex size-15 items-center justify-center rounded-2xl bg-surface-100 text-ink-900 ring-1 ring-ink-900/[0.07] transition-all duration-500 ease-[var(--ease-out-expo)] group-hover:-translate-y-1 group-hover:bg-white group-hover:shadow-card-hover lg:mx-auto">
                  <step.icon className="size-6" aria-hidden="true" />
                  <span className="absolute -right-2 -top-2 flex size-6.5 items-center justify-center rounded-full bg-brand-500 font-display text-xs font-semibold text-white ring-4 ring-white">{index + 1}</span>
                </span>
                <h3 className="mt-5 text-base font-semibold lg:text-center">{step.title}</h3>
                <p className="mt-1.5 text-sm text-gray-600 lg:text-center">{step.text}</p>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* Missions récentes */}
      {(missions === null || missions.length > 0) && (
        <section className="container-page pt-20 lg:pt-28" aria-labelledby="recent-title">
          <Reveal className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <Eyebrow>Sur le terrain</Eyebrow>
              <h2 id="recent-title" className="mt-4 text-section">Missions récentes</h2>
            </div>
            <Link to="/missions" className="group inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700">
              Toutes les missions
              <ArrowRight className="size-4 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          </Reveal>
          <div className="mt-12">
            {missions === null ? <CardGridSkeleton /> : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {missions.map((mission, index) => (
                  <Reveal key={mission.id} delay={index * 90}>
                    <MissionCard mission={mission} />
                  </Reveal>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {showForm && <MissionForm onClose={() => setShowForm(false)} onSuccess={() => navigate('/dashboard')} />}
    </>
  );
}
