import React from 'react'
import Hero from '../components/Hero'
import FeaturedSection from '../components/FeaturedSection'
import Banner from '../components/Banner'
import Testimonial from '../components/Testimonial'
import Newsletter from '../components/Newsletter'
import { useAppContext } from '../context/AppContext'

const Home = () => {
  const { isRenter, isClient, isDriver, user } = useAppContext()
  const showBanner = isClient || !user || (!isRenter && !isDriver)
  return (
    <>
      <Hero />
      <FeaturedSection />
      {showBanner && <Banner />}
      <Testimonial />
      <Newsletter />
    </>
  )
}

export default Home
