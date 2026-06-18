import type { ShopConfig } from '../../types/ShopConfig';
import {
  addFeaturedProductSlot,
  collectShopImageSlots,
  setShopImageUrl,
  type ShopImageSlotId,
} from '../../utils/shopConfigImages';
import ImageUploadField from './ImageUploadField';

interface ShopConfigImagePanelProps {
  shopSlug: string;
  sessionToken: string;
  config: ShopConfig;
  onConfigChange: (config: ShopConfig) => void;
  /** When true, uploads use a draft folder until URL slug is set in Basics. */
  slugMissing?: boolean;
}

export default function ShopConfigImagePanel({
  shopSlug,
  sessionToken,
  config,
  onConfigChange,
  slugMissing = false,
}: ShopConfigImagePanelProps) {
  const slots = collectShopImageSlots(config);
  const productCount = config.campaign?.featuredProducts?.length ?? 0;

  const handleSlotChange = (slotId: ShopImageSlotId, url: string) => {
    onConfigChange(setShopImageUrl(config, slotId, url));
  };

  return (
    <fieldset className="campaign-setup-fieldset shop-config-image-panel">
      <legend className="campaign-setup-legend">Images (Cloudflare R2)</legend>
      <p className="campaign-setup-hint">
        Upload logo, hero, about photo, and each product image separately. Files go to R2 and URLs are written into
        the shop JSON. Requires <code>TWIRLA_R2_*</code> on the API — or paste external URLs manually.
      </p>
      {slugMissing ? (
        <p className="campaign-setup-msg err">
          Set URL slug in Basics above for the final shop path. Uploads still work now (stored under{' '}
          <code>shops/{shopSlug}/</code>).
        </p>
      ) : null}

      {slots.map((slot) => (
        <ImageUploadField
          key={slot.id}
          label={slot.label}
          shopSlug={shopSlug}
          purpose={slot.id.replace(/\./g, '-')}
          sessionToken={sessionToken}
          value={slot.url}
          onChange={(url) => handleSlotChange(slot.id, url)}
        />
      ))}

      <div className="campaign-setup-actions">
        <button
          type="button"
          className="campaign-setup-btn"
          onClick={() => onConfigChange(addFeaturedProductSlot(config))}
        >
          + Add product image slot
        </button>
        {productCount > 0 ? (
          <span className="campaign-setup-hint">{productCount} product slot(s) in JSON</span>
        ) : null}
      </div>
    </fieldset>
  );
}
