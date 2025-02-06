import { useEffect, useState } from 'react'
import { Transition } from '@headlessui/react'
import Link from 'next/link'
import MainActionButton from '@/components/button/MainActionButton'

const banners = [
  {
    id: 'bannerRebrand',
    title: 'VaultCraft V2 is here, Institutional DeFi',
    description: '',
    buttonText: 'Check it out',
    buttonLink: 'https://docs.vaultcraft.io/products/v2-safe-smart-vaults',
    imageSrc: 'images/background.png',
    tokenSrc: 'images/banner/bannerRebrand.png'
  },
  {
    id: 'bannerMigration',
    title: 'VCX migration to Base',
    description: 'Please migrate your VCX on Ethereum to Base by April 1, 2025, as per VIP-41',
    buttonText: 'Migrate now',
    buttonLink: '/migrate',
    imageSrc: 'images/banner/bannerMigration.png',
    tokenSrc: 'images/banner/migrationIcon.png'
  }
]

export default function Carousel() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length)
    }, 60000) // 10 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full mx-auto px-4 md:px-0">
      <div className="overflow-hidden relative h-48">
        {banners.map((banner, index) => (
          <Transition
            key={banner.id}
            show={index === currentIndex}
            enter="transition-opacity duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="transition-opacity duration-300"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            {index === 0 ?
              <div className="w-full h-48 relative rounded-xl border border-customNeutral100">
                <img src={banner.imageSrc} alt={banner.title} className="w-full h-full object-cover object-bottom-left opacity-70 rounded-xl" />
                <div className="absolute inset-0">
                  <div className='flex flex-row items-center justify-between'>
                    <div className="flex flex-col px-8 text-white">
                      <h2 className="text-white text-3xl mb-2 w-2/3 leading-tight mt-4">{banner.title}</h2>
                      <Link href={banner.buttonLink} passHref>
                        <div className="w-40">
                          <MainActionButton label={banner.buttonText} />
                        </div>
                      </Link>
                    </div>
                    <img src={banner.tokenSrc} alt={banner.title} className="hidden md:block w-72 h-full object-cover mt-8 mr-8" />
                  </div>
                </div>
              </div>
              : <div className="w-full h-48 relative rounded-xl border border-customNeutral100">
                <img src={banner.imageSrc} alt={banner.title} className="w-full h-48 object-cover object-bottom-left opacity-70 rounded-xl" />
                <div className="absolute inset-0">
                  <div className='flex flex-row items-center justify-between'>
                    <div className="flex flex-col px-8 text-white">
                      <h2 className="text-white text-2xl font-bold mb-2 mt-6">{banner.title}</h2>
                      <p className="text-white mb-4">{banner.description}</p>
                      <Link href={banner.buttonLink} passHref>
                        <div className="w-40">
                          <MainActionButton label={banner.buttonText} />
                        </div>
                      </Link>
                    </div>
                    <img src={banner.tokenSrc} alt={banner.title} className="hidden md:block w-72 h-full object-cover mt-8 mr-8" />
                  </div>
                </div>
              </div>
            }
          </Transition>
        ))}
      </div>

      {/* Indicator Dots */}
      <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {banners.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`h-2 w-2 rounded-full transition-colors duration-300 ${index === currentIndex ? 'bg-white' : 'bg-gray-400 hover:bg-gray-300'
              }`}
            aria-label={`Go to banner ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}