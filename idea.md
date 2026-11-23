# MathCube 3D — Creative Camera Arcade Ideas & Tech Roadmap

## 1. Six Creative Camera Arcade Games for Kids

### 1. 🖐️ Finger Counter Wizard *(Hand Landmarks + Math)*
- **Concept:** A magic cauldron or friendly wizard asks *"Show me `3 + 4`!"* or *"Hold up `2 × 3` fingers!"*
- **Interaction:** The kid holds up the exact number of fingers (`0–10`) across both hands in front of the camera. Sparkles shoot from each raised fingertip landmark and lock in the answer.
- **Bonus Twist:** Pinch thumb + index finger to grab a floating number bubble and drop it into a potion bottle.

### 2. 🏃 Number Runner / Duck & Jump *(Full-Body Pose + Motion + Touch)*
- **Concept:** A 3-lane endless runner overlaid on the camera! A math equation appears ahead while 3 numbered gates (`12`, `14`, `16`) and physical obstacles rush down the track.
- **Interaction:**
  - **Move Left / Center / Right** by stepping or leaning into the lane.
  - **Jump** physically over low lava logs / rocks / snowdrifts.
  - **Duck** physically under flying bats / meteors / ice clouds.
- **Why Kids Love It:** Big, energetic physical movement with clear visual feedback and zero tiny-target frustration.

### 3. 🎨 Air Painter Shapes & Symmetry *(Index-Finger Tracking)*
- **Concept:** Kids point one index finger to draw glowing neon trails in mid-air to trace numbers, draw `3` triangles or `4` stars, or complete missing halves of symmetrical butterflies and rockets.
- **Interaction:** Index fingertip draws; closing a **fist** clears the canvas; giving a **thumbs-up** submits the shape.

### 4. 🫧 Blow-the-Bubble & Smile Boost *(Face Mesh + Mic Airflow)*
- **Concept:** Floating bubbles carry math equations. Kids blow gently into the device microphone to lift the right bubble into a rainbow hoop, or tilt their head left/right to steer a spaceship and smile/open their mouth to fire a star-beam at the matching asteroid.
- **Interaction:** Sustained low-frequency mic airflow + facial blendshapes (head tilt, smile, jaw open).

### 5. 🦖 Dino Footprint Stomp / Floor-is-Lava *(Pose Ankles & Wrists + Segmentation)*
- **Concept:** Prop the tablet or laptop slightly back so the camera sees the player standing. Virtual stepping stones (`2, 4, 6, 8...` skip-counting or multiples of `3`) appear along the ground while the room background turns into a volcano.
- **Interaction:** Stomp or high-five each correct stepping stone in sequence before the lava rises.

### 6. 🍎 Monster Feeder *(Face + Hand Pinch + Selfie Segmentation)*
- **Concept:** An AR monster buddy sits right on the kid's shoulder and asks for *"10 apples!"*
- **Interaction:** Kids pinch virtual apples from trees around the screen to feed the monster, or open their own mouth to chomp bonus golden stars.

---

## 2. Modern Browser Innovations for Pro-Grade Camera Games

| Capability | Lightweight Offline Baseline | Pro WebGPU / ML Upgrade | Gameplay Impact |
| :--- | :--- | :--- | :--- |
| **Hand & Finger Tracking** | Left/Right pixel-diff zones | `@mediapipe/tasks-vision` `HandLandmarker` (`delegate: "GPU"`) | Tracks 21 3D joints per hand for finger counting (`0–10`), pinch-to-drag, and fist/palm gestures. |
| **Full-Body Pose** | Zone-based motion + `FaceDetector` | `PoseLandmarker` (33 body joints) | Real shoulders, elbows, wrists, hips, and ankles for accurate jump, duck, and bridge poses. |
| **Facial Expressions** | Native `FaceDetector` box | `FaceLandmarker` + 52 Blendshapes | Cross-browser smile, blink, brow-raise, and mouth-open game triggers. |
| **Background Replacement** | Semi-transparent canvas over webcam | `ImageSegmenter` (Selfie Segmentation) | Places the kid *inside* a snowy forest, jungle, or galaxy without a green screen. |
| **Voice Answers** | Mic amplitude peak (clap detection) | Web Speech API or on-device Whisper (`Transformers.js` + WebGPU) | Kids can shout answers aloud while jumping or holding poses. |
| **60 FPS Performance** | Main-thread loop | Web Worker + `ImageBitmap` + `OffscreenCanvas` | Keeps ML inference off the UI thread with `float16` models on `640×360` input frames. |
| **Tactile Game Feel** | Web Audio synthesizer | `StereoPannerNode` + `navigator.vibrate()` + 2D physics | Left/right spatial sound effects, mobile haptics, and realistic bounce/shatter physics. |

---

## 3. K–5 English Phonics — 3-Letter & 4-Letter Regular Words (Reading & Writing)

