import React, { useState, useCallback, useEffect } from 'react';
import { ImageUpload } from './components/ImageUpload';
import { PoseGrid } from './components/PoseGrid';
import { POSE_LABELS, PoseVariation, generatePoseVariation } from './lib/gemini';
import { Button } from '@/components/ui/button';
import { Sparkles, RefreshCw, Camera, LayoutGrid, Info, Download, LogIn, LogOut, User as UserIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import JSZip from 'jszip';
import { auth, signInWithGoogle, logout, onAuthStateChanged, User } from './lib/firebase';
import { SnowEffect } from './components/SnowEffect';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [baseImage, setBaseImage] = useState<{ file: File; base64: string } | null>(null);
  const [variations, setVariations] = useState<PoseVariation[]>(
    POSE_LABELS.map((label, i) => ({ id: i, label, status: 'idle' }))
  );
  const [isGenerating, setIsGenerating] = useState(false);
  const [isZipping, setIsZipping] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleUpload = useCallback((file: File, base64: string) => {
    setBaseImage({ file, base64 });
    // Reset variations when new image is uploaded
    setVariations(POSE_LABELS.map((label, i) => ({ id: i, label, status: 'idle' })));
  }, []);

  const downloadAll = async () => {
    const successVariations = variations.filter(v => v.status === 'success' && v.imageUrl);
    if (successVariations.length === 0) return;

    setIsZipping(true);
    try {
      const zip = new JSZip();
      
      for (const pose of successVariations) {
        const base64Data = pose.imageUrl!.split(',')[1];
        zip.file(`${pose.label.replace(/\s+/g, '_')}.png`, base64Data, { base64: true });
      }

      const content = await zip.generateAsync({ type: 'blob' });
      const link = document.createElement('a');
      link.href = URL.createObjectURL(content);
      link.download = `Tu_Anh_Studio_Poses.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("Lỗi khi nén ảnh:", error);
    } finally {
      setIsZipping(false);
    }
  };

  const startGeneration = async () => {
    if (!baseImage || !user) return;

    setIsGenerating(true);
    const newVariations = [...variations];

    // Process variations
    for (let i = 0; i < newVariations.length; i++) {
      // Update status to loading
      setVariations(prev => prev.map((v, idx) => idx === i ? { ...v, status: 'loading' } : v));

      try {
        const base64Data = baseImage.base64.split(',')[1];
        const mimeType = baseImage.file.type;
        
        const imageUrl = await generatePoseVariation(base64Data, mimeType, POSE_LABELS[i]);
        
        setVariations(prev => prev.map((v, idx) => idx === i ? { 
          ...v, 
          status: 'success', 
          imageUrl 
        } : v));
      } catch (error) {
        setVariations(prev => prev.map((v, idx) => idx === i ? { 
          ...v, 
          status: 'error', 
          error: error instanceof Error ? error.message : 'Lỗi không xác định' 
        } : v));
      }
      
      // Small delay between requests to be gentle on the API
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    setIsGenerating(false);
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center">
        <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-primary selection:text-primary-foreground relative overflow-x-hidden">
      <SnowEffect />
      
      {/* Header / Navigation */}
      <header className="fixed top-0 w-full z-50 border-b border-white/5 bg-black/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
              <Camera className="h-5 w-5 text-black" />
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-xl tracking-tight uppercase leading-none">Tú Anh Studio</span>
              <span className="text-[10px] font-medium text-white/40 uppercase tracking-widest mt-1">Đỗ Anh Điền</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="hidden sm:flex flex-col items-end">
                  <span className="text-xs font-bold">{user.displayName}</span>
                  <span className="text-[10px] text-white/40">{user.email}</span>
                </div>
                {user.photoURL ? (
                  <img src={user.photoURL} alt="Avatar" className="h-8 w-8 rounded-full border border-white/10" />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-white/10 flex items-center justify-center">
                    <UserIcon className="h-4 w-4" />
                  </div>
                )}
                <Button variant="ghost" size="icon" onClick={logout} className="text-white/40 hover:text-white">
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <Button onClick={signInWithGoogle} className="gap-2 font-bold uppercase tracking-tight">
                <LogIn className="h-4 w-4" />
                Đăng nhập Gmail
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="pt-32 pb-20 px-6 max-w-7xl mx-auto relative z-10">
        {!user ? (
          <div className="max-w-2xl mx-auto text-center space-y-8 py-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4"
            >
              <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
                Chào mừng tới <br />
                <span className="text-primary">Tú Anh Studio</span>
              </h1>
              <p className="text-white/60 text-lg">
                Vui lòng đăng nhập bằng Gmail để bắt đầu sử dụng công cụ tạo dáng AI chuyên nghiệp.
              </p>
            </motion.div>
            <Button size="lg" onClick={signInWithGoogle} className="h-16 px-12 text-xl font-black uppercase tracking-tight gap-4 shadow-2xl shadow-primary/20">
              <LogIn className="h-6 w-6" />
              Đăng nhập ngay
            </Button>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[400px_1fr] gap-12 items-start">
            {/* Sidebar / Controls */}
            <aside className="space-y-8 lg:sticky lg:top-32">
              <div className="space-y-4">
                <motion.h1 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-4xl md:text-5xl font-black leading-[0.9] tracking-tighter uppercase"
                >
                  Tạo dáng <br />
                  <span className="text-primary">Chuyên nghiệp</span>
                </motion.h1>
                <p className="text-white/60 text-lg leading-relaxed">
                  Tải lên một bức ảnh duy nhất và để AI tạo ra 9 góc độ pose thời trang đẳng cấp cho người mẫu của bạn.
                </p>
              </div>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-white/40">Ảnh gốc</label>
                  <ImageUpload onUpload={handleUpload} preview={baseImage?.base64 || null} />
                </div>

                <Button 
                  size="lg" 
                  className="w-full h-14 text-lg font-bold uppercase tracking-tight gap-3 shadow-2xl shadow-primary/20"
                  disabled={!baseImage || isGenerating}
                  onClick={startGeneration}
                >
                  {isGenerating ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      Đang xử lý...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      Bắt đầu tạo dáng
                    </>
                  )}
                </Button>

                <div className="p-4 rounded-xl bg-white/5 border border-white/10 flex gap-3">
                  <Info className="h-5 w-5 text-primary shrink-0" />
                  <p className="text-xs text-white/50 leading-normal">
                    Mẹo: Sử dụng ảnh có ánh sáng tốt và phông nền đơn giản để AI có thể nhận diện vóc dáng người mẫu chính xác nhất.
                  </p>
                </div>
              </div>
            </aside>

            {/* Main Content / Grid */}
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <LayoutGrid className="h-5 w-5 text-primary" />
                  <h2 className="text-xl font-bold uppercase tracking-tight">9 Khung hình Pose</h2>
                </div>
                <div className="flex items-center gap-4">
                  {variations.some(v => v.status === 'success') && (
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-8 text-[10px] font-bold uppercase tracking-widest border-white/10 hover:bg-white/5 gap-2"
                      onClick={downloadAll}
                      disabled={isZipping}
                    >
                      {isZipping ? <RefreshCw className="h-3 w-3 animate-spin" /> : <Download className="h-3 w-3" />}
                      Tải tất cả (.zip)
                    </Button>
                  )}
                  <div className="text-xs font-mono text-white/40">
                    {variations.filter(v => v.status === 'success').length} / 9 HOÀN TẤT
                  </div>
                </div>
              </div>

              <Separator className="bg-white/10" />

              <PoseGrid variations={variations} />

              {variations.every(v => v.status === 'idle') && !baseImage && (
                <div className="aspect-[16/9] flex flex-col items-center justify-center border border-dashed border-white/10 rounded-3xl bg-white/[0.02]">
                  <Camera className="h-12 w-12 text-white/10 mb-4" />
                  <p className="text-white/30 font-medium">Tải ảnh lên để bắt đầu trải nghiệm</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-white/5 py-12 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-2 opacity-50">
            <Camera className="h-4 w-4" />
            <span className="text-xs font-bold uppercase tracking-widest">Tú Anh Studio © 2026</span>
          </div>
          <div className="flex gap-8 text-[10px] font-bold uppercase tracking-[0.2em] text-white/30">
            <a href="#" className="hover:text-primary transition-colors">Privacy</a>
            <a href="#" className="hover:text-primary transition-colors">Terms</a>
            <a href="#" className="hover:text-primary transition-colors">API</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
