import "../pages/home/HomePage/home.scss";

function CommentTutor(){
    return(
        <>
        <section className="section2">
        <div className="container mb-5">
            <h2 className="text-center mb-5">Đánh giá từ khách hàng</h2>
            <div className="row">
            <div className="commen col-md-5 me-5">
                <div className="row">
                    <div className="col-sm-3">
                        <img
                        src="/image/dg1.jpg"
                        className="img-dg"
                        alt=""
                        />
                    </div>
                    <div className="col-sm-9">
                        <h4>Lê Minh Anh</h4>
                        <p>Học sinh THPT Nguyễn Siêu</p>
                        <div className="star">
                            {[...Array(5)].map((_, i) => (
                                <i
                                key={i}
                                className={`fa-star ${i < 4 ? 'fa-solid' : 'fa-regular'} ${i === 4 ? 'mystar' : ''}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
                <div className="row pe-5"> 
                    <p className="pe-3">
                    "Gia sư dạy rất tận tâm, dễ hiểu, em thấy thích thú với việc học hơn khi được học cùng gia sư HTrang"
                    </p>
                </div>
            </div>
            
            <div className="commen col-md-5 ms-5">
                <div className="row">
                    <div className="col-sm-3">
                        <img
                        src="/image/dg2.jpg"
                        className="img-dg"
                        alt=""
                        />
                    </div>
                    <div className="col-sm-9">
                        <h4>Trần Hoàng Nam</h4>
                        <p>Phụ huynh em Trần Thị Hà - THCS Ba Vì-HN</p>
                        <div className="star">
                            {[...Array(5)].map((_, i) => (
                                <i
                                key={i}
                                className={`fa-star ${i < 4 ? 'fa-solid' : 'fa-regular'} ${i === 4 ? 'mystar' : ''}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
                <div className="row"> 
                    <p>
                    "Tôi rất hài lòng với cách làm việc chỉnh chu, nhiệt tình của gia sư HTrang, nhờ website này tôi đã tìm được gia sư chất lượng cho bé nhà tôi, kết quả học tập cải thiện rõ và con chủ động tự giác học tập hơn."
                    </p>
                </div>
            </div>
            </div>
        </div>
        </section>
        </>
    )
}
export default CommentTutor