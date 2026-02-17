export const getMediaDisplayUrl = (mediaItem) => {
  if (!mediaItem) return null;

  if (mediaItem.type === 'video') {
    return mediaItem.thumbnailUrl || null;
  }

  return mediaItem.url;
};

export const isVideoMedia = (mediaItem) => {
  return mediaItem?.type === 'video';
};

export const hasValidThumbnail = (mediaItem) => {
  return mediaItem?.type === 'video' && mediaItem?.thumbnailUrl;
};
