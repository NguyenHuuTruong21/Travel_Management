import React from 'react';
import HeroSection from '../../components/user/home/HeroSection';
import QuickSearch from '../../components/user/home/QuickSearch';
import Categories from '../../components/user/home/Categories';
import FeaturedTours from '../../components/user/home/FeaturedTours';
import Promotions from '../../components/user/home/Promotions';
import Destinations from '../../components/user/home/Destinations';
import Services from '../../components/user/home/Services';
import Reviews from '../../components/user/home/Reviews';
import Blog from '../../components/user/home/Blog';
import DepartureLocations from '../../components/user/home/DepartureLocations';

const Home = () => {
    return (
        <div className="bg-white">
            <HeroSection />
            <QuickSearch />
            <Categories />
            <DepartureLocations />
            <FeaturedTours />
            <Promotions />
            <Destinations />
            <Services />
            <Reviews />
            <Blog />
        </div>
    );
};

export default Home;
