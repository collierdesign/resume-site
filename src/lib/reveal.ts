/**
 * 滚动入场动画：在元素进入视口时添加 .is-visible 类
 * 用于 CSS 中的 .reveal -> .reveal.is-visible 过渡
 */
export function initReveal() {
  const elements = document.querySelectorAll('.reveal')
  if (!elements.length) return

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          observer.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.1, rootMargin: '0px 0px -80px 0px' },
  )

  elements.forEach((el) => observer.observe(el))
}