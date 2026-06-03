import { Container } from "react-bootstrap";
import "./classRules.scss";

const obligationA = [
  "Cung cấp thông tin chính xác về học viên, phụ huynh, lịch học và địa chỉ sau khi gia sư hoàn tất nghĩa vụ nhận lớp.",
  "Trao đổi trước thông tin gia sư với phụ huynh hoặc học viên trước khi bàn giao lớp.",
  "Thực hiện hoàn phí theo chính sách nếu phát sinh trường hợp đủ điều kiện hoàn trả."
];

const obligationB = [
  "Thanh toán phí nhận lớp theo quy định hoặc đăng ký nợ phí theo chính sách áp dụng trên hệ thống.",
  "Ngay sau khi nhận thông tin lớp, phải chủ động liên hệ phụ huynh để hẹn buổi đầu và phản hồi lại kết quả cho hệ thống trong thời gian sớm nhất.",
  "Nếu quá thời gian mà phụ huynh không nghe máy, đổi yêu cầu hoặc phát sinh bất thường, phải báo phát sinh ngay trên tài khoản gia sư để được hỗ trợ.",
  "Khi đã chốt lịch với học viên thì phải đi dạy đúng hẹn, không tự ý dời lịch hoặc bỏ lớp nếu không có lý do khách quan và chưa thông báo.",
  "Đến gặp phụ huynh đúng giờ, ăn mặc gọn gàng, tác phong nghiêm túc, giao tiếp lịch sự và đúng mực.",
  "Không được tự ý chuyển lớp cho người khác, tăng học phí, thay đổi số buổi hoặc gộp buổi nếu chưa có xác nhận từ hệ thống.",
  "Mọi phát sinh trong quá trình nhận lớp đều phải được cập nhật đầy đủ trong mục Báo phát sinh."
];

const trialPolicy = [
  "Lớp dạy tại nhà: gia sư có thể cần dạy thử theo chính sách từng khu vực và nhóm đối tượng.",
  "Nếu gia đình đồng ý tiếp tục sau buổi thử, các buổi thử sẽ được tính thanh toán theo thỏa thuận của lớp.",
  "Lớp online: buổi học thử đầu tiên được miễn phí để học viên đánh giá mức độ phù hợp."
];

const benefits = [
  "Được cung cấp thông tin lớp đầy đủ sau khi hoàn tất bước nhận lớp.",
  "Được tạo lệnh rút tiền Bits trên hệ thống theo lịch xử lý hiện hành.",
  "Được bảo hành lớp trong thời gian quy định kể từ buổi dạy đầu tiên nếu tuân thủ đầy đủ quy trình."
];

const refundRules = [
  "Không hoàn phí nếu gia sư tự ý bỏ lớp, đổi lịch, tăng lương, đi dạy không đúng giờ, tác phong không nghiêm túc hoặc vi phạm các nghĩa vụ khi nhận lớp.",
  "Nếu lớp hỏng trước hoặc trong buổi dạy thử mà không do lỗi của gia sư, hệ thống sẽ xử lý hoàn phí theo mức quy định.",
  "Nếu lớp hỏng sau giai đoạn học thử nhưng gia sư không vi phạm, phí sẽ được quyết toán theo phần lương thực tế đã nhận.",
  "Sau thời hạn bảo hành lớp, hệ thống không tiếp tục hỗ trợ hoàn phí cho lớp đã nhận."
];

const debtTerms = [
  "Gia sư có thể được hỗ trợ nợ một phần phí nhận lớp trong thời hạn quy định.",
  "Nếu quá hạn chưa thanh toán, hệ thống có thể tự động trừ phí phạt theo chính sách vận hành.",
  "Trường hợp chậm thanh toán kéo dài sau khi đã được nhắc nhiều lần, tài khoản có thể bị xử lý theo quy định."
];

const relatedPolicies = [
  "Quy định chung",
  "Hợp đồng kết nối gia sư",
  "Chính sách bảo mật",
  "Chính sách phí",
  "Hướng dẫn xử lý khiếu nại",
  "Quy định sử dụng sàn giao dịch thương mại điện tử"
];

function RuleSection({ index, title, items, accent = "blue" }) {
  return (
    <section className={`class-rules-section class-rules-section-${accent}`}>
      <div className="class-rules-section-number">Điều {index}</div>
      <div className="class-rules-section-body">
        <h2>{title}</h2>
        <ul>
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function ClassRulesPage() {
  return (
    <div className="class-rules-page">
      <section className="class-rules-hero">
        <Container>
          <div className="class-rules-hero-card">
            <p className="class-rules-kicker">Dành cho gia sư</p>
            <h1>Nội quy nhận lớp</h1>
            <p className="class-rules-lead">
              Bộ quy định này giúp gia sư nắm rõ quyền lợi, nghĩa vụ và quy trình xử lý phát sinh khi nhận lớp trên hệ thống HTrang.
            </p>
          </div>
        </Container>
      </section>

      <Container className="class-rules-content">
        <section className="class-rules-intro">
          <div className="class-rules-intro-main">
            <h2>Quy ước chung</h2>
            <p>
              Bên A là hệ thống kết nối gia sư HTrang. Bên B là gia sư đăng ký nhận lớp trên nền tảng.
            </p>
            <p>
              Phí Bits là khoản phí vận hành dùng cho các tiện ích như hiển thị thông tin lớp, thông báo và hỗ trợ xử lý trên hệ thống. Khoản phí này không được hoàn lại trong các trường hợp đã sử dụng theo đúng quy trình.
            </p>
          </div>
          <div className="class-rules-highlight">
            <h3>Lưu ý quan trọng</h3>
            <p>
              Sau khi nhận lớp, gia sư cần liên hệ phụ huynh ngay, chốt lịch sớm và luôn cập nhật trạng thái thực tế trên tài khoản của mình.
            </p>
          </div>
        </section>

        <RuleSection index="1" title="Nghĩa vụ của Bên A" items={obligationA} />
        <RuleSection index="2" title="Nghĩa vụ của Bên B" items={obligationB} accent="gold" />
        <RuleSection index="3" title="Chính sách dạy thử" items={trialPolicy} />
        <RuleSection index="4" title="Quyền lợi của gia sư" items={benefits} accent="gold" />
        <RuleSection index="5" title="Hoàn trả phí nhận lớp" items={refundRules} />
        <RuleSection index="6" title="Điều khoản nợ phí" items={debtTerms} accent="gold" />

        <section className="class-rules-final">
          <h2>Điều 7. Điều khoản thi hành</h2>
          <ul>
            <li>Gia sư và hệ thống cùng cam kết thực hiện đầy đủ các nội dung trong nội quy này.</li>
            <li>Thời điểm nhận lớp được tính từ khi gia sư bắt đầu buổi dạy đầu tiên và xác nhận trạng thái trên hệ thống.</li>
            <li>Khi tạo tài khoản và gửi yêu cầu nhận lớp, gia sư được hiểu là đã đọc, hiểu và đồng ý với toàn bộ nội dung của trang này.</li>
          </ul>
        </section>

        <section className="class-rules-related">
          <div className="class-rules-related-header">
            <p>Chính sách và điều khoản</p>
            <h2>Các nội dung liên quan</h2>
          </div>
          <div className="class-rules-related-grid">
            {relatedPolicies.map((item) => (
              <article key={item} className="class-rules-related-card">
                <span>{item}</span>
              </article>
            ))}
          </div>
        </section>
      </Container>
    </div>
  );
}

export default ClassRulesPage;
