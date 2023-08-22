console.clear();

gsap.registerPlugin(ScrollTrigger);

const panels = gsap.utils.toArray(".panel");

gsap.set(panels, {
  yPercent: (i) => (i ? 100 : 0)
});

const tl = gsap.timeline({
  scrollTrigger: {
    trigger: ".sections",
    start: "top top",
    end: () => "+=" + 100 * panels.length + "%",
    pin: true,
    scrub: 1,
    markers: true
  }
});

panels.forEach((panel, index) => {
  if (index) {
    tl.to(
      panel,
      {
        yPercent: 0,
        ease: "none"
      },
      "+=0.25"
    );
  }
});