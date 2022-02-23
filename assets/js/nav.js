import throttle from 'lodash.throttle'

const navContainer = document.querySelector('[data-nav-container]')

let lastScrollPosition = window.scrollY

function handleScroll() {
  const newScrollPosition = window.scrollY

  if (newScrollPosition > lastScrollPosition) {
    navContainer.style.transform = `translateY(-100%)`
    navContainer.classList.add('!shadow-none')
  } else {
    navContainer.style.transform = `translateY(0%)`
    navContainer.classList.remove('!shadow-none')
  }

  lastScrollPosition = Math.max(newScrollPosition, 0)
}

window.addEventListener('scroll', throttle(handleScroll, 300), false)

const observer = new IntersectionObserver(
  function ([e]) {
    if (e.isIntersecting) {
      navContainer.classList.add('shadow', 'shadow-divider')
    } else {
      navContainer.classList.remove('shadow', 'shadow-divider')
    }
  },
  {
    root: document.querySelector('[data-scroll-container]'),
    rootMargin: `-${navContainer.clientHeight}px 0px 0px 0px`,
    threshold: 1
  }
)

observer.observe(navContainer)
