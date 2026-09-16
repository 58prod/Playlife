import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet/dist/leaflet.css';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import './StructuresMap.css';
import { countryLabel, hasCoordinates } from '@/lib/structures';
import type { Structure } from '@/types/database.types';

interface StructuresMapProps {
    structures: Structure[];
    selectedId: string | null;
    onSelect: (id: string) => void;
    /** Positions exactes (membre connecté) : autorise un zoom plus fin */
    precise?: boolean;
    className?: string;
}

const escapeHtml = (value: string) =>
    value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

const markerIcon = (selected: boolean) =>
    L.divIcon({ className: '', html: `<div class="playlife-marker${selected ? ' is-selected' : ''}"></div>`, iconSize: [14, 14], iconAnchor: [7, 7], popupAnchor: [0, -8] });

const WORLD_BOUNDS = L.latLngBounds([-40, -100], [55, 140]);

/** Carte Leaflet avec regroupement des points. Chargée à la demande (bibliothèque ~50 Ko). */
export default function StructuresMap({ structures, selectedId, onSelect, precise = false, className }: StructuresMapProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const mapRef = useRef<L.Map | null>(null);
    const clusterRef = useRef<L.MarkerClusterGroup | null>(null);
    const markersRef = useRef(new Map<string, L.Marker>());
    const previousSelected = useRef<string | null>(null);
    const onSelectRef = useRef(onSelect);
    onSelectRef.current = onSelect;

    // Création de la carte
    useEffect(() => {
        if (!containerRef.current) return;
        const map = L.map(containerRef.current, {
            zoomControl: false,
            worldCopyJump: true,
            minZoom: 2,
            maxZoom: 16,
            maxBounds: [[-85, -Infinity], [85, Infinity]],
        }).fitBounds(WORLD_BOUNDS);

        L.control.zoom({ position: 'bottomright', zoomInTitle: 'Zoomer', zoomOutTitle: 'Dézoomer' }).addTo(map);
        map.attributionControl.setPrefix(false);
        // Fond de carte Esri « Light Gray Canvas » : sobre, gratuit, sans clé d'API
        const esri = 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas';
        L.tileLayer(`${esri}/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}`, {
            attribution: 'Fond de carte © <a href="https://www.esri.com" target="_blank" rel="noopener">Esri</a>, HERE, Garmin, © OpenStreetMap',
            maxZoom: 16,
        }).addTo(map);
        L.tileLayer(`${esri}/World_Light_Gray_Reference/MapServer/tile/{z}/{y}/{x}`, { maxZoom: 16, pane: 'shadowPane' }).addTo(map);

        const cluster = L.markerClusterGroup({
            chunkedLoading: true,
            showCoverageOnHover: false,
            spiderfyOnMaxZoom: true,
            maxClusterRadius: 50,
            iconCreateFunction: c => {
                const count = c.getChildCount();
                const size = count < 10 ? 32 : count < 100 ? 40 : 50;
                return L.divIcon({ className: '', html: `<div class="playlife-cluster" style="width:${size}px;height:${size}px">${count}</div>`, iconSize: [size, size] });
            },
        });
        map.addLayer(cluster);

        mapRef.current = map;
        clusterRef.current = cluster;
        // La carte peut être créée masquée (vue « Liste » sur mobile) : on recadre à son affichage
        let wasHidden = containerRef.current.clientWidth === 0;
        const observer = new ResizeObserver(entries => {
            const hidden = entries[0].contentRect.width === 0;
            map.invalidateSize();
            if (wasHidden && !hidden) {
                const bounds = cluster.getBounds();
                if (bounds.isValid()) map.fitBounds(bounds, { padding: [40, 40], maxZoom: 12 });
            }
            wasHidden = hidden;
        });
        observer.observe(containerRef.current);
        return () => {
            observer.disconnect();
            map.remove();
            mapRef.current = null;
            clusterRef.current = null;
        };
    }, []);

    // Positions arrondies (~10 km) pour les visiteurs : inutile de zoomer plus près que la ville
    useEffect(() => {
        const map = mapRef.current;
        if (!map) return;
        map.setMaxZoom(precise ? 16 : 11);
        if (map.getZoom() > map.getMaxZoom()) map.setZoom(map.getMaxZoom());
    }, [precise]);

    // Mise à jour des points quand la liste filtrée change
    useEffect(() => {
        const map = mapRef.current;
        const cluster = clusterRef.current;
        if (!map || !cluster) return;

        cluster.clearLayers();
        markersRef.current.clear();
        const markers = structures.filter(hasCoordinates).map(structure => {
            const place = [structure.city, countryLabel(structure)].filter(Boolean).join(', ');
            const marker = L.marker([structure.latitude, structure.longitude], { icon: markerIcon(structure.id === previousSelected.current), title: structure.name, keyboard: true })
                .bindPopup(`<strong>${escapeHtml(structure.name)}</strong>${escapeHtml(place)}${structure.type ? `<br><span style="color:var(--color-brand-600)">${escapeHtml(structure.type)}</span>` : ''}`, { closeButton: true, autoPanPadding: [40, 40] })
                .on('click', () => onSelectRef.current(structure.id));
            markersRef.current.set(structure.id, marker);
            return marker;
        });
        cluster.addLayers(markers);

        if (markers.length > 0 && map.getSize().x > 0) {
            const bounds = cluster.getBounds();
            map.flyToBounds(bounds.isValid() ? bounds : WORLD_BOUNDS, { padding: [40, 40], maxZoom: 11, duration: 0.6 });
        }
    }, [structures]);

    // Mise en évidence et centrage de la structure sélectionnée
    useEffect(() => {
        const cluster = clusterRef.current;
        const previous = previousSelected.current && markersRef.current.get(previousSelected.current);
        if (previous) previous.setIcon(markerIcon(false));
        previousSelected.current = selectedId;
        if (!selectedId || !cluster) return;
        const marker = markersRef.current.get(selectedId);
        if (!marker) return;
        marker.setIcon(markerIcon(true));
        cluster.zoomToShowLayer(marker, () => marker.openPopup());
    }, [selectedId]);

    return <div ref={containerRef} className={`playlife-map ${className ?? ''}`} role="region" aria-label="Carte des structures" />;
}
