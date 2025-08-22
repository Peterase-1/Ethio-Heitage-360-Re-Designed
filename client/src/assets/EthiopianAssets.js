// Ethiopian Cultural Assets and Icons
// SVG data for Ethiopian cultural elements

export const EthiopianIcons = {
  // Ethiopian Cross (Meskel Cross)
  meskelCross: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L12 22M12 8L8 4M12 8L16 4M12 16L8 20M12 16L16 20M6 12L18 12M12 12L8 8M12 12L16 8M12 12L8 16M12 12L16 16" 
            stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  ),

  // Traditional Ethiopian House
  ethiopianHouse: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="14" r="8" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M12 6L12 14" stroke="currentColor" strokeWidth="2"/>
      <path d="M8 10L16 10" stroke="currentColor" strokeWidth="2"/>
      <path d="M10 18L14 18" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),

  // Ethiopian Coffee Bean
  coffeeBean: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <ellipse cx="12" cy="12" rx="4" ry="6" fill="currentColor"/>
      <path d="M12 8C10 8 10 16 12 16C14 16 14 8 12 8Z" stroke="white" strokeWidth="1" fill="none"/>
    </svg>
  ),

  // Ethiopian Flag Colors
  flagStripes: (
    <svg width="24" height="24" viewBox="0 0 24 24">
      <rect x="0" y="2" width="24" height="6" fill="#009639"/>
      <rect x="0" y="8" width="24" height="8" fill="#FFCD00"/>
      <rect x="0" y="16" width="24" height="6" fill="#DA020E"/>
      <circle cx="12" cy="12" r="4" fill="#0F47AF"/>
      <path d="M12 8L13.5 11H17L14.5 13L15.5 16L12 14L8.5 16L9.5 13L7 11H10.5L12 8Z" fill="#FFCD00"/>
    </svg>
  ),

  // Traditional Injera
  injera: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
      <circle cx="10" cy="8" r="1" fill="currentColor"/>
      <circle cx="14" cy="9" r="1" fill="currentColor"/>
      <circle cx="8" cy="12" r="1" fill="currentColor"/>
      <circle cx="16" cy="13" r="1" fill="currentColor"/>
      <circle cx="11" cy="15" r="1" fill="currentColor"/>
      <circle cx="13" cy="16" r="1" fill="currentColor"/>
    </svg>
  ),

  // Ancient Manuscript
  manuscript: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <rect x="4" y="3" width="16" height="18" rx="2" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M8 7H16M8 11H16M8 15H13" stroke="currentColor" strokeWidth="2"/>
      <path d="M6 7L6 17" stroke="currentColor" strokeWidth="3" fill="currentColor"/>
    </svg>
  ),

  // Ethiopian Church
  church: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <rect x="8" y="12" width="8" height="10" stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M6 12L12 6L18 12" stroke="currentColor" strokeWidth="2" fill="none"/>
      <rect x="11" y="16" width="2" height="6" fill="currentColor"/>
      <path d="M12 2L12 6" stroke="currentColor" strokeWidth="2"/>
      <path d="M10 4L14 4" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),

  // Traditional Shield
  shield: (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2L20 6V12C20 17 16 21 12 22C8 21 4 17 4 12V6L12 2Z" 
            stroke="currentColor" strokeWidth="2" fill="none"/>
      <path d="M12 6L16 10L12 14L8 10L12 6Z" fill="currentColor"/>
    </svg>
  )
};

export const EthiopianImageUrls = {
  // Placeholder URLs for Ethiopian cultural images
  lalibela: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
  blueNile: 'https://images.unsplash.com/photo-1564760055775-d63b17a55c44?w=800',
  simienMountains: 'https://images.unsplash.com/photo-1573160103600-7c2a3c6cd5e0?w=800',
  coffeeBeansEthiopia: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?w=800',
  africanMask: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
  traditionalTextile: 'https://images.unsplash.com/photo-1504609773096-104ff2c73ba4?w=800',
  ancientManuscript: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=800',
  addisAbaba: 'https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=800',
};

export const EthiopianPatterns = {
  // Traditional Ethiopian textile patterns as CSS backgrounds
  habesha: `linear-gradient(45deg, 
    #009639 25%, transparent 25%), 
    linear-gradient(-45deg, #FFCD00 25%, transparent 25%), 
    linear-gradient(45deg, transparent 75%, #DA020E 75%), 
    linear-gradient(-45deg, transparent 75%, #009639 75%)`,
  
  traditional: `radial-gradient(circle at 25% 25%, #FFCD00 2px, transparent 2px),
    radial-gradient(circle at 75% 75%, #DA020E 2px, transparent 2px),
    linear-gradient(45deg, #009639 25%, transparent 25%)`,
};

export const EthiopianColors = {
  green: '#009639',
  yellow: '#FFCD00',
  red: '#DA020E',
  blue: '#0F47AF',
  gold: '#FFD700',
  earth: '#8B4513',
  traditional: {
    primary: '#009639',
    secondary: '#FFCD00',
    accent: '#DA020E',
    neutral: '#0F47AF'
  }
};
