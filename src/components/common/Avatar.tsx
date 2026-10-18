import React, { useState, useEffect } from 'react';

interface AvatarProps {
  avatarUrl?: string | null;
  displayName?: string | null;
  username?: string | null;
  size?: number;
  className?: string;
}

// Generate consistent, aesthetic background color from name string
function hashStringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const colors = [
    '#4f46e5', // indigo
    '#0284c7', // sky
    '#059669', // emerald
    '#d97706', // amber
    '#db2777', // pink
    '#7c3aed', // violet
    '#dc2626', // red
    '#0891b2', // cyan
  ];
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

// Extract 1 or 2 uppercase initials
function getInitials(name?: string | null, handle?: string | null): string {
  const source = (name && name.trim()) || (handle && handle.trim()) || 'U';
  const parts = source.split(/\s+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase();
  }
  return source.substring(0, 2).toUpperCase();
}

export const Avatar: React.FC<AvatarProps> = ({
  avatarUrl,
  displayName,
  username,
  size = 36,
  className = '',
}) => {
  const [imageError, setImageError] = useState<boolean>(false);

  // Reset error state if url changes
  useEffect(() => {
    setImageError(false);
  }, [avatarUrl]);

  const initials = getInitials(displayName, username);
  const bgColor = hashStringToColor(username || displayName || 'user');
  const isValidHttps = Boolean(avatarUrl && avatarUrl.startsWith('https://'));

  const containerStyle: React.CSSProperties = {
    width: `${size}px`,
    height: `${size}px`,
    borderRadius: '50%',
    overflow: 'hidden',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    userSelect: 'none',
  };

  // If valid https URL provided and hasn't errored out, render image
  if (isValidHttps && !imageError) {
    return (
      <div style={containerStyle} className={className}>
        <img
          src={avatarUrl!}
          alt={displayName || username || 'User avatar'}
          referrerPolicy="no-referrer"
          loading="lazy"
          decoding="async"
          onError={() => setImageError(true)}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
        />
      </div>
    );
  }

  // Graceful deterministic initials fallback
  return (
    <div
      style={{
        ...containerStyle,
        backgroundColor: bgColor,
        color: '#ffffff',
        fontWeight: 700,
        fontSize: `${Math.max(size * 0.4, 11)}px`,
        letterSpacing: '0.02em',
      }}
      className={className}
      aria-label={`Avatar for ${displayName || username || 'user'}`}
    >
      {initials}
    </div>
  );
};
