import React from 'react';
import Slider from 'react-slick';
import './main.welcome.scss';

// Import css files
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';

//Informations for welcome pages
const pages = [
  {
    img: '/images/welcome1.PNG',
    title:
      'Sử dụng tin nhắn nhanh để lưu trữ sẵn các tin nhắn thường dùng và gửi nhanh trong hội thoại bất kì',
  },
  {
    img: '/images/welcome2.PNG',
    title:
      'Bây giờ tin nhắn đã có thể tự động xóa sau khoảng thời gian nhất định',
  },
  {
    img: '/images/welcome3.PNG',
    title: 'Nội dung tin nhắn được mã hóa trong suốt quá trình gửi và nhận',
  },
  {
    img: '/images/welcome4.PNG',
    title: 'Trao đổi công việc mọi lúc mọi nơi',
  },
  {
    img: '/images/welcome5.PNG',
    title:
      'Giờ đây bạn có thể dễ dàng xuất dữ liệu và nhập dữ liệu của mình khi đổi máy tính mới',
  },
  {
    img: '/images/welcome6.PNG',
    title:
      'Kết nối và giải quyết công việc trên mọi thiết bị với dữ liệu luôn được đồng bộ',
  },
  {
    img: '/images/welcome7.PNG',
    title: 'Đã có Zalo PC xử hết',
  },
  {
    img: '/images/welcome8.PNG',
    title: 'Tiện lợi hơn, nhờ các công cụ chat trên máy tính',
  },
  {
    img: '/images/welcome9.PNG',
    title: 'Với PC Zalo',
  },
];
//Render welcome page
const Page = ({ imgLink, title }) => {
  return (
    <div className="page_wrapper">
      <img src={imgLink} className="page_img" />
      <p className="page_title">{title}</p>
    </div>
  );
};
const Welcome = () => {
  var settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    arrows: true,
    autoplay: true,
    autoplaySpeed: 1500,
  };
  return (
    <div className="welcome-carousel">
      <div className="main">
        <p className="title">
          Chào mừng đến với &nbsp;
          <span className="zalopc">Zalo PC</span>
        </p>
        <p className="cover">
          Khám phá những tiện ích hỗ trợ làm việc và trò chuyện cùng người thân,
          bạn bè được tối ưu hoá cho máy tính của bạn.
        </p>
        <Slider {...settings}>
          {pages.map((page, index) => (
            <Page key={index} imgLink={page.img} title={page.title} />
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default Welcome;
