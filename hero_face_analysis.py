# Hero Face Position Analysis
# Based on visual inspection of 64 hero screenshots
# Format: 'hero-slug': 'X% Y%' where X/Y position face in center

# Analyzed positions (where is the FACE in the image):
HERO_FACE_POSITIONS = {
    # Face on LEFT side of image (move image RIGHT to center face)
    'archdemon-shadow': '35% 30%',  # Face slightly right
    'architect-laika': '30% 20%',   # Face left, top
    'bask': '20% 30%',               # Face far left
    'belian': '35% 25%',             # Face left, top
    'benimaru': '30% 30%',           # Face left
    'hecate': '30% 30%',             # Face left
    
    # Face on RIGHT side of image (move image LEFT to center face)
    'arunka': '75% 30%',             # Face right
    'boss-arunka': '75% 30%',        # Face right
    'furious': '75% 30%',            # Face far right
    'kayron': '75% 30%',             # Face far right
    'kikirat-v2': '80% 30%',         # Face very far right
    'mascot-hazel': '70% 30%',       # Face right  
    'remnant-violet': '80% 30%',     # Face very far right
    'righteous-thief-roozid': '75% 30%',  # Face right
    'roaming-warrior-leo': '75% 30%',     # Face right
    'sage-baal-and-sezan': '70% 30%',     # Face right
    'seaside-bellona': '75% 30%',         # Face right
    'specimen-sez': '75% 30%',            # Face right
    'vivian': '70% 30%',                  # Face right
    'watcher-schuri': '85% 30%',          # Face very far right
    'zeno': '75% 30%',                     # Face right
    
    # Face CENTERED (mostly centered, minor adjustments)
    'elphelt': '40% 30%',            # Face slightly left
    # ... (need to analyze remaining 45 heroes)
}
