import { useEffect, useRef } from "react";

/** 磨砂玻璃镜片：进入文字时放大并改变镜片的折射感。 */
export function CursorAura() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    document.documentElement.classList.add("has-fine-pointer");
    let frame = 0;
    const move = (event: MouseEvent) => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        if (!ref.current) return;
        ref.current.style.left = `${event.clientX}px`;
        ref.current.style.top = `${event.clientY}px`;
        const target = event.target;
        ref.current.classList.toggle("is-lens", target instanceof Element && !!target.closest("[data-cursor-lens]"));
      });
    };
    window.addEventListener("mousemove", move, { passive: true });
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("mousemove", move);
      document.documentElement.classList.remove("has-fine-pointer");
    };
  }, []);

  return <div ref={ref} className="cursor-aura"><span aria-hidden="true" /></div>;
}
