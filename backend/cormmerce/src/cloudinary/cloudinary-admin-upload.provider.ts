// Bridges AdminJS's file-upload widget (@adminjs/upload) to Cloudinary.
//
// The tricky part: @adminjs/upload persists whatever string `uploadPath()`
// returns directly into the mapped DB column (here: an entry in Product.images)
// BEFORE the actual upload happens — it never writes back the provider's
// return value. So instead of letting Cloudinary hand us a URL after the
// fact, we predict the exact secure_url up front (Cloudinary URLs are
// deterministic from cloud_name + public_id + format), persist that, and
// then make the real upload land at that same public_id. This keeps each
// Product.images entry a plain, ready-to-use Cloudinary URL — no schema
// change, no second write.
import { randomUUID } from 'crypto';
import { v2 as cloudinary } from 'cloudinary';
// Deliberately NOT `import { BaseProvider } from '@adminjs/upload'` + `extends`:
// that package is ESM-only with no `require` export condition, so a real
// `extends BaseProvider` forces TypeScript to emit a synchronous top-level
// `require('@adminjs/upload')` (needed to get the actual class value at
// runtime) — which crashes immediately at module-load time, before any of
// our async/dynamic-import code ever runs. @adminjs/upload's own
// getProvider() only checks `options.name === 'BaseProvider'` (a plain
// string, no `instanceof`) to detect a custom provider, so duck-typing the
// same shape works identically without ever requiring the package.
import type { BaseProvider, ProviderOpts } from '@adminjs/upload';
import type { UploadedFile } from 'adminjs';

const DEFAULT_FOLDER = 'cormmerce/products';

function publicIdFromUrl(url: string): string | null {
  // Strip any query string first (Cloudinary's url() builder appends an
  // analytics tracking param, e.g. `?_a=...`, unless explicitly disabled —
  // and we don't want to depend on that staying off forever).
  const withoutQuery = url.split('?')[0];
  const match = withoutQuery.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-zA-Z0-9]+$/);
  return match ? match[1] : null;
}

export class CloudinaryAdminUploadProvider implements BaseProvider {
  name = 'BaseProvider';
  bucket: string;
  opts: ProviderOpts = {};
  private readonly folder: string;

  constructor(folder: string = DEFAULT_FOLDER) {
    this.folder = folder;
    this.bucket = folder;
    // Configured here (lazily, on instantiation), not at module top level —
    // this file is statically imported via AdminModuleModule, which app.module.ts
    // imports *before* its `import 'dotenv/config'` line runs. Configuring at
    // top level would run before .env is loaded and silently sign requests
    // with undefined credentials (see the Cloudinary service in cloudinary.ts,
    // which uses the same lazy, constructor-time pattern for the same reason).
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
      api_key: process.env.CLOUDINARY_API_KEY,
      api_secret: process.env.CLOUDINARY_API_SECRET,
    });
  }

  // Called by @adminjs/upload's `uploadPath` option, before provider.upload()
  // even runs, to decide what key (here: the final Cloudinary URL) gets
  // written to the DB.
  buildUploadKey(filename: string): string {
    const ext = filename.includes('.') ? filename.split('.').pop() : undefined;
    const publicId = `${this.folder}/${randomUUID()}`;
    return cloudinary.url(publicId, {
      secure: true,
      resource_type: 'image',
      format: ext,
      analytics: false,
    });
  }

  async upload(file: UploadedFile, key: string): Promise<any> {
    const publicId = publicIdFromUrl(key);
    if (!publicId) {
      throw new Error(
        `Could not derive a Cloudinary public_id from generated key: ${key}`,
      );
    }

    const ext = publicId.includes('.') ? undefined : key.split('.').pop();

    return cloudinary.uploader.upload(file.path, {
      public_id: publicId,
      resource_type: 'image',
      format: ext,
      overwrite: true,
    });
  }

  async delete(key: string): Promise<any> {
    const publicId = publicIdFromUrl(key);
    if (!publicId) {
      // Pre-existing products may have a manually-pasted, non-Cloudinary
      // image URL — nothing to clean up in that case.
      return;
    }

    try {
      await cloudinary.uploader.destroy(publicId, { resource_type: 'image' });
    } catch {
      // Best-effort cleanup only — never block the record save/delete on it.
    }
  }

  path(key: string): string {
    // `key` IS the final Cloudinary URL already (see buildUploadKey above).
    return key;
  }
}
