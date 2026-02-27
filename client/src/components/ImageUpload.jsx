import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, X, Image as ImageIcon } from "lucide-react";

export default function ImageUpload({ file, onFileChange }) {
    const [preview, setPreview] = useState(null);

    const onDrop = useCallback(
        (acceptedFiles) => {
            const f = acceptedFiles[0];
            if (f) {
                onFileChange(f);
                setPreview(URL.createObjectURL(f));
            }
        },
        [onFileChange]
    );

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: { "image/*": [".jpeg", ".jpg", ".png", ".webp", ".tiff"] },
        maxFiles: 1,
        maxSize: 10 * 1024 * 1024,
    });

    const removeFile = (e) => {
        e.stopPropagation();
        onFileChange(null);
        setPreview(null);
    };

    return (
        <div className="w-full">
            {!preview ? (
                <div
                    {...getRootProps()}
                    className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 ${isDragActive
                            ? "border-accent-green bg-accent-green/5 scale-[1.02]"
                            : "border-gray-600 hover:border-accent-green/50 hover:bg-navy-700/50"
                        }`}
                >
                    <input {...getInputProps()} />
                    <div className="flex flex-col items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-navy-600 flex items-center justify-center">
                            <UploadCloud
                                size={36}
                                className={`transition-colors ${isDragActive ? "text-accent-green" : "text-gray-400"
                                    }`}
                            />
                        </div>
                        <div>
                            <p className="text-lg font-semibold text-gray-200">
                                {isDragActive
                                    ? "Drop your satellite image here"
                                    : "Drag & drop satellite image"}
                            </p>
                            <p className="text-sm text-gray-400 mt-1">
                                or click to browse • JPEG, PNG, WebP, TIFF • Max 10MB
                            </p>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="relative group rounded-2xl overflow-hidden border border-gray-700">
                    <img
                        src={preview}
                        alt="Satellite preview"
                        className="w-full h-64 object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-navy-900/80 to-transparent" />
                    <div className="absolute bottom-4 left-4 flex items-center gap-2">
                        <ImageIcon size={16} className="text-accent-green" />
                        <span className="text-sm text-gray-200 font-medium truncate max-w-xs">
                            {file?.name}
                        </span>
                        <span className="text-xs text-gray-400">
                            ({(file?.size / (1024 * 1024)).toFixed(1)} MB)
                        </span>
                    </div>
                    <button
                        onClick={removeFile}
                        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-navy-800/90 border border-gray-600 flex items-center justify-center hover:bg-red-500/80 hover:border-red-400 transition-all"
                    >
                        <X size={16} className="text-gray-300" />
                    </button>
                </div>
            )}
        </div>
    );
}
