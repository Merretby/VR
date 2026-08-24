/**
 * Pokibois - Moodboard Prompt Templates
 *
 * You can modify these prompt templates freely. They will be saved to the database
 * under the 'projects.prompt' column and sent as a 'prompt' field to the n8n webhook
 * when a user applies a moodboard.
 */

export const MOODBOARD_PROMPTS: Record<string, string> = {
  // 1. Modern Luxury & Warm Elegance
  'luxury-warm': `Use the uploaded interior photo as the **base image and architectural reference**.

Redesign this exact space according to the following interior design moodboard and style direction.

## MAIN OBJECTIVE

Transform the existing interior into a **prestigious, warm contemporary luxury space** characterized by the contrast between **dark walnut wood, light veined marble/travertine, warm terracotta accents, soft neutral fabrics, bronze details, and elegant sculptural furniture**.

The final result must look like a **real professionally designed interior**, not a completely different room.

## VERY IMPORTANT — PRESERVE THE EXISTING SPACE

Keep the original:

* room dimensions and proportions
* walls and architectural boundaries
* ceiling height and general ceiling geometry
* doors and openings
* windows and their positions
* columns and structural elements
* camera position
* camera angle
* perspective
* floor plan
* circulation paths
* overall spatial organization

Do **not** enlarge, shrink, extend, or completely reconstruct the room.

Only redesign the **interior finishes, furniture, lighting, decorative elements, textures and atmosphere**.

---

## STYLE PHILOSOPHY

Create a sophisticated and prestigious atmosphere based on the warm contrast between:

* deep dark walnut
* noble light marble
* warm terracotta
* creamy travertine
* soft warm neutrals
* brushed brass and bronze

The space should feel:

**luxurious, warm, refined, timeless, architectural, elegant and sophisticated.**

Avoid cold minimalism.

The design should have a strong architectural identity while remaining comfortable and welcoming.

---

## COLOR PALETTE

Use approximately:

* **Espresso Walnut / Deep Wood — #2C221E**
* **Amber / Terracotta — #C47A47**
* **Cream Travertine — #E6DFD5**
* **Sienna Earth — #96705B**
* **Ecru Linen — #F4EFEA**

The dominant visual balance should be:

**dark walnut + creamy stone + warm neutral textiles**, with terracotta and bronze used as controlled accents.

---

## WOODWORK & MILLWORK

Introduce sophisticated custom millwork using **dark American walnut**.

Possible applications depending on the room:

* walnut wall panels
* vertical walnut slats
* integrated cabinetry
* floor-to-ceiling millwork
* built-in bookshelves
* architectural walnut framing
* discreet integrated storage

Use the dark wood strategically to create depth and elegance without making the room too dark.

Integrate subtle warm backlighting into some shelves or wood panels.

---

## STONE & SURFACES

Use premium natural-looking stone materials such as:

* Calacatta-style light marble
* warm white marble with subtle grey/gold veining
* cream travertine
* polished or honed stone surfaces

Possible applications:

* feature walls
* fireplace surrounds
* countertops
* console surfaces
* side tables
* dining tables
* architectural focal elements

The stone should appear realistic, elegant and naturally veined.

Avoid excessive or artificial-looking marble patterns.

---

## FURNITURE

Use contemporary luxury furniture combining **clean architectural lines with soft organic curves**.

Include where appropriate:

* large curved or softly rounded bouclé sofas
* sculptural lounge chairs
* terracotta velvet accent armchairs
* rounded stone coffee tables
* elegant walnut furniture
* low-profile contemporary seating
* custom-made luxury furniture

Furniture proportions must remain realistic for the existing room.

Do not overcrowd the space.

---

## TEXTILES

Use tactile premium fabrics such as:

* ivory bouclé
* ecru linen
* warm beige upholstery
* terracotta velvet
* textured neutral fabrics

Add a **large textured Merino wool or wool-style rug** where appropriate to soften the space and create visual warmth.

---

## METALLIC FINISHES & DECOR

Use subtle metallic details in:

* brushed matte brass
* warm bronze

Possible applications:

* pendant lights
* wall sconces
* furniture details
* decorative accessories
* table bases
* shelving details

Add carefully selected sculptural ceramic objects and restrained bronze-toned décor.

Decor should feel curated and premium, never cluttered.

---

## FORMS & GEOMETRY

Create an intentional contrast between:

### Architectural elements

* clean straight lines
* rectilinear walnut paneling
* precise architectural geometry
* linear stone surfaces

### Furniture and décor

* organic curves
* rounded furniture
* sculptural silhouettes
* curved bouclé seating
* rounded objects

The interaction between **strong architectural lines and soft organic forms** is an essential part of the design.

---

## LIGHTING

Create sophisticated warm layered lighting.

Use approximately **2700K warm lighting**.

Combine:

* indirect LED lighting
* integrated millwork lighting
* concealed architectural lighting
* sculptural brass pendant lights
* elegant wall lights
* soft-diffusion floor lamps
* subtle decorative lighting

Preserve natural daylight from the original image.

Lighting must create depth and highlight the walnut grain, marble veining, furniture textures and architectural details.

Avoid cold white light.

---

## DESIGN QUALITY

The finished interior should resemble a project created by a **high-end interior architecture studio**.

Aim for:

* premium residential design
* bespoke millwork
* realistic material junctions
* accurate furniture scale
* sophisticated styling
* balanced composition
* elegant negative space
* realistic construction details
* coherent furniture placement
* believable interior architecture

Every design decision should belong to the same visual language.

---

## IMAGE QUALITY

Generate a:

* photorealistic architectural visualization
* ultra-realistic interior photography appearance
* realistic global illumination
* physically accurate materials
* realistic reflections
* realistic shadows
* detailed wood grain
* realistic marble and travertine
* natural fabric texture
* cinematic but believable lighting
* high-end interior photography
* sharp architectural details
* professional composition
* high resolution

## STRICT CONSTRAINTS

Do NOT:

* change the room geometry
* move windows unnecessarily
* move doors
* invent additional rooms
* change the camera position
* distort perspective
* create impossible furniture proportions
* overcrowd the room
* use excessive decoration
* use cheap-looking materials
* introduce unrelated colors
* introduce unrelated design styles
* use cold blue lighting
* create futuristic or fantasy architecture
* add text, logos or watermarks

The objective is to make the uploaded room look like **the same real space after a professional luxury interior renovation based precisely on this moodboard**.`,

  // 2. Japandi & Organic Minimalist
  'japandi-organic': `Use the uploaded interior photo as the **base image and architectural reference**.

Redesign this exact space according to a **Japandi & Organic Minimalist** moodboard. The goal is to transform the room while keeping the original architecture and layout, and applying the moodboard’s materials, colors, furniture, textures, lighting, and overall atmosphere.

## MAIN OBJECTIVE

Create a calm, serene, refined interior in a **Japandi organic minimalist style** that blends Japanese simplicity with Scandinavian warmth.

The redesigned room should feel:

* peaceful
* natural
* elegant
* warm
* light
* balanced
* minimal but not empty
* organic and artisanal

The final result should look like a **real professionally designed interior**, not a fantasy room or a completely different space.

---

## VERY IMPORTANT — PRESERVE THE ORIGINAL SPACE

Keep the original:

* room dimensions and proportions
* walls and structural layout
* ceiling height and ceiling shape
* doors and windows in the same position
* columns and architectural elements
* floor plan
* camera angle
* camera position
* perspective
* circulation paths
* overall room structure

Do **not** completely rebuild the room.

Only redesign the:

* materials
* furniture
* wall finishes
* lighting
* textiles
* décor
* atmosphere
* styling

The final result must remain clearly the **same room**, only redesigned.

---

## STYLE PHILOSOPHY

Apply a **Japandi & Organic Minimalist** design language.

This style should celebrate:

* the imperfect beauty of raw materials
* the clarity of low-profile lines
* a strong connection with natural light
* quiet craftsmanship
* restrained elegance
* soft organic simplicity

The room should feel visually clean, uncluttered, grounded, and harmonious.

Avoid flashy luxury, glossy excess, or overly decorative styling.

---

## COLOR PALETTE

Use a soft earthy palette inspired by the moodboard:

* **Soft Sand / Wall Base — #EADCC9**
* **Natural Oak / Furniture — #B59E7D**
* **Warm Clay / Terracotta Accent — #5C5248**
* **Zen Sage Green / Botanical Accent — #88927F**
* **Wabi Anthracite / Contrast — #36312C**

The dominant feeling should be:

**warm beige + natural oak + soft earthy neutrals**, with touches of sage green and dark anthracite for subtle contrast.

Keep the palette soft, muted, and cohesive.

---

## WOODWORK & MILLWORK

Use **light solid oak wood** as the primary wood material.

Integrate elements such as:

* low-profile light oak furniture
* modernized shoji-style light wood screens
* minimalist built-in storage
* clean-lined oak millwork
* low horizontal furniture pieces
* simple handcrafted wood details
* monolithic raw wood coffee tables or side tables

Wood should feel natural, calm, matte, and slightly tactile.

Avoid glossy lacquered finishes.

---

## WALLS & SURFACES

Use soft, natural, understated finishes such as:

* beige textured limewash plaster
* matte neutral wall surfaces
* subtle handcrafted textures
* matte brushed oak parquet flooring
* natural felt or textile acoustic wall panels if appropriate

Surfaces should feel warm, breathable, natural, and softly imperfect.

Avoid highly reflective finishes and strong artificial patterns.

---

## FURNITURE

Use **low-profile Japandi furniture** with a balance of straight architectural lines and soft organic forms.

Depending on the room type, include appropriate pieces such as:

* low oak platform bed
* low minimalist sofa
* simple lounge chair
* handcrafted wood coffee table
* low side tables
* clean-lined shelving
* understated storage units
* simple bench seating
* floor-level or low-height furniture arrangements

Furniture should feel:

* calm
* grounded
* minimal
* elegant
* functional
* organic

Do not overcrowd the room.

---

## TEXTILES

Use soft, natural, tactile fabrics such as:

* unbleached washed linen
* natural cotton
* waffle-weave throws
* soft neutral bedding
* braided jute rugs
* untreated wool rugs
* subtle woven textures

Keep textiles in tones like:

* warm beige
* ivory
* sand
* oat
* soft cream
* muted stone

Textiles must feel cozy and natural while staying minimal.

---

## ZEN & BOTANICAL ELEMENTS

Add restrained natural decorative elements such as:

* bonsai
* dried eucalyptus branches
* delicate botanical accents
* artisanal wabi-sabi ceramics
* handmade ceramic vases
* sculptural bowls
* organic handcrafted accessories

Decor should be sparse and intentional.

Every decorative element should feel curated and meaningful.

Avoid clutter.

---

## FORMS & DESIGN LANGUAGE

This moodboard relies on a tension between:

### Architectural framework

* clean straight lines
* simple geometric structure
* low horizontal proportions
* refined order

### Organic accents

* softly irregular forms
* hand-shaped ceramics
* slightly imperfect natural textures
* organic silhouettes
* subtle asymmetry

Also include:

* geometric shoji screen references
* natural irregular materials
* low furniture lines
* quiet sculptural shapes

The overall composition should feel disciplined yet soft.

---

## LIGHTING

Use a calm and natural lighting atmosphere.

Preserve natural daylight from the original photo and enhance it with soft warm lighting.

Include where appropriate:

* washi paper pendant lights
* rice paper or paper lantern style lights
* ceramic table lamps
* soft ambient lighting
* warm indirect light
* subtle layered illumination

Lighting should feel:

* soft
* diffused
* warm
* restful
* natural

Avoid cold white lighting or dramatic nightclub-like effects.

---

## ROOM ADAPTATION

Adapt the style according to the room type shown in the uploaded image.

This moodboard is especially suitable for:

* bedrooms
* zen suites
* intimate living rooms
* reading nooks
* yoga or meditation spaces
* studios
* small light-filled interiors

Apply the moodboard intelligently depending on the existing room.

---

## IMAGE QUALITY

Generate the final image as:

* photorealistic interior redesign
* high-end architectural visualization
* realistic materials
* natural daylight
* soft shadows
* believable scale
* ultra-detailed textures
* realistic oak grain
* realistic textile texture
* realistic handcrafted ceramic décor
* professional interior photography quality
* clean composition
* high resolution

## STRICT CONSTRAINTS

Do NOT:

* change the room geometry
* move windows or doors unnecessarily
* change the camera angle
* distort the perspective
* create a different room
* add excessive decoration
* add bright saturated colors
* add glossy or flashy materials
* make the space look too empty or too crowded
* introduce unrelated styles
* use heavy industrial, ultra-modern luxury, or ornate classical elements
* add text
* add logos
* add watermarks

The objective is to make the uploaded room look like **the same real space redesigned in a serene Japandi & Organic Minimalist style** based precisely on this moodboard.`,

  // 3. Contemporary Architectural Chic
  'contemporary-chic': `Use the uploaded interior photo as the **base image and architectural reference**.

Redesign this exact room according to the following **Contemporary Architectural Chic** moodboard.

The objective is to create a sophisticated, gallery-like contemporary interior combining **strong architectural geometry, sculptural furniture, Roman travertine, fluted wood, black architectural detailing, brushed brass and deep forest-green accents**.

The final image must look like the **same real room after a premium interior renovation**, not a completely different space.

---

## 1. PRESERVE THE ORIGINAL ARCHITECTURE

This is extremely important.

Keep exactly the original:

* room dimensions
* wall positions
* ceiling height
* windows
* doors
* openings
* columns
* structural elements
* floor plan
* circulation
* camera position
* camera angle
* perspective
* general spatial proportions

Do NOT invent a different architecture.

Do NOT enlarge the room.

Do NOT move windows or doors unless absolutely necessary.

Only redesign:

* furniture
* finishes
* materials
* wall treatments
* lighting
* textiles
* décor
* built-in elements
* atmosphere

The redesigned image must remain recognizable as the original uploaded room.

---

## 2. STYLE DIRECTION

Apply a **Contemporary Architectural Chic** aesthetic inspired by high-end architecture studios, contemporary galleries and luxury penthouses.

The space should feel:

* sophisticated
* artistic
* architectural
* luxurious
* contemporary
* dramatic but refined
* sculptural
* highly curated
* elegant
* editorial

Create the visual character of a **modern art gallery combined with an exclusive luxury residence**.

Avoid generic modern interiors.

Every object should look intentionally selected.

---

## 3. COLOR PALETTE

Use the following palette as the main design reference:

### Architectural Black

**#1F1F1F**

Use for:

* slim architectural frames
* metal profiles
* selected furniture structures
* lighting details
* ironwork
* subtle contrast elements

Do not make the whole room black.

---

### Roman Travertine

**#D9CEBC**

Use extensively for:

* feature walls
* side tables
* console tables
* plinths
* architectural surfaces
* fireplace cladding if appropriate
* sculptural monolithic elements

Use natural warm beige Roman travertine with realistic pores and subtle variations.

---

### Brushed Brass

**#B38B59**

Use selectively for:

* light fixtures
* wall sconces
* furniture detailing
* decorative metal elements
* trims
* subtle architectural accents

The brass must be **brushed or satin**, never overly shiny or yellow.

---

### Forest Green

**#4A5844**

Use as a controlled luxury accent for:

* velvet armchairs
* lounge chairs
* upholstery
* cushions
* selected textile elements

Use deep muted forest green rather than bright green.

---

### Mineral Grey

**#6E6868**

Use for:

* microcement surfaces
* subtle walls
* secondary finishes
* grounding neutral elements

---

## 4. TRAVERTINE & STONE

Roman travertine is one of the most important materials in this design.

Introduce:

* monolithic travertine side tables
* sculptural stone coffee tables
* architectural travertine volumes
* travertine wall sections
* stone pedestals
* minimalist console surfaces

Use warm beige travertine with realistic natural texture.

Where appropriate, introduce **vertical fluting or linear carving in the stone**.

The stone must feel:

* substantial
* architectural
* expensive
* natural
* timeless

Avoid excessive marble veining.

Prioritize travertine.

---

## 5. WOOD & FLUTED TEXTURES

Introduce warm, refined wood elements with strong architectural detailing.

Use:

* fluted wood wall paneling
* vertical timber slats
* flush invisible doors integrated into wall paneling
* bespoke cabinetry
* architectural wood partitions
* recessed baseboards with shadow gaps

The fluting should create strong vertical rhythm.

Wood should be:

* warm medium-to-dark brown
* matte
* refined
* natural
* sophisticated

Avoid rustic wood.

The look should remain contemporary and precise.

---

## 6. WALLS & ARCHITECTURAL DETAILS

Create clean architectural wall compositions.

Possible treatments include:

* fluted timber
* Roman travertine
* warm mineral plaster
* microcement
* smooth neutral plaster
* flush doors
* shadow-gap details
* black metal profiles

Use concealed junctions and precise detailing.

The architecture should feel custom-designed and bespoke.

Avoid decorative moldings associated with classical interiors.

---

## 7. SCULPTURAL FURNITURE

Use premium contemporary furniture with a strong sculptural presence.

Introduce furniture such as:

* low-profile geometric sofas
* softly curved lounge seating
* monolithic travertine side tables
* sculptural coffee tables
* statement armchairs
* architect-designed leather chairs
* rounded occasional tables
* minimalist benches

Furniture should combine:

**strict architectural geometry + soft sculptural curves.**

The room should not feel overloaded.

Use fewer, stronger pieces.

---

## 8. TEXTILES & UPHOLSTERY

Use sophisticated editorial textiles.

Include where appropriate:

* deep forest-green silk velvet
* forest-green matte velvet
* textured ivory bouclé
* cream bouclé
* warm neutral upholstery
* cognac saddle leather
* premium woven textiles

Leather can include subtle contrast stitching.

Textiles should provide warmth against the rigid architectural materials.

---

## 9. FORMS

The visual identity depends on the contrast between **rigid architecture and fluid furniture**.

Use:

### Architectural forms

* strict vertical lines
* fluted surfaces
* rectilinear wall compositions
* cubic stone volumes
* strong geometric frames
* monolithic blocks
* precise black metal lines

### Organic / sculptural forms

* curved lounge chairs
* rounded sofas
* sculptural seating silhouettes
* rounded accessories
* organically shaped occasional furniture

Balance sharp architectural geometry with softer sculptural elements.

---

## 10. METAL & IRONWORK

Use a combination of:

* brushed brass
* matte black powder-coated steel

Possible applications:

* lighting
* shelving details
* furniture legs
* partitions
* frames
* architectural trims
* custom ironwork

Metal elements should look thin, elegant and bespoke.

Avoid chrome.

Avoid shiny stainless steel.

---

## 11. ART & DECORATION

Treat the space as if it were partly a **private contemporary art gallery**.

Add restrained elements such as:

* minimalist pedestal sculptures
* abstract contemporary artwork
* sculptural ceramic objects
* museum-style decorative pieces
* large-scale artwork where appropriate
* custom geometric mirrors

Keep décor minimal.

Do not fill every surface.

Allow negative space around artworks and sculptural pieces.

---

## 12. LIGHTING

Create sophisticated **museum-inspired directional lighting**.

Use:

* directional ceiling spotlights
* recessed architectural lighting
* museum-style track spots where appropriate
* geometric brushed-brass wall sconces
* contemporary chandeliers
* indirect integrated LEDs
* discreet accent lighting

Use a warm-neutral interior lighting temperature, approximately:

**2700K—3000K**

Use light to highlight:

* stone texture
* fluted wood
* artwork
* sculptures
* furniture
* architectural surfaces

Lighting should be dramatic enough to create depth but still realistic and comfortable.

---

## 13. FURNITURE PLACEMENT

Adapt the design intelligently to the existing room.

Do not randomly place furniture.

Respect:

* circulation routes
* furniture scale
* existing openings
* functional zones
* visual balance
* real-world ergonomics

Leave intentional negative space.

The room should feel curated rather than crowded.

---

## 14. IDEAL ATMOSPHERE

The final interior should evoke:

* contemporary art gallery
* luxury penthouse
* high-end architectural residence
* designer apartment
* exclusive executive space

Imagine a project photographed for:

* Architectural Digest
* Dezeen
* luxury interior architecture magazines

But maintain a realistic residential atmosphere.

---

## 15. MATERIAL REALISM

Materials must look physically believable.

Show realistic:

* travertine pores
* subtle stone imperfections
* wood grain
* fluted panel depth
* velvet texture
* bouclé fibers
* saddle leather
* brushed brass reflections
* matte black metal
* mineral plaster
* microcement texture

Avoid plastic-looking materials.

---

## 16. PHOTOREALISM

Generate the final result as:

* ultra-photorealistic architectural photography
* high-end interior visualization
* realistic global illumination
* realistic soft shadows
* physically accurate materials
* detailed surface textures
* natural reflections
* realistic furniture proportions
* premium editorial interior photography
* high dynamic range
* sophisticated composition
* realistic depth
* high resolution

## STRICT CONSTRAINTS

Do NOT:

* change the original room geometry
* redesign the entire architecture unnecessarily
* move windows
* move doors
* alter the camera angle
* alter perspective
* make the room larger
* create impossible structural elements
* overcrowd the space
* use excessive décor
* use bright saturated colors
* introduce unrelated design styles
* use rustic furniture
* use classic ornamental furniture
* use cheap glossy finishes
* use excessive gold
* use chrome
* use cold blue lighting
* make everything dark
* add unnecessary plants
* add random furniture
* add text
* add logos
* add watermarks

---

## FINAL TARGET

Transform the uploaded room into a **Contemporary Architectural Chic interior** featuring:

**Roman travertine + architectural black + warm fluted wood + brushed brass + forest-green velvet + sculptural furniture + contemporary art + museum-inspired lighting.**

Maintain the original architecture while giving the room a highly sophisticated, gallery-like, bespoke and professionally designed character.`
};

// Map alternate/legacy IDs
MOODBOARD_PROMPTS['luxury-warmth'] = MOODBOARD_PROMPTS['luxury-warm'];
MOODBOARD_PROMPTS['japandi-minimal'] = MOODBOARD_PROMPTS['japandi-organic'];
