import { useState, useRef, useMemo } from "react";
import { Sidebar, MobileNav } from "@/components/Navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus, Camera, Calendar, Scale, Upload, Link as LinkIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, isWithinInterval, addMonths, subMonths, isSameMonth } from "date-fns";
import type { ProgressPhoto } from "@shared/schema";

export default function ProgressPhotos() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [uploadPreview, setUploadPreview] = useState("");
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [weight, setWeight] = useState("");
  const [notes, setNotes] = useState("");
  const [selectedPhoto, setSelectedPhoto] = useState<ProgressPhoto | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const isCurrentMonth = isSameMonth(selectedMonth, new Date());

  const { data: photos = [], isLoading } = useQuery<ProgressPhoto[]>({
    queryKey: ["/api/progress-photos"],
    queryFn: async () => {
      const res = await fetch("/api/progress-photos", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch progress photos");
      return res.json();
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: any) => {
      const res = await fetch("/api/progress-photos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to upload progress photo");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress-photos"] });
      setIsOpen(false);
      resetForm();
      toast({ title: "Photo added", description: "Your progress has been recorded!" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await fetch(`/api/progress-photos/${id}`, { method: "DELETE", credentials: "include" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/progress-photos"] });
      toast({ title: "Photo deleted" });
    },
  });

  const resetForm = () => {
    setImageUrl("");
    setUploadPreview("");
    setUploadFile(null);
    setWeight("");
    setNotes("");
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setUploadPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const uploadImage = async (): Promise<string | null> => {
    if (!uploadFile) return null;
    
    setIsUploading(true);
    try {
      const reader = new FileReader();
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(uploadFile);
      });
      const base64Data = await base64Promise;
      
      const res = await fetch("/api/upload-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64Data, fileName: uploadFile.name }),
        credentials: "include",
      });
      
      if (!res.ok) throw new Error("Upload failed");
      const { imageUrl } = await res.json();
      return imageUrl;
    } catch (err) {
      toast({ title: "Upload failed", description: "Could not upload image", variant: "destructive" });
      return null;
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async () => {
    let finalImageUrl = imageUrl.trim();
    
    // If there's a file upload, upload it first
    if (uploadFile) {
      const uploadedUrl = await uploadImage();
      if (!uploadedUrl) return;
      finalImageUrl = uploadedUrl;
    }
    
    if (!finalImageUrl) return;
    
    createMutation.mutate({
      imageUrl: finalImageUrl,
      weight: weight ? weight : null,
      notes: notes || null,
      date: new Date().toISOString(),
    });
  };

  const monthPhotos = useMemo(() => {
    const monthStart = startOfMonth(selectedMonth);
    const monthEnd = endOfMonth(selectedMonth);
    return photos.filter(photo => {
      const date = new Date(photo.date);
      return isWithinInterval(date, { start: monthStart, end: monthEnd });
    });
  }, [photos, selectedMonth]);

  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <MobileNav />
        <main className="flex-1 p-6 md:p-8 max-w-6xl mx-auto w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl font-bold tracking-tight">Progress Photos</h1>
              <p className="text-muted-foreground">Track your physical transformation over time</p>
            </div>
            
            <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if (!open) resetForm(); }}>
              <DialogTrigger asChild>
                <Button className="warrior-gradient accent-text shadow-lg" data-testid="button-add-photo">
                  <Plus className="h-4 w-4 mr-2" /> Add Photo
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Progress Photo</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Tabs defaultValue="upload" className="w-full" onValueChange={(value) => {
                    if (value === "url") {
                      setUploadFile(null);
                      setUploadPreview("");
                    } else {
                      setImageUrl("");
                    }
                  }}>
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="upload" className="flex items-center gap-2">
                        <Upload className="h-4 w-4" /> Upload
                      </TabsTrigger>
                      <TabsTrigger value="url" className="flex items-center gap-2">
                        <LinkIcon className="h-4 w-4" /> URL
                      </TabsTrigger>
                    </TabsList>
                    <TabsContent value="upload" className="space-y-4 mt-4">
                      <div>
                        <input 
                          ref={fileInputRef}
                          type="file" 
                          accept="image/*"
                          onChange={handleFileChange}
                          className="hidden"
                          data-testid="input-photo-file"
                        />
                        <div 
                          onClick={() => fileInputRef.current?.click()}
                          className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center cursor-pointer hover:border-primary/50 transition-colors"
                        >
                          {uploadPreview ? (
                            <img src={uploadPreview} alt="Preview" className="w-full h-48 object-cover rounded-lg" />
                          ) : (
                            <div className="flex flex-col items-center gap-2">
                              <Camera className="h-12 w-12 text-muted-foreground/50" />
                              <p className="text-sm text-muted-foreground">Click to select from camera roll</p>
                              <p className="text-xs text-muted-foreground">or drag and drop an image</p>
                            </div>
                          )}
                        </div>
                        {uploadFile && (
                          <p className="text-xs text-muted-foreground mt-2 text-center">{uploadFile.name}</p>
                        )}
                      </div>
                    </TabsContent>
                    <TabsContent value="url" className="space-y-4 mt-4">
                      <div>
                        <Label>Image URL</Label>
                        <Input 
                          value={imageUrl} 
                          onChange={(e) => setImageUrl(e.target.value)} 
                          placeholder="https://example.com/your-photo.jpg"
                          data-testid="input-photo-url"
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                          Paste a URL to your progress photo
                        </p>
                      </div>
                      {imageUrl && (
                        <div className="border rounded-lg overflow-hidden">
                          <img src={imageUrl} alt="Preview" className="w-full h-48 object-cover" onError={(e) => (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x300?text=Invalid+URL"} />
                        </div>
                      )}
                    </TabsContent>
                  </Tabs>
                  
                  <div>
                    <Label>Weight in lbs (optional)</Label>
                    <div className="relative">
                      <Scale className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input type="number" step="0.1" value={weight} onChange={(e) => setWeight(e.target.value)} placeholder="165" className="pl-10" data-testid="input-photo-weight" />
                    </div>
                  </div>
                  <div>
                    <Label>Notes (optional)</Label>
                    <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="How you're feeling, what you've achieved..." data-testid="input-photo-notes" />
                  </div>
                  <Button 
                    onClick={handleSubmit} 
                    disabled={createMutation.isPending || isUploading || (!imageUrl.trim() && !uploadFile)} 
                    className="w-full warrior-gradient accent-text" 
                    data-testid="button-submit-photo"
                  >
                    {isUploading ? "Uploading..." : createMutation.isPending ? "Adding..." : "Add Photo"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex items-center justify-center gap-2 mb-6">
            <Button variant="ghost" size="icon" onClick={() => setSelectedMonth(subMonths(selectedMonth, 1))} data-testid="button-prev-month">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-center min-w-[150px]">
              <span className="font-medium">{format(selectedMonth, "MMMM yyyy")}</span>
              {isCurrentMonth && <span className="text-xs text-muted-foreground ml-2">(This Month)</span>}
            </div>
            <Button variant="ghost" size="icon" onClick={() => setSelectedMonth(addMonths(selectedMonth, 1))} data-testid="button-next-month">
              <ChevronRight className="h-4 w-4" />
            </Button>
            {!isCurrentMonth && (
              <Button variant="outline" size="sm" onClick={() => setSelectedMonth(new Date())} data-testid="button-this-month">
                This Month
              </Button>
            )}
          </div>

          {isLoading ? (
            <p>Loading...</p>
          ) : monthPhotos.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {monthPhotos.map((photo) => (
                <Card key={photo.id} className="overflow-hidden hover:shadow-lg transition-all cursor-pointer group" data-testid={`photo-${photo.id}`} onClick={() => setSelectedPhoto(photo)}>
                  <div className="relative aspect-square">
                    <img 
                      src={photo.imageUrl} 
                      alt="Progress" 
                      className="w-full h-full object-cover"
                      onError={(e) => (e.target as HTMLImageElement).src = "https://via.placeholder.com/400x400?text=Image+Error"}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 bg-black/50 hover:bg-red-500/80 text-white"
                      onClick={(e) => { e.stopPropagation(); deleteMutation.mutate(photo.id); }}
                      data-testid={`button-delete-photo-${photo.id}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{format(new Date(photo.date), "MMM d, yyyy")}</span>
                      </div>
                      {photo.weight && (
                        <div className="flex items-center gap-1 font-medium accent-text">
                          <Scale className="h-4 w-4" />
                          <span>{photo.weight} lbs</span>
                        </div>
                      )}
                    </div>
                    {photo.notes && (
                      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">{photo.notes}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-muted-foreground">
              <Camera className="h-12 w-12 mx-auto mb-4 opacity-20" />
              <p>No progress photos this month</p>
            </div>
          )}

          <Dialog open={!!selectedPhoto} onOpenChange={(open) => !open && setSelectedPhoto(null)}>
            <DialogContent className="max-w-3xl">
              {selectedPhoto && (
                <>
                  <DialogHeader>
                    <DialogTitle>Progress Photo - {format(new Date(selectedPhoto.date), "MMMM d, yyyy")}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <img src={selectedPhoto.imageUrl} alt="Progress" className="w-full max-h-[60vh] object-contain rounded-lg" />
                    <div className="flex items-center gap-4">
                      {selectedPhoto.weight && (
                        <div className="flex items-center gap-2 text-lg font-medium">
                          <Scale className="h-5 w-5 accent-text" />
                          <span>{selectedPhoto.weight} lbs</span>
                        </div>
                      )}
                    </div>
                    {selectedPhoto.notes && (
                      <p className="text-muted-foreground">{selectedPhoto.notes}</p>
                    )}
                  </div>
                </>
              )}
            </DialogContent>
          </Dialog>
        </main>
      </div>
    </div>
  );
}
