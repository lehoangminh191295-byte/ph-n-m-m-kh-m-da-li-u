import { Patient, Lesion, Appointment, AuditLogEntry, ClinicalProcedure, InventoryItem } from '../types';

// High-fidelity SVG Data URLs representing genuine clinical and dermoscopic views
// 1. Dysplastic Nevus / Atypical Melanocytic Lesion with Dermoscopy (Atypical pigment network)
export const SVG_MACRO_MELANOMA = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <radialGradient id="skinBase" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="%23f7d6be"/>
      <stop offset="70%" stop-color="%23e8c1a2"/>
      <stop offset="100%" stop-color="%23d4a887"/>
    </radialGradient>
    <filter id="skinTexture" x="0%" y="0%" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="4" result="noise"/>
      <feColorMatrix type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.15 0" in="noise" result="coloredNoise"/>
      <feComposite operator="in" in2="SourceGraphic"/>
    </filter>
  </defs>
  <rect width="400" height="400" fill="url(%23skinBase)"/>
  <!-- Skin pore texture and subtle folds -->
  <path d="M20,150 Q100,160 220,140 T380,155" stroke="%23caa181" stroke-width="0.8" fill="none" opacity="0.4"/>
  <path d="M40,240 Q180,250 290,235 T390,250" stroke="%23caa181" stroke-width="0.7" fill="none" opacity="0.35"/>
  
  <!-- Clinical Macroscopic Pigmented Lesion with irregular borders and asymmetric shades -->
  <g transform="translate(200, 200)">
    <!-- Base erythema / border flare -->
    <path d="M-65,-30 C-75,10 -40,65 10,70 C60,75 80,40 75,-20 C70,-60 10,-80 -40,-65 Z" fill="%23c26756" opacity="0.4" filter="blur(6px)"/>
    <!-- Outer irregular pigment -->
    <path d="M-58,-25 C-68,12 -35,58 12,62 C55,66 72,32 68,-18 C64,-52 8,-70 -35,-58 Z" fill="%235a3424"/>
    <!-- Darker core with deep brown/black tones -->
    <path d="M-42,-15 C-52,8 -25,42 8,45 C40,48 52,22 48,-12 C45,-38 5,-50 -26,-42 Z" fill="%232c1810"/>
    <!-- Eccentric dark nodule / asymmetric color variation -->
    <path d="M-28,-8 C-35,6 -18,28 4,30 C25,32 30,12 28,-10 C25,-25 -2,-32 -20,-25 Z" fill="%23140a06"/>
    <!-- Subtle blue-gray hue region -->
    <circle cx="12" cy="5" r="14" fill="%2343505c" opacity="0.55" filter="blur(3px)"/>
  </g>

  <!-- Metric reference ruler bar (10 mm) -->
  <g transform="translate(30, 360)">
    <rect width="120" height="14" fill="%23ffffff" stroke="%230f172a" stroke-width="1.5" rx="2"/>
    <line x1="0" y1="0" x2="0" y2="14" stroke="%23000000" stroke-width="1.5"/>
    <line x1="12" y1="0" x2="12" y2="7" stroke="%23000000" stroke-width="1"/>
    <line x1="24" y1="0" x2="24" y2="7" stroke="%23000000" stroke-width="1"/>
    <line x1="36" y1="0" x2="36" y2="7" stroke="%23000000" stroke-width="1"/>
    <line x1="48" y1="0" x2="48" y2="7" stroke="%23000000" stroke-width="1"/>
    <line x1="60" y1="0" x2="60" y2="14" stroke="%23000000" stroke-width="1.5"/>
    <line x1="120" y1="0" x2="120" y2="14" stroke="%23000000" stroke-width="1.5"/>
    <text x="65" y="11" font-family="sans-serif" font-size="9" font-weight="bold" fill="%230f172a">10 mm</text>
  </g>
  <text x="30" y="30" font-family="sans-serif" font-size="12" font-weight="bold" fill="%231e293b" opacity="0.8">HÌNH ẢNH ĐẠI THỂ (MACROSCOPIC)</text>
</svg>`;

export const SVG_DERMOSCOPY_MELANOMA = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <!-- Polarized dermoscopic lens circular gradient -->
    <radialGradient id="lensVignette" cx="50%" cy="50%" r="50%">
      <stop offset="78%" stop-color="%23fdf4ec"/>
      <stop offset="92%" stop-color="%23e0c0a8"/>
      <stop offset="100%" stop-color="%231e293b"/>
    </radialGradient>
    <radialGradient id="polarizedCore" cx="50%" cy="50%" r="48%">
      <stop offset="0%" stop-color="%23ffffff" stop-opacity="0.2"/>
      <stop offset="100%" stop-color="%23000000" stop-opacity="0.4"/>
    </radialGradient>
  </defs>

  <!-- Circular dermatoscope view port -->
  <rect width="400" height="400" fill="%230f172a"/>
  <circle cx="200" cy="200" r="190" fill="url(%23lensVignette)"/>
  
  <!-- Dermoscopy Cross-polarization overlay & reticular pigment network -->
  <g transform="translate(200, 200)">
    <!-- Asymmetrical atypical pigment network background -->
    <path d="M-110,-40 C-125,40 -70,115 20,120 C95,125 130,60 120,-30 C110,-100 20,-130 -60,-110 Z" fill="%238a4d2e" opacity="0.85"/>
    
    <!-- Dense brownish-black blotch / atypical pigment clumps -->
    <path d="M-80,-20 C-90,30 -50,85 10,90 C70,95 95,50 90,-15 C85,-70 20,-90 -45,-75 Z" fill="%23432013"/>
    
    <!-- Blue-white veil in central-eccentric area -->
    <ellipse cx="-15" cy="-5" rx="45" ry="32" fill="%235b7188" opacity="0.75" filter="blur(4px)"/>
    <ellipse cx="-10" cy="-2" rx="35" ry="24" fill="%23859bb3" opacity="0.5" filter="blur(2px)"/>

    <!-- Atypical pigment network lines (reticular pattern) -->
    <path d="M-100,-30 L-70,-10 M-85,15 L-60,30 M-70,55 L-40,65 M-105,5 L-75,15 M-90,-50 L-60,-35" stroke="%232b130a" stroke-width="2.2" stroke-linecap="round"/>
    <path d="M-70,-10 L-75,15 M-60,30 L-65,55 M-40,65 L-35,80 M-60,-35 L-55,-10" stroke="%232b130a" stroke-width="2" stroke-linecap="round"/>

    <!-- Peripheral streaks and pseudopods (dấu hiệu giả chân / tia phóng) -->
    <path d="M-115,-45 L-135,-55 M-120,-20 L-142,-22 M-110,35 L-132,48 M-80,95 L-95,115 M-45,112 L-52,132" stroke="%233a180b" stroke-width="2.5" stroke-linecap="round"/>

    <!-- Irregular brown/black dots and globules (chấm và hạt không đều) -->
    <circle cx="55" cy="40" r="3.5" fill="%231a0b06"/>
    <circle cx="70" cy="20" r="4.2" fill="%231a0b06"/>
    <circle cx="65" cy="-15" r="3" fill="%231a0b06"/>
    <circle cx="45" cy="-45" r="4.8" fill="%231a0b06"/>
    <circle cx="85" cy="5" r="2.8" fill="%231a0b06"/>
    <circle cx="35" cy="70" r="3.2" fill="%231a0b06"/>
    <circle cx="-30" cy="-60" r="4" fill="%23100603"/>
    <circle cx="-5" cy="-75" r="3" fill="%23100603"/>
    <circle cx="20" cy="-70" r="3.8" fill="%23100603"/>

    <!-- Atypical vascular structures (hairpin and dotted vessels) -->
    <path d="M-25,15 C-20,25 -15,15 -10,25" stroke="%23c5221f" stroke-width="1.8" fill="none" opacity="0.8"/>
    <path d="M15,10 C20,22 25,12 30,20" stroke="%23c5221f" stroke-width="1.6" fill="none" opacity="0.8"/>
    <circle cx="-5" cy="30" r="1.5" fill="%23c5221f"/>
    <circle cx="5" cy="35" r="1.5" fill="%23c5221f"/>
    <circle cx="0" cy="25" r="1.5" fill="%23c5221f"/>

    <!-- Shiny white streaks / crystalline structures (polarized) -->
    <line x1="-30" y1="-10" x2="-5" y2="-10" stroke="%23ffffff" stroke-width="1.6" opacity="0.75"/>
    <line x1="-20" y1="-20" x2="-20" y2="5" stroke="%23ffffff" stroke-width="1.6" opacity="0.75"/>
  </g>

  <!-- Dermatoscope reticle scale circle (1 mm increments) -->
  <circle cx="200" cy="200" r="175" stroke="%230f172a" stroke-width="1" stroke-dasharray="2,6" opacity="0.4" fill="none"/>
  <circle cx="200" cy="200" r="190" fill="url(%23polarizedCore)"/>

  <!-- HUD overlay info -->
  <g transform="translate(25, 30)">
    <rect width="180" height="24" rx="4" fill="%230f172a" opacity="0.75"/>
    <text x="10" y="16" font-family="sans-serif" font-size="11" font-weight="bold" fill="%2338bdf8">DERMOSCOPY: 10X POLARIZED</text>
  </g>
</svg>`;

