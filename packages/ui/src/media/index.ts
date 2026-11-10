// Public API of @vamos-cms/ui/media — media contract, adapters and viewers.
// `Image`, `Figure` and `Carousel` live in the package root (they are light); this subpath holds
// the heavier media parts and the storage-agnostic MediaAdapter contract (plan 05 · D2).

export type {
  MediaKind,
  MediaAsset,
  MediaVariant,
  MediaFolder,
  MediaQuery,
  MediaPage,
  MediaPatch,
  MediaEvent,
  MediaCapabilities,
  MediaAdapter,
  MediaSource,
  MediaItem,
  CropRect,
  UploadOptions,
  ImageLoader,
} from "./types";

export { MediaProvider, useMedia, isMediaAsset, toMediaSource } from "./media-provider";
export { createMemoryAdapter, type MemoryAdapterOptions } from "./memory-adapter";
export { usePanZoom, type UsePanZoomOptions, type PanZoomState } from "./use-pan-zoom";

export { Gallery, galleryVariants, type GalleryProps, type GalleryLabels } from "./gallery";
export { masonryColumns, justifyRows, responsiveValue, type JustifiedRow, type Responsive } from "./gallery-layout";
export { Lightbox, LightboxTrigger, useLightbox, type LightboxProps, type LightboxTriggerProps, type LightboxLabels } from "./lightbox";
export {
  VideoPlayer,
  VideoEmbed,
  BackgroundVideo,
  videoPlayerVariants,
  formatMediaTime,
  type VideoPlayerProps,
  type VideoEmbedProps,
  type BackgroundVideoProps,
  type VideoSource,
  type VideoTrack,
  type HlsConstructor,
  type VideoPlayerLabels,
} from "./video-player";
export {
  SearchPreview,
  SocialCardPreview,
  LengthMeter,
  LinkPreviewTabs,
  type LinkPreviewData,
  type SearchPreviewProps,
  type SocialCardPreviewProps,
  type LengthMeterProps,
  type LinkPreviewTabsProps,
  type SocialPlatform,
  type LinkPreviewLabels,
} from "./link-preview";
export { measureSerp, measureText, countGraphemes, graphemes, SERP_LIMITS, type SerpMeasure, type SerpField, type SerpDevice } from "./serp";
export {
  ImageCropper,
  getCroppedBlob,
  formatAspectRatio,
  type ImageCropperProps,
  type CropPreset,
  type CroppedBlobOptions,
  type ImageCropperLabels,
} from "./image-cropper";

// Convenience re-exports so media code can import everything from one place.
export { Image, Figure, FigureCaption, ImageLoaderProvider, useImageLoader, useImageSources, getImageSources, type ImageProps } from "../components/image";

// Media library · Media picker · Image field (+ adapters, upload queue, focal point)
export { createRestAdapter, createPresignedUpload, xhrUpload, toSearchParams, type RestAdapterOptions, type PresignedTarget, type PresignedUploadOptions, type XhrUploadOptions } from "./rest-adapter";
export { useUploadQueue, type UploadQueue, type UploadQueueItem, type UploadStatus, type UseUploadQueueOptions } from "./use-upload-queue";
export { mediaKindOf, acceptsMedia, kindsFromAccept, isAltMissing, isDecorative, downscaleImage, DECORATIVE_TAG } from "./media-utils";
export { FocalPointPicker, type FocalPointPickerProps, type FocalPoint, type FocalPointLabels } from "./focal-point";
export {
  MediaLibrary,
  MediaDetails,
  MediaUploadQueue,
  MediaThumb,
  MediaFileGlyph,
  type MediaLibraryProps,
  type MediaLibraryHandle,
  type MediaLibraryView,
  type MediaSelectionMode,
  type MediaDetailsProps,
  type MediaUploadQueueProps,
  type MediaLibraryLabels,
  type MediaDetailsLabels,
  type MediaUploadQueueLabels,
} from "./media-library";
export { MediaPicker, MediaPickerProvider, useMediaPicker, type MediaPickerProps, type MediaPickerTab, type MediaPickOptions, type MediaPickerLabels } from "./media-picker";
export { ImageField, imageFieldVariants, type ImageFieldProps, type ImageFieldValue, type ImageFieldCropPreset, type ImageFieldLabels } from "./image-field";