To pair with MathCube 3D's camera-plus-touch arcade engine, the English Phonics module targets **phonetically regular 3-letter and 4-letter words** from Kindergarten through Grade 5, progressively moving from CVC short vowels to consonant blends, digraphs, Magic-E, r-controlled vowels, and vowel teams.

### K–5 Regular Word Progression

| Grade / Tier | Phonics Focus | Word Length | Example Regular Words |
| :--- | :--- | :--- | :--- |
| **🐣 Kindergarten (`k`)** | Short-vowel CVC words | 3-letter | `cat`, `dog`, `sun`, `pig`, `hat`, `bed`, `bus`, `fox`, `cup`, `bug`, `map`, `net` |
| **🌱 Grade 1 (`g1`)** | Initial & final consonant blends | 4-letter | `frog`, `crab`, `drum`, `flag`, `clap`, `swim`, `stop`, `plum`, `lamp`, `tent`, `hand`, `nest` |
| **🚀 Grade 2 (`g2`)** | Consonant digraphs & FLOSS (`sh`, `ch`, `th`, `ck`, `ng`, `ll`) | 4-letter | `ship`, `fish`, `shop`, `chip`, `chat`, `chin`, `bath`, `moth`, `duck`, `lock`, `ring`, `bell` |
| **✨ Grade 3 (`g3`)** | Silent Magic-E (`CVCe`) & r-controlled vowels (`ar`, `or`) | 4-letter | `cake`, `bike`, `kite`, `bone`, `cube`, `tape`, `cape`, `pine`, `star`, `bark`, `fork`, `corn` |
| **👑 Grades 4–5 (`g4_5`)** | Long vowel teams (`ai`, `ay`, `ee`, `ea`, `oa`, `oo`, `ow`) | 4-letter | `rain`, `tail`, `play`, `tree`, `seed`, `leaf`, `seal`, `boat`, `goat`, `moon`, `book`, `snow` |

### Six Interactive English Phonics Game Options

#### Option 1: 👏 Phonics Clap Blender AR *(Implemented)*
- **Concept:** An onset tile (`c`, `fr`, `sh`, `tr`) and rime tile (`at`, `og`, `ip`, `ee`) float in the left and right zones over the live camera (or touch pads).
- **Interaction:** Catch/lock both halves with left & right hands (or taps), then **clap** hands together (or tap **Blend!**) to fuse them into the whole word (`c + at → cat 🐱`) with syllable/phoneme audio.
- **Bonus Mode:** **Magic-E Transformer** — catch a base CVC word (`cap`, `kit`, `cub`) and clap in a sparkling `e` wand to transform it (`cap → cape 🦸`, `kit → kite 🪁`).

#### Option 2: 💥 Letter Blaster / Sound Smash AR *(Implemented)*
- **Concept:** A picture prompt (e.g., 🐸 `f - r - o - g` or 🚢 `sh - i - p`) appears at the top while floating letter/tile meteors drift across the sky.
- **Interaction:** Wave or tap the matching letters/digraphs in left-to-right spelling order to blast them into the word slots; wrong decoys wobble away with gentle phonetic feedback.

#### Option 3: 🏃 Phonics Runner AR *(Implemented)*
- **Concept:** A 3-lane endless runner where a spoken/illustrated word challenge appears ahead (`🌧️ r _ _ n` or whole-word match across 3 gates).
- **Interaction:** Lean/step left, center, or right (or swipe/tap lanes) to steer the runner through the matching phoneme/word gate while jumping over logs or ducking under storm clouds.

#### Option 4: ✨ Air-Trace & Glow Pad *(Implemented — New)*
- **Concept:** Builds **writing & letter-formation fluency** for 3-letter and 4-letter regular words. A glowing dotted guide shows the target word (`cat`, `frog`, `ship`, `cake`, `rain`) with numbered stroke dots and directional hints.
- **Interaction:** Trace each letter in order using **Camera Index-Finger / Motion Brush** or direct **Touch/Mouse Glow Pen** on the canvas. Completing each letter lights up its phoneme sound; finishing all letters blooms the word emoji and awards a Starry Sticker.

#### Option 5: 🌉 Sound-Bridge Stretch *(Parked for Future Phase)*
- **Concept:** Sound-by-sound phoneme segmentation! Kids pull a glowing elastic "sound bridge" across the screen with both hands—stretching `/s/ — /u/ — /n/` slowly apart to reveal each hidden letter, then snapping hands together to read `sun` fast.
- **Why Parked:** Best paired with dual-hand `HandLandmarker` pinch tracking for accurate stretch-distance measurement.

#### Option 6: 🧪 Word Cauldron Mixer *(Parked for Future Phase)*
- **Concept:** A bubbly phonics potion lab where a monster buddy requests a rhyming or vowel-team potion (*"Brew a word that rhymes with `boat`!"*).
- **Interaction:** Grab floating onset/vowel-team/ending bubbles from around the room and drop them into the cauldron; valid real words fizz into colorful emoji creatures, while nonsense combos trigger silly giggles and gentle hints.
- **Why Parked:** Planned for future phase alongside monster-buddy voice/pinch upgrades.
