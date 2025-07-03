import * as React from "react"
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline"
import { cn } from "@/lib/utils"

const CarouselContext = React.createContext<{
  currentIndex: number
  setCurrentIndex: (index: number) => void
  itemsLength: number
} | null>(null)

const Carousel = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & {
    children: React.ReactNode
  }
>(({ className, children, ...props }, ref) => {
  const [currentIndex, setCurrentIndex] = React.useState(0)
  const [itemsLength, setItemsLength] = React.useState(0)

  React.useEffect(() => {
    const items = React.Children.toArray(children).filter(
      (child) => React.isValidElement(child) && child.type === CarouselItem
    )
    setItemsLength(items.length)
  }, [children])

  return (
    <CarouselContext.Provider value={{ currentIndex, setCurrentIndex, itemsLength }}>
      <div ref={ref} className={cn("relative", className)} {...props}>
        {children}
      </div>
    </CarouselContext.Provider>
  )
})
Carousel.displayName = "Carousel"

const CarouselContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  const context = React.useContext(CarouselContext)
  if (!context) {
    throw new Error("CarouselContent must be used within a Carousel")
  }

  return (
    <div
      ref={ref}
      className={cn("overflow-hidden", className)}
      {...props}
    >
      <div
        className="flex transition-transform duration-300 ease-in-out"
        style={{
          transform: `translateX(-${context.currentIndex * 100}%)`,
        }}
      >
        {props.children}
      </div>
    </div>
  )
})
CarouselContent.displayName = "CarouselContent"

const CarouselItem = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn("min-w-0 shrink-0 grow-0 basis-full", className)}
      {...props}
    />
  )
})
CarouselItem.displayName = "CarouselItem"

const CarouselPrevious = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  const context = React.useContext(CarouselContext)
  if (!context) {
    throw new Error("CarouselPrevious must be used within a Carousel")
  }

  const handlePrevious = () => {
    context.setCurrentIndex(
      context.currentIndex === 0 ? context.itemsLength - 1 : context.currentIndex - 1
    )
  }

  return (
    <button
      ref={ref}
      className={cn(
        "absolute left-4 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm hover:bg-white transition-colors disabled:opacity-50",
        className
      )}
      onClick={handlePrevious}
      {...props}
    >
      <ChevronLeftIcon className="h-4 w-4" />
      <span className="sr-only">Previous slide</span>
    </button>
  )
})
CarouselPrevious.displayName = "CarouselPrevious"

const CarouselNext = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => {
  const context = React.useContext(CarouselContext)
  if (!context) {
    throw new Error("CarouselNext must be used within a Carousel")
  }

  const handleNext = () => {
    context.setCurrentIndex(
      context.currentIndex === context.itemsLength - 1 ? 0 : context.currentIndex + 1
    )
  }

  return (
    <button
      ref={ref}
      className={cn(
        "absolute right-4 top-1/2 -translate-y-1/2 z-10 flex h-8 w-8 items-center justify-center rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 shadow-sm hover:bg-white transition-colors disabled:opacity-50",
        className
      )}
      onClick={handleNext}
      {...props}
    >
      <ChevronRightIcon className="h-4 w-4" />
      <span className="sr-only">Next slide</span>
    </button>
  )
})
CarouselNext.displayName = "CarouselNext"

export {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
}
