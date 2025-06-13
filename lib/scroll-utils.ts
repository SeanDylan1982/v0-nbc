export function scrollToElement(elementId: string): void {
  // Wait for next tick to ensure DOM is ready
  setTimeout(() => {
    const element = document.getElementById(elementId)
    if (element) {
      element.scrollIntoView({ behavior: "smooth" })
    }
  }, 100)
}
