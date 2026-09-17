-- ============================================================================
-- PLAYLIFE — HISTORIQUE DES MISSIONS RÉALISÉES (2018 → 2026)
-- ============================================================================
-- 13 missions terminées, reconstituées à partir de playlife.today et du compte
-- Instagram @playlife.today, plus la mission au Mercy Centre de Bangkok (Thaïlande, janvier 2026).
-- Pas de dates de départ/retour (non affichées) ; created_at approximatif pour l'ordre.
-- Photos : illustrations Unsplash (mention « Photo d'illustration » sur le site).
-- Ré-exécutable : identifiants fixes, mise à jour si la mission existe déjà.
-- ============================================================================

INSERT INTO public.missions (id, title, description, country, city, mission_type, status, visible, image_url, created_at, created_by)
VALUES
('891e638d-5362-56f9-ae64-ad24fcc46c8a', 'Un pack Playlife pour le Mercy Centre de Bangkok', 'Un voyageur solidaire a remis un pack Playlife au Mercy Centre, à Bangkok. Fondé en 1972 par le père Joe Maier et sœur Maria dans Klong Toey, le plus grand bidonville de la ville, le centre accueille des enfants vulnérables dans ses foyers et ses écoles maternelles. Ballons, chasubles et plots : de quoi faire du sport un moment de joie et de partage au quotidien.

En savoir plus : mercycentre.org', 'Thaïlande', 'Bangkok', 'voyageur', 'completed', true, '/illustrations/missions/thailande.jpg', '2026-01-20T12:00:00Z', 'b31ac163-18fc-4165-9306-bdd3759aa5d6'),
('82dfa0ea-403f-5ed0-8fea-53e6a7b4844a', 'Football féminin au centre CASA de Lomé', 'Une bénévole Playlife a remis des ballons et des chasubles (Playlife et Uhlsport) au centre CASA de Lomé, qui accompagne des jeunes filles en réinsertion sociale. La remise s''est terminée par un match de football.', 'Togo', 'Lomé', 'voyageur', 'completed', true, '/illustrations/missions/togo-lome.jpg', '2022-12-06T12:00:00Z', 'b31ac163-18fc-4165-9306-bdd3759aa5d6'),
('c0424918-58cb-5738-8729-fc45d6628408', 'Mission multisport à Casablanca', 'Une mission menée par des membres fondateurs de Playlife dans plusieurs établissements de Casablanca : l''institut Tahar Sebti, l''école primaire Oqba Ibn Nafee, le collège Haman Fatwaki et le dojo Derb Ghalef.

Au programme : raquettes de tennis, équipement de karaté, mini-buts, ballons, chasubles et paniers de basket, avec des initiations au mini-tennis et au karaté.', 'Maroc', 'Casablanca', 'voyageur', 'completed', true, '/illustrations/missions/maroc-casablanca.jpg', '2022-10-13T12:00:00Z', 'b31ac163-18fc-4165-9306-bdd3759aa5d6'),
('8e1f7ba8-83c9-5409-811b-4219ea9d2856', 'Des ballons de basket pour Barrio Carrangan', 'Dans le sud des Philippines, des enfants recueillis par une habitante du quartier de Carrangan ont reçu des ballons de basket Adidas, grâce au soutien de l''ambassadeur Nando De Colo. Premier essai : un panier de fortune accroché à un arbre !', 'Philippines', 'Ozamiz City', 'voyageur', 'completed', true, '/illustrations/missions/philippines-carrangan.jpg', '2022-07-25T12:00:00Z', 'b31ac163-18fc-4165-9306-bdd3759aa5d6'),
('32b4a9a1-4fc1-57d3-a69b-b2ee98d64202', 'Un pack football pour la Renaissance Sport Académie', 'Un pack football complet a été préparé puis expédié jusqu''à Doumé, dans l''est du Cameroun, pour les jeunes joueurs du club local Renaissance Sport Académie, qui ont partagé les photos de la réception.', 'Cameroun', 'Doumé', NULL, 'completed', true, '/illustrations/missions/cameroun-doume.jpg', '2022-03-19T12:00:00Z', 'b31ac163-18fc-4165-9306-bdd3759aa5d6'),
('cbcb956b-5241-5e2d-ba73-4f1e2c175f15', 'Tournoi multisport à l''école El Hadj Ibrahima Beye', 'Avec l''association Xaleyi, un tournoi multisport a réuni les élèves de l''école El Hadj Ibrahima Beye, au Sénégal. Les participants ont été récompensés par des sacs offerts par Adidas, grâce à l''ambassadeur Nando De Colo.', 'Sénégal', NULL, NULL, 'completed', true, '/illustrations/missions/senegal.jpg', '2022-03-18T12:00:00Z', 'b31ac163-18fc-4165-9306-bdd3759aa5d6'),
('29242954-fc3b-504a-941f-f5935afd6d72', 'Río San Juan, à la télévision locale', 'De passage en République dominicaine, l''artiste peintre français Thibault Laget-Ro a remis un pack Playlife aux enfants de la municipalité de Río San Juan. Une remise saluée par la télévision locale.', 'République dominicaine', 'Río San Juan', 'voyageur', 'completed', true, '/illustrations/missions/republique-dominicaine.jpg', '2019-07-15T12:00:00Z', 'b31ac163-18fc-4165-9306-bdd3759aa5d6'),
('16ae9d50-d4ce-5fad-9434-80dd9349f0af', 'Un pack pour l''orphelinat d''Adjara', 'Avec le programme PlayLife School, les élèves de l''école élémentaire de Teyran, près de Montpellier, ont constitué un pack de matériel sportif pour les enfants de l''orphelinat d''Adjara, au Bénin : une mission imaginée par des enfants, pour d''autres enfants.', 'Bénin', 'Adjara', 'animateur', 'completed', true, '/illustrations/missions/benin-adjara.jpg', '2019-06-20T12:00:00Z', 'b31ac163-18fc-4165-9306-bdd3759aa5d6'),
('a95881f6-72be-5952-9e90-c845d78733eb', 'L''école d''Aït Idir, dans l''Atlas', 'Avec le programme PlayLife School, les élèves de l''école élémentaire de Teyran ont préparé un colis de matériel sportif pour les enfants de l''école d''Aït Idir, un village de l''Atlas marocain.', 'Maroc', 'Aït Idir', 'animateur', 'completed', true, '/illustrations/missions/maroc-ait-idir.jpg', '2019-06-15T12:00:00Z', 'b31ac163-18fc-4165-9306-bdd3759aa5d6'),
('5cde7ea4-8942-54c1-8c4e-f4db7fbc530b', 'Un centre de réhabilitation à Ozamiz', 'Des ballons et du matériel sportif ont été remis, grâce à la famille d''Alphonse Areola, à un centre de réhabilitation d''Ozamiz City, sur l''île de Mindanao : le sport comme outil de reconstruction.', 'Philippines', 'Ozamiz City', 'voyageur', 'completed', true, '/illustrations/missions/philippines-ozamiz.jpg', '2019-05-20T12:00:00Z', 'b31ac163-18fc-4165-9306-bdd3759aa5d6'),
('d2a7c64d-3e84-5967-8f92-6f2aadeeb750', 'Du sport pour les enfants de Manille', 'Deux remises de matériel dans la capitale philippine, grâce à la famille d''Alphonse Areola : au collège Doña Teodora Alonzo, et auprès des enfants de Smokey Mountain, l''un des quartiers les plus défavorisés de Manille.', 'Philippines', 'Manille', 'voyageur', 'completed', true, '/illustrations/missions/philippines-manille.jpg', '2019-05-15T12:00:00Z', 'b31ac163-18fc-4165-9306-bdd3759aa5d6'),
('e51ae5b2-8c0a-5cbc-ac79-0ac733c61bc0', 'Un rayon de soleil pour Rayito del Sol', 'Premier colis Playlife en Amérique du Sud, pour la fondation Rayito del Sol à San José, à une centaine de kilomètres de Montevideo. Ce centre accueille des adolescents en situation de handicap mental, pour qui le sport est une source de progrès et de joie.', 'Uruguay', 'San José', NULL, 'completed', true, '/illustrations/missions/uruguay-san-jose.jpg', '2019-01-24T12:00:00Z', 'b31ac163-18fc-4165-9306-bdd3759aa5d6'),
('23b5a0c4-1ba0-55e0-8270-a233e718132e', 'Premier envoi : le Pangasinan United FC', 'Le tout premier envoi de l''association : des ballons et des chasubles, fournis par l''équipementier Uhlsport, ont rejoint les Philippines, pays d''origine du parrain Alphonse Areola. Ils ont été remis par sa famille aux jeunes joueurs du Pangasinan United Football Club.', 'Philippines', 'Pangasinan', NULL, 'completed', true, '/illustrations/missions/philippines-pangasinan.jpg', '2019-01-15T12:00:00Z', 'b31ac163-18fc-4165-9306-bdd3759aa5d6')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    country = EXCLUDED.country,
    city = EXCLUDED.city,
    mission_type = EXCLUDED.mission_type,
    status = EXCLUDED.status,
    visible = EXCLUDED.visible,
    image_url = EXCLUDED.image_url,
    created_at = EXCLUDED.created_at;

SELECT count(*) AS missions_historiques FROM public.missions WHERE image_url LIKE '/illustrations/%';
