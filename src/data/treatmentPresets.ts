import { PrescriptionItem, TreatmentPlan } from '../types';

export interface TreatmentPreset {
  id: string;
  name: string;
  lesionCategory: string;
  diagnosis: string;
  treatmentContent: string;
  interventionProcedure: string;
  skincareRegimen: string;
  doctorInstructions: string;
  prescriptions: Omit<PrescriptionItem, 'id'>[];
}

export const TREATMENT_PRESETS: TreatmentPreset[] = [
  {
    id: 'preset-acne-moderate',
    name: 'Phác đồ Trứng cá viêm mức độ trung bình (Acne Vulgaris)',
    lesionCategory: 'Trứng cá (Acne vulgaris)',
    diagnosis: 'Trứng cá thông thường thể sẩn mủ viêm vừa',
    treatmentContent: 'Kiểm soát phản ứng viêm cấp, diệt vi khuẩn C. acnes tại nang lông, giảm tăng sừng hóa cổ nang lông và ngăn ngừa hình thành sẹo lõm / thâm sau viêm.',
    interventionProcedure: 'Lấy nhân mụn chuẩn y khoa vô khuẩn; Chiếu ánh sáng sinh học Blue light (415nm) diệt khuẩn & Red light (630nm) giảm viêm (2 lần/tuần).',
    skincareRegimen: 'Làm sạch da bằng sữa rửa mặt dịu nhẹ độ pH 5.5 (không chứa xà phòng mạnh). Bôi dưỡng ẩm mỏng nhẹ dạng gel không gây bít tắc (non-comedogenic). Dùng kem chống nắng quang phổ rộng SPF 50+ Oil-free.',
    doctorInstructions: 'Tránh sờ tay lên mặt, tuyệt đối không tự ý nặn mụn. Kiêng thức ăn ngọt, nhiều dầu mỡ và hạn chế sữa bò động vật. Tái khám sau 2 - 4 tuần.',
    prescriptions: [
      {
        medicationName: 'Klenzit-C (Adapalene 0.1% + Clindamycin 1%)',
        formAndRoute: 'Gel bôi ngoài da',
        dosage: 'Thoa 1 lần vào buổi tối trước khi đi ngủ',
        quantity: '1 tuýp 15g',
        instructions: 'Thoa một lớp mỏng lên vùng da mụn sau khi dưỡng ẩm 15 phút. Tránh thoa sát khóe mắt và khóe môi.'
      },
      {
        medicationName: 'Doxycycline 100mg',
        formAndRoute: 'Viên nang uống',
        dosage: 'Uống 1 viên x 2 lần/ngày (sau bữa ăn no với nhiều nước)',
        quantity: '30 viên (dùng 15 ngày)',
        instructions: 'Uống với cốc nước đầy (>200ml), không nằm ngay trong vòng 30 phút sau khi uống thuốc để tránh kích ứng thực quản.'
      },
      {
        medicationName: 'Laroche-Posay Effaclar Duo+M / Kem phục hồi B5',
        formAndRoute: 'Kem dưỡng ẩm bôi',
        dosage: 'Thoa 2 lần/ngày (sáng và chiều)',
        quantity: '1 tuýp 40ml',
        instructions: 'Cấp ẩm phục hồi hàng rào bảo vệ da, ngăn ngừa khô rát do thuốc bôi trị mụn.'
      }
    ]
  },
  {
    id: 'preset-folliculitis',
    name: 'Phác đồ Viêm nang lông cấp / bán cấp (Folliculitis)',
    lesionCategory: 'Viêm nang lông (Folliculitis)',
    diagnosis: 'Viêm nang lông do tụ cầu / vi khuẩn Gram âm',
    treatmentContent: 'Kháng sinh diệt khuẩn tại chỗ kết hợp sát khuẩn nang lông, giảm ứ đọng bã nhờn, chống cọ xát cơ học.',
    interventionProcedure: 'Vệ sinh sát khuẩn vùng da bệnh bằng dung dịch Povidone Iodine 10% pha loãng hoặc Chlorhexidine 4%. Không cạo râu/nhổ lông trong đợt viêm cấp.',
    skincareRegimen: 'Mặc quần áo cotton rộng rãi, thoáng mát, thấm hút mồ hôi. Tắm rửa sạch sau khi vận động ra nhiều mồ hôi. Sử dụng xà phòng sát khuẩn nhẹ.',
    doctorInstructions: 'Không mặc đồ bó sát, tránh ngâm bồn nước nóng công cộng. Tái khám sau 10 - 14 ngày nếu sẩn mủ chưa thoái lui.',
    prescriptions: [
      {
        medicationName: 'Fucidin 2% (Acid Fusidic)',
        formAndRoute: 'Kem bôi ngoài da',
        dosage: 'Thoa 2 - 3 lần/ngày lên các nốt sẩn nang lông',
        quantity: '1 tuýp 15g',
        instructions: 'Rửa sạch và lau khô vùng da trước khi chấm thuốc vào từng đầu mụn mủ.'
      },
      {
        medicationName: 'Betadine Skin Cleanser 4% (Povidone-iodine)',
        formAndRoute: 'Dung dịch tắm / rửa sát khuẩn',
        dosage: 'Dùng tắm/rửa vùng da viêm 1 lần/ngày',
        quantity: '1 chai 125ml',
        instructions: 'Làm ướt da, thoa dung dịch tạo bọt để trong 2 - 3 phút rồi xả sạch lại bằng nước.'
      },
      {
        medicationName: 'Cefuroxime Axetil 500mg (nếu sẩn mủ lan rộng)',
        formAndRoute: 'Viên nén uống',
        dosage: 'Uống 1 viên x 2 lần/ngày sau ăn',
        quantity: '14 viên (dùng 7 ngày)',
        instructions: 'Dùng đúng liều đủ 7 ngày liên tục, không tự ý ngưng thuốc khi thấy giảm triệu chứng.'
      }
    ]
  },
  {
    id: 'preset-rosacea',
    name: 'Phác đồ Trứng cá đỏ (Rosacea / Đỏ da giãn mạch & sẩn)',
    lesionCategory: 'Trứng cá đỏ (Rosacea)',
    diagnosis: 'Trứng cá đỏ thể sẩn mụn mủ (Papulopustular Rosacea)',
    treatmentContent: 'Giảm phản ứng viêm qua trung gian Demodex, ổn định trương lực mạch máu da mặt, phục hồi hàng rào màng lipid biểu bì.',
    interventionProcedure: 'Đắp gạc lạnh làm dịu đỏ da cấp (Cold compress); Laser xung màu Dye Laser (PDL) hoặc IPL xung ánh sáng giảm giãn mao mạch sau giai đoạn viêm cấp.',
    skincareRegimen: 'Tuyệt đối tránh các yếu tố kích hoạt giãn mạch: rượu bia, gia vị cay nóng, xông hơi, tắm nước quá nóng, stress. Bôi kem chống nắng vật lý (Zinc Oxide/Titanium Dioxide) hàng ngày.',
    doctorInstructions: 'Không sử dụng bất kỳ loại kem thoa chứa Corticoid nào. Tái khám định kỳ sau 4 - 6 tuần.',
    prescriptions: [
      {
        medicationName: 'Soolantra (Ivermectin 1%)',
        formAndRoute: 'Kem bôi ngoài da',
        dosage: 'Thoa 1 lần/ngày vào buổi tối trước khi ngủ',
        quantity: '1 tuýp 30g',
        instructions: 'Thoa một lượng bằng hạt đậu nhỏ lên từng vùng trán, cằm, mũi, và hai má. Massage nhẹ nhàng.'
      },
      {
        medicationName: 'Metronidazole gel 0.75%',
        formAndRoute: 'Gel bôi ngoài da',
        dosage: 'Thoa 1 lần vào buổi sáng',
        quantity: '1 tuýp 30g',
        instructions: 'Thoa một lớp màng mỏng lên vùng má và mũi bị đỏ sẩn.'
      },
      {
        medicationName: 'Doxycycline 50mg (Liều kháng viêm vi lượng)',
        formAndRoute: 'Viên nang uống',
        dosage: 'Uống 1 viên/ngày vào buổi sáng sau ăn',
        quantity: '30 viên (dùng 1 tháng)',
        instructions: 'Uống với nhiều nước, tác dụng kháng viêm điều hòa mạch máu mà không gây chọn lọc kháng kháng sinh.'
      }
    ]
  },
  {
    id: 'preset-prurigo',
    name: 'Phác đồ Sẩn ngứa / Viêm da cơ địa / Sẩn dị ứng (Prurigo)',
    lesionCategory: 'Sẩn ngứa khác (Prurigo / Sẩn dị ứng)',
    diagnosis: 'Sẩn ngứa bán cấp do côn trùng / viêm da dị ứng tiếp xúc',
    treatmentContent: 'Cắt đứt chu kỳ Ngứa - Cào gãi - Sẩn hóa da, kháng dị ứng toàn thân, làm dịu da và chống bội nhiễm.',
    interventionProcedure: 'Băng ép dịu da với dung dịch sinh lý mát; Cắt ngắn móng tay để tránh cào xước gây sẩn dày sừng hóa.',
    skincareRegimen: 'Thoa kem dưỡng ẩm làm mềm da chứa Ceramide nhiều lần trong ngày (ngay sau khi tắm 3 phút). Tránh xà phòng có độ kiềm cao và hương liệu.',
    doctorInstructions: 'Tránh cào gãi; khi ngứa có thể chườm mát hoặc vỗ nhẹ lên da thay vì gãi. Tái khám sau 1 - 2 tuần.',
    prescriptions: [
      {
        medicationName: 'Dermovate 0.05% (Clobetasol Propionate) / Eumovate 0.05%',
        formAndRoute: 'Kem bôi ngoài da',
        dosage: 'Thoa 1 - 2 lần/ngày (trong tối đa 7 - 10 ngày)',
        quantity: '1 tuýp 15g',
        instructions: 'Chấm đúng vào vị trí nốt sẩn ngứa, không bôi lan ra vùng da lành rộng. Giảm dần liều khi bớt ngứa.'
      },
      {
        medicationName: 'Bilastine 20mg (Bilaxten)',
        formAndRoute: 'Viên nén uống',
        dosage: 'Uống 1 viên/ngày lúc đói (trước ăn 1 giờ hoặc sau ăn 2 giờ)',
        quantity: '14 viên (dùng 14 ngày)',
        instructions: 'Kháng histamin H1 thế hệ 2 không gây buồn ngủ, giúp kiểm soát cảm giác ngứa ban ngày.'
      },
      {
        medicationName: 'Atoderm Intensive Baume / Dexeryl',
        formAndRoute: 'Kem dưỡng ẩm phục hồi da',
        dosage: 'Bôi 2 - 3 lần/ngày toàn thân hoặc vùng da khô ngứa',
        quantity: '1 chai 200ml / 1 tuýp 250g',
        instructions: 'Duy trì bôi đều đặn để tái tạo màng bảo vệ da.'
      }
    ]
  },
  {
    id: 'preset-dysplastic-nevus',
    name: 'Phác đồ Theo dõi Nốt ruồi sắc tố biến đổi / Dermoscopy định kỳ',
    lesionCategory: 'Nốt ruồi sắc tố biến đổi',
    diagnosis: 'Nốt ruồi sắc tố không điển hình (Dysplastic Nevus) - Nguy cơ thấp/vừa',
    treatmentContent: 'Theo dõi động học hình thái Dermoscopy kỹ thuật số (Digital Dermoscopy Follow-up). Hướng dẫn bệnh nhân tự kiểm tra tổn thương theo quy tắc ABCDE.',
    interventionProcedure: 'Chụp lưu trữ ảnh phóng đại Dermoscopy có thước đo 1mm; Sinh thiết trọn tổn thương (Excisional Biopsy) gửi giải phẫu bệnh nếu phát hiện thay đổi bất thường sau 3 tháng.',
    skincareRegimen: 'Bảo vệ da nghiêm ngặt trước tia UV: Thoa kem chống nắng phổ rộng SPF 50+, PA++++ trước khi ra ngoài 20 phút, thoa lại sau mỗi 2 - 3 giờ nếu đổ mồ hôi.',
    doctorInstructions: 'Tự quan sát nếu thấy nốt ruồi to nhanh bất thường, bờ nham nhở, loét, chảy máu hoặc sẫm màu đen xanh phải đến khám ngay. Tái khám Dermoscopy sau 3 tháng.',
    prescriptions: [
      {
        medicationName: 'Heliocare 360° Gel Oil-free SPF 50+ / La Roche-Posay Anthelios',
        formAndRoute: 'Kem chống nắng bôi ngoài da',
        dosage: 'Thoa mỗi buổi sáng và lặp lại buổi trưa',
        quantity: '1 tuýp 50ml',
        instructions: 'Thoa đủ lượng 2mg/cm² (khoảng 2 ngón tay cho toàn mặt và cổ). Tránh phơi nắng trong khung giờ 10h - 16h.'
      }
    ]
  }
];

