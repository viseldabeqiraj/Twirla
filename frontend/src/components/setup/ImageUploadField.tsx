import { useRef, useState } from 'react';
import { resolveAssetUrl } from '../../config/api';
import { uploadShopAsset } from '../../api/shopBuilderApi';

interface ImageUploadFieldProps {
  label: string;
  shopSlug: string;
  purpose: string;
  sessionToken: string;
  value: string;
  onChange: (url: string) => void;
  hint?: string;
}

export default function ImageUploadField({
  label,
  shopSlug,
  purpose,
  sessionToken,
  value,
  onChange,
  hint,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const previewSrc = value.trim() ? resolveAssetUrl(value) : '';

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    if (!shopSlug.trim()) {
      setUploadError('Set the shop URL slug first.');
      return;
    }
    setUploadError(null);
    setUploading(true);
    try {
      const { url } = await uploadShopAsset(file, shopSlug.trim(), purpose, sessionToken);
      onChange(url);
    } catch (err) {
      setUploadError(err instanceof Error ? err.message : 'Upload failed.');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <div className="shop-image-upload">
      <span className="campaign-setup-label">{label}</span>
      {hint ? <p className="campaign-setup-hint">{hint}</p> : null}
      <div className="shop-image-upload-row">
        {previewSrc ? (
          <div className="shop-image-upload-preview">
            <img src={previewSrc} alt="" referrerPolicy="no-referrer" />
          </div>
        ) : (
          <div className="shop-image-upload-preview shop-image-upload-preview--empty" aria-hidden />
        )}
        <div className="shop-image-upload-actions">
          <input
            ref={inputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif,image/svg+xml"
            className="shop-image-upload-file"
            onChange={(e) => void handleFile(e.target.files?.[0])}
          />
          <button
            type="button"
            className="campaign-setup-btn"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? 'Uploading…' : 'Upload image'}
          </button>
          {value ? (
            <button type="button" className="campaign-setup-btn link" onClick={() => onChange('')}>
              Clear
            </button>
          ) : null}
        </div>
      </div>
      <input
        className="campaign-setup-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="https://… or paste URL after upload"
      />
      {uploadError ? <p className="campaign-setup-msg err">{uploadError}</p> : null}
    </div>
  );
}
