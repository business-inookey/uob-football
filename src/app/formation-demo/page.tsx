"use client";
import { useState } from 'react';
import FormationSelect, { validateFormation, type Formation } from '@/components/FormationSelect';

export default function FormationDemo() {
  const [formation, setFormation] = useState<Formation>({ gk: 1, def: 4, mid: 3, wng: 0, st: 3 });
  const [presetFormations, _setPresetFormations] = useState([
    { name: "4-3-3", formation: { gk: 1, def: 4, mid: 3, wng: 0, st: 3 } },
    { name: "4-4-2", formation: { gk: 1, def: 4, mid: 4, wng: 0, st: 2 } },
    { name: "3-5-2", formation: { gk: 1, def: 3, mid: 5, wng: 0, st: 2 } },
    { name: "4-2-3-1", formation: { gk: 1, def: 4, mid: 2, wng: 3, st: 1 } },
    { name: "5-3-2", formation: { gk: 1, def: 5, mid: 3, wng: 0, st: 2 } },
  ]);

  const validation = validateFormation(formation);
  const outfieldTotal = formation.def + formation.mid + formation.wng + formation.st;

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-50 to-neutral-100 p-6">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Formation Selector Demo
          </h1>
          <p className="text-lg text-muted-foreground">
            Interactive demonstration of the +/- counter formation selector
          </p>
        </div>

        {/* Main Demo */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Formation Selector */}
          <div className="card p-6 space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-foreground">Custom Formation</h2>
              <p className="text-muted-foreground">
                Use the +/- buttons to adjust player positions
              </p>
            </div>
            
            <div className="card p-4 bg-muted/50">
              <FormationSelect value={formation} onChange={setFormation} />
            </div>
          </div>

          {/* Formation Preview */}
          <div className="card p-6 space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-semibold text-foreground">Formation Preview</h2>
              <p className="text-muted-foreground">
                Visual representation of your selected formation
              </p>
            </div>

            {/* Formation Display */}
            <div className="space-y-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-foreground">
                  {formation.def}-{formation.mid}-{formation.st}
                </div>
                <div className="text-sm text-muted-foreground">
                  {formation.wng > 0 && `with ${formation.wng} wingers`}
                </div>
              </div>

              {/* Formation Diagram */}
              <div className="bg-muted/30 rounded-lg p-6 space-y-4">
                {/* Goalkeeper */}
                <div className="flex justify-center">
                  <div className="w-12 h-12 bg-blue-500 text-white rounded-full flex items-center justify-center font-bold">
                    GK
                  </div>
                </div>

                {/* Defenders */}
                {formation.def > 0 && (
                  <div className="flex justify-center gap-2">
                    {Array.from({ length: formation.def }, (_, i) => (
                      <div key={i} className="w-10 h-10 bg-green-500 text-white rounded flex items-center justify-center font-bold text-sm">
                        DEF
                      </div>
                    ))}
                  </div>
                )}

                {/* Midfielders */}
                {formation.mid > 0 && (
                  <div className="flex justify-center gap-2">
                    {Array.from({ length: formation.mid }, (_, i) => (
                      <div key={i} className="w-10 h-10 bg-yellow-500 text-white rounded flex items-center justify-center font-bold text-sm">
                        MID
                      </div>
                    ))}
                  </div>
                )}

                {/* Wingers */}
                {formation.wng > 0 && (
                  <div className="flex justify-center gap-2">
                    {Array.from({ length: formation.wng }, (_, i) => (
                      <div key={i} className="w-10 h-10 bg-purple-500 text-white rounded flex items-center justify-center font-bold text-sm">
                        WNG
                      </div>
                    ))}
                  </div>
                )}

                {/* Strikers */}
                {formation.st > 0 && (
                  <div className="flex justify-center gap-2">
                    {Array.from({ length: formation.st }, (_, i) => (
                      <div key={i} className="w-10 h-10 bg-red-500 text-white rounded flex items-center justify-center font-bold text-sm">
                        ST
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Formation Stats */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="font-semibold text-foreground">Total Players</div>
                  <div className="text-2xl font-bold text-primary">{1 + outfieldTotal}</div>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <div className="font-semibold text-foreground">Outfield Players</div>
                  <div className={`text-2xl font-bold ${validation.ok ? 'text-green-600' : 'text-red-600'}`}>
                    {outfieldTotal}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Preset Formations */}
        <div className="card p-6 space-y-6">
          <div className="space-y-2">
            <h2 className="text-2xl font-semibold text-foreground">Preset Formations</h2>
            <p className="text-muted-foreground">
              Click on any preset formation to apply it
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {presetFormations.map((preset) => (
              <button
                key={preset.name}
                onClick={() => setFormation(preset.formation)}
                className="p-4 border border-border rounded-lg hover:border-primary hover:bg-primary/5 transition-all duration-200 text-center"
              >
                <div className="font-semibold text-foreground mb-1">{preset.name}</div>
                <div className="text-sm text-muted-foreground">
                  {preset.formation.def}-{preset.formation.mid}-{preset.formation.st}
                </div>
                {preset.formation.wng > 0 && (
                  <div className="text-xs text-muted-foreground">
                    +{preset.formation.wng} wingers
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Features */}
        <div className="card p-6 space-y-6">
          <h2 className="text-2xl font-semibold text-foreground">Features</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h3 className="font-semibold text-blue-900 mb-2">+/- Counter Buttons</h3>
              <p className="text-sm text-blue-800">
                Intuitive increment/decrement buttons for easy formation adjustment
              </p>
            </div>
            
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">Real-time Validation</h3>
              <p className="text-sm text-green-800">
                Instant feedback on formation validity with visual indicators
              </p>
            </div>
            
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <h3 className="font-semibold text-purple-900 mb-2">Smart Constraints</h3>
              <p className="text-sm text-purple-800">
                Automatic limits and disabled states prevent invalid formations
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
