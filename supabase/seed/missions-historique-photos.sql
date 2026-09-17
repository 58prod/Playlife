-- ============================================================================
-- PLAYLIFE — VRAIES PHOTOS DES MISSIONS HISTORIQUES
-- ============================================================================
-- Photos publiées par Playlife sur playlife.today, remplaçant les illustrations.
-- À exécuter après missions-historique.sql. Ré-exécutable.
-- ============================================================================

-- Photos de couverture
UPDATE public.missions SET image_url = '/photos/missions/uruguay-rayito-del-sol-1.jpg' WHERE id = 'e51ae5b2-8c0a-5cbc-ac79-0ac733c61bc0';
UPDATE public.missions SET image_url = '/photos/missions/benin-adjara-1.jpg' WHERE id = '16ae9d50-d4ce-5fad-9434-80dd9349f0af';
UPDATE public.missions SET image_url = '/photos/missions/maroc-ait-idir-1.jpg' WHERE id = 'a95881f6-72be-5952-9e90-c845d78733eb';

-- Galeries photos
INSERT INTO public.mission_media (id, mission_id, media_url, media_type, caption, created_at)
VALUES
('142687bb-97aa-53ad-a8d6-eb086eca85c4', 'e51ae5b2-8c0a-5cbc-ac79-0ac733c61bc0', '/photos/missions/uruguay-rayito-del-sol-1.jpg', 'photo', 'Réception du matériel à la fondation Rayito del Sol', now() + interval '0 seconds'),
('0f8e0361-368f-549b-b552-9a7b0e4ae55a', 'e51ae5b2-8c0a-5cbc-ac79-0ac733c61bc0', '/photos/missions/uruguay-rayito-del-sol-2.jpg', 'photo', 'Découverte des ballons Playlife', now() + interval '1 seconds'),
('ce1c34ed-04a1-5a78-8d2f-44e9101ce42a', 'e51ae5b2-8c0a-5cbc-ac79-0ac733c61bc0', '/photos/missions/uruguay-rayito-del-sol-3.jpg', 'photo', 'Les jeunes de la fondation et leurs encadrants', now() + interval '2 seconds'),
('b6272997-6adf-5a67-bdad-b699acd012bc', 'e51ae5b2-8c0a-5cbc-ac79-0ac733c61bc0', '/photos/missions/uruguay-rayito-del-sol-4.jpg', 'photo', 'On gonfle les ballons !', now() + interval '3 seconds'),
('7b5ca767-918b-5a55-a419-857afbf26d0e', 'e51ae5b2-8c0a-5cbc-ac79-0ac733c61bc0', '/photos/missions/uruguay-colis-prepare.jpg', 'photo', 'Le colis préparé avant son départ pour l''Uruguay', now() + interval '4 seconds'),
('4e1cae77-7354-5c36-94c4-e63979b4640b', '16ae9d50-d4ce-5fad-9434-80dd9349f0af', '/photos/missions/benin-adjara-1.jpg', 'photo', 'Remise du pack à l''orphelinat d''Adjara', now() + interval '5 seconds'),
('020e26ec-d8c1-5544-94f3-a5e8b69cd5aa', '16ae9d50-d4ce-5fad-9434-80dd9349f0af', '/photos/missions/teyran-eleves-playlife-school.jpg', 'photo', 'Les élèves de l''école de Teyran, qui ont préparé le pack', now() + interval '6 seconds'),
('88e4b681-d5a9-5470-b9f7-6c33714a7078', 'a95881f6-72be-5952-9e90-c845d78733eb', '/photos/missions/maroc-ait-idir-1.jpg', 'photo', 'Les enfants de l''école d''Aït Idir avec leur matériel', now() + interval '7 seconds'),
('e138498a-5f66-5882-b1e0-a2d724a452cb', 'a95881f6-72be-5952-9e90-c845d78733eb', '/photos/missions/teyran-eleves-playlife-school.jpg', 'photo', 'Les élèves de l''école de Teyran, qui ont préparé le colis', now() + interval '8 seconds')
ON CONFLICT (id) DO UPDATE SET media_url = EXCLUDED.media_url, caption = EXCLUDED.caption;

SELECT m.title, count(mm.id) AS photos
FROM public.missions m LEFT JOIN public.mission_media mm ON mm.mission_id = m.id
WHERE m.id IN ('e51ae5b2-8c0a-5cbc-ac79-0ac733c61bc0', '16ae9d50-d4ce-5fad-9434-80dd9349f0af', 'a95881f6-72be-5952-9e90-c845d78733eb')
GROUP BY m.title;
