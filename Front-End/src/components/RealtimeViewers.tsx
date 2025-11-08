import { useState, useEffect } from 'react';
import { Users, Eye } from 'lucide-react';

interface RealtimeViewersProps {
  selectedUnit?: string;
  selectedMedication?: string;
}

const RealtimeViewers = ({ selectedUnit, selectedMedication }: RealtimeViewersProps) => {
  const [mapViewers, setMapViewers] = useState(0);
  const [unitViewers, setUnitViewers] = useState(0);
  const [medicationViewers, setMedicationViewers] = useState(0);

  useEffect(() => {
    // Simula visualizadores em tempo real
    const baseViewers = Math.floor(Math.random() * 15) + 5;
    setMapViewers(baseViewers);

    const interval = setInterval(() => {
      setMapViewers(prev => {
        const change = Math.floor(Math.random() * 3) - 1;
        return Math.max(3, prev + change);
      });
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (selectedUnit) {
      setUnitViewers(Math.floor(Math.random() * 8) + 2);
    } else {
      setUnitViewers(0);
    }
  }, [selectedUnit]);

  useEffect(() => {
    if (selectedMedication) {
      setMedicationViewers(Math.floor(Math.random() * 12) + 3);
    } else {
      setMedicationViewers(0);
    }
  }, [selectedMedication]);

  return (
    <div className="absolute top-4 right-4 bg-card/95 backdrop-blur-sm border rounded-lg p-3 shadow-lg text-sm space-y-2 z-[1000]">
      <div className="flex items-center gap-2 text-muted-foreground">
        <Users className="w-4 h-4" />
        <span>{mapViewers} visualizando o mapa</span>
      </div>
      
      {selectedUnit && unitViewers > 0 && (
        <div className="flex items-center gap-2 text-primary">
          <Eye className="w-4 h-4" />
          <span>{unitViewers} nesta unidade</span>
        </div>
      )}
      
      {selectedMedication && medicationViewers > 0 && (
        <div className="flex items-center gap-2 text-accent">
          <Eye className="w-4 h-4" />
          <span>{medicationViewers} buscando este medicamento</span>
        </div>
      )}
    </div>
  );
};

export default RealtimeViewers;