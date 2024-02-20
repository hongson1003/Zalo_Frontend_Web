import React from "react";
import Slider from "react-slick";
import './main.welcome.scss';

// Import css files
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";

const informations = [
    {

    }
]


const Welcome = () => {
    var settings = {
        dots: true,
        infinite: true,
        speed: 500,
        slidesToShow: 1,
        slidesToScroll: 3,
        arrows: true,
        autoplay: true,
        autoplaySpeed: 3000
    };
    return (
        <div className="welcome-carousel">
            <div className="main">
                <p className="title">
                    Chào mừng đến với &nbsp;
                    <span className="zalopc">Zalo PC
                    </span>
                </p>
                <p className="cover">
                    Khám phá những tiện ích hỗ trợ làm việc và trò chuyện cùng người thân, bạn bè được tối ưu hoá cho máy tính của bạn.
                </p>
                <Slider {...settings}>
                    <p>Hi 1</p>
                    <p>Hi 2</p>
                    <p>Hi 3</p>
                    <p>Hi 4</p>
                </Slider>
            </div>

        </div>
    )
}

export default Welcome;