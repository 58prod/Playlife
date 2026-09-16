// Génère les scripts SQL d'import de l'annuaire des structures à partir du CSV exporté de Google Maps.
// Usage : node scripts/import-annuaire.mjs <fichier.csv>
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';

const input = process.argv[2];
if (!input) throw new Error('Usage : node scripts/import-annuaire.mjs <fichier.csv>');

const TYPES = {
    'Orphelinat / Foyer': ['Orphanage', "Children's home", 'Foster care service', 'Group home', 'Child care agency', 'Adoption agency', 'Shelter', 'Children hall', "Children's camp"],
    'Association / ONG': ['Non-profit organization', 'Non-governmental organization', 'Foundation', 'Charity', 'Association / Organization', 'Volunteer organization',
        'Social services organization', 'Social services', 'Youth organization', 'Youth social services organization', 'Community center', 'Mission', 'Religious organization',
        'Cultural association', 'Social welfare center', 'Family service center', 'Disability services and support organization', 'Homeless shelter', 'Homeless service',
        'Soup kitchen', 'Department of Social Services', 'Social worker', 'Low income housing program', 'Research foundation', 'Community health center'],
    'École / Éducation': ['Educational institution', 'Education center', 'School center', 'Nursery school', 'Kindergarten', 'Preschool', 'Learning center', 'Training center',
        'Vocational school', 'University', 'Adult education school', 'English language school', 'School house', 'School for the visually impaired', 'Head start center', 'Education'],
    'Lieu religieux': ['Church', 'Buddhist temple', 'Mosque', 'Monastery', 'Religious institution', 'Place of worship', 'Ashram', 'Catholic church', 'Greek Orthodox church',
        'Church of Christ', 'Hindu temple', 'Anglican church', 'Orthodox church', 'Chapel', 'Seventh-day Adventist church', 'Spiritist center', 'Meditation center', 'Religious destination'],
};
const TYPE_BY_CATEGORY = new Map(Object.entries(TYPES).flatMap(([type, cats]) => cats.map(c => [c, type])));

function parseCsv(text) {
    const rows = [];
    let row = [], field = '', quoted = false;
    for (let i = 0; i < text.length; i++) {
        const c = text[i];
        if (quoted) {
            if (c === '"' && text[i + 1] === '"') { field += '"'; i++; }
            else if (c === '"') quoted = false;
            else field += c;
        } else if (c === '"') quoted = true;
        else if (c === ';') { row.push(field); field = ''; }
        else if (c === '\n') { row.push(field.replace(/\r$/, '')); rows.push(row); row = []; field = ''; }
        else field += c;
    }
    if (field || row.length) { row.push(field); rows.push(row); }
    const [header, ...data] = rows.filter(r => r.length > 1);
    return data.map(r => Object.fromEntries(header.map((h, i) => [h.replace(/^﻿/, ''), (r[i] ?? '').trim()])));
}

const countryNames = new Intl.DisplayNames(['fr'], { type: 'region' });
// L'export Google Maps perd certains codes pays (« NA » pour la Namibie est lu comme une valeur vide)
const CODE_BY_COUNTRY = { Namibia: 'NA', Fiji: 'FJ' };
const ORPHANAGE_NAME = /orphan|orfanato|orfelinato|orfanat|orphelinat|waisenhaus|panti asuhan|สถานสงเคราะห์|baby home|home for (girls|boys|children)|maison d'enfants|pouponni|children'?s (home|village)|kids haven|foyer|hogar|abrigo|casa (de|do) (niñ|crian)|sos children/i;
const CHILD_NAME = /child|kid|enfant|niñ|crian|youth|jeunes|school|école|escuela|foundation|fondation|fundaci|charity|trust|ngo|ong|mission|care|aide|hope|espoir|village/i;
const PLUS_CODE = /^[23456789CFGHJMPQRVWX]{4,8}\+[23456789CFGHJMPQRVWX]{2,3}\b/i;

const sql = v => (v === null || v === undefined || v === '' ? 'NULL' : `'${String(v).replace(/'/g, "''")}'`);

const records = parseCsv(readFileSync(input, 'utf8')).map(r => {
    const code = (r.countryCode || CODE_BY_COUNTRY[r.country] || (/fiji/i.test(r.title) ? 'FJ' : '')).toUpperCase() || null;
    let type = TYPE_BY_CATEGORY.get(r.categories) ?? 'Autre';
    // Catégorie Google absente ou trompeuse : on se fie au nom de la structure
    if (type === 'Autre' || type === 'Association / ONG') {
        if (ORPHANAGE_NAME.test(r.title)) type = 'Orphelinat / Foyer';
        else if (type === 'Autre' && CHILD_NAME.test(r.title)) type = 'Association / ONG';
    }
    const placeId = new URL(r.url).searchParams.get('query_place_id');
    const street = PLUS_CODE.test(r.street) ? '' : r.street;
    let website = r.website;
    if (website && !/^https?:\/\//.test(website)) website = `https://${website}`;
    return {
        name: r.title.slice(0, 200),
        type,
        address: street,
        postal_code: r.postalCode,
        city: r.city && r.city !== 'Town' ? r.city : '',
        country: code ? countryNames.of(code) : r.country,
        country_code: code,
        contact_phone: r.phone,
        website_url: website,
        latitude: Number(r['location/lat']),
        longitude: Number(r['location/lng']),
        google_place_id: placeId,
        // Catégories hors sujet (zoo, hôtel, bar…) : à vérifier avant publication
        status: type === 'Autre' ? 'à valider playlife' : 'validée',
        source: 'annuaire-2026',
        origin_info: `Import annuaire Playlife — catégorie Google Maps : ${r.categories || 'non renseignée'}`,
    };
});

const columns = Object.keys(records[0]);
const CHUNK = 700;
mkdirSync('supabase/seed', { recursive: true });
const parts = Math.ceil(records.length / CHUNK);
for (let p = 0; p < parts; p++) {
    const slice = records.slice(p * CHUNK, (p + 1) * CHUNK);
    const values = slice.map(r => `(${columns.map(c => (typeof r[c] === 'number' ? r[c] : sql(r[c]))).join(', ')})`).join(',\n');
    const body = `-- Annuaire des structures Playlife — partie ${p + 1}/${parts} (${slice.length} structures)
-- À exécuter APRÈS la migration 20260916010000_annuaire_structures.sql
-- Ré-exécutable : les structures déjà importées (même google_place_id) sont mises à jour.
INSERT INTO public.structures (${columns.join(', ')})
VALUES
${values}
ON CONFLICT (google_place_id) WHERE google_place_id IS NOT NULL DO UPDATE SET
${columns.filter(c => !['google_place_id', 'status'].includes(c)).map(c => `    ${c} = EXCLUDED.${c}`).join(',\n')};
`;
    writeFileSync(`supabase/seed/annuaire-structures-${p + 1}.sql`, body);
}

const byType = {}; const byStatus = {};
for (const r of records) { byType[r.type] = (byType[r.type] ?? 0) + 1; byStatus[r.status] = (byStatus[r.status] ?? 0) + 1; }
console.log(`${records.length} structures, ${new Set(records.map(r => r.country_code)).size} pays, ${parts} fichier(s)`);
console.log(byType, byStatus);
console.log('sans code pays :', records.filter(r => !r.country_code).map(r => r.name));
