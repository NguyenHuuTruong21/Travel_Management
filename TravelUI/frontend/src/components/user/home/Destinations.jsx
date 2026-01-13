import React from 'react';
import { Link } from 'react-router-dom';

const destinations = [
    {
        id: 1,
        name: 'Đà Nẵng',
        image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=800&q=80',
        tours: 15
    },
    {
        id: 2,
        name: 'Hội An',
        image: 'https://tse1.mm.bing.net/th/id/OIP.lgRxsqbaJUzGdOsdnzr-7QHaEK?rs=1&pid=ImgDetMain&o=7&rm=3',
        tours: 12
    },
    {
        id: 3,
        name: 'Phú Quốc',
        image: 'https://tse3.mm.bing.net/th/id/OIP.W3oiI4GNaVDsFLXsp6umiQHaFj?rs=1&pid=ImgDetMain&o=7&rm=3',
        tours: 20
    },
    {
        id: 4,
        name: 'Sapa',
        image: 'https://photo-cms-plo.epicdn.me/w1200/Uploaded/2023/lcemdurlq/2022_10_20/sapa-1724.jpg',
        tours: 8
    },
    {
        id: 5,
        name: 'Hà Nội',
        image: 'https://img.thuthuattinhoc.vn/uploads/2019/04/10/hinh-anh-ho-hoan-kiem-ha-noi_112845221.jpg',
    }
];

const Destinations = () => {
    return (
        <div className="py-16 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h2 className="text-3xl font-bold text-gray-900 mb-4">Điểm đến yêu thích</h2>
                    <p className="text-gray-600">Khám phá những địa điểm du lịch nổi tiếng nhất Việt Nam</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 h-[500px]">
                    {/* Large item */}
                    <Link to={`/tours`} className="md:col-span-2 md:row-span-2 relative rounded-2xl overflow-hidden group cursor-pointer">
                        <img
                            src={destinations[0].image}
                            alt={destinations[0].name}
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                        <div className="absolute bottom-6 left-6 text-white">
                            <h3 className="text-2xl font-bold mb-1">{destinations[0].name}</h3>
                            <p className="text-gray-200">{destinations[0].tours} tours</p>
                        </div>
                    </Link>

                    {/* Smaller items */}
                    {destinations.slice(1).map((dest) => (
                        <Link key={dest.id} to={`/tours?location=${dest.name}`} className="relative rounded-2xl overflow-hidden group cursor-pointer">
                            <img
                                src={dest.image}
                                alt={dest.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                            <div className="absolute bottom-4 left-4 text-white">
                                <h3 className="text-lg font-bold mb-1">{dest.name}</h3>
                                <p className="text-sm text-gray-200">{dest.tours} tours</p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default Destinations;
