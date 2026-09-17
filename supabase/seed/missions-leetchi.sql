-- ============================================================================
-- PLAYLIFE — MISSIONS EN COURS ISSUES DE L'ESPACE PLAYLIFE SUR LEETCHI.ORG
-- ============================================================================
-- Remplace les deux missions de test (« azert » et « Essai ») par les collectes
-- présentées sur https://www.leetchi.org/project/playlife. Ré-exécutable.
-- ============================================================================

-- « azert » → 10 missions Playlife dans des classes ULIS
UPDATE public.missions SET
    title = '10 missions Playlife dans des classes ULIS — deux fois la joie',
    description = E'Une mission Playlife, c''est un pack de matériel sportif qui part vers des enfants qui n''y ont pas accès. Mais avant d''arriver là-bas, il est préparé ici, par des enfants de classes ULIS qui trient, emballent et s''engagent.\n\nDeux fois la magie : celle de donner, et celle de recevoir.\n\nVos dons financent 10 de ces missions. 10 classes qui agissent. 10 destinations qui sourient. Objectif de la collecte : 2 500 €.',
    mission_type = 'animateur',
    country = 'France',
    city = NULL,
    location = NULL,
    start_date = NULL,
    end_date = NULL,
    status = 'active',
    visible = true,
    fundraising_url = 'https://www.leetchi.org/fundraisers/christophe-grassi',
    image_url = '/illustrations/missions/classes-ulis.jpg'
WHERE id = '8a6bd47e-7bde-40ad-9bf9-fa316fd71a3c';

-- « Essai » → Cagnotte générale Playlife
UPDATE public.missions SET
    title = 'Cagnotte générale : des missions à la demande des structures',
    description = E'Un ballon, un maillot ou quelques équipements peuvent parfois changer bien plus qu''un match.\n\nGrâce à votre soutien, Playlife permet à des enfants et des communautés de vivre des moments de joie, de partage et d''inclusion à travers le sport.\n\nCette cagnotte permet de financer les missions demandées directement à Playlife par des structures qui accueillent des enfants. Objectif de la collecte : 2 000 €.\n\nMerci de rendre ces missions possibles.',
    mission_type = NULL,
    country = 'Partout dans le monde',
    city = NULL,
    location = NULL,
    start_date = NULL,
    end_date = NULL,
    status = 'active',
    visible = true,
    fundraising_url = 'https://www.leetchi.org/fundraisers/christophe-grassi-2',
    image_url = '/illustrations/missions/cagnotte-generale.jpg'
WHERE id = 'ef3ff9b0-155c-43b8-a663-a030b0e05c06';

SELECT title, country, status, visible, fundraising_url FROM public.missions
WHERE id IN ('8a6bd47e-7bde-40ad-9bf9-fa316fd71a3c', 'ef3ff9b0-155c-43b8-a663-a030b0e05c06');