// 2. Basal Cell Carcinoma (BCC) - Macroscopic & Dermoscopy (Arborizing telangiectasia)
export const SVG_MACRO_BCC = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <radialGradient id="skinBcc" cx="50%" cy="50%" r="70%">
      <stop offset="0%" stop-color="%23f9dec9"/>
      <stop offset="80%" stop-color="%23ebbfa2"/>
      <stop offset="100%" stop-color="%23d6a382"/>
    </radialGradient>
  </defs>
  <rect width="400" height="400" fill="url(%23skinBcc)"/>
  <g transform="translate(200, 200)">
    <!-- Pearly pink nodule with rolled borders -->
    <ellipse cx="0" cy="0" rx="45" ry="40" fill="%23e89c92" opacity="0.6" filter="blur(4px)"/>
    <ellipse cx="0" cy="0" rx="38" ry="32" fill="%23f4b5ac"/>
    <ellipse cx="-8" cy="-6" rx="28" ry="22" fill="%23fad5ce" opacity="0.8"/>
    <!-- Central crust / subtle ulceration -->
    <path d="M-6,-4 C-8,4 2,8 7,5 C12,1 8,-7 -1,-6 Z" fill="%237b2d26"/>
    <!-- Fine visible surface vessels -->
    <path d="M-25,10 Q-10,5 5,12 T25,8" stroke="%23b91c1c" stroke-width="1.2" fill="none" opacity="0.85"/>
  </g>
  <text x="30" y="30" font-family="sans-serif" font-size="12" font-weight="bold" fill="%231e293b" opacity="0.8">TỔN THƯƠNG ĐẠI THỂ: SẨN NGỌC ÁNH BÓNG (BCC)</text>
</svg>`;

export const SVG_DERMOSCOPY_BCC = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <radialGradient id="bccLens" cx="50%" cy="50%" r="50%">
      <stop offset="80%" stop-color="%23fff1ea"/>
      <stop offset="95%" stop-color="%23dfbeaa"/>
      <stop offset="100%" stop-color="%230f172a"/>
    </radialGradient>
  </defs>
  <rect width="400" height="400" fill="%230f172a"/>
  <circle cx="200" cy="200" r="190" fill="url(%23bccLens)"/>

  <!-- Arborizing telangiectasia (mạch máu hình cành cây) & blue-gray ovoid nests -->
  <g transform="translate(200, 200)">
    <!-- Pearly translucent pinkish white background -->
    <circle cx="0" cy="0" r="100" fill="%23fcdbd4" opacity="0.7"/>
    
    <!-- Blue-gray ovoid nests / globules (ổ sắc tố xám xanh) -->
    <ellipse cx="-45" cy="-20" rx="22" ry="16" fill="%23475569" opacity="0.9"/>
    <ellipse cx="-20" cy="-45" rx="16" ry="12" fill="%23334155" opacity="0.85"/>
    <ellipse cx="-55" cy="25" rx="14" ry="11" fill="%23475569" opacity="0.8"/>
    <circle cx="45" cy="-35" r="7" fill="%23475569"/>
    <circle cx="55" cy="-20" r="5" fill="%23475569"/>

    <!-- Central ulceration with yellowish-brown crust -->
    <path d="M-15,-10 C-20,15 10,25 25,10 C30,-5 5,-20 -15,-10 Z" fill="%23854d0e" opacity="0.85"/>

    <!-- Classic Arborizing Branching Telangiectatic Vessels -->
    <!-- Main stem 1 -->
    <path d="M-80,-60 Q-40,-30 0,-5 T50,20" stroke="%23b91c1c" stroke-width="3" fill="none" stroke-linecap="round"/>
    <!-- Branches -->
    <path d="M-40,-30 Q-20,-50 10,-60" stroke="%23dc2626" stroke-width="2" fill="none"/>
    <path d="M-20,-38 Q0,-35 25,-45" stroke="%23dc2626" stroke-width="1.6" fill="none"/>
    <path d="M-5,-9 Q-10,15 -30,35" stroke="%23dc2626" stroke-width="2.2" fill="none"/>
    <path d="M15,5 Q30,-15 60,-10" stroke="%23dc2626" stroke-width="1.8" fill="none"/>
    <path d="M35,14 Q45,35 65,40" stroke="%23dc2626" stroke-width="1.7" fill="none"/>
    <path d="M0,-5 Q10,25 20,45" stroke="%23ef4444" stroke-width="1.5" fill="none"/>
  </g>
  <g transform="translate(25, 30)">
    <rect width="215" height="24" rx="4" fill="%230f172a" opacity="0.75"/>
    <text x="10" y="16" font-family="sans-serif" font-size="11" font-weight="bold" fill="%2338bdf8">DERMOSCOPY: ARBORIZING VESSELS</text>
  </g>
</svg>`;

// 3. Treated follow-up lesion (After 3 months treatment - regression and reduced erythema)
export const SVG_DERMOSCOPY_FOLLOWUP = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 400 400" width="100%" height="100%">
  <defs>
    <radialGradient id="followupLens" cx="50%" cy="50%" r="50%">
      <stop offset="80%" stop-color="%23f7ede4"/>
      <stop offset="95%" stop-color="%23dcc2af"/>
      <stop offset="100%" stop-color="%230f172a"/>
    </radialGradient>
  </defs>
  <rect width="400" height="400" fill="%230f172a"/>
  <circle cx="200" cy="200" r="190" fill="url(%23followupLens)"/>

  <g transform="translate(200, 200)">
    <!-- Significantly diminished and organized pigment lesion (Progress improvement) -->
    <ellipse cx="0" cy="0" rx="65" ry="50" fill="%239a6745" opacity="0.6"/>
    <ellipse cx="-5" cy="0" rx="40" ry="30" fill="%23683f23" opacity="0.75"/>

    <!-- Regularized pigment network with peripheral clearing -->
    <path d="M-40,-15 L-20,-5 M-30,10 L-10,15 M-35,-25 L-15,-20" stroke="%233f2010" stroke-width="1.4"/>
    <path d="M20,-10 L35,5 M15,10 L30,20" stroke="%233f2010" stroke-width="1.4"/>

    <!-- Subtle regular globules and post-inflammatory regression -->
    <circle cx="30" cy="-15" r="2.2" fill="%232b1307"/>
    <circle cx="25" cy="15" r="2.2" fill="%232b1307"/>
    <circle cx="-15" cy="22" r="2.2" fill="%232b1307"/>

    <!-- No ulceration, no active blue-white veil, no irregular streaks -->
    <text x="-70" y="85" font-family="sans-serif" font-size="10" font-weight="bold" fill="%2315803d">TIẾN TRIỂN TỐT: THOÁI TRIỂN VIÊM & SẮC TỐ</text>
  </g>
  <g transform="translate(25, 30)">
    <rect width="210" height="24" rx="4" fill="%2314532d" opacity="0.85"/>
    <text x="10" y="16" font-family="sans-serif" font-size="11" font-weight="bold" fill="%2386efac">TÁI KHÁM SAU 3 THÁNG ĐIỀU TRỊ</text>
  </g>