export const POPULAR_MEDICATIONS = [
  { name: 'Klenzit-C (Adapalene 0.1% + Clindamycin 1%)', form: 'Gel bôi', defaultDosage: 'Thoa 1 lần vào buổi tối trước khi ngủ', defaultQty: '1 tuýp 15g' },
  { name: 'Klenzit MS (Adapalene 0.1%)', form: 'Gel bôi', defaultDosage: 'Thoa 1 lần vào buổi tối trước khi ngủ', defaultQty: '1 tuýp 15g' },
  { name: 'Doxycycline 100mg', form: 'Viên uống', defaultDosage: 'Uống 1 viên x 2 lần/ngày sau ăn', defaultQty: '30 viên' },
  { name: 'Fucidin 2% (Acid Fusidic)', form: 'Kem bôi', defaultDosage: 'Thoa 2 lần/ngày vào nốt tổn thương', defaultQty: '1 tuýp 15g' },
  { name: 'Fucicort (Acid Fusidic + Betamethasone)', form: 'Kem bôi', defaultDosage: 'Thoa 2 lần/ngày trong 7 ngày', defaultQty: '1 tuýp 15g' },
  { name: 'Soolantra (Ivermectin 1%)', form: 'Kem bôi', defaultDosage: 'Thoa 1 lần/ngày vào buổi tối', defaultQty: '1 tuýp 30g' },
  { name: 'Metronidazole gel 0.75%', form: 'Gel bôi', defaultDosage: 'Thoa 1 - 2 lần/ngày', defaultQty: '1 tuýp 30g' },
  { name: 'Bilastine 20mg (Bilaxten)', form: 'Viên uống', defaultDosage: 'Uống 1 viên/ngày lúc đói', defaultQty: '14 viên' },
  { name: 'Desloratadine 5mg', form: 'Viên uống', defaultDosage: 'Uống 1 viên/ngày sau ăn', defaultQty: '10 viên' },
  { name: 'Dermovate 0.05% (Clobetasol)', form: 'Kem bôi', defaultDosage: 'Chấm 1 lần/ngày trong 5 - 7 ngày', defaultQty: '1 tuýp 15g' },
  { name: 'Eumovate 0.05% (Clobetasone)', form: 'Kem bôi', defaultDosage: 'Thoa 1 - 2 lần/ngày trong 7 ngày', defaultQty: '1 tuýp 15g' },
  { name: 'Kem dưỡng phục hồi B5 La Roche-Posay / Avene Cicalfate', form: 'Kem bôi', defaultDosage: 'Thoa 2 lần/ngày sáng & tối', defaultQty: '1 tuýp 40ml' },
  { name: 'Kem chống nắng SPF 50+ Broad Spectrum', form: 'Kem bôi', defaultDosage: 'Thoa trước khi ra ngoài 20 phút', defaultQty: '1 tuýp 50ml' }
];
