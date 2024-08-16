import { useEffect, useState } from 'react'
import { Transition } from '@headlessui/react'
import Link from 'next/link'
import MainActionButton from '@/components/button/MainActionButton'

const banners = [
  {
    id: 'Banner_D01_02',
    title: 'The VCX Smart Vault',
    description: 'Compound Aura & BAL rewards into VCX',
    buttonText: 'Deposit your VCX',
    buttonLink: 'vaults/0x99a53fAB6fBD1eacb59AE998dA2DbF130BE94C38?chainId=1',
    imageSrc: 'images/banner/banner1.png',
    tokenSrc: 'images/banner/bannerToken1.svg'
  },
  {
    id: 'Banner_D02_02',
    title: 'Boost your oVCX rewards',
    description: 'Lock your 80VCX 20WETH pool for max boost in oVCX and voting power',
    buttonText: 'Lock here',
    buttonLink: 'boost',
    imageSrc: 'images/banner/banner2.png',
    tokenSrc: 'images/banner/bannerToken2.svg'
  },
  {
    id: 'Banner_D03_02',
    title: "It's raining ARB rewards",
    description: 'The WETH & USDT Compound Smart Vaults are being incentivized with ARB on both OKX and VaultCraft',
    buttonText: 'Check it out',
    buttonLink: 'vaults',
    imageSrc: 'images/banner/banner3.png',
    tokenSrc: 'images/banner/bannerToken3.svg'
  }
]

export default function Carousel() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % banners.length)
    }, 10000) // 10 seconds

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="relative w-full mx-auto">
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
            <div className="w-full h-48 relative rounded-xl border border-customNeutral100">
              <img src={banner.imageSrc} alt={banner.title} className="w-full h-full object-cover object-bottom-left opacity-70 rounded-xl" />
              <div className="absolute inset-0">
                <div className='flex flex-row items-center justify-between'>
                  <div className="flex flex-col px-8 text-white">
                    <h2 className="text-white text-2xl font-bold mb-2">{banner.title}</h2>
                    <p className="text-white mb-4">{banner.description}</p>
                    <Link href={banner.buttonLink} passHref>
                      <div className="w-40">
                        <MainActionButton label={banner.buttonText} />
                      </div>
                    </Link>
                  </div>
                  <img src={banner.tokenSrc} alt={banner.title} className="hidden md:block w-72 h-full object-cover" />
                </div>
              </div>
            </div>
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