import React from 'react';
import { PoseVariation } from '../lib/gemini';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Download, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion, AnimatePresence } from 'motion/react';

interface PoseGridProps {
  variations: PoseVariation[];
}

export function PoseGrid({ variations }: PoseGridProps) {
  const handleDownload = (url: string, label: string) => {
    const link = document.createElement('a');
    link.href = url;
    link.download = `${label.replace(/\s+/g, '_')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {variations.map((pose, index) => (
        <motion.div
          key={pose.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 }}
        >
          <Card className="overflow-hidden border-none bg-muted/30 group relative">
            <CardContent className="p-0 aspect-[3/4] relative">
              <AnimatePresence mode="wait">
                {pose.status === 'loading' ? (
                  <motion.div
                    key="loading"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center gap-4"
                  >
                    <Skeleton className="h-full w-full absolute inset-0" />
                    <div className="relative z-10 flex flex-col items-center gap-2">
                      <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                      <p className="text-sm font-medium animate-pulse">Đang tạo dáng...</p>
                    </div>
                  </motion.div>
                ) : pose.status === 'success' && pose.imageUrl ? (
                  <motion.div
                    key="success"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full w-full relative group"
                  >
                    <img
                      src={pose.imageUrl}
                      alt={pose.label}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4">
                      <Button
                        variant="secondary"
                        size="sm"
                        className="w-full gap-2"
                        onClick={() => handleDownload(pose.imageUrl!, pose.label)}
                      >
                        <Download className="h-4 w-4" />
                        Tải xuống
                      </Button>
                    </div>
                    <div className="absolute top-3 right-3">
                      <Badge variant="secondary" className="bg-green-500/20 text-green-400 border-green-500/30 gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        Hoàn tất
                      </Badge>
                    </div>
                  </motion.div>
                ) : pose.status === 'error' ? (
                  <motion.div
                    key="error"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center gap-2 bg-destructive/5"
                  >
                    <AlertCircle className="h-10 w-10 text-destructive" />
                    <p className="text-sm font-medium text-destructive">Lỗi tạo ảnh</p>
                    <p className="text-xs text-muted-foreground">{pose.error}</p>
                  </motion.div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                    <p className="text-xs text-muted-foreground uppercase tracking-widest font-medium">Chờ xử lý</p>
                  </div>
                )}
              </AnimatePresence>
            </CardContent>
            <div className="p-4 bg-card border-t">
              <div className="flex items-center justify-between gap-2">
                <span className="text-sm font-semibold truncate">{pose.label}</span>
                <span className="text-[10px] font-mono opacity-50">#{index + 1}</span>
              </div>
            </div>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}
