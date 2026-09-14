import React, { ImgHTMLAttributes, useEffect, useState } from 'react';
import { api } from '../api';

interface AuthenticatedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  src?: string;
}

export const AuthenticatedImage: React.FC<AuthenticatedImageProps> = ({ src = '', alt = '', ...props }) => {
  const [resolvedSrc, setResolvedSrc] = useState(src);

  useEffect(() => {
    if (!src || src.startsWith('data:') || src.startsWith('blob:')) {
      setResolvedSrc(src);
      return;
    }
    let active = true;
    let objectUrl = '';
    api.fetchAsset(src)
      .then((blob) => {
        if (!active) return;
        objectUrl = URL.createObjectURL(blob);
        setResolvedSrc(objectUrl);
      })
      .catch(() => active && setResolvedSrc(''));
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [src]);

  if (!resolvedSrc) return null;
  return <img src={resolvedSrc} alt={alt} {...props} />;
};
