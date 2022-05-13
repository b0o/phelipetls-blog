const nav = document.querySelector('[data-nav-container]')

const navActiveLink = nav.querySelector('nav a.active')

if (navActiveLink) {
  navActiveLink.scrollIntoView({
    behavior: 'auto',
    block: 'center',
  })
}

const navClasses = ['shadow-md', 'dark:shadow-divider']

if (window.scrollY > nav.offsetHeight) {
  nav.classList.add(...navClasses)
}

let lastScrollPosition = window.scrollY

function setNavPosition() {
  const newScrollPosition = window.scrollY
  const isScrollingDown = newScrollPosition > lastScrollPosition

  if (isScrollingDown) {
    nav.style.transform = `translateY(-100%)`
    nav.classList.remove(...navClasses)
  } else {
    nav.style.transform = `translateY(0)`

    for (const className of navClasses) {
      nav.classList.toggle(className, window.scrollY > nav.offsetHeight)
    }
  }

  lastScrollPosition = Math.max(newScrollPosition, 0)
}

let timeout

function handleScroll() {
  if (timeout) {
    window.cancelAnimationFrame(timeout)
  }

  timeout = window.requestAnimationFrame(function () {
    setNavPosition()
  })
}

window.addEventListener('scroll', handleScroll, false)
