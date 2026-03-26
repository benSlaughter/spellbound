'use client';

import { SvgDaisy, SvgSunflower, SvgRose, SvgTulip, SvgBluebell, SvgDaffodil, SvgLavender, SvgRainbowArc, SvgBee } from '@/components/svg';
import {
  Tree, TreeEvergreen, TreePalm, Plant,
  Flower, FlowerLotus,
  Butterfly, Bug, Bird,
  Sun, SunDim, Cloud, CloudSun, Rainbow,
  Star, Sparkle, Trophy, Flag, Signpost,
  Drop, Mountains, PawPrint, Heart,
  Lock, Gear, House, Books, Calculator,
  Lightbulb, PencilSimple, MagnifyingGlass,
  MusicNotes, Medal, MagicWand, GameController,
  CalendarDots, Fire, Check, ArrowLeft, CaretRight,
  Leaf, ChartBar, Plus, Trash, X, Eye,
  Shuffle, PuzzlePiece, SpeakerHigh, HandFist,
  Confetti, Question,
  PersonSimpleHike, Cat, Dog, Fish, Baby, Ghost, Footprints,
} from '@phosphor-icons/react';

interface IconEntry {
  name: string;
  render: React.ReactNode;
  category: string;
}

const ICONS: IconEntry[] = [
  // Custom SVGs
  { category: 'Custom SVG', name: 'SvgDaisy', render: <SvgDaisy size={64} /> },
  { category: 'Custom SVG', name: 'SvgSunflower', render: <SvgSunflower size={64} /> },
  { category: 'Custom SVG', name: 'SvgRose', render: <SvgRose size={64} /> },
  { category: 'Custom SVG', name: 'SvgRainbowArc', render: <SvgRainbowArc size={200} /> },
  { category: 'Custom SVG', name: 'SvgBee', render: <SvgBee size={64} /> },

  // Phosphor — Nature
  { category: 'Phosphor Nature', name: 'Tree', render: <Tree weight="duotone" size={64} color="#4CAF50" /> },
  { category: 'Phosphor Nature', name: 'TreeEvergreen', render: <TreeEvergreen weight="duotone" size={64} color="#2E7D32" /> },
  { category: 'Phosphor Nature', name: 'TreePalm', render: <TreePalm weight="duotone" size={64} color="#8D6E63" /> },
  { category: 'Phosphor Nature', name: 'Plant', render: <Plant weight="duotone" size={64} color="#66BB6A" /> },
  { category: 'Phosphor Nature', name: 'Flower', render: <Flower weight="duotone" size={64} color="#E91E63" /> },
  { category: 'Phosphor Nature', name: 'FlowerLotus', render: <FlowerLotus weight="duotone" size={64} color="#FFD54F" /> },
  { category: 'Custom SVG', name: 'SvgTulip', render: <SvgTulip size={64} color="#AB47BC" /> },
  { category: 'Custom SVG', name: 'SvgBluebell', render: <SvgBluebell size={64} /> },
  { category: 'Custom SVG', name: 'SvgDaffodil', render: <SvgDaffodil size={64} /> },
  { category: 'Custom SVG', name: 'SvgLavender', render: <SvgLavender size={64} /> },
  { category: 'Phosphor Nature', name: 'Leaf', render: <Leaf weight="duotone" size={64} color="#43A047" /> },
  { category: 'Phosphor Nature', name: 'Mountains', render: <Mountains weight="duotone" size={64} color="#78909C" /> },
  { category: 'Phosphor Nature', name: 'Drop', render: <Drop weight="duotone" size={64} color="#42A5F5" /> },

  // Phosphor — Animals/Creatures
  { category: 'Phosphor Animals', name: 'Butterfly', render: <Butterfly weight="duotone" size={64} color="#9C27B0" /> },
  { category: 'Phosphor Animals', name: 'Bug', render: <Bug weight="duotone" size={64} color="#FFC107" /> },
  { category: 'Phosphor Animals', name: 'Bird', render: <Bird weight="duotone" size={64} color="#A1887F" /> },
  { category: 'Phosphor Animals', name: 'PawPrint', render: <PawPrint weight="duotone" size={64} color="#8D6E63" /> },
  { category: 'Phosphor Animals', name: 'PersonSimpleHike', render: <PersonSimpleHike weight="duotone" size={64} color="#8D6E63" /> },
  { category: 'Phosphor Animals', name: 'Cat', render: <Cat weight="duotone" size={64} color="#FF8A65" /> },
  { category: 'Phosphor Animals', name: 'Dog', render: <Dog weight="duotone" size={64} color="#8D6E63" /> },
  { category: 'Phosphor Animals', name: 'Fish', render: <Fish weight="duotone" size={64} color="#42A5F5" /> },
  { category: 'Phosphor Animals', name: 'Baby', render: <Baby weight="duotone" size={64} color="#FF8A65" /> },
  { category: 'Phosphor Animals', name: 'Ghost', render: <Ghost weight="duotone" size={64} color="#9E9E9E" /> },
  { category: 'Phosphor Animals', name: 'Footprints', render: <Footprints weight="duotone" size={64} color="#8D6E63" /> },

  // Phosphor — Weather
  { category: 'Phosphor Weather', name: 'Sun', render: <Sun weight="duotone" size={64} color="#FFB300" /> },
  { category: 'Phosphor Weather', name: 'SunDim', render: <SunDim weight="duotone" size={64} color="#FFD54F" /> },
  { category: 'Phosphor Weather', name: 'Cloud', render: <Cloud weight="duotone" size={64} color="#B0BEC5" /> },
  { category: 'Phosphor Weather', name: 'CloudSun', render: <CloudSun weight="duotone" size={64} color="#FFB300" /> },
  { category: 'Phosphor Weather', name: 'Rainbow', render: <Rainbow weight="duotone" size={64} color="#E91E63" /> },
  { category: 'Phosphor Weather', name: 'Fire', render: <Fire weight="duotone" size={64} color="#FF5722" /> },

  // Phosphor — Rewards/Feedback
  { category: 'Phosphor Rewards', name: 'Star', render: <Star weight="duotone" size={64} color="#FFD54F" /> },
  { category: 'Phosphor Rewards', name: 'Star (fill)', render: <Star weight="fill" size={64} color="#FFD54F" /> },
  { category: 'Phosphor Rewards', name: 'Sparkle', render: <Sparkle weight="duotone" size={64} color="#FFD54F" /> },
  { category: 'Phosphor Rewards', name: 'Trophy', render: <Trophy weight="duotone" size={64} color="#FFD54F" /> },
  { category: 'Phosphor Rewards', name: 'Medal', render: <Medal weight="duotone" size={64} color="#FF9800" /> },
  { category: 'Phosphor Rewards', name: 'Heart', render: <Heart weight="duotone" size={64} color="#E91E63" /> },
  { category: 'Phosphor Rewards', name: 'Confetti', render: <Confetti weight="duotone" size={64} color="#FF8A65" /> },
  { category: 'Phosphor Rewards', name: 'MagicWand', render: <MagicWand weight="duotone" size={64} color="#9C27B0" /> },

  // Phosphor — UI/Navigation
  { category: 'Phosphor UI', name: 'House', render: <House weight="duotone" size={64} color="#4CAF50" /> },
  { category: 'Phosphor UI', name: 'Books', render: <Books weight="duotone" size={64} color="#4CAF50" /> },
  { category: 'Phosphor UI', name: 'Calculator', render: <Calculator weight="duotone" size={64} color="#FF9800" /> },
  { category: 'Phosphor UI', name: 'GameController', render: <GameController weight="duotone" size={64} color="#9C27B0" /> },
  { category: 'Phosphor UI', name: 'Gear', render: <Gear weight="duotone" size={64} color="#78909C" /> },
  { category: 'Phosphor UI', name: 'Lock', render: <Lock weight="duotone" size={64} color="#9E9E9E" /> },
  { category: 'Phosphor UI', name: 'Lightbulb', render: <Lightbulb weight="duotone" size={64} color="#FFB300" /> },
  { category: 'Phosphor UI', name: 'PencilSimple', render: <PencilSimple weight="duotone" size={64} color="#78909C" /> },
  { category: 'Phosphor UI', name: 'MagnifyingGlass', render: <MagnifyingGlass weight="duotone" size={64} color="#42A5F5" /> },
  { category: 'Phosphor UI', name: 'SpeakerHigh', render: <SpeakerHigh weight="duotone" size={64} color="#42A5F5" /> },
  { category: 'Phosphor UI', name: 'Eye', render: <Eye weight="duotone" size={64} color="#78909C" /> },
  { category: 'Phosphor UI', name: 'Shuffle', render: <Shuffle weight="duotone" size={64} color="#9C27B0" /> },
  { category: 'Phosphor UI', name: 'PuzzlePiece', render: <PuzzlePiece weight="duotone" size={64} color="#FF8A65" /> },
  { category: 'Phosphor UI', name: 'MusicNotes', render: <MusicNotes weight="duotone" size={64} color="#2196F3" /> },
  { category: 'Phosphor UI', name: 'CalendarDots', render: <CalendarDots weight="duotone" size={64} color="#2196F3" /> },
  { category: 'Phosphor UI', name: 'ChartBar', render: <ChartBar weight="duotone" size={64} color="#4CAF50" /> },
  { category: 'Phosphor UI', name: 'Flag', render: <Flag weight="duotone" size={64} color="#EF5350" /> },
  { category: 'Phosphor UI', name: 'Signpost', render: <Signpost weight="duotone" size={64} color="#8D6E63" /> },
  { category: 'Phosphor UI', name: 'HandFist', render: <HandFist weight="duotone" size={64} color="#FF9800" /> },
  { category: 'Phosphor UI', name: 'Question', render: <Question weight="duotone" size={64} color="#9E9E9E" /> },

  // Phosphor — Actions
  { category: 'Phosphor Actions', name: 'Check', render: <Check weight="bold" size={64} color="#4CAF50" /> },
  { category: 'Phosphor Actions', name: 'X', render: <X weight="bold" size={64} color="#EF5350" /> },
  { category: 'Phosphor Actions', name: 'Plus', render: <Plus weight="bold" size={64} color="#4CAF50" /> },
  { category: 'Phosphor Actions', name: 'Trash', render: <Trash weight="duotone" size={64} color="#EF5350" /> },
  { category: 'Phosphor Actions', name: 'ArrowLeft', render: <ArrowLeft weight="bold" size={64} color="#78909C" /> },
  { category: 'Phosphor Actions', name: 'CaretRight', render: <CaretRight weight="bold" size={64} color="#78909C" /> },
];

export default function DevIconsPage() {
  const categories = [...new Set(ICONS.map((i) => i.category))];

  return (
    <div className="max-w-5xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-extrabold text-garden-text mb-2">Icon Library</h1>
      <p className="text-garden-text-light mb-8">All SVG and Phosphor icons used in SpellBound</p>

      {categories.map((cat) => (
        <section key={cat} className="mb-10">
          <h2 className="text-xl font-bold text-garden-text mb-4 border-b border-garden-border pb-2">{cat}</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {ICONS.filter((i) => i.category === cat).map((icon) => (
              <div
                key={icon.name}
                className="flex flex-col items-center gap-2 p-4 rounded-xl bg-white shadow-sm border border-garden-border/30"
              >
                <div className="flex items-center justify-center h-20">
                  {icon.render}
                </div>
                <span className="text-xs font-bold text-garden-text text-center leading-tight">
                  {icon.name}
                </span>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
