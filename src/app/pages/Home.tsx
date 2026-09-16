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
import { CardGridSkeleton } from '../components/ui/Skeleton';

const DEFAULT_PHOTOS = [photo1, photo2, photo3];

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
    <div className="relative">
      <div className="overflow-hidden rounded-[2rem] shadow-lift ring-1 ring-ink-900/10" ref={emblaRef} role="region" aria-roledescription="carrousel" aria-label="Photos de missions Playlife">
        <div className="flex">
          {photos.map((photo, index) => (
            <div key={photo} className="min-w-0 flex-[0_0_100%]" aria-hidden={index !== selected}>
              <img src={photo} alt={`Mission Playlife, photo ${index + 1}`} loading={index === 0 ? 'eager' : 'lazy'} className="aspect-[4/3.4] w-full object-cover lg:aspect-[4/4.2]" />
            </div>
          ))}
        </div>
      </div>
      <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5 rounded-full bg-ink-950/40 px-2.5 py-2 backdrop-blur">
        {photos.map((photo, index) => (
          <button
            key={photo}
            type="button"
            onClick={() => emblaApi?.scrollTo(index)}
            aria-label={`Afficher la photo ${index + 1}`}
            aria-current={index === selected}
            className={cn('h-1.5 rounded-full transition-all', index === selected ? 'w-6 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80')}
          />
        ))}
      </div>
      <div className="absolute -left-4 top-8 hidden rounded-2xl bg-white p-4 shadow-lift ring-1 ring-ink-900/[0.06] sm:block lg:-left-10 animate-fade-up [animation-delay:300ms]">
        <p className="text-xs font-semibold uppercase tracking-wider text-gray-500">Le pack Playlife</p>
        <ul className="mt-2 space-y-1 text-sm text-ink-900">
          {['8 à 12 ballons', 'Chasubles & plots', 'Pompe & aiguilles'].map(item => (
            <li key={item} className="flex items-center gap-2"><Check className="size-4 text-brand-500" aria-hidden="true" />{item}</li>
          ))}
        </ul>
      </div>
      <img src={heart} alt="" aria-hidden="true" className="absolute -bottom-8 -right-4 hidden w-24 rotate-6 drop-shadow-xl sm:block lg:-right-8 lg:w-28" />
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
      <section className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 -z-10 h-[38rem] bg-[radial-gradient(60%_60%_at_80%_0%,rgb(230_26_78/0.10),transparent_70%),radial-gradient(50%_50%_at_0%_30%,rgb(48_21_54/0.06),transparent_70%)]" aria-hidden="true" />
        <div className="container-page grid items-center gap-14 pb-16 pt-8 lg:grid-cols-[1.05fr_1fr] lg:gap-20 lg:pb-24 lg:pt-16">
          <div className="animate-fade-up">
            <p className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-xs font-semibold text-ink-800 shadow-soft ring-1 ring-ink-900/[0.06]">
              <span className="size-1.5 rounded-full bg-brand-500" aria-hidden="true" />
              Association loi 1901 · Sport & solidarité
            </p>
            <h1 className="mt-6 text-[2.6rem] font-bold leading-[1.02] sm:text-6xl lg:text-[4.25rem]">
              Le sport au cœur de la <span className="relative whitespace-nowrap text-brand-500">solidarité
                <svg className="absolute -bottom-2 left-0 w-full text-brand-200" viewBox="0 0 300 12" fill="none" preserveAspectRatio="none" aria-hidden="true"><path d="M2 9c60-6 130-8 296-3" stroke="currentColor" strokeWidth="4" strokeLinecap="round" /></svg>
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg text-gray-600">
              Organisez une mission Playlife et offrez du matériel sportif à des enfants, partout dans le monde. En voyage ou avec votre groupe, on vous accompagne à chaque étape.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button size="lg" onClick={startMission} iconRight={ArrowRight}>Créer une mission</Button>
              <ButtonLink to="/missions" size="lg" variant="secondary">Voir les missions</ButtonLink>
            </div>
            <dl className="mt-12 grid max-w-md grid-cols-2 gap-6 border-t border-ink-900/[0.08] pt-8">
              {[[metrics.value1, metrics.label1], [metrics.value2, metrics.label2]].map(([value, label]) => (
                <div key={label}>
                  <dt className="sr-only">{label}</dt>
                  <dd>
                    <span className="block font-display text-4xl font-bold tabular-nums text-ink-900 lg:text-5xl">{value}</span>
                    <span className="mt-1 block text-sm text-gray-600">{label}</span>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
          <HeroCarousel />
        </div>
      </section>

      {/* Deux façons d'agir */}
      <section className="container-page py-16 lg:py-24" aria-labelledby="ways-title">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-500">Deux façons d'agir</p>
          <h2 id="ways-title" className="mt-3 text-3xl font-bold md:text-4xl">Choisissez votre mission</h2>
        </div>
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {WAYS.map(way => (
            <article key={way.type} className={cn('group relative flex flex-col overflow-hidden rounded-3xl p-8 transition duration-300 hover:-translate-y-1 md:p-10', way.dark ? 'bg-ink-900 text-white shadow-lift' : 'bg-white shadow-soft ring-1 ring-ink-900/[0.06] hover:shadow-lift')}>
              <div className={cn('absolute -right-16 -top-16 size-56 rounded-full blur-2xl', way.dark ? 'bg-brand-500/25' : 'bg-brand-100/70')} aria-hidden="true" />
              <span className={cn('relative flex size-14 items-center justify-center rounded-2xl', way.dark ? 'bg-white/10 text-white' : 'bg-brand-50 text-brand-500')}>
                <way.icon className="size-7" aria-hidden="true" />
              </span>
              <h3 className={cn('relative mt-6 text-2xl font-bold', way.dark && 'text-white')}>{way.title}</h3>
              <p className={cn('relative mt-3', way.dark ? 'text-ink-200' : 'text-gray-600')}>{way.text}</p>
              <ul className="relative mt-6 space-y-3">
                {way.points.map(point => (
                  <li key={point} className="flex items-start gap-3 text-sm">
                    <span className={cn('mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full', way.dark ? 'bg-brand-500 text-white' : 'bg-brand-500 text-white')}>
                      <Check className="size-3" aria-hidden="true" />
                    </span>
                    <span className={way.dark ? 'text-ink-100' : 'text-ink-800'}>{point}</span>
                  </li>
                ))}
              </ul>
              <div className="relative mt-8 pt-2">
                <Button variant={way.dark ? 'primary' : 'dark'} onClick={startMission} iconRight={ArrowRight}>Je me lance</Button>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Quiz d'orientation */}
      <section className="container-page pb-16 lg:pb-24" aria-label="Quiz : quelle mission est faite pour vous ?">
        <MissionQuiz onStartMission={startMission} />
      </section>

      {/* Comment ça marche */}
      <section className="bg-white py-16 lg:py-24" aria-labelledby="steps-title">
        <div className="container-page">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div className="max-w-2xl">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-500">Comment ça marche</p>
              <h2 id="steps-title" className="mt-3 text-3xl font-bold md:text-4xl">Cinq étapes, accompagnées par Playlife</h2>
            </div>
            <ButtonLink to="/comment-ca-marche" variant="ghost" iconRight={ArrowRight} className="self-start md:self-auto">En savoir plus</ButtonLink>
          </div>
          <ol className="relative mt-12 grid gap-8 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
            <div className="absolute left-[10%] right-[10%] top-7 hidden h-px bg-gradient-to-r from-brand-200 via-ink-200 to-brand-200 lg:block" aria-hidden="true" />
            {STEPS.map((step, index) => (
              <li key={step.title} className="relative">
                <span className="relative flex size-14 items-center justify-center rounded-2xl bg-surface-100 text-ink-900 ring-1 ring-ink-900/[0.06] lg:mx-auto">
                  <step.icon className="size-6" aria-hidden="true" />
                  <span className="absolute -right-2 -top-2 flex size-6 items-center justify-center rounded-full bg-brand-500 text-xs font-bold text-white ring-4 ring-white">{index + 1}</span>
                </span>
                <h3 className="mt-5 text-base font-semibold lg:text-center">{step.title}</h3>
                <p className="mt-1.5 text-sm text-gray-600 lg:text-center">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Missions récentes */}
      {(missions === null || missions.length > 0) && (
        <section className="container-page pt-16 lg:pt-24" aria-labelledby="recent-title">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-500">Sur le terrain</p>
              <h2 id="recent-title" className="mt-3 text-3xl font-bold md:text-4xl">Missions récentes</h2>
            </div>
            <Link to="/missions" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-600 hover:text-brand-700">
              Toutes les missions <ArrowRight className="size-4" aria-hidden="true" />
            </Link>
          </div>
          <div className="mt-10">
            {missions === null ? <CardGridSkeleton /> : (
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {missions.map(mission => <MissionCard key={mission.id} mission={mission} />)}
              </div>
            )}
          </div>
        </section>
      )}

      {showForm && <MissionForm onClose={() => setShowForm(false)} onSuccess={() => navigate('/dashboard')} />}
    </>
  );
}
