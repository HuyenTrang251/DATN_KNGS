import "../pages/home/HomePage/home.scss";
function SignUp(){
    return(
    <>
        <section className="sectionSignUp">
        <div className="containerSignUp d-flex justify-content-center align-items-center">
            <div className="card p-4" style={{ width: 800 }}>
            <h3 className="text-center mb-4" style={{color: '#ff8500'}}>ĐĂNG KÝ HỌC THỬ</h3>
            <form className="form-SignUp">
                <div className="mb-4">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Họ tên"
                    required=""
                />
                </div>
                <div className="mb-4">
                <input
                    type="email"
                    className="form-control"
                    placeholder="Email"
                    required=""
                />
                </div>
                <div className="mb-4">
                <input
                    type="text"
                    className="form-control"
                    placeholder="Số điện thoại"
                    required=""
                />
                </div>
                <div className="mb-4">
                <input
                    type="password"
                    className="form-control"
                    placeholder="Mật khẩu"
                    required=""
                />
                </div>
                <button className="btnDK w-100">Đăng ký học thử miễn phí</button>
            </form>
            
            </div>
        </div>
        </section>
    </>
    )
}
export default SignUp