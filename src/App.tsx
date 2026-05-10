import React, { useState, useRef } from 'react';
import { Upload, Download, Smartphone, LayoutGrid, Info, Grid3X3, Apple } from 'lucide-react';
import { motion } from 'motion/react';
import JSZip from 'jszip';

interface IconSize {
  name: string;
  size: number;
  platform: 'ios' | 'android' | 'universal';
}

const ICON_SIZES: IconSize[] = [
  { name: 'App Store', size: 1024, platform: 'ios' },
  { name: 'iPhone Settings', size: 58, platform: 'ios' },
  { name: 'iPhone Spotlight', size: 80, platform: 'ios' },
  { name: 'iPhone App (2x)', size: 120, platform: 'ios' },
  { name: 'iPhone App (3x)', size: 180, platform: 'ios' },
  { name: 'iPad App', size: 76, platform: 'ios' },
  { name: 'iPad Pro App', size: 167, platform: 'ios' },
  { name: 'Play Store', size: 512, platform: 'android' },
  { name: 'Android Small', size: 48, platform: 'android' },
  { name: 'Android Medium', size: 72, platform: 'android' },
  { name: 'Android Large', size: 96, platform: 'android' },
  { name: 'Android XL', size: 144, platform: 'android' },
  { name: 'Android XXL', size: 192, platform: 'android' },
];

