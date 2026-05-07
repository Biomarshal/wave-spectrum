'use client';

import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { AlertCircle, Upload as UploadIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { uploadToCloudinary } from '@/lib/cloudinary';
import { useAuthStore } from '@/store/useAuthStore';
import AppLogo from './ui/AppLogo';
import { parseBlob } from 'music-metadata-browser';

export default function Upload({ onUploadComplete }: { onUploadComplete: () => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [artist, setArtist] = useState('');
  const [album, setAlbum] = useState('');
  const [year, setYear] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const { uid } = useAuthStore();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'audio/mpeg' && !selectedFile.name.endsWith('.mp3')) {
        setError('Please select an MP3 file only.');
        setFile(null);
        return;
      }
      setError('');
      setFile(selectedFile);
      
      try {
        const metadata = await parseBlob(selectedFile);
        if (metadata.common.title) setTitle(metadata.common.title);
        if (metadata.common.artist) setArtist(metadata.common.artist);
        if (metadata.common.album) setAlbum(metadata.common.album);
        if (metadata.common.year) setYear(metadata.common.year.toString());
      } catch (err) {
        console.error('Error parsing metadata:', err);
        if (!title) {
          setTitle(selectedFile.name.replace('.mp3', ''));
        }
      }
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError('Please select an MP3 audio file to upload.');
      return;
    }
    if (!title.trim()) {
      setError('Please provide a title for the song.');
      return;
    }
    if (!uid) {
      setError('You must be logged in to upload songs.');
      return;
    }

    setIsUploading(true);
    setError('');

    try {
      let albumArtUrl = '';
      
      // Extract metadata for album art
      try {
        const metadata = await parseBlob(file);
        console.log('MP3 Metadata:', metadata.common);
        
        const picture = metadata.common.picture?.[0];
        if (picture) {
          // Convert embedded image buffer correctly
          const imageBlob = new Blob([new Uint8Array(picture.data)], { type: picture.format });
          
          // Create image file
          const imageFile = new File([imageBlob], "cover.jpg", { type: picture.format });
          
          // Upload cover image separately to Cloudinary using FormData (Unsigned)
          const imageFormData = new FormData();
          imageFormData.append("file", imageFile);
          imageFormData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!);
          
          const artResponse = await fetch(
            `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/image/upload`,
            {
              method: "POST",
              body: imageFormData,
            }
          );
          
          if (artResponse.ok) {
            const artData = await artResponse.json();
            albumArtUrl = artData.secure_url;
            console.log('Album Art Uploaded:', albumArtUrl);
          } else {
            const errorData = await artResponse.json();
            console.error('Album art upload failed:', errorData);
          }
        }
      } catch (err) {
        console.error('Error extracting album art:', err);
      }

      const { secure_url, public_id } = await uploadToCloudinary(file);
      await addDoc(collection(db, 'songs'), {
        title: title.trim() || file.name.replace('.mp3', ''),
        artist: artist.trim() || 'Unknown Artist',
        album: album.trim() || 'Unknown Album',
        year: year.trim() ? parseInt(year) : null,
        albumArt: albumArtUrl || null,
        audioUrl: secure_url,
        publicId: public_id,
        uploadedBy: uid,
        createdAt: Date.now(),
      });
      setFile(null);
      setTitle('');
      setArtist('');
      setAlbum('');
      setYear('');
      setIsUploading(false);
      onUploadComplete();
    } catch (err: any) {
      setError(err.message || 'Failed to upload song');
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 space-y-5">
      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm"
        >
          <AlertCircle size={16} className="shrink-0" />
          <p>{error}</p>
        </motion.div>
      )}

      {/* File drop area */}
      <div className="relative group">
        <input
          type="file"
          accept="audio/mpeg, .mp3"
          onChange={handleFileChange}
          disabled={isUploading}
          className="absolute inset-0 opacity-0 cursor-pointer z-10"
        />
        <div className="w-full border-2 border-dashed border-white/[0.08] rounded-lg p-8 flex flex-col items-center justify-center text-center transition-colors group-hover:border-[#e05297]/40 group-hover:bg-[#e05297]/[0.02]">
          <div className="mb-3">
            <AppLogo size={28} />
          </div>
          <p className="text-sm font-medium text-slate-400 group-hover:text-white transition-colors">
            {file ? file.name : 'Click to select MP3'}
          </p>
          <p className="text-xs text-slate-600 mt-1">MP3 only</p>
        </div>
      </div>

      {/* Title */}
      <div>
        <label className="block text-xs text-slate-500 font-medium mb-1">Title</label>
        <input
          type="text"
          placeholder="Track title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isUploading}
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#e05297]/40"
        />
      </div>

      {/* Artist */}
      <div>
        <label className="block text-xs text-slate-500 font-medium mb-1">Artist</label>
        <input
          type="text"
          placeholder="Artist name"
          value={artist}
          onChange={(e) => setArtist(e.target.value)}
          disabled={isUploading}
          className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#7c3aed]/40"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        {/* Album */}
        <div>
          <label className="block text-xs text-slate-500 font-medium mb-1">Album</label>
          <input
            type="text"
            placeholder="Album name"
            value={album}
            onChange={(e) => setAlbum(e.target.value)}
            disabled={isUploading}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#e05297]/40"
          />
        </div>
        {/* Year */}
        <div>
          <label className="block text-xs text-slate-500 font-medium mb-1">Year</label>
          <input
            type="text"
            placeholder="Year"
            value={year}
            onChange={(e) => setYear(e.target.value)}
            disabled={isUploading}
            className="w-full bg-white/[0.04] border border-white/[0.08] rounded-lg px-3 py-2.5 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#7c3aed]/40"
          />
        </div>
      </div>

      <button
        onClick={handleUpload}
        disabled={isUploading}
        className="w-full py-2.5 bg-white text-black rounded-lg text-sm font-semibold flex items-center justify-center gap-2 hover:bg-slate-200 transition-colors disabled:opacity-50"
      >
        {isUploading ? (
          <>
            <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            <span>Uploading...</span>
          </>
        ) : (
          <>
            <UploadIcon size={16} />
            <span>Upload Track</span>
          </>
        )}
      </button>
    </div>
  );
}
