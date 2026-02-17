import { Play } from 'lucide-react';

export const PlayButtonOverlay = ({ className = '', size = 'default' }) => {
  const sizes = {
    default: {
      button: 'w-12 h-12',
      icon: 'h-6 w-6'
    },
    large: {
      button: 'w-16 h-16',
      icon: 'h-8 w-8'
    }
  };

  const currentSize = sizes[size] || sizes.default;

  return (
    <div className={`absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none ${className}`}>
      <div className={`${currentSize.button} rounded-full bg-white/90 flex items-center justify-center`}>
        <Play className={`${currentSize.icon} text-gray-800 ml-0.5`} fill="currentColor" />
      </div>
    </div>
  );
};
