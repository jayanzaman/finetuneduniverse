import * as React from 'react'
import * as SliderPrimitive from '@radix-ui/react-slider'

const Slider = React.forwardRef<
  React.ElementRef<typeof SliderPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root>
>(({ className, ...props }, ref) => (
  <SliderPrimitive.Root
    ref={ref}
    className={`relative flex w-full touch-none select-none items-center py-2 ${className}`}
    {...props}
  >
    <SliderPrimitive.Track className="relative h-4 sm:h-3 w-full grow overflow-hidden rounded-full bg-[var(--void-3)] border border-[var(--hair-2)]">
      <SliderPrimitive.Range className="absolute h-full bg-gradient-to-r from-[var(--indigo-2)] to-[var(--indigo)] shadow-[0_0_12px_var(--indigo-glow)]" />
    </SliderPrimitive.Track>
    <SliderPrimitive.Thumb className="block h-8 w-8 sm:h-6 sm:w-6 rounded-full border-2 border-white bg-gradient-to-br from-[var(--indigo)] to-[var(--indigo-2)] shadow-lg transition-all duration-200 hover:scale-110 hover:shadow-[0_0_16px_var(--indigo-glow)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--goldilocks)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--void)] disabled:pointer-events-none disabled:opacity-50 cursor-grab active:cursor-grabbing touch-manipulation" />
  </SliderPrimitive.Root>
))
Slider.displayName = SliderPrimitive.Root.displayName

export { Slider }
