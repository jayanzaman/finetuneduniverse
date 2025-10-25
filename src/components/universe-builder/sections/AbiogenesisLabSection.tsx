'use client';

import { useState, useEffect, useRef } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../ui/card'
import { Slider } from '../../ui/slider'
import { Info } from 'lucide-react'

// Types and Interfaces
interface SimulationState {
  stage: number; // 0-6
  aminoAcidYield: number;
  peptideCount: number;
  meanPeptideLength: number;
  vesicleCount: number;
  encapsulationRate: number;
  templateStrands: number;
  meanStrandLength: number;
  rnaStrands: number;
  rnaLength: number;
  dnaStrands: number;
  dnaLength: number;
  perBaseAccuracy: number;     // p (0-1)
  strandFidelity: number;      // p^L (display only)
  passesEigen: boolean;        // above Eigen threshold
  lifePotential: number;
}

interface EnvironmentalControls {
  energyInputs: {
    uv: number;
    lightning: number;
    hydrothermal: number;
    dryWetCycling: number;
  };
  chemistryRichness: number;
  waterActivity: number;
  ph: number;
  temperature: number;
  mineralCatalysis: boolean;
}

// Simulation Canvas Component
const SimulationCanvas: React.FC<{ 
  state: SimulationState; 
  controls: EnvironmentalControls;
  selectedPhase: number;
  onPhaseClick: (phase: number) => void;
}> = ({ state, controls, selectedPhase, onPhaseClick }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Draw the simulation
    drawSimulation(ctx, state, controls, selectedPhase, onPhaseClick);
  }, [state, controls, selectedPhase, onPhaseClick]);

  const handleCanvasClick = (event: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const stageWidth = canvas.width / 6; // Updated for 6 stages
    const clickedStage = Math.floor(x / stageWidth);
    
    if (clickedStage >= 0 && clickedStage <= 5) { // Updated for 6 stages (0-5)
      onPhaseClick(clickedStage);
    }
  };

  return (
    <canvas 
      ref={canvasRef} 
      width={800} 
      height={600} 
      onClick={handleCanvasClick}
      className="cursor-pointer"
    />
  );
};


  const getComplement = (base: string, mode: string): string => {
    const complements: { [key: string]: string } = {
      'A': mode === 'RNA' ? 'U' : 'T',
      'T': 'A',
      'U': 'A',
      'C': 'G',
      'G': 'C'
    };
    return complements[base] || base;
  };

  const drawSimulation = (ctx: CanvasRenderingContext2D, state: SimulationState, controls: EnvironmentalControls, selectedPhase: number, onPhaseClick: (phase: number) => void) => {
    const canvas = ctx.canvas;
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(0, 0, width, height);
    
    // Draw stage progression zones (6 stages total)
    const stageWidth = width / 6;
    const stageHeight = height - 40;
    
    // Stage labels and zones
    const stages = [
      { name: 'Simple\nMolecules', color: '#6b7280', active: selectedPhase >= 0 },
      { name: 'Amino\nAcids', color: '#10b981', active: selectedPhase >= 1 },
      { name: 'Peptide\nChains', color: '#f59e0b', active: selectedPhase >= 2 },
      { name: 'Proto-\ncells', color: '#8b5cf6', active: selectedPhase >= 3 },
      { name: 'RNA\nWorld', color: '#06b6d4', active: selectedPhase >= 4 },
      { name: 'First\nLife', color: '#dc2626', active: selectedPhase >= 5 }
    ];
    
    // Draw stage zones and transitions
    
    for (let i = 0; i < stages.length; i++) {
      const x = i * stageWidth;
      const stage = stages[i];
      
      // Draw zone background
      ctx.fillStyle = stage.active ? `${stage.color}20` : '#1a1a1a';
      ctx.fillRect(x, 20, stageWidth, stageHeight);
      
      // Draw zone border - highlight selected phase
      const isSelected = i === selectedPhase;
      ctx.strokeStyle = isSelected ? '#fff' : (stage.active ? stage.color : '#333');
      ctx.lineWidth = isSelected ? 4 : (stage.active ? 3 : 1);
      ctx.strokeRect(x, 20, stageWidth, stageHeight);
      
      // Add selection indicator
      if (isSelected) {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.1)';
        ctx.fillRect(x, 20, stageWidth, stageHeight);
      }
      
      // Draw stage label
      ctx.fillStyle = stage.active ? stage.color : '#666';
      ctx.font = 'bold 12px sans-serif';
      ctx.textAlign = 'center';
      const lines = stage.name.split('\n');
      lines.forEach((line: string, lineIndex: number) => {
        ctx.fillText(line, x + stageWidth/2, 40 + lineIndex * 15);
      });
      
      // Draw transition arrows
      if (i < stages.length - 1 && stage.active) {
        const arrowX = x + stageWidth - 10;
        const arrowY = height/2;
        ctx.fillStyle = stage.color;
        ctx.beginPath();
        ctx.moveTo(arrowX, arrowY - 8);      // Start at upper back
        ctx.lineTo(arrowX, arrowY + 8);      // Draw to lower back
        ctx.lineTo(arrowX + 15, arrowY);     // Draw to tip (pointing right)
        ctx.closePath();
        ctx.fill();
      }
    }
    
    // Draw stage-specific content
    ctx.textAlign = 'left';
    
    // Stage 0: Simple molecules
    if (selectedPhase >= 0) {
      const x = 0 * stageWidth + 10;
      const y = 80;
      ctx.fillStyle = '#6b7280';
      ctx.font = '10px monospace';
      const molecules = ['H₂O', 'CO₂', 'NH₃', 'CH₄', 'H₂S'];
      molecules.forEach((mol, i) => {
        ctx.fillText(mol, x + (i % 3) * 25, y + Math.floor(i / 3) * 20);
      });
      
      // Show yield
      ctx.fillStyle = '#888';
      ctx.font = '9px sans-serif';
      ctx.fillText(`Precursors: ${state.aminoAcidYield.toFixed(1)} ppm`, x, y + 60);
    }
    
    // Stage 1: Amino acids
    if (selectedPhase >= 1) {
      const x = 1 * stageWidth + 10;
      const y = 80;
      ctx.fillStyle = '#10b981';
      ctx.font = '10px monospace';
      const aminoAcids = ['Gly', 'Ala', 'Val', 'Asp', 'Glu', 'Ser'];
      aminoAcids.forEach((aa, i) => {
        const opacity = Math.min(1, state.aminoAcidYield / 5);
        ctx.fillStyle = `rgba(16, 185, 129, ${opacity})`;
        ctx.fillText(aa, x + (i % 3) * 25, y + Math.floor(i / 3) * 20);
      });
      
      ctx.fillStyle = '#10b981';
      ctx.font = '9px sans-serif';
      ctx.fillText(`Yield: ${state.aminoAcidYield.toFixed(1)} ppm`, x, y + 60);
    }
    
    // Stage 2: Peptides
    if (selectedPhase >= 2) {
      const x = 2 * stageWidth + 10;
      const y = 80;
      
      // Draw peptide chains
      const chainCount = Math.min(5, Math.floor(state.peptideCount / 20));
      for (let i = 0; i < chainCount; i++) {
        const chainY = y + i * 15;
        const length = Math.min(8, Math.max(2, Math.round(state.meanPeptideLength / 3)));
        
        ctx.strokeStyle = '#f59e0b';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, chainY);
        ctx.lineTo(x + length * 8, chainY);
        ctx.stroke();
        
        // Draw amino acid nodes
        ctx.fillStyle = '#f59e0b';
        for (let j = 0; j <= length; j++) {
          ctx.beginPath();
          ctx.arc(x + j * 8, chainY, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      ctx.fillStyle = '#f59e0b';
      ctx.font = '9px sans-serif';
      ctx.fillText(`Count: ${state.peptideCount.toFixed(0)}`, x, y + 80);
      ctx.fillText(`Length: ${state.meanPeptideLength.toFixed(1)} aa`, x, y + 95);
    }
    
    // Stage 3: Protocells
    if (selectedPhase >= 3) {
      const x = 3 * stageWidth + 20;
      const y = 100;
      
      // Draw vesicles
      const vesicleCount = Math.min(3, Math.floor(state.vesicleCount / 15));
      for (let i = 0; i < vesicleCount; i++) {
        const vesX = x + (i % 2) * 40;
        const vesY = y + Math.floor(i / 2) * 40;
        const radius = 15 + state.encapsulationRate * 10;
        
        // Draw membrane
        ctx.strokeStyle = '#8b5cf6';
        ctx.lineWidth = 2;
        ctx.setLineDash([3, 3]);
        ctx.beginPath();
        ctx.arc(vesX, vesY, radius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw contents
        if (state.encapsulationRate > 0.1) {
          ctx.fillStyle = `rgba(245, 158, 11, ${state.encapsulationRate})`;
          for (let j = 0; j < 5; j++) {
            const contentX = vesX + (Math.random() - 0.5) * radius;
            const contentY = vesY + (Math.random() - 0.5) * radius;
            ctx.beginPath();
            ctx.arc(contentX, contentY, 1, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
      
      ctx.fillStyle = '#8b5cf6';
      ctx.font = '9px sans-serif';
      ctx.fillText(`Vesicles: ${state.vesicleCount.toFixed(0)}`, x - 10, y + 70);
      ctx.fillText(`Encap: ${(state.encapsulationRate * 100).toFixed(0)}%`, x - 10, y + 85);
    }
    
    // Stage 4: RNA World
    if (selectedPhase >= 4) {
      const x = 4 * stageWidth + 10;
      const y = 80;
      
      const rnaBases = ['A', 'U', 'C', 'G'];
      
      // Draw RNA strands with both template and catalytic functions
      const rnaCount = Math.min(3, Math.floor(state.rnaStrands / 3));
      for (let i = 0; i < rnaCount; i++) {
        const strandY = y + i * 25;
        const length = Math.min(6, Math.max(3, Math.round(state.rnaLength / 5)));
        
        // Draw RNA backbone
        ctx.strokeStyle = '#06b6d4';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x, strandY);
        ctx.lineTo(x + length * 12, strandY);
        ctx.stroke();
        
        // Draw bases with labels
        for (let j = 0; j < length; j++) {
          const baseX = x + j * 12;
          ctx.fillStyle = '#06b6d4';
          ctx.fillRect(baseX, strandY - 3, 4, 6);
          
          // Base labels
          ctx.fillStyle = '#fff';
          ctx.font = '8px monospace';
          ctx.fillText(rnaBases[j % 4], baseX, strandY + 12);
        }
        
        // Draw secondary structure (ribozyme active site)
        if (length >= 4) {
          ctx.strokeStyle = '#06b6d4';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(x + length * 6, strandY - 10, 8, 0, Math.PI);
          ctx.stroke();
          
          // Active site indicator
          ctx.fillStyle = '#ffff00';
          ctx.fillRect(x + length * 6 - 2, strandY - 12, 4, 4);
        }
      }
      
      ctx.fillStyle = '#06b6d4';
      ctx.font = '9px sans-serif';
      ctx.fillText(`RNA: ${state.rnaStrands.toFixed(0)}`, x, y + 80);
      ctx.fillText(`Length: ${state.rnaLength.toFixed(1)} nt`, x, y + 95);
      ctx.fillText(`Ribozymes: ${state.rnaStrands > 5 ? 'Active' : 'None'}`, x, y + 110);
    }
    
    // Stage 5: First Life
    if (selectedPhase >= 5) {
      const x = 5 * stageWidth + 10;
      const y = 80;
      
      const dnaBases = ['A', 'T', 'C', 'G'];
      
      // Draw integrated DNA-RNA-Protein system
      const dnaCount = Math.min(2, Math.floor(state.dnaStrands / 2));
      for (let i = 0; i < dnaCount; i++) {
        const strandY = y + i * 35;
        const length = Math.min(8, Math.max(4, Math.round(state.dnaLength / 4)));
        
        // Draw DNA double helix
        for (let j = 0; j < length; j++) {
          const baseX = x + j * 10;
          const twist = j * 0.5;
          
          // Top strand
          ctx.strokeStyle = '#dc2626';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.moveTo(baseX, strandY + Math.sin(twist) * 3);
          ctx.lineTo(baseX + 8, strandY + Math.sin(twist + 0.5) * 3);
          ctx.stroke();
          
          // Bottom strand
          ctx.beginPath();
          ctx.moveTo(baseX, strandY + 8 - Math.sin(twist) * 3);
          ctx.lineTo(baseX + 8, strandY + 8 - Math.sin(twist + 0.5) * 3);
          ctx.stroke();
          
          // Base pairs
          ctx.strokeStyle = '#dc2626';
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(baseX + 4, strandY + Math.sin(twist + 0.25) * 3);
          ctx.lineTo(baseX + 4, strandY + 8 - Math.sin(twist + 0.25) * 3);
          ctx.stroke();
        }
        
        // Draw ribosome (protein synthesis)
        ctx.fillStyle = '#ffa500';
        ctx.fillRect(x + length * 5, strandY + 15, 12, 8);
        ctx.fillStyle = '#fff';
        ctx.font = '6px sans-serif';
        ctx.fillText('Ribosome', x + length * 5 - 5, strandY + 30);
      }
      
      ctx.fillStyle = '#dc2626';
      ctx.font = '9px sans-serif';
      ctx.fillText(`DNA: ${state.dnaStrands.toFixed(0)} genes`, x, y + 90);
      ctx.fillText(`Proteins: ${Math.floor(state.dnaStrands * 1.5)}`, x, y + 105);
      ctx.fillText(`Cell Type: ${state.dnaLength > 50 ? 'Prokaryote' : 'Proto-cell'}`, x, y + 120);
    }
  };

// Stage Information Component
function StageInfo({ stage }: { stage: number }) {
  const stageData = [
    {
      title: 'Prebiotic Soup',
      description: 'Simple gases and energy sources create a reactive chemical environment rich in organic precursors',
      confidence: 'Empirically supported',
      difficulty: 'Moderate',
      requirements: 'Requires reducing atmosphere (CH₄, NH₃, H₂O, H₂), energy sources (UV, lightning, heat), and absence of free oxygen',
      details: 'Formation of simple organic molecules from inorganic precursors under early Earth conditions. Foundation for all subsequent complexity.',
      mechanisms: [
        'Miller-Urey synthesis: electrical discharge through reducing gases produces amino acids',
        'Formose reaction: formaldehyde polymerizes into sugars under alkaline conditions',
        'HCN polymerization: hydrogen cyanide forms purines and other nitrogen heterocycles',
        'Fischer-Tropsch synthesis: CO + H₂ on metal surfaces produces hydrocarbons'
      ],
      challenges: [
        'Early atmosphere composition uncertain - may not have been strongly reducing',
        'Dilution problem: organic molecules get too diluted in oceans',
        'Destructive processes compete with synthesis (hydrolysis, photolysis)',
        'Chirality: produces racemic mixtures, not the homochiral molecules life uses'
      ],
      experiments: [
        'Miller & Urey (1953): First demonstration of amino acid synthesis from simple gases',
        'Oró (1961): Showed adenine formation from HCN solutions',
        'Butlerow (1861): Formose reaction producing sugars from formaldehyde'
      ],
      caveat: 'While organic synthesis is well-demonstrated, the exact conditions on early Earth remain debated. Recent evidence suggests the atmosphere may have been less reducing than Miller-Urey assumed, requiring alternative synthesis pathways.'
    },
    {
      title: 'Amino Acids',
      description: 'Energy-driven synthesis of the 20 proteinogenic amino acids essential for life',
      confidence: 'Empirically demonstrated',
      difficulty: 'Easy',
      requirements: 'Requires energy inputs (UV 30-60, lightning 50-80), reducing conditions, and carbon/nitrogen sources',
      details: 'Formation of the fundamental building blocks of proteins through various prebiotic synthesis pathways. Critical step toward catalytic molecules.',
      mechanisms: [
        'Strecker synthesis: aldehydes + HCN + NH₃ → amino acids via aminonitrile intermediates',
        'Reductive amination: α-keto acids + NH₃ + reducing agents → amino acids',
        'Spark discharge synthesis: electrical energy breaks bonds and reforms them into amino acids',
        'Hydrothermal vent synthesis: metal sulfides catalyze amino acid formation from CO₂ + NH₃'
      ],
      challenges: [
        'Racemic mixtures: equal amounts of L and D forms, but life uses only L-amino acids',
        'Selective synthesis: getting all 20 proteinogenic amino acids in useful ratios',
        'Stability issues: amino acids decompose under the same conditions that form them',
        'Concentration problem: need sufficient local concentrations for further reactions'
      ],
      experiments: [
        'Miller-Urey (1953): Produced 11 of the 20 proteinogenic amino acids',
        'Wächtershäuser (1988): Iron-sulfur world hypothesis with CO₂ fixation',
        'Huber & Wächtershäuser (1998): Amino acid synthesis on iron-nickel sulfides'
      ],
      caveat: 'Amino acid synthesis is robust and occurs under many conditions. However, the chirality problem remains unsolved - no known prebiotic process selectively produces only L-amino acids as life requires.'
    },
    {
      title: 'Peptides',
      description: 'Amino acids polymerize into short protein chains with emerging catalytic properties',
      confidence: 'Lab-demonstrated',
      difficulty: 'Moderate',
      requirements: 'Requires dry-wet cycling (60-90), hydrothermal activity (40-80), and concentrated amino acid solutions',
      details: 'Formation of peptide bonds between amino acids to create short protein chains. First emergence of catalytic activity from organic molecules.',
      mechanisms: [
        'Thermal condensation: heat drives dehydration synthesis of peptide bonds',
        'Clay catalysis: montmorillonite surfaces concentrate amino acids and catalyze polymerization',
        'Dry-wet cycling: evaporation concentrates reactants, rewetting enables further reactions',
        'Carbonyl sulfide activation: COS activates amino acids for peptide bond formation'
      ],
      challenges: [
        'Hydrolysis competition: water breaks peptide bonds faster than they form',
        'Sequence specificity: random polymerization rarely produces functional peptides',
        'Length limitations: difficult to achieve peptides longer than 10-20 amino acids',
        'Mixed chirality effects: D-amino acids disrupt peptide structure and function'
      ],
      experiments: [
        'Fox (1965): Thermal proteins from amino acid mixtures at 150-180°C',
        'Ferris et al. (1996): Montmorillonite-catalyzed peptide formation up to 55 residues',
        'Leman et al. (2004): Carbonyl sulfide-mediated peptide synthesis under mild conditions'
      ],
      caveat: 'Peptide formation is achievable but produces mostly random sequences. Functional catalytic peptides are extremely rare in random sequences, and the transition to specific, functional proteins remains a major unsolved problem.'
    },
    {
      title: 'Protocells',
      description: 'Self-assembling lipid vesicles create the first cellular compartments and concentrate biochemistry',
      confidence: 'Lab-demonstrated',
      difficulty: 'Moderate',
      requirements: 'Requires high water activity (60-95), hydrothermal energy (60-80), and amphiphilic molecules',
      details: 'Formation of membrane-bounded compartments that concentrate reactants and create distinct chemical environments. Essential step toward cellular organization.',
      mechanisms: [
        'Spontaneous self-assembly: amphiphilic molecules form bilayer membranes in water',
        'Vesicle growth: incorporation of new lipids causes vesicles to expand',
        'Division by shear: physical forces split large vesicles into smaller ones',
        'Selective permeability: membranes allow some molecules through while retaining others'
      ],
      challenges: [
        'Membrane stability: simple fatty acid membranes are fragile and leak',
        'Growth-division coupling: vesicles must grow and divide in coordination',
        'Selective permeability: need to retain useful molecules while allowing waste removal',
        'Competition with bulk phase: reactions may be faster outside vesicles'
      ],
      experiments: [
        'Deamer & Barchfeld (1982): Spontaneous vesicle formation from meteoritic organics',
        'Szostak lab (2003): Fatty acid vesicles that grow and divide',
        'Mansy & Szostak (2008): Template-directed RNA synthesis inside vesicles'
      ],
      caveat: 'Protocell formation is well-demonstrated, but achieving coordinated growth, division, and heredity remains challenging. The transition from simple vesicles to true cells with integrated metabolism and genetics is not yet understood.'
    },
    {
      title: 'RNA World',
      description: 'Hypothetical stage where RNA molecules serve as both genes and enzymes, bridging chemistry and biology',
      confidence: 'Theoretical',
      difficulty: 'Very Difficult',
      requirements: 'Requires precise UV (25-45), moderate lightning (30-55), high chemistry richness (85%+), optimal temperature (298±5K), and Eigen threshold passage',
      details: 'The proposed evolutionary stage where RNA performed both genetic storage and catalytic functions before the evolution of DNA and proteins. Represents the transition from chemistry to true biology.',
      mechanisms: [
        'Template-directed synthesis: simple RNA strands direct formation of complementary sequences',
        'Ribozyme catalysis: folded RNA structures catalyze chemical reactions including self-replication',
        'RNA evolution: replication errors create variants subject to natural selection',
        'Compartmentalization: RNA systems develop within lipid vesicles for concentration and protection'
      ],
      challenges: [
        'Eigen\'s paradox: accurate replication needs long RNAs, but long RNAs replicate inaccurately',
        'Prebiotic RNA synthesis: no robust pathway from simple molecules to functional RNA',
        'Homochirality problem: life requires pure D-ribose, but prebiotic chemistry gives mixtures',
        'RNA instability: RNA degrades rapidly under conditions needed for replication'
      ],
      experiments: [
        'Ferris & Ertem (1992): Clay surfaces catalyze RNA formation up to 50 nucleotides',
        'Joyce lab (2009): Created RNA enzymes that replicate each other (with pure components)',
        'Szostak lab (2016): RNA polymerase ribozyme that can copy RNA templates'
      ],
      caveat: 'The RNA World remains hypothetical. No experiment has demonstrated spontaneous emergence of self-replicating RNA from prebiotic conditions. The ribose synthesis and homochirality problems are unsolved. Many scientists now favor metabolism-first or lipid-first scenarios.'
    },
    {
      title: 'First Life',
      description: 'The first true living cells with integrated DNA-protein-RNA machinery, genetic code, and cellular reproduction',
      confidence: 'Evolutionary transition',
      difficulty: 'Extremely Difficult',
      requirements: 'Requires all optimal conditions: minimal UV (20-35), maximum cycling (80%+), peak chemistry (85%+), precise water activity (75-90%), perfect temperature (298±3K)',
      details: 'The emergence of the first true living cells with integrated molecular machinery: DNA for genetic storage, proteins for catalysis, RNA for information transfer, plus basic metabolism and cellular reproduction.',
      mechanisms: [
        'Central dogma: DNA → RNA → Proteins with genetic code translation',
        'DNA replication: high-fidelity copying with multiple error-correction systems',
        'Basic metabolism: essential enzyme-catalyzed reactions for energy production and biosynthesis',
        'Cellular reproduction: coordinated replication of genome, metabolism, and cell division'
      ],
      challenges: [
        'Irreducible complexity: DNA, RNA, and proteins are interdependent - none works without the others',
        'Genetic code origin: no explanation for the specific codon assignments universally used',
        'Ribosome assembly: 80+ proteins and RNAs must assemble in precise 3D structure',
        'Metabolic coordination: even basic cellular metabolism requires precise regulation and integration'
      ],
      experiments: [
        'No prebiotic experiments - modern life requires existing biological machinery',
        'Synthetic biology: minimal genomes need ~250+ genes for basic cellular function',
        'LUCA studies: Last Universal Common Ancestor already had full DNA-protein machinery'
      ],
      caveat: 'First Life represents the emergence of true cellular organisms, marking the end of abiogenesis and beginning of biological evolution. The transition from RNA World to integrated DNA-protein-RNA systems involves multiple chicken-and-egg problems that remain unsolved by current theories.'
    }
  ];

  const currentStage = stageData[stage] || stageData[0];
  
  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'Empirically supported': return 'text-green-400';
      case 'Empirically demonstrated': return 'text-green-400';
      case 'Lab-demonstrated': return 'text-yellow-400';
      case 'Active research': return 'text-orange-400';
      case 'Strongly hypothesized': return 'text-blue-400';
      case 'Evolutionary transition': return 'text-purple-400';
      default: return 'text-gray-400';
    }
  };
  
  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'text-green-400';
      case 'Moderate': return 'text-yellow-400';
      case 'Difficult': return 'text-orange-400';
      case 'Very Difficult': return 'text-red-400';
      case 'Extremely Difficult': return 'text-red-500';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className='p-4 bg-white/5 rounded-lg border border-white/20'>
      <h3 className='text-lg font-semibold mb-2'>Stage {stage}: {currentStage.title}</h3>
      <p className='text-sm text-gray-300 mb-2'>{currentStage.description}</p>
      
      <div className='flex flex-wrap gap-2 mb-2'>
        <span className={`text-xs px-2 py-1 rounded ${getConfidenceColor(currentStage.confidence)} bg-white/10`}>
          {currentStage.confidence}
        </span>
        
        {(currentStage as any).difficulty && (
          <span className={`text-xs px-2 py-1 rounded ${getDifficultyColor((currentStage as any).difficulty)} bg-red-900/20 border border-red-500/30`}>
            ⚠️ {(currentStage as any).difficulty}
          </span>
        )}
      </div>
      
      {(currentStage as any).details && (
        <div className='text-xs text-blue-300 bg-blue-900/20 p-2 rounded border border-blue-500/30 mt-2'>
          <strong>Details:</strong> {(currentStage as any).details}
        </div>
      )}
      
      {(currentStage as any).requirements && (
        <div className='text-xs text-yellow-300 bg-yellow-900/20 p-2 rounded border border-yellow-500/30 mt-2'>
          <strong>Requirements:</strong> {(currentStage as any).requirements}
        </div>
      )}
      
      {(currentStage as any).mechanisms && (
        <div className='text-xs text-green-300 bg-green-900/20 p-2 rounded border border-green-500/30 mt-2'>
          <strong>Key Mechanisms:</strong>
          <ul className='list-disc list-inside mt-1 space-y-1'>
            {(currentStage as any).mechanisms.map((mechanism: string, index: number) => (
              <li key={index}>{mechanism}</li>
            ))}
          </ul>
        </div>
      )}
      
      {(currentStage as any).challenges && (
        <div className='text-xs text-orange-300 bg-orange-900/20 p-2 rounded border border-orange-500/30 mt-2'>
          <strong>Major Challenges:</strong>
          <ul className='list-disc list-inside mt-1 space-y-1'>
            {(currentStage as any).challenges.map((challenge: string, index: number) => (
              <li key={index}>{challenge}</li>
            ))}
          </ul>
        </div>
      )}
      
      {(currentStage as any).experiments && (
        <div className='text-xs text-purple-300 bg-purple-900/20 p-2 rounded border border-purple-500/30 mt-2'>
          <strong>Key Experiments:</strong>
          <ul className='list-disc list-inside mt-1 space-y-1'>
            {(currentStage as any).experiments.map((experiment: string, index: number) => (
              <li key={index}>{experiment}</li>
            ))}
          </ul>
        </div>
      )}
      
      {(currentStage as any).caveat && (
        <div className='text-xs text-red-300 bg-red-900/20 p-2 rounded border border-red-500/30 mt-2'>
          <strong>Scientific Reality:</strong> {(currentStage as any).caveat}
        </div>
      )}
    </div>
  );
}

export default function AbiogenesisLabSection({ 
  educatorMode, 
  cosmicTime = 0
}: { 
  educatorMode: boolean; 
  cosmicTime?: number;
}) {
  // Selected phase for navigation
  const [selectedPhase, setSelectedPhase] = useState<number>(0);
  
  // Simulation state
  const [simulationState, setSimulationState] = useState<SimulationState>({
    stage: 0,
    aminoAcidYield: 0,
    peptideCount: 0,
    meanPeptideLength: 0,
    vesicleCount: 0,
    encapsulationRate: 0,
    templateStrands: 0,
    meanStrandLength: 0,
    rnaStrands: 0,
    rnaLength: 0,
    dnaStrands: 0,
    dnaLength: 0,
    perBaseAccuracy: 0.7,
    strandFidelity: 0,
    passesEigen: false,
    lifePotential: 0
  });

  // Environmental controls
  const [controls, setControls] = useState<EnvironmentalControls>({
    energyInputs: {
      uv: 45,        // Center of 30-60 optimal range
      lightning: 65, // Center of 50-80 optimal range  
      hydrothermal: 60, // Center of 40-80 optimal range
      dryWetCycling: 75 // Center of 60-90 optimal range
    },
    chemistryRichness: 70, // Center of 50-90 optimal range
    waterActivity: 78,     // Center of 60-95 optimal range
    ph: 7,
    temperature: 298, // Center of 288-308K optimal range (25°C)
    mineralCatalysis: true
  });

  // Calculate simulation state based on selected phase and environmental controls
  useEffect(() => {
    const calculatePhaseState = (phase: number, controls: EnvironmentalControls): SimulationState => {
      const energyFactor = Math.min(1.0, 
        (controls.energyInputs.uv * 0.5 + controls.energyInputs.lightning + 
         controls.energyInputs.hydrothermal + controls.energyInputs.dryWetCycling) / 400);
      const mineralFactor = controls.mineralCatalysis ? 1.5 : 1.0;
      const richnessFactor = Math.max(0, Math.min(1, controls.chemistryRichness / 100));

      let newState: SimulationState = {
        stage: phase,
        aminoAcidYield: 0,
        peptideCount: 0,
        meanPeptideLength: 0,
        vesicleCount: 0,
        encapsulationRate: 0,
        templateStrands: 0,
        meanStrandLength: 0,
        rnaStrands: 0,
        rnaLength: 0,
        dnaStrands: 0,
        dnaLength: 0,
        perBaseAccuracy: 0.7,
        strandFidelity: 0,
        passesEigen: false,
        lifePotential: 0
      };

      // Calculate values based on phase and conditions
      if (phase >= 0) {
        newState.aminoAcidYield = energyFactor * richnessFactor * 10;
      }
      
      if (phase >= 1) {
        const stage2Ready = controls.energyInputs.dryWetCycling >= 60 && controls.energyInputs.hydrothermal >= 40;
        if (stage2Ready) {
          newState.peptideCount = (controls.energyInputs.dryWetCycling / 100) * mineralFactor * 100;
          newState.meanPeptideLength = 20;
        }
      }
      
      if (phase >= 2) {
        const stage3Ready = controls.waterActivity >= 60 && controls.energyInputs.hydrothermal >= 60;
        if (stage3Ready) {
          newState.vesicleCount = (controls.waterActivity / 100) * 50;
          newState.encapsulationRate = (controls.waterActivity / 100);
        }
      }
      
      if (phase >= 3) {
        const stage4Ready = controls.chemistryRichness >= 70 && 
                           controls.energyInputs.hydrothermal >= 70 &&
                           controls.energyInputs.dryWetCycling >= 70 &&
                           Math.abs(controls.temperature - 298) <= 10;
        
        if (stage4Ready) {
          newState.templateStrands = mineralFactor * richnessFactor * 20;
          newState.meanStrandLength = 30;
        }
        
        // Per-base accuracy calculation
        const tempBoost = Math.exp(-0.5 * Math.pow((controls.temperature - 298) / 8, 2));
        let p = 0.70
          + (controls.mineralCatalysis ? 0.18 : 0.0)
          + 0.12 * tempBoost
          - 0.20 * (controls.energyInputs.uv / 100);
        
        p = Math.min(0.995, Math.max(0.5, p));
        newState.perBaseAccuracy = p;
        
        // Calculate Eigen threshold
        const L = Math.max(1, Math.round(newState.meanStrandLength));
        const s = 2.0;
        const pCrit = 1 - Math.log(s) / L;
        newState.passesEigen = (p >= pCrit);
        newState.strandFidelity = Math.pow(p, L);
      }
      
      if (phase >= 4) {
        // RNA World stage - combines template and catalytic functions
        const rnaWorldReady = controls.energyInputs.uv >= 25 && controls.energyInputs.uv <= 45 &&
                             controls.energyInputs.lightning >= 30 && controls.energyInputs.lightning <= 55 &&
                             controls.chemistryRichness >= 85 &&
                             controls.waterActivity >= 75 &&
                             Math.abs(controls.temperature - 298) <= 5;
        
        if (rnaWorldReady && newState.passesEigen) {
          newState.templateStrands = mineralFactor * richnessFactor * 30; // Higher template activity
          newState.meanStrandLength = 50; // Longer functional RNAs
          newState.rnaStrands = mineralFactor * richnessFactor * 50;
          newState.rnaLength = 100;
        }
      }
      
      if (phase >= 5) {
        // First Life stage - integrated DNA-protein-RNA machinery
        const firstLifeReady = controls.energyInputs.uv >= 20 && controls.energyInputs.uv <= 35 &&
                               controls.energyInputs.dryWetCycling >= 80 &&
                               controls.chemistryRichness >= 85 &&
                               controls.waterActivity >= 75 && controls.waterActivity <= 90 &&
                               Math.abs(controls.temperature - 298) <= 3;
        
        if (firstLifeReady && newState.perBaseAccuracy > 0.85) {
          newState.dnaStrands = mineralFactor * richnessFactor * 20;
          newState.dnaLength = 200;
          // Boost all other systems for first integrated cellular life
          newState.rnaStrands = Math.max(newState.rnaStrands, 100);
          newState.templateStrands = Math.max(newState.templateStrands, 50);
        }
      }
      
      // Life potential calculation
      const L = Math.max(1, Math.round(newState.meanStrandLength));
      const infoFactor = Math.min(1, L / 20);
      const baseHeredityScore = 0.6 * newState.perBaseAccuracy + 0.4 * infoFactor * newState.perBaseAccuracy;
      
      let stageMultiplier = 1.0;
      let maxPotential = 40;
      
      if (newState.stage >= 4 && newState.rnaStrands >= 5) {
        maxPotential = 80; // RNA World unlocks 80%
        stageMultiplier = 1.2;
      }
      if (newState.stage >= 5 && newState.dnaStrands >= 3) {
        maxPotential = 100; // First Life unlocks full potential
        stageMultiplier = 1.5;
      }
      
      const rawPotential = (
        (newState.meanPeptideLength / 20) * 0.3 +
        (newState.encapsulationRate) * 0.3 +
        (baseHeredityScore) * 0.4
      ) * 100 * stageMultiplier;
      
      newState.lifePotential = Math.max(0, Math.min(maxPotential, rawPotential));
      
      return newState;
    };

    setSimulationState(calculatePhaseState(selectedPhase, controls));
  }, [selectedPhase, controls]);


  const handlePhaseClick = (phase: number) => {
    setSelectedPhase(phase);
  };

  return (
    <div className='container mx-auto px-4 py-8 max-w-7xl'>
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        
        {/* Left Panel - Simulation Canvas */}
        <div className='lg:col-span-2 space-y-4'>
          <Card className='bg-white/5 border-white/20 text-white'>
            <CardHeader>
              <CardTitle className='text-2xl bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-transparent'>
                Abiogenesis Lab: From Chemistry to Codes
              </CardTitle>
              <CardDescription className='text-gray-300'>
                Interactive simulation of life's chemical origins
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SimulationCanvas 
                state={simulationState} 
                controls={controls} 
                selectedPhase={selectedPhase}
                onPhaseClick={handlePhaseClick}
              />
              
              <div className='mt-4 text-center text-sm text-gray-400'>
                Click on any phase above to explore that stage of abiogenesis
              </div>
            </CardContent>
          </Card>
          
          <StageInfo stage={selectedPhase} />
        </div>

        {/* Right Panel - Controls */}
        <div className='space-y-4'>
          <Card className='bg-white/5 border-white/20 text-white'>
            <CardHeader>
              <CardTitle className='text-lg'>Environmental Controls</CardTitle>
            </CardHeader>
            <CardContent className='space-y-4'>
              
              {/* Energy Inputs */}
              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <h4 className='text-sm font-semibold text-blue-300'>Energy Inputs</h4>
                  {simulationState.stage >= 4 && (
                    <div className='text-xs text-red-400 bg-red-900/20 px-2 py-1 rounded border border-red-500/30'>
                      ⚠️ RNA/DNA require precise tuning
                    </div>
                  )}
                </div>
                
                <div className='space-y-2'>
                  <div className='flex justify-between items-center'>
                    <label className='text-xs'>UV Radiation</label>
                    <span className='text-xs text-gray-400'>{(controls.energyInputs.uv * 0.3).toFixed(1)} W/m²</span>
                  </div>
                  <div className='relative'>
                    <Slider
                      value={[controls.energyInputs.uv]}
                      onValueChange={(value) => setControls(prev => ({
                        ...prev,
                        energyInputs: { ...prev.energyInputs, uv: value[0] }
                      }))}
                      max={100}
                      step={1}
                      className='w-full'
                    />
                    {/* Dynamic optimal range indicator */}
                    <div className='absolute top-2 h-2 bg-green-500/30 rounded pointer-events-none' 
                         style={{
                           left: simulationState.stage < 4 ? '30%' : simulationState.stage < 5 ? '25%' : '20%',
                           width: simulationState.stage < 4 ? '30%' : simulationState.stage < 5 ? '20%' : '15%'
                         }}></div>
                    <div className='flex justify-between text-xs text-gray-600 mt-1'>
                      <span>0</span>
                      <span className='text-green-400 font-bold'>
                        {simulationState.stage < 4 ? '30-60 (energy for chemistry)' :
                         simulationState.stage < 5 ? '25-45 (template formation)' :
                         '20-35 (DNA precision)'}
                      </span>
                      <span>100</span>
                    </div>
                  </div>
                  <div className='text-xs text-gray-500 mt-1'>
                    {controls.energyInputs.uv < 10 ? 'Safe for humans' :
                     controls.energyInputs.uv < 30 ? 'Sunburn in hours' :
                     controls.energyInputs.uv < 60 ? 'DNA damage, cancer risk' :
                     'Lethal to most life'}
                  </div>
                </div>

                <div className='space-y-2'>
                  <div className='flex justify-between items-center'>
                    <label className='text-xs'>Lightning</label>
                    <span className='text-xs text-gray-400'>{(controls.energyInputs.lightning * 0.02).toFixed(1)} strikes/km²/yr</span>
                  </div>
                  <div className='relative'>
                    <Slider
                      value={[controls.energyInputs.lightning]}
                      onValueChange={(value) => setControls(prev => ({
                        ...prev,
                        energyInputs: { ...prev.energyInputs, lightning: value[0] }
                      }))}
                      max={100}
                      step={1}
                      className='w-full'
                    />
                    {/* Dynamic optimal range indicator */}
                    <div className='absolute top-2 h-2 bg-green-500/30 rounded pointer-events-none' 
                         style={{
                           left: simulationState.stage < 3 ? '50%' : simulationState.stage < 5 ? '40%' : '30%',
                           width: simulationState.stage < 3 ? '30%' : simulationState.stage < 5 ? '20%' : '25%'
                         }}></div>
                    <div className='flex justify-between text-xs text-gray-600 mt-1'>
                      <span>0</span>
                      <span className='text-green-400 font-bold'>
                        {simulationState.stage < 3 ? '50-80 (amino acids)' :
                         simulationState.stage < 5 ? '40-60 (protocells)' :
                         '30-55 (RNA stability)'}
                      </span>
                      <span>100</span>
                    </div>
                  </div>
                  <div className='text-xs text-gray-500 mt-1'>
                    {controls.energyInputs.lightning < 25 ? 'Rural areas' :
                     controls.energyInputs.lightning < 50 ? 'Thunderstorm regions' :
                     controls.energyInputs.lightning < 75 ? 'Tropical storm zones' :
                     'Constant electrical storms'}
                  </div>
                </div>

                <div className='space-y-2'>
                  <div className='flex justify-between items-center'>
                    <label className='text-xs'>Hydrothermal</label>
                    <span className='text-xs text-gray-400'>{(controls.energyInputs.hydrothermal * 0.5).toFixed(1)} MW/km²</span>
                  </div>
                  <div className='relative'>
                    <Slider
                      value={[controls.energyInputs.hydrothermal]}
                      onValueChange={(value) => setControls(prev => ({
                        ...prev,
                        energyInputs: { ...prev.energyInputs, hydrothermal: value[0] }
                      }))}
                      max={100}
                      step={1}
                      className='w-full'
                    />
                    {/* Dynamic optimal range indicator */}
                    <div className='absolute top-2 h-2 bg-green-500/30 rounded pointer-events-none' 
                         style={{
                           left: simulationState.stage < 2 ? '40%' : simulationState.stage < 4 ? '60%' : '70%',
                           width: simulationState.stage < 2 ? '40%' : simulationState.stage < 4 ? '20%' : '15%'
                         }}></div>
                    <div className='flex justify-between text-xs text-gray-600 mt-1'>
                      <span>0</span>
                      <span className='text-green-400 font-bold'>
                        {simulationState.stage < 2 ? '40-80 (amino synthesis)' :
                         simulationState.stage < 4 ? '60-80 (vesicle formation)' :
                         '70-85 (template stability)'}
                      </span>
                      <span>100</span>
                    </div>
                  </div>
                  <div className='text-xs text-gray-500 mt-1'>
                    {controls.energyInputs.hydrothermal < 20 ? 'Hot springs' :
                     controls.energyInputs.hydrothermal < 40 ? 'Yellowstone geysers' :
                     controls.energyInputs.hydrothermal < 70 ? 'Ocean floor vents' :
                     'Volcanic activity'}
                  </div>
                </div>

                <div className='space-y-2'>
                  <div className='flex justify-between items-center'>
                    <label className='text-xs'>Dry-Wet Cycling</label>
                    <span className='text-xs text-gray-400'>{(controls.energyInputs.dryWetCycling * 0.1).toFixed(1)} cycles/day</span>
                  </div>
                  <div className='relative'>
                    <Slider
                      value={[controls.energyInputs.dryWetCycling]}
                      onValueChange={(value) => setControls(prev => ({
                        ...prev,
                        energyInputs: { ...prev.energyInputs, dryWetCycling: value[0] }
                      }))}
                      max={100}
                      step={1}
                      className='w-full'
                    />
                    {/* Dynamic optimal range indicator */}
                    <div className='absolute top-2 h-2 bg-green-500/30 rounded pointer-events-none' 
                         style={{
                           left: simulationState.stage < 2 ? '60%' : simulationState.stage < 4 ? '70%' : '80%',
                           width: simulationState.stage < 2 ? '30%' : simulationState.stage < 4 ? '20%' : '15%'
                         }}></div>
                    <div className='flex justify-between text-xs text-gray-600 mt-1'>
                      <span>0</span>
                      <span className='text-green-400 font-bold'>
                        {simulationState.stage < 2 ? '60-90 (peptide formation)' :
                         simulationState.stage < 4 ? '70-90 (concentration)' :
                         '80-95 (critical for RNA/DNA)'}
                      </span>
                      <span>100</span>
                    </div>
                  </div>
                  <div className='text-xs text-gray-500 mt-1'>
                    {controls.energyInputs.dryWetCycling < 25 ? 'Stable pools' :
                     controls.energyInputs.dryWetCycling < 50 ? 'Tidal zones' :
                     controls.energyInputs.dryWetCycling < 75 ? 'Desert flash floods' :
                     'Extreme wet-dry cycles'}
                  </div>
                </div>
              </div>

              {/* Chemistry & Environment */}
              <div className='space-y-3'>
                <div className='flex items-center justify-between'>
                  <h4 className='text-sm font-semibold text-green-300'>Chemistry & Environment</h4>
                  {simulationState.stage >= 4 && simulationState.perBaseAccuracy < 0.85 && (
                    <div className='text-xs text-red-400 bg-red-900/20 px-2 py-1 rounded border border-red-500/30'>
                      ⚠️ Need 85%+ accuracy for DNA
                    </div>
                  )}
                </div>
                
                <div className='space-y-2'>
                  <div className='flex justify-between items-center'>
                    <label className='text-xs'>Chemistry Richness</label>
                    <span className='text-xs text-gray-400'>{(controls.chemistryRichness * 0.01).toFixed(2)} M total</span>
                  </div>
                  <div className='relative'>
                    <Slider
                      value={[controls.chemistryRichness]}
                      onValueChange={(value) => setControls(prev => ({ ...prev, chemistryRichness: value[0] }))}
                      max={100}
                      step={1}
                      className='w-full'
                    />
                    {/* Dynamic optimal range indicator */}
                    <div className='absolute top-2 h-2 bg-green-500/30 rounded pointer-events-none' 
                         style={{
                           left: simulationState.stage < 1 ? '50%' : simulationState.stage < 4 ? '70%' : '85%',
                           width: simulationState.stage < 1 ? '40%' : simulationState.stage < 4 ? '25%' : '15%'
                         }}></div>
                    <div className='flex justify-between text-xs text-gray-600 mt-1'>
                      <span>0</span>
                      <span className='text-green-400 font-bold'>
                        {simulationState.stage < 1 ? '50-90 (precursor diversity)' :
                         simulationState.stage < 4 ? '70-95 (complex chemistry)' :
                         '85-100 (maximum complexity)'}
                      </span>
                      <span>100</span>
                    </div>
                  </div>
                  <div className='text-xs text-gray-500 mt-1'>
                    {controls.chemistryRichness < 25 ? 'Pure water' :
                     controls.chemistryRichness < 50 ? 'River water' :
                     controls.chemistryRichness < 75 ? 'Seawater' :
                     'Concentrated brine'}
                  </div>
                </div>

                <div className='space-y-2'>
                  <div className='flex justify-between items-center'>
                    <label className='text-xs'>Water Activity</label>
                    <span className='text-xs text-gray-400'>{(controls.waterActivity * 0.01).toFixed(2)} aw</span>
                  </div>
                  <div className='relative'>
                    <Slider
                      value={[controls.waterActivity]}
                      onValueChange={(value) => setControls(prev => ({ ...prev, waterActivity: value[0] }))}
                      max={100}
                      step={1}
                      className='w-full'
                    />
                    {/* Dynamic optimal range indicator */}
                    <div className='absolute top-2 h-2 bg-green-500/30 rounded pointer-events-none' 
                         style={{
                           left: simulationState.stage < 3 ? '60%' : simulationState.stage < 5 ? '70%' : '75%',
                           width: simulationState.stage < 3 ? '35%' : simulationState.stage < 5 ? '20%' : '15%'
                         }}></div>
                    <div className='flex justify-between text-xs text-gray-600 mt-1'>
                      <span>0</span>
                      <span className='text-green-400 font-bold'>
                        {simulationState.stage < 3 ? '60-95 (vesicle formation)' :
                         simulationState.stage < 5 ? '70-90 (compartmentalization)' :
                         '75-90 (RNA/DNA stability)'}
                      </span>
                      <span>100</span>
                    </div>
                  </div>
                  <div className='text-xs text-gray-500 mt-1'>
                    {controls.waterActivity < 25 ? 'Dry salt' :
                     controls.waterActivity < 50 ? 'Honey consistency' :
                     controls.waterActivity < 75 ? 'Seawater' :
                     'Pure water'}
                  </div>
                </div>

                <div className='space-y-2'>
                  <div className='flex justify-between items-center'>
                    <label className='text-xs'>Temperature</label>
                    <span className='text-xs text-gray-400'>{controls.temperature} K ({(controls.temperature - 273.15).toFixed(0)}°C)</span>
                  </div>
                  <div className='relative'>
                    <Slider
                      value={[controls.temperature]}
                      onValueChange={(value) => setControls(prev => ({ ...prev, temperature: value[0] }))}
                      min={253}  // -20°C
                      max={673}  // 400°C
                      step={1}
                      className='w-full'
                    />
                    {/* Dynamic optimal range indicator */}
                    <div className='absolute top-2 h-2 bg-green-500/30 rounded pointer-events-none' 
                         style={{
                           left: `${((simulationState.stage < 4 ? 288 : simulationState.stage < 5 ? 293 : 295) - 253) / (673 - 253) * 100}%`,
                           width: `${(simulationState.stage < 4 ? 20 : simulationState.stage < 5 ? 10 : 6) / (673 - 253) * 100}%`
                         }}></div>
                  </div>
                  <div className='flex justify-between text-xs text-gray-500'>
                    <span>253 K (-20°C)</span>
                    <span className='text-green-400 font-bold'>
                      {simulationState.stage < 4 ? '298 K (±10K optimal)' :
                       simulationState.stage < 5 ? '298 K (±5K for RNA)' :
                       '298 K (±3K for DNA)'}
                    </span>
                    <span>673 K (400°C)</span>
                  </div>
                  <div className='text-xs text-gray-500 mt-1 text-center'>
                    {controls.temperature < 273 ? 'Frozen, slow chemistry' :
                     controls.temperature < 310 ? 'Human body temperature' :
                     controls.temperature < 373 ? 'Hot bath to boiling' :
                     controls.temperature < 473 ? 'Pressure cooker' :
                     controls.temperature < 573 ? 'Deep hydrothermal vents' :
                     'Extreme volcanic conditions'}
                  </div>
                  {/* Dynamic temperature feedback */}
                  {simulationState.stage < 4 && Math.abs(controls.temperature - 298) <= 10 && (
                    <div className='text-xs text-green-400 mt-1 text-center font-bold'>
                      ✓ Good for basic templates!
                    </div>
                  )}
                  {simulationState.stage >= 4 && simulationState.stage < 5 && Math.abs(controls.temperature - 298) <= 5 && (
                    <div className='text-xs text-green-400 mt-1 text-center font-bold'>
                      ✓ Suitable for RNA formation!
                    </div>
                  )}
                  {simulationState.stage >= 5 && Math.abs(controls.temperature - 298) <= 3 && (
                    <div className='text-xs text-green-400 mt-1 text-center font-bold'>
                      ✓ Perfect for DNA stability!
                    </div>
                  )}
                  {simulationState.stage >= 4 && Math.abs(controls.temperature - 298) > (simulationState.stage < 5 ? 5 : 3) && (
                    <div className='text-xs text-red-400 mt-1 text-center font-bold'>
                      ⚠️ Too far from 298K for {simulationState.stage < 5 ? 'RNA' : 'DNA'}!
                    </div>
                  )}
                </div>
              </div>

            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* System Readouts - Full Width */}
      <Card className='bg-white/5 border-white/20 text-white mt-6'>
        <CardHeader>
          <CardTitle className='text-xl'>System Readouts</CardTitle>
          {educatorMode && (
            <CardDescription className='text-sm text-gray-300'>
              These metrics track the molecular complexity and replication fidelity of your prebiotic system
            </CardDescription>
          )}
        </CardHeader>
        <CardContent className='space-y-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 text-sm'>
            <div>
              <span className='text-gray-400'>Amino Acids:</span>
              <div className='font-mono text-lg'>{simulationState.aminoAcidYield.toFixed(1)} ppm</div>
              {educatorMode && (
                <div className='text-xs text-blue-300 mt-1'>
                  Building blocks of proteins. Miller-Urey experiments produced ~2-15 ppm. <span className='text-red-300'>⚠️ Lab produces 50/50 mix of left/right-handed amino acids, but life uses only left-handed forms.</span>
                </div>
              )}
            </div>
            <div>
              <span className='text-gray-400'>Peptides:</span>
              <div className='font-mono text-lg'>{simulationState.peptideCount.toFixed(0)}</div>
              {educatorMode && (
                <div className='text-xs text-blue-300 mt-1'>
                  Short protein chains. Fox's thermal proteins formed 3-18 amino acid chains. Catalytic activity emerges at 5+ residues. <span className='text-red-300'>⚠️ Mixed chirality peptides have different properties than biological proteins.</span>
                </div>
              )}
            </div>
            <div>
              <span className='text-gray-400'>Vesicles:</span>
              <div className='font-mono text-lg'>{simulationState.vesicleCount.toFixed(0)}</div>
              {educatorMode && (
                <div className='text-xs text-blue-300 mt-1'>
                  Fatty acid bubbles that concentrate reactions. Szostak lab creates stable vesicles from 8-12 carbon chains.
                </div>
              )}
            </div>
            <div>
              <span className='text-gray-400'>Templates:</span>
              <div className='font-mono text-lg'>{simulationState.templateStrands.toFixed(0)}</div>
              {educatorMode && (
                <div className='text-xs text-blue-300 mt-1'>
                  Simple self-copying molecules. Lincoln & Joyce (2009) created RNA enzymes that replicate each other <span className='text-yellow-300'>using purified components - not from prebiotic conditions.</span>
                </div>
              )}
            </div>
            <div>
              <span className='text-gray-400'>RNA:</span>
              <div className='font-mono text-lg'>{simulationState.rnaStrands.toFixed(0)}</div>
              {educatorMode && (
                <div className='text-xs text-blue-300 mt-1'>
                  Catalytic RNA (ribozymes). Ribosomes use 23S rRNA to catalyze peptide bonds. Some speed reactions 10⁷x. <span className='text-yellow-300'>⚠️ No prebiotic pathway to complex ribozymes demonstrated.</span> <span className='text-red-300'>RNA requires right-handed sugars - prebiotic synthesis gives mixed chirality.</span>
                </div>
              )}
            </div>
            <div>
              <span className='text-gray-400'>DNA:</span>
              <div className='font-mono text-lg'>{simulationState.dnaStrands.toFixed(0)}</div>
              {educatorMode && (
                <div className='text-xs text-blue-300 mt-1'>
                  Stable double helix storing 3.2 billion base pairs in humans. 100,000x more stable than RNA. <span className='text-yellow-300'>⚠️ Prebiotic DNA synthesis remains unsolved.</span> <span className='text-red-300'>DNA also requires homochiral (right-handed) sugars not found in prebiotic chemistry.</span>
                </div>
              )}
            </div>
            <div>
              <span className='text-gray-400'>Per-Base:</span>
              <div className='font-mono text-lg'>{(simulationState.perBaseAccuracy * 100).toFixed(1)}%</div>
              {educatorMode && (
                <div className='text-xs text-blue-300 mt-1'>
                  Accuracy per nucleotide. E. coli DNA polymerase: 99.9%. Early RNA replicases: ~85-95%.
                </div>
              )}
            </div>
            <div>
              <span className='text-gray-400'>Strand:</span>
              <div className='font-mono text-lg'>{(simulationState.strandFidelity * 100).toFixed(1)}%</div>
              {educatorMode && (
                <div className='text-xs text-blue-300 mt-1'>
                  Whole-strand fidelity = (per-base accuracy)^length. 90% accuracy over 100 bases = 0.003% success.
                </div>
              )}
            </div>
            <div>
              <span className='text-gray-400'>Eigen:</span>
              <div className={`font-mono text-lg ${simulationState.passesEigen ? 'text-green-400' : 'text-red-400'}`}>
                {simulationState.passesEigen ? '✓ Pass' : '✗ Fail'}
                {simulationState.stage >= 4 && !simulationState.passesEigen && (
                  <span className='ml-2 text-red-400'>⚠️ Critical for RNA</span>
                )}
              </div>
              {educatorMode && (
                <div className='text-xs text-blue-300 mt-1'>
                  <strong>Theoretical limit:</strong> Eigen's threshold (1971): p_crit = 1 - ln(s)/L. For 100-base RNA: need 99.3% accuracy. <span className='text-yellow-300'>⚠️ No lab has achieved prebiotic RNA/DNA formation meeting this threshold.</span>
                </div>
              )}
            </div>
          </div>
          
        </CardContent>
      </Card>
    </div>
  );
}
