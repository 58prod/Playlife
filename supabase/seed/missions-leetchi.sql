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

-- « Essai » → Solidarité pour le Congo et la Palestine
UPDATE public.missions SET
    title = 'Solidarité pour le Congo et la Palestine',
    description = E'Une collecte lancée par Sandra pour soutenir les actions de Playlife auprès des enfants du Congo et de Palestine.\n\n« Votre don, qu''il soit petit ou grand, contribuera directement à soutenir ses actions. Chaque geste compte et participe à construire un avenir plus solidaire et plus juste. »\n\nN''hésitez pas à partager cette collecte autour de vous pour amplifier son impact. Objectif de la collecte : 20 000 €.',
    mission_type = NULL,
    country = 'Congo et Palestine',
    city = NULL,
    location = NULL,
    start_date = NULL,
    end_date = NULL,
    status = 'active',
    visible = true,
    fundraising_url = 'https://www.leetchi.org/fundraisers/sandra-yahiaoui',
    image_url = '/illustrations/missions/congo-palestine.jpg'
WHERE id = 'ef3ff9b0-155c-43b8-a663-a030b0e05c06';

SELECT title, country, status, visible, fundraising_url FROM public.missions
WHERE id IN ('8a6bd47e-7bde-40ad-9bf9-fa316fd71a3c', 'ef3ff9b0-155c-43b8-a663-a030b0e05c06');