</svg>`;

export const INITIAL_PATIENTS: Patient[] = [
  {
    id: 'pt-001',
    code: 'BN-2026-0042',
    fullName: 'Nguyễn Thị Mai Lan',
    dob: '1984-06-18',
    age: 42,
    gender: 'Nữ',
    phone: '0912345678',
    email: 'mailan.nguyen84@gmail.com',
    address: 'Quận 3, TP. Hồ Chí Minh',
    fitzpatrick: 'Type III',
    medicalHistory: 'Không có tiền sử bệnh tự miễn. Thường xuyên tiếp xúc ánh nắng ngoài trời.',
    allergies: 'Dị ứng thuốc bôi nhóm Sulfamide',
    familySkinCancerHistory: true,
    consentSigned: true,
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-06-10T08:30:00Z',
    updatedAt: '2026-08-25T14:15:00Z',
  },
  {
    id: 'pt-002',
    code: 'BN-2026-0089',
    fullName: 'Trần Văn Bình',
    dob: '1968-11-22',
    age: 58,
    gender: 'Nam',
    phone: '0987654321',
    email: 'binhtran1968@yahoo.com',
    address: 'Ba Đình, TP. Hà Nội',
    fitzpatrick: 'Type II',
    medicalHistory: 'Tăng huyết áp nhẹ điều trị đều. Tiền sử làm việc công trường nông nghiệp 20 năm.',
    allergies: 'Chưa ghi nhận dị ứng',
    familySkinCancerHistory: false,
    consentSigned: true,
    avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-07-02T09:15:00Z',
    updatedAt: '2026-08-30T10:00:00Z',
  },
  {
    id: 'pt-003',
    code: 'BN-2026-0115',
    fullName: 'Lê Hoàng Khánh Vy',
    dob: '1997-03-14',
    age: 29,
    gender: 'Nữ',
    phone: '0903112233',
    email: 'khanhvy.le97@gmail.com',
    address: 'Hải Châu, TP. Đà Nẵng',
    fitzpatrick: 'Type IV',
    medicalHistory: 'Cơ địa dị ứng thời tiết, viêm mũi dị ứng.',
    allergies: 'Hải sản (tôm, cua)',
    familySkinCancerHistory: false,
    consentSigned: true,
    avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    createdAt: '2026-08-01T14:00:00Z',
    updatedAt: '2026-08-28T16:30:00Z',
  },
];

export const INITIAL_LESIONS: Lesion[] = [
  {
    id: 'les-001',
    patientId: 'pt-001',
    code: 'TL-01',
    anatomicalSite: 'Lưng - Vùng dưới bả vai trái',
    lesionType: 'Tổn thương sắc tố không đối xứng',
    onsetDuration: '5 tháng',
    initialSize: '9.2 x 7.5 mm',
    morphologyNotes: 'Mảng sắc tố gồ nhẹ không đối xứng, màu nâu sẫm pha đen và ánh xanh xám, bờ răng cưa không đều, bề mặt thô ráp.',
    symptoms: ['Ngứa nhẹ râm ran', 'Đổi màu đậm hơn gần đây', 'Bờ không đều'],
    status: 'ACTIVE_MONITORING',
    createdAt: '2026-06-10T08:30:00Z',
    visits: [
      {
        id: 'vis-001-1',
        lesionId: 'les-001',
        patientId: 'pt-001',
        visitDate: '2026-06-10',
        visitType: 'Khám lần đầu',
        doctorName: 'BS. CKII Lê Hoàng Minh',
        lesionSize: '9.2 x 7.5 mm',
        clinicalSymptoms: ['Ngứa nhẹ râm ran', 'Thay đổi màu sắc'],
        clinicalNotes: 'Tổn thương sắc tố dạng mảng gồ nhẹ vùng bả vai trái, bờ không đều, đa sắc (nâu đậm, đen, vùng xanh xám).',
        diagnosis: 'Nốt ruồi loạn sản (Dysplastic Nevus) - Theo dõi nghi ngờ U hắc tố sớm (Early Melanoma)',
        treatmentApplied: 'Bảo vệ da nghiêm ngặt trước tia UV, giám sát động học Dermoscopy kỹ thuật số sau 10 tuần.',
        treatmentPlan: {
          treatmentContent: 'Kiểm soát tác động quang học UV, theo dõi động học vi thể Dermoscopy định kỳ, dự phòng tiến triển ác tính.',
          interventionProcedure: 'Chụp lưu trữ Dermoscopy phân cực 10x kèm thước đo vi thể 1mm; Khám sàng lọc da toàn thân (Full body skin exam).',
          skincareRegimen: 'Thoa kem chống nắng phổ rộng SPF 50+, PA++++ mỗi sáng và trưa; Không tự ý nặn bóp, tẩy nốt ruồi hay can thiệp laser khi chưa sinh thiết.',
          prescriptions: [
            {
              id: 'rx-mock-1',
              medicationName: 'Heliocare 360° Mineral Tolerance Fluid SPF 50+',
              formAndRoute: 'Kem chống nắng vật lý',
              dosage: 'Thoa mỗi buổi sáng trước khi ra ngoài 20 phút và dặm lại lúc 12h trưa',
              quantity: '1 tuýp 50ml',
              instructions: 'Lượng thoa khoảng 2 đốt ngón tay cho toàn mặt và vùng cổ/bả vai hở.'
            },
            {
              id: 'rx-mock-2',
              medicationName: 'Avene Cicalfate+ Restorative Protective Cream',
              formAndRoute: 'Kem bôi phục hồi da',
              dosage: 'Thoa 2 lần/ngày sáng và tối lên vùng da khô ngứa',
              quantity: '1 tuýp 40ml',
              instructions: 'Giúp phục hồi màng lipid, làm dịu cảm giác ngứa râm ran.'
            }
          ]
        },
        doctorInstructions: 'Tránh cào gãi, không tẩy xóa nốt ruồi cơ học. Tái khám sau 2 tháng để chụp đối chiếu dermoscopy.',
        images: [
          {
            id: 'img-001-macro',
            type: 'macroscopic',
            dataUrl: SVG_MACRO_MELANOMA,
            label: 'Tổng quan tổn thương lưng (Đại thể)',
            takenAt: '2026-06-10T08:45:00Z',
            magnification: 'Macro 1:1 kèm thước mm',
          },
          {
            id: 'img-001-dermo',
            type: 'dermoscopy',
            dataUrl: SVG_DERMOSCOPY_MELANOMA,
            label: 'Soi da Dermoscopy phân cực',
            takenAt: '2026-06-10T08:50:00Z',
            magnification: '10x Contact Polarized',
          },
        ],
        aiAnalysis: {
          summary: 'Tổn thương sắc tố dạng tế bào hắc tố có cấu trúc không điển hình cao. Ghi nhận mạng lưới sắc tố bất đối xứng, vùng màn che xanh trắng trung tâm và các chấm hạt phân bố ngoại vi không đồng đều.',
          macroscopicFindings: 'Mảng sắc tố bờ răng cưa không đều, kích thước > 6mm, màu sắc không đồng nhất từ nâu sẫm đến đen nhánh và vùng xám tro.',
          dermoscopyFindings: {
            pigmentNetwork: 'Mạng sắc tố không điển hình (Atypical pigment network) với các mắt lưới dày mỏng không đều.',
            vascularPattern: 'Mạch máu dạng chấm rải rác và một số quai mạch hình kẹp tóc bất thường.',
            dotsAndGlobules: 'Chấm và hạt sắc tố màu nâu đen phân bố ngoại vi bất đối xứng.',
            blueWhiteVeil: 'Vùng màn che xanh trắng diện tích khoảng 2.5 mm² ở nửa trên tổn thương.',
            structures: ['Atypical network', 'Blue-white veil', 'Peripheral streaks', 'Irregular globules'],
          },
          abcdScore: {
            asymmetry: 2,
            border: 6,
            color: 4,
            differentialStructures: 4,
            tds: 5.8,
            interpretation: 'Điểm TDS = 5.80 (>5.45) - Nguy cơ nghi ngờ U hắc tố (Melanoma suspicion). Khuyến nghị sinh thiết trọn tổn thương hoặc giám sát kỹ thuật số tần suất cao.',
          },
          riskLevel: 'HIGH',
          differentialDiagnoses: [
            { disease: 'U hắc tố ác tính nông (Superficial Spreading Melanoma)', probability: 68, rationale: 'Hiện diện đầy đủ tiêu chí ABCD và thang điểm 7 điểm (mạng sắc tố không điển hình, màn xanh trắng, vệt ngoại vi).' },
            { disease: 'Nốt ruồi loạn sản thể nặng (Severe Dysplastic Nevus)', probability: 24, rationale: 'Bờ không đều và cấu trúc hỗn hợp ở người có tiền sử gia đình.' },
            { disease: 'Dày sừng tiết bã sắc tố (Pigmented Seborrheic Keratosis)', probability: 8, rationale: 'Ít nghĩ tới do không có nang dạng sừng hoặc lỗ giả comedo đặc trưng.' },
          ],
          suggestedPrimaryDiagnosis: 'Nốt ruồi loạn sản nghi ngờ Melanoma giai đoạn sớm (TDS: 5.8)',
          recommendations: [
            'Chỉ định sinh thiết trọn tổn thương (Excisional biopsy) với bờ an toàn 2mm để làm giải phẫu bệnh.',
            'Nếu bệnh nhân chưa đồng ý can thiệp ngay, thực hiện giám sát dermoscopy kỹ thuật số ngắn ngày (Short-term digital dermoscopy monitoring - 4 đến 8 tuần).',
            'Khám sàng lọc toàn bộ da (Full body skin examination) để phát hiện các nốt ruồi bất thường khác.',
          ],
          urgentAttention: true,
          followUpInterval: '4 - 8 tuần hoặc can thiệp sinh thiết ngay',
          analyzedAt: '2026-06-10T09:05:00Z',
        },
        createdAt: '2026-06-10T08:30:00Z',
      },
      {
        id: 'vis-001-2',
        lesionId: 'les-001',
        patientId: 'pt-001',
        visitDate: '2026-08-25',
        visitType: 'Tái khám 3 tháng',
        doctorName: 'BS. CKII Lê Hoàng Minh',
        lesionSize: '8.4 x 6.8 mm',
        clinicalSymptoms: ['Hết ngứa', 'Tổn thương ổn định sau chăm sóc'],
        clinicalNotes: 'Tái khám định kỳ sau 10 tuần. Tổn thương có dấu hiệu thoái triển nhẹ vùng rìa, sắc tố nhạt màu hơn.',
        diagnosis: 'Nốt ruồi sắc tố thoái triển lành tính sau theo dõi sát',
        treatmentApplied: 'Duy trì kem dưỡng ẩm và bảo vệ chống nắng. Chưa cần can thiệp ngoại khoa xâm lấn.',
        doctorInstructions: 'Tiếp tục tái khám định kỳ sau 6 tháng. Khi có bất kỳ vết loét hay rỉ máu cần đến khám ngay.',
        images: [
          {
            id: 'img-001-followup-dermo',
            type: 'dermoscopy',
            dataUrl: SVG_DERMOSCOPY_FOLLOWUP,
            label: 'Soi da Dermoscopy lần tái khám',
            takenAt: '2026-08-25T14:30:00Z',
            magnification: '10x Contact Polarized',
          },
        ],
        comparisonWithPrevious: {
          progressStatus: 'IMPROVED',
          statusLabel: 'Tiến triển tốt - Thu nhỏ kích thước và thoái triển cấu trúc nguy cơ',
          sizeChangeDescription: 'Kích thước giảm từ 9.2 x 7.5 mm xuống 8.4 x 6.8 mm (giảm diện tích khoảng 12%).',
          pigmentationChangeDescription: 'Vùng hắc tố giảm mật độ ở ngoại vi, không còn hiện tượng ban đỏ ranh giới.',
          dermoscopyEvolution: 'Màn che xanh trắng giảm rõ rệt, mạng lưới sắc tố đều hơn, không ghi nhận thêm vệt giả chân mới.',
          treatmentEfficacyEvaluation: 'Đáp ứng rất khả quan với phác đồ bảo vệ và phục hồi hàng rào da.',
          nextStepRecommendations: [
            'Duy trì theo dõi định kỳ sau 6 tháng.',
            'Lưu trữ hình ảnh đối chiếu vào hồ sơ bệnh án điện tử.',
          ],
          evaluatedAt: '2026-08-25T14:45:00Z',
        },
        createdAt: '2026-08-25T14:15:00Z',
      },
    ],
  },
  {
    id: 'les-002',
    patientId: 'pt-002',
    code: 'TL-02',
    anatomicalSite: 'Vùng má trái cạnh cánh mũi',
    lesionType: 'Sẩn ngọc ánh bóng gồ nhẹ',
    onsetDuration: '8 tháng',
    initialSize: '5.5 x 4.8 mm',
    morphologyNotes: 'Sẩn tròn gồ cao ánh ngọc (pearly translucent papule), bờ cuộn nhẵn bóng, trung tâm hơi lõm có vảy tiết nâu nhạt nhỏ.',
    symptoms: ['Thỉnh thoảng rỉ máu khi rửa mặt', 'Gồ lên mặt da', 'Không ngứa'],
    status: 'ACTIVE_MONITORING',
    createdAt: '2026-07-02T09:15:00Z',
    visits: [
      {
        id: 'vis-002-1',
        lesionId: 'les-002',
        patientId: 'pt-002',
        visitDate: '2026-07-02',
        visitType: 'Khám lần đầu',
        doctorName: 'ThS. BS Trần Đình Hưng',
        lesionSize: '5.5 x 4.8 mm',
        clinicalSymptoms: ['Rỉ máu khi va chạm', 'Sẩn gồ ánh ngọc'],
        clinicalNotes: 'Sẩn màu hồng nhạt ánh ngọc bờ cuộn nhẹ, trung tâm có vảy tiết mỏng. Nghi ngờ Ung thư biểu mô tế bào đáy thể nốt (Nodular BCC).',
        diagnosis: 'Ung thư biểu mô tế bào đáy (Basal Cell Carcinoma - BCC)',
        treatmentApplied: 'Chỉ định phẫu thuật cắt trọn tổn thương hoặc cắt lạnh Mohs.',
        treatmentPlan: {
          treatmentContent: 'Kế hoạch phẫu thuật cắt trọn sang thương bờ an toàn 4mm hoặc can thiệp Mohs; xét nghiệm mô bệnh học vi thể kiểm tra diện cắt.',
          interventionProcedure: 'Sát trùng vô khuẩn tại chỗ, đo vẽ viền phẫu thuật an toàn; Chụp lưu trữ đại thể và Dermoscopy phóng đại vi thể tiền phẫu.',
          skincareRegimen: 'Vệ sinh nhẹ nhàng bằng gạc tẩm nước muối sinh lý NaCl 0.9%, tránh cọ xát cơ học hay gãi làm rỉ máu.',
          prescriptions: [
            {
              id: 'rx-mock-bcc-1',
              medicationName: 'Nước muối sinh lý Natri Clorid 0.9%',
              formAndRoute: 'Dung dịch rửa ngoài da',
              dosage: 'Rửa nhẹ nhàng 2 lần/ngày (sáng và tối)',
              quantity: '2 chai 500ml',
              instructions: 'Dùng gạc vô trùng chấm nhẹ, không chà xát mạnh.'
            },
            {
              id: 'rx-mock-bcc-2',
              medicationName: 'Fucidin 2% (Acid Fusidic)',
              formAndRoute: 'Kem bôi ngoài da',
              dosage: 'Thoa một lớp mỏng 1 lần/ngày vào buổi tối nếu có rỉ dịch',
              quantity: '1 tuýp 15g',
              instructions: 'Chống nhiễm trùng thứ phát trước ngày phẫu thuật.'
            }
          ]
        },
        doctorInstructions: 'Tránh cọ xát, vệ sinh nhẹ nhàng bằng nước muối sinh lý.',
        images: [
          {
            id: 'img-002-macro',
            type: 'macroscopic',
            dataUrl: SVG_MACRO_BCC,
            label: 'Sẩn ngọc má trái đại thể',
            takenAt: '2026-07-02T09:30:00Z',
            magnification: 'Macro 1:1',
          },
          {
            id: 'img-002-dermo',
            type: 'dermoscopy',
            dataUrl: SVG_DERMOSCOPY_BCC,
            label: 'Soi da Dermoscopy mạch máu cành cây',
            takenAt: '2026-07-02T09:35:00Z',
            magnification: '10x Polarized Contact',
          },
        ],
        aiAnalysis: {
          summary: 'Hình ảnh dermoscopy kinh điển của Ung thư biểu mô tế bào đáy (BCC) với sự hiện diện rõ nét của mạch máu hình cành cây (Arborizing telangiectasia), các ổ sắc tố dạng xám xanh hình trứng và loét trung tâm.',
          macroscopicFindings: 'Sẩn ánh ngọc (pearly translucent nodule) với bờ cuộn nhẵn, trung tâm có vết loét nhỏ đóng vảy tiết nâu.',
          dermoscopyFindings: {
            pigmentNetwork: 'Không có mạng sắc tố điển hình của tế bào hắc tố (Non-melanocytic lesion).',
            vascularPattern: 'Mạch máu phân nhánh hình cành cây rõ nét (Arborizing telangiectatic vessels) với các nhánh sắc mảnh.',
            dotsAndGlobules: 'Các ổ và hạt hình trứng màu xám xanh (Blue-gray ovoid nests/globules).',
            blueWhiteVeil: 'Nền màu hồng bóng mờ nhạt, cấu trúc loét trợt trung tâm.',
            structures: ['Arborizing telangiectasia', 'Blue-gray ovoid nests', 'Ulceration', 'Shiny white areas'],
          },
          abcdScore: {
            asymmetry: 1,
            border: 3,
            color: 3,
            differentialStructures: 3,
            tds: 4.6,
            interpretation: 'Thang điểm ABCD chủ yếu cho tổn thương melanocytic; tuy nhiên theo thuật toán 2 bước (two-step algorithm), tổn thương không thuộc melanocytic và đáp ứng đầy đủ tiêu chuẩn BCC.',
          },
          riskLevel: 'HIGH',
          differentialDiagnoses: [
            { disease: 'Ung thư biểu mô tế bào đáy thể nốt (Nodular Basal Cell Carcinoma)', probability: 88, rationale: 'Hình ảnh mạch máu hình cành cây và ổ sắc tố xám xanh đặc hiệu cao cho BCC.' },
            { disease: 'Tăng sản tuyến bã (Sebaceous Hyperplasia)', probability: 7, rationale: 'Có thể có mạch máu hình hoa cúc bao quanh rốn trung tâm, nhưng không có ổ xám xanh.' },
            { disease: 'U hạt sinh mủ (Pyogenic Granuloma)', probability: 5, rationale: 'Tổn thương dễ chảy máu nhưng màu đỏ tươi và cấu trúc mạch khác biệt.' },
          ],
          suggestedPrimaryDiagnosis: 'Ung thư biểu mô tế bào đáy (BCC) vùng mặt',
          recommendations: [
            'Phẫu thuật cắt rộng trọn tổn thương hoặc phẫu thuật Mohs vi thể để kiểm soát triệt để bờ diện cắt.',
            'Sinh thiết mô bệnh học xác chẩn thể giải phẫu bệnh (thể nốt, xơ hóa, hay thâm nhiễm).',
            'Tư vấn kế hoạch tạo hình vạt da sau cắt bỏ tổn thương.',
          ],
          urgentAttention: true,
          followUpInterval: 'Phẫu thuật theo lịch hẹn',
          analyzedAt: '2026-07-02T09:45:00Z',
        },
        createdAt: '2026-07-02T09:15:00Z',
      },
    ],
  },
];

export const INITIAL_APPOINTMENTS: Appointment[] = [
  {
    id: 'apt-001',
    patientId: 'pt-001',
    patientName: 'Nguyễn Thị Mai Lan',
    patientCode: 'BN-2026-0042',
    patientPhone: '0912345678',
    doctorName: 'BS. CKII Lê Hoàng Minh',
    appointmentDate: '2026-09-15',
    appointmentTime: '09:00',
    purpose: 'Tái khám Dermoscopy',
    status: 'CONFIRMED',
    reminderSent: true,
    reminderChannel: 'SMS',
    lastReminderAt: '2026-09-02T10:00:00Z',
    reminderContent: '[Phòng khám Da liễu Dermacare] Chào chị Mai Lan, bạn có lịch hẹn tái khám Dermoscopy lúc 09:00 ngày 15/09/2026 cùng BS. Lê Hoàng Minh.',
    notes: 'Kiểm tra lại nốt ruồi vùng lưng và đánh giá nguy cơ tiến triển.',
  },
  {
    id: 'apt-002',
    patientId: 'pt-002',
    patientName: 'Trần Văn Bình',
    patientCode: 'BN-2026-0089',
    patientPhone: '0987654321',
    doctorName: 'ThS. BS Trần Đình Hưng',
    appointmentDate: '2026-09-08',
    appointmentTime: '14:30',
    purpose: 'Sinh thiết / Tiểu phẫu',
    status: 'SCHEDULED',
    reminderSent: false,
    reminderChannel: 'Zalo',
    notes: 'Tiểu phẫu cắt tổn thương BCC má trái.',
  },
  {
    id: 'apt-003',
    patientId: 'pt-003',
    patientName: 'Lê Hoàng Khánh Vy',
    patientCode: 'BN-2026-0115',
    patientPhone: '0903112233',
    doctorName: 'BS. CKII Lê Hoàng Minh',
    appointmentDate: '2026-09-10',
    appointmentTime: '10:15',
    purpose: 'Theo dõi tiến triển điều trị',
    status: 'SCHEDULED',
    reminderSent: false,
    reminderChannel: 'SMS',
    notes: 'Đánh giá đáp ứng thuốc bôi viêm da cơ địa.',
  },
  {
    id: 'apt-004',
    patientId: 'pt-001',
    patientName: 'Nguyễn Thị Mai Lan',
    patientCode: 'BN-2026-0042',
    patientPhone: '0912345678',
    doctorName: 'BS. CKII Lê Hoàng Minh',
    appointmentDate: '2026-08-25',
    appointmentTime: '14:00',
    purpose: 'Tái khám Dermoscopy',
    status: 'COMPLETED',
    reminderSent: true,
    reminderChannel: 'SMS',
    lastReminderAt: '2026-08-24T09:00:00Z',
    notes: 'Đã hoàn tất khám và lưu ảnh đối chiếu tiến triển.',
  },
];

export const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-001',
    timestamp: '2026-09-03T01:10:00Z',
    doctorName: 'BS. CKII Lê Hoàng Minh',
    action: 'AUTHENTICATE',
    details: 'Đăng nhập thành công phiên làm việc bảo mật HIPAA/Medical Data Grade',
    ipAddress: '192.168.1.102',
    severity: 'INFO',
  },
  {
    id: 'log-002',
    timestamp: '2026-09-03T01:12:15Z',
    doctorName: 'BS. CKII Lê Hoàng Minh',
    action: 'VIEW_PATIENT',
    targetId: 'pt-001',
    targetName: 'Nguyễn Thị Mai Lan',
    details: 'Truy cập hồ sơ bệnh án và lịch sử hình ảnh tổn thương',
    ipAddress: '192.168.1.102',
    severity: 'INFO',
  },
  {
    id: 'log-003',
    timestamp: '2026-09-03T01:15:30Z',
    doctorName: 'BS. CKII Lê Hoàng Minh',
    action: 'VIEW_DERMOSCOPY',
    targetId: 'les-001',
    targetName: 'Tổn thương sắc tố TL-01',
    details: 'Mở xem hình ảnh dermoscopy độ phóng đại 10x phân cực có đo kích thước',
    ipAddress: '192.168.1.102',
    severity: 'WARNING',
  },
  {
    id: 'log-004',
    timestamp: '2026-09-03T01:18:40Z',
    doctorName: 'BS. CKII Lê Hoàng Minh',
    action: 'RUN_AI_ANALYSIS',
    targetId: 'les-001',
    targetName: 'Tổn thương TL-01',
    details: 'Chạy phân tích AI Gemini chẩn đoán tổn thương sắc tố & tính điểm ABCD',
    ipAddress: '192.168.1.102',
    severity: 'INFO',
  },
];

export const INITIAL_PROCEDURES: ClinicalProcedure[] = [
  {
    id: 'proc-001',
    patientId: 'pt-001',
    patientName: 'Nguyễn Thị Mai Lan',
    patientCode: 'BN-2026-0042',
    procedureType: 'LASER',
    procedureName: 'Laser CO2 Fractional tái tạo vi điểm & trị sẹo rỗ',
    treatmentDate: '2026-08-15',
    doctorName: 'BS. CKII Lê Hoàng Minh',
    technicianName: 'KTV. Trần Thảo Vy',
    targetArea: 'Vùng má hai bên và trán',
    productUsed: 'Hệ thống Laser Lutronic eCO2 Fractional',
    dosageOrVolume: '2 passes, 850 shots',
    technicalParams: {
      laserType: 'Laser CO2 Fractional vi điểm',
      wavelength: '10,600 nm',
      energy: '45 mJ / microbeam',
      passesOrDensity: 'Mật độ 15%, 2 passes chồng',
      pulseWidthOrFrequency: 'Static mode, 150 Hz',
    },
    sessionNumber: 1,
    totalSessions: 4,
    anesthesiaMethod: 'Ủ tê kem Lidocaine 10.56% trong 45 phút + Thổi lạnh Cryo Jet',
    immediateResponse: 'Đỏ da đồng đều (Erythema Grade 2), phù nhẹ quanh vi lỗ nhiệt, không bỏng rát sâu, không rỉ dịch huyết thanh.',
    postCareInstructions: 'Chườm gạc lạnh trong 24h đầu, xịt khoáng vô khuẩn mỗi 2 giờ, thoa serum B5/EGF phục hồi, kiêng nước lã 24h, chống nắng vật lý SPF 50+ sau ngày thứ 3.',
    complications: 'Không có biến chứng ghi nhận (No adverse event).',
    cost: 3500000,
    notes: 'Bệnh nhân dung nạp tốt, đáp ứng mô sau bắn đều đẹp.',
    createdAt: '2026-08-15T10:30:00Z',
  },
  {
    id: 'proc-002',
    patientId: 'pt-001',
    patientName: 'Nguyễn Thị Mai Lan',
    patientCode: 'BN-2026-0042',
    procedureType: 'BOTOX',
    procedureName: 'Tiêm Botulinum Toxin xóa nhăn động vùng trán & đuôi mắt',
    treatmentDate: '2026-08-20',
    doctorName: 'BS. CKII Lê Hoàng Minh',
    targetArea: 'Vùng trán (Frontalis), gian mày (Glabella) và vết chân chim (Crow feet)',
    productUsed: 'Botox Allergan 100 Units (Mỹ)',
    inventoryItemId: 'inv-005',
    dosageOrVolume: '32 Units',
    technicalParams: {
      botoxUnits: 32,
      injectionPoints: 14,
      dilutionRatio: 'Pha 2.5 ml NaCl 0.9% vô khuẩn / lọ 100U (4U / 0.1ml)',
    },
    sessionNumber: 1,
    totalSessions: 1,
    anesthesiaMethod: 'Chườm đá lạnh tại chỗ (Ice pack anesthesia)',
    immediateResponse: 'Nốt sẩn tiêm tan nhanh sau 15 phút, không tụ máu (hematoma), không bầm tím (ecchymosis).',
    postCareInstructions: 'Giữ tư thế đứng thẳng trong 4 giờ đầu, không cúi gập người, không massage day ấn vùng trán trong 48 giờ, không xông hơi hoặc tập gym nặng trong 3 ngày.',
    complications: 'Không có sụp mi (No ptosis), biểu cảm tự nhiên.',
    cost: 4800000,
    notes: 'Kỹ thuật tiêm nông vi điểm hạ bì vùng đuôi mắt, tiêm sâu bám xương cơ cau mày.',
    createdAt: '2026-08-20T15:00:00Z',
  },
  {
    id: 'proc-003',
    patientId: 'pt-002',
    patientName: 'Trần Văn Hùng',
    patientCode: 'BN-2026-0089',
    procedureType: 'FILLER',
    procedureName: 'Tiêm Chất làm đầy Hyaluronic Acid xóa rãnh mũi má (Rãnh cười)',
    treatmentDate: '2026-08-18',
    doctorName: 'BS. CKII Lê Hoàng Minh',
    targetArea: 'Rãnh mũi má 2 bên (Nasolabial folds)',
    productUsed: 'Juvederm Ultra Plus XC (Allergan)',
    inventoryItemId: 'inv-007',
    dosageOrVolume: '1.0 ml (0.5 ml mỗi bên)',
    technicalParams: {
      fillerVolumeMl: 1.0,
      deliveryTool: 'Kim Canula đầu tù 25G 50mm + Kim mồi 23G',
      injectionPlane: 'Kỹ thuật rẽ quạt luồn sâu hạ bì & mỡ sâu (Deep subcutaneous fan technique)',
    },
    sessionNumber: 1,
    totalSessions: 1,
    anesthesiaMethod: 'Sản phẩm có sẵn Lidocaine 0.3% + Ủ tê điểm vào Canula',
    immediateResponse: 'Nâng đỡ mô rãnh cười tức thì, rãnh nông hẳn, không tắc mạch, hồi lưu mao mạch < 2 giây (Capillary refill normal).',
    postCareInstructions: 'Không sờ nắn nắn bóp vùng rãnh cười, không nằm sấp, chườm mát nhẹ nhàng, kiêng rượu bia và chất kích thích 3 ngày.',
    complications: 'Không sưng viêm bất thường, kiểm tra mạch máu an toàn tuyệt đối.',
    cost: 8500000,
    notes: 'Thực hiện test hút ngược (Aspiration test) âm tính trước khi tiêm bolus.',
    createdAt: '2026-08-18T11:15:00Z',
  },
  {
    id: 'proc-004',
    patientId: 'pt-003',
    patientName: 'Lê Thị Thu Trang',
    patientCode: 'BN-2026-0105',
    procedureType: 'MESOTHERAPY',
    procedureName: 'Mesotherapy BAP 5 điểm sinh học căng bóng phục hồi & sáng da',
    treatmentDate: '2026-08-28',
    doctorName: 'BS. CKII Lê Hoàng Minh',
    technicianName: 'KTV. Đỗ Kim Oanh',
    targetArea: 'Toàn bộ 2 bên má và đường viền hàm',
    productUsed: 'Placentex PDRN DNA cá hồi + Hyaron HA phân tử nhỏ',
    inventoryItemId: 'inv-009',
    dosageOrVolume: '2.5 ml',
    technicalParams: {
      mesoTechnique: 'Kỹ thuật Bio Aesthetic Points (BAP) 5 điểm sinh học mỗi bên má',
      needleDepthMm: 'Kim siêu vi 32G 4mm, góc tiêm 45 độ trung bì sâu',
      cocktailActives: 'PDRN 2% + Non-crosslinked Hyaluronic Acid 25mg/2.5ml',
    },
    sessionNumber: 2,
    totalSessions: 3,
    anesthesiaMethod: 'Ủ tê kem Lidocaine 30 phút',
    immediateResponse: 'Nốt sẩn BAP hấp thu hoàn toàn sau 12 giờ, không xuất huyết dưới da.',
    postCareInstructions: 'Đắp mặt nạ sinh học dịu da, thoa kem phục hồi cấp ẩm ceramide, chống nắng phổ rộng kỹ càng.',
    complications: 'An toàn, da sáng bóng rõ rệt sau 48 giờ.',
    cost: 3200000,
    notes: 'Liệu trình trẻ hóa tái tạo cấu trúc da.',
    createdAt: '2026-08-28T09:45:00Z',
  },
  {
    id: 'proc-005',
    patientId: 'pt-003',
    patientName: 'Lê Thị Thu Trang',
    patientCode: 'BN-2026-0105',
    procedureType: 'MICRONEEDLING',
    procedureName: 'Lăn kim / Phi kim Dermapen kết hợp Tế bào gốc EGF tái tạo da',
    treatmentDate: '2026-07-25',
    doctorName: 'BS. CKII Lê Hoàng Minh',
    technicianName: 'KTV. Trần Thảo Vy',
    targetArea: 'Vùng trán, 2 bên gò má và mũi',
    productUsed: 'Đầu kim 16 kim vi điểm y khoa + Serum Tế bào gốc phục hồi da Bio-EGF',
    inventoryItemId: 'inv-013',
    dosageOrVolume: '1 đầu kim vô khuẩn + 5ml serum EGF',
    technicalParams: {
      needleDepthMm: 'Trán 0.8mm, Gò má sẹo 1.5mm, Mũi 0.5mm',
      passesOrDensity: '3 passes hình xoắn ốc và lưới đan chéo',
      cocktailActives: 'EGF, Oligopeptide, Hyaluronic Acid, Vitamin B5',
    },
    sessionNumber: 1,
    totalSessions: 3,
    anesthesiaMethod: 'Ủ tê kem 40 phút',
    immediateResponse: 'Xuất hiện điểm rớm máu sương (Frosting & Pinpoint bleeding) đạt điểm đích lâm sàng.',
    postCareInstructions: 'Rửa mặt bằng nước muối sinh lý trong 48 giờ, thoa serum tế bào gốc 3 lần/ngày, tránh ánh nắng trực tiếp tuyệt đối.',
    complications: 'Lớp mài vi điểm bong mịn sau 4 ngày, lỗ chân lông se khít.',
    cost: 2200000,
    notes: 'Bệnh nhân hồi phục đúng lộ trình điều trị.',
    createdAt: '2026-07-25T14:30:00Z',
  },
];

export const INITIAL_INVENTORY: InventoryItem[] = [
  {
    id: 'inv-001',
    code: 'MED-KLENZIT-C',
    name: 'Klenzit-C Gel 15g',
    activeIngredient: 'Adapalene 0.1% + Clindamycin 1%',
    category: 'TOPICAL_MEDICATION',
    unit: 'Tuýp',
    stockQuantity: 42,
    minThreshold: 10,
    batchNumber: 'KLN-2604',
    expiryDate: '2028-05-30',
    unitPrice: 145000,
    manufacturer: 'Glenmark Pharmaceuticals (Ấn Độ)',
    storageConditions: 'Nhiệt độ dưới 30°C, tránh ánh sáng',
    notes: 'Chỉ định điều trị mụn trứng cá viêm sưng mức độ nhẹ đến trung bình.',
    updatedAt: '2026-08-30T08:00:00Z',
  },
  {
    id: 'inv-002',
    code: 'MED-DOXY-100',
    name: 'Doxycycline 100mg Stella',
    activeIngredient: 'Doxycycline Hyclate 100mg',
    category: 'ORAL_MEDICATION',
    unit: 'Hộp 100 viên',
    stockQuantity: 28,
    minThreshold: 8,
    batchNumber: 'DXC-8821',
    expiryDate: '2027-11-15',
    unitPrice: 180000,
    manufacturer: 'Stella Pharm (Việt Nam)',
    storageConditions: 'Bảo quản nơi khô ráo, tránh ánh sáng',
    notes: 'Kháng sinh nhóm Tetracycline điều trị mụn trứng cá viêm vừa và nặng, viêm nang lông.',
    updatedAt: '2026-08-30T08:00:00Z',
  },
  {
    id: 'inv-003',
    code: 'MED-FUCIDIN',
    name: 'Fucidin Cream 2% 15g',
    activeIngredient: 'Acid Fusidic 2%',
    category: 'TOPICAL_MEDICATION',
    unit: 'Tuýp',
    stockQuantity: 35,
    minThreshold: 10,
    batchNumber: 'FCD-4410',
    expiryDate: '2027-09-20',
    unitPrice: 115000,
    manufacturer: 'Leo Pharma (Đan Mạch)',
    storageConditions: 'Nhiệt độ phòng < 30°C',
    notes: 'Kháng khuẩn tại chỗ chống tụ cầu vàng điều trị viêm nang lông, chốc lở.',
    updatedAt: '2026-08-30T08:00:00Z',
  },
  {
    id: 'inv-004',
    code: 'MED-SOOLANTRA',
    name: 'Soolantra Cream 1% 30g',
    activeIngredient: 'Ivermectin 1%',
    category: 'TOPICAL_MEDICATION',
    unit: 'Tuýp',
    stockQuantity: 12,
    minThreshold: 5,
    batchNumber: 'SLT-1903',
    expiryDate: '2027-04-10',
    unitPrice: 620000,
    manufacturer: 'Galderma (Pháp)',
    storageConditions: 'Nhiệt độ phòng < 25°C',
    notes: 'Thuốc thoa đặc hiệu điều trị chứng đỏ mặt Rosacea và diệt Demodex nang lông.',
    updatedAt: '2026-08-30T08:00:00Z',
  },
  {
    id: 'inv-005',
    code: 'BTX-ALLERGAN-100',
    name: 'Botox Allergan 100 Units',
    activeIngredient: 'OnabotulinumtoxinA (Type A) 100U',
    category: 'BOTOX_TOXIN',
    unit: 'Lọ 100U',
    stockQuantity: 8,
    minThreshold: 3,
    batchNumber: 'C6689C3',
    expiryDate: '2028-01-20',
    unitPrice: 5500000,
    manufacturer: 'Allergan (Mỹ / Ireland)',
    storageConditions: 'Tủ lạnh chuyên dụng 2°C - 8°C (Cold chain)',
    notes: 'Xóa nhăn trán, đuôi mắt, thon gọn góc hàm phì đại cơ cắn, trị tăng tiết mồ hôi.',
    updatedAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'inv-006',
    code: 'BTX-DYSPORT-300',
    name: 'Dysport 300 Units',
    activeIngredient: 'AbobotulinumtoxinA 300U',
    category: 'BOTOX_TOXIN',
    unit: 'Lọ 300U',
    stockQuantity: 4,
    minThreshold: 2,
    batchNumber: 'DSP-2290',
    expiryDate: '2027-08-15',
    unitPrice: 6800000,
    manufacturer: 'Ipsen Biopharm (Anh)',
    storageConditions: 'Tủ lạnh chuyên dụng 2°C - 8°C',
    notes: 'Độ khuếch tán tốt, hiệu quả cao cho thon gọn hàm và bắp chân.',
    updatedAt: '2026-09-01T10:00:00Z',
  },
  {
    id: 'inv-007',
    code: 'FIL-JUVEDERM-ULTRA',
    name: 'Juvederm Ultra Plus XC 1.0ml',
    activeIngredient: 'Hyaluronic Acid 24mg/ml + Lidocaine 0.3%',
    category: 'FILLER_HA',
    unit: 'Hộp 2 ống x 1.0ml',
    stockQuantity: 6,
    minThreshold: 3,
    batchNumber: 'JVD-9014',
    expiryDate: '2027-10-30',
    unitPrice: 7200000,
    manufacturer: 'Allergan (Pháp / Mỹ)',
    storageConditions: 'Nhiệt độ phòng mát 2°C - 25°C',
    notes: 'Chất làm đầy liên kết chéo Hylacross làm đầy rãnh mũi má, khóe môi, má hóp.',
    updatedAt: '2026-09-02T14:20:00Z',
  },
  {
    id: 'inv-008',
    code: 'FIL-RESTYLANE-DEF',
    name: 'Restylane Defyne 1.0ml',
    activeIngredient: 'Hyaluronic Acid 20mg/ml (Công nghệ OBT)',
    category: 'FILLER_HA',
    unit: 'Ống 1.0ml',
    stockQuantity: 3,
    minThreshold: 2,
    batchNumber: 'RST-5501',
    expiryDate: '2027-06-18',
    unitPrice: 6500000,
    manufacturer: 'Galderma (Thụy Điển)',
    storageConditions: 'Nhiệt độ mát < 25°C',
    notes: 'Tạo hình tự nhiên vùng cằm và rãnh cười theo biểu cảm linh hoạt của khuôn mặt.',
    updatedAt: '2026-09-02T14:20:00Z',
  },
  {
    id: 'inv-009',
    code: 'MESO-PLACENTEX-PDRN',
    name: 'Placentex PDRN 3ml',
    activeIngredient: 'Polydeoxyribonucleotide (DNA cá hồi) 5.625mg/3ml',
    category: 'MESO_SOLUTION',
    unit: 'Hộp 5 ống x 3ml',
    stockQuantity: 15,
    minThreshold: 4,
    batchNumber: 'PLX-7712',
    expiryDate: '2028-02-14',
    unitPrice: 2800000,
    manufacturer: 'Mastelli (Ý)',
    storageConditions: 'Nhiệt độ phòng < 25°C, tránh ánh sáng',
    notes: 'Tái tạo tế bào tầng sâu, kích thích tăng sinh collagen và mạch máu mới.',
    updatedAt: '2026-08-25T11:00:00Z',
  },
  {
    id: 'inv-010',
    code: 'MESO-HYARON-HA',
    name: 'Hyaron Pre-filled Syringe 2.5ml',
    activeIngredient: 'Sodium Hyaluronate 25mg/2.5ml',
    category: 'MESO_SOLUTION',
    unit: 'Hộp 10 ống x 2.5ml',
    stockQuantity: 18,
    minThreshold: 5,
    batchNumber: 'HYR-3304',
    expiryDate: '2027-12-30',
    unitPrice: 2200000,
    manufacturer: 'DongKook Pharm (Hàn Quốc)',
    storageConditions: 'Tủ lạnh 2°C - 8°C hoặc mát < 25°C',
    notes: 'Tiêm vi điểm căng bóng, cấp ẩm tầng sâu hydro-lifting cho làn da khô mất nước.',
    updatedAt: '2026-08-25T11:00:00Z',
  },
  {
    id: 'inv-011',
    code: 'MESO-EXOSOME-ASCE',
    name: 'ASCE+ SRLV Exosome Trẻ Hóa',
    activeIngredient: '5 tỷ Exosome đông khô tế bào gốc hoa hồng + 59 yếu tố tăng trưởng',
    category: 'MESO_SOLUTION',
    unit: 'Cặp 2 lọ (Bột đông khô + Dung môi)',
    stockQuantity: 5,
    minThreshold: 2,
    batchNumber: 'EXO-0199',
    expiryDate: '2027-05-15',
    unitPrice: 4200000,
    manufacturer: 'ExoCoBio (Hàn Quốc)',
    storageConditions: 'Tủ lạnh 2°C - 8°C bắt buộc',
    notes: 'Phục hồi da tổn thương sau laser, làm dịu da nhạy cảm, chống lão hóa thượng đỉnh.',
    updatedAt: '2026-08-28T09:00:00Z',
  },
  {
    id: 'inv-012',
    code: 'VTY-CANULA-25G',
    name: 'Kim Canula Đầu Tù TSK 25G 50mm',
    activeIngredient: 'Kim luồn y tế đầu tù thép không gỉ tiêm filler',
    category: 'PROCEDURE_CONSUMABLE',
    unit: 'Hộp 24 cây vô khuẩn',
    stockQuantity: 32,
    minThreshold: 10,
    batchNumber: 'TSK-2550',
    expiryDate: '2029-01-01',
    unitPrice: 650000,
    manufacturer: 'TSK Laboratory (Nhật Bản)',
    storageConditions: 'Nhiệt độ phòng, bảo đảm bao bì kín vô khuẩn',
    notes: 'Giảm tối đa nguy cơ đâm thủng mạch máu và bầm máu khi tiêm chất làm đầy.',
    updatedAt: '2026-08-20T16:00:00Z',
  },
  {
    id: 'inv-013',
    code: 'VTY-NEEDLE-DERMAPEN',
    name: 'Đầu Kim Lăn Vi Điểm Dermapen 16 Kim',
    activeIngredient: 'Đầu kim phẫu thuật titan vô khuẩn dùng 1 lần',
    category: 'PROCEDURE_CONSUMABLE',
    unit: 'Hộp 50 cái',
    stockQuantity: 45,
    minThreshold: 15,
    batchNumber: 'DMP-16K',
    expiryDate: '2029-06-30',
    unitPrice: 850000,
    manufacturer: 'DermapenWorld (Úc)',
    storageConditions: 'Nơi khô ráo vô khuẩn',
    notes: 'Lắp vào máy phi kim Dermapen 4 điều trị sẹo rỗ, lỗ chân lông.',
    updatedAt: '2026-08-20T16:00:00Z',
  },
  {
    id: 'inv-014',
    code: 'PEEL-TCA-20',
    name: 'Dung Dịch Peel TCA 20% Lọ 30ml',
    activeIngredient: 'Trichloroacetic Acid 20%',
    category: 'CHEMICAL_PEEL',
    unit: 'Lọ 30ml',
    stockQuantity: 7,
    minThreshold: 2,
    batchNumber: 'TCA-2009',
    expiryDate: '2027-03-25',
    unitPrice: 950000,
    manufacturer: 'Skin Tech Pharma (Tây Ban Nha)',
    storageConditions: 'Kín khí, tránh ánh sáng, phòng mát',
    notes: 'Peel tầng trung điều trị sẹo lõm đáy nhọn (TCA CROSS), nám mảng và dày sừng.',
    updatedAt: '2026-08-15T10:00:00Z',
  },
  {
    id: 'inv-015',
    code: 'MED-DERMOVATE',
    name: 'Dermovate Cream 15g',
    activeIngredient: 'Clobetasol Propionate 0.05%',
    category: 'TOPICAL_MEDICATION',
    unit: 'Tuýp',
    stockQuantity: 22,
    minThreshold: 5,
    batchNumber: 'DMV-8114',
    expiryDate: '2027-10-12',
    unitPrice: 98000,
    manufacturer: 'GSK (Anh)',
    storageConditions: 'Nhiệt độ phòng < 30°C',
    notes: 'Corticoid thoa hoạt phổ rất mạnh cho đợt cấp sẩn ngứa, chàm dày sừng lichen hóa.',
    updatedAt: '2026-08-22T08:00:00Z',
  },
  {
    id: 'inv-016',
    code: 'MED-BILASTINE',
    name: 'Bilaxten 20mg (Bilastine)',
    activeIngredient: 'Bilastine 20mg',
    category: 'ORAL_MEDICATION',
    unit: 'Hộp 30 viên',
    stockQuantity: 26,
    minThreshold: 8,
    batchNumber: 'BLX-6612',
    expiryDate: '2028-04-18',
    unitPrice: 245000,
    manufacturer: 'Menarini (Ý)',
    storageConditions: 'Nhiệt độ phòng khô ráo',
    notes: 'Kháng histamin H1 thế hệ mới không gây buồn ngủ, cắt cơn ngứa da liễu.',
    updatedAt: '2026-08-22T08:00:00Z',
  },
];