export default function App() {
  const [image, setImage] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = () => {
    setIsDragging(false);
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadAllIcons = async () => {
    if (!image) return;
    setIsExporting(true);
    setProgress(0);
    const zip = new JSZip();
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    img.src = image;
    await new Promise((resolve) => {
      img.onload = resolve;
    });

    for (let i = 0; i < ICON_SIZES.length; i++) {
        const { name, size } = ICON_SIZES[i];
        canvas.width = size;
        canvas.height = size;
        
        if (ctx) {
            ctx.clearRect(0, 0, size, size);
            ctx.drawImage(img, 0, 0, size, size);
            
            const blob = await new Promise<Blob | null>((resolve) => {
                canvas.toBlob(resolve, 'image/png');
            });
            
            if (blob) {
                zip.file(`${name.replace(/\s+/g, '_')}_${size}x${size}.png`, blob);
            }
        }
        setProgress(Math.round(((i + 1) / ICON_SIZES.length) * 100));
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(content);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'app_icons.zip';
    link.click();
    URL.revokeObjectURL(url);
    setIsExporting(false);
  };

  return (
    <div className="min-h-screen bg-[#F5F5F5] text-[#1A1A1A] font-sans selection:bg-[#FF69B4] selection:text-white pb-12">
      {/* Header */}
      <header className="border-b border-black/5 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-[#FF69B4] rounded-lg flex items-center justify-center text-white font-bold italic shadow-sm">
              SH
            </div>
            <h1 className="font-semibold text-lg tracking-tight">App Icon Generator</h1>
          </div>
          <div className="flex items-center gap-4">
            <button className="text-sm font-medium opacity-60 hover:opacity-100 transition-opacity flex items-center gap-1">
              <Info className="w-4 h-4" />
              Guidelines
            </button>
            {image && (
              <button 
                onClick={downloadAllIcons}
                disabled={isExporting}
                className="bg-black text-white px-4 py-2 rounded-full text-sm font-medium hover:bg-black/80 transition-colors flex items-center gap-2"
              >
                {isExporting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                    {progress}%
                  </>
                ) : (
                  <>
                    <Download className="w-4 h-4" />
                    Export All
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Column: Upload & Main Preview */}
          <div className="lg:col-span-7 space-y-8">
            {!image ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                onDragOver={onDragOver}
                onDragLeave={onDragLeave}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`
                  aspect-square rounded-3xl border-2 border-dashed flex flex-col items-center justify-center gap-6 cursor-pointer transition-all
                  ${isDragging ? 'border-[#FF69B4] bg-[#FF69B4]/5 scale-[0.99]' : 'border-black/10 bg-white hover:border-black/20'}
                `}
              >
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  onChange={handleFileChange} 
                  accept="image/*" 
                  className="hidden" 
                />
                <div className="w-20 h-20 rounded-2xl bg-[#F5F5F5] flex items-center justify-center text-black/40">
                  <Upload className="w-10 h-10" />
                </div>
                <div className="text-center space-y-2">
                  <p className="font-semibold text-xl">Drop your master icon here</p>
                  <p className="text-black/40 text-sm">Preferred size 1024x1024px PNG/SVG</p>
                </div>
              </motion.div>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-3xl p-8 shadow-sm border border-black/5 flex flex-col items-center justify-center relative group">
                  <button 
                    onClick={() => setImage(null)}
                    className="absolute top-6 right-6 p-2 bg-black/5 hover:bg-black/10 rounded-full transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </button>
                  <div className="relative group/icon">
                    <img 
                      src={image} 
                      alt="Master Icon" 
                      className="w-64 h-64 rounded-[22.5%] shadow-2xl transition-transform group-hover/icon:scale-[1.02]" 
                    />
                    <div className="absolute -inset-1 rounded-[22.5%] bg-gradient-to-tr from-[#FF69B4] to-purple-500 blur-xl opacity-20 -z-10 group-hover/icon:opacity-40 transition-opacity" />
                  </div>
                  <div className="mt-8 text-center space-y-1">
                    <p className="font-bold text-2xl tracking-tight">Master Asset</p>
                    <p className="text-black/40 text-sm font-mono uppercase tracking-widest">1024 x 1024 PX</p>
                  </div>
                </div>

                {/* Device Mocks */}
                <div className="grid grid-cols-2 gap-6">
                  <div className="bg-white rounded-2xl p-6 border border-black/5 space-y-4">
                    <div className="flex items-center justify-between text-black/40">
                      <Apple className="w-5 h-5" />
                      <span className="text-[10px] uppercase font-bold tracking-widest">iOS Preview</span>
                    </div>
                    <div className="h-48 rounded-xl bg-[#F0F0F0] relative overflow-hidden flex items-center justify-center">
                      <div className="absolute inset-0 bg-gradient-to-b from-blue-400 to-indigo-600 opacity-20" />
                      <img 
                        src={image} 
                        className="w-16 h-16 rounded-[22.5%] shadow-lg relative z-10" 
                        alt="iOS preview"
                      />
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {[0,1,2].map(i => <div key={i} className="w-1 h-1 rounded-full bg-white/40" />)}
                      </div>
                    </div>
                  </div>
                  <div className="bg-white rounded-2xl p-6 border border-black/5 space-y-4">
                    <div className="flex items-center justify-between text-black/40">
                      <Smartphone className="w-5 h-5" />
                      <span className="text-[10px] uppercase font-bold tracking-widest">Android Preview</span>
                    </div>
                    <div className="h-48 rounded-xl bg-[#202124] relative overflow-hidden flex items-center justify-center">
                      <div className="absolute inset-0 bg-white/5" />
                      <img 
                        src={image} 
                        className="w-16 h-16 rounded-full shadow-lg relative z-10" 
                        alt="Android preview"
                      />
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </div>

          {/* Right Column: Size Inventory */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white rounded-3xl p-6 border border-black/5 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold flex items-center gap-2">
                  <LayoutGrid className="w-5 h-5 text-[#FF69B4]" />
                  Size Inventory
                </h3>
                <span className="text-xs font-mono bg-black/5 px-2 py-1 rounded text-black/60">
                  {ICON_SIZES.length} FORMATS
                </span>
              </div>
              
              <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
                {ICON_SIZES.map((platformSize, index) => (
                  <div 
                    key={index}
                    className="flex items-center justify-between group p-3 rounded-xl hover:bg-[#F5F5F5] transition-colors border border-transparent hover:border-black/5"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg bg-[#F5F5F5] group-hover:bg-white flex items-center justify-center relative overflow-hidden transition-colors">
                        {image ? (
                          <img 
                            src={image} 
                            className={`w-full h-full object-cover ${platformSize.platform === 'ios' ? 'rounded-[22.5%]' : 'rounded-full'}`} 
                          />
                        ) : (
                          <Grid3X3 className="w-4 h-4 text-black/20" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-semibold">{platformSize.name}</p>
                        <p className="text-[10px] font-mono text-black/40">{platformSize.size} x {platformSize.size} PX</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Tips */}
            <div className="bg-[#FF69B4] rounded-3xl p-6 text-white overflow-hidden relative">
              <div className="relative z-10 space-y-2">
                <p className="font-bold">Pro Tip</p>
                <p className="text-sm text-white/80 leading-relaxed">
                  Apple recommends using a 1024x1024px image without rounded corners. The device will apply the mask automatically.
                </p>
              </div>
              <Apple className="absolute -bottom-4 -right-4 w-32 h-32 opacity-10 rotate-12" />
            </div>
          </div>
        </div>
      </main>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0,0,0,0.2);
        }
      `}</style>
    </div>
  );
}
