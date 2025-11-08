import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { HealthUnit } from "@/types/health-units";
import { healthUnits } from "@/data/health-units-mock";
import LogoCoracao from "@/assets/LogoCoracao.svg";
import {
  AlertTriangle,
  CheckCircle,
  Plus,
  X,
  Package,
  Users
} from "lucide-react";
import SidebarMap from "./SidebarMap";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const HealthMap = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Marker[]>([]);
  
  const [selectedUnit, setSelectedUnit] = useState<HealthUnit | null>(null);
  const [medicationSearch, setMedicationSearch] = useState("");
  const [filteredUnits, setFilteredUnits] = useState<HealthUnit[]>(healthUnits);
  const [medicationSearchCount, setMedicationSearchCount] = useState<number>(0);
  const [unitViewers, setUnitViewers] = useState<Record<string, number>>({});
  const navigate = useNavigate();

  const createCustomIcon = (status: string, isUCAF: boolean = false) => {
    if (isUCAF) {
      return L.divIcon({
        html: `
          <div style="
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            width: 45px;
            height: 45px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: white;
            font-weight: bold;
            font-size: 20px;
            border: 4px solid white;
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.5), 0 0 0 8px rgba(99, 102, 241, 0.1);
            animation: pulse 2s infinite;
          ">
            ⚕️
          </div>
          <style>
            @keyframes pulse {
              0%, 100% { transform: scale(1); }
              50% { transform: scale(1.1); }
            }
          </style>
        `,
        className: 'custom-div-icon ucaf-icon',
        iconSize: [45, 45],
        iconAnchor: [22.5, 22.5]
      });
    }

  
    
    return L.divIcon({
      html: `
        <div style="
          background: black,
          width: 30px;
          height: 30px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 14px;
          border: 3px solid white;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3);
        ">
          <img
            src="${LogoCoracao}"
            alt={"Pin Health Status"}
            style="width: 35px; height: 35px;"
          />
        </div>
      `,
      className: 'custom-div-icon',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
  };

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;

    mapInstanceRef.current = L.map(mapRef.current).setView([-22.2144, -49.9463], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(mapInstanceRef.current);

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!mapInstanceRef.current) return;

    markersRef.current.forEach(marker => {
      mapInstanceRef.current?.removeLayer(marker);
    });
    markersRef.current = [];

    filteredUnits.forEach(unit => {
      const isUCAF = unit.type === 'UCAF';
      const marker = L.marker(unit.coordinates, {
        icon: createCustomIcon(unit.status, isUCAF)
      });

      const popupContent = `
        <div style="padding: 8px;">
          <h3 style="font-weight: bold; font-size: 14px; margin: 0 0 4px 0;">${unit.name}</h3>
          <p style="font-size: 12px; color: #666; margin: 0;">${unit.address}</p>
        </div>
      `;

      marker.bindPopup(popupContent);
      marker.on('click', () => {
        setSelectedUnit(unit);
        if (mapInstanceRef.current) {
          mapInstanceRef.current.setView(unit.coordinates, 17, { 
            animate: true,
            duration: 0.8
          });
        }
      });

      marker.addTo(mapInstanceRef.current!);
      markersRef.current.push(marker);
    });
  }, [filteredUnits]);

  useEffect(() => {
    let filtered = healthUnits;
    
    if (medicationSearch) {
      filtered = filtered.filter(unit =>
        unit.medications.some(med => 
          med.name.toLowerCase().includes(medicationSearch.toLowerCase()) && 
          med.quantity > 0
        )
      );
      setMedicationSearchCount(Math.floor(Math.random() * 50) + 10);
    } else {
      setMedicationSearchCount(0);
    }
    
    setFilteredUnits(filtered);
  }, [medicationSearch]);

  useEffect(() => {
    const viewers: Record<string, number> = {};
    healthUnits.forEach(unit => {
      viewers[unit.id] = Math.floor(Math.random() * 8) + 2;
    });
    setUnitViewers(viewers);

    const interval = setInterval(() => {
      const newViewers: Record<string, number> = {};
      healthUnits.forEach(unit => {
        const change = Math.floor(Math.random() * 3) - 1;
        newViewers[unit.id] = Math.max(1, (viewers[unit.id] || 5) + change);
      });
      setUnitViewers(newViewers);
    }, 5000);

    return () => clearInterval(interval);
  }, []);



  return (
    <div className="h-screen flex flex-col">
      <div className="flex-1 relative flex flex-col md:flex-row">

        {selectedUnit && ( <SidebarMap
          selectedUnit={selectedUnit}
          mapInstanceRef={mapInstanceRef}
          setSelectedUnit={setSelectedUnit}
          unitViewers={unitViewers}
        /> )}

        {!selectedUnit && (
          <div className="absolute top-4 left-0 right-0 mx-auto z-[1000] w-[90%] md:w-1/2 lg:w-2/5">
            <div className="flex flex-col md:flex-row gap-3">
              <div className="flex-1 relative">
                <Package className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  placeholder="Buscar medicação disponível..."
                  value={medicationSearch}
                  onChange={(e) => setMedicationSearch(e.target.value)}
                  className="pl-10 bg-card/95 backdrop-blur-sm shadow-card border-border/50 focus:ring-primary/30"
                />
              </div>
              {medicationSearch && (
                <div className="bg-card/95 backdrop-blur-sm rounded-lg px-4 py-3 shadow-card border border-border/50 space-y-1">
                  <p className="text-sm text-muted-foreground">
                    <span className="text-primary font-medium">{filteredUnits.length}</span> unidades encontradas
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Users className="w-3.5 h-3.5 text-primary" />
                    <span><strong className="text-foreground">{medicationSearchCount}</strong> pessoas pesquisaram nos últimos 30 minutos</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        <Button
          onClick={() => navigate(-1)}
          className="absolute top-4 right-4 z-[1000] 
            bg-white text-black 
            px-4 py-2 rounded-lg shadow-md 
            font-medium 
            hover:bg-gray-200 transition-colors"
        >
          Voltar
        </Button>

        <div 
          ref={mapRef} 
          className="absolute inset-0 w-full h-full"
          style={{ zIndex: 0 }}
        />
      </div>
    </div>
  );
};

export default HealthMap;
