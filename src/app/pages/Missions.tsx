import { useCallback, useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { AlertCircle, Calendar, CheckCircle, CheckCircle2, ExternalLink, Globe, Heart, MapPin, Plus, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { errorMessage } from '@/lib/errors';
import { formatDateRange, missionLocation } from '@/lib/format';
import { fetchPhotosByMission } from '@/lib/missions';
import type { Mission, MissionMedia } from '@/types/database.types';
import { MissionForm } from '../components/MissionForm';
import { MissionTypeBadge } from '../components/MissionBadges';
import { PageLoader } from '../components/PageLoader';
import { PhotoSlideshowModal } from '../components/PhotoSlideshowModal';
import { PhotoStrip } from '../components/PhotoStrip';

type Slideshow = { photos: MissionMedia[]; title: string };

export default function Missions() {
    const [searchParams, setSearchParams] = useSearchParams();
    const { user } = useAuth();
    const [missions, setMissions] = useState<Mission[]>([]);
    const [photosByMission, setPhotosByMission] = useState<Record<string, MissionMedia[]>>({});
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [slideshow, setSlideshow] = useState<Slideshow | null>(null);

    const fetchMissions = useCallback(async () => {
        setError(null);
        try {
            const { data, error: fetchError } = await supabase
                .from('missions')
                .select('*')
                .eq('visible', true)
                .order('created_at', { ascending: false });
            if (fetchError) throw fetchError;
            setMissions(data);
            setPhotosByMission(await fetchPhotosByMission(data.filter(m => m.status === 'completed').map(m => m.id)));
        } catch (err) {
            setError(errorMessage(err, 'Erreur lors du chargement des missions.'));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchMissions(); }, [fetchMissions]);

    // Ouverture automatique du formulaire après connexion (?create=true)
    useEffect(() => {
        if (searchParams.get('create') === 'true' && user) {
            setIsFormOpen(true);
            setSearchParams({}, { replace: true });
        }
    }, [searchParams, user, setSearchParams]);

    const active = missions.filter(m => m.status !== 'completed');
    const completed = missions.filter(m => m.status === 'completed');

    return (
        <div className="px-4 md:px-8 py-4 md:py-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <h1 className="text-3xl md:text-4xl font-extrabold text-[#22081c] tracking-tight">Missions</h1>
                    <p className="text-gray-500 mt-2 md:text-lg">Découvrez les missions solidaires en cours et terminées.</p>
                </div>
                {user ? (
                    <button type="button" onClick={() => setIsFormOpen(true)} className="flex items-center justify-center gap-2 bg-[#e6244d] text-white px-8 py-4 rounded-2xl font-bold hover:bg-[#c91d41] transition-all shadow-xl shadow-[#e6244d]/25 active:scale-95">
                        <Plus className="w-6 h-6" aria-hidden="true" />
                        Créer une mission
                    </button>
                ) : (
                    <Link to="/login?create=true" className="flex items-center justify-center gap-2 bg-[#e6244d] text-white px-8 py-4 rounded-2xl font-bold hover:bg-[#c91d41] transition-all shadow-xl shadow-[#e6244d]/25">
                        <Plus className="w-6 h-6" aria-hidden="true" />
                        Créer une mission
                    </Link>
                )}
            </div>

            {error && (
                <div className="mb-10 p-6 bg-red-50 border border-red-100 rounded-3xl flex flex-col sm:flex-row sm:items-center gap-4 text-red-600" role="alert">
                    <AlertCircle className="w-6 h-6 flex-shrink-0" aria-hidden="true" />
                    <div className="flex-1">
                        <p className="font-bold">Oups ! Une erreur est survenue</p>
                        <p className="text-sm opacity-90">{error}</p>
                    </div>
                    <button type="button" onClick={() => { setLoading(true); fetchMissions(); }} className="bg-red-600 text-white px-4 py-2 rounded-xl text-sm font-bold hover:bg-red-700 transition-colors">
                        Réessayer
                    </button>
                </div>
            )}

            {loading ? (
                <PageLoader label="Chargement des missions…" />
            ) : missions.length > 0 ? (
                <div className="space-y-12">
                    {active.length > 0 && (
                        <section aria-labelledby="active-heading">
                            <h2 id="active-heading" className="text-xl font-bold text-[#22081c] mb-6 flex items-center gap-2">
                                <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" aria-hidden="true"></span>
                                Missions en cours <span className="text-base font-normal text-gray-400">({active.length})</span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                                {active.map(mission => <MissionCard key={mission.id} mission={mission} photos={[]} onOpenSlideshow={setSlideshow} />)}
                            </div>
                        </section>
                    )}
                    {completed.length > 0 && (
                        <section aria-labelledby="completed-heading">
                            <h2 id="completed-heading" className="text-xl font-bold text-[#22081c] mb-6 flex items-center gap-2">
                                <CheckCircle className="w-5 h-5 text-green-500" aria-hidden="true" />
                                Missions terminées <span className="text-base font-normal text-gray-400">({completed.length})</span>
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
                                {completed.map(mission => (
                                    <MissionCard key={mission.id} mission={mission} photos={photosByMission[mission.id] ?? []} onOpenSlideshow={setSlideshow} />
                                ))}
                            </div>
                        </section>
                    )}
                </div>
            ) : !error && (
                <div className="bg-white p-10 md:p-20 rounded-[40px] shadow-sm border border-gray-100 text-center max-w-2xl mx-auto mt-12">
                    <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <Users className="w-10 h-10 text-gray-300" aria-hidden="true" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#22081c] mb-2">Aucune mission pour le moment</h2>
                    <p className="text-gray-500 mb-8 max-w-md mx-auto">Soyez le premier à lancer une mission solidaire !</p>
                    {user ? (
                        <button type="button" onClick={() => setIsFormOpen(true)} className="bg-[#e6244d] text-white px-8 py-3 rounded-2xl font-bold hover:bg-[#c91d41] transition-all">
                            Créer la première mission
                        </button>
                    ) : (
                        <Link to="/register?create=true" className="text-[#e6244d] font-bold hover:underline">Inscrivez-vous pour créer une mission</Link>
                    )}
                </div>
            )}

            <FundraisingTips />

            {isFormOpen && <MissionForm onClose={() => setIsFormOpen(false)} onSuccess={fetchMissions} />}
            {slideshow && <PhotoSlideshowModal photos={slideshow.photos} title={slideshow.title} onClose={() => setSlideshow(null)} />}
        </div>
    );
}

function MissionCard({ mission, photos, onOpenSlideshow }: { mission: Mission; photos: MissionMedia[]; onOpenSlideshow: (s: Slideshow) => void }) {
    return (
        <article className="group bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-2xl hover:shadow-[#e6244d]/10 transition-all duration-300 flex flex-col hover:-translate-y-1">
            <div className="h-56 relative overflow-hidden bg-gray-50 flex items-center justify-center">
                {mission.image_url ? (
                    <img src={mission.image_url} alt="" loading="lazy" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                ) : (
                    <Globe className="w-12 h-12 text-gray-200" aria-hidden="true" />
                )}
                <MissionTypeBadge type={mission.mission_type} className="absolute top-4 left-4" />
                {mission.status === 'completed' && (
                    <span className="absolute top-4 right-4 h-7 px-3 bg-white/95 rounded-full flex items-center shadow-sm text-xs font-bold text-green-700">Terminée</span>
                )}
            </div>

            <div className="p-6 flex-1 flex flex-col">
                <h3 className="text-xl md:text-2xl font-bold text-[#22081c] mb-3 group-hover:text-[#e6244d] transition-colors break-words">{mission.title}</h3>
                <p className="text-gray-500 text-sm line-clamp-3 mb-4 flex-1 whitespace-pre-line">{mission.description}</p>

                <div className="space-y-3 pt-4 border-t border-gray-50">
                    <div className="flex items-center gap-2 text-sm text-gray-500 font-medium">
                        <MapPin className="w-4 h-4 text-[#e6244d] shrink-0" aria-hidden="true" />
                        <span>{missionLocation(mission)}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-600 font-medium">
                        <Calendar className="w-4 h-4 text-[#e6244d] shrink-0" aria-hidden="true" />
                        {formatDateRange(mission.start_date, mission.end_date)}
                    </div>
                    {mission.fundraising_url && mission.status !== 'completed' && (
                        <a href={mission.fundraising_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-[#e6244d] font-bold hover:text-[#c91d41] transition-colors bg-pink-50 px-3 py-2 rounded-xl hover:bg-pink-100">
                            <Heart className="w-4 h-4" aria-hidden="true" />
                            <span>Soutenir cette mission</span>
                            <ExternalLink className="w-3.5 h-3.5" aria-hidden="true" />
                        </a>
                    )}
                    <PhotoStrip photos={photos} missionTitle={mission.title} onOpen={() => onOpenSlideshow({ photos, title: mission.title })} />
                </div>
            </div>
        </article>
    );
}

function FundraisingTips() {
    return (
        <section className="mt-16 bg-gradient-to-br from-pink-50 to-white border border-pink-100 rounded-[2.5rem] p-6 md:p-10 shadow-sm" aria-labelledby="tips-heading">
            <div className="flex items-start gap-4 mb-6">
                <div className="w-12 h-12 bg-[#e6244d] rounded-2xl flex items-center justify-center flex-shrink-0">
                    <Heart className="w-6 h-6 text-white" aria-hidden="true" />
                </div>
                <div>
                    <h2 id="tips-heading" className="text-2xl font-bold text-[#22081c] mb-2">Conseils pour récolter des dons</h2>
                    <p className="text-gray-600">Maximisez l'impact de votre mission en suivant ces recommandations</p>
                </div>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-start gap-3">
                    <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <Users className="w-4 h-4 text-[#e6244d]" aria-hidden="true" />
                    </div>
                    <div>
                        <h3 className="font-bold text-[#22081c] mb-2">Communiquez largement</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Partagez l'adresse de votre cagnotte à vos proches (famille & amis), à votre entourage professionnel, sportif, associatif… Plus vous communiquez, plus vous augmentez vos chances de réussite !
                        </p>
                    </div>
                </div>
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-start gap-3">
                    <div className="w-8 h-8 bg-pink-100 rounded-lg flex items-center justify-center flex-shrink-0 mt-1">
                        <CheckCircle2 className="w-4 h-4 text-[#e6244d]" aria-hidden="true" />
                    </div>
                    <div>
                        <h3 className="font-bold text-[#22081c] mb-2">Avantage fiscal</h3>
                        <p className="text-sm text-gray-600 leading-relaxed">
                            Précisez que la plateforme partenaire (<a href="https://www.leetchi.com" target="_blank" rel="noopener noreferrer" className="text-[#e6244d] underline hover:text-[#c91d41]">leetchi.com</a>) permet de recevoir un reçu de don ouvrant droit à un <strong>crédit d'impôt de 66 %</strong> de la valeur du don (<strong>60 % pour les entreprises</strong>).
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
