"use client";

import { useState, useRef, useCallback } from "react";
import Image from "next/image";
import { Upload, X, ImagePlus, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface ImageUploaderProps {
    images: string[];
    onChange: (images: string[]) => void;
    maxImages?: number;
}

export default function ImageUploader({
    images,
    onChange,
    maxImages = 6
}: ImageUploaderProps) {
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const supabase = createClient();

    const uploadFile = async (file: File): Promise<string | null> => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return null;

            const fileExt = file.name.split(".").pop();
            const fileName = `${user.id}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

            const { error } = await supabase.storage
                .from("pet-photos")
                .upload(fileName, file, {
                    cacheControl: "3600",
                    upsert: false,
                });

            if (error) {
                console.error("Upload error:", error);
                return null;
            }

            const { data: { publicUrl } } = supabase.storage
                .from("pet-photos")
                .getPublicUrl(fileName);

            return publicUrl;
        } catch (err) {
            console.error("Upload failed:", err);
            return null;
        }
    };

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);
        if (files.length === 0) return;

        const remainingSlots = maxImages - images.length;
        const filesToUpload = files.slice(0, remainingSlots);

        if (filesToUpload.length === 0) {
            alert(`最多只能上传 ${maxImages} 张图片`);
            return;
        }

        setUploading(true);
        setUploadProgress(new Array(filesToUpload.length).fill(0));

        const uploadPromises = filesToUpload.map(async (file, index) => {
            // Simulate progress
            const progressInterval = setInterval(() => {
                setUploadProgress(prev => {
                    const newProgress = [...prev];
                    if (newProgress[index] < 90) {
                        newProgress[index] += Math.random() * 20;
                    }
                    return newProgress;
                });
            }, 200);

            const url = await uploadFile(file);

            clearInterval(progressInterval);
            setUploadProgress(prev => {
                const newProgress = [...prev];
                newProgress[index] = 100;
                return newProgress;
            });

            return url;
        });

        const urls = await Promise.all(uploadPromises);
        const validUrls = urls.filter((url): url is string => url !== null);

        onChange([...images, ...validUrls]);
        setUploading(false);
        setUploadProgress([]);

        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    const removeImage = (index: number) => {
        const newImages = images.filter((_, i) => i !== index);
        onChange(newImages);
    };

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        const files = Array.from(e.dataTransfer.files).filter(file =>
            file.type.startsWith("image/")
        );

        if (files.length > 0 && fileInputRef.current) {
            const dt = new DataTransfer();
            files.forEach(file => dt.items.add(file));
            fileInputRef.current.files = dt.files;
            // Trigger file input change event manually
            const event = new Event('change', { bubbles: true });
            fileInputRef.current.dispatchEvent(event);
        }
    }, []);

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    return (
        <div className="space-y-4">
            {/* Upload Area */}
            {images.length < maxImages && (
                <div
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="border-2 border-dashed border-[var(--card-border)] rounded-2xl p-8 text-center hover:border-primary-500 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                >\n                    <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                    />

                    {uploading ? (
                        <div className="flex flex-col items-center">
                            <Loader2 className="w-12 h-12 text-primary-500 animate-spin mb-4" />
                            <p className="text-[var(--muted)]">正在上传...</p>
                            <div className="flex gap-2 mt-4">
                                {uploadProgress.map((progress, index) => (
                                    <div
                                        key={index}
                                        className="w-16 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden"
                                    >
                                        <div
                                            className="h-full bg-primary-500 transition-all"
                                            style={{ width: `${Math.min(progress, 100)}%` }}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <>
                            <Upload className="w-12 h-12 text-[var(--muted)] mx-auto mb-4" />
                            <p className="text-lg font-medium mb-2">点击或拖拽上传图片</p>
                            <p className="text-sm text-[var(--muted)]">
                                支持 JPG、PNG、WEBP 格式，最多 {maxImages} 张
                            </p>
                        </>
                    )}
                </div>
            )}

            {/* Image Preview Grid */}
            {images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {images.map((url, index) => (
                        <div key={url} className="relative group aspect-square">
                            <Image
                                src={url}
                                alt={`上传图片 ${index + 1}`}
                                fill
                                className="object-cover rounded-xl"
                            />
                            <button
                                type="button"
                                onClick={() => removeImage(index)}
                                className="absolute top-2 right-2 p-1.5 bg-black/50 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity hover:bg-black/70"
                            >
                                <X className="w-4 h-4" />
                            </button>
                            {index === 0 && (
                                <span className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 rounded-md text-white text-xs">
                                    封面
                                </span>
                            )}
                        </div>
                    ))}

                    {/* Add More Button */}
                    {images.length < maxImages && (
                        <button
                            type="button"
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-square border-2 border-dashed border-[var(--card-border)] rounded-xl flex flex-col items-center justify-center hover:border-primary-500 transition-colors"
                        >
                            <ImagePlus className="w-8 h-8 text-[var(--muted)] mb-2" />
                            <span className="text-sm text-[var(--muted)]">添加图片</span>
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}
